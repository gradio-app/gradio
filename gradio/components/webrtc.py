"""gr.WebRTC() component."""

from __future__ import annotations

import inspect
import logging
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal, cast

import anyio
from gradio_client.documentation import document

from gradio import utils
from gradio.components.audio import MicrophoneOptions
from gradio.components.base import Component, server
from gradio.components.image_editor import WebcamOptions
from gradio.context import LocalContext, get_blocks_context
from gradio.data_classes import GradioRootModel
from gradio.events import EventListenerMethod, Events
from gradio.i18n import I18nData
from gradio.webrtc.handlers import (
    AsyncAudioVideoStreamHandler,
    AsyncStreamHandler,
    AudioVideoStreamHandler,
    HandlerType,
    StreamHandler,
    StreamHandlerBase,
    VideoStreamHandler,
)
from gradio.webrtc.utils import WEBRTC_EXTRA_HINT

if TYPE_CHECKING:
    from gradio.blocks import Block
    from gradio.components import Timer
    from gradio.webrtc.connection import ConnectionManager

logger = logging.getLogger(__name__)

Mode = Literal["send-receive", "receive", "send"]
Modality = Literal["video", "audio", "audio-video"]

# Setting the component value to this string tells the frontend to open a
# connection in mode="receive".
START_STREAM = "__start_webrtc_stream__"

DEFAULT_VIDEO_CONSTRAINTS: dict[str, Any] = {
    "facingMode": "user",
    "width": {"ideal": 1280},
    "height": {"ideal": 720},
    "frameRate": {"ideal": 30},
}
DEFAULT_AUDIO_CONSTRAINTS: dict[str, Any] = {
    "echoCancellation": True,
    "noiseSuppression": {"exact": True},
    "autoGainControl": {"exact": True},
    "sampleRate": {"ideal": 24000},
    "sampleSize": {"ideal": 16},
    "channelCount": {"exact": 1},
}


class WebRTCModel(GradioRootModel):
    root: str


def _to_list(blocks: Block | Sequence[Block] | set[Block] | None) -> list[Block]:
    from gradio.blocks import Block

    if blocks is None:
        return []
    if isinstance(blocks, Block):
        return [blocks]
    return list(blocks)


@document("stream")
class WebRTC(Component):
    """
    Streams audio or video between the browser and a Python function over WebRTC, for real-time applications such as object detection on a webcam feed or a voice assistant. Media travels over a peer connection instead of through the queue, so each frame reaches the handler with the latency of a direct connection. Attach the handler with the `stream()` method. Requires the `webrtc` extra: `pip install "gradio[webrtc]"`.

    Guides: object-detection-from-webcam-with-webrtc
    """

    EVENTS = [Events.change, Events.start_recording, Events.stop_recording]
    data_model = WebRTCModel

    def __init__(
        self,
        value: str | None = None,
        *,
        mode: Mode = "send-receive",
        modality: Modality = "video",
        rtc_configuration: dict[str, Any] | Callable | None = None,
        server_rtc_configuration: dict[str, Any] | None = None,
        webcam_options: WebcamOptions | None = None,
        microphone_options: MicrophoneOptions | dict | None = None,
        rtp_params: dict[str, Any] | None = None,
        allow_extra_tracks: bool = False,
        icon: str | None = None,
        icon_button_color: str | None = None,
        pulse_color: str | None = None,
        icon_radius: int | None = None,
        button_labels: dict[str, str] | None = None,
        height: int | str | None = None,
        width: int | str | None = None,
        label: str | I18nData | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
    ):
        """
        Parameters:
            value: the id of the current connection. It is set by the browser when a stream starts and is not meant to be set by the developer.
            mode: the direction of the stream. "send-receive" sends the user's media to the handler and plays what the handler returns, "send" only sends the user's media, and "receive" only plays media that the handler generates.
            modality: the kind of media: "video", "audio", or "audio-video" for both at once.
            rtc_configuration: the configuration for the browser's RTCPeerConnection, in particular the ICE servers (STUN and TURN) it may use. A dict, or a function (sync or async) that returns one, which is called for every new connection so that short-lived TURN credentials can be issued. Required when the app runs on Hugging Face Spaces or Colab, where the browser cannot reach the server directly.
            server_rtc_configuration: the equivalent configuration for the server side of the peer connection. Not sent to the browser.
            webcam_options: a `gr.WebcamOptions` instance that sets whether the webcam preview is mirrored and the media constraints of the video track, for "video" and "audio-video" streams. As in `gr.Image`, the video track constraints go under the "video" key of `constraints`, e.g. `gr.WebcamOptions(constraints={"video": {"facingMode": "environment"}})`. They are merged over the defaults (front camera, 1280x720 and 30 fps, all as ideal values), so only the keys that differ need to be given. The audio track of "audio-video" streams is set with `microphone_options`.
            microphone_options: a `gr.MicrophoneOptions` instance, or a dict of its arguments, that sets the media constraints of the audio track for "audio" and "audio-video" streams, e.g. `gr.MicrophoneOptions(constraints={"echoCancellation": False})`. The constraints are merged over the defaults, which turn on echo cancellation, noise suppression and automatic gain control and ask for a single channel at 24 kHz, so only the keys that differ need to be given.
            rtp_params: parameters passed to `RTCRtpSender.setParameters` for the tracks the browser sends. For example, `{"degradationPreference": "maintain-framerate"}` keeps the frame rate steady when the resolution has to drop.
            allow_extra_tracks: if True, connections that carry tracks beyond the modality (for example an audio track on a "video" stream) are accepted and the extra tracks are ignored. If False, such connections are rejected.
            icon: a path or URL to an image shown in place of the default pulsing icon while an audio stream is active.
            icon_button_color: the CSS color of the icon button of an audio stream. Defaults to the accent color of the theme.
            pulse_color: the CSS color of the pulse animation around the icon of an audio stream. Defaults to the accent color of the theme.
            icon_radius: the border radius of the icon button as a percentage of its size. Defaults to 50.
            button_labels: the text of the start, stop and waiting buttons, as a dict with any of the keys "start", "stop" and "waiting".
            height: the height of the component, in pixels if a number is passed, or in CSS units if a string is passed.
            width: the width of the component, in pixels if a number is passed, or in CSS units if a string is passed.
            label: the label for this component, displayed above the component if `show_label` is `True` and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component corresponds to.
            show_label: if True, will display label.
            container: if True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if not provided, this is inferred based on whether the component is used as an input or output. The stream controls themselves depend on `mode`: the user starts and stops the stream in "send" and "send-receive", and `trigger` starts it in "receive".
            visible: if False, component will be hidden.
            elem_id: an optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: an optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: if False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: a list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
        """
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
        self.mode = mode
        self.modality = modality
        # Kept off the config: a callable cannot be serialized, and the browser
        # fetches the configuration through `get_rtc_configuration` anyway.
        self._rtc_configuration = rtc_configuration
        self.server_rtc_configuration = server_rtc_configuration
        self.webcam_options = (
            webcam_options if webcam_options is not None else WebcamOptions()
        )
        if microphone_options is None:
            self.microphone_options = MicrophoneOptions()
        elif isinstance(microphone_options, dict):
            self.microphone_options = MicrophoneOptions(**microphone_options)
        else:
            self.microphone_options = microphone_options
        self.rtp_params = rtp_params or {}
        self.allow_extra_tracks = allow_extra_tracks
        self.icon_button_color = icon_button_color
        self.pulse_color = pulse_color
        self.icon_radius = icon_radius
        self.button_labels = {
            "start": "",
            "stop": "",
            "waiting": "",
            **(button_labels or {}),
        }
        self.height = height
        self.width = width
        # Set by stream()
        self.time_limit: float | None = None
        self.concurrency_limit: int | None = 1
        self._num_extra_outputs = 0
        super().__init__(
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            value=value,
        )
        # After super().__init__ so that the proxy url is known
        served_icon = self.serve_static_file(icon) if icon else None
        self.icon = served_icon["url"] if served_icon else None

    def _track_constraints(self) -> dict[str, Any]:
        # User constraints are merged over the defaults rather than replacing
        # them, so that e.g. turning off echo cancellation keeps the mono
        # 24 kHz input that voice handlers expect.
        video = (self.webcam_options.constraints or {}).get("video")
        video = {
            **DEFAULT_VIDEO_CONSTRAINTS,
            **(video if isinstance(video, dict) else {}),
        }
        audio = {
            **DEFAULT_AUDIO_CONSTRAINTS,
            **(self.microphone_options.constraints or {}),
        }
        if self.modality == "video":
            return video
        if self.modality == "audio":
            return audio
        return {"video": video, "audio": audio}

    def get_config(self, cls: type[Block] | None = None) -> dict[str, Any]:
        config = super().get_config(cls)
        config.pop("server_rtc_configuration", None)
        manager = self._manager()
        config["time_limit"] = manager.time_limit if manager else self.time_limit
        config["track_constraints"] = self._track_constraints()
        config["mirror_webcam"] = self.webcam_options.mirror
        return config

    def preprocess(self, payload: WebRTCModel | None) -> str | None:
        """
        Parameters:
            payload: the id of the current connection, set by the browser.
        Returns:
            Passes the connection id as a `str`, or None when no stream has started.
        """
        return None if payload is None else payload.root

    def postprocess(self, value: str | None) -> str | None:
        """
        Parameters:
            value: a connection id. Developers normally do not set this value.
        Returns:
            The value unchanged.
        """
        return value

    def example_payload(self) -> Any:
        return "a1b2c3d4"

    def example_value(self) -> Any:
        return "a1b2c3d4"

    def stream(
        self,
        fn: HandlerType,
        inputs: Block | Sequence[Block] | set[Block] | None = None,
        outputs: Block | Sequence[Block] | set[Block] | None = None,
        *,
        time_limit: float | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        trigger: Callable | None = None,
    ) -> None:
        """
        Attaches the function or handler that processes the media of this component. For video streams, `fn` is called with each frame as a numpy array (BGR) followed by the values of the other inputs, and returns the frame to show. For audio streams, `fn` is a `StreamHandler` or `AsyncStreamHandler` subclass (or instance) from `gradio.webrtc`. In mode="receive", `fn` is a generator that yields frames and takes the values of `inputs` as arguments. A handler can return `(frame, AdditionalOutputs(...))` or yield `AdditionalOutputs(...)` to update the other components in `outputs`, and `CloseStream()` to end the connection.
        Parameters:
            fn: the function or handler that processes the stream. One handler serves one connection: pass a handler class to create a new instance per connection, or an instance that implements `copy()`.
            inputs: the components whose values are passed to the handler. In mode="send" and mode="send-receive", the first element must be this component. The values of the other inputs are passed to video functions after the frame, to receive-mode generators as arguments, and to stream handlers through `latest_args` after `wait_for_args()`.
            outputs: this component, plus the components that receive the values of `AdditionalOutputs`, in order.
            time_limit: the maximum duration of a connection in seconds. The connection is closed when it is reached.
            concurrency_limit: the maximum number of simultaneous connections to this component. "default" means 1, None means no limit. Connections beyond the limit are rejected with an error message.
            trigger: in mode="receive", the event that starts the stream, for example `button.click`.
        """
        try:
            from gradio.webrtc import connection as webrtc_connection
        except ImportError as e:
            raise ImportError(WEBRTC_EXTRA_HINT) from e

        root_block = get_blocks_context()
        if root_block is None:
            raise AttributeError(
                "Cannot call stream() outside of a gradio.Blocks context."
            )
        if (
            utils.get_space() or utils.colab_check()
        ) and self._rtc_configuration is None:
            raise ValueError(
                "gr.WebRTC cannot connect from Hugging Face Spaces or Google Colab "
                "without a TURN server, because the browser cannot reach the app "
                "directly. Pass `rtc_configuration=` with your ICE servers, or a "
                "function that returns them. Hugging Face accounts get a free monthly "
                "TURN quota through Cloudflare; see the gr.WebRTC docs for details."
            )

        inputs = _to_list(inputs)
        outputs = _to_list(outputs)
        if self.mode in ("send", "send-receive"):
            if not inputs or inputs[0] is not self:
                raise ValueError(
                    f'In mode="{self.mode}", the first element of `inputs` must be '
                    "the WebRTC component itself."
                )
            extra_inputs = inputs[1:]
        else:
            if self in inputs:
                raise ValueError(
                    'In mode="receive", the WebRTC component cannot be one of the '
                    "`inputs`: it produces media and has no value to pass."
                )
            if trigger is None:
                raise ValueError(
                    'In mode="receive", `trigger` is required: pass the event that '
                    "starts the stream, for example `button.click`."
                )
            extra_inputs = inputs
        extra_outputs = [o for o in outputs if o is not self]
        self._check_handler(fn)

        self.time_limit = time_limit
        self.concurrency_limit = (
            1 if concurrency_limit == "default" else concurrency_limit
        )
        self._num_extra_outputs = len(extra_outputs)
        webrtc_connection.register_manager(
            self._id,
            handler=fn,
            mode=self.mode,
            modality=self.modality,
            concurrency_limit=self.concurrency_limit,
            time_limit=time_limit,
            allow_extra_tracks=self.allow_extra_tracks,
            server_rtc_configuration=self.server_rtc_configuration,
        )

        # The frontend fires "tick" when the handler asks for the inputs, and
        # every extra input pushes its new value as soon as it changes.
        push_inputs = cast(list, [self, *extra_inputs])
        root_block.set_event_trigger(
            [EventListenerMethod(self, "tick")],
            self._push_inputs,
            inputs=push_inputs,
            outputs=None,
            show_progress="hidden",
            api_visibility="private",
            concurrency_limit=None,
            trigger_mode="multiple",
        )
        for component in extra_inputs:
            if "change" in component.events:
                root_block.set_event_trigger(
                    [EventListenerMethod(component, "change")],
                    self._push_inputs,
                    inputs=push_inputs,
                    outputs=None,
                    show_progress="hidden",
                    api_visibility="private",
                    concurrency_limit=None,
                    trigger_mode="always_last",
                )
        # The frontend fires "state_change" when the handler has produced
        # AdditionalOutputs; the drainer then runs until the connection closes.
        if extra_outputs:
            root_block.set_event_trigger(
                [EventListenerMethod(self, "state_change")],
                self._drain_outputs,
                inputs=[self],
                outputs=cast(list, extra_outputs),
                show_progress="hidden",
                api_visibility="private",
                concurrency_limit=None,
                trigger_mode="once",
            )
        if self.mode == "receive":
            cast(Callable, trigger)(
                lambda: START_STREAM,
                inputs=None,
                outputs=[self],
                api_visibility="private",
                show_progress="hidden",
            )

    def _check_handler(self, fn: HandlerType) -> None:
        is_handler_class = inspect.isclass(fn) and issubclass(fn, StreamHandlerBase)
        is_handler = is_handler_class or isinstance(fn, StreamHandlerBase)
        av_classes = (AudioVideoStreamHandler, AsyncAudioVideoStreamHandler)
        is_av_handler = (
            is_handler_class and issubclass(cast(type, fn), av_classes)
        ) or isinstance(fn, av_classes)

        if self.modality == "audio-video":
            if not is_av_handler:
                raise ValueError(
                    'For modality="audio-video", `fn` must be an '
                    "AudioVideoStreamHandler or AsyncAudioVideoStreamHandler "
                    "subclass or instance."
                )
        elif self.modality == "audio" and self.mode in ("send", "send-receive"):
            if not is_handler:
                raise ValueError(
                    f'For modality="audio" in mode="{self.mode}", `fn` must be a '
                    "StreamHandler or AsyncStreamHandler subclass or instance."
                )
        elif is_handler:
            raise ValueError(
                f'For modality="{self.modality}" in mode="{self.mode}", `fn` must '
                "be a function (or a VideoStreamHandler), not a stream handler class."
            )
        elif not callable(fn) and not isinstance(fn, VideoStreamHandler):
            raise ValueError("`fn` must be a callable or a VideoStreamHandler.")

        if isinstance(fn, StreamHandlerBase) and getattr(type(fn), "copy", None) in (
            StreamHandler.copy,
            AsyncStreamHandler.copy,
        ):
            raise ValueError(
                f"{type(fn).__name__} does not implement copy(), which is needed "
                "to create a handler per connection. Pass the class itself to "
                "stream() instead of an instance, or implement copy()."
            )

    def _stream_id(self) -> int:
        """
        The id this component was registered under in `stream()`. When an event
        updates the component (`gr.update(...)`), Gradio gives the session a new
        instance with its own id, stored under the original id in the session's
        blocks, and server functions then run on that instance.
        """
        blocks_config = LocalContext.blocks_config.get(None)
        if blocks_config is not None:
            for block_id, block in blocks_config.blocks.items():
                if block is self:
                    return block_id
        return self._id

    def _manager(self) -> ConnectionManager | None:
        try:
            from gradio.webrtc.connection import get_manager
        except ImportError:
            return None
        return get_manager(self._stream_id())

    async def _push_inputs(self, webrtc_id: str | None, *args: Any) -> None:
        manager = self._manager()
        if manager is not None and webrtc_id:
            manager.set_input(webrtc_id, *args)

    async def _drain_outputs(self, webrtc_id: str | None):
        manager = self._manager()
        if manager is None or not webrtc_id:
            return
        async for outputs in manager.output_stream(webrtc_id):
            if self._num_extra_outputs == 1 and len(outputs.args) == 1:
                yield outputs.args[0]
            else:
                yield tuple(outputs.args)

    async def _resolve_rtc_configuration(self) -> dict[str, Any]:
        config = self._rtc_configuration
        if config is None:
            return {}
        if inspect.iscoroutinefunction(config):
            return await config()
        if callable(config):
            return await anyio.to_thread.run_sync(config)
        return cast(dict[str, Any], config)

    @server
    async def get_rtc_configuration(self, _: Any = None) -> dict[str, Any]:
        try:
            return await self._resolve_rtc_configuration()
        except Exception as e:
            logger.exception("Could not resolve rtc_configuration")
            return {"error": str(e)}

    @server
    async def offer(self, body: dict[str, Any]) -> dict[str, Any]:
        manager = self._manager()
        if manager is None:
            return {
                "status": "failed",
                "meta": {"error": "no_stream_handler"},
            }
        return await manager.handle_offer(body)

    @server
    async def stop_outputs(self, body: dict[str, Any]) -> dict[str, Any]:
        manager = self._manager()
        if manager is not None and body.get("webrtc_id"):
            manager.stop_outputs(body["webrtc_id"])
        return {"success": True}
