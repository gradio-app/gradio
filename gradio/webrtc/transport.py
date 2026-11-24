"""WebRTC as a transport of Gradio streaming: `transport=` of an event listener
(`.stream()` of gr.Image / gr.Audio / gr.Video, or any event whose outputs show
live media) and of `gr.Server.api()`.

The function keeps Gradio's contract: one value per input, one value per output
(`gr.skip()` leaves an output as it is). The media input's slot holds no value
and the page sends the media over a peer connection; the stream id travels in
the event data. The other inputs come over the connection's data channel.
Imports without the `webrtc` extra; aiortc is imported once a stream is added.
"""

from __future__ import annotations

import asyncio
import contextvars
import copy
import inspect
import queue
import threading
from collections.abc import AsyncGenerator, AsyncIterator, Callable
from contextlib import aclosing
from typing import TYPE_CHECKING, Any, Literal, cast

import numpy as np

from gradio import utils
from gradio.context import LocalContext, get_blocks_context
from gradio.helpers import skip
from gradio.streaming.handlers import (
    AsyncAudioVideoStreamHandler,
    AsyncStreamHandler,
    AsyncVideoStreamHandler,
    AudioVideoStreamHandler,
    StreamHandler,
    StreamHandlerBase,
    VideoStreamHandler,
)
from gradio.webrtc.endpoint import add_stream_event, check_turn, check_video_bitrate
from gradio.webrtc.handlers import VideoOptions
from gradio.webrtc.options import AudioChunk, VideoFrame, WebRTCOptions
from gradio.webrtc.utils import SKIPPED_FRAME, is_async, is_skip

if TYPE_CHECKING:
    from gradio.block_function import BlockFunction

Modality = Literal["video", "audio", "audio-video"]
Mode = Literal["send-receive", "receive", "send"]


def to_options(transport: Any) -> WebRTCOptions:
    if transport == "webrtc":
        return WebRTCOptions()
    if isinstance(transport, WebRTCOptions):
        return transport
    raise ValueError(
        f'transport= takes "webrtc" or a gr.WebRTCOptions, got {transport!r}.'
    )


def _mode(media_in: int | None, media_out: int | None) -> Mode:
    if media_in is not None and media_out is not None:
        return "send-receive"
    if media_in is not None:
        return "send"
    if media_out is not None:
        return "receive"
    raise ValueError(
        "A WebRTC stream needs a media component (gr.Image, gr.Audio or "
        "gr.Video) among its inputs or outputs."
    )


def _is_a(fn: Any, classes: tuple[type, ...]) -> bool:
    return (inspect.isclass(fn) and issubclass(fn, classes)) or isinstance(fn, classes)


def _check_fn(fn: Any, mode: str, modality: Modality) -> None:
    av = _is_a(fn, (AudioVideoStreamHandler, AsyncAudioVideoStreamHandler))
    handler = _is_a(fn, (StreamHandlerBase,))
    if modality == "audio-video" and not av:
        raise ValueError(
            "An audio and video stream takes an AudioVideoStreamHandler or "
            "AsyncAudioVideoStreamHandler subclass."
        )
    if mode == "receive":
        if handler:
            raise ValueError(
                "A stream that only sends media to the page takes a generator "
                "function that yields it; handler classes take media from the page."
            )
        if not inspect.isgeneratorfunction(fn):
            raise ValueError(
                "A stream that only sends media to the page takes a generator "
                "function (def ... yield) that yields one value per output."
            )
    if mode != "receive" and not handler and utils.is_generator_function(fn):
        # One generator per stream, sent each frame (or chunk of audio)
        utils.check_stream_generator(fn)
    if (
        handler
        and modality == "audio"
        and not _is_a(fn, (StreamHandler, AsyncStreamHandler))
    ):
        raise ValueError(
            "An audio stream takes a function or a StreamHandler / "
            "AsyncStreamHandler subclass."
        )
    if (
        handler
        and modality == "video"
        and not _is_a(fn, (VideoStreamHandler, AsyncVideoStreamHandler))
    ):
        raise ValueError(
            "A video stream takes a function or a VideoStreamHandler / "
            "AsyncVideoStreamHandler subclass."
        )
    if av and mode != "send-receive":
        raise ValueError(
            "An AudioVideoStreamHandler needs its component among both the "
            "inputs and the outputs."
        )
    if _is_a(
        fn, (AsyncStreamHandler, AsyncVideoStreamHandler, AsyncAudioVideoStreamHandler)
    ) and not inspect.iscoroutinefunction(fn.start_up):
        raise ValueError(
            f"{getattr(fn, '__name__', type(fn).__name__)}.start_up must be a "
            "coroutine (async def) in an async handler."
        )
    if isinstance(fn, StreamHandlerBase) and type(fn).copy is StreamHandlerBase.copy:
        raise ValueError(
            f"{type(fn).__name__} does not implement copy(), which is needed to "
            "create a handler per connection. Pass the class itself instead of "
            "an instance, or implement copy()."
        )


def blocks_stream(
    block: Any,
    fn: Callable,
    inputs: list,
    outputs: list,
    *,
    transport: Any,
    trigger: Any,
    time_limit: float | None,
    stream_every: float | None,
    on_time_limit: Literal["rejoin", "stop"] = "rejoin",
    concurrency_limit: int | None | Literal["default"],
    concurrency_id: str | None,
    show_progress: Any,
    trigger_mode: Literal["once", "multiple", "always_last"] | None,
    show_progress_on: Any = None,
    scroll_to_output: bool = False,
    key: Any = None,
    api_name: str | None = None,
    api_description: str | None | Literal[False] = None,
    api_visibility: Literal["public", "private", "undocumented"] = "public",
) -> tuple[BlockFunction, int]:
    """
    The event of an event listener called with `transport=`. The media
    component is the listener's own component (`.stream()` of a gr.Image,
    gr.Audio or gr.Video), or else the media output (e.g. a button's click that
    starts a stream the page only receives). Its type gives the kind of media;
    where it appears among the inputs and outputs gives the direction. The API
    settings apply when clients can also call it once (see `_callable_once`);
    otherwise only the page can call it.
    """
    from gradio_components.audio import Audio
    from gradio_components.image import Image
    from gradio_components.video import Video

    from gradio.events import EventListenerMethod

    def kind(c: Any) -> str | None:
        if isinstance(c, Audio):
            return "audio"
        if isinstance(c, Image | Video):
            return "video"
        return None

    options = to_options(transport)
    media = block if kind(block) is not None else None
    if media is None:
        media = next((c for c in outputs if kind(c) is not None), None)
    if media is None:
        raise ValueError(
            "A stream with transport= needs a gr.Image, gr.Audio or gr.Video "
            "as the component it listens to, or among its outputs."
        )
    modality = cast(Modality, kind(media))
    # gr.Video carries audio and video together when the function takes both;
    # its include_audio defaults to True whenever "upload" is a source, so it
    # cannot decide this. The camera then records the microphone too.
    if isinstance(media, Video) and _is_a(
        fn, (AudioVideoStreamHandler, AsyncAudioVideoStreamHandler)
    ):
        modality = "audio-video"
        media.include_audio = True
    media_in = inputs.index(media) if media in inputs else None
    media_type = getattr(media, "type", "numpy")
    if media_in is not None and media_type != "numpy":
        # Frames and audio chunks are decoded straight to arrays: converting
        # each one to PIL or to a file would not keep up with the stream
        raise ValueError(
            "A stream with transport= gives the function its media as numpy "
            f'arrays, so the {type(media).__name__} it streams needs type="numpy" '
            f"(it has type={media_type!r})."
        )
    # The components that can show the media: the same rule picks a separate
    # output below and checks the one given as media_output
    family = "video" if modality == "audio-video" else modality

    def shows_media(c: Any) -> bool:
        return kind(c) == family and (modality != "audio-video" or isinstance(c, Video))

    if options.media_output is not None:
        if options.media_output not in outputs:
            raise ValueError("WebRTCOptions.media_output must be one of the outputs.")
        if not shows_media(options.media_output):
            needed = {
                "audio": "a gr.Audio",
                "video": "a gr.Image or gr.Video",
                "audio-video": "a gr.Video",
            }[modality]
            raise ValueError(
                f"WebRTCOptions.media_output shows the stream's {modality}, so it "
                f"must be {needed}."
            )
        media_out: int | None = outputs.index(options.media_output)
    elif media in outputs:
        media_out = outputs.index(media)
    else:
        # A separate output shows the media only when exactly one could
        candidates = [i for i, c in enumerate(outputs) if shows_media(c)]
        if len(candidates) > 1:
            raise ValueError(
                "Several outputs could show the stream's media. Pick one with "
                "gr.WebRTCOptions(media_output=...)."
            )
        media_out = candidates[0] if candidates else None
    stream_fn, index = transport_event(
        [trigger or EventListenerMethod(block, "stream")],
        fn,
        inputs,
        outputs,
        media_in=media_in,
        media_out=media_out,
        modality=modality,
        options=options,
        time_limit=time_limit,
        on_time_limit=on_time_limit,
        stream_every=stream_every,
        concurrency_limit=concurrency_limit,
        concurrency_id=concurrency_id,
        show_progress=show_progress,
        show_progress_on=show_progress_on,
        scroll_to_output=scroll_to_output,
        key=key,
        preprocessed_inputs=[c for c in inputs if c is not media],
        preprocess=False,
        # A gr.Video's file is a whole video, not one frame
        once=not isinstance(media, Video),
        api_name=api_name,
        api_description=api_description,
        api_visibility=api_visibility,
        # .stream()'s Record / Stop restarts need "multiple"; a button that
        # starts a stream ignores clicks while it runs, like any click
        trigger_mode=trigger_mode or ("multiple" if media is block else "once"),
    )
    media.stream_transport = "webrtc"
    return stream_fn, index


def _return_types(fn: Callable) -> list:
    """The types of a stream function's outputs, from its return hint: one per
    output, for a function or what a generator yields (`Iterator[...]`), with
    `| None` (nothing to send this time) left out."""
    import collections.abc
    import types
    import typing

    hint = utils.get_type_hints(fn).get("return", inspect.Signature.empty)
    origin = typing.get_origin(hint)
    if origin in (typing.Union, types.UnionType):
        members = [a for a in typing.get_args(hint) if a is not type(None)]
        hint = members[0] if len(members) == 1 else hint
        origin = typing.get_origin(hint)
    if origin in (
        collections.abc.Generator,
        collections.abc.Iterator,
        collections.abc.Iterable,
        collections.abc.AsyncGenerator,
        collections.abc.AsyncIterator,
    ):
        hint = (
            typing.get_args(hint)[0]
            if typing.get_args(hint)
            else inspect.Signature.empty
        )
        origin = typing.get_origin(hint)
    if hint in (inspect.Signature.empty, None, type(None)):
        return []
    if origin is tuple:
        return list(typing.get_args(hint))
    return [hint]


def api_stream(
    fn: Callable,
    *,
    transport: Any,
    api_name: str | None,
    api_description: str | None | Literal[False] = None,
    time_limit: float | None,
    stream_every: float | None,
    on_time_limit: Literal["rejoin", "stop"] = "rejoin",
    concurrency_limit: int | None | Literal["default"],
    concurrency_id: str | None,
) -> tuple[BlockFunction, int]:
    """
    The endpoint of `gr.Server.api(transport=...)`. The `gr.VideoFrame` or
    `gr.AudioChunk` type hint marks the media among the parameters (sent by
    the client) and the return values (sent back).
    """
    from gradio_client.utils import python_type_to_json_schema

    from gradio.components.api_component import Api
    from gradio.streaming.reply_on_pause import ReplyOnPause

    audio_video = _is_a(fn, (AudioVideoStreamHandler, AsyncAudioVideoStreamHandler))
    pack_sent = None
    # What the endpoint is named after and its hints are read from
    hinted = fn.fn if isinstance(fn, ReplyOnPause) else fn
    if isinstance(fn, ReplyOnPause):
        # Its generator function takes the audio, then the other inputs
        params = utils.get_function_params(fn.fn)
        returns = _return_types(fn.fn)
    elif _is_a(fn, (StreamHandlerBase,)):
        # A handler class: the media is the parameter of receive() /
        # video_receive(), the outputs what emit() / video_emit() return
        cls = cast(Any, fn if inspect.isclass(fn) else type(fn))
        receive = getattr(cls, "video_receive", None) or cls.receive
        emit = getattr(cls, "emit", None) or cls.video_emit
        if audio_video:
            # Audio and video together: the audio methods' hints place the
            # media, which carries both
            receive, emit = cls.receive, cls.emit
        params = [p for p in utils.get_function_params(receive) if p[0] != "self"]
        returns = _return_types(emit)
    elif (sent := _sent_inputs(fn)) is not None:
        # A generator sent the inputs' values: they are named and typed by
        # what it is sent, `Generator[outputs, inputs, None]`
        names, hints, pack_sent = sent
        params = [
            (name, False, None, hint) for name, hint in zip(names, hints, strict=True)
        ]
        returns = _return_types(fn)
    else:
        params = utils.get_function_params(fn)
        returns = _return_types(fn)
    # Optional too, as special_args takes `gr.Request | None`: returning None
    # sends the frame back as it came
    markers = {
        VideoFrame: "video",
        AudioChunk: "audio",
        VideoFrame | None: "video",
        AudioChunk | None: "audio",
    }
    media_in = next((i for i, p in enumerate(params) if p[3] in markers), None)
    media_out = next((i for i, t in enumerate(returns) if t in markers), None)
    kinds = {markers[params[media_in][3]]} if media_in is not None else set()
    if media_out is not None:
        kinds.add(markers[returns[media_out]])
    if len(kinds) != 1:
        raise ValueError(
            "A WebRTC endpoint marks its media with one type hint, gr.VideoFrame "
            "or gr.AudioChunk, among its parameters and/or return values."
        )
    modality = cast(Modality, "audio-video" if audio_video else kinds.pop())
    if isinstance(fn, ReplyOnPause) and (modality != "audio" or media_in != 0):
        raise ValueError(
            "The function of ReplyOnPause takes the audio (gr.AudioChunk) as its "
            "first parameter."
        )
    live = f"live {modality} over WebRTC (a MediaStream in @gradio/client)"
    if _callable_once(fn, modality):
        # Other clients call it once with a file (see transport_event)
        from gradio.data_classes import FileData

        unit = "an image, as one frame" if modality == "video" else "an audio file"
        media_schema = {
            **python_type_to_json_schema(FileData),
            "description": f"{unit}; or {live}",
        }
    else:
        media_schema = {"type": "object", "description": live}
    inputs = [
        Api(
            None,
            media_schema if i == media_in else python_type_to_json_schema(hint),
            name,
        )
        for i, (name, _, _, hint) in enumerate(params)
    ]
    outputs = [
        Api(
            None,
            media_schema if i == media_out else python_type_to_json_schema(hint),
            f"output {i}",
        )
        for i, hint in enumerate(returns)
    ]
    stream_fn, index = transport_event(
        [],
        fn,
        inputs,
        outputs,
        media_in=media_in,
        media_out=media_out,
        modality=modality,
        options=to_options(transport),
        time_limit=time_limit,
        on_time_limit=on_time_limit,
        stream_every=stream_every,
        concurrency_limit=concurrency_limit,
        concurrency_id=concurrency_id,
        show_progress="hidden",
        preprocess=False,
        postprocess=False,
        api_name=api_name or getattr(hinted, "__name__", None),
        api_description=api_description,
        # Documented so that clients can call it with named arguments; it is
        # left out of the MCP tools, which could not send media
        api_visibility="public",
        trigger_mode="once",
        pack_sent=pack_sent,
    )
    stream_fn.input_parameter_names = [p[0] for p in params]
    return stream_fn, index


def _sent_inputs(
    fn: Callable,
) -> tuple[list[str], list, Callable | None] | None:
    """The names and types of the inputs that a generator function is sent,
    from S in its return hint `Generator[Y, S, R]` or `AsyncGenerator[Y, S]`,
    and what packs their values. A NamedTuple names them by its fields and is
    what the generator is sent; a `tuple[...]` (inputs input_0, input_1, ...)
    or a single type (input) leaves the values as they are. None for a
    function that is not sent values (no hint, or S is None)."""
    import collections.abc
    import typing

    if not utils.is_generator_function(fn):
        return None
    hint = utils.get_type_hints(fn).get("return")
    if typing.get_origin(hint) not in (
        collections.abc.Generator,
        collections.abc.AsyncGenerator,
    ):
        return None
    args = typing.get_args(hint)
    sent = args[1] if len(args) > 1 else None
    if sent in (None, type(None)):
        return None
    if inspect.isclass(sent) and issubclass(sent, tuple) and hasattr(sent, "_fields"):
        fields = list(sent._fields)
        try:
            hints = typing.get_type_hints(sent)
        except Exception:
            hints = getattr(sent, "__annotations__", {})
        return fields, [hints.get(f, Any) for f in fields], sent
    if typing.get_origin(sent) is tuple:
        types = list(typing.get_args(sent))
        return [f"input_{i}" for i in range(len(types))], types, None
    return ["input"], [sent], None


def _receive_extras(cls: type) -> dict[str, int]:
    """
    For a handler class: how many of the stream's other inputs each of its
    receive() / video_receive() takes, as parameters after the media. They are
    called with the latest values (the defaults until the page has sent them),
    so these parameters need defaults.
    """
    extras: dict[str, int] = {}
    for name in ("receive", "video_receive"):
        method = getattr(cls, name, None)
        if method is None or getattr(method, "__isabstractmethod__", False):
            continue
        params = [
            p
            for p in list(inspect.signature(method).parameters.values())[2:]
            if p.kind in (p.POSITIONAL_ONLY, p.POSITIONAL_OR_KEYWORD)
        ]
        missing = [p.name for p in params if p.default is p.empty]
        if missing:
            raise ValueError(
                f"{cls.__name__}.{name}() needs defaults for {', '.join(missing)}: "
                "it is called with them before the page has sent their values."
            )
        if params:
            extras[name] = len(params)
    return extras


class _Carried:
    """The value of a gr.State that a plain function's stream takes and
    returns, which the stream keeps: each call gets what the previous call
    returned for it (see `transport_event`)."""

    __slots__ = ("output", "value")

    def __init__(self, value: Any, output: int) -> None:
        self.value = value
        # The State's position among the outputs
        self.output = output


def _packed(values: list[Any], pack: Callable | None) -> Any:
    """What a generator is sent: a NamedTuple of the values (gr.Server, see
    `_sent_inputs`), else the value itself for one input, a tuple for
    several."""
    if pack is not None:
        return pack(*values)
    return values[0] if len(values) == 1 else tuple(values)


def _unboxed(args: list[Any] | tuple[Any, ...]) -> list[Any]:
    return [a.value if isinstance(a, _Carried) else a for a in args]


def _copied(value: Any) -> Any:
    """A deep copy, as gr.State values allow, or the value if it has none."""
    try:
        return copy.deepcopy(value)
    except Exception:
        return value


def _callable_once(fn: Any, modality: Modality) -> bool:
    """Whether a client without the page's media (the Python client, curl,
    MCP) can call the stream once: when what it sends maps to one call of the
    function, an image as one frame or an audio file as one chunk, or the
    inputs of a generator that only sends media. A handler class has no single
    call, and audio with video comes as a gr.Video, whose file is a whole
    video rather than a frame."""
    return modality != "audio-video" and not _is_a(fn, (StreamHandlerBase,))


def _media_from_file(value: Any, modality: Modality) -> Any:
    """What a stream's function gets for one frame or chunk, from the file a
    client sent instead: an RGB array, or (sample_rate, array) as the numpy
    value of gr.Audio, with the whole file as one chunk."""
    from gradio import processing_utils
    from gradio.exceptions import Error

    path = value.get("path") if isinstance(value, dict) else value
    if not path:
        raise ValueError("No file in the media's slot.")
    try:
        if modality == "audio":
            return processing_utils.audio_from_file(str(path))
        from PIL import Image as PILImage

        with PILImage.open(str(path)) as image:
            return np.asarray(image.convert("RGB"))
    except Exception as err:
        # The decoders' own errors do not say what was wrong with the file
        name = value.get("orig_name") if isinstance(value, dict) else None
        expected = "an audio file" if modality == "audio" else "an image"
        raise Error(
            f"This endpoint takes {expected}, but {name or 'the file'} could "
            "not be read as one.",
            print_exception=False,
        ) from err


def _media_to_file(value: Any, modality: Modality) -> Any:
    """A gr.Server endpoint's media output as a file for the client that
    called it once (a Blocks component postprocesses its own)."""
    from gradio import processing_utils
    from gradio.data_classes import FileData
    from gradio.utils import get_upload_folder

    if value is None or is_skip(value):
        return value
    if modality == "audio":
        rate, data = value
        path = processing_utils.save_audio_to_cache(
            np.asarray(data), int(rate), format="wav", cache_dir=get_upload_folder()
        )
    else:
        path = processing_utils.save_img_array_to_cache(
            np.asarray(value), cache_dir=get_upload_folder(), format="png"
        )
    return FileData(path=path).model_dump()


async def _in_context(context: contextvars.Context, awaitable: Any) -> Any:
    """Awaits `awaitable` with the variables of `context` set."""
    for var, value in context.items():
        var.set(value)
    return await awaitable


def _chunked_audio_handler(
    fn: Callable,
    media_in: int,
    seconds: float,
    write_back: Callable[[list[Any], Any], None] | None = None,
    pack_sent: Callable | None = None,
) -> type[StreamHandler]:
    """
    A handler class for a plain audio function, which gets at least `seconds`
    of audio per call, like an HTTP audio stream's `stream_every` chunks. The
    function runs in a thread of its own; audio that arrives meanwhile goes into
    the next call, so a function slower than real time gets longer chunks
    instead of falling further behind. `write_back` is given each call's
    arguments and result (it keeps the gr.State values the stream carries).
    A generator function gets one generator per stream, sent each chunk
    (packed with `pack_sent` if given, see `transport_event`).
    """
    from gradio import routes
    from gradio.streaming.utils import (
        CloseStream,
        bind_special_args,
        first_step_done,
    )

    sends = utils.is_generator_function(fn)

    class ChunkedAudio(StreamHandler):
        def __init__(self) -> None:
            super().__init__(input_sample_rate=48000, output_sample_rate=24000)
            self.buffer: list[np.ndarray] = []
            self.samples = 0
            self.busy = False
            self.lock = threading.Lock()
            self.results: queue.Queue = queue.Queue()
            self.call: Callable = fn
            # Created on the first chunk, by when start_up() has bound the
            # special parameters it is called with
            self.generator = (
                utils.StreamGenerator(
                    lambda: self.call(), is_async=inspect.isasyncgenfunction(fn)
                )
                if sends
                else None
            )

        def start_up(self, request: Any = None) -> None:
            # The gr.Request / OAuth parameters of fn, for this connection
            self.call = bind_special_args(fn, request)

        def shutdown(self) -> None:
            generator = self.generator
            if generator is None:
                return
            if generator.is_async:
                asyncio.run_coroutine_threadsafe(generator.aclose(), self.loop).result()
            else:
                generator.close_sync()

        def receive(self, frame: tuple[int, np.ndarray]) -> None:
            rate, array = frame
            with self.lock:
                self.buffer.append(array)
                self.samples += len(array)
                if self.busy or self.samples < rate * seconds:
                    return
                chunk = np.concatenate(self.buffer)
                self.buffer, self.samples = [], 0
                self.busy = True
            # The context carries gr.Info / gr.Warning to this stream's page
            context = contextvars.copy_context()
            threading.Thread(
                target=context.run, args=(self._run, rate, chunk), daemon=True
            ).start()

        def _run(self, rate: int, chunk: np.ndarray) -> None:
            try:
                self.wait_for_args_sync()
                args = list(self.latest_args)
                args.insert(media_in, (rate, chunk))
                if self.generator is not None:
                    self.results.put(self._step(_unboxed(args)))
                    first_step_done()
                    return
                result = self.call(*_unboxed(args))
                if inspect.isawaitable(result):
                    # On the loop, as async video functions run, with this
                    # thread's context (gr.Info and the like reach the page)
                    result = asyncio.run_coroutine_threadsafe(
                        _in_context(contextvars.copy_context(), result), self.loop
                    ).result()
                first_step_done()
                if write_back is not None:
                    write_back(args, result)
                self.results.put(result)
            except BaseException as e:  # raised from emit(), which reports it
                self.results.put(e)
            finally:
                with self.lock:
                    self.busy = False

        def _step(self, values: list[Any]) -> Any:
            generator = cast(utils.StreamGenerator, self.generator)
            value = _packed(values, pack_sent)
            if generator.is_async:
                result = asyncio.run_coroutine_threadsafe(
                    _in_context(contextvars.copy_context(), generator.step(value)),
                    self.loop,
                ).result()
            else:
                result = generator.step_sync(value)
            return CloseStream() if result is utils.StreamGenerator.ENDED else result

        def emit(self) -> Any:
            try:
                result = self.results.get_nowait()
            except queue.Empty:
                return None
            if isinstance(result, BaseException):
                raise result
            return result

        def copy(self) -> ChunkedAudio:
            return ChunkedAudio()

        # Its time limit starts with its first call, not with start_up()
        starts_its_time_limit = True

    # Resolved here: this module's annotations are strings
    ChunkedAudio.start_up.__annotations__ = {"request": routes.Request, "return": None}
    return ChunkedAudio


def transport_event(
    triggers: list,
    fn: Callable,
    inputs: list,
    outputs: list,
    *,
    media_in: int | None,
    media_out: int | None,
    modality: Modality,
    options: WebRTCOptions,
    time_limit: float | None,
    stream_every: float | None,
    concurrency_limit: int | None | Literal["default"],
    concurrency_id: str | None,
    show_progress: Any,
    on_time_limit: Literal["rejoin", "stop"] = "rejoin",
    preprocessed_inputs: list | None = None,
    pack_sent: Callable | None = None,
    once: bool = True,
    **kwargs: Any,
) -> tuple[BlockFunction, int]:
    """
    Adds the queue event of a WebRTC stream (see `endpoint.add_stream_event`)
    whose function takes one value per input and returns one value per output.
    The values of `preprocessed_inputs` (the components besides the media,
    which the page sends over the data channel) are preprocessed as an event's
    inputs are, with the stream's session state. Unless `once` is False, a
    client without the page's media can also call it once with a file, when
    the function allows it (see `_callable_once`).
    """
    from gradio import routes
    from gradio.events import EventData
    from gradio.exceptions import Error
    from gradio.streaming.utils import (
        AdditionalOutputs,
        CloseStream,
        first_step_done,
    )
    from gradio.webrtc import connection

    root_block = get_blocks_context()
    if root_block is None:
        raise AttributeError("Cannot add a WebRTC stream outside of a Blocks.")
    mode = _mode(media_in, media_out)
    _check_fn(fn, mode, modality)
    check_turn(options.rtc_configuration, "transport=")
    check_video_bitrate(options.video_bitrate)
    output_every = options.output_every
    if output_every is not None and (
        isinstance(output_every, bool)
        or not isinstance(output_every, int | float)
        or output_every < 0
    ):
        raise ValueError(
            f"WebRTCOptions.output_every must be None or seconds >= 0, got {output_every!r}"
        )
    is_handler_class = _is_a(fn, (StreamHandlerBase,))
    # A generator in the send modes is one per stream, sent each frame or chunk
    sends_to_generator = (
        not is_handler_class and mode != "receive" and utils.is_generator_function(fn)
    )
    other_out = [i for i in range(len(outputs)) if i != media_out]
    callable_once = once and _callable_once(fn, modality)
    if not callable_once and preprocessed_inputs is not None:
        # Only the page can call a Blocks stream then (a gr.Server endpoint
        # stays public: its page calls it by name)
        kwargs["api_visibility"] = "private"

    # A gr.State input gets its value as it is when the stream's turn comes,
    # from the event's own inputs: the page holds the State, and what it sends
    # over the data channel does not carry it. One that a plain function also
    # returns is kept by the stream, so that each call gets what the previous
    # call returned for it, as each chunk of an HTTP stream does. A handler
    # class or a generator keeps its own state, and a receive-mode generator
    # gets its inputs once. Each entry: the position among the event's inputs,
    # among the extra inputs, and among the outputs (None if not kept).
    from gradio.components import State

    def position(blocks: list, block: Any) -> int | None:
        return next((i for i, b in enumerate(blocks) if b is block), None)

    keeps_state = not is_handler_class and mode != "receive" and not sends_to_generator
    carried_states: list[tuple[int, int, int | None]] = []
    for j, block in enumerate(preprocessed_inputs or []):
        k = position(inputs, block)
        if isinstance(block, State) and k is not None:
            out = position(outputs, block) if keeps_state else None
            carried_states.append((k, j, out))
    repeats_frames = (
        modality == "video" and mode == "send-receive" and not is_handler_class
    )

    def to_stream_output(result: Any) -> Any:
        """One value per output, into what the stream's tracks take: the media,
        and the other outputs as AdditionalOutputs."""
        if result is None or isinstance(result, CloseStream | AdditionalOutputs):
            return result
        values = (
            list(result)
            if len(outputs) > 1 and isinstance(result, tuple | list)
            else [result]
        )
        if len(values) != len(outputs):
            hint = (
                " A gr.Server endpoint gets its outputs from its return type "
                "hint, e.g. -> gr.VideoFrame."
                if not outputs
                else ""
            )
            raise ValueError(
                f"The stream function returned {len(values)} values for "
                f"{len(outputs)} outputs.{hint}"
            )
        media = values[media_out] if media_out is not None else None
        if is_skip(media):
            # A frame function's track repeats its last frame; elsewhere
            # nothing new is sent
            media = SKIPPED_FRAME if repeats_frames else None
        rest = [values[i] for i in other_out]
        if not rest or all(is_skip(v) for v in rest):
            return media
        if media_out is None or media is None:
            return AdditionalOutputs(*rest)
        return media, AdditionalOutputs(*rest)

    def write_back(args: list[Any] | tuple[Any, ...], result: Any) -> None:
        """Keeps what a call returned for the gr.State values it was given."""
        boxes = [a for a in args if isinstance(a, _Carried)]
        if (
            not boxes
            or result is None
            or isinstance(result, CloseStream | AdditionalOutputs)
        ):
            return
        values = (
            list(result)
            if len(outputs) > 1 and isinstance(result, tuple | list)
            else [result]
        )
        if len(values) != len(outputs):
            return  # to_stream_output reports it
        for box in boxes:
            if not is_skip(values[box.output]):
                # A copy: the value also goes to the page, while the next
                # call may change the one it gets in place
                box.value = _copied(values[box.output])

    receive_extras = (
        _receive_extras(fn if inspect.isclass(fn) else type(fn))
        if is_handler_class
        else {}
    )

    def adapt(instance: Any) -> None:
        # receive() / video_receive() get the other inputs they declare
        for name, count in receive_extras.items():
            method = getattr(instance, name)

            def latest(_count: int = count) -> list:
                return list(instance.latest_args)[:_count]

            if inspect.iscoroutinefunction(method):

                async def receive_async(frame, _m=method, _latest=latest):
                    return await _m(frame, *_latest())

                setattr(instance, name, receive_async)
            else:
                setattr(
                    instance,
                    name,
                    lambda frame, _m=method, _latest=latest: _m(frame, *_latest()),
                )
        # A handler's emit() / video_emit() return one value per output too
        for name in ("emit", "video_emit"):
            method = getattr(instance, name, None)
            if method is None:
                continue
            if inspect.iscoroutinefunction(method):

                async def emit_async(_m=method):
                    return to_stream_output(await _m())

                setattr(instance, name, emit_async)
            else:
                setattr(instance, name, lambda _m=method: to_stream_output(_m()))

    # The tracks call a function with the media first, then the other inputs.
    # The wrapper takes fn's own parameters in that order (gr.Request and the
    # other special ones included, which bind_special_args fills per
    # connection) and calls fn with them in fn's order.
    params = (
        []
        if is_handler_class or sends_to_generator
        else list(inspect.signature(fn).parameters.values())
    )
    if params and media_in is not None and modality == "video":
        media_name = [p[0] for p in utils.get_function_params(fn)][media_in]
        ordered = [p for p in params if p.name == media_name] + [
            p for p in params if p.name != media_name
        ]
    else:
        ordered = params

    var_args = [p for p in params if p.kind is p.VAR_POSITIONAL]
    fixed = [p for p in ordered if p.kind not in (p.VAR_POSITIONAL, p.VAR_KEYWORD)]

    def in_fn_order(args: list[Any] | tuple[Any, ...]) -> list:
        by_name = dict(zip((p.name for p in fixed), args, strict=False))
        named = [by_name[p.name] for p in params if p.name in by_name]
        return named + list(args[len(fixed) :]) if var_args else named

    # stream_every is the shortest interval between calls (for a receive-mode
    # generator, between frames); unset, every frame of the camera
    fps = 30 if not stream_every else 1 / stream_every

    def generator_frames(request: Any) -> tuple[Callable, Callable]:
        """A video generator's frame function for one stream, which sends each
        frame (with the other inputs' values) to the stream's own generator,
        and the coroutine function that closes that generator."""
        from gradio.streaming.utils import bind_special_args
        from gradio.webrtc.tracks import run_in_thread

        bound = bind_special_args(fn, request)
        generator = utils.StreamGenerator(
            lambda: bound(),
            is_async=inspect.isasyncgenfunction(fn),
            run_in_thread=run_in_thread,
        )

        def sent(frame: Any, args: tuple) -> Any:
            values = _unboxed(args)
            values.insert(cast(int, media_in), frame)
            return _packed(values, pack_sent)

        def output(result: Any) -> Any:
            if result is utils.StreamGenerator.ENDED:
                return CloseStream()
            return to_stream_output(result)

        if generator.is_async:

            async def step_async(frame: Any, *args: Any) -> Any:
                result = output(await generator.step(sent(frame, args)))
                first_step_done()
                return result

            return step_async, generator.aclose

        def step(frame: Any, *args: Any) -> Any:
            # The track runs it in a worker thread
            result = output(generator.step_sync(sent(frame, args)))
            first_step_done()
            return result

        return step, generator.aclose

    handler: Any
    if is_handler_class:
        handler = fn
    elif mode == "receive":

        def generate(*args: Any) -> Any:
            for item in fn(*in_fn_order(args)):
                first_step_done()
                yield to_stream_output(item)

        handler = generate
    elif modality == "audio":
        handler = _chunked_audio_handler(
            fn, cast(int, media_in), stream_every or 0.5, write_back, pack_sent
        )
        is_handler_class = True
    elif sends_to_generator:
        handler = VideoOptions(
            callable=fn,
            fps=fps,
            skip_frames=options.skip_frames,
            per_stream=generator_frames,
        )
    elif is_async(fn):

        async def call_async(*args: Any) -> Any:
            result = await fn(*in_fn_order(_unboxed(args)))
            first_step_done()
            write_back(args, result)
            return to_stream_output(result)

        handler = call_async
    else:

        def call(*args: Any) -> Any:
            result = fn(*in_fn_order(_unboxed(args)))
            first_step_done()
            write_back(args, result)
            return to_stream_output(result)

        handler = call

    if not is_handler_class and not sends_to_generator:
        wrapper = cast(Any, handler)
        wrapper.__signature__ = inspect.Signature(
            [p.replace(kind=p.POSITIONAL_ONLY, default=p.empty) for p in fixed]
            + var_args
        )
        wrapper.__annotations__ = utils.get_type_hints(fn)
        if modality == "video":
            handler = VideoOptions(
                callable=wrapper, fps=fps, skip_frames=options.skip_frames
            )

    # The event's own function reads only the stream id, so the queue does not
    # preprocess; the values that arrive later get the same preprocessing here
    # through a copy of the event that takes only those inputs
    inputs_fn: dict[str, BlockFunction] = {}

    def launched() -> Any:
        # A page rendered into another app (gr.TabbedInterface, render()) has
        # a Blocks of its own; the launched one holds the sessions' state and
        # the thread limiter
        return LocalContext.blocks.get(None) or root_block.root_block

    async def prepare_inputs(
        values: list[Any], session_hash: str | None, blocks: Any = None
    ) -> list[Any]:
        blocks = blocks or launched()
        state = blocks.state_holder[session_hash] if session_hash else None
        return await blocks.preprocess_data(inputs_fn["fn"], list(values), state)

    manager = connection.ConnectionManager(
        handler=cast(Any, handler),
        mode=mode,
        modality=modality,
        time_limit=time_limit,
        on_time_limit=on_time_limit,
        allow_extra_tracks=options.allow_extra_tracks,
        server_rtc_configuration=options.server_rtc_configuration,
        video_bitrate=options.video_bitrate,
        rtc_configuration=options.rtc_configuration,
        output_every=output_every,
        adapt_handler=adapt if is_handler_class else None,
        prepare_inputs=prepare_inputs if preprocessed_inputs else None,
    )

    async def args_once(request: Any, values: list[Any], media: Any) -> list[Any]:
        """The function's arguments for a call without the page: the other
        inputs prepared as an event's are, and `media` in its slot."""
        others = (
            [v for k, v in enumerate(values) if k != media_in]
            if media_in is not None
            else list(values)
        )
        args = (
            list(await prepare_inputs(others, getattr(request, "session_hash", None)))
            if preprocessed_inputs
            else others
        )
        # gr.State values as the event's own inputs hold them
        for k, j, _ in carried_states:
            if k < len(values):
                args[j] = values[k]
        if media_in is not None:
            args.insert(media_in, media)
        return args

    def values_once(result: Any) -> list[Any]:
        """One value per output from what the function returned."""
        if result is None or isinstance(result, CloseStream):
            # Nothing to show: the outputs stay as they are
            return [skip()] * len(outputs)
        out = (
            list(result)
            if len(outputs) > 1 and isinstance(result, tuple | list)
            else [result]
        )
        if len(out) != len(outputs):
            raise ValueError(
                f"The stream function returned {len(out)} values for "
                f"{len(outputs)} outputs."
            )
        return out

    def outputs_once(out: list[Any]) -> Any:
        """The values as an event returns them."""
        if preprocessed_inputs is None and media_out is not None:
            # A gr.Server endpoint has no component to postprocess its media
            out[media_out] = _media_to_file(out[media_out], modality)
        return out[0] if len(out) == 1 else tuple(out)

    async def call_once(request: Any, values: list[Any]) -> AsyncGenerator[Any, None]:
        """A call without the page, as an ordinary event (the queue runs it as
        one, see `Event.called_once`). A stream that takes media runs its
        function once on the file in the media's slot; a stream that only
        sends media runs its generator, whose outputs come as a generator
        event's do."""
        import anyio

        from gradio.helpers import special_args

        if mode == "receive":
            args, *_ = special_args(fn, await args_once(request, values, None), request)
            items: Any = (
                fn(*args)
                if inspect.isasyncgenfunction(fn)
                else utils.SyncToAsyncIterator(
                    fn(*args), limiter=launched().limiter
                )
            )
            # Audio comes chunk by chunk; the last output is all of it, as
            # the page would have played it
            chunks: list[tuple[int, Any]] = []
            last: list[Any] = [skip()] * len(outputs)
            try:
                async for item in items:
                    out = values_once(item)
                    last = [
                        prev if is_skip(v) else v
                        for prev, v in zip(last, out, strict=True)
                    ]
                    if modality == "audio" and media_out is not None:
                        chunk = out[media_out]
                        if chunk is not None and not is_skip(chunk):
                            chunks.append(chunk)
                    yield outputs_once(out)
            finally:
                await items.aclose()
            if len(chunks) > 1:
                # The other outputs as the last items left them
                whole = list(last)
                rate = int(chunks[0][0])
                whole[cast(int, media_out)] = (
                    rate,
                    np.concatenate([np.asarray(data) for _, data in chunks]),
                )
                yield outputs_once(whole)
            return
        index = cast(int, media_in)
        if index >= len(values) or not values[index]:
            unit = "an image" if modality == "video" else "an audio file"
            raise Error(
                f"Call this endpoint with {unit} in the media's slot to run "
                "its function once, or from the JavaScript client "
                "(@gradio/client) with a MediaStream to stream."
            )
        media = await anyio.to_thread.run_sync(
            _media_from_file, values[index], modality
        )
        args = await args_once(request, values, media)
        if sends_to_generator:
            # Created, sent this one value and closed, as a stream's would be
            from gradio.streaming.utils import bind_special_args

            bound = bind_special_args(fn, request)
            generator = utils.StreamGenerator(
                lambda: bound(), is_async=inspect.isasyncgenfunction(fn)
            )
            try:
                result = await generator.step(_packed(args, pack_sent))
            finally:
                await generator.aclose()
            if result is utils.StreamGenerator.ENDED:
                result = None
        else:
            args, *_ = special_args(fn, args, request)
            if is_async(fn):
                result = await fn(*args)
            else:
                result = await anyio.to_thread.run_sync(
                    lambda: fn(*args), limiter=launched().limiter
                )
        yield outputs_once(values_once(result))

    async def run_stream(evt: Any, request: Any, *_inputs: Any) -> AsyncIterator[Any]:
        data = getattr(evt, "_data", None)
        webrtc_id = data.get("webrtc_id") if isinstance(data, dict) else None
        if not isinstance(webrtc_id, str) or not webrtc_id:
            # Called without a connection, e.g. from the Python client or curl
            if not callable_once:
                raise Error(
                    "This endpoint streams media over WebRTC. Call it from the "
                    "JavaScript client (@gradio/client) with a MediaStream."
                )
            async with aclosing(call_once(request, list(_inputs))) as results:
                async for result in results:
                    yield result
            return
        # The event's own inputs hold the gr.State values as they are when
        # the turn comes
        carried = {
            j: _copied(_inputs[k])
            if out is None
            else _Carried(_copied(_inputs[k]), out)
            for k, j, out in carried_states
            if k < len(_inputs)
        }
        # The queue's close has to reach stream_run's finally now, not at GC
        async with aclosing(
            connection.stream_run(manager, webrtc_id, carried)
        ) as steps:
            async for step in steps:
                values: list[Any] = [skip()] * len(outputs)
                if step is not None:
                    for i, value in zip(other_out, step.args, strict=True):
                        values[i] = value
                yield values[0] if len(values) == 1 else tuple(values)

    # The stream id comes in the event data (gr.EventData is filled in like a
    # gr.Request); the function is named after the app's own (API names, logs)
    run_stream.__annotations__["evt"] = EventData
    run_stream.__annotations__["request"] = routes.Request
    run_stream.__name__ = run_stream.__qualname__ = getattr(
        fn, "__name__", type(fn).__name__
    )
    stream_fn, index = add_stream_event(
        root_block,
        triggers,
        run_stream,
        inputs,
        outputs,
        time_limit=time_limit,
        on_time_limit=on_time_limit,
        concurrency_limit=concurrency_limit,
        concurrency_id=concurrency_id,
        show_progress=show_progress,
        **kwargs,
    )
    if preprocessed_inputs:
        inputs_fn["fn"] = copy.copy(stream_fn)
        inputs_fn["fn"].inputs = list(preprocessed_inputs)
        inputs_fn["fn"].component_prop_inputs = []
        inputs_fn["fn"].preprocess = True
    stream_fn.callable_once = callable_once
    stream_fn.transport = {
        "type": "webrtc",
        "modality": modality,
        "mode": mode,
        "media_input": media_in,
        "media_output": media_out,
    }
    if options.rtp_params:
        # Applied by the browser to the tracks it sends
        stream_fn.transport["rtp_params"] = options.rtp_params
    return stream_fn, index
