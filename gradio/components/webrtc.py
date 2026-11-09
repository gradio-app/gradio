"""gr.WebRTC() component."""

from __future__ import annotations

import dataclasses
import logging
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal, cast

from gradio_client.documentation import document

from gradio.components.audio import MicrophoneOptions
from gradio.components.base import Component
from gradio.components.image_editor import WebcamOptions
from gradio.context import LocalContext, get_blocks_context
from gradio.data_classes import GradioRootModel
from gradio.events import Dependency, EventListenerMethod, Events
from gradio.helpers import skip
from gradio.i18n import I18nData
from gradio.webrtc.endpoint import (
    add_stream_event,
    check_handler,
    check_mode,
    check_turn,
    check_video_bitrate,
)
from gradio.webrtc.handlers import (
    HandlerType,
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


@document()
@dataclasses.dataclass
class StreamOptions:
    """
    A dataclass for specifying how the stream controls of `gr.WebRTC` look. An instance of this class can be passed into the `stream_options` parameter of `gr.WebRTC`.
    Parameters:
        button_labels: the text of the start, stop and waiting buttons, as a dict with any of the keys "start", "stop" and "waiting". The values can be strings or translations made with `gr.I18n`. Defaults to Gradio's translated "Record", "Stop" and "Waiting".
        icon: a path or URL to an image shown in place of the default pulsing icon while an audio stream is active.
        icon_button_color: the CSS color of the icon button of an audio stream. Defaults to the accent color of the theme.
        pulse_color: the CSS color of the pulse animation around the icon of an audio stream. Defaults to the accent color of the theme.
        icon_radius: the border radius of the icon button as a percentage of its size. Defaults to 50.
    """

    button_labels: dict[str, str | I18nData] | None = None
    icon: str | None = None
    icon_button_color: str | None = None
    pulse_color: str | None = None
    icon_radius: int | None = None

    def __post_init__(self):
        unknown = set(self.button_labels or {}) - {"start", "stop", "waiting"}
        if unknown:
            raise ValueError(
                'button_labels takes the keys "start", "stop" and "waiting", '
                f"got {sorted(unknown)}"
            )


def _to_list(blocks: Block | Sequence[Block] | None) -> list[Block]:
    from gradio.blocks import Block

    if blocks is None:
        return []
    if isinstance(blocks, Block):
        return [blocks]
    if isinstance(blocks, set | frozenset):
        raise TypeError(
            "Pass the inputs and outputs of a stream as a list: their order "
            "matches the handler's arguments and AdditionalOutputs."
        )
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
        video_bitrate: dict[str, int] | None = None,
        allow_extra_tracks: bool = False,
        stream_options: StreamOptions | dict | None = None,
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
            rtc_configuration: the configuration for the browser's RTCPeerConnection, in particular the ICE servers (STUN and TURN) it may use. A dict, or a function (sync or async) that returns one, which is called for every new connection so that short-lived TURN credentials can be issued. Like an event listener, the function can take `gr.Request`, `gr.OAuthProfile` or `gr.OAuthToken` parameters, e.g. to issue the credentials with the visitor's own Hugging Face account. Required when the app runs on Hugging Face Spaces or Colab, where the browser often cannot reach the server directly.
            server_rtc_configuration: the equivalent configuration for the server side of the peer connection. Not sent to the browser.
            webcam_options: a `gr.WebcamOptions` instance that sets whether the webcam is mirrored and the media constraints of the video track, for "video" and "audio-video" streams. As in `gr.Image`, a mirrored webcam also gives the handler mirrored frames, so the processed video looks like the preview; set `mirror=False` when the handler needs the camera's own view (e.g. to read text). As in `gr.Image`, the video track constraints go under the "video" key of `constraints`, e.g. `gr.WebcamOptions(constraints={"video": {"facingMode": "environment"}})`. They are merged over the defaults (front camera, 1280x720 and 30 fps, all as ideal values), so only the keys that differ need to be given. The audio track of "audio-video" streams is set with `microphone_options`. Cannot be changed with `gr.update()`.
            microphone_options: a `gr.MicrophoneOptions` instance, or a dict of its arguments, that sets the media constraints of the audio track for "audio" and "audio-video" streams, e.g. `gr.MicrophoneOptions(constraints={"echoCancellation": False})`. The constraints are merged over the defaults, which turn on echo cancellation, noise suppression and automatic gain control and ask for a single channel at 24 kHz, so only the keys that differ need to be given. Cannot be changed with `gr.update()`.
            rtp_params: parameters passed to `RTCRtpSender.setParameters` for the tracks the browser sends. For example, `{"degradationPreference": "maintain-framerate"}` keeps the frame rate steady when the resolution has to drop.
            video_bitrate: the bitrate range of the video in kbps, as a dict with any of the keys "min", "start" and "max", e.g. `{"min": 1000, "start": 1500, "max": 4000}`. WebRTC starts video at a low bitrate and raises it as it finds bandwidth, so the first seconds of a stream are blurry and the browser may send a smaller picture than the camera captures; a higher "start" and "min" avoid that at the cost of bandwidth. The range applies to the video the server sends back, and is passed on to the browser for the video it sends, which Chromium-based browsers honor and others ignore. If None, the defaults of the browser and of aiortc apply (aiortc starts VP8 at 500 kbps and keeps it between 250 kbps and 1.5 Mbps).
            allow_extra_tracks: if True, connections that carry tracks beyond the modality (for example an audio track on a "video" stream) are accepted and the extra tracks are ignored. If False, such connections are rejected.
            stream_options: a `gr.StreamOptions` instance, or a dict of its arguments, that sets the text of the start, stop and waiting buttons and the look of the icon shown during audio streams. [See `gr.StreamOptions` docs](#stream-options).
            height: the height of the component, in pixels if a number is passed, or in CSS units if a string is passed.
            width: the width of the component, in pixels if a number is passed, or in CSS units if a string is passed.
            label: the label for this component, displayed above the component if `show_label` is `True` and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component corresponds to.
            show_label: if True, will display label.
            container: if True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if False, the user cannot start a stream in "send" and "send-receive" (a running stream can still be stopped). If not provided, this is inferred based on whether the component is used as an input or output. In "receive", `trigger` starts the stream, and this has no effect.
            visible: if False, component will be hidden.
            elem_id: an optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: an optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: if False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: a list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
        """
        check_mode(mode, modality)
        self.mode = mode
        self.modality = modality
        # Kept off the config: a callable cannot be serialized, and the browser
        # fetches the configuration from /webrtc/rtc_configuration anyway.
        self._rtc_configuration = rtc_configuration
        # Private for the same reason, and so that gr.update() cannot send it
        self._server_rtc_configuration = server_rtc_configuration
        self.webcam_options = (
            webcam_options if webcam_options is not None else WebcamOptions()
        )
        if microphone_options is None:
            self.microphone_options = MicrophoneOptions()
        elif isinstance(microphone_options, dict):
            self.microphone_options = MicrophoneOptions(**microphone_options)  # type: ignore
        else:
            self.microphone_options = microphone_options
        self.rtp_params = rtp_params or {}
        check_video_bitrate(video_bitrate)
        self.video_bitrate = video_bitrate
        self.allow_extra_tracks = allow_extra_tracks
        if stream_options is None:
            self.stream_options = StreamOptions()
        elif isinstance(stream_options, dict):
            self.stream_options = StreamOptions(**stream_options)  # type: ignore
        else:
            self.stream_options = stream_options
        self.height = height
        self.width = width
        # Set by stream()
        self.time_limit: float | None = None
        self._num_extra_outputs = 0
        self._has_stream = False
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
        # Kept in the form the frontend takes, since gr.update(stream_options=...)
        # sends this attribute as is: the icon as served file data, like
        # gr.Button's icon, so that the app's root url is added to it, and no
        # labels left as None (they keep the default). After super().__init__
        # so that the proxy url is known.
        options = self.stream_options
        self.stream_options = dataclasses.replace(
            options,
            button_labels={
                key: label
                for key, label in (options.button_labels or {}).items()
                if label is not None
            },
            icon=cast(Any, self.serve_static_file(options.icon)),
        )

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
        config.pop("video_bitrate", None)
        config["has_stream"], config["time_limit"] = self._stream_settings()
        config["track_constraints"] = self._track_constraints()
        config["mirror_webcam"] = self.webcam_options.mirror
        options = self.stream_options
        config["stream_options"] = {
            # gr.I18n translations become markers that the frontend translates
            "button_labels": {
                key: str(label) for key, label in (options.button_labels or {}).items()
            },
            "icon": options.icon,
            "icon_button_color": options.icon_button_color,
            "pulse_color": options.pulse_color,
            "icon_radius": options.icon_radius,
        }
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
        inputs: Block | Sequence[Block] | None = None,
        outputs: Block | Sequence[Block] | None = None,
        *,
        time_limit: float | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        trigger: Callable | None = None,
    ) -> Dependency:
        """
        Attaches the function or handler that processes the media of this component. For video streams, `fn` is called with each frame as an RGB numpy array of shape (height, width, 3), like the numpy value of `gr.Image`, followed by the values of the other inputs, and returns the frame to show in the same format. For audio streams, `fn` is a `StreamHandler` or `AsyncStreamHandler` subclass (or instance) from `gradio.webrtc`. A video stream that needs state or resources for its whole duration, for example one GPU allocation per stream on ZeroGPU, can instead use a `VideoStreamHandler` or `AsyncVideoStreamHandler` subclass, in mode="send-receive" or in mode="send" (where only the `AdditionalOutputs` of its `video_emit()` are used). In mode="receive", `fn` is a generator that yields frames and takes the values of `inputs` as arguments; it is closed when the stream ends, so its `finally` blocks and `with` statements run then. A handler can return `(frame, AdditionalOutputs(...))` or yield `AdditionalOutputs(...)` to update the other components in `outputs`, and `CloseStream()` to end the connection.
        Parameters:
            fn: the function or handler that processes the stream. One handler serves one connection: pass a handler class to create a new instance per connection, or an instance that implements `copy()`. Like an event listener, a function (and the `start_up` method of a handler class) can take `gr.Request`, `gr.OAuthProfile` or `gr.OAuthToken` parameters, which receive the values of the visitor who started the stream.
            inputs: the components whose values are passed to the handler. In mode="send" and mode="send-receive", the first element must be this component. The values of the other inputs are passed to video functions after the frame, to receive-mode generators as arguments, and to stream handlers through `latest_args` after `wait_for_args()`.
            outputs: this component, plus the components that receive the values of `AdditionalOutputs`, in order. Each `AdditionalOutputs` is delivered, oldest first; if a handler emits faster than they can be delivered and more than 64 are waiting, the oldest are dropped.
            time_limit: the maximum duration of a stream in seconds, counted from when its turn in the queue comes. The stream is closed when it is reached, and the next user in line gets the slot.
            concurrency_limit: the maximum number of simultaneous streams of this component. Further streams wait in the queue, showing their position, until a stream ends. "default" uses the queue's default concurrency limit (1 unless set with `Blocks.queue(default_concurrency_limit=...)`), None means no limit.
            trigger: in mode="receive", the event that starts the stream, for example `button.click`.
        Returns:
            The event that runs each stream. Pass it to `cancels=` of another event to stop the stream from there, for example with a button. Its `.success()` listeners run when a stream ends, and its `.failure()` listeners when the handler raised an error.
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
        renderable = LocalContext.renderable.get(None)
        if renderable is not None and self.rendered_in is not renderable:
            # The page learns that the component has a stream from its config,
            # which a render sends only for the components it creates
            raise ValueError(
                "stream() was called inside a @gr.render function on a WebRTC "
                "component created outside it. Create the gr.WebRTC component "
                "inside the render function too, or call stream() outside it."
            )
        if self._has_stream:
            raise ValueError(
                "stream() can only be called once per WebRTC component. Use "
                "another gr.WebRTC component for another stream."
            )
        check_turn(self._rtc_configuration, "gr.WebRTC")

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
        check_handler(fn, self.mode, self.modality)

        self.time_limit = time_limit
        self._num_extra_outputs = len(extra_outputs)
        self._has_stream = True
        manager = webrtc_connection.ConnectionManager(
            handler=fn,
            mode=self.mode,
            modality=self.modality,
            time_limit=time_limit,
            allow_extra_tracks=self.allow_extra_tracks,
            server_rtc_configuration=self._server_rtc_configuration,
            video_bitrate=self.video_bitrate,
            rtc_configuration=self._rtc_configuration,
        )

        # Only the event holds this stream()'s manager, so the manager goes
        # away with it (e.g. when a @gr.render replaces its events)
        async def run_stream(webrtc_id: str | None) -> Any:
            return await self._run_stream(manager, webrtc_id)

        # Each stream is one queue event: the frontend fires "stream" when the
        # user starts it, waits for its turn, and only then connects. The event
        # then delivers AdditionalOutputs until the stream ends. It takes only
        # the stream's id: the other inputs reach the handler through the
        # events below, so the event's wakes do not preprocess them again.
        stream_fn, stream_index = add_stream_event(
            root_block,
            [EventListenerMethod(self, "stream")],
            run_stream,
            [self],
            cast(list, [self, *extra_outputs]),
            time_limit=time_limit,
            concurrency_limit=concurrency_limit,
            # The component shows the place in line and the wait itself,
            # next to the button that cancels it
            show_progress="hidden",
            show_progress_on=self,
            api_visibility="private",
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
            queue=False,
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
                    queue=False,
                )
        if self.mode == "receive":
            cast(Callable, trigger)(
                lambda: START_STREAM,
                inputs=None,
                outputs=[self],
                api_visibility="private",
                show_progress="hidden",
                queue=False,
            )
        return Dependency(self, stream_fn.get_config(), stream_index, fn)

    def _stream_settings(self) -> tuple[bool, float | None]:
        """
        Whether the component has a stream, and the stream's time limit, for
        its config: from the stream event that targets it in the blocks being
        served, else from what its own `stream()` call set. When an event
        updates the component (`gr.update(...)`), Gradio gives the session a
        new instance with its own id, stored under the original id in the
        session's blocks, which the stream event targets.
        """
        blocks_config = LocalContext.blocks_config.get(None)
        if blocks_config is None:
            return self._has_stream, self.time_limit
        stream_id = next(
            (block_id for block_id, b in blocks_config.blocks.items() if b is self),
            self._id,
        )
        stream_fn = None
        for fn in blocks_config.fns.values():
            if (stream_id, "stream") in [tuple(target) for target in fn.targets]:
                stream_fn = fn
        if stream_fn is None:
            return False, None
        return True, stream_fn.time_limit

    async def _push_inputs(self, webrtc_id: str | None, *args: Any) -> None:
        try:
            from gradio.webrtc.connection import set_input
        except ImportError:
            return
        if webrtc_id:
            request = LocalContext.request.get(None)
            set_input(webrtc_id, getattr(request, "session_hash", None), *args)

    async def _run_stream(
        self, manager: ConnectionManager, webrtc_id: str | None
    ) -> Any:
        """
        The queue event of one stream. Its first call admits the stream, and
        each later call delivers the next AdditionalOutputs. The value of this
        component itself is never changed. `manager` is the one of the
        `stream()` call: the one registered for this component id may belong to
        another session's render, or to a later render of it.
        """
        from gradio.webrtc.connection import stream_call

        nothing = [skip()] * (1 + self._num_extra_outputs)
        outputs = stream_call(manager, webrtc_id)
        if outputs is not None:
            if len(outputs.args) != self._num_extra_outputs:
                raise ValueError(
                    f"AdditionalOutputs has {len(outputs.args)} values, "
                    f"but stream() has {self._num_extra_outputs} outputs "
                    "besides the WebRTC component."
                )
            nothing = [skip(), *outputs.args]
        return nothing[0] if len(nothing) == 1 else tuple(nothing)
