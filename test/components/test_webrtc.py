import asyncio
import json
import pickle
import time
from collections.abc import Callable
from contextlib import asynccontextmanager, closing
from types import SimpleNamespace
from typing import Any, cast
from unittest.mock import patch

import anyio
import httpx2
import pytest
import pytest_asyncio
from aiortc import (
    AudioStreamTrack,
    RTCPeerConnection,
    RTCSessionDescription,
    VideoStreamTrack,
)
from aiortc.mediastreams import MediaStreamError

import gradio as gr
from gradio.context import LocalContext
from gradio.route_utils import API_PREFIX
from gradio.webrtc import (
    AdditionalOutputs,
    AsyncAudioVideoStreamHandler,
    AsyncStreamHandler,
    AsyncVideoStreamHandler,
    CloseStream,
    StreamHandler,
    VideoOptions,
    VideoStreamHandler,
)
from gradio.webrtc import connection as webrtc_connection


def manager_of(blocks, webrtc):
    """The ConnectionManager that `webrtc.stream()` created, which the function
    of its stream event holds."""
    import inspect

    stream_fn = next(
        fn
        for fn in blocks.fns.values()
        if (webrtc._id, "stream") in [tuple(t) for t in fn.targets]
    )
    return inspect.getclosurevars(stream_fn.fn).nonlocals["manager"]


def queue_event(event_id="event", session_hash=None):
    """A queue event and the handle its function gets, without a running queue."""
    from gradio.queueing import EventHandle

    event = SimpleNamespace(
        _id=event_id,
        session_hash=session_hash,
        concurrency_id="stream",
        alive=True,
        closed=False,
        run_time=0.0,
        signal=asyncio.Event(),
    )
    queue = SimpleNamespace(
        event_ids_to_events={event_id: event}, event_queue_per_concurrency_id={}
    )
    return event, EventHandle(cast(Any, event), cast(Any, queue))


def flip(frame, *args):
    return frame


def admitted_anyway(managers):
    """`stream_admitted` that admits any session, to the given manager by id."""

    async def admitted(webrtc_id, session_hash):
        return managers[webrtc_id], SimpleNamespace(rtc_configuration=None)

    return admitted


def rtc_manager(rtc_configuration=None):
    """A manager of a video stream with this browser configuration, as
    `stream()` creates it."""
    return webrtc_connection.ConnectionManager(
        handler=flip,
        mode="send-receive",
        modality="video",
        time_limit=None,
        allow_extra_tracks=False,
        server_rtc_configuration=None,
        rtc_configuration=rtc_configuration,
    )


issued_credentials: list = []


def issue_credentials():
    issued_credentials.append(1)
    return {"iceServers": [{"urls": f"turn:{len(issued_credentials)}"}]}


def on_event_loop():
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return False
    return True


seen_requests: list = []


def needs_request(frame, value, request: gr.Request):
    seen_requests.append(request)
    return frame


def fail_with_gr_error(frame, *args):
    raise gr.Error("Bad frame", title="Oops")


def fail_with_value_error(frame, *args):
    raise ValueError("internal detail")


def warn(frame, *args):
    gr.Warning("Careful")
    return frame


def three_frames(*args):
    import numpy as np

    for _ in range(3):
        yield np.zeros((16, 16, 3), dtype=np.uint8)


class EchoHandler(AsyncStreamHandler):
    async def receive(self, frame):
        pass

    async def emit(self):
        return None


class FailsToStart(EchoHandler):
    def __init__(self):
        raise gr.Error("Model not found")


class StartsWithRequest(EchoHandler):
    async def start_up(self, request: gr.Request):  # type: ignore
        seen_requests.append(request)


class SyncHandler(StreamHandler):
    def receive(self, frame):
        pass

    def emit(self):
        return None


class FailingShutdown(SyncHandler):
    def copy(self):
        return FailingShutdown()

    def shutdown(self):
        raise RuntimeError("shutdown failed")


class SlowShutdown(SyncHandler):
    log = []

    def __init__(self):
        super().__init__()
        SlowShutdown.log.append("created")

    def copy(self):
        return SlowShutdown()

    def shutdown(self):
        SlowShutdown.log.append("shutdown begins")
        time.sleep(0.5)
        SlowShutdown.log.append("shutdown ends")


class RequestOnEmit(SyncHandler):
    seen = []

    def emit(self):
        request = LocalContext.request.get(None)
        RequestOnEmit.seen.append(getattr(request, "session_hash", None))
        time.sleep(0.02)


class InfoOnEmit(SyncHandler):
    def __init__(self):
        super().__init__()
        self.sent = False

    def emit(self):
        if not self.sent:
            self.sent = True
            gr.Info("From emit")


class ValueErrorOnEmit(SyncHandler):
    def emit(self):
        raise ValueError("internal detail")


def value_error_then_audio(*args):
    raise ValueError("internal detail")
    yield


def info_then_audio(*args):
    import numpy as np

    gr.Info("From the generator")
    for _ in range(3):
        yield (24000, np.zeros(2400, dtype=np.int16))


class CloseOnEmit(AsyncStreamHandler):
    async def receive(self, frame):
        pass

    async def emit(self):
        await asyncio.sleep(0.2)
        return CloseStream("done")


class RecordingVideo(VideoStreamHandler):
    """A video-only handler that records what it is told during a stream."""

    def __init__(self):
        super().__init__(fps=10)
        self.events = []
        self.frames = 0

    def start_up(self):
        self.events.append("start_up")

    def video_receive(self, frame):
        self.frames += 1

    def video_emit(self):
        import numpy as np

        time.sleep(0.02)
        frame = np.zeros((16, 16, 3), dtype=np.uint8)
        if not self.latest_args:
            return frame
        return frame, AdditionalOutputs(self.latest_args[0] * 2)

    def shutdown(self):
        self.events.append("shutdown on the loop" if on_event_loop() else "shutdown")


class AsyncRecordingVideo(AsyncVideoStreamHandler):
    def __init__(self):
        super().__init__(fps=10)
        self.events = []
        self.frames = 0

    async def start_up(self):
        self.events.append("start_up")

    async def video_receive(self, frame):
        self.frames += 1

    async def video_emit(self):
        import numpy as np

        await asyncio.sleep(0.02)
        frame = np.zeros((16, 16, 3), dtype=np.uint8)
        if not self.latest_args:
            return frame
        return frame, AdditionalOutputs(self.latest_args[0] * 2)

    def shutdown(self):
        self.events.append("shutdown on the loop" if on_event_loop() else "shutdown")


class CaptionVideo(VideoStreamHandler):
    """Like a captioner: frames in, values out, never a frame back."""

    def __init__(self):
        super().__init__(fps=10)
        self.events = []
        self.frames = 0

    def start_up(self):
        self.events.append("start_up")

    def video_receive(self, frame):
        self.frames += 1

    def video_emit(self):
        time.sleep(0.02)
        if not self.latest_args:
            return None
        return AdditionalOutputs(self.latest_args[0] * 2)

    def shutdown(self):
        self.events.append("shutdown on the loop" if on_event_loop() else "shutdown")


class CloseOnVideoEmit(VideoStreamHandler):
    def video_receive(self, frame):
        pass

    def video_emit(self):
        time.sleep(0.2)
        return CloseStream("done")


class RecordingAudioVideo(AsyncAudioVideoStreamHandler):
    def __init__(self):
        super().__init__()
        self.events = []

    async def receive(self, frame):
        pass

    async def emit(self):
        await asyncio.sleep(0.02)

    async def video_receive(self, frame):
        pass

    async def video_emit(self):
        import numpy as np

        await asyncio.sleep(0.02)
        return np.zeros((16, 16, 3), dtype=np.uint8)

    def shutdown(self):
        self.events.append("shutdown on the loop" if on_event_loop() else "shutdown")


class TestWebRTC:
    def test_ice_candidates_are_parsed_like_aiortc(self):
        candidate = webrtc_connection._parse_ice_candidate(
            {
                "candidate": "candidate:1 1 udp 1 203.0.113.5 9 typ srflx "
                "raddr 10.0.0.2 rport 5000 generation 0",
                "sdpMid": "0",
                "sdpMLineIndex": 0,
            }
        )
        assert candidate is not None
        assert (candidate.type, candidate.relatedAddress, candidate.relatedPort) == (
            "srflx",
            "10.0.0.2",
            5000,
        )
        assert (candidate.sdpMid, candidate.sdpMLineIndex) == ("0", 0)
        assert webrtc_connection._parse_ice_candidate({"candidate": "nonsense"}) is None

    def test_component_functions(self):
        webrtc = gr.WebRTC(
            rtc_configuration=lambda: {"iceServers": []},
            server_rtc_configuration={
                "iceServers": [{"urls": "turn:example.com", "credential": "secret"}]
            },
        )
        config = webrtc.get_config()
        assert "rtc_configuration" not in config
        assert "server_rtc_configuration" not in config
        # Nor in an update, which sends the named attributes as they are
        from gradio.blocks import postprocess_update_dict

        update = postprocess_update_dict(
            webrtc, {"server_rtc_configuration": {"iceServers": []}}
        )
        assert "server_rtc_configuration" not in update
        assert config["mode"] == "send-receive"
        assert config["modality"] == "video"
        assert config["track_constraints"]["facingMode"] == "user"
        assert config["mirror_webcam"] == "auto"
        assert config["time_limit"] is None
        assert "server_fns" not in config
        assert webrtc.preprocess(gr.WebRTC.data_model(root="abc")) == "abc"
        assert webrtc.preprocess(None) is None
        assert webrtc.postprocess("abc") == "abc"
        assert webrtc.api_info()["type"] == "string"

        plain = gr.WebRTC()
        assert pickle.loads(pickle.dumps(plain)).get_config() == plain.get_config()

    def test_media_constraints(self):
        from gradio.components.webrtc import (
            DEFAULT_AUDIO_CONSTRAINTS,
            DEFAULT_VIDEO_CONSTRAINTS,
        )

        assert gr.WebRTC(modality="audio").get_config()["track_constraints"] == (
            DEFAULT_AUDIO_CONSTRAINTS
        )
        assert gr.WebRTC(modality="video").get_config()["track_constraints"] == (
            DEFAULT_VIDEO_CONSTRAINTS
        )

        # User constraints are merged over the defaults
        expected_audio = {**DEFAULT_AUDIO_CONSTRAINTS, "echoCancellation": False}
        for options in (
            gr.MicrophoneOptions(constraints={"echoCancellation": False}),
            {"constraints": {"echoCancellation": False}},
        ):
            audio = gr.WebRTC(modality="audio", microphone_options=options)
            assert isinstance(audio.microphone_options, gr.MicrophoneOptions)
            assert audio.get_config()["track_constraints"] == expected_audio

        both = gr.WebRTC(
            modality="audio-video",
            webcam_options=gr.WebcamOptions(
                mirror=False, constraints={"video": {"width": 640}}
            ),
        )
        config = both.get_config()
        assert config["track_constraints"]["video"] == {
            **DEFAULT_VIDEO_CONSTRAINTS,
            "width": 640,
        }
        assert config["track_constraints"]["audio"] == DEFAULT_AUDIO_CONSTRAINTS
        assert config["mirror_webcam"] is False

    def test_invalid_mode_and_modality(self):
        with pytest.raises(ValueError, match="mode must be"):
            gr.WebRTC(mode="duplex")  # type: ignore
        with pytest.raises(ValueError, match="modality must be"):
            gr.WebRTC(modality="text")  # type: ignore
        with pytest.raises(ValueError, match="audio-video"):
            gr.WebRTC(modality="audio-video", mode="send")

    def test_stream_options(self):
        i18n = gr.I18n(en={"talk": "Start talking"})
        webrtc = gr.WebRTC(
            modality="audio",
            stream_options={
                "button_labels": {"start": i18n("talk"), "stop": "Done"},
                "pulse_color": "red",
            },
        )
        options = webrtc.get_config()["stream_options"]
        assert options["button_labels"]["stop"] == "Done"
        # Translated in the frontend
        assert options["button_labels"]["start"].startswith("__i18n__")
        assert options["pulse_color"] == "red"
        assert options["icon"] is None
        assert "button_labels" not in webrtc.get_config()
        with pytest.raises(ValueError, match="button_labels"):
            gr.StreamOptions(button_labels={"begin": "Go"})
        # A label left as None keeps the default
        webrtc = gr.WebRTC(
            stream_options={"button_labels": {"start": None, "stop": "Done"}}
        )
        assert webrtc.get_config()["stream_options"]["button_labels"] == {
            "stop": "Done"
        }

    @pytest.mark.asyncio
    async def test_stream_options_update_like_the_config(self):
        from gradio.routes import ORJSONResponse

        i18n = gr.I18n(en={"talk": "Start talking"})
        options = gr.StreamOptions(
            button_labels={"start": i18n("talk")},
            icon="test/test_files/bus.png",
            pulse_color="red",
        )
        with gr.Blocks() as demo:
            webrtc = gr.WebRTC(modality="audio")
            button = gr.Button()
            button.click(lambda: gr.update(stream_options=options), None, webrtc)

        output = await demo.process_api(0, [], state=None)
        sent = json.loads(ORJSONResponse._render_str(output["data"][0]))
        config = gr.WebRTC(modality="audio", stream_options=options).get_config()
        assert sent["stream_options"] == json.loads(
            ORJSONResponse._render_str(config["stream_options"])
        )
        assert sent["stream_options"]["button_labels"]["start"].startswith("__i18n__")
        icon_url = sent["stream_options"]["icon"]["url"]
        assert icon_url.endswith("bus.png")
        assert "test/test_files" not in icon_url
        # Served file data, so an app mounted under a path gets its root added
        from gradio.processing_utils import add_root_url

        mounted = add_root_url(sent, "https://example.com/app", None)
        assert mounted["stream_options"]["icon"]["url"] == (
            f"https://example.com/app{icon_url}"
        )

    @pytest.mark.parametrize(
        "video_bitrate",
        [{"maximum": 4000}, {"min": 0}, {"start": 1.5}, {"min": 2000, "max": 1000}],
    )
    def test_invalid_video_bitrate(self, video_bitrate):
        with pytest.raises(ValueError, match="video_bitrate"):
            gr.WebRTC(video_bitrate=video_bitrate)

    def test_video_bitrate_is_skipped_when_aiortc_internals_change(
        self, monkeypatch, caplog
    ):
        from aiortc.codecs import vpx

        from gradio.webrtc.bitrate import limit_video_encoders

        monkeypatch.delattr(vpx, "MAX_BITRATE")
        sender = SimpleNamespace(track=object(), _RTCRtpSender__encoder=None)
        transceiver = SimpleNamespace(
            kind="video", sender=sender, _codecs=[SimpleNamespace(mimeType="video/VP8")]
        )
        pc = cast(Any, SimpleNamespace(getTransceivers=lambda: [transceiver]))
        limit_video_encoders(pc, {"max": 2000})
        assert sender._RTCRtpSender__encoder is None
        assert "video_bitrate cannot be applied" in caplog.text

    def test_bitrate_hints_go_to_video_codecs_only(self):
        from gradio.webrtc.bitrate import add_bitrate_hints

        sdp = "\r\n".join(
            [
                "v=0",
                "m=audio 9 UDP/TLS/RTP/SAVPF 96",
                "a=rtpmap:96 opus/48000/2",
                "a=fmtp:96 minptime=10",
                "m=video 9 UDP/TLS/RTP/SAVPF 96 97 98",
                "a=rtpmap:96 VP8/90000",
                "a=rtpmap:97 rtx/90000",
                "a=fmtp:97 apt=96",
                "a=rtpmap:98 H264/90000",
                "a=fmtp:98 packetization-mode=1",
                "",
            ]
        )
        assert add_bitrate_hints(sdp, {"min": 1000, "max": 4000}).split("\r\n") == [
            "v=0",
            "m=audio 9 UDP/TLS/RTP/SAVPF 96",
            "a=rtpmap:96 opus/48000/2",
            "a=fmtp:96 minptime=10",
            "m=video 9 UDP/TLS/RTP/SAVPF 96 97 98",
            "a=rtpmap:96 VP8/90000",
            "a=fmtp:96 x-google-min-bitrate=1000;x-google-max-bitrate=4000",
            "a=rtpmap:97 rtx/90000",
            "a=fmtp:97 apt=96",
            "a=rtpmap:98 H264/90000",
            "a=fmtp:98 packetization-mode=1;x-google-min-bitrate=1000;"
            "x-google-max-bitrate=4000",
            "",
        ]

    def test_stream_validation(self):
        with gr.Blocks() as demo:
            slider = gr.Slider()
            audio = gr.WebRTC(modality="audio")
            with pytest.raises(ValueError, match="StreamHandler"):
                audio.stream(flip, inputs=[audio], outputs=[audio])
            with pytest.raises(ValueError, match="copy"):
                audio.stream(SyncHandler(), inputs=[audio], outputs=[audio])
            video = gr.WebRTC()
            with pytest.raises(ValueError, match="first element"):
                video.stream(flip, inputs=[slider], outputs=[video])
            # A set has no order to match the handler's arguments by
            with pytest.raises(TypeError, match="list"):
                video.stream(flip, inputs={video, slider}, outputs=[video])  # type: ignore[arg-type]
            with pytest.raises(TypeError, match="list"):
                video.stream(flip, inputs=[video], outputs={video, slider})  # type: ignore[arg-type]
            with pytest.raises(ValueError, match="VideoStreamHandler"):
                video.stream(EchoHandler, inputs=[video], outputs=[video])
            with pytest.raises(ValueError, match="StreamHandler or AsyncStreamHandler"):
                audio.stream(RecordingVideo, inputs=[audio], outputs=[audio])
            with pytest.raises(ValueError, match="copy"):
                video.stream(RecordingVideo(), inputs=[video], outputs=[video])
            receive = gr.WebRTC(mode="receive")
            # Nothing comes from the page for video_receive() to take
            with pytest.raises(ValueError, match='"send" and "send-receive"'):
                receive.stream(RecordingVideo, outputs=[receive], trigger=slider.change)
            with pytest.raises(ValueError, match="trigger"):
                receive.stream(flip, inputs=[slider], outputs=[receive])
            with pytest.raises(ValueError, match="cannot be one of"):
                receive.stream(flip, inputs=[receive], outputs=[receive])
            receive_audio = gr.WebRTC(mode="receive", modality="audio")
            with pytest.raises(
                ValueError, match='VideoOptions is for modality="video"'
            ):
                receive_audio.stream(
                    VideoOptions(three_frames),
                    outputs=[receive_audio],
                    trigger=slider.change,
                )
            with pytest.raises(ValueError, match="generator function"):
                receive_audio.stream(
                    EchoHandler, outputs=[receive_audio], trigger=slider.change
                )
            stream = video.stream(flip, inputs=[video], outputs=[video])
            # What another event's `cancels=` takes to stop the stream
            assert demo.fns[stream["id"]].connection == "stream"
            # Calling it calls the handler, as for any event listener
            assert stream.fn is flip
            with pytest.raises(ValueError, match="once per WebRTC component"):
                video.stream(flip, inputs=[video], outputs=[video, slider])
        with pytest.raises(AttributeError, match="Blocks context"):
            gr.WebRTC().stream(flip, inputs=[], outputs=[])

    def test_an_rtc_configuration_that_yields_is_refused(self):
        async def credentials():
            yield {"iceServers": []}

        with gr.Blocks():
            webrtc = gr.WebRTC(rtc_configuration=credentials)
            with pytest.raises(ValueError, match="must return a dict"):
                webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])
        with pytest.raises(ValueError, match="must return a dict"):
            gr.Server().webrtc(flip, rtc_configuration=credentials)

    @pytest.mark.parametrize(
        "mode, wrapped, as_object",
        [
            ("send-receive", False, False),
            ("send-receive", True, True),
            ("receive", False, True),
            ("receive", True, False),
        ],
    )
    def test_stream_rejects_async_functions(self, mode, wrapped, as_object):
        async def process(frame):
            return frame

        async def generate():
            yield None

        class Process:
            async def __call__(self, frame):
                return frame

        class Generate:
            async def __call__(self):
                yield None

        if as_object:
            fn = Process() if mode == "send-receive" else Generate()
        else:
            fn = process if mode == "send-receive" else generate
        with gr.Blocks():
            button = gr.Button()
            webrtc = gr.WebRTC(mode=mode)
            # The tracks call the function in a worker thread
            with pytest.raises(ValueError, match="AsyncVideoStreamHandler"):
                webrtc.stream(
                    VideoOptions(fn) if wrapped else fn,
                    inputs=[webrtc] if mode == "send-receive" else None,
                    outputs=[webrtc],
                    trigger=button.click if mode == "receive" else None,
                )

    @pytest.mark.parametrize("modality", ["video", "audio"])
    def test_stream_rejects_a_sync_start_up_in_an_async_handler(self, modality):
        from gradio.webrtc import AsyncStreamHandler

        base = AsyncRecordingVideo if modality == "video" else AsyncStreamHandler

        class Handler(base):  # type: ignore[valid-type, misc]
            async def receive(self, frame):
                pass

            async def emit(self):
                pass

            def start_up(self):  # type: ignore[override]
                pass

        with gr.Blocks():
            webrtc = gr.WebRTC(modality=modality)
            # It would run on the event loop, holding up every other stream
            with pytest.raises(ValueError, match="start_up must be a coroutine"):
                webrtc.stream(Handler, inputs=[webrtc], outputs=[webrtc])

    def test_stream_requires_turn_on_spaces(self, monkeypatch):
        monkeypatch.setenv("SYSTEM", "spaces")
        monkeypatch.setenv("SPACE_ID", "user/space")
        with gr.Blocks():
            webrtc = gr.WebRTC()
            with pytest.raises(ValueError, match="rtc_configuration"):
                webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])
            configured = gr.WebRTC(rtc_configuration={"iceServers": []})
            configured.stream(flip, inputs=[configured], outputs=[configured])

    def test_stream_registers_events(self):
        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            slider = gr.Slider()
            number = gr.Number()
            webrtc.stream(
                flip,
                inputs=[webrtc, slider],
                outputs=[webrtc, number],
                time_limit=30,
                concurrency_limit=None,
            )
            button = gr.Button()
            receive = gr.WebRTC(mode="receive")
            receive.stream(
                VideoOptions(flip, fps=10),
                inputs=[slider],
                outputs=[receive],
                trigger=button.click,
            )

        triggers = {
            (target[0], target[1]): fn
            for fn in demo.fns.values()
            for target in fn.targets
        }
        stream = triggers[(webrtc._id, "stream")]
        assert stream.connection == "stream"
        assert stream.api_visibility == "private"
        assert stream.time_limit == 30
        assert stream.concurrency_limit is None
        assert stream.trigger_mode == "multiple"
        # The component shows the place in line itself, next to its cancel
        # button, rather than a second status in the corner
        assert stream.show_progress == "hidden"
        # The other inputs reach the handler through "tick" and "change"
        assert [i._id for i in stream.inputs] == [webrtc._id]
        assert [o._id for o in stream.outputs] == [webrtc._id, number._id]
        push = triggers[(webrtc._id, "tick")]
        assert push.api_visibility == "private"
        assert push.concurrency_limit is None
        assert [i._id for i in push.inputs] == [webrtc._id, slider._id]
        change = triggers[(slider._id, "change")]
        assert change.name == push.name == "_push_inputs"
        assert change.api_visibility == "private"
        # They only hand values to a running stream, so they take no worker slot
        assert push.queue is False
        assert change.queue is False
        assert (webrtc._id, "state_change") not in triggers

        # In mode="receive" the stream event still carries the connection id
        receive_stream = triggers[(receive._id, "stream")]
        assert [i._id for i in receive_stream.inputs] == [receive._id]
        assert receive_stream.concurrency_limit == "default"
        assert (receive._id, "tick") in triggers
        start = triggers[(button._id, "click")]
        assert start.api_visibility == "private"
        # Only sets the value that starts the stream, so it takes no worker slot
        assert start.queue is False

        assert webrtc.get_config()["time_limit"] == 30
        manager = manager_of(demo, webrtc)
        assert manager.time_limit == 30
        assert manager_of(demo, receive).mode == "receive"

    def test_config_has_stream_only_for_a_component_with_one(self):
        import copy

        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc], time_limit=30)
            # As when a keyed @gr.render component gets the same id in another
            # session, whose render does not call stream()
            other = gr.WebRTC()
        other._id = webrtc._id
        config = webrtc.get_config()
        assert config["has_stream"]
        assert config["time_limit"] == 30
        config = other.get_config()
        assert not config["has_stream"]
        assert config["time_limit"] is None

        # gr.update() gives the session a new instance, with its own id, stored
        # under the original id in the session's blocks
        updated = gr.WebRTC(**cast(Any, {**webrtc.constructor_args, "render": False}))
        assert updated._id != webrtc._id
        session_config = copy.copy(demo.default_config)
        session_config.blocks = {**session_config.blocks, webrtc._id: updated}
        token = LocalContext.blocks_config.set(session_config)
        try:
            config = updated.get_config()
        finally:
            LocalContext.blocks_config.reset(token)
        assert config["has_stream"]
        assert config["time_limit"] == 30
        # Without the session's blocks, the copy knows of no stream
        assert not updated.get_config()["has_stream"]

    @pytest.mark.parametrize("created", ["inside", "outside"])
    def test_stream_is_refused_inside_a_render(self, created):
        import copy

        from gradio.context import LocalContext

        with gr.Blocks() as demo:
            outside = gr.WebRTC()
            count = gr.Number(0)

            @gr.render(inputs=[count])
            def _(n):
                webrtc = gr.WebRTC(key="camera") if created == "inside" else outside
                webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])

        token = LocalContext.blocks_config.set(copy.copy(demo.default_config))
        try:
            # A render runs again whenever its inputs change, which would
            # replace a running stream's event; a page has no use for streams
            # it makes and remakes, since each holds a camera or microphone
            with pytest.raises(ValueError, match="inside a @gr.render"):
                demo.renderables[0].apply(0)
        finally:
            LocalContext.blocks_config.reset(token)

    @pytest.mark.asyncio
    async def test_run_stream_refuses_a_taken_id_and_mismatched_outputs(self):
        from gradio.context import LocalContext
        from gradio.queueing import Queue

        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            number = gr.Number()
            text = gr.Textbox()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc, number, text])
        manager = manager_of(demo, webrtc)
        event = queue_event("event")[0]
        # Keys the app's stream registry, so not a SimpleNamespace
        queue = cast(Any, UnitQueue())
        queue.event_ids_to_events = {"event": event}
        queue.event_queue_per_concurrency_id = {}
        queue.event_handle = lambda event_id: Queue.event_handle(queue, event_id)
        demo._queue = queue
        blocks_token = LocalContext.blocks.set(demo)
        event_token = LocalContext.event_id.set("event")
        try:
            skip = gr.skip()
            # The queue steps the event's run each time the stream wakes it.
            # Its first step admits the stream.
            run = webrtc._run_stream(manager, "abc")
            assert await anext(run) == (skip, skip, skip)
            assert stream_of(manager, "abc").event.id == "event"

            # Another queue event that joins with an id already in use ends at
            # once instead of holding a place it can never use
            other = queue_event("other")[0]
            queue.event_ids_to_events["other"] = other
            other_token = LocalContext.event_id.set("other")
            try:
                values = [x async for x in webrtc._run_stream(manager, "abc")]
                assert values == [(skip, skip, skip)]
            finally:
                LocalContext.event_id.reset(other_token)
            assert other.closed
            assert stream_of(manager, "abc").event.id == "event"

            # The step with an ended stream's last outputs ends the run, so
            # that they go out with the event's completion
            add_outputs(manager, "abc", AdditionalOutputs(5, "e"))
            add_outputs(manager, "abc", AdditionalOutputs(6, "f"))
            end_stream(manager, "abc")
            assert await anext(run) == (skip, 5, "e")
            assert not event.closed
            assert await anext(run) == (skip, 6, "f")
            assert event.closed

            # Ended with nothing pending: the last step changes nothing (a run
            # that just ran out would complete with empty outputs, which the
            # page would apply)
            event.closed = False
            assert await anext(run) == (skip, skip, skip)
            assert event.closed

            # The AdditionalOutputs of a handler must match stream()'s outputs
            third = queue_event("third")[0]
            queue.event_ids_to_events["third"] = third
            third_token = LocalContext.event_id.set("third")
            try:
                mismatched = webrtc._run_stream(manager, "def")
                assert await anext(mismatched) == (skip, skip, skip)
                add_outputs(manager, "def", AdditionalOutputs(4))
                with pytest.raises(ValueError, match="2 outputs besides"):
                    await anext(mismatched)
            finally:
                LocalContext.event_id.reset(third_token)
        finally:
            LocalContext.blocks.reset(blocks_token)
            LocalContext.event_id.reset(event_token)
            watchers = [stream.watcher for stream in streams_of(manager)]
            queue.event_ids_to_events.clear()
            await asyncio.wait_for(asyncio.gather(*watchers), 2)  # type: ignore
        assert not streams_of(manager)


async def make_offer(audio=False, video=False, receive=None):
    """`audio` and `video` are a flag or a number of tracks."""
    pc = RTCPeerConnection()
    channel = pc.createDataChannel("text")
    # What the server says over the data channel, decoded
    pc.messages = []  # type: ignore[attr-defined]
    channel.on("message", lambda m: pc.messages.append(json.loads(m)))  # type: ignore[attr-defined]
    for _ in range(int(audio)):
        pc.addTrack(AudioStreamTrack())
    for _ in range(int(video)):
        pc.addTrack(VideoStreamTrack())
    if receive:
        pc.addTransceiver(receive, direction="recvonly")
    await pc.setLocalDescription(await pc.createOffer())
    return pc


class Harness:
    """Drives a launched app the way the browser does: join the queue with the
    stream event, wait for the turn, then negotiate the peer connection."""

    def __init__(self, demo, local_url, webrtc):
        self.demo = demo
        self.api = f"{local_url.rstrip('/')}{API_PREFIX}"
        self.webrtc = webrtc
        self.manager = manager_of(demo, webrtc)
        self.stream_fn = next(
            fn
            for fn in demo.fns.values()
            if (webrtc._id, "stream") in [tuple(t) for t in fn.targets]
        )
        self.http = httpx2.AsyncClient(timeout=10)
        # The browser session each stream joined from, which the stream's
        # signalling and inputs then come from too
        self.sessions = {}
        # Another streaming gr.WebRTC in the same app, if the test asked for one
        self.second: gr.WebRTC | None = None

    async def join(self, webrtc_id, session_hash=None):
        session_hash = session_hash or webrtc_id
        self.sessions[webrtc_id] = session_hash
        response = await self.http.post(
            f"{self.api}/queue/join",
            json={
                "data": [webrtc_id],
                "fn_index": self.stream_fn._id,
                "session_hash": session_hash,
            },
        )
        return response.json()["event_id"]

    async def push_inputs(self, webrtc_id, *args, session_hash=None):
        """
        Runs the input event that the page fires, from the stream's session.
        It runs on the test's event loop rather than the server's, which is
        fine for reading `latest_args` but cannot wake a track that awaits its
        inputs on an asyncio.Event (receive-mode audio).
        """
        session_hash = session_hash or self.sessions.get(webrtc_id, webrtc_id)
        token = LocalContext.request.set(
            cast(gr.Request, SimpleNamespace(session_hash=session_hash))
        )
        # As in the app's events, which find the app's streams through it
        blocks_token = LocalContext.blocks.set(self.demo)
        try:
            await self.webrtc._push_inputs(webrtc_id, *args)
        finally:
            LocalContext.blocks.reset(blocks_token)
            LocalContext.request.reset(token)

    async def wait_until(self, condition, timeout=5.0):
        deadline = time.monotonic() + timeout
        while not condition():
            if time.monotonic() > deadline:
                pytest.fail("Timed out")
            await asyncio.sleep(0.02)

    async def start(self, webrtc_id):
        event_id = await self.join(webrtc_id)
        await self.wait_until(lambda: has_stream(self.manager, webrtc_id))
        return event_id

    async def offer(self, pc, webrtc_id, session_hash=None, **extra):
        body = {
            "sdp": pc.localDescription.sdp,
            "type": pc.localDescription.type,
            **extra,
        }
        if webrtc_id is not None:
            body["webrtc_id"] = webrtc_id
        session_hash = session_hash or self.sessions.get(webrtc_id, "session")
        return await self.signal("offer", body, session_hash)

    async def signal(self, route, body, session_hash="session"):
        response = await self.http.post(
            f"{self.api}/webrtc/{route}",
            json={**body, "session_hash": session_hash},
        )
        assert response.status_code == 200
        return response.json()

    async def connect(self, pc, webrtc_id):
        answer = await self.offer(pc, webrtc_id)
        assert answer["type"] == "answer", answer
        await pc.setRemoteDescription(
            RTCSessionDescription(answer["sdp"], answer["type"])
        )
        return answer

    async def messages(self, session_hash, until, timeout=10.0):
        """Reads the session's queue messages until `until(messages)` holds."""
        received = []

        async def read():
            async with self.http.stream(
                "GET", f"{self.api}/queue/data", params={"session_hash": session_hash}
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data:"):
                        received.append(json.loads(line[5:]))
                        if until(received):
                            return

        await asyncio.wait_for(read(), timeout)
        return received

    def event_running(self, event_id):
        worker = getattr(self.demo, "_process_worker", None)
        if worker is not None:
            # The gateway's queue tells this process when the event ends
            return event_id in worker.event_handles
        return event_id in self.demo._queue.event_ids_to_events

    def handler(self, webrtc_id):
        """The handler instance of a stream, which all its tracks share."""
        return tracks_of(self.manager, webrtc_id)[0].event_handler


def completed(messages):
    return any(m.get("msg") == "process_completed" for m in messages)


def forget_earlier_streams() -> None:
    # Tests reuse stream ids, and a stream an earlier test left open stays in
    # its app's registry after the app is closed
    webrtc_connection._registries.clear()


class UnitQueue:
    """Stands in for an app's queue, which keys its stream registry."""


# The queue of streams that tests admit without an app (see `unit_registry`)
_unit_queue = UnitQueue()


def unit_registry():
    """The stream registry for tests that admit streams without an app."""
    return webrtc_connection.registry_for(_unit_queue)


def _all_streams():
    for registry in list(webrtc_connection._registries.values()):
        yield from list(registry.streams.values())


# Tests read and set a stream and its connection only through these, not
# through the manager's attributes, so that how streams are kept can change
def stream_of(manager, webrtc_id):
    """The admitted stream `webrtc_id` of `manager`, until its watcher ends."""
    for stream in _all_streams():
        if stream.id == webrtc_id and stream.manager is manager:
            return stream
    raise KeyError(webrtc_id)


def has_stream(manager, webrtc_id):
    """Whether `manager` has the stream `webrtc_id`, until its watcher ends."""
    return any(
        stream.id == webrtc_id and stream.manager is manager
        for stream in _all_streams()
    )


def streams_of(manager):
    """The streams `manager` has admitted and whose watcher has not ended."""
    return [stream for stream in _all_streams() if stream.manager is manager]


def pending_candidates(webrtc_id):
    """The ICE candidates kept for a stream until its offer, or None."""
    for registry in list(webrtc_connection._registries.values()):
        if webrtc_id in registry.pending_candidates:
            return registry.pending_candidates[webrtc_id]
    return None


def end_stream(manager, webrtc_id):
    """Ends the stream as the page's close, its time limit, its closed peer
    connection or an ended track does, releasing its tracks and handler."""
    stream_of(manager, webrtc_id).close()


def add_outputs(manager, webrtc_id, *outputs):
    """Hands the stream AdditionalOutputs as its handler does."""
    stream = stream_of(manager, webrtc_id)
    for output in outputs:
        stream.add_output(output)


def live_pc(manager, webrtc_id):
    """The stream's peer connection, until the stream's clean-up releases it."""
    if not has_stream(manager, webrtc_id):
        return None
    return stream_of(manager, webrtc_id).pc


def tracks_of(manager, webrtc_id):
    """The tracks of the stream's connection, until its clean-up releases them."""
    if not has_stream(manager, webrtc_id):
        return []
    return stream_of(manager, webrtc_id).tracks


def unit_stream(manager, webrtc_id, event=None, **attributes):
    """
    A stream of `manager` in `unit_registry()`, as an admission makes it but
    without its watcher, for tests of what a stream does by itself.
    """
    stream = webrtc_connection.Stream(
        webrtc_id, manager, event or queue_event()[1], unit_registry()
    )
    for name, value in attributes.items():
        setattr(stream, name, value)
    unit_registry().add(stream)
    return stream


def attach(manager, webrtc_id, *, pc=None, tracks=()):
    """
    Gives a stream a connection with these tracks without signalling, for
    tests of its clean-up. Admits the stream first if nothing did.
    """
    if not has_stream(manager, webrtc_id):
        unit_stream(manager, webrtc_id)
    stream = stream_of(manager, webrtc_id)
    if stream.pc is None:
        # A stand-in that needs no closing
        stream.pc = (
            pc
            if pc is not None
            else cast(Any, SimpleNamespace(connectionState="closed"))
        )
    stream.tracks.extend(tracks)


class TestStreams:
    @pytest_asyncio.fixture
    async def launched(self, request, monkeypatch):
        monkeypatch.setattr(webrtc_connection, "ADMISSION_WAIT", 0.5)
        forget_earlier_streams()
        params = dict(getattr(request, "param", {}))
        handler = params.pop("handler", flip)
        stream_kwargs = params.pop("stream_kwargs", {})
        second_kwargs = params.pop("second", None)
        executor = getattr(request.cls, "executor", "thread")
        with gr.Blocks() as demo:
            webrtc = gr.WebRTC(**params)
            slider = gr.Slider()
            number = gr.Number()
            if webrtc.mode == "receive":
                button = gr.Button()
                webrtc.stream(
                    handler,
                    inputs=[slider],
                    outputs=[webrtc],
                    trigger=button.click,
                    **stream_kwargs,
                )
            else:
                webrtc.stream(
                    handler,
                    inputs=[webrtc, slider],
                    outputs=[webrtc, number],
                    **stream_kwargs,
                )
            if second_kwargs is not None:
                second = gr.WebRTC(**second_kwargs)
                second.stream(flip, inputs=[second], outputs=[second])
        with closing(demo):
            # Most tests read the queue's events, which are in this process
            # only with threads (see TestStreamsWithProcesses)
            _, local_url, _ = demo.launch(prevent_thread_lock=True, executor=executor)
            harness = Harness(demo, local_url, webrtc)
            if second_kwargs is not None:
                harness.second = second
            try:
                yield harness
            finally:
                await harness.http.aclose()
                # Let the server finish closing the test's connections before
                # it stops, so that no close is left halfway. Watchers run for
                # as long as their stream's event, which a test may leave open.
                manager = harness.manager
                deadline = time.monotonic() + 5
                while time.monotonic() < deadline:
                    watchers = {s.watcher for s in list(streams_of(manager))}
                    if not any(
                        not task.done() and task not in watchers
                        for task in list(manager.tasks)
                    ):
                        break
                    await asyncio.sleep(0.02)

    @pytest.mark.asyncio
    async def test_video_offer_gets_answer_once_admitted(self, launched):
        h = launched
        await h.start("one")
        pc = await make_offer(video=True)
        answer = await h.connect(pc, "one")
        assert "m=video" in answer["sdp"]
        assert "webrtc-datachannel" in answer["sdp"]
        assert answer["time_limit"] is None
        # video_bitrate is off by default
        assert "x-google" not in answer["sdp"]
        assert live_pc(h.manager, "one") is not None
        await pc.close()

    @pytest.mark.asyncio
    async def test_a_turn_needs_no_worker_thread(self, launched):
        h = launched
        # The page connects as soon as the stream's event starts, and the
        # offer waits only a few seconds for the admission in its first call.
        # A preprocess would wait for a worker thread first, which the app's
        # other handlers may all hold.
        thread_calls = []
        original = anyio.to_thread.run_sync

        async def counting(fn, *args, **kwargs):
            if isinstance(getattr(fn, "__self__", None), gr.WebRTC):
                thread_calls.append(fn.__name__)
            return await original(fn, *args, **kwargs)

        with patch.object(anyio.to_thread, "run_sync", counting):
            await h.start("one")
            pc = await make_offer(video=True)
            await h.connect(pc, "one")
        assert thread_calls == []
        await pc.close()

    @staticmethod
    def toast(message):
        """The toast a page shows for a queue message, as the frontend makes it
        (a log message, or the error an event failed with), or None."""
        if message.get("msg") == "log":
            return {
                "type": message["level"],
                "message": message["log"],
                "title": message.get("title"),
            }
        if message.get("msg") == "process_completed" and not message["success"]:
            output = message["output"]
            return {
                "type": "error",
                "message": output.get("error"),
                "title": output.get("title"),
                "visible": output.get("visible", True),
            }
        return None

    async def stream_until_message(self, h, pc, type_):
        """Streams until the stream's queue event brings a toast of `type_`."""
        await h.start("one")
        await h.connect(pc, "one")
        await h.wait_until(lambda: stream_of(h.manager, "one").connected)
        # The handler runs once the page has sent the input values
        await h.push_inputs("one", 0.2)

        def toasts(messages):
            return [
                toast
                for m in messages
                if (toast := self.toast(m)) and toast["type"] == type_
            ]

        messages = await h.messages("one", toasts)
        return toasts(messages)[0]

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"handler": fail_with_gr_error}], indirect=True
    )
    async def test_gr_error_in_the_handler_is_shown_and_ends_the_stream(self, launched):
        h = launched
        pc = await make_offer(video=True)
        # The stream's event fails with it, which the page shows (once) and
        # which runs .failure()
        message = await self.stream_until_message(h, pc, "error")
        assert message["message"] == "Bad frame"
        assert message["title"] == "Oops"
        assert message["visible"] is True
        await h.wait_until(lambda: live_pc(h.manager, "one") is None)
        # Nothing went over the data channel
        assert not [m for m in pc.messages if m["type"] == "error"]
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize("show_error", [False, True])
    @pytest.mark.parametrize(
        "launched, offer",
        [
            ({"handler": fail_with_value_error}, {"video": True}),
            # Sync emit() and receive-mode audio generators run in executor
            # threads
            ({"modality": "audio", "handler": ValueErrorOnEmit}, {"audio": True}),
            (
                {
                    "mode": "receive",
                    "modality": "audio",
                    "handler": value_error_then_audio,
                },
                {"receive": "audio"},
            ),
        ],
        indirect=["launched"],
    )
    async def test_other_errors_are_shown_only_with_show_error(
        self, launched, offer, show_error
    ):
        h = launched
        h.demo.show_error = show_error
        pc = await make_offer(**offer)
        message = await self.stream_until_message(h, pc, "error")
        # Without show_error, no message, as for any event: the page then
        # shows its generic text ("" would show an empty toast)
        assert message["message"] == ("internal detail" if show_error else None)
        assert message["title"] == "Error"
        await h.wait_until(lambda: live_pc(h.manager, "one") is None)
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize("launched", [{"handler": warn}], indirect=True)
    async def test_gr_warning_in_the_handler_is_shown(self, launched):
        h = launched
        pc = await make_offer(video=True)
        live_at_warning = []

        def warned(messages):
            toasts = [self.toast(m) for m in messages]
            # The handler warns with every frame: a second warning shows that
            # the stream went on after the first
            if sum(1 for t in toasts if t and t["type"] == "warning") < 2:
                return False
            # Read while the page is still there: once it stops reading its
            # messages, the queue drops its events, which ends the stream
            live_at_warning.append(live_pc(h.manager, "one") is not None)
            return True

        await h.start("one")
        await h.connect(pc, "one")
        await h.wait_until(lambda: stream_of(h.manager, "one").connected)
        await h.push_inputs("one", 0.2)
        messages = await h.messages("one", warned)
        warning = next(
            t for m in messages if (t := self.toast(m)) and t["type"] == "warning"
        )
        assert warning["message"] == "Careful"
        # A warning does not end the stream
        assert live_at_warning == [True]
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched, offer",
        [
            # Sync emit() and receive-mode audio generators run in executor
            # threads
            ({"modality": "audio", "handler": InfoOnEmit}, {"audio": True}),
            (
                {"mode": "receive", "modality": "audio", "handler": info_then_audio},
                {"receive": "audio"},
            ),
        ],
        indirect=["launched"],
    )
    async def test_gr_info_in_audio_handler_threads_is_shown(self, launched, offer):
        h = launched
        pc = await make_offer(**offer)
        message = await self.stream_until_message(h, pc, "info")
        assert message["message"].startswith("From ")
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched, tracks",
        [
            ({"handler": needs_request}, {"video": True}),
            ({"modality": "audio", "handler": StartsWithRequest}, {"audio": True}),
        ],
        indirect=["launched"],
    )
    async def test_handlers_can_take_the_request(self, launched, tracks):
        h = launched
        seen_requests.clear()
        await h.start("one")
        pc = await make_offer(**tracks)
        await h.connect(pc, "one")
        await h.wait_until(lambda: stream_of(h.manager, "one").connected)
        await h.push_inputs("one", 0.2)
        await h.wait_until(lambda: bool(seen_requests))
        assert isinstance(seen_requests[0], gr.Request)
        assert seen_requests[0].headers["host"]
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"video_bitrate": {"min": 1000, "start": 1500, "max": 4000}}],
        indirect=True,
    )
    async def test_video_bitrate_applies_in_both_directions(self, launched):
        h = launched
        await h.start("one")
        pc = await make_offer(video=True)
        answer = await h.connect(pc, "one")
        # The video the browser sends
        assert (
            "x-google-min-bitrate=1000;x-google-start-bitrate=1500;"
            "x-google-max-bitrate=4000" in answer["sdp"]
        )
        # The video the server sends back
        (sender,) = [s for s in live_pc(h.manager, "one").getSenders() if s.track]
        encoder = sender._RTCRtpSender__encoder
        assert encoder.target_bitrate == 1_500_000
        encoder.target_bitrate = 10_000_000
        assert encoder.target_bitrate == 4_000_000
        encoder.target_bitrate = 1
        assert encoder.target_bitrate == 1_000_000
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize("mirror", [True, False])
    async def test_the_offer_says_whether_the_webcam_is_mirrored(
        self, launched, mirror
    ):
        h = launched
        await h.start("one")
        pc = await make_offer(video=True)
        answer = await h.offer(pc, "one", mirror=mirror)
        assert answer["type"] == "answer"
        assert tracks_of(h.manager, "one")[0].mirror is mirror
        await pc.close()

    @pytest.mark.asyncio
    async def test_offer_without_a_turn_is_rejected(self, launched):
        h = launched
        pc = await make_offer(video=True)
        response = await h.offer(pc, "stranger")
        assert response["meta"]["error"] == "not_admitted"
        assert live_pc(h.manager, "stranger") is None
        await pc.close()

    @pytest.mark.asyncio
    async def test_further_streams_wait_for_their_turn(self, launched):
        h = launched
        first_event = await h.start("one")
        second_event = await h.join("two")
        await asyncio.sleep(0.5)
        assert not has_stream(h.manager, "two")
        line = h.demo._queue.event_queue_per_concurrency_id[
            h.stream_fn.concurrency_id
        ].queue
        assert [event._id for event in line] == [second_event]

        first = await make_offer(video=True)
        await h.connect(first, "one")
        await h.wait_until(lambda: stream_of(h.manager, "one").connected)
        await first.close()
        # The first stream ends with its connection, and the second gets in
        await h.wait_until(lambda: not h.event_running(first_event))
        await h.wait_until(lambda: has_stream(h.manager, "two"))
        assert h.event_running(second_event)

    @pytest.mark.asyncio
    async def test_closing_the_stream_delivers_every_pending_output(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        # Outputs the queue has not delivered yet, e.g. while workers are busy
        stream_of(h.manager, "one").outputs.extend(
            AdditionalOutputs(n) for n in (1, 2, 3)
        )
        await h.http.post(f"{h.api}/stream/{event_id}/close")
        messages = await h.messages("one", completed)
        delivered = [
            m["output"]["data"][1]
            for m in messages
            if m.get("msg") in ("process_streaming", "process_completed")
            and isinstance(m["output"]["data"][1], int | float)
        ]
        assert delivered == [1, 2, 3]
        assert messages[-1]["success"] is True
        # And the connection closes
        await h.wait_until(lambda: live_pc(h.manager, "one") is None)
        await h.wait_until(lambda: not has_stream(h.manager, "one"))
        await pc.close()

    @pytest.mark.asyncio
    async def test_closing_a_stream_whose_handler_just_failed_fails_it(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        errors = stream_of(h.manager, "one").errors
        assert errors is not None
        # The handler failed, and the stream has not ended yet
        errors.failure = {"error": "Bad frame", "title": "Oops", "visible": False}
        await h.http.post(f"{h.api}/stream/{event_id}/close")
        messages = await h.messages("one", completed)
        completion = next(m for m in messages if m["msg"] == "process_completed")
        assert completion["success"] is False
        assert completion["output"]["error"] == "Bad frame"
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize("duration", [3, None])
    async def test_a_handler_error_before_the_data_channel_opens_is_shown(
        self, launched, duration
    ):
        h = launched
        await h.start("one")
        pc = await make_offer(video=True)
        # The page never applies the answer, so the data channel never opens
        assert (await h.offer(pc, "one"))["type"] == "answer"
        errors = stream_of(h.manager, "one").errors
        assert errors is not None
        errors.fail(gr.Error("Sign in first", duration=duration))
        messages = await h.messages("one", completed)
        completion = next(m for m in messages if m["msg"] == "process_completed")
        assert completion["success"] is False
        assert completion["output"]["error"] == "Sign in first"
        assert completion["output"]["visible"] is True
        assert completion["output"]["duration"] == duration
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"stream_kwargs": {"time_limit": 1}}], indirect=True
    )
    async def test_time_limit_ends_the_event_and_the_connection(self, launched):
        h = launched
        # Made before the admission, from which the time limit counts
        pc = await make_offer(video=True)
        event_id = await h.start("one")
        answer = await h.connect(pc, "one")
        assert 0 < answer["time_limit"] <= 1
        started = time.monotonic()
        errors = stream_of(h.manager, "one").errors
        assert errors is not None
        errors.failure = {"error": "Bad frame", "visible": False}
        # No frames wake the event, so the queue would end it at its time
        # limit itself, without the call that reports the failure
        messages = await h.messages("one", completed)
        assert messages[-1]["success"] is False
        await h.wait_until(lambda: not h.event_running(event_id), timeout=5)
        # At its time limit, not after a timeout of the queue or the connection
        assert time.monotonic() - started < 4
        await h.wait_until(lambda: live_pc(h.manager, "one") is None)
        await pc.close()

    @pytest.mark.asyncio
    async def test_admitted_stream_that_never_connects_gives_up(
        self, launched, monkeypatch
    ):
        h = launched
        monkeypatch.setattr(webrtc_connection, "CONNECT_TIMEOUT", 0.5)
        event_id = await h.start("one")
        await h.wait_until(lambda: not h.event_running(event_id))
        await h.wait_until(lambda: not has_stream(h.manager, "one"))

    @pytest.mark.asyncio
    async def test_a_quiet_stream_keeps_its_turn(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        # Its event is a lease: nothing has to wake it to keep it running
        assert h.stream_fn.lease
        await asyncio.sleep(1.5)
        assert h.event_running(event_id)
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"handler": lambda frame, x: (frame, AdditionalOutputs(x * 2))}],
        indirect=True,
    )
    async def test_additional_outputs_reach_the_other_outputs(self, launched):
        h = launched
        await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        await h.push_inputs("one", 21)

        def got_output(ms):
            return any(
                m.get("msg") == "process_streaming" and m["output"]["data"][1] == 42
                for m in ms
            )

        messages = await h.messages("one", got_output, timeout=15)
        streamed = next(m for m in messages if got_output([m]))
        assert streamed["output"]["data"][0]["__type__"] == "update"
        await pc.close()

    @pytest.mark.asyncio
    async def test_the_chunk_route_refuses_a_webrtc_stream(self, launched):
        h = launched
        event_id = await h.start("one")
        # Media comes over the peer connection and inputs by their own
        # events: a chunk would only wake a step that ignores it. Nor can a
        # chunk with a new stream id get a second stream through one place in
        # the concurrency limit.
        response = await h.http.post(
            f"{h.api}/stream/{event_id}",
            json={
                "data": ["two"],
                "fn_index": h.stream_fn._id,
                "session_hash": "one",
                "event_id": event_id,
            },
        )
        assert response.status_code == 404
        assert h.event_running(event_id)
        assert not has_stream(h.manager, "two")

    @pytest.mark.asyncio
    async def test_a_stream_stopped_while_it_connects_ends_as_stopped(
        self, launched, caplog
    ):
        h = launched
        event_id = await h.start("one")
        original = RTCPeerConnection.setRemoteDescription

        async def stopped_meanwhile(pc, description):
            await original(pc, description)
            # The page's Stop (or the time limit, or cancels=) lands while
            # the server awaits inside the setup
            await h.http.post(f"{h.api}/stream/{event_id}/close")

        with patch.object(RTCPeerConnection, "setRemoteDescription", stopped_meanwhile):
            pc = await make_offer(video=True)
            response = await h.offer(pc, "one")
        assert response["meta"]["error"] == "not_admitted"
        messages = await h.messages("one", completed)
        completion = next(m for m in messages if m.get("msg") == "process_completed")
        # A stream that had its turn and was stopped ends as a success
        assert completion["success"] is True
        assert "Could not set up the stream" not in caplog.text
        await pc.close()

    @pytest.mark.asyncio
    async def test_a_handler_that_fails_while_the_stream_connects_keeps_its_error(
        self, launched, caplog
    ):
        h = launched
        await h.start("one")
        original = RTCPeerConnection.setRemoteDescription

        async def handler_fails_meanwhile(pc, description):
            await original(pc, description)
            # A handler started by on_track (send mode's start_up) fails while
            # the server is still setting up, which closes the connection
            stream_of(h.manager, "one").errors.fail(gr.Error("No GPU left"))
            await pc.close()

        with patch.object(
            RTCPeerConnection, "setRemoteDescription", handler_fails_meanwhile
        ):
            pc = await make_offer(video=True)
            response = await h.offer(pc, "one")
        assert response["meta"]["error"] == "setup_failed"
        assert response["meta"]["message"] == "No GPU left"
        messages = await h.messages("one", completed)
        completion = next(m for m in messages if m.get("msg") == "process_completed")
        assert completion["success"] is False
        assert completion["output"]["error"] == "No GPU left"
        assert "Could not set up the stream" not in caplog.text
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched, offer",
        [
            # A track of a kind the stream does not take
            ({"modality": "audio", "handler": EchoHandler}, {"video": True}),
            # A second track of a kind: one handler takes one track of each
            ({}, {"video": 2}),
            # E.g. client.webrtc() given media for a receive-only endpoint
            (
                {"mode": "receive", "handler": VideoOptions(flip, fps=5)},
                {"video": True},
            ),
        ],
        indirect=["launched"],
    )
    async def test_a_track_the_stream_cannot_use_is_rejected(self, launched, offer):
        h = launched
        await h.start("one")
        # Nothing would read the track, and aiortc would keep its decoded
        # frames without a bound
        pc = await make_offer(**offer)
        response = await h.offer(pc, "one")
        assert response["status"] == "failed"
        assert response["meta"]["error"] == "unsupported_track"
        assert live_pc(h.manager, "one") is None
        messages = await h.messages("one", completed)
        completion = next(m for m in messages if m["msg"] == "process_completed")
        assert completion["success"] is False
        # The page shows it as the event's error, not from the answer
        assert completion["output"]["visible"] is True
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize("launched", [{"allow_extra_tracks": True}], indirect=True)
    async def test_extra_tracks_allowed_are_read_and_dropped(self, launched):
        h = launched
        await h.start("one")
        # A track of another kind, and a second video track
        pc = await make_offer(audio=True, video=2)
        assert (await h.offer(pc, "one"))["type"] == "answer"
        audio, _, second = (r.track for r in live_pc(h.manager, "one").getReceivers())
        assert (audio.kind, second.kind) == ("audio", "video")
        await asyncio.sleep(0.1)
        # One handler track, not one per incoming track; the others are read
        # and dropped: aiortc queues every frame it decodes until the track is
        # read, without a bound
        assert len(tracks_of(h.manager, "one")) == 1
        assert [len(t._queue._getters) for t in (audio, second)] == [1, 1]
        await pc.close()

    @pytest.mark.asyncio
    async def test_duplicate_id_and_invalid_offers(self, launched):
        h = launched
        await h.start("one")
        first = await make_offer(video=True)
        second = await make_offer(video=True)
        assert (await h.offer(first, "one"))["type"] == "answer"
        duplicate = await h.offer(second, "one")
        assert duplicate["meta"]["error"] == "connection_already_exists"
        assert (await h.offer(first, None))["meta"]["error"] == "invalid_offer"
        candidate = await h.signal(
            "offer",
            {
                "type": "ice-candidate",
                "webrtc_id": "one",
                "candidate": {"candidate": "not a candidate"},
            },
            session_hash="one",
        )
        assert candidate["meta"]["error"] == "invalid_candidate_format"
        for pc in (first, second):
            await pc.close()

    @pytest.mark.asyncio
    async def test_only_the_admitted_session_can_use_a_stream(self, launched):
        h = launched
        await h.start("one")
        # Another page that knows the id can neither take the stream over...
        intruder = await make_offer(video=True)
        rejected = await h.offer(intruder, "one", session_hash="intruder")
        assert rejected["meta"]["error"] == "not_admitted"
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        # ...nor add candidates to its connection...
        candidate = await h.signal(
            "offer",
            {
                "type": "ice-candidate",
                "webrtc_id": "one",
                "candidate": {
                    "candidate": "candidate:1 1 udp 1 127.0.0.1 9 typ host",
                    "sdpMid": "0",
                    "sdpMLineIndex": 0,
                },
            },
            session_hash="intruder",
        )
        assert candidate["meta"]["error"] == "unknown_connection"
        # ...nor feed its handler, which has nothing from the time the user
        # clicked: it asks the page
        assert tracks_of(h.manager, "one")[0].latest_args is None
        await h.push_inputs("one", 0.2)
        await h.push_inputs("one", 0.9, session_hash="intruder")
        assert tracks_of(h.manager, "one")[0].latest_args == [0.2]
        for connection in (intruder, pc):
            await connection.close()

    @pytest.mark.asyncio
    async def test_only_a_stream_with_its_turn_gets_the_rtc_configuration(
        self, launched
    ):
        h = launched

        async def ask(webrtc_id, session_hash):
            return await h.signal(
                "rtc_configuration", {"webrtc_id": webrtc_id}, session_hash
            )

        # TURN credentials may be billed to the app's owner, so the queue's
        # limits must decide who gets them
        assert "error" in await ask("nobody", "nobody")
        await h.start("one")
        assert await ask("one", "one") == {}
        assert "error" in await ask("one", "intruder")
        # Nor once the turn is over, while its event still finishes
        end_stream(h.manager, "one")
        assert "error" in await ask("one", "one")

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [
            {
                "rtc_configuration": issue_credentials,
                "second": {"rtc_configuration": {"iceServers": [{"urls": "turn:x"}]}},
            }
        ],
        indirect=True,
    )
    async def test_a_stream_gets_its_own_rtc_configuration_issued_once(self, launched):
        h = launched
        issued_credentials.clear()
        await h.start("one")
        answers = [
            await h.signal("rtc_configuration", {"webrtc_id": "one"}, "one")
            for _ in range(3)
        ]
        # Its own component's, not the other one's TURN servers. Asking again
        # within the turn does not issue more credentials on the app owner's
        # account.
        assert answers == [{"iceServers": [{"urls": "turn:1"}]}] * 3
        assert len(issued_credentials) == 1

    @pytest.mark.asyncio
    async def test_wait_for_args_asks_the_page_only_until_values_arrive(self):
        sent = []
        handler = EchoHandler()
        handler.set_channel(cast(Any, SimpleNamespace(send=sent.append)))
        waiting = asyncio.create_task(handler.wait_for_args())
        await asyncio.sleep(0.01)
        assert len(sent) == 1 and not waiting.done()
        handler.set_args([1])
        await asyncio.wait_for(waiting, 1)
        # Handlers may call it with every frame, as FastRTC's docs suggest;
        # each change of an input updates latest_args anyway
        for _ in range(3):
            await asyncio.wait_for(handler.wait_for_args(), 1)
        assert len(sent) == 1

    @pytest.mark.asyncio
    async def test_a_wait_for_admission_outlives_another_that_gave_up(
        self, monkeypatch
    ):
        monkeypatch.setattr(webrtc_connection, "ADMISSION_WAIT", 0.3)
        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])
        manager = manager_of(demo, webrtc)
        registry = unit_registry()
        wait = registry.wait_for_admission
        # Both the offer and get_rtc_configuration may wait for the turn
        first = asyncio.create_task(wait("late"))
        await asyncio.sleep(0.2)
        second = asyncio.create_task(wait("late"))
        assert await first is None
        manager.admit("late", queue_event("late")[1], registry)
        try:
            admitted = await second
            assert admitted is not None and admitted.manager is manager
        finally:
            for task in list(manager.tasks):
                task.cancel()
            await asyncio.gather(*manager.tasks, return_exceptions=True)

    @pytest.mark.asyncio
    @pytest.mark.parametrize("end", ["disconnect", "cancel"])
    @pytest.mark.parametrize(
        "launched", [{"modality": "audio", "handler": SlowShutdown()}], indirect=True
    )
    async def test_the_next_handler_waits_for_the_last_one_to_shut_down(
        self, launched, end, monkeypatch
    ):
        h = launched
        SlowShutdown.log.clear()
        if end == "cancel":
            # Whatever notices the end of a cancelled stream must not be a poll
            # that comes after the next stream's offer
            monkeypatch.setattr(webrtc_connection, "WATCH_INTERVAL", 5)
        event_id = await h.start("one")
        first = await make_offer(audio=True)
        await h.connect(first, "one")
        server_pc = live_pc(h.manager, "one")
        await h.wait_until(lambda: stream_of(h.manager, "one").connected)
        await h.join("two")
        # The queue gives the slot to "two" before the handler of "one" has
        # shut down; a model loaded per handler must not be in memory twice
        if end == "cancel":
            # What the page sends for `stop.click(None, cancels=[stream])`: the
            # queue frees the slot at once
            await h.http.post(
                f"{h.api}/cancel",
                json={
                    "event_id": event_id,
                    "session_hash": "one",
                    "fn_index": h.stream_fn._id,
                },
            )
        else:
            await first.close()
        await h.wait_until(lambda: has_stream(h.manager, "two"), timeout=10)
        second = await make_offer(audio=True)
        await h.connect(second, "two")
        assert SlowShutdown.log[:4] == [
            "created",
            "shutdown begins",
            "shutdown ends",
            "created",
        ]
        await h.wait_until(lambda: server_pc.connectionState == "closed")
        await h.wait_until(lambda: not h.event_running(event_id))
        await first.close()
        # Closed before it connects, the stream would end only at the connect
        # timeout, and its shutdown would land in a later test's log
        await h.wait_until(lambda: stream_of(h.manager, "two").connected)
        await second.close()
        await h.wait_until(lambda: SlowShutdown.log.count("shutdown ends") == 2)

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [
            {
                "modality": "audio",
                "handler": SlowShutdown(),
                "stream_kwargs": {"concurrency_limit": 2},
            }
        ],
        indirect=True,
    )
    async def test_with_room_for_more_streams_the_next_one_does_not_wait(
        self, launched
    ):
        h = launched
        SlowShutdown.log.clear()
        await h.start("one")
        first = await make_offer(audio=True)
        await h.connect(first, "one")
        await h.wait_until(lambda: stream_of(h.manager, "one").connected)
        await first.close()
        await h.wait_until(lambda: "shutdown begins" in SlowShutdown.log)
        await h.start("two")
        second = await make_offer(audio=True)
        await h.connect(second, "two")
        await h.wait_until(lambda: "shutdown ends" in SlowShutdown.log)
        # Waiting keeps a model per handler from being loaded twice when one
        # stream runs at a time; with room for two it would only delay this one
        assert SlowShutdown.log[:4] == [
            "created",
            "shutdown begins",
            "created",
            "shutdown ends",
        ]
        await h.wait_until(lambda: stream_of(h.manager, "two").connected)
        await second.close()
        await h.wait_until(lambda: SlowShutdown.log.count("shutdown ends") == 2)

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"modality": "audio", "handler": RequestOnEmit}], indirect=True
    )
    async def test_a_sync_emit_sees_the_visitor_request(self, launched):
        h = launched
        RequestOnEmit.seen.clear()
        await h.start("one")
        pc = await make_offer(audio=True)
        await h.connect(pc, "one")
        # e.g. for a @spaces.GPU call, which reads the visitor's ZeroGPU headers
        await h.wait_until(lambda: len(RequestOnEmit.seen) > 0)
        assert RequestOnEmit.seen[-1] == "one"
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"modality": "audio", "handler": FailsToStart}], indirect=True
    )
    async def test_a_stream_whose_handler_cannot_start_ends_with_its_error(
        self, launched
    ):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(audio=True)
        response = await h.offer(pc, "one")
        assert response["meta"] == {
            "error": "setup_failed",
            "message": "Model not found",
        }
        assert live_pc(h.manager, "one") is None
        messages = await h.messages("one", completed)
        completion = next(m for m in messages if m["msg"] == "process_completed")
        assert completion["success"] is False
        # The page shows it as the event's error, not from the answer
        assert completion["output"]["visible"] is True
        await h.wait_until(lambda: not h.event_running(event_id), timeout=10)
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"stream_kwargs": {"time_limit": 600}}], indirect=True
    )
    # 5: an id that is not a string, which signalling could never match
    @pytest.mark.parametrize("webrtc_id", [None, 5])
    async def test_a_stream_event_without_an_id_does_not_hold_the_slot(
        self, launched, webrtc_id
    ):
        h = launched
        await h.join(webrtc_id, session_hash="no-id")
        # Nothing would wake it before its time limit if it stayed
        await h.messages("no-id", completed, timeout=5)
        await h.start("one")

    @pytest.mark.asyncio
    async def test_inputs_reach_connection_made_through_session_copy(self, launched):
        h = launched
        # A gr.update() on the component gives the session a new instance with
        # its own id, stored under the original id (see
        # Blocks.postprocess_data). The stream still finds its manager.
        webrtc = h.webrtc
        session = h.demo.server_app.state_holder["one"]
        session[webrtc._id] = webrtc.__class__(
            **{**webrtc.constructor_args, "render": False}
        )
        replacement = session[webrtc._id]
        assert replacement is not webrtc
        assert replacement._id != webrtc._id
        await h.start("one")
        assert await h.signal("rtc_configuration", {"webrtc_id": "one"}, "one") == {}
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        await h.push_inputs("one", 0.5)
        track = tracks_of(h.manager, "one")[0]
        assert track.latest_args == [0.5]
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [
            {
                "modality": "audio",
                "handler": EchoHandler,
                "stream_kwargs": {"concurrency_limit": 2},
            }
        ],
        indirect=True,
    )
    async def test_handler_class_instantiated_per_connection(self, launched):
        h = launched
        await h.start("one")
        await h.start("two")
        first = await make_offer(audio=True)
        second = await make_offer(audio=True)
        assert (await h.offer(first, "one"))["type"] == "answer"
        assert (await h.offer(second, "two"))["type"] == "answer"
        assert isinstance(h.handler("one"), EchoHandler)
        assert h.handler("one") is not h.handler("two")
        for pc in (first, second):
            await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"mode": "receive", "handler": VideoOptions(flip, fps=5)}],
        indirect=True,
    )
    async def test_receive_mode_adds_server_track(self, launched):
        h = launched
        await h.start("one")
        pc = await make_offer(receive="video")
        answer = await h.offer(pc, "one")
        assert answer["type"] == "answer"
        assert "a=sendonly" in answer["sdp"]
        track = tracks_of(h.manager, "one")[0]
        assert track.fps == 5
        # The generator starts with the values the page sends when asked
        assert not track.args_set.is_set()
        await h.push_inputs("one", 3)
        assert track.latest_args == [3]
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched, offer",
        [
            (
                {"handler": lambda frame, *args: CloseStream("done")},
                {"video": True},
            ),
            # Nothing plays back in "send", but CloseStream still ends it
            (
                {"modality": "audio", "mode": "send", "handler": CloseOnEmit},
                {"audio": True},
            ),
            ({"mode": "send", "handler": CloseOnVideoEmit}, {"video": True}),
            # The generator runs out
            ({"mode": "receive", "handler": three_frames}, {"receive": "video"}),
        ],
        indirect=["launched"],
    )
    async def test_a_stream_its_handler_ends_closes_its_connection(
        self, launched, offer, caplog
    ):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(**offer)
        await h.connect(pc, "one")
        server_pc = live_pc(h.manager, "one")
        await h.push_inputs("one", 0)
        # The server closes its side and the event, whether or not the
        # browser reacts to "end_stream"
        await h.wait_until(lambda: server_pc.connectionState == "closed", timeout=10)
        await h.wait_until(lambda: not h.event_running(event_id))
        await pc.close()
        # The track tells aiortc's sender that it has ended, instead of giving
        # it no frame to encode. An aioice check task of an earlier test's
        # connection can be collected (and logged) meanwhile, so those are
        # not this test's.
        failures = [
            record.getMessage()
            for record in caplog.records
            if (record.exc_info or "Traceback" in record.getMessage())
            and "aioice" not in record.getMessage()
        ]
        assert failures == []

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"modality": "audio", "handler": FailingShutdown}], indirect=True
    )
    async def test_a_failing_shutdown_still_ends_the_stream(self, launched, caplog):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(audio=True)
        await h.connect(pc, "one")
        await h.wait_until(lambda: stream_of(h.manager, "one").connected)
        errors = stream_of(h.manager, "one").errors
        assert errors is not None
        # The browser leaves; the handler's shutdown() raises while cleaning up
        await pc.close()
        await h.wait_until(lambda: not h.event_running(event_id), timeout=10)
        await h.wait_until(lambda: "shutdown failed" in caplog.text)
        # Clean-up after the stream, not a failure of it, and logged once
        assert errors.failure is None
        logged = [r.getMessage() for r in caplog.records if r.exc_info]
        assert logged == ["Stream handler shutdown() failed"]

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [
            {"handler": AsyncRecordingVideo},
            {"mode": "send", "handler": RecordingVideo},
            {"mode": "send", "handler": CaptionVideo},
        ],
        indirect=True,
    )
    async def test_a_video_handler_class_lives_as_long_as_the_stream(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(video=True)
        answer = await h.connect(pc, "one")
        # Video only: the page does not have to send (or ask for) a microphone
        assert "m=audio" not in answer["sdp"]
        if h.webrtc.mode == "send":
            # No video goes back to the page, only the values
            assert "a=recvonly" in answer["sdp"]
        handler = h.handler("one")
        await h.wait_until(lambda: stream_of(h.manager, "one").connected)
        await h.wait_until(lambda: handler.events == ["start_up"])
        await h.wait_until(lambda: handler.frames > 0)
        assert handler.channel is not None
        # The other inputs reach the handler, and its AdditionalOutputs the
        # page. In "send" nothing reads video_emit()'s frames, so the server
        # calls it itself.
        await h.push_inputs("one", 21)
        assert handler.latest_args == [21]

        def got_output(ms):
            return any(
                m.get("msg") == "process_streaming" and m["output"]["data"][1] == 42
                for m in ms
            )

        await h.messages("one", got_output, timeout=15)
        await pc.close()
        await h.wait_until(lambda: not h.event_running(event_id), timeout=10)
        await h.wait_until(lambda: "shutdown" in handler.events)
        assert handler.events == ["start_up", "shutdown"]

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"modality": "audio-video", "handler": RecordingAudioVideo}],
        indirect=True,
    )
    async def test_an_audio_video_handler_is_shut_down_once(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(audio=True, video=True)
        await h.connect(pc, "one")
        handler = h.handler("one")
        await h.wait_until(lambda: stream_of(h.manager, "one").connected)
        # Both tracks share the handler; closing must not shut it down twice
        await pc.close()
        await h.wait_until(lambda: not h.event_running(event_id), timeout=10)
        await h.wait_until(lambda: "shutdown" in handler.events)
        await asyncio.sleep(0.2)
        assert handler.events == ["shutdown"]

    @pytest.mark.asyncio
    async def test_candidates_are_kept_only_for_an_admitted_stream(
        self, launched, monkeypatch, caplog
    ):
        h = launched
        first_event = await h.start("zero")
        await h.join("one")

        async def send_candidate():
            return await h.signal(
                "offer",
                {
                    "type": "ice-candidate",
                    "webrtc_id": "one",
                    "candidate": {
                        "candidate": "candidate:1 1 udp 1 127.0.0.1 9 typ host",
                        "sdpMid": "0",
                        "sdpMLineIndex": 0,
                    },
                },
                session_hash="one",
            )

        # Anyone can send an id that is not admitted yet, so nothing is kept
        assert (await send_candidate())["meta"]["error"] == "unknown_connection"
        assert pending_candidates("one") is None
        await h.http.post(f"{h.api}/stream/{first_event}/close")
        await h.wait_until(lambda: has_stream(h.manager, "one"))
        # After the turn, the offer can still be on its way. A browser with
        # several networks and TURN URLs can send many candidates meanwhile.
        for _ in range(40):
            assert (await send_candidate()).get("status") == "success"
        assert len(pending_candidates("one")) == 40
        # Past the bound, a candidate is dropped, but not silently
        monkeypatch.setattr(webrtc_connection, "MAX_PENDING_CANDIDATES", 40)
        await send_candidate()
        assert len(pending_candidates("one")) == 40
        assert "ICE candidate" in caplog.text
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        assert pending_candidates("one") is None
        await pc.close()

    @pytest.mark.asyncio
    async def test_offers_racing_for_one_turn_get_one_connection(self, launched):
        h = launched
        first_event = await h.start("zero")
        await h.join("one")
        offers = [await make_offer(video=True) for _ in range(2)]

        async def free_the_slot():
            await asyncio.sleep(0.1)
            await h.http.post(f"{h.api}/stream/{first_event}/close")

        # Both offers wait for "one" to be admitted
        responses = await asyncio.gather(
            h.offer(offers[0], "one"), h.offer(offers[1], "one"), free_the_slot()
        )
        answers = [r for r in responses[:2] if r.get("type") == "answer"]
        assert len(answers) == 1
        assert {r.get("meta", {}).get("error") for r in responses[:2]} >= {
            "connection_already_exists"
        }
        for pc in offers:
            await pc.close()

    @pytest.mark.asyncio
    async def test_rtc_configuration_resolution(self):
        calls = []

        async def issue_credentials():
            calls.append(1)
            return {"iceServers": [{"urls": "turn:example.com"}]}

        assert await rtc_manager(issue_credentials).rtc_configuration_for() == {
            "iceServers": [{"urls": "turn:example.com"}]
        }
        assert calls == [1]
        assert await rtc_manager().rtc_configuration_for() == {}
        assert await rtc_manager(
            lambda: {"iceServers": []}
        ).rtc_configuration_for() == {"iceServers": []}

        class Credentials:
            async def __call__(self):
                return {"iceServers": []}

        assert await rtc_manager(Credentials()).rtc_configuration_for() == {
            "iceServers": []
        }
        # Not a configuration: the page reports it instead of connecting
        # without the ICE servers
        assert await rtc_manager(lambda: None).rtc_configuration_for() == {
            "error": "An error occurred."
        }

        await asyncio.sleep(0)

    @pytest.mark.asyncio
    @pytest.mark.parametrize("show_error", [False, True])
    async def test_rtc_configuration_errors_follow_show_error(
        self, show_error, monkeypatch
    ):
        def broken():
            raise RuntimeError("internal detail")

        def not_signed_in():
            raise gr.Error("Sign in first.")

        with gr.Blocks() as demo:
            broken_webrtc = gr.WebRTC(rtc_configuration=broken)
            broken_webrtc.stream(flip, inputs=[broken_webrtc], outputs=[broken_webrtc])
            signed_in_webrtc = gr.WebRTC(rtc_configuration=not_signed_in)
            signed_in_webrtc.stream(
                flip, inputs=[signed_in_webrtc], outputs=[signed_in_webrtc]
            )
        managers = {
            "broken": manager_of(demo, broken_webrtc),
            "signed_in": manager_of(demo, signed_in_webrtc),
        }
        monkeypatch.setattr(
            webrtc_connection, "stream_admitted", admitted_anyway(managers)
        )
        with closing(demo):
            _, local_url, _ = demo.launch(
                prevent_thread_lock=True, show_error=show_error, executor="thread"
            )
            async with httpx2.AsyncClient(timeout=10) as http:

                async def resolve(webrtc_id):
                    response = await http.post(
                        f"{local_url.rstrip('/')}{API_PREFIX}/webrtc/rtc_configuration",
                        json={"session_hash": "session", "webrtc_id": webrtc_id},
                    )
                    return response.json()

                # Like the error of an event: the message of a gr.Error, other
                # messages only with show_error
                assert await resolve("broken") == {
                    "error": "internal detail" if show_error else "An error occurred."
                }
                assert await resolve("signed_in") == {"error": "Sign in first."}

    @pytest.mark.asyncio
    async def test_rtc_configuration_gets_the_request_of_the_page(self, monkeypatch):
        def issue_credentials(request: gr.Request):
            return {
                "iceServers": [],
                "agent": request.headers["user-agent"],
                "user": request.username,
                "session": request.session_hash,
            }

        with gr.Blocks() as demo:
            webrtc = gr.WebRTC(rtc_configuration=issue_credentials)
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])
        monkeypatch.setattr(
            webrtc_connection,
            "stream_admitted",
            admitted_anyway({"one": manager_of(demo, webrtc)}),
        )
        with closing(demo):
            _, local_url, _ = demo.launch(
                prevent_thread_lock=True,
                executor="thread",
                auth=("visitor", "password"),
            )
            async with httpx2.AsyncClient(timeout=10, base_url=local_url) as http:
                await http.post(
                    "login", data={"username": "visitor", "password": "password"}
                )
                response = await http.post(
                    f"{API_PREFIX.lstrip('/')}/webrtc/rtc_configuration",
                    headers={"User-Agent": "visitor-browser"},
                    json={"session_hash": "session", "webrtc_id": "one"},
                )
        assert response.json() == {
            "iceServers": [],
            "agent": "visitor-browser",
            "user": "visitor",
            "session": "session",
        }

    @pytest.mark.asyncio
    async def test_signalling_that_names_no_stream_of_the_session_is_refused(self):
        with gr.Blocks() as demo:
            webrtc = gr.WebRTC(rtc_configuration={"iceServers": []})
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])
        with closing(demo):
            _, local_url, _ = demo.launch(prevent_thread_lock=True, executor="thread")
            async with httpx2.AsyncClient(timeout=10, base_url=local_url) as http:
                for route in ("rtc_configuration", "offer"):
                    url = f"{API_PREFIX.lstrip('/')}/webrtc/{route}"
                    response = await http.post(
                        url, json={"session_hash": "s", "webrtc_id": [1], "sdp": "x"}
                    )
                    assert response.status_code == 400
                    await http.post(
                        url,
                        json={"session_hash": f"made-up-{route}", "webrtc_id": "x"},
                    )
            # An unknown session keeps no state
            state_holder = demo.server_app.state_holder
            assert "made-up-rtc_configuration" not in state_holder
            assert "made-up-offer" not in state_holder

    @pytest.mark.asyncio
    async def test_signalling_in_an_app_without_streams_is_answered_at_once(self):
        # Other tests in this process attached handlers to their apps; this
        # one has none
        with gr.Blocks() as demo:
            gr.Textbox()
        with closing(demo):
            _, local_url, _ = demo.launch(prevent_thread_lock=True, executor="thread")
            async with httpx2.AsyncClient(timeout=10, base_url=local_url) as http:
                start = time.monotonic()
                offer = await http.post(
                    f"{API_PREFIX.lstrip('/')}/webrtc/offer",
                    json={"session_hash": "s", "webrtc_id": "x", "sdp": "x"},
                )
                configuration = await http.post(
                    f"{API_PREFIX.lstrip('/')}/webrtc/rtc_configuration",
                    json={"session_hash": "s", "webrtc_id": "x"},
                )
                # Not ADMISSION_WAIT (5 s) for an admission that cannot come
                assert time.monotonic() - start < 2
            assert offer.json()["meta"]["error"] == "no_stream_handler"
            assert "error" in configuration.json()

    @pytest.mark.asyncio
    @pytest.mark.parametrize("compose", ["render", "tabbed"])
    async def test_a_stream_of_a_rendered_app_connects(self, compose, monkeypatch):
        monkeypatch.setattr(webrtc_connection, "ADMISSION_WAIT", 0.5)
        forget_earlier_streams()
        # A page built as an app of its own, as the multipage guide does
        with gr.Blocks() as page:
            webrtc = gr.WebRTC()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])
        if compose == "render":
            with gr.Blocks() as demo:
                page.render()
        else:
            demo = gr.TabbedInterface([page, gr.Interface(lambda x: x, "text", "text")])
        with closing(demo):
            _, local_url, _ = demo.launch(prevent_thread_lock=True, executor="thread")
            h = Harness(demo, local_url, webrtc)
            await h.start("one")
            pc = await make_offer(video=True)
            answer = await h.connect(pc, "one")
            assert "m=video" in answer["sdp"]
            await pc.close()
            await h.http.aclose()

    @pytest.mark.asyncio
    @pytest.mark.parametrize("executor", ["thread", "process"])
    async def test_a_page_whose_heartbeat_dropped_can_still_stream(
        self, executor, monkeypatch
    ):
        monkeypatch.setattr(webrtc_connection, "ADMISSION_WAIT", 0.5)
        # The grace period after a dropped heartbeat (and a detached session's
        # time to live), in the gateway too, which reads it at launch
        monkeypatch.setenv("GRADIO_QUEUE_SESSION_RESUME_TTL", "0.2")
        forget_earlier_streams()
        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])
        with closing(demo):
            _, local_url, _ = demo.launch(prevent_thread_lock=True, executor=executor)
            h = Harness(demo, local_url, webrtc)
            event_id = await h.start("one")
            pc = await make_offer(video=True)
            await h.connect(pc, "one")
            await h.http.post(f"{h.api}/stream/{event_id}/close")
            await h.messages("one", completed)
            await pc.close()
            # A phone puts the page in the background: its heartbeat drops and
            # is not opened again, so the server takes the session as closed
            async with h.http.stream("GET", f"{h.api}/heartbeat/one") as response:
                await anext(response.aiter_lines())
            worker = getattr(demo, "_process_worker", None)
            app = worker.app if worker is not None else demo.server_app
            await h.wait_until(
                lambda: (
                    "one" in app.state_holder.session_data
                    and app.state_holder.session_data["one"].is_closed
                )
            )
            # The page is still there and starts another stream
            await h.join("two", session_hash="one")
            await h.wait_until(lambda: has_stream(h.manager, "two"))
            pc = await make_offer(video=True)
            answer = await h.connect(pc, "two")
            assert "m=video" in answer["sdp"]
            await pc.close()
            await h.http.aclose()

    @pytest.mark.asyncio
    @pytest.mark.parametrize("executor", ["thread", "process"])
    async def test_a_page_that_left_ends_its_stream(self, executor, monkeypatch):
        monkeypatch.setattr(webrtc_connection, "ADMISSION_WAIT", 0.5)
        monkeypatch.setenv("GRADIO_QUEUE_SESSION_RESUME_TTL", "0.2")
        forget_earlier_streams()
        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])
        with closing(demo):
            _, local_url, _ = demo.launch(prevent_thread_lock=True, executor=executor)
            h = Harness(demo, local_url, webrtc)
            await h.start("one")
            pc = await make_offer(video=True)
            await h.connect(pc, "one")
            await h.wait_until(lambda: stream_of(h.manager, "one").connected)
            # The tab closes: its queue stream and heartbeat go, for good
            async with h.http.stream(
                "GET", f"{h.api}/queue/data", params={"session_hash": "one"}
            ) as response:
                await anext(response.aiter_lines())
            async with h.http.stream("GET", f"{h.api}/heartbeat/one") as response:
                await anext(response.aiter_lines())
            await h.wait_until(lambda: not has_stream(h.manager, "one"), timeout=10)
            await pc.close()
            await h.http.aclose()

    @pytest.mark.asyncio
    async def test_rtc_configuration_gets_the_visitor_oauth_token(self):
        from starlette.requests import Request

        def issue_credentials(token: gr.OAuthToken | None):
            return {"iceServers": [], "token": token.token if token else None}

        def logged_in_only(token: gr.OAuthToken):
            return {"iceServers": [], "token": token.token}

        def page(session=None):
            scope = {"type": "http", "headers": []}
            if session is not None:
                scope["session"] = session
            return gr.Request(request=Request(scope))

        session = {
            "oauth_info": {
                "access_token": "visitor-token",
                "scope": "openid profile",
                "expires_at": time.time() + 60,
                "userinfo": {"preferred_username": "visitor"},
            }
        }
        optional = rtc_manager(issue_credentials)
        assert await optional.rtc_configuration_for(page(session)) == {
            "iceServers": [],
            "token": "visitor-token",
        }
        assert await optional.rtc_configuration_for(page()) == {
            "iceServers": [],
            "token": None,
        }
        required = rtc_manager(logged_in_only)
        assert await required.rtc_configuration_for(page(session)) == {
            "iceServers": [],
            "token": "visitor-token",
        }
        assert await required.rtc_configuration_for(page()) == {
            "error": "This action requires a logged in user. Please sign in and retry."
        }


class TestStreamsWithProcesses:
    """Streams with executor="process": the queue runs in the gateway process,
    and the stream's function and media in this one, which reaches the
    queue's event through `ForwardingQueue.event_handle`."""

    executor = "process"
    launched = TestStreams.launched

    test_a_quiet_stream_keeps_its_turn = TestStreams.test_a_quiet_stream_keeps_its_turn
    # The page's close reaches the stream here, which delivers what is
    # pending; the media closes once the gateway says that the event ended
    test_closing_the_stream_delivers_every_pending_output = (
        TestStreams.test_closing_the_stream_delivers_every_pending_output
    )
    test_closing_a_stream_whose_handler_just_failed_fails_it = (
        TestStreams.test_closing_a_stream_whose_handler_just_failed_fails_it
    )
    # The stream, not the queue, keeps the time limit
    test_time_limit_ends_the_event_and_the_connection = (
        TestStreams.test_time_limit_ends_the_event_and_the_connection
    )
    test_admitted_stream_that_never_connects_gives_up = (
        TestStreams.test_admitted_stream_that_never_connects_gives_up
    )
    # The concurrency limit per process comes from the gateway, and after a
    # cancel the gateway closes the run in this process
    test_the_next_handler_waits_for_the_last_one_to_shut_down = (
        TestStreams.test_the_next_handler_waits_for_the_last_one_to_shut_down
    )
    # The gateway's chunk route knows the event is a lease
    test_the_chunk_route_refuses_a_webrtc_stream = (
        TestStreams.test_the_chunk_route_refuses_a_webrtc_stream
    )
    # The page's close reaches the setup here through the gateway
    test_a_stream_stopped_while_it_connects_ends_as_stopped = (
        TestStreams.test_a_stream_stopped_while_it_connects_ends_as_stopped
    )

    @pytest.mark.asyncio
    async def test_a_stream_is_one_finished_event_for_its_process(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        # Each output takes a call of the stream's event
        stream_of(h.manager, "one").outputs.extend(
            AdditionalOutputs(n) for n in (1, 2, 3)
        )
        await h.http.post(f"{h.api}/stream/{event_id}/close")
        await h.messages("one", completed)
        status = (await h.http.get(f"{h.api}/processes")).json()
        # What replicas="auto" sizes the app by: one event, not one per call
        assert sum(p["completed"] for p in status["processes"]) == 1
        await pc.close()


class FakeLink:
    """What `Pool` reads of an app's process, recording what it sends."""

    def __init__(self):
        self.sent: list = []
        self.serving_events: set[str] = set()
        self.sessions: dict[str, bool] = {}
        self.held: dict = {}
        self.running = 0
        self.draining = False
        self.on_drained = None
        self.closed = False
        self.responsive = True
        self.slots: dict[str, asyncio.Semaphore] = {}

    def slot(self, concurrency_id, limit) -> asyncio.Semaphore:
        return self.slots.setdefault(concurrency_id, asyncio.Semaphore(limit))

    @property
    def active(self) -> bool:
        return bool(self.serving_events or self.held)

    def send(self, message) -> None:
        self.sent.append(message)

    def release(self, event_id) -> None:
        self.held.pop(event_id, None)


class TestGatewayPlacements:
    """Where the gateway sends a stream's calls and signalling, and whom it
    tells when the stream ends (executor="process")."""

    @staticmethod
    def pool(*events) -> Any:
        from gradio.processing.gateway import Pool

        queue = SimpleNamespace(event_ids_to_events={e._id: e for e in events})
        return Pool(cast(Any, SimpleNamespace(_queue=queue)), "fingerprint", 10)

    @staticmethod
    def event(event_id="e", session_hash="s") -> Any:
        return SimpleNamespace(_id=event_id, session_hash=session_hash)

    def test_a_stream_cancelled_during_its_first_call_is_ended_in_its_process(self):
        event = self.event()
        pool = self.pool(event)
        link = FakeLink()
        # Placed when its first call went out; cancelled before it came back
        pool.place("e", cast(Any, link), True, "s")
        assert link.serving_events == {"e"}
        pool.end_event(event)
        assert link.sent == [("event_ended", "e")]
        assert not link.serving_events and not pool.placements

    def test_actions_for_an_event_the_queue_is_done_with_are_refused(self):
        event = self.event()
        pool = self.pool(event)
        link = FakeLink()
        pool.place("e", cast(Any, link), True, "s")
        pool.end_event(event)
        # A late wake, while the ended event is still in the queue's table
        pool.apply_event_actions(cast(Any, link), "e", ["wake"])
        assert not pool.placements and not link.serving_events
        assert link.sent == [("event_ended", "e"), ("event_ended", "e")]
        # And one for an event the queue no longer has at all
        pool.apply_event_actions(cast(Any, link), "gone", ["finish"])
        assert link.sent[-1] == ("event_ended", "gone")

    def test_a_plain_stream_is_not_told_and_keeps_its_slot_behavior(self):
        event = self.event()
        pool = self.pool(event)
        link = FakeLink()
        pool.place("e", cast(Any, link), False, "s")
        # Without a slot held between chunks, its calls follow the session
        assert pool.placed("e", "s") is None
        link.held["e"] = object()
        assert pool.placed("e", "s") is link
        pool.end_event(event)
        assert link.sent == [] and not link.held

    def test_a_session_stays_with_its_stream_through_a_drain(self):
        event = self.event(session_hash="visitor")
        pool = self.pool(event)
        primary, replica = FakeLink(), FakeLink()
        pool.links = cast(Any, [primary, replica])
        replica.sessions["visitor"] = True
        pool.place("e", cast(Any, replica), True, "visitor")
        pool.stream_admitted("e", "stream-1")
        # The replica is retired: sessions move, but not one whose stream runs
        # there, so its input changes and signalling still reach the stream
        replica.draining = True
        replica.sessions.clear()
        assert pool.for_session("visitor") is replica
        assert pool.holding("visitor") is replica
        assert pool.placed("e", "visitor") is replica
        assert pool.for_stream("stream-1") is replica
        # Once the stream ends, the session moves on, and the retiring process
        # does not take it back
        pool.end_event(event)
        assert pool.for_stream("stream-1") is None
        assert "visitor" not in replica.sessions
        assert pool.for_session("visitor") is primary

    def test_a_new_session_goes_to_the_process_with_fewer_streams(self):
        events = [self.event(f"e{i}", f"s{i}") for i in range(2)]
        pool = self.pool(*events)
        pool.blocks._queue.active_jobs = []
        streaming, other = FakeLink(), FakeLink()
        pool.links = cast(Any, [streaming, other])
        # Streams with concurrency_limit=None hold no slot, and between their
        # calls nothing runs, but their handlers work in that process
        for event in events:
            pool.place(event._id, cast(Any, streaming), True, event.session_hash)
        other.sessions["idle visitor"] = True
        assert pool.for_session("new visitor") is other
        # So does the first queued event of a session: a click with the
        # default limit, whose slot both processes have free
        pool.group_limits["click"] = 1
        click = SimpleNamespace(
            _id="c",
            session_hash="newer visitor",
            fn=SimpleNamespace(queue=True, batch=False, concurrency_id="click"),
        )
        assert pool.can_start(click)
        assert "newer visitor" in other.sessions
        assert "newer visitor" not in streaming.sessions

    @pytest.mark.asyncio
    async def test_a_stream_whose_process_exited_is_over(self):
        from gradio.exceptions import Error

        event = self.event()
        pool = self.pool(event)
        lost, other = FakeLink(), FakeLink()
        pool.place("e", cast(Any, lost), True, "s")
        lost.closed = True
        # Its media ran there; another process would admit it again
        with pytest.raises(Error, match="stopped"):
            pool.placed("e", "s")
        # The gateway already woke the stream, whose next call fails it; the
        # close route would otherwise end it as a success
        assert await pool.close_stream("e") is True
        pool.end_event(event)
        assert lost.sent == [] and not other.sent

    def test_a_plain_stream_moves_with_its_slot_when_its_process_exits(self):
        event = self.event()
        pool = self.pool(event)
        lost, other = FakeLink(), FakeLink()
        pool.place("e", cast(Any, lost), False, "s")
        lost.held["e"] = object()
        lost.closed = True
        assert pool.placed("e", "s") is None
        # The next call takes a slot on the other process
        pool.follow("e", cast(Any, other))
        other.held["e"] = object()
        pool.end_event(event)
        assert not other.held

    def test_the_streams_of_an_exited_process_are_woken(self):
        webrtc_stream, plain_stream, elsewhere = (
            SimpleNamespace(_id=i, session_hash="s", signal=asyncio.Event())
            for i in ("webrtc", "plain", "elsewhere")
        )
        pool = self.pool(webrtc_stream, plain_stream, elsewhere)
        lost, other = FakeLink(), FakeLink()
        pool.place("webrtc", cast(Any, lost), True, "s")
        pool.place("plain", cast(Any, lost), False, "s")
        pool.place("elsewhere", cast(Any, other), True, "s")
        pool.wake_streams_of(cast(Any, lost))
        # Its next call fails it; a plain stream's next chunk moves on by itself
        assert webrtc_stream.signal.is_set()
        assert not plain_stream.signal.is_set()
        assert not elsewhere.signal.is_set()

    def test_two_streams_of_one_session_on_one_process_end_apart(self):
        first, second = self.event("first"), self.event("second")
        pool = self.pool(first, second)
        link = FakeLink()
        # Neither admitted yet: the two placements look alike
        pool.place("first", cast(Any, link), True, "s")
        pool.place("second", cast(Any, link), True, "s")
        pool.end_event(second)
        (left,) = pool.session_streams["s"]
        assert left is pool.placements["first"]
        pool.end_event(first)
        assert "s" not in pool.session_streams


REPLICA_APP = """
import os

import gradio as gr
from gradio.webrtc import AdditionalOutputs, get_current_context

reported = set()


def handler(frame):
    # The pid once per stream: no step of the stream's event is under way
    # afterwards, until the next wake
    webrtc_id = get_current_context().webrtc_id
    if webrtc_id in reported:
        return frame
    reported.add(webrtc_id)
    return frame, AdditionalOutputs(os.getpid())


with gr.Blocks() as demo:
    webrtc = gr.WebRTC()
    pid = gr.Number()
    webrtc.stream(handler, inputs=[webrtc], outputs=[webrtc, pid], concurrency_limit=1)

demo.launch(server_port=int(os.environ["PORT"]))
"""


class ReplicaApp:
    """REPLICA_APP launched with two processes, as a page would use it."""

    def __init__(self, http, api: str, stream_fn: int, tick_fn: int, pids):
        self.http = http
        self.api = api
        self.stream_fn = stream_fn
        self.tick_fn = tick_fn
        # The app's processes, the primary first
        self.pids = pids
        self.received: dict[str, list] = {}
        self.readers: list[asyncio.Task] = []
        self.pcs: list = []

    async def read(self, session_hash):
        # One stream per session for the whole test: a page that closes it
        # leaves, which ends its events
        async with self.http.stream(
            "GET", f"{self.api}/queue/data", params={"session_hash": session_hash}
        ) as response:
            async for line in response.aiter_lines():
                if line.startswith("data:"):
                    self.received[session_hash].append(json.loads(line[5:]))

    async def wait_for(self, session_hash, condition, timeout=30):
        deadline = time.monotonic() + timeout
        while not (found := condition(self.received[session_hash])):
            assert time.monotonic() < deadline, self.received[session_hash]
            await asyncio.sleep(0.05)
        return found

    async def join(self, fn_index, data, session_hash):
        response = await self.http.post(
            f"{self.api}/queue/join",
            json={"data": data, "fn_index": fn_index, "session_hash": session_hash},
        )
        return response.json()["event_id"]

    @staticmethod
    def streamed_pid(ms):
        return next(
            (
                m["output"]["data"][1]
                for m in ms
                if m.get("msg") == "process_streaming"
                and isinstance(m["output"]["data"][1], int | float)
            ),
            None,
        )

    async def stream(self, session):
        """Starts a stream for `session`: its event id, its connection, and
        the pid of the process that runs it."""
        event_id = await self.join(self.stream_fn, [session], session)
        self.received[session] = []
        self.readers.append(asyncio.create_task(self.read(session)))
        pc = await make_offer(video=True)
        self.pcs.append(pc)
        answer = (
            await self.http.post(
                f"{self.api}/webrtc/offer",
                json={
                    "session_hash": session,
                    "sdp": pc.localDescription.sdp,
                    "type": pc.localDescription.type,
                    "webrtc_id": session,
                },
            )
        ).json()
        assert answer["type"] == "answer", answer
        await pc.setRemoteDescription(
            RTCSessionDescription(answer["sdp"], answer["type"])
        )
        # The handler runs once the page has sent the inputs
        await self.join(self.tick_fn, [session], session)
        return event_id, pc, await self.wait_for(session, self.streamed_pid)

    def completion(self, session, event_id):
        """The stream event's completion, not that of the session's ticks."""
        return next(
            (
                m
                for m in self.received[session]
                if m["msg"] == "process_completed" and m.get("event_id") == event_id
            ),
            None,
        )


@asynccontextmanager
async def replica_app(tmp_path):
    import os
    import signal
    import socket
    import subprocess
    import sys

    script = tmp_path / "app.py"
    script.write_text(REPLICA_APP)
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        port = s.getsockname()[1]
    log_path = tmp_path / "server.log"
    log = log_path.open("w")
    proc = subprocess.Popen(
        [sys.executable, str(script)],
        env={**os.environ, "GRADIO_PROCESS_REPLICAS": "2", "PORT": str(port)},
        stdout=log,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    api = f"http://127.0.0.1:{port}{API_PREFIX}"
    app = None
    passed = False
    try:
        async with httpx2.AsyncClient(timeout=15) as http:
            deadline = time.monotonic() + 120
            processes = []
            while time.monotonic() < deadline:
                try:
                    status = (await http.get(f"{api}/processes")).json()
                    # Not yet the gateway's answer while the app starts
                    processes = status.get("processes", [])
                    if len(processes) == 2 and not status.get("starting", True):
                        break
                except (httpx2.HTTPError, ValueError):
                    pass
                await asyncio.sleep(0.5)
            assert len(processes) == 2, processes
            config = (await http.get(f"http://127.0.0.1:{port}/config")).json()
            webrtc_id = next(
                c["id"] for c in config["components"] if c["type"] == "webrtc"
            )
            stream_fn, tick_fn = (
                next(
                    d["id"]
                    for d in config["dependencies"]
                    if [webrtc_id, event] in d["targets"]
                )
                for event in ("stream", "tick")
            )
            app = ReplicaApp(
                http, api, stream_fn, tick_fn, [p["pid"] for p in processes]
            )
            yield app
        passed = True
    finally:
        if app is not None:
            for task in app.readers:
                task.cancel()
            for pc in app.pcs:
                await pc.close()
        os.killpg(proc.pid, signal.SIGTERM)
        proc.wait(timeout=30)
        log.close()
        if not passed:
            # Shown with the failure, as the app's processes saw it
            print(log_path.read_text()[-5000:])


@pytest.mark.asyncio
async def test_streams_on_two_replicas_each_stay_with_their_process(tmp_path):
    import os
    import signal

    async with replica_app(tmp_path) as app:
        streams = {session: await app.stream(session) for session in ("a", "b")}
        # concurrency_limit=1 applies per process, so the second stream runs
        # on the other one
        assert streams["a"][2] != streams["b"][2]
        on_primary, on_replica = sorted(
            streams, key=lambda s: streams[s][2] != app.pids[0]
        )
        event_id, pc, _ = streams[on_primary]
        await app.http.post(f"{app.api}/stream/{event_id}/close")
        await app.wait_for(on_primary, lambda _: app.completion(on_primary, event_id))
        assert app.completion(on_primary, event_id)["success"] is True
        # The process of the stream closes its connection once the gateway
        # says that the event ended
        deadline = time.monotonic() + 15
        while pc.connectionState not in ("closed", "failed"):
            assert time.monotonic() < deadline, pc.connectionState
            await asyncio.sleep(0.1)

        session = on_replica
        event_id = streams[session][0]
        os.kill(streams[session][2], signal.SIGKILL)
        # Nothing comes from that process any more, and the queue does not time
        # out a lease's wait: the gateway wakes it when it loses the process
        await app.wait_for(
            session, lambda _: app.completion(session, event_id), timeout=15
        )
        completion = app.completion(session, event_id)
        assert completion["success"] is False
        assert "stopped" in completion["output"]["error"]


@pytest.mark.asyncio
async def test_time_limit_stops_media_while_workers_are_busy(monkeypatch):
    monkeypatch.setattr(webrtc_connection, "ADMISSION_WAIT", 0.5)
    with gr.Blocks() as demo:
        webrtc = gr.WebRTC()
        number = gr.Number()
        # Outputs on every frame keep waking the stream's event, which then
        # waits for the worker slot the long job holds
        webrtc.stream(
            lambda frame, *args: (frame, AdditionalOutputs(1)),
            inputs=[webrtc],
            outputs=[webrtc, number],
            # Leaves time to connect on a loaded CI runner before the limit
            # ends the stream, and still ends it well before the busy job
            time_limit=2,
        )
        busy = gr.Button()
        busy.click(lambda: time.sleep(6), None, None, concurrency_limit=None)
    busy_fn = next(
        fn
        for fn in demo.fns.values()
        if (busy._id, "click") in [tuple(t) for t in fn.targets]
    )
    with closing(demo):
        _, local_url, _ = demo.launch(
            prevent_thread_lock=True, max_threads=1, executor="thread"
        )
        h = Harness(demo, local_url, webrtc)
        # Made first: gathering its candidates can take longer than the time
        # limit, which counts from the admission
        pc = await make_offer(video=True)
        await h.start("one")
        started = time.monotonic()
        await h.connect(pc, "one")
        server_pc = live_pc(h.manager, "one")
        await h.push_inputs("one")
        await h.wait_until(lambda: stream_of(h.manager, "one").connected)
        # A long job takes the only worker slot while the stream waits
        await h.http.post(
            f"{h.api}/queue/join",
            json={"data": [], "fn_index": busy_fn._id, "session_hash": "busy"},
        )
        await h.wait_until(lambda: h.demo._queue.get_active_worker_count() == 1)
        # The media stops at the time limit, not when a worker frees up
        await h.wait_until(lambda: server_pc.connectionState == "closed", timeout=6)
        assert time.monotonic() - started < 3.5
        # Once a worker is free, the event still delivers every pending
        # output, however long past its time limit, and reports the failure
        session = stream_of(h.manager, "one")
        session.outputs.append(AdditionalOutputs(99))
        assert session.errors is not None
        session.errors.failure = {"error": "Bad frame", "visible": False}
        messages = await h.messages("one", completed)
        assert any(
            m.get("msg") == "process_streaming" and m["output"]["data"][1] == 99
            for m in messages
        )
        assert messages[-1]["success"] is False
        await pc.close()
        await h.http.aclose()


def video_frame(pts: int):
    import fractions

    import numpy as np
    from av import VideoFrame

    frame = VideoFrame.from_ndarray(np.zeros((16, 16, 3), dtype=np.uint8), "bgr24")
    frame.pts = pts
    frame.time_base = fractions.Fraction(1, 90000)
    return frame


def left_column_frame():
    import fractions

    import numpy as np
    from av import VideoFrame

    array = np.zeros((16, 16, 3), dtype=np.uint8)
    array[:, 0] = 255
    frame = VideoFrame.from_ndarray(array, "bgr24")
    frame.pts = 0
    frame.time_base = fractions.Fraction(1, 90000)
    return frame


class OneFrame(VideoStreamTrack):
    """
    A camera that sends `frame`, then ends once `released` is set. A track
    takes only the newest queued item, so an input that ended at once would
    end it before the frame is handled.
    """

    def __init__(self, frame, released: asyncio.Event):
        super().__init__()
        self.frames = [frame]
        self.released = released

    async def recv(self):
        if self.frames:
            return self.frames.pop()
        await self.released.wait()
        raise MediaStreamError


async def count_ticks_while(coro):
    """Awaits `coro` and returns its result plus how often the loop ticked."""
    ticks = 0

    async def ticker():
        nonlocal ticks
        while True:
            await asyncio.sleep(0.01)
            ticks += 1

    task = asyncio.create_task(ticker())
    try:
        return await coro, ticks
    finally:
        task.cancel()


class TestVideoTracks:
    @staticmethod
    def callback(handler, **kwargs):
        from gradio.webrtc.tracks import VideoCallback
        from gradio.webrtc.utils import Context

        cb = VideoCallback(
            VideoStreamTrack(), event_handler=handler, context=Context("id"), **kwargs
        )
        # Frames are fed through frame_queue directly instead of a peer track.
        cb.has_started = True
        cb.latest_args = []
        cb.channel_set.set()
        return cb

    @pytest.mark.asyncio
    async def test_send_mode_makes_no_frame_of_what_the_handler_returns(
        self, monkeypatch
    ):
        cb = self.callback(flip, mode="send")
        made = []
        monkeypatch.setattr(cb, "array_to_frame", lambda array: made.append(array))
        cb.frame_queue.put_nowait(video_frame(0))
        # Nothing plays the output of mode="send"
        assert await cb.recv() is None
        assert made == []

    def test_skip_frames_is_the_default(self):
        assert VideoOptions(flip).skip_frames
        assert self.callback(flip).skip_frames

    @pytest.mark.asyncio
    @pytest.mark.parametrize("skip_frames, expected_pts", [(True, 4), (False, 0)])
    async def test_skip_frames_processes_the_latest_frame(
        self, skip_frames, expected_pts
    ):
        cb = self.callback(flip, skip_frames=skip_frames)
        for pts in range(5):
            cb.frame_queue.put_nowait(video_frame(pts))
        out = await cb.recv()
        assert out.pts == expected_pts
        assert cb.frame_queue.qsize() == (0 if skip_frames else 4)

    @pytest.mark.asyncio
    async def test_fps_limits_how_often_a_function_runs(self):
        from aiortc.mediastreams import MediaStreamError

        calls = []
        cb = self.callback(lambda frame: calls.append(1) or frame, fps=5)

        async def camera():
            # About 30 frames a second
            for pts in range(20):
                cb.frame_queue.put_nowait(video_frame(pts))
                await asyncio.sleep(1 / 30)
            cb.stop()

        start = time.monotonic()
        feeding = asyncio.create_task(camera())
        returned = []
        with pytest.raises(MediaStreamError):
            while True:
                frame = await asyncio.wait_for(cb.recv(), 2)
                returned.append((time.monotonic(), frame.pts))
        await feeding
        elapsed = time.monotonic() - start
        # At most 5 frames a second, each the newest one that had arrived
        assert len(calls) <= elapsed * 5 + 1
        assert len(calls) < 10
        gaps = [b[0] - a[0] for a, b in zip(returned, returned[1:], strict=False)]
        assert min(gaps) >= 0.15
        assert [pts for _, pts in returned] == sorted(pts for _, pts in returned)

    @pytest.mark.asyncio
    @pytest.mark.parametrize("mirror", [True, False])
    async def test_mirrored_webcam_gives_the_handler_mirrored_frames(self, mirror):
        received = []

        def handler(frame):
            received.append(frame)
            return frame

        cb = self.callback(handler, mirror=mirror)
        cb.frame_queue.put_nowait(left_column_frame())
        await cb.recv()
        # What the preview showed: the white column is now on the right
        assert received[0][0, -1 if mirror else 0, 0] == 255
        # Handlers draw on it in place (e.g. with OpenCV)
        assert received[0].flags.c_contiguous

    @pytest.mark.asyncio
    async def test_mirrored_webcam_gives_video_receive_mirrored_frames(self):
        from gradio.webrtc.tracks import HandlerVideoTrack
        from gradio.webrtc.utils import Context

        released = asyncio.Event()
        received = []

        class Handler(VideoStreamHandler):
            def video_receive(self, frame):
                received.append(frame)

            def video_emit(self):
                pass

        track = HandlerVideoTrack(
            OneFrame(left_column_frame(), released),
            event_handler=cast(Callable, Handler()),
            context=Context("id"),
            mirror=True,
        )
        track.channel_set.set()
        processing = asyncio.create_task(track.process_frames())
        deadline = time.monotonic() + 2
        while not received and time.monotonic() < deadline:
            await asyncio.sleep(0.01)
        track.stop()
        released.set()
        await asyncio.wait_for(processing, 2)
        assert received[0][0, -1, 0] == 255

    @pytest.mark.parametrize(
        "shape, dtype, top",
        [
            # gr.Image takes both; the alpha channel is dropped
            ((16, 16), "uint8", 255),
            ((16, 16, 4), "uint8", 255),
            # e.g. a model's output in [0, 1]
            ((16, 16, 3), "float32", 1.0),
            ((16, 16, 3), "uint16", 65535),
        ],
    )
    def test_frames_are_sent_as_rgb_like_gr_image(self, shape, dtype, top):
        import numpy as np

        from gradio.webrtc.tracks import rgb_frame

        # What both VideoCallback and ServerToClientVideo send a returned
        # array as
        array = np.zeros(shape, dtype=dtype)
        array[0] = top
        sent = rgb_frame(array).to_ndarray(format="rgb24")
        assert sent.shape == (16, 16, 3)
        assert sent[0, 0].tolist() == [255, 255, 255]
        assert sent[-1, 0].tolist() == [0, 0, 0]

    @pytest.mark.asyncio
    @pytest.mark.parametrize("kind", ["video", "receive-video", "audio"])
    async def test_a_failed_handler_ends_the_track_for_aiortc(self, kind):
        from gradio.webrtc.tracks import AudioCallback, ServerToClientVideo
        from gradio.webrtc.utils import Context, HandlerFailedError

        def broken(*args):
            raise ValueError("broken")

        def generate():
            yield broken()

        class SyncStartUp(EchoHandler):
            def start_up(self):  # type: ignore
                pass

        if kind == "receive-video":
            track = ServerToClientVideo(generate, context=Context("id"))
            track.set_args([])
        elif kind == "audio":
            # An async handler refuses to run a sync start_up
            handler = SyncStartUp()
            handler.channel_set.set()
            track = AudioCallback(
                AudioStreamTrack(), event_handler=handler, context=Context("id")
            )
        else:
            track = self.callback(broken)
            track.frame_queue.put_nowait(video_frame(0))
        with pytest.raises(HandlerFailedError) as raised:
            await asyncio.wait_for(track.recv(), 2)
        # The error has been reported already; aiortc's sender takes a
        # MediaStreamError as the end of the track instead of logging it again
        assert isinstance(raised.value, MediaStreamError)

    @pytest.mark.asyncio
    async def test_a_receive_function_that_returns_a_frame_says_so(self):
        import numpy as np

        from gradio.webrtc.tracks import ServerToClientVideo
        from gradio.webrtc.utils import Context, HandlerFailedError

        def frame():
            return np.zeros((16, 16, 3), dtype=np.uint8)

        track = ServerToClientVideo(frame, context=Context("id"))
        track.set_args([])
        with pytest.raises(HandlerFailedError, match="must be a generator"):
            await asyncio.wait_for(track.recv(), 2)

    @pytest.mark.asyncio
    async def test_a_slow_video_receive_gets_the_newest_frame(self):
        import fractions

        import numpy as np
        from aiortc.mediastreams import MediaStreamError
        from av import VideoFrame

        from gradio.webrtc.tracks import HandlerVideoTrack
        from gradio.webrtc.utils import Context

        sent = 0
        done = asyncio.Event()

        class Camera(VideoStreamTrack):
            async def recv(self):
                nonlocal sent
                if sent == 40:
                    await done.wait()
                    raise MediaStreamError
                await asyncio.sleep(0.005)
                sent += 1
                array = np.full((16, 16, 3), sent, dtype=np.uint8)
                frame = VideoFrame.from_ndarray(array, "rgb24")
                frame.pts, frame.time_base = sent, fractions.Fraction(1, 90000)
                return frame

        received = []

        class Handler(VideoStreamHandler):
            def video_receive(self, frame):
                received.append(int(frame[0, 0, 0]))
                time.sleep(0.05)

            def video_emit(self):
                pass

        track = HandlerVideoTrack(
            Camera(), event_handler=cast(Callable, Handler()), context=Context("id")
        )
        track.channel_set.set()
        processing = asyncio.create_task(track.process_frames())
        deadline = time.monotonic() + 5
        while 40 not in received and time.monotonic() < deadline:
            await asyncio.sleep(0.01)
        track.stop()
        done.set()
        await asyncio.wait_for(processing, 2)
        # A handler slower than the camera skips to the newest frame instead
        # of falling further behind
        assert received[-1] == 40
        assert len(received) < 20
        assert received == sorted(received)

    @pytest.mark.asyncio
    @pytest.mark.parametrize("handler_class", [False, True])
    async def test_frames_that_will_be_skipped_are_not_kept(self, handler_class):
        import threading

        from gradio.webrtc.tracks import HandlerVideoTrack, VideoCallback
        from gradio.webrtc.utils import Context

        busy = threading.Event()
        release = threading.Event()

        def process(frame):
            busy.set()
            release.wait(3)
            return frame

        class Handler(VideoStreamHandler):
            def video_receive(self, frame):
                process(frame)

            def video_emit(self):
                pass

        # 30 frames a second
        camera = VideoStreamTrack()
        if handler_class:
            track = HandlerVideoTrack(
                camera, event_handler=cast(Callable, Handler()), context=Context("id")
            )
            running = asyncio.create_task(track.process_frames())
        else:
            track = VideoCallback(camera, event_handler=process, context=Context("id"))
            track.latest_args = []
            running = asyncio.create_task(track.recv())
        track.channel_set.set()
        try:
            deadline = time.monotonic() + 2
            while not busy.is_set() and time.monotonic() < deadline:
                await asyncio.sleep(0.005)
            await asyncio.sleep(0.3)
            # Of the frames that arrived while the handler was busy, only the
            # newest will be used, so only that one is held
            assert track.frame_queue.qsize() <= 1
        finally:
            release.set()
            track.stop()
            camera.stop()
            await asyncio.gather(running, return_exceptions=True)
            await asyncio.gather(track.accept_input_task, return_exceptions=True)

    @pytest.mark.asyncio
    async def test_video_methods_of_audio_video_handlers_see_the_context(self):
        import numpy as np

        from gradio.webrtc import AudioVideoStreamHandler, get_current_context
        from gradio.webrtc.tracks import HandlerVideoTrack
        from gradio.webrtc.utils import Context

        released = asyncio.Event()

        class Handler(AudioVideoStreamHandler):
            seen = []

            def receive(self, frame):
                pass

            def emit(self):
                pass

            def video_receive(self, frame):
                self.seen.append(("receive", get_current_context().webrtc_id))

            def video_emit(self):
                self.seen.append(("emit", get_current_context().webrtc_id))
                return np.zeros((16, 16, 3), dtype=np.uint8)

        track = HandlerVideoTrack(
            OneFrame(video_frame(0), released),
            event_handler=cast(Callable, Handler()),
            context=Context("id"),
        )
        track.channel_set.set()
        assert await track.recv() is not None
        deadline = time.monotonic() + 2
        while len(Handler.seen) < 2 and time.monotonic() < deadline:
            await asyncio.sleep(0.01)
        track.stop()
        released.set()
        await track.process_task
        assert sorted(Handler.seen) == [("emit", "id"), ("receive", "id")]

    @pytest.mark.asyncio
    async def test_video_emit_may_have_no_frame_yet(self):
        import numpy as np

        from gradio.webrtc.tracks import HandlerVideoTrack
        from gradio.webrtc.utils import Context

        # e.g. while the model starts up, or between two outputs
        returns = [None, AdditionalOutputs(1), np.zeros((16, 16, 3), dtype=np.uint8)]

        class Handler(VideoStreamHandler):
            def video_receive(self, frame):
                pass

            def video_emit(self):
                return returns.pop(0)

        outputs = []
        track = HandlerVideoTrack(
            VideoStreamTrack(),
            event_handler=cast(Callable, Handler()),
            context=Context("id"),
            set_additional_outputs=outputs.append,
            fps=100,
        )
        track.channel_set.set()
        frame = await asyncio.wait_for(track.recv(), 2)
        assert frame.to_ndarray(format="rgb24").shape == (16, 16, 3)
        assert [o.args for o in outputs] == [(1,)]
        track.stop()
        await asyncio.wait_for(track.process_task, 2)

    @pytest.mark.asyncio
    async def test_frames_are_rgb_both_ways(self):
        import fractions

        import numpy as np
        from av import VideoFrame

        from gradio.webrtc.tracks import ServerToClientVideo
        from gradio.webrtc.utils import Context

        red = np.zeros((16, 16, 3), dtype=np.uint8)
        red[..., 0] = 255
        received = []

        def handler(frame):
            received.append(frame)
            return red

        cb = self.callback(handler)
        incoming = VideoFrame.from_ndarray(red, "rgb24")
        incoming.pts, incoming.time_base = 0, fractions.Fraction(1, 90000)
        cb.frame_queue.put_nowait(incoming)
        out = await cb.recv()
        # Like the numpy arrays of gr.Image and gr.Video
        assert received[0][0, 0].tolist() == [255, 0, 0]
        assert out.to_ndarray(format="rgb24")[0, 0].tolist() == [255, 0, 0]

        def generate():
            yield red

        track = ServerToClientVideo(generate, context=Context("id"))
        track.set_args([])
        frame = await track.recv()
        assert frame.to_ndarray(format="rgb24")[0, 0].tolist() == [255, 0, 0]

    @pytest.mark.asyncio
    async def test_sync_handler_does_not_block_the_event_loop(self):
        def slow(frame):
            time.sleep(0.3)
            return frame

        cb = self.callback(slow)
        cb.frame_queue.put_nowait(video_frame(0))
        out, ticks = await count_ticks_while(cb.recv())
        assert out is not None
        assert ticks >= 10

    @pytest.mark.asyncio
    async def test_receive_generator_does_not_block_the_event_loop(self):
        import numpy as np
        from aiortc.mediastreams import MediaStreamError

        from gradio.webrtc.tracks import ServerToClientVideo
        from gradio.webrtc.utils import Context

        def generate():
            for _ in range(2):
                time.sleep(0.3)
                yield np.zeros((16, 16, 3), dtype=np.uint8)

        track = ServerToClientVideo(generate, context=Context("id"))
        track.set_args([])
        frame, ticks = await count_ticks_while(track.recv())
        assert frame is not None
        assert ticks >= 10
        assert await track.recv() is not None
        with pytest.raises(MediaStreamError):
            await track.recv()
        assert track.readyState == "ended"

    @pytest.mark.asyncio
    @pytest.mark.parametrize("kind", ["audio-video", "receive-video", "receive-audio"])
    async def test_a_stopped_track_ends_without_a_handler_error(self, kind, caplog):
        import numpy as np
        from aiortc.mediastreams import MediaStreamError

        from gradio.webrtc import AudioVideoStreamHandler
        from gradio.webrtc.tracks import (
            HandlerVideoTrack,
            ServerToClientAudio,
            ServerToClientVideo,
        )
        from gradio.webrtc.utils import Context

        class Handler(AudioVideoStreamHandler):
            def receive(self, frame):
                pass

            def emit(self):
                pass

            def video_receive(self, frame):
                pass

            def video_emit(self):
                return np.zeros((16, 16, 3), dtype=np.uint8)

        def generate():
            yield np.zeros((16, 16, 3), dtype=np.uint8)

        if kind == "audio-video":
            track = HandlerVideoTrack(
                VideoStreamTrack(),
                event_handler=cast(Callable, Handler()),
                context=Context("id"),
            )
            track.channel_set.set()
        elif kind == "receive-video":
            track = ServerToClientVideo(generate, context=Context("id"))
            track.set_args([])
        else:
            track = ServerToClientAudio(generate, context=Context("id"))
        waiting = None
        if kind == "receive-audio":
            # No inputs yet, so nothing reaches the queue: the stop wakes it
            waiting = asyncio.create_task(track.recv())
            await asyncio.sleep(0.05)
            assert not waiting.done()
        # aiortc asks for one more frame after the track has ended (e.g. at the
        # time limit); MediaStreamError is how a track says it is over
        track.stop()
        if waiting is not None:
            with pytest.raises(MediaStreamError):
                await asyncio.wait_for(waiting, 1)
        with pytest.raises(MediaStreamError):
            await track.recv()
        assert "Error in the stream handler" not in caplog.text

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "kind, end",
        [
            ("video-handler", "close"),
            ("receive-video", "close"),
            ("receive-video", "done"),
            ("receive-audio", "close"),
            ("receive-audio", "done"),
        ],
    )
    async def test_a_track_that_ends_itself_raises_media_stream_error(self, kind, end):
        import numpy as np
        from aiortc.mediastreams import MediaStreamError

        from gradio.webrtc.tracks import (
            HandlerVideoTrack,
            ServerToClientAudio,
            ServerToClientVideo,
        )
        from gradio.webrtc.utils import Context

        media = (
            (24000, np.zeros(4800, dtype=np.int16))
            if kind == "receive-audio"
            else np.zeros((16, 16, 3), dtype=np.uint8)
        )

        def generate():
            yield media
            if end == "close":
                yield CloseStream("bye")

        class Handler(VideoStreamHandler):
            def video_receive(self, frame):
                pass

            def video_emit(self):
                return CloseStream("bye")

        if kind == "video-handler":
            track = HandlerVideoTrack(
                VideoStreamTrack(),
                event_handler=cast(Callable, Handler()),
                context=Context("id"),
            )
            track.channel_set.set()
        else:
            track_class = (
                ServerToClientVideo if kind == "receive-video" else ServerToClientAudio
            )
            track = track_class(generate, context=Context("id"))
            track.set_args([])
        # aiortc's sender would hand a None on to its encoder and log the
        # error; MediaStreamError is how a track says it is over
        with pytest.raises(MediaStreamError):
            for _ in range(50):
                assert await asyncio.wait_for(track.recv(), 2) is not None
        assert track.readyState == "ended"

    @pytest.mark.asyncio
    @pytest.mark.parametrize("kind", ["video", "audio"])
    async def test_receive_generator_can_yield_without_media(self, kind):
        import numpy as np

        from gradio.webrtc.tracks import ServerToClientAudio, ServerToClientVideo
        from gradio.webrtc.utils import AdditionalOutputs, Context

        media = (
            np.zeros((16, 16, 3), dtype=np.uint8)
            if kind == "video"
            else (24000, np.zeros(4800, dtype=np.int16))
        )

        def generate():
            yield AdditionalOutputs("starting")
            yield None
            yield media

        outputs = []
        track_class = ServerToClientVideo if kind == "video" else ServerToClientAudio
        track = track_class(
            generate, context=Context("id"), set_additional_outputs=outputs.append
        )
        track.set_args([])
        assert await asyncio.wait_for(track.recv(), 2) is not None
        assert [o.args for o in outputs] == [("starting",)]
        assert track.readyState == "live"


class TestAudioArrays:
    """Audio goes in and out as (sample_rate, array), like gr.Audio's numpy values."""

    @pytest.mark.asyncio
    @pytest.mark.parametrize("layout, shape", [("mono", (960,)), ("stereo", (960, 2))])
    async def test_receive_gets_gr_audio_arrays(self, layout, shape):
        import fractions

        import av
        import numpy as np
        from aiortc.mediastreams import MediaStreamError

        from gradio.webrtc.tracks import AudioCallback
        from gradio.webrtc.utils import Context

        incoming = av.AudioFrame.from_ndarray(
            np.zeros((1, 960), dtype=np.int16), format="s16", layout="mono"
        )
        incoming.sample_rate = 48000
        incoming.pts, incoming.time_base = 0, fractions.Fraction(1, 48000)

        class OneFrame(AudioStreamTrack):
            frames = [incoming]

            async def recv(self):
                if self.frames:
                    return self.frames.pop()
                raise MediaStreamError

        received = []

        class Handler(AsyncStreamHandler):
            def __init__(self):
                super().__init__(expected_layout=layout, input_sample_rate=48000)

            async def receive(self, frame):
                received.append(frame)

            async def emit(self):
                return None

        track = AudioCallback(
            OneFrame(), event_handler=Handler(), context=Context("id")
        )
        await track.process_input_frames()
        sample_rate, array = received[0]
        assert sample_rate == 48000
        assert array.shape == shape
        assert array.dtype == np.int16

    @pytest.mark.asyncio
    async def test_receive_gets_a_chunk_per_frame_at_its_own_rate(self):
        import fractions

        import av
        import numpy as np
        from aiortc.mediastreams import MediaStreamError

        from gradio.webrtc.tracks import AudioCallback
        from gradio.webrtc.utils import Context

        def frame(i):
            incoming = av.AudioFrame.from_ndarray(
                np.zeros((1, 960), dtype=np.int16), format="s16", layout="mono"
            )
            incoming.sample_rate = 48000
            incoming.pts, incoming.time_base = 960 * i, fractions.Fraction(1, 48000)
            return incoming

        class FiveFrames(AudioStreamTrack):
            frames = [frame(i) for i in range(5)]

            async def recv(self):
                if self.frames:
                    return self.frames.pop(0)
                raise MediaStreamError

        received = []

        class Handler(AsyncStreamHandler):
            def __init__(self):
                super().__init__(input_sample_rate=16000)

            async def receive(self, frame):
                received.append(frame[1].shape)

            async def emit(self):
                return None

        track = AudioCallback(
            FiveFrames(), event_handler=Handler(), context=Context("id")
        )
        await track.process_input_frames()
        # 20 ms chunks as they come in, not 60 ms every third frame
        assert len(received) >= 4
        assert set(received) == {(320,)}

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "kind",
        [
            # The handler's resample()
            "audio",
            # The browser's track.recv(), which VideoCallback.accept_input reads
            # for both video track classes
            "video recv",
            "handler video recv",
            # After the frame arrived, in process_frames()
            "video frame",
        ],
    )
    async def test_an_error_reading_the_input_ends_the_stream(self, kind, monkeypatch):
        import av
        import numpy as np
        from aiortc.mediastreams import MediaStreamError

        from gradio.webrtc.tracks import (
            AudioCallback,
            HandlerVideoTrack,
            VideoCallback,
        )
        from gradio.webrtc.utils import Context, StreamErrors, current_errors

        released = asyncio.Event()

        base = cast(Any, AudioStreamTrack if kind == "audio" else VideoStreamTrack)

        class Input(base):
            sent = False

            async def recv(self):
                if kind.endswith("recv"):  # e.g. a frame the decoder cannot take
                    raise RuntimeError("cannot read the input")
                if not self.sent:
                    self.sent = True
                    if kind == "audio":
                        frame = av.AudioFrame.from_ndarray(
                            np.zeros((1, 960), dtype=np.int16),
                            format="s16",
                            layout="mono",
                        )
                        frame.sample_rate = 48000
                        return frame
                    return video_frame(0)
                await released.wait()
                raise MediaStreamError

        class Audio(AsyncStreamHandler):
            def resample(self, frame):  # e.g. a frame the resampler cannot take
                raise ValueError("cannot read the input")

            async def receive(self, frame):
                pass

            async def emit(self):
                return None

        class Video(VideoStreamHandler):
            def video_receive(self, frame):
                pass

            def video_emit(self):
                return None

        errors = StreamErrors(
            asyncio.get_running_loop(), end_stream=lambda: None, show_error=True
        )
        current_errors.set(errors)
        if kind == "audio":
            track: Any = AudioCallback(
                Input(), event_handler=Audio(), context=Context("id")
            )
            reading = track.process_input_frames()
        elif kind == "video recv":
            track = VideoCallback(
                Input(), event_handler=lambda frame: frame, context=Context("id")
            )
            track.channel_set.set()
            reading = track.process_frames()
        else:
            track = HandlerVideoTrack(
                Input(), event_handler=cast(Callable, Video()), context=Context("id")
            )
            track.channel_set.set()

            def unreadable(frame):  # e.g. a frame in a format it cannot convert
                raise ValueError("cannot read the input")

            if kind == "video frame":
                monkeypatch.setattr(track, "frame_to_array", unreadable)
            reading = track.process_frames()
        try:
            await asyncio.wait_for(reading, 2)
        finally:
            released.set()
        # The page hears it and the stream ends, instead of going quiet
        assert errors.failure is not None
        assert "cannot read the input" in str(errors.failure["error"])
        assert track.thread_quit.is_set()

    @staticmethod
    async def decode(*returned):
        import av

        from gradio.webrtc.utils import GENERATOR_DONE, player_worker_decode

        queue: asyncio.Queue = asyncio.Queue()
        items = [*returned, GENERATOR_DONE]

        async def next_frame():
            return items.pop(0)

        await player_worker_decode(next_frame, queue, asyncio.Event(), None)
        frames = []
        while not queue.empty():
            frames.append(queue.get_nowait())
        return [f for f in frames if isinstance(f, av.AudioFrame)]

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "shapes, dtype",
        [
            # An empty chunk first, e.g. what a TTS model gives for an empty
            # sentence, is skipped
            ([(0,), (4800,)], "int16"),
            ([(4800, 2)], "int16"),
            # np.zeros() and np.linspace() give float64 by default
            ([(4800,)], "float64"),
            ([(4800,)], "uint8"),
        ],
    )
    async def test_emit_takes_gr_audio_arrays(self, shapes, dtype):
        import numpy as np

        # 0.2 s at 24 kHz: enough for the resampler to give out whole frames
        frames = await self.decode(
            *[(24000, np.zeros(shape, dtype=dtype)) for shape in shapes]
        )
        assert sum(f.samples for f in frames) > 0

    @pytest.mark.asyncio
    @pytest.mark.parametrize("samples", [240, 4800, 5000])
    @pytest.mark.parametrize("end", ["done", "close", "close-with-audio"])
    async def test_the_end_of_finite_audio_is_played(self, samples, end):
        import av
        import numpy as np

        from gradio.webrtc.utils import GENERATOR_DONE, player_worker_decode

        chunk = (24000, np.ones(samples, dtype=np.int16))
        if end == "done":
            items = [chunk, GENERATOR_DONE]
        elif end == "close":
            items = [chunk, CloseStream("bye")]
        else:
            items = [(chunk, CloseStream("bye"))]

        async def next_frame():
            return items.pop(0)

        queue: asyncio.Queue = asyncio.Queue()
        await asyncio.wait_for(
            player_worker_decode(next_frame, queue, asyncio.Event(), None), 2
        )
        frames = [
            f
            for f in (queue.get_nowait() for _ in range(queue.qsize()))
            if isinstance(f, av.AudioFrame)
        ]
        # Every sample, resampled to 48 kHz, in whole 20 ms frames (the encoder
        # sends nothing shorter): a 10 ms clip is not silent
        assert {f.samples for f in frames} == {960}
        played = sum(f.samples for f in frames)
        assert samples * 2 <= played < samples * 2 + 960

    @pytest.mark.asyncio
    async def test_receive_audio_buffers_a_bounded_amount_ahead(self):
        import numpy as np

        from gradio.webrtc.tracks import ServerToClientAudio
        from gradio.webrtc.utils import RECEIVE_AUDIO_BUFFER, Context

        def generate():
            # Much faster than real time, and endless
            while True:
                yield (48000, np.zeros(960, dtype=np.int16))

        track = ServerToClientAudio(generate, context=Context("id"))
        track.set_args([])
        await track.start()
        await asyncio.sleep(0.2)
        assert track.queue.qsize() <= RECEIVE_AUDIO_BUFFER
        # A decoder waiting for room in the queue still stops
        track.stop()
        await asyncio.wait_for(track.decode_task, 1)

    @pytest.mark.asyncio
    async def test_receive_audio_keeps_its_pace_after_a_pause(self):
        import numpy as np

        from gradio.webrtc.tracks import ServerToClientAudio
        from gradio.webrtc.utils import Context

        def generate():
            for i in range(10):
                if i == 5:
                    # e.g. a model call between two sentences
                    time.sleep(0.5)
                yield (48000, np.zeros(960, dtype=np.int16))

        track = ServerToClientAudio(generate, context=Context("id"))
        track.set_args([])
        returned = []
        for _ in range(10):
            await asyncio.wait_for(track.recv(), 2)
            returned.append(time.monotonic())
        track.stop()
        # The audio after the pause plays in real time (20 ms a frame), not
        # all at once to catch up with the clock
        assert returned[9] - returned[5] > 0.06

    @pytest.mark.asyncio
    async def test_receive_video_starts_its_pace_once_the_inputs_arrive(self):
        import numpy as np

        from gradio.webrtc.tracks import ServerToClientVideo
        from gradio.webrtc.utils import Context

        def generate():
            while True:
                yield np.zeros((16, 16, 3), dtype=np.uint8)

        track = ServerToClientVideo(generate, context=Context("id"), fps=30)
        first = asyncio.ensure_future(track.recv())
        # The page sends the inputs once the data channel opens
        await asyncio.sleep(0.5)
        track.set_args([])
        await asyncio.wait_for(first, 2)
        start = time.monotonic()
        for _ in range(5):
            await asyncio.wait_for(track.recv(), 2)
        track.stop()
        # 30 fps from the first frame on, not a catch-up burst
        assert time.monotonic() - start > 0.1

    @pytest.mark.asyncio
    @pytest.mark.parametrize("audio", [None, 0, 4800])
    async def test_close_stream_is_the_last_call_of_the_handler(self, audio):
        import numpy as np

        from gradio.webrtc.utils import player_worker_decode

        chunk = (24000, np.zeros(4800, dtype=np.int16))
        last = (
            CloseStream("bye")
            if audio is None
            else ((24000, np.zeros(audio, dtype=np.int16)), CloseStream("bye"))
        )
        calls = 0

        async def emit():
            nonlocal calls
            calls += 1
            return last if calls == 1 else chunk

        queue: asyncio.Queue = asyncio.Queue()
        # Nothing reads the queue here, as when the track has not yet played
        # what comes before the CloseStream
        await asyncio.wait_for(
            player_worker_decode(emit, queue, asyncio.Event(), None), 2
        )
        assert calls == 1
        items = [queue.get_nowait() for _ in range(queue.qsize())]
        assert isinstance(items[-1], CloseStream)

    @pytest.mark.asyncio
    async def test_an_emit_with_nothing_ready_is_not_called_in_a_busy_loop(self):
        from gradio.webrtc.utils import player_worker_decode

        calls = 0

        async def emit():
            # Nothing is ready, every time
            nonlocal calls
            calls += 1

        stop = asyncio.Event()
        decoder = asyncio.create_task(
            player_worker_decode(emit, asyncio.Queue(), stop, None)
        )
        await asyncio.sleep(0.1)
        stop.set()
        await asyncio.wait_for(decoder, 1)
        # On Python 3.12+, such a loop would keep the event loop to itself
        assert calls < 50

    @pytest.mark.asyncio
    async def test_a_slow_emit_is_waited_for_until_the_stream_stops(self, monkeypatch):
        from gradio.webrtc import utils
        from gradio.webrtc.utils import GENERATOR_DONE, player_worker_decode

        monkeypatch.setattr(utils, "SLOW_EMIT_WARNING", 0.05)
        calls = 0

        async def slow():
            nonlocal calls
            calls += 1
            await asyncio.sleep(0.3)
            return GENERATOR_DONE

        await asyncio.wait_for(
            player_worker_decode(slow, asyncio.Queue(), asyncio.Event(), None), 2
        )
        # A second call would run next to the first, which cannot be stopped
        # when it runs in a worker thread
        assert calls == 1

        async def never():
            await asyncio.Event().wait()

        stop = asyncio.Event()
        decoder = asyncio.create_task(
            player_worker_decode(never, asyncio.Queue(), stop, None)
        )
        await asyncio.sleep(0.05)
        stop.set()
        await asyncio.wait_for(decoder, 1)

    @pytest.mark.parametrize("dtype", ["int32", "uint8", "int8", "uint16"])
    def test_integer_arrays_are_scaled_like_gr_audio(self, dtype):
        import warnings

        import numpy as np

        from gradio.processing_utils import convert_to_16_bit_audio
        from gradio.webrtc import audio_to_float32, audio_to_int16

        info = np.iinfo(dtype)
        audio = np.array([info.min, 0, info.max // 2, info.max], dtype=dtype)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            expected = convert_to_16_bit_audio(audio)
        np.testing.assert_array_equal(audio_to_int16(audio), expected)
        np.testing.assert_allclose(audio_to_float32(audio), expected / 32768.0)

    def test_float_arrays_keep_their_level(self):
        import numpy as np

        from gradio.webrtc import audio_to_float32, audio_to_int16

        # gr.Audio scales each numpy value to its own peak; a stream keeps the
        # level of every chunk
        quiet = np.full(4, 0.1, dtype=np.float32)
        assert audio_to_int16(quiet)[0] == 3276
        # Without clipping, 1.02 would wrap around to a large negative value
        audio = np.array([1.02, -1.5, np.nan], dtype=np.float32)
        np.testing.assert_array_equal(audio_to_int16(audio), [32767, -32767, 0])
        for dtype in ("float64", "float16"):
            audio = np.array([0.5, -0.5], dtype=dtype)
            assert audio_to_float32(audio).dtype == np.float32
            np.testing.assert_allclose(audio_to_float32(audio), [0.5, -0.5])
            np.testing.assert_array_equal(audio_to_int16(audio), [16383, -16383])

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "returned",
        [
            # FastRTC's channels-first arrays and explicit layout
            (24000, "channels-first"),
            (24000, "with-layout"),
        ],
    )
    async def test_old_audio_layouts_are_rejected(self, returned):
        import numpy as np

        from gradio.webrtc.utils import HandlerFailedError

        sample_rate, kind = returned
        if kind == "channels-first":
            item = (sample_rate, np.zeros((2, 480), dtype=np.float32))
        else:
            item = (sample_rate, np.zeros((2, 480), dtype=np.float32), "stereo")
        with pytest.raises(HandlerFailedError):
            await self.decode(item)


class TestCleanUp:
    class FailingClose:
        def __init__(self):
            self.connectionState = "connected"  # as aiortc names it

        async def close(self):
            raise RuntimeError("close failed")

    @pytest.mark.asyncio
    async def test_a_failing_close_still_cleans_up_the_stream(self, monkeypatch):
        monkeypatch.setattr(webrtc_connection, "WATCH_INTERVAL", 0.01)
        forget_earlier_streams()
        manager = rtc_manager()
        event, handle = queue_event(session_hash="s")
        registry = unit_registry()
        assert manager.admit("one", handle, registry)
        stream = stream_of(manager, "one")
        attach(
            manager,
            "one",
            pc=cast(Any, self.FailingClose()),
            tracks=[TestVideoTracks.callback(flip)],
        )
        event.alive = False
        watcher = stream.watcher
        assert watcher is not None
        with pytest.raises(RuntimeError, match="close failed"):
            await asyncio.wait_for(watcher, 2)
        assert not stream.tracks
        assert not has_stream(manager, "one")
        assert "one" not in registry.streams
        assert "event" not in registry.by_event

    @pytest.mark.asyncio
    async def test_an_error_while_watching_ends_the_stream_not_its_admission(
        self, monkeypatch
    ):
        monkeypatch.setattr(webrtc_connection, "WATCH_INTERVAL", 0.01)
        forget_earlier_streams()
        manager = rtc_manager()
        event, handle = queue_event(session_hash="s")
        registry = unit_registry()
        assert manager.admit("one", handle, registry)
        stream = stream_of(manager, "one")

        def broken():
            raise RuntimeError("watch failed")

        monkeypatch.setattr(stream.lease, "remaining_time", broken)
        deadline = time.monotonic() + 2
        while not stream.ended and time.monotonic() < deadline:
            await asyncio.sleep(0.01)
        # The stream ends; the event, still live, keeps it as its admitted one,
        # so its next call finishes it instead of admitting the id again
        assert stream.ended
        assert registry.by_event.get("event") is stream
        event.alive = False
        assert stream.watcher is not None
        await asyncio.wait_for(stream.watcher, 2)
        assert "event" not in registry.by_event

    @pytest.mark.asyncio
    async def test_an_event_that_is_over_admits_no_stream(self, caplog):
        forget_earlier_streams()
        manager = rtc_manager()
        event, handle = queue_event(session_hash="s")
        # E.g. a call still under way when the page session closed, after the
        # stream's watcher let go of the event's admission
        event.alive = False
        # Keys the app's stream registry, so not a SimpleNamespace
        queue = cast(Any, UnitQueue())
        queue.event_handle = lambda _: handle
        blocks_token = LocalContext.blocks.set(cast(Any, SimpleNamespace(_queue=queue)))
        event_token = LocalContext.event_id.set("event")
        try:
            # The event's run ends at once instead of holding its place, with
            # a step that changes nothing
            run = webrtc_connection.stream_run(manager, "one")
            assert [x async for x in run] == [None]
        finally:
            LocalContext.event_id.reset(event_token)
            LocalContext.blocks.reset(blocks_token)
        assert event.closed
        assert not has_stream(manager, "one")
        # The page's offer is refused later without the reason, so the server
        # logs it
        assert "Did not admit stream 'one' of event event: its event is over" in (
            caplog.text
        )

    def test_input_for_a_stream_id_that_is_not_a_string_is_ignored(self):
        unit_registry()
        token = LocalContext.blocks.set(cast(Any, SimpleNamespace(_queue=_unit_queue)))
        try:
            # E.g. the extra inputs' event, called with a crafted id that
            # cannot even be a dict key
            webrtc_connection.set_input(cast(Any, [1]), "s", 0.5)
        finally:
            LocalContext.blocks.reset(token)

    @pytest.mark.asyncio
    async def test_closing_a_stream_of_a_forgotten_session_keeps_no_state(self):
        from gradio.processing.worker import Worker
        from gradio.state_holder import StateHolder

        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])
        state_holder = StateHolder()
        state_holder.set_blocks(demo)
        worker = SimpleNamespace(
            app=SimpleNamespace(state_holder=state_holder), blocks=demo
        )
        stream_fn = next(f for f in demo.fns.values() if f.connection == "stream")
        closed = await Worker.run_close_stream(
            cast(Any, worker),
            {"session_hash": "gone", "fn_index": stream_fn._id, "event_id": "e"},
        )
        assert closed is False
        assert "gone" not in state_holder

    @pytest.mark.asyncio
    async def test_clean_up_stops_every_track(self):
        # Whichever path notices the end first (ICE failure, a closed
        # connection, an ended track) stops all tracks of the connection
        manager = rtc_manager()
        tracks = [TestVideoTracks.callback(flip) for _ in range(2)]
        attach(manager, "one", tracks=tracks)
        end_stream(manager, "one")
        assert [track.readyState for track in tracks] == ["ended", "ended"]
        assert not tracks_of(manager, "one")

    @pytest.mark.asyncio
    async def test_a_handler_error_ends_its_stream_once(self):
        from gradio.webrtc.utils import StreamErrors

        ended = []
        errors = StreamErrors(
            asyncio.get_running_loop(), end_stream=lambda: ended.append(True)
        )
        # Several handler threads may fail at once; the first error stays
        errors.fail(gr.Error("first"))
        errors.fail(gr.Error("second"))
        await asyncio.sleep(0)
        assert errors.failure is not None
        assert errors.failure["error"] == "first"
        assert ended == [True]

    @pytest.mark.asyncio
    async def test_a_shutdown_that_never_ends_delays_only_the_next_stream(
        self, monkeypatch
    ):
        monkeypatch.setattr(webrtc_connection, "SHUTDOWN_WAIT", 0.2)
        manager = rtc_manager()
        # e.g. a receive-mode generator blocked in next(), which closing waits for
        manager._add_shutdown(asyncio.Event().wait())
        started = time.monotonic()
        await manager._wait_for_shutdowns()
        assert time.monotonic() - started >= 0.2
        started = time.monotonic()
        await manager._wait_for_shutdowns()
        assert time.monotonic() - started < 0.1
        for task in manager.tasks:
            task.cancel()

    @pytest.mark.asyncio
    async def test_clean_up_releases_a_handler_waiting_for_its_inputs(self):
        from gradio.webrtc.tracks import AudioCallback
        from gradio.webrtc.utils import Context

        handler = EchoHandler()
        handler._loop = asyncio.get_running_loop()
        manager = rtc_manager()
        attach(
            manager,
            "one",
            tracks=[
                AudioCallback(
                    AudioStreamTrack(), event_handler=handler, context=Context("one")
                )
            ],
        )
        waiting = asyncio.create_task(handler.wait_for_args())
        await asyncio.sleep(0.05)
        assert not waiting.done()
        end_stream(manager, "one")
        await asyncio.wait_for(waiting, 1)
        await manager._wait_for_shutdowns()
        # A last call of the handler (e.g. a sync emit() in its thread) may
        # reach wait_for_args() only now, after shutdown(). Nothing will send
        # inputs any more, so it must not block for good.
        await asyncio.wait_for(handler.wait_for_args(), 1)

    @pytest.mark.asyncio
    @pytest.mark.parametrize("kind", ["audio", "video", "video handler"])
    async def test_a_send_mode_reader_ends_with_its_track(self, kind):
        from gradio.webrtc.tracks import AudioCallback, HandlerVideoTrack
        from gradio.webrtc.utils import Context

        # In mode="send" nothing plays the output, so the server reads the
        # track itself; that reader must not outlive the stream
        if kind == "audio":
            # Like speech to text: emit() gives no audio, only outputs
            handler = SyncHandler()
            handler._loop = asyncio.get_running_loop()
            handler.channel_set.set()
            track = AudioCallback(
                AudioStreamTrack(), event_handler=handler, context=Context("one")
            )
            reader = asyncio.create_task(
                webrtc_connection.ConnectionManager._drain(track)
            )
        elif kind == "video":
            track = TestVideoTracks.callback(flip, mode="send")
            reader = asyncio.create_task(track.start())
        else:
            # Like a captioner: video_emit() gives no frame, only outputs
            track = HandlerVideoTrack(
                VideoStreamTrack(),
                event_handler=cast(Callable, CaptionVideo()),
                context=Context("one"),
            )
            track.channel_set.set()
            reader = asyncio.create_task(
                webrtc_connection.ConnectionManager._drain(track)
            )
        await asyncio.sleep(0.2)
        assert not reader.done()
        track.stop()
        await asyncio.wait_for(reader, 2)

    @pytest.mark.asyncio
    async def test_receive_audio_waits_for_its_inputs_outside_a_thread(self):
        import numpy as np

        from gradio.webrtc.tracks import ServerToClientAudio
        from gradio.webrtc.utils import Context

        def generate():
            yield (24000, np.zeros(480, dtype=np.int16))

        track = ServerToClientAudio(generate, context=Context("id"))
        waiting = asyncio.create_task(track.next_in_thread())
        await asyncio.sleep(0.05)
        assert not waiting.done()
        # A wait in a worker thread could not be called off, and the thread
        # would stay blocked if the inputs never came
        waiting.cancel()
        with pytest.raises(asyncio.CancelledError):
            await waiting
        track.set_args([])
        chunk = await asyncio.wait_for(track.next_in_thread(), 1)
        assert chunk is not None
        assert chunk[0] == 24000

    @pytest.mark.asyncio
    @pytest.mark.parametrize("modality", ["video", "audio"])
    async def test_clean_up_closes_a_receive_generator(self, modality):
        import threading

        import numpy as np

        from gradio.webrtc.tracks import ServerToClientAudio, ServerToClientVideo
        from gradio.webrtc.utils import Context

        def frame():
            if modality == "video":
                return np.zeros((16, 16, 3), dtype=np.uint8)
            return 48000, np.zeros(960, dtype=np.int16)

        resume = threading.Event()
        released = []

        def generate():
            try:
                yield frame()
                # Still running in a worker thread when the stream ends
                resume.wait(5)
                while True:
                    yield frame()
            finally:
                released.append(True)

        manager = webrtc_connection.ConnectionManager(
            handler=generate,
            mode="receive",
            modality=modality,
            time_limit=None,
            allow_extra_tracks=False,
            server_rtc_configuration=None,
        )
        if modality == "video":
            track = ServerToClientVideo(generate, context=Context("one"))
        else:
            track = ServerToClientAudio(generate, context=Context("one"))
        attach(manager, "one", tracks=[track])
        track.set_args([])
        await track.recv()
        pending = asyncio.create_task(track.recv())
        await asyncio.sleep(0.2)
        end_stream(manager, "one")
        resume.set()
        # A finally block or a with statement in the generator releases what
        # it holds when the stream ends, before the next stream starts
        await manager._wait_for_shutdowns()
        assert released == [True]
        pending.cancel()
        await asyncio.gather(pending, return_exceptions=True)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "executor, mode", [("thread", "send-receive"), ("process", "send")]
)
async def test_a_server_webrtc_endpoint_streams_like_the_component(executor, mode):
    forget_earlier_streams()
    server = gr.Server()

    if mode == "send":
        # Camera in, values out, with a handler class that keeps state for the
        # stream (like a captioner with one GPU allocation per stream)
        server.webrtc(CaptionVideo, name="echo", mode="send", time_limit=30)
        expected = [1.0]
    else:

        @server.webrtc(name="echo", time_limit=30)
        def echo(frame, *args):
            return (frame, AdditionalOutputs(*args)) if args else frame

        expected = [0.5]

    session = "visitor"
    _, local_url, _ = server.launch(prevent_thread_lock=True, executor=executor)
    api = f"{local_url.rstrip('/')}{API_PREFIX}"
    messages: list[dict] = []
    pc = RTCPeerConnection()
    try:
        async with httpx2.AsyncClient(timeout=10) as http:
            config = (await http.get(f"{local_url.rstrip('/')}/config")).json()
            fn_index = next(
                d["id"] for d in config["dependencies"] if d["api_name"] == "echo"
            )

            async def read():
                async with http.stream(
                    "GET", f"{api}/queue/data", params={"session_hash": session}
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data:"):
                            messages.append(json.loads(line[5:]))

            join = await http.post(
                f"{api}/queue/join",
                json={"data": ["one"], "fn_index": fn_index, "session_hash": session},
            )
            event_id = join.json()["event_id"]
            # After the join, as clients do: a message stream opened before the
            # server knows the session is refused (404, session_not_found)
            reader = asyncio.create_task(read())
            # Once the turn has come: the configuration, then the connection
            rtc = await http.post(
                f"{api}/webrtc/rtc_configuration",
                json={"webrtc_id": "one", "session_hash": session},
            )
            assert rtc.json() == {}
            channel = pc.createDataChannel("text")

            def send_inputs(*_):
                channel.send(json.dumps({"type": "input", "data": [0.5]}))

            # The client sends the raw input values once the channel is open,
            # and again whenever a handler asks for them
            channel.on("open", send_inputs)
            channel.on(
                "message",
                lambda m: json.loads(m)["type"] == "send_input" and send_inputs(),
            )
            pc.addTrack(VideoStreamTrack())
            await pc.setLocalDescription(await pc.createOffer())
            answer = (
                await http.post(
                    f"{api}/webrtc/offer",
                    json={
                        "sdp": pc.localDescription.sdp,
                        "type": pc.localDescription.type,
                        "webrtc_id": "one",
                        "session_hash": session,
                    },
                )
            ).json()
            assert answer["type"] == "answer", answer
            if mode == "send":
                assert "a=recvonly" in answer["sdp"]
            await pc.setRemoteDescription(
                RTCSessionDescription(answer["sdp"], answer["type"])
            )

            def streamed():
                return [
                    m["output"]["data"][0]
                    for m in messages
                    if m.get("event_id") == event_id
                    and m.get("msg") == "process_streaming"
                ]

            deadline = time.monotonic() + 15
            while expected not in streamed():
                assert time.monotonic() < deadline, messages
                await asyncio.sleep(0.05)
            # Each AdditionalOutputs arrives as the list of its values; the
            # other messages (the turn) carry a no-op update
            assert all(o in (expected, {"__type__": "update"}) for o in streamed())

            await http.post(f"{api}/stream/{event_id}/close")
            deadline = time.monotonic() + 10
            while not any(
                m.get("event_id") == event_id and m.get("msg") == "process_completed"
                for m in messages
            ):
                assert time.monotonic() < deadline, messages
                await asyncio.sleep(0.05)
            reader.cancel()
    finally:
        await pc.close()
        gr.close_all()


def test_a_server_webrtc_handler_that_takes_the_token_asks_for_sign_in():
    from gradio.server import _takes_oauth

    def with_token(frame, token: gr.OAuthToken | None):
        return frame

    class WithProfile(EchoHandler):
        async def start_up(self, profile: gr.OAuthProfile | None):  # type: ignore[override]
            pass

    # A handler function, a handler class (in its start_up) and VideoOptions
    assert _takes_oauth(with_token)
    assert _takes_oauth(WithProfile)
    assert _takes_oauth(VideoOptions(with_token))
    assert not _takes_oauth(flip)
    server = gr.Server()
    server.webrtc(with_token, name="echo")
    assert with_token in server._oauth_candidates()


@pytest.mark.asyncio
@pytest.mark.parametrize("executor", ["thread", "process"])
async def test_a_server_webrtc_stream_gets_the_visitor_oauth_token(executor):
    pytest.importorskip("authlib")
    forget_earlier_streams()

    def issue_credentials(token: gr.OAuthToken | None):
        return {"iceServers": [], "signed_in": token is not None}

    server = gr.Server()

    @server.webrtc(name="echo", rtc_configuration=issue_credentials)
    def echo(frame):
        return frame

    @server.api(name="whoami")
    def whoami(profile: gr.OAuthProfile | None) -> str:
        return profile.username if profile else "nobody"

    _, local_url, _ = server.launch(prevent_thread_lock=True, executor=executor)
    try:
        async with httpx2.AsyncClient(timeout=10, base_url=local_url) as http:
            # gr.Server has the login routes, since a function takes the token
            login = await http.get("login/callback", params={"_target_url": "/"})
            http.cookies.set("session", login.cookies["session"])
            # and its api() functions get the signed-in visitor too
            call = await http.post(
                f"{API_PREFIX.lstrip('/')}/call/whoami", json={"data": []}
            )
            result = await http.get(
                f"{API_PREFIX.lstrip('/')}/call/whoami/{call.json()['event_id']}"
            )
            assert "event: complete" in result.text
            assert "nobody" not in result.text
            config = (await http.get("config")).json()
            fn_index = next(
                d["id"] for d in config["dependencies"] if d["api_name"] == "echo"
            )
            await http.post(
                f"{API_PREFIX.lstrip('/')}/queue/join",
                json={"data": ["one"], "fn_index": fn_index, "session_hash": "s"},
            )
            rtc = await http.post(
                f"{API_PREFIX.lstrip('/')}/webrtc/rtc_configuration",
                json={"webrtc_id": "one", "session_hash": "s"},
            )
        assert rtc.json() == {"iceServers": [], "signed_in": True}
    finally:
        gr.close_all()


def test_server_webrtc_checks_the_handler_when_it_is_declared():
    server = gr.Server()
    with pytest.raises(ValueError, match="StreamHandler"):

        @server.webrtc(modality="audio")
        def not_a_handler(audio):
            return audio

    with pytest.raises(ValueError, match="mode must be"):
        server.webrtc(flip, mode="both")  # type: ignore[arg-type]
    assert server._deferred_webrtc == []


@pytest.mark.parametrize("other", ["api", "webrtc"])
def test_a_server_webrtc_endpoint_needs_a_name_of_its_own(other):
    from gradio.events import api as gr_api
    from gradio.webrtc.endpoint import server_stream

    def flip_text(text: str) -> str:  # an endpoint that is not a stream
        return text[::-1]

    server = gr.Server()
    if other == "api":
        server.api(flip_text, name="flip")
    else:
        server.webrtc(flip)
    # Found where the clash is written
    with pytest.raises(ValueError, match="'flip' already exists"):
        server.webrtc(flip)
    # An endpoint declared after the stream is found when the app is built
    late = gr.Server()
    late.webrtc(flip)
    late.api(flip_text, name="flip")
    with gr.Blocks(mode="server"):
        for fn, api_kwargs in late._deferred_apis:
            gr_api(fn=fn, **api_kwargs)
        with pytest.raises(ValueError, match="'flip' already exists"):
            for webrtc_kwargs in late._deferred_webrtc:
                server_stream(**webrtc_kwargs)
