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

import contextvars
import copy
import inspect
import queue
import threading
from collections.abc import AsyncIterator, Callable
from contextlib import aclosing
from typing import TYPE_CHECKING, Any, Literal, cast

import numpy as np

from gradio import utils
from gradio.context import get_blocks_context
from gradio.helpers import skip
from gradio.webrtc.endpoint import add_stream_event, check_turn, check_video_bitrate
from gradio.webrtc.handlers import (
    AsyncAudioVideoStreamHandler,
    AsyncStreamHandler,
    AsyncVideoStreamHandler,
    AudioVideoStreamHandler,
    StreamHandler,
    StreamHandlerBase,
    VideoOptions,
    VideoStreamHandler,
)
from gradio.webrtc.options import AudioChunk, VideoFrame, WebRTCOptions
from gradio.webrtc.utils import is_async

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
    concurrency_limit: int | None | Literal["default"],
    concurrency_id: str | None,
    show_progress: Any,
    trigger_mode: Literal["once", "multiple", "always_last"] | None,
) -> tuple[BlockFunction, int]:
    """
    The event of an event listener called with `transport=`. The media
    component is the listener's own component (`.stream()` of a gr.Image,
    gr.Audio or gr.Video), or else the media output (e.g. a button's click that
    starts a stream the page only receives). Its type gives the kind of media;
    where it appears among the inputs and outputs gives the direction.
    """
    from gradio.components.audio import Audio
    from gradio.components.image import Image
    from gradio.components.video import Video
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
    if options.media_output is not None:
        if options.media_output not in outputs:
            raise ValueError("WebRTCOptions.media_output must be one of the outputs.")
        media_out: int | None = outputs.index(options.media_output)
    elif media in outputs:
        media_out = outputs.index(media)
    else:
        # A separate output shows the media only when exactly one could
        family = "video" if modality == "audio-video" else modality
        candidates = [
            i
            for i, c in enumerate(outputs)
            if kind(c) == family and (modality != "audio-video" or isinstance(c, Video))
        ]
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
        stream_every=stream_every,
        concurrency_limit=concurrency_limit,
        concurrency_id=concurrency_id,
        show_progress=show_progress,
        preprocessed_inputs=[c for c in inputs if c is not media],
        preprocess=False,
        # Only the page can call it: it needs the page's media
        api_visibility="private",
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

    if _is_a(fn, (StreamHandlerBase,)):
        # A handler class: the media is the parameter of receive() /
        # video_receive(), the outputs what emit() / video_emit() return
        cls = fn if inspect.isclass(fn) else type(fn)
        receive = getattr(cls, "video_receive", None) or cls.receive
        emit = getattr(cls, "emit", None) or cls.video_emit
        if _is_a(fn, (AudioVideoStreamHandler, AsyncAudioVideoStreamHandler)):
            receive, emit = cls.receive, cls.emit
        params = [p for p in utils.get_function_params(receive) if p[0] != "self"]
        returns = _return_types(emit)
    else:
        params = utils.get_function_params(fn)
        returns = _return_types(fn)
    markers = {VideoFrame: "video", AudioChunk: "audio"}
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
    modality = cast(Modality, kinds.pop())
    media_schema = {
        "type": "object",
        "description": f"live {modality} over WebRTC (a MediaStream in @gradio/client)",
    }
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
        stream_every=stream_every,
        concurrency_limit=concurrency_limit,
        concurrency_id=concurrency_id,
        show_progress="hidden",
        preprocess=False,
        postprocess=False,
        api_name=api_name or getattr(fn, "__name__", None),
        api_description=api_description,
        # Documented so that clients can call it with named arguments; it is
        # left out of the MCP tools, which could not send media
        api_visibility="public",
        trigger_mode="once",
    )
    stream_fn.input_parameter_names = [p[0] for p in params]
    return stream_fn, index


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


def _chunked_audio_handler(
    fn: Callable, media_in: int, seconds: float
) -> type[StreamHandler]:
    """
    A handler class for a plain audio function, which gets at least `seconds`
    of audio per call, like an HTTP audio stream's `stream_every` chunks. The
    function runs in a thread of its own; audio that arrives meanwhile goes into
    the next call, so a function slower than real time gets longer chunks
    instead of falling further behind.
    """
    from gradio import routes
    from gradio.webrtc.utils import bind_special_args

    class ChunkedAudio(StreamHandler):
        def __init__(self) -> None:
            super().__init__(input_sample_rate=48000, output_sample_rate=24000)
            self.buffer: list[np.ndarray] = []
            self.samples = 0
            self.busy = False
            self.lock = threading.Lock()
            self.results: queue.Queue = queue.Queue()
            self.call: Callable = fn

        def start_up(self, request: Any = None) -> None:
            # The gr.Request / OAuth parameters of fn, for this connection
            self.call = bind_special_args(fn, request)

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
                self.results.put(self.call(*args))
            except BaseException as e:  # raised from emit(), which reports it
                self.results.put(e)
            finally:
                with self.lock:
                    self.busy = False

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
    preprocessed_inputs: list | None = None,
    **kwargs: Any,
) -> tuple[BlockFunction, int]:
    """
    Adds the queue event of a WebRTC stream (see `endpoint.add_stream_event`)
    whose function takes one value per input and returns one value per output.
    The values of `preprocessed_inputs` (the components besides the media,
    which the page sends over the data channel) are preprocessed as an event's
    inputs are, with the stream's session state.
    """
    from gradio.events import EventData
    from gradio.exceptions import Error
    from gradio.webrtc import connection
    from gradio.webrtc.utils import AdditionalOutputs, CloseStream

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
    other_out = [i for i in range(len(outputs)) if i != media_out]

    def is_skip(value: Any) -> bool:
        return isinstance(value, dict) and value == skip()

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
            raise ValueError(
                f"The stream function returned {len(values)} values for "
                f"{len(outputs)} outputs."
            )
        media = values[media_out] if media_out is not None else None
        if is_skip(media):
            media = None
        rest = [values[i] for i in other_out]
        if not rest or all(is_skip(v) for v in rest):
            return media
        if media_out is None or media is None:
            return AdditionalOutputs(*rest)
        return media, AdditionalOutputs(*rest)

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
    params = [] if is_handler_class else list(inspect.signature(fn).parameters.values())
    if params and media_in is not None and modality == "video":
        media_name = [p[0] for p in utils.get_function_params(fn)][media_in]
        ordered = [p for p in params if p.name == media_name] + [
            p for p in params if p.name != media_name
        ]
    else:
        ordered = params

    var_args = [p for p in params if p.kind is p.VAR_POSITIONAL]
    fixed = [p for p in ordered if p.kind not in (p.VAR_POSITIONAL, p.VAR_KEYWORD)]

    def in_fn_order(args: tuple) -> list:
        by_name = dict(zip((p.name for p in fixed), args, strict=False))
        named = [by_name[p.name] for p in params if p.name in by_name]
        return named + list(args[len(fixed) :]) if var_args else named

    handler: Any
    if is_handler_class:
        handler = fn
    elif mode == "receive":

        def generate(*args: Any) -> Any:
            for item in fn(*in_fn_order(args)):
                yield to_stream_output(item)

        handler = generate
    elif modality == "audio":
        handler = _chunked_audio_handler(fn, cast(int, media_in), stream_every or 0.5)
        is_handler_class = True
    elif is_async(fn):

        async def call_async(*args: Any) -> Any:
            return to_stream_output(await fn(*in_fn_order(args)))

        handler = call_async
    else:

        def call(*args: Any) -> Any:
            return to_stream_output(fn(*in_fn_order(args)))

        handler = call

    if not is_handler_class:
        wrapper = cast(Any, handler)
        wrapper.__signature__ = inspect.Signature(
            [p.replace(kind=p.POSITIONAL_ONLY, default=p.empty) for p in fixed]
            + var_args
        )
        wrapper.__annotations__ = utils.get_type_hints(fn)
        if modality == "video":
            # stream_every is the shortest interval between calls (for a
            # generator, between frames); unset, every frame of the camera
            fps = 30 if not stream_every else max(1, round(1 / stream_every))
            handler = VideoOptions(
                callable=wrapper, fps=fps, skip_frames=options.skip_frames
            )

    # The event's own function reads only the stream id, so the queue does not
    # preprocess; the values that arrive later get the same preprocessing here
    # through a copy of the event that takes only those inputs
    inputs_fn: dict[str, BlockFunction] = {}

    async def prepare_inputs(values: list[Any], session_hash: str | None) -> list[Any]:
        blocks = root_block.root_block
        state = blocks.state_holder[session_hash] if session_hash else None
        return await blocks.preprocess_data(inputs_fn["fn"], list(values), state)

    manager = connection.ConnectionManager(
        handler=cast(Any, handler),
        mode=mode,
        modality=modality,
        time_limit=time_limit,
        allow_extra_tracks=options.allow_extra_tracks,
        server_rtc_configuration=options.server_rtc_configuration,
        video_bitrate=options.video_bitrate,
        rtc_configuration=options.rtc_configuration,
        output_every=output_every,
        inputs_over_channel=True,
        adapt_handler=adapt if is_handler_class else None,
        prepare_inputs=prepare_inputs if preprocessed_inputs else None,
    )

    async def run_stream(evt: Any, *_inputs: Any) -> AsyncIterator[Any]:
        data = getattr(evt, "_data", None)
        webrtc_id = data.get("webrtc_id") if isinstance(data, dict) else None
        if not isinstance(webrtc_id, str) or not webrtc_id:
            # Called without a connection, e.g. from the Python client or curl
            raise Error(
                "This endpoint streams media over WebRTC. Call it from the "
                "JavaScript client (@gradio/client) with a MediaStream."
            )
        # The queue's close has to reach stream_run's finally now, not at GC
        async with aclosing(connection.stream_run(manager, webrtc_id)) as steps:
            async for step in steps:
                values: list[Any] = [skip()] * len(outputs)
                if step is not None:
                    for i, value in zip(other_out, step.args, strict=True):
                        values[i] = value
                yield values[0] if len(values) == 1 else tuple(values)

    # The stream id comes in the event data (gr.EventData is filled in like a
    # gr.Request); the function is named after the app's own (API names, logs)
    run_stream.__annotations__["evt"] = EventData
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
