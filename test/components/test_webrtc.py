import asyncio
import gc
import json
import pickle
import time
from collections.abc import Callable
from contextlib import closing
from types import SimpleNamespace
from typing import cast

import httpx2
import pytest
import pytest_asyncio
from aiortc import (
    AudioStreamTrack,
    RTCPeerConnection,
    RTCSessionDescription,
    VideoStreamTrack,
)

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
from gradio.webrtc.connection import get_manager


def flip(frame, *args):
    return frame


async def admitted_anyway(webrtc_id, session_hash):
    return True


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


class FailOnEmit(SyncHandler):
    def emit(self):
        raise gr.Error("Bad audio")


def fail_then_audio(*args):
    raise gr.Error("Bad audio")
    yield


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
        assert set(config["server_fns"]) == {"get_rtc_configuration", "offer"}
        # Only the offer starts GPU work, so only its calls wait for the
        # visitor's ZeroGPU headers
        assert config["zerogpu_server_fns"] == ["offer"]
        assert "zerogpu_server_fns" not in gr.FileExplorer().get_config()
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

    def test_a_label_left_as_none_keeps_the_default(self):
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
            with pytest.raises(ValueError, match="VideoStreamHandler"):
                video.stream(EchoHandler, inputs=[video], outputs=[video])
            with pytest.raises(ValueError, match="StreamHandler or AsyncStreamHandler"):
                audio.stream(RecordingVideo, inputs=[audio], outputs=[audio])
            with pytest.raises(ValueError, match="copy"):
                video.stream(RecordingVideo(), inputs=[video], outputs=[video])
            send = gr.WebRTC(mode="send")
            with pytest.raises(ValueError, match="send-receive"):
                send.stream(RecordingVideo, inputs=[send], outputs=[send])
            receive = gr.WebRTC(mode="receive")
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
            with pytest.raises(ValueError, match="once per WebRTC component"):
                video.stream(flip, inputs=[video], outputs=[video, slider])
        with pytest.raises(AttributeError, match="Blocks context"):
            gr.WebRTC().stream(flip, inputs=[], outputs=[])

    @pytest.mark.parametrize("handler", [RecordingVideo, AsyncRecordingVideo])
    def test_video_streams_take_a_video_handler_class(self, handler):
        with gr.Blocks():
            video = gr.WebRTC()
            video.stream(handler, inputs=[video], outputs=[video])
            options = gr.WebRTC()
            options.stream(
                VideoOptions(flip, fps=5), inputs=[options], outputs=[options]
            )

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
        assert (webrtc._id, "state_change") not in triggers

        # In mode="receive" the stream event still carries the connection id
        receive_stream = triggers[(receive._id, "stream")]
        assert [i._id for i in receive_stream.inputs] == [receive._id]
        assert receive_stream.concurrency_limit == "default"
        assert (receive._id, "tick") in triggers
        assert triggers[(button._id, "click")].api_visibility == "private"

        assert webrtc.get_config()["time_limit"] == 30
        manager = get_manager(webrtc._id)
        assert manager is not None
        assert manager.time_limit == 30
        assert get_manager(receive._id).mode == "receive"

    def test_default_concurrency_limit_comes_from_the_queue(self):
        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])
        demo.queue(default_concurrency_limit=3)
        stream = next(fn for fn in demo.fns.values() if fn.name == "_run_stream")
        demo._queue.create_event_queue_for_fn(stream)
        event_queue = demo._queue.event_queue_per_concurrency_id[stream.concurrency_id]
        assert event_queue.concurrency_limit == 3

    @pytest.mark.asyncio
    async def test_run_stream_admits_then_delivers_outputs_in_order(self):
        from gradio.context import LocalContext

        class FakeEvent:
            _id = "event"
            alive = True
            closed = False

            def __init__(self, manager):
                self.signal = asyncio.Event()
                # Each call serves the stream through its event's own manager
                self.fn = SimpleNamespace(webrtc_manager=manager)

        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            number = gr.Number()
            text = gr.Textbox()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc, number, text])
        manager = get_manager(webrtc._id)
        event = FakeEvent(manager)
        queue = SimpleNamespace(event_ids_to_events={"event": event})
        demo._queue = queue  # type: ignore
        blocks_token = LocalContext.blocks.set(demo)
        event_token = LocalContext.event_id.set("event")
        try:
            skip = gr.skip()
            assert await webrtc._run_stream("abc") == (skip, skip, skip)
            assert manager.sessions["abc"].event is event
            # A hot reload gives the event a new function, whose manager never
            # saw the stream; the stream stays with the one that admitted it
            event.fn = SimpleNamespace(webrtc_manager=TestCleanUp.manager())

            # Every output is delivered, oldest first, one per call; a call
            # that leaves outputs behind wakes the event again
            set_outputs = manager._output_setter("abc")
            set_outputs(AdditionalOutputs(1, "a"))
            set_outputs(AdditionalOutputs(2, "b"))
            event.signal.clear()
            assert await webrtc._run_stream("abc") == (skip, 1, "a")
            assert event.signal.is_set()
            event.signal.clear()
            assert await webrtc._run_stream("abc") == (skip, 2, "b")
            assert not event.signal.is_set()
            assert await webrtc._run_stream("abc") == (skip, skip, skip)

            # A later call (a chunk) cannot admit another stream through the
            # same event, and still serves the stream it admitted
            set_outputs(AdditionalOutputs(3, "c"))
            assert await webrtc._run_stream("other") == (skip, 3, "c")
            assert "other" not in manager.sessions

            # A stream that ends still delivers what it emitted before, and
            # its event finishes once nothing is pending
            set_outputs(AdditionalOutputs(5, "e"))
            set_outputs(AdditionalOutputs(6, "f"))
            manager.end("abc")
            assert not event.closed
            assert await webrtc._run_stream("abc") == (skip, 5, "e")
            assert not event.closed
            assert await webrtc._run_stream("abc") == (skip, 6, "f")
            assert event.closed

            set_outputs(AdditionalOutputs(4))
            with pytest.raises(ValueError, match="2 outputs besides"):
                await webrtc._run_stream("abc")

            # Another queue event that joins with an id already in use ends at
            # once instead of holding a place it can never use
            other = FakeEvent(manager)
            other._id = "other"
            queue.event_ids_to_events["other"] = other
            other_token = LocalContext.event_id.set("other")
            try:
                assert await webrtc._run_stream("abc") == (skip, skip, skip)
            finally:
                LocalContext.event_id.reset(other_token)
            assert other.closed
            assert manager.sessions["abc"].event is event
        finally:
            LocalContext.blocks.reset(blocks_token)
            LocalContext.event_id.reset(event_token)
            queue.event_ids_to_events.clear()
            await asyncio.wait_for(manager.sessions["abc"].watcher, 2)  # type: ignore
        assert "abc" not in manager.sessions


async def make_offer(audio=False, video=False, receive=None):
    pc = RTCPeerConnection()
    channel = pc.createDataChannel("text")
    # What the server says over the data channel, decoded
    pc.messages = []  # type: ignore[attr-defined]
    channel.on("message", lambda m: pc.messages.append(json.loads(m)))  # type: ignore[attr-defined]
    if audio:
        pc.addTrack(AudioStreamTrack())
    if video:
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
        manager = get_manager(webrtc._id)
        assert manager is not None
        self.manager = manager
        self.stream_fn = next(
            fn
            for fn in demo.fns.values()
            if (webrtc._id, "stream") in [tuple(t) for t in fn.targets]
        )
        self.http = httpx2.AsyncClient(timeout=10)
        # The browser session each stream joined from, which the stream's
        # signalling and inputs then come from too
        self.sessions = {}

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
        try:
            await self.webrtc._push_inputs(webrtc_id, *args)
        finally:
            LocalContext.request.reset(token)

    async def wait_until(self, condition, timeout=5.0):
        deadline = time.monotonic() + timeout
        while not condition():
            if time.monotonic() > deadline:
                pytest.fail("Timed out")
            await asyncio.sleep(0.02)

    async def start(self, webrtc_id):
        event_id = await self.join(webrtc_id)
        await self.wait_until(lambda: webrtc_id in self.manager.sessions)
        return event_id

    async def offer(self, pc, webrtc_id, component=None, session_hash=None, **extra):
        body = {
            "sdp": pc.localDescription.sdp,
            "type": pc.localDescription.type,
            **extra,
        }
        if webrtc_id is not None:
            body["webrtc_id"] = webrtc_id
        session_hash = session_hash or self.sessions.get(webrtc_id, "session")
        return await self.server_fn("offer", body, component, session_hash)

    async def server_fn(self, fn_name, data, component=None, session_hash="session"):
        response = await self.http.post(
            f"{self.api}/component_server/",
            json={
                "session_hash": session_hash,
                "component_id": (component or self.webrtc)._id,
                "fn_name": fn_name,
                "data": data,
            },
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
        return event_id in self.demo._queue.event_ids_to_events

    def handler(self, webrtc_id):
        """The handler instance of a stream, which all its tracks share."""
        return self.manager.connections[webrtc_id][0].event_handler


def completed(messages):
    return any(m.get("msg") == "process_completed" for m in messages)


class TestStreams:
    @pytest_asyncio.fixture
    async def launched(self, request, monkeypatch):
        monkeypatch.setattr(webrtc_connection, "ADMISSION_WAIT", 0.5)
        # Tests reuse stream ids, and a stream an earlier test left open stays
        # registered after its app is closed
        webrtc_connection._streams.clear()
        webrtc_connection._admissions.clear()
        webrtc_connection._pending_candidates.clear()
        params = dict(getattr(request, "param", {}))
        handler = params.pop("handler", flip)
        stream_kwargs = params.pop("stream_kwargs", {})
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
        with closing(demo):
            _, local_url, _ = demo.launch(prevent_thread_lock=True)
            harness = Harness(demo, local_url, webrtc)
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
                    watchers = {s.watcher for s in list(manager.sessions.values())}
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
        assert "one" in h.manager.pcs
        await pc.close()

    async def stream_until_message(self, h, pc, type_):
        await h.start("one")
        await h.connect(pc, "one")
        await h.wait_until(lambda: h.manager.sessions["one"].connected)
        # The handler runs once the page has sent the input values
        await h.push_inputs("one", 0.2)
        await h.wait_until(lambda: any(m["type"] == type_ for m in pc.messages))
        return next(m for m in pc.messages if m["type"] == type_)

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"handler": fail_with_gr_error}], indirect=True
    )
    async def test_gr_error_in_the_handler_is_shown_and_ends_the_stream(self, launched):
        h = launched
        pc = await make_offer(video=True)
        message = await self.stream_until_message(h, pc, "error")
        assert message["message"] == "Bad frame"
        assert message["title"] == "Oops"
        await h.wait_until(lambda: "one" not in h.manager.pcs)
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
        assert message["message"] == ("internal detail" if show_error else "")
        assert message["title"] == "Error"
        await h.wait_until(lambda: "one" not in h.manager.pcs)
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize("launched", [{"handler": warn}], indirect=True)
    async def test_gr_warning_in_the_handler_is_shown(self, launched):
        h = launched
        pc = await make_offer(video=True)
        message = await self.stream_until_message(h, pc, "warning")
        assert message["message"] == "Careful"
        assert "one" in h.manager.pcs
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
        "launched, offer",
        [
            ({"modality": "audio", "handler": FailOnEmit}, {"audio": True}),
            (
                {"mode": "receive", "modality": "audio", "handler": fail_then_audio},
                {"receive": "audio"},
            ),
        ],
        indirect=["launched"],
    )
    async def test_errors_in_audio_handler_threads_end_the_stream(
        self, launched, offer
    ):
        h = launched
        pc = await make_offer(**offer)
        message = await self.stream_until_message(h, pc, "error")
        assert message["message"] == "Bad audio"
        await h.wait_until(lambda: "one" not in h.manager.pcs)
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
        await h.wait_until(lambda: h.manager.sessions["one"].connected)
        await h.push_inputs("one", 0.2)
        await h.wait_until(lambda: bool(seen_requests))
        assert isinstance(seen_requests[0], gr.Request)
        assert seen_requests[0].headers["host"]
        await pc.close()

    @pytest.mark.asyncio
    async def test_video_bitrate_is_off_by_default(self, launched):
        h = launched
        await h.start("one")
        pc = await make_offer(video=True)
        answer = await h.connect(pc, "one")
        assert "x-google" not in answer["sdp"]
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
        (sender,) = [s for s in h.manager.pcs["one"].getSenders() if s.track]
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
        assert h.manager.connections["one"][0].mirror is mirror
        await pc.close()

    @pytest.mark.asyncio
    async def test_offer_without_a_turn_is_rejected(self, launched):
        h = launched
        pc = await make_offer(video=True)
        response = await h.offer(pc, "stranger")
        assert response["meta"]["error"] == "not_admitted"
        assert "stranger" not in h.manager.pcs
        await pc.close()

    @pytest.mark.asyncio
    async def test_further_streams_wait_for_their_turn(self, launched):
        h = launched
        first_event = await h.start("one")
        second_event = await h.join("two")
        await asyncio.sleep(0.5)
        assert "two" not in h.manager.sessions
        line = h.demo._queue.event_queue_per_concurrency_id[
            h.stream_fn.concurrency_id
        ].queue
        assert [event._id for event in line] == [second_event]

        first = await make_offer(video=True)
        await h.connect(first, "one")
        await h.wait_until(lambda: h.manager.sessions["one"].connected)
        await first.close()
        # The first stream ends with its connection, and the second gets in
        await h.wait_until(lambda: not h.event_running(first_event))
        await h.wait_until(lambda: "two" in h.manager.sessions)
        assert h.event_running(second_event)

    @pytest.mark.asyncio
    async def test_closing_the_stream_closes_the_connection(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        await h.http.post(f"{h.api}/stream/{event_id}/close")
        messages = await h.messages("one", completed)
        assert completed(messages)
        await h.wait_until(lambda: "one" not in h.manager.pcs)
        await h.wait_until(lambda: "one" not in h.manager.sessions)
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"stream_kwargs": {"time_limit": 1}}], indirect=True
    )
    async def test_time_limit_ends_the_event_and_the_connection(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(video=True)
        answer = await h.connect(pc, "one")
        assert 0 < answer["time_limit"] <= 1
        started = time.monotonic()
        await h.wait_until(lambda: not h.event_running(event_id), timeout=5)
        assert time.monotonic() - started < 2
        await h.wait_until(lambda: "one" not in h.manager.pcs)
        await pc.close()

    @pytest.mark.asyncio
    async def test_admitted_stream_that_never_connects_gives_up(
        self, launched, monkeypatch
    ):
        h = launched
        monkeypatch.setattr(webrtc_connection, "CONNECT_TIMEOUT", 0.5)
        event_id = await h.start("one")
        await h.wait_until(lambda: not h.event_running(event_id))
        await h.wait_until(lambda: "one" not in h.manager.sessions)

    @pytest.mark.asyncio
    async def test_keepalive_wakes_a_quiet_stream(self, launched, monkeypatch):
        h = launched
        monkeypatch.setattr(webrtc_connection, "KEEPALIVE_INTERVAL", 0.3)
        await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        messages = await h.messages(
            "one",
            lambda ms: sum(m.get("msg") == "process_streaming" for m in ms) >= 3,
        )
        assert not completed(messages)
        await pc.close()

    @pytest.mark.asyncio
    async def test_input_values_come_from_the_page(self, launched, monkeypatch):
        h = launched
        monkeypatch.setattr(webrtc_connection, "KEEPALIVE_INTERVAL", 0.3)
        await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        track = h.manager.connections["one"][0]
        # Nothing from the time the user clicked: the handler asks the page
        assert track.latest_args is None
        await h.push_inputs("one", 0.2)
        await asyncio.sleep(1)
        assert track.latest_args == [0.2]
        await pc.close()

    @pytest.mark.asyncio
    async def test_a_chunk_cannot_admit_another_stream(self, launched, monkeypatch):
        h = launched
        monkeypatch.setattr(webrtc_connection, "KEEPALIVE_INTERVAL", 0.3)
        event_id = await h.start("one")
        # A client that sends its event's own id with a new stream id, to get a
        # second stream through one place in the concurrency limit
        await h.http.post(
            f"{h.api}/stream/{event_id}",
            json={
                "data": ["two"],
                "fn_index": h.stream_fn._id,
                "session_hash": "one",
                "event_id": event_id,
            },
        )
        await asyncio.sleep(1)
        assert "two" not in h.manager.sessions
        pc = await make_offer(video=True)
        assert (await h.offer(pc, "two"))["meta"]["error"] == "not_admitted"
        await pc.close()

    @pytest.mark.asyncio
    async def test_leaving_the_line_makes_room(self, launched):
        h = launched
        await h.start("one")
        second = await h.join("two")
        third = await h.join("three")
        line = h.demo._queue.event_queue_per_concurrency_id[
            h.stream_fn.concurrency_id
        ].queue
        await h.wait_until(lambda: [e._id for e in line] == [second, third])
        # The second user stops while waiting: their event leaves the line
        # instead of being admitted later only to end
        await h.http.post(f"{h.api}/stream/{second}/close")
        assert [e._id for e in line] == [third]
        assert not h.event_running(second)

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
    @pytest.mark.parametrize(
        "launched", [{"modality": "audio", "handler": EchoHandler}], indirect=True
    )
    async def test_unsupported_track_is_rejected(self, launched):
        h = launched
        await h.start("one")
        pc = await make_offer(video=True)
        response = await h.offer(pc, "one")
        assert response["status"] == "failed"
        assert response["meta"]["error"] == "unsupported_track"
        assert "one" not in h.manager.pcs
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"modality": "audio", "handler": EchoHandler, "allow_extra_tracks": True}],
        indirect=True,
    )
    async def test_extra_tracks_allowed(self, launched):
        h = launched
        await h.start("one")
        pc = await make_offer(audio=True, video=True)
        answer = await h.offer(pc, "one")
        assert answer["type"] == "answer"
        assert "m=audio" in answer["sdp"]
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
        candidate = await h.server_fn(
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
        candidate = await h.server_fn(
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
        # ...nor feed its handler
        await h.push_inputs("one", 0.2)
        await h.push_inputs("one", 0.9, session_hash="intruder")
        assert h.manager.connections["one"][0].latest_args == [0.2]
        for connection in (intruder, pc):
            await connection.close()

    @pytest.mark.asyncio
    async def test_a_stream_stays_with_its_manager_when_its_component_id_is_reused(
        self, launched
    ):
        h = launched
        await h.start("one")
        # As when @gr.render creates a keyed component again, in another
        # session or a later render: the same id gets another manager
        other = webrtc_connection.register_manager(
            h.webrtc._id,
            handler=flip,
            mode="send-receive",
            modality="video",
            time_limit=None,
            allow_extra_tracks=False,
            server_rtc_configuration=None,
        )
        # ...and that other session's render may then be gone
        del other
        gc.collect()
        assert get_manager(h.webrtc._id) is None
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        await h.push_inputs("one", 0.2)
        assert h.manager.connections["one"][0].latest_args == [0.2]
        await pc.close()

    @pytest.mark.asyncio
    async def test_only_a_stream_with_its_turn_gets_the_rtc_configuration(
        self, launched
    ):
        h = launched

        async def ask(webrtc_id, session_hash):
            return await h.server_fn(
                "get_rtc_configuration", {"webrtc_id": webrtc_id}, None, session_hash
            )

        # TURN credentials may be billed to the app's owner, so the queue's
        # limits must decide who gets them
        assert "error" in await ask("nobody", "nobody")
        await h.start("one")
        assert await ask("one", "one") == {}
        assert "error" in await ask("one", "intruder")

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"modality": "audio", "handler": SlowShutdown()}], indirect=True
    )
    async def test_the_next_handler_waits_for_the_last_one_to_shut_down(self, launched):
        h = launched
        SlowShutdown.log.clear()
        await h.start("one")
        first = await make_offer(audio=True)
        await h.connect(first, "one")
        await h.wait_until(lambda: h.manager.sessions["one"].connected)
        await h.join("two")
        # The queue gives the slot to "two" before the handler of "one" has
        # shut down; a model loaded per handler must not be in memory twice
        await first.close()
        await h.wait_until(lambda: "two" in h.manager.sessions, timeout=10)
        second = await make_offer(audio=True)
        await h.connect(second, "two")
        assert SlowShutdown.log[:4] == [
            "created",
            "shutdown begins",
            "shutdown ends",
            "created",
        ]
        await second.close()

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
        assert "one" not in h.manager.pcs
        await h.wait_until(lambda: not h.event_running(event_id), timeout=10)
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"stream_kwargs": {"time_limit": 600}}], indirect=True
    )
    async def test_a_stream_event_without_an_id_does_not_hold_the_slot(self, launched):
        h = launched
        await h.join(None, session_hash="no-id")
        # Nothing would wake it before its time limit if it stayed
        await h.messages("no-id", completed, timeout=5)
        await h.start("one")

    @pytest.mark.asyncio
    async def test_inputs_reach_connection_made_through_session_copy(self, launched):
        h = launched
        # A gr.update() on the component gives the session a new instance with
        # its own id, stored under the original id, and the component_server
        # route then resolves that instance (see Blocks.postprocess_data).
        webrtc = h.webrtc
        session = h.demo.server_app.state_holder["one"]
        session[webrtc._id] = webrtc.__class__(
            **{**webrtc.constructor_args, "render": False}
        )
        replacement = session[webrtc._id]
        assert replacement is not webrtc
        assert replacement._id != webrtc._id
        await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        await h.push_inputs("one", 0.5)
        track = h.manager.connections["one"][0]
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
        track = h.manager.connections["one"][0]
        assert track.fps == 5
        # The generator starts with the values the page sends when asked
        assert not track.args_set.is_set()
        await h.push_inputs("one", 3)
        assert track.latest_args == [3]
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"handler": lambda frame, *args: CloseStream("done")}],
        indirect=True,
    )
    async def test_close_stream_ends_a_send_receive_stream(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        server_pc = h.manager.pcs["one"]
        await h.push_inputs("one", 0)
        # The handler ends the stream: the server closes its side and the
        # event, whether or not the browser reacts to "end_stream"
        await h.wait_until(lambda: server_pc.connectionState == "closed", timeout=10)
        await h.wait_until(lambda: not h.event_running(event_id))
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"modality": "audio", "handler": FailingShutdown}], indirect=True
    )
    async def test_a_failing_shutdown_still_ends_the_stream(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(audio=True)
        await h.connect(pc, "one")
        await h.wait_until(lambda: h.manager.sessions["one"].connected)
        # The browser leaves; the handler's shutdown() raises while cleaning up
        await pc.close()
        await h.wait_until(lambda: not h.event_running(event_id), timeout=10)

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"handler": RecordingVideo}, {"handler": AsyncRecordingVideo}],
        indirect=True,
    )
    async def test_a_video_handler_class_lives_as_long_as_the_stream(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(video=True)
        answer = await h.connect(pc, "one")
        # Video only: the page does not have to send (or ask for) a microphone
        assert "m=audio" not in answer["sdp"]
        handler = h.handler("one")
        await h.wait_until(lambda: h.manager.sessions["one"].connected)
        await h.wait_until(lambda: handler.events == ["start_up"])
        await h.wait_until(lambda: handler.frames > 0)
        assert handler.channel is not None
        # The other inputs reach the handler, and its AdditionalOutputs the page
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
        await h.wait_until(lambda: h.manager.sessions["one"].connected)
        # Both tracks share the handler; closing must not shut it down twice
        await pc.close()
        await h.wait_until(lambda: not h.event_running(event_id), timeout=10)
        await h.wait_until(lambda: "shutdown" in handler.events)
        await asyncio.sleep(0.2)
        assert handler.events == ["shutdown"]

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"modality": "audio", "mode": "send", "handler": CloseOnEmit}],
        indirect=True,
    )
    async def test_close_stream_ends_a_send_only_audio_stream(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(audio=True)
        await h.connect(pc, "one")
        server_pc = h.manager.pcs["one"]
        await h.wait_until(lambda: h.manager.sessions["one"].connected)
        # Nothing plays back in "send", but CloseStream still ends the stream
        await h.wait_until(lambda: server_pc.connectionState == "closed", timeout=10)
        await h.wait_until(lambda: not h.event_running(event_id))
        await pc.close()

    @pytest.mark.asyncio
    async def test_cancels_of_another_event_stops_a_stream(self, launched):
        h = launched
        event_id = await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        server_pc = h.manager.pcs["one"]
        await h.wait_until(lambda: h.manager.sessions["one"].connected)
        # What the page sends for `stop.click(None, cancels=[stream])`
        await h.http.post(
            f"{h.api}/cancel",
            json={
                "event_id": event_id,
                "session_hash": "one",
                "fn_index": h.stream_fn._id,
            },
        )
        await h.wait_until(lambda: server_pc.connectionState == "closed")
        await h.wait_until(lambda: not h.event_running(event_id))
        await pc.close()

    @pytest.mark.asyncio
    async def test_candidates_are_kept_only_for_an_admitted_stream(self, launched):
        h = launched
        first_event = await h.start("zero")
        await h.join("one")

        async def send_candidate():
            return await h.server_fn(
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
        assert "one" not in webrtc_connection._pending_candidates
        await h.http.post(f"{h.api}/stream/{first_event}/close")
        await h.wait_until(lambda: "one" in h.manager.sessions)
        # After the turn, the offer can still be on its way
        assert (await send_candidate()).get("status") == "success"
        assert "one" in webrtc_connection._pending_candidates
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        assert "one" not in webrtc_connection._pending_candidates
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
    @pytest.mark.parametrize(
        "launched", [{"mode": "receive", "handler": three_frames}], indirect=True
    )
    async def test_a_finished_receive_stream_closes_its_connection(self, launched):
        h = launched
        await h.start("one")
        pc = await make_offer(receive="video")
        await h.connect(pc, "one")
        server_pc = h.manager.pcs["one"]
        await h.push_inputs("one", 0)
        # The generator runs out: the server closes its side of the connection
        # instead of leaving it to the client
        await h.wait_until(lambda: server_pc.connectionState == "closed", timeout=10)
        await pc.close()

    @pytest.mark.asyncio
    async def test_rtc_configuration_resolution(self):
        calls = []

        async def issue_credentials():
            calls.append(1)
            return {"iceServers": [{"urls": "turn:example.com"}]}

        webrtc = gr.WebRTC(rtc_configuration=issue_credentials)
        assert await webrtc._rtc_configuration_for() == {
            "iceServers": [{"urls": "turn:example.com"}]
        }
        assert calls == [1]
        assert await gr.WebRTC()._rtc_configuration_for() == {}
        assert await gr.WebRTC(
            rtc_configuration=lambda: {"iceServers": []}
        )._rtc_configuration_for() == {"iceServers": []}

        await asyncio.sleep(0)

    @pytest.mark.asyncio
    @pytest.mark.parametrize("show_error", [False, True])
    async def test_rtc_configuration_errors_follow_show_error(
        self, show_error, monkeypatch
    ):
        monkeypatch.setattr(webrtc_connection, "stream_admitted", admitted_anyway)

        def broken():
            raise RuntimeError("internal detail")

        def not_signed_in():
            raise gr.Error("Sign in first.")

        with gr.Blocks() as demo:
            broken_webrtc = gr.WebRTC(rtc_configuration=broken)
            signed_in_webrtc = gr.WebRTC(rtc_configuration=not_signed_in)
        with closing(demo):
            _, local_url, _ = demo.launch(
                prevent_thread_lock=True, show_error=show_error
            )
            async with httpx2.AsyncClient(timeout=10) as http:

                async def resolve(webrtc):
                    response = await http.post(
                        f"{local_url.rstrip('/')}{API_PREFIX}/component_server/",
                        json={
                            "session_hash": "session",
                            "component_id": webrtc._id,
                            "fn_name": "get_rtc_configuration",
                            "data": None,
                        },
                    )
                    return response.json()

                # Like the error of an event: the message of a gr.Error, other
                # messages only with show_error
                assert await resolve(broken_webrtc) == {
                    "error": "internal detail" if show_error else "An error occurred."
                }
                assert await resolve(signed_in_webrtc) == {"error": "Sign in first."}

    @pytest.mark.asyncio
    async def test_rtc_configuration_gets_the_request_of_the_page(self, monkeypatch):
        monkeypatch.setattr(webrtc_connection, "stream_admitted", admitted_anyway)

        def issue_credentials(request: gr.Request):
            return {"iceServers": [], "agent": request.headers["user-agent"]}

        with gr.Blocks() as demo:
            webrtc = gr.WebRTC(rtc_configuration=issue_credentials)
        with closing(demo):
            _, local_url, _ = demo.launch(prevent_thread_lock=True)
            async with httpx2.AsyncClient(timeout=10) as http:
                response = await http.post(
                    f"{local_url.rstrip('/')}{API_PREFIX}/component_server/",
                    headers={"User-Agent": "visitor-browser"},
                    json={
                        "session_hash": "session",
                        "component_id": webrtc._id,
                        "fn_name": "get_rtc_configuration",
                        "data": None,
                    },
                )
        assert response.json() == {"iceServers": [], "agent": "visitor-browser"}

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
        optional = gr.WebRTC(rtc_configuration=issue_credentials)
        assert await optional._rtc_configuration_for(page(session)) == {
            "iceServers": [],
            "token": "visitor-token",
        }
        assert await optional._rtc_configuration_for(page()) == {
            "iceServers": [],
            "token": None,
        }
        required = gr.WebRTC(rtc_configuration=logged_in_only)
        assert await required._rtc_configuration_for(page(session)) == {
            "iceServers": [],
            "token": "visitor-token",
        }
        assert await required._rtc_configuration_for(page()) == {
            "error": "This action requires a logged in user. Please sign in and retry."
        }

        def refuse():
            raise gr.Error("Sign in first.")

        assert await gr.WebRTC(rtc_configuration=refuse)._rtc_configuration_for() == {
            "error": "Sign in first."
        }


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
            time_limit=1,
        )
        busy = gr.Button()
        busy.click(lambda: time.sleep(4), None, None, concurrency_limit=None)
    busy_fn = next(
        fn
        for fn in demo.fns.values()
        if (busy._id, "click") in [tuple(t) for t in fn.targets]
    )
    with closing(demo):
        _, local_url, _ = demo.launch(prevent_thread_lock=True, max_threads=1)
        h = Harness(demo, local_url, webrtc)
        await h.start("one")
        started = time.monotonic()
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        server_pc = h.manager.pcs["one"]
        await h.push_inputs("one")
        await h.wait_until(lambda: h.manager.sessions["one"].connected)
        # A long job takes the only worker slot while the stream waits
        await h.http.post(
            f"{h.api}/queue/join",
            json={"data": [], "fn_index": busy_fn._id, "session_hash": "busy"},
        )
        await h.wait_until(lambda: h.demo._queue.get_active_worker_count() == 1)
        # The media stops at the time limit, not when a worker frees up
        await h.wait_until(lambda: server_pc.connectionState == "closed", timeout=4)
        assert time.monotonic() - started < 2.5
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
    @pytest.mark.parametrize("mirror", [True, False])
    @pytest.mark.parametrize("video_only", [False, True])
    async def test_mirrored_webcam_gives_video_receive_mirrored_frames(
        self, mirror, video_only
    ):
        from aiortc.mediastreams import MediaStreamError

        from gradio.webrtc import AudioVideoStreamHandler
        from gradio.webrtc.tracks import HandlerVideoTrack
        from gradio.webrtc.utils import Context

        class OneFrame(VideoStreamTrack):
            frames = [left_column_frame()]

            async def recv(self):
                if self.frames:
                    return self.frames.pop()
                raise MediaStreamError

        received = []

        class Recorder:
            def receive(self, frame):
                pass

            def emit(self):
                pass

            def video_receive(self, frame):
                received.append(frame)

            def video_emit(self):
                pass

        class AudioVideo(Recorder, AudioVideoStreamHandler):
            pass

        class VideoOnly(Recorder, VideoStreamHandler):
            pass

        handler = VideoOnly() if video_only else AudioVideo()
        track = HandlerVideoTrack(
            OneFrame(),
            event_handler=cast(Callable, handler),
            context=Context("id"),
            mirror=mirror,
        )
        track.channel_set.set()
        await track.process_frames()
        assert received[0][0, -1 if mirror else 0, 0] == 255

    @pytest.mark.asyncio
    async def test_video_methods_of_audio_video_handlers_see_the_context(self):
        import numpy as np
        from aiortc.mediastreams import MediaStreamError

        from gradio.webrtc import AudioVideoStreamHandler, get_current_context
        from gradio.webrtc.tracks import HandlerVideoTrack
        from gradio.webrtc.utils import Context

        released = asyncio.Event()

        class OneFrame(VideoStreamTrack):
            frames = [video_frame(0)]

            async def recv(self):
                if self.frames:
                    return self.frames.pop()
                # An ended input stops the track, which would race with recv()
                await released.wait()
                raise MediaStreamError

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
            OneFrame(), event_handler=cast(Callable, Handler()), context=Context("id")
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
        assert await track.recv() is None
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
        # aiortc asks for one more frame after the track has ended (e.g. at the
        # time limit); MediaStreamError is how a track says it is over
        track.stop()
        with pytest.raises(MediaStreamError):
            await track.recv()
        assert "Error in the stream handler" not in caplog.text

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
    @pytest.mark.parametrize("shape", [(4800,), (4800, 2)])
    async def test_emit_takes_gr_audio_arrays(self, shape):
        import numpy as np

        # 0.2 s at 24 kHz: enough for the resampler to give out whole frames
        frames = await self.decode((24000, np.zeros(shape, dtype=np.int16)))
        assert sum(f.samples for f in frames) > 0

    @pytest.mark.asyncio
    @pytest.mark.parametrize("dtype", ["float64", "float16"])
    async def test_emit_takes_other_float_arrays(self, dtype):
        import numpy as np

        # np.zeros() and np.linspace() give float64 by default
        frames = await self.decode((24000, np.zeros(4800, dtype=dtype)))
        assert sum(f.samples for f in frames) > 0

    @pytest.mark.asyncio
    async def test_an_empty_chunk_is_skipped(self):
        import numpy as np

        # e.g. what a TTS model gives for an empty sentence
        frames = await self.decode(
            (24000, np.zeros(0, dtype=np.float32)),
            (24000, np.zeros(4800, dtype=np.float32)),
        )
        assert sum(f.samples for f in frames) > 0

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

    @pytest.mark.asyncio
    async def test_a_failing_handler_ends_the_audio_track(self):
        from gradio.webrtc.tracks import AudioCallback
        from gradio.webrtc.utils import Context, HandlerFailedError

        class SyncStartUp(EchoHandler):
            def start_up(self):  # type: ignore
                pass

        handler = SyncStartUp()
        handler.channel_set.set()
        track = AudioCallback(
            AudioStreamTrack(), event_handler=handler, context=Context("id")
        )
        with pytest.raises(HandlerFailedError):
            await track.recv()

    @pytest.mark.asyncio
    @pytest.mark.parametrize("dtype", ["int32", "uint8", "int8", "uint16"])
    async def test_emit_takes_other_integer_arrays(self, dtype):
        import numpy as np

        frames = await self.decode((24000, np.zeros(4800, dtype=dtype)))
        assert sum(f.samples for f in frames) > 0

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

    def test_float_arrays_are_not_normalized_per_chunk(self):
        import numpy as np

        from gradio.webrtc import audio_to_int16

        # gr.Audio scales each numpy value to its own peak; a stream keeps the
        # level of every chunk
        quiet = np.full(4, 0.1, dtype=np.float32)
        assert audio_to_int16(quiet)[0] == 3276

    def test_float_values_past_full_scale_are_clipped(self):
        import numpy as np

        from gradio.webrtc import audio_to_int16

        # Without clipping, 1.02 would wrap around to a large negative value
        audio = np.array([1.02, -1.5, np.nan], dtype=np.float32)
        np.testing.assert_array_equal(audio_to_int16(audio), [32767, -32767, 0])

    @pytest.mark.parametrize("dtype", ["float64", "float16"])
    def test_audio_helpers_take_other_float_arrays(self, dtype):
        import numpy as np

        from gradio.webrtc import audio_to_float32, audio_to_int16

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
    @staticmethod
    def manager():
        return webrtc_connection.ConnectionManager(
            handler=flip,
            mode="send-receive",
            modality="video",
            time_limit=None,
            allow_extra_tracks=False,
            server_rtc_configuration=None,
        )

    @pytest.mark.asyncio
    async def test_clean_up_stops_every_track(self):
        # Whichever path notices the end first (ICE failure, a closed
        # connection, an ended track) stops all tracks of the connection
        manager = self.manager()
        tracks = [TestVideoTracks.callback(flip) for _ in range(2)]
        manager.connections["one"].extend(tracks)
        manager.clean_up("one")
        assert [track.readyState for track in tracks] == ["ended", "ended"]
        assert "one" not in manager.connections

    @pytest.mark.asyncio
    async def test_clean_up_releases_a_handler_waiting_for_its_inputs(self):
        from gradio.webrtc.tracks import AudioCallback
        from gradio.webrtc.utils import Context

        handler = EchoHandler()
        handler._loop = asyncio.get_running_loop()
        manager = self.manager()
        manager.connections["one"].append(
            AudioCallback(
                AudioStreamTrack(), event_handler=handler, context=Context("one")
            )
        )
        waiting = asyncio.create_task(handler.wait_for_args())
        await asyncio.sleep(0.05)
        assert not waiting.done()
        manager.clean_up("one")
        await asyncio.wait_for(waiting, 1)

    @pytest.mark.asyncio
    @pytest.mark.parametrize("kind", ["audio", "video"])
    async def test_a_send_mode_reader_ends_with_its_track(self, kind):
        from gradio.webrtc.tracks import AudioCallback
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
        else:
            track = TestVideoTracks.callback(flip, mode="send")
            reader = asyncio.create_task(track.start())
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

    def test_a_manager_goes_away_with_its_stream_event(self):
        import gc

        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc])
        assert get_manager(webrtc._id) is not None
        # As when @gr.render replaces the components and events it created
        stream_fn_id = next(
            fn_id
            for fn_id, fn in demo.fns.items()
            if (webrtc._id, "stream") in [tuple(t) for t in fn.targets]
        )
        del demo.fns[stream_fn_id]
        gc.collect()
        assert get_manager(webrtc._id) is None
