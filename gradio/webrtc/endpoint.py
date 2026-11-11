"""What `gr.WebRTC.stream()` and `gr.Server.webrtc()` share: checking a stream's
settings, and adding the queue event that runs each stream. Imports without the
`webrtc` extra; aiortc is imported once a stream event is added.
"""

from __future__ import annotations

import inspect
from collections.abc import AsyncIterator, Callable
from contextlib import aclosing
from typing import TYPE_CHECKING, Any, Literal

from gradio import utils
from gradio.context import get_blocks_context
from gradio.helpers import skip
from gradio.webrtc.handlers import (
    AsyncAudioVideoStreamHandler,
    AsyncStreamHandler,
    AsyncVideoStreamHandler,
    AudioVideoStreamHandler,
    HandlerType,
    StreamHandler,
    StreamHandlerBase,
    VideoOptions,
    VideoStreamHandler,
)
from gradio.webrtc.utils import (
    is_async,
    is_async_generator,
)

if TYPE_CHECKING:
    from gradio.block_function import BlockFunction
    from gradio.blocks import BlocksConfig


def check_video_bitrate(video_bitrate: dict[str, int] | None) -> None:
    if video_bitrate is None:
        return
    keys = ("min", "start", "max")
    unknown = set(video_bitrate) - set(keys)
    if unknown:
        raise ValueError(f"video_bitrate takes the keys {keys}, got {sorted(unknown)}")
    for key, kbps in video_bitrate.items():
        if not isinstance(kbps, int) or isinstance(kbps, bool) or kbps <= 0:
            raise ValueError(
                f"video_bitrate[{key!r}] must be a positive int (kbps), got {kbps!r}"
            )
    given = [video_bitrate[key] for key in keys if key in video_bitrate]
    if given != sorted(given):
        raise ValueError(
            f'video_bitrate must have "min" <= "start" <= "max", got {video_bitrate}'
        )


def check_mode(mode: str, modality: str) -> None:
    if mode not in ("send-receive", "receive", "send"):
        raise ValueError(
            f'mode must be "send-receive", "send" or "receive", got {mode!r}'
        )
    if modality not in ("video", "audio", "audio-video"):
        raise ValueError(
            f'modality must be "video", "audio" or "audio-video", got {modality!r}'
        )
    if modality == "audio-video" and mode != "send-receive":
        raise ValueError(
            'modality="audio-video" is only supported with mode="send-receive".'
        )


def check_turn(rtc_configuration: Any, what: str) -> None:
    if is_async_generator(rtc_configuration):
        raise ValueError(
            f"The rtc_configuration function of {what} must return a dict, "
            "not yield one."
        )
    if (utils.get_space() or utils.colab_check()) and rtc_configuration is None:
        raise ValueError(
            f"{what} needs a TURN server on Hugging Face Spaces or Google "
            "Colab: the browser often cannot reach the app directly, and then "
            "the media has to be relayed. Pass `rtc_configuration=` with your "
            "ICE servers, or a function that returns them. Hugging Face "
            "accounts get a free monthly "
            "TURN quota through Cloudflare; on a public Space, issue the "
            "credentials with each visitor's own account (gr.OAuthToken) so "
            "that visitors do not use up yours. See the 'Deploying to Hugging "
            "Face Spaces' section of the WebRTC guide: "
            "https://www.gradio.app/guides/object-detection-from-webcam-with-webrtc"
        )


def check_handler(fn: HandlerType, mode: str, modality: str) -> None:
    def is_a(classes: tuple[type, ...]) -> bool:
        return (inspect.isclass(fn) and issubclass(fn, classes)) or isinstance(
            fn, classes
        )

    is_handler = is_a((StreamHandlerBase,))
    is_audio_handler = is_a((StreamHandler, AsyncStreamHandler))
    is_av_handler = is_a((AudioVideoStreamHandler, AsyncAudioVideoStreamHandler))
    is_video_handler = is_a((VideoStreamHandler, AsyncVideoStreamHandler))

    if modality == "audio-video":
        if not is_av_handler:
            raise ValueError(
                'For modality="audio-video", `fn` must be an '
                "AudioVideoStreamHandler or AsyncAudioVideoStreamHandler "
                "subclass or instance."
            )
    elif modality == "audio" and mode in ("send", "send-receive"):
        if not is_audio_handler:
            raise ValueError(
                f'For modality="audio" in mode="{mode}", `fn` must be a '
                "StreamHandler or AsyncStreamHandler subclass or instance."
            )
    elif modality == "video" and is_video_handler:
        if mode == "receive":
            raise ValueError(
                "A VideoStreamHandler or AsyncVideoStreamHandler takes the "
                'video from the page, in mode="send" and "send-receive"; in '
                'mode="receive", pass a generator function (or a VideoOptions).'
            )
    elif is_handler and modality == "audio":
        raise ValueError(
            'For modality="audio" in mode="receive", `fn` must be a generator '
            "function that yields audio. Handler classes are for the modes "
            'that take media from the page, "send" and "send-receive".'
        )
    elif is_handler:
        raise ValueError(
            f'For modality="{modality}" in mode="{mode}", `fn` must '
            'be a function, a VideoOptions or, in mode="send" or "send-receive", a '
            "VideoStreamHandler or AsyncVideoStreamHandler subclass or "
            "instance."
        )
    elif isinstance(fn, VideoOptions) and modality != "video":
        raise ValueError(
            f'A VideoOptions is for modality="video"; for modality='
            f'"{modality}" in mode="{mode}", pass a function.'
        )
    elif not callable(fn) and not isinstance(fn, VideoOptions):
        raise ValueError("`fn` must be a callable or a VideoOptions.")
    elif not is_handler:
        function = fn.callable if isinstance(fn, VideoOptions) else fn
        if is_async(function):
            raise ValueError(
                "`fn` must be a regular function or generator, which runs in "
                "a worker thread; for async code, use an "
                'AsyncVideoStreamHandler (in mode="send" or "send-receive").'
            )

    if is_a((AsyncStreamHandler, AsyncVideoStreamHandler)) and not (
        inspect.iscoroutinefunction(fn.start_up)  # type: ignore[union-attr]  # is_a() narrowed fn to a handler
    ):
        raise ValueError(
            f"{getattr(fn, '__name__', type(fn).__name__)}.start_up must be a "
            "coroutine (async def) in an async handler."
        )
    if isinstance(fn, StreamHandlerBase) and type(fn).copy is StreamHandlerBase.copy:
        raise ValueError(
            f"{type(fn).__name__} does not implement copy(), which is needed "
            "to create a handler per connection. Pass the class itself to "
            "stream() instead of an instance, or implement copy()."
        )


def add_stream_event(
    root_block: BlocksConfig,
    triggers: list,
    fn: Callable,
    inputs: list,
    outputs: list,
    *,
    time_limit: float | None,
    concurrency_limit: int | None | Literal["default"],
    **kwargs: Any,
) -> tuple[BlockFunction, int]:
    """
    Adds the queue event that runs each stream: one event per stream, from the
    moment it is started until it ends. `fn` is the event's function, which
    holds the `ConnectionManager` of the streams. The event waits in
    line like any other. It is a lease (`BlockFunction.lease`): `fn` is a
    generator that admits the stream on its first step (see
    `connection.stream_run`) and delivers its AdditionalOutputs on the later
    ones, each time the stream wakes the event. A running stream that the page
    closes ends through its manager, so that the event still delivers every
    pending output.
    """
    from gradio.webrtc import connection

    stream_fn, index = root_block.set_event_trigger(
        triggers,
        fn,
        inputs,
        outputs,
        concurrency_limit=concurrency_limit,
        trigger_mode="multiple",
        connection="stream",
        time_limit=time_limit,
        **kwargs,
    )
    stream_fn.close_stream = connection.end_admitted_stream
    stream_fn.lease = True
    return stream_fn, index


def server_stream(
    fn: HandlerType,
    *,
    name: str,
    modality: Literal["video", "audio", "audio-video"],
    mode: Literal["send-receive", "receive", "send"],
    rtc_configuration: dict[str, Any] | Callable | None,
    server_rtc_configuration: dict[str, Any] | None,
    video_bitrate: dict[str, int] | None,
    allow_extra_tracks: bool,
    time_limit: float | None,
    concurrency_limit: int | None | Literal["default"],
) -> None:
    """
    Adds the queued event of a gr.Server WebRTC endpoint (see
    `Server.webrtc()`) to the Blocks being created. Like the stream of
    gr.WebRTC, each stream is one queue event that admits the stream when its
    turn comes and then delivers its AdditionalOutputs, each as one list. The
    client sends the extra inputs over the stream's data channel.
    """
    from gradio_client.utils import python_type_to_json_schema

    from gradio.components.api_component import Api
    from gradio.webrtc import connection

    root_block = get_blocks_context()
    if root_block is None:
        raise AttributeError("Cannot add a WebRTC endpoint outside of a Blocks.")
    # Blocks would quietly rename it to name_1
    if name in {f.api_name for f in root_block.fns.values()}:
        raise ValueError(
            f"An endpoint named {name!r} already exists. Pass a different "
            "name to server.webrtc(name=...)."
        )
    manager = connection.ConnectionManager(
        handler=fn,
        mode=mode,
        modality=modality,
        time_limit=time_limit,
        allow_extra_tracks=allow_extra_tracks,
        server_rtc_configuration=server_rtc_configuration,
        video_bitrate=video_bitrate,
        rtc_configuration=rtc_configuration,
        inputs_over_channel=True,
    )

    async def run_stream(webrtc_id: str | None) -> AsyncIterator[Any]:
        # Closed with the queue's run, so that the stream ends at once
        async with aclosing(connection.stream_run(manager, webrtc_id)) as steps:
            async for outputs in steps:
                yield skip() if outputs is None else list(outputs.args)

    add_stream_event(
        root_block,
        [],
        run_stream,
        [Api(None, python_type_to_json_schema(str), "webrtc_id")],
        [Api(None, python_type_to_json_schema(list), "outputs")],
        time_limit=time_limit,
        concurrency_limit=concurrency_limit,
        preprocess=False,
        postprocess=False,
        show_progress="hidden",
        api_name=name,
        # Clients call it, but not as a plain endpoint: the API page and the
        # Python client leave it out
        api_visibility="undocumented",
    )
