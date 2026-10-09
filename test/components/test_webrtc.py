import asyncio
import json
import pickle
import time
from contextlib import closing
from types import SimpleNamespace

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
from gradio.route_utils import API_PREFIX
from gradio.webrtc import (
    AdditionalOutputs,
    AsyncStreamHandler,
    CloseStream,
    StreamHandler,
    VideoStreamHandler,
)
from gradio.webrtc import connection as webrtc_connection
from gradio.webrtc.connection import get_manager


def flip(frame, *args):
    return frame


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


class StartsWithRequest(EchoHandler):
    async def start_up(self, request: gr.Request):
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


class InfoOnEmit(SyncHandler):
    def __init__(self):
        super().__init__()
        self.sent = False

    def emit(self):
        if not self.sent:
            self.sent = True
            gr.Info("From emit")


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


class TestWebRTC:
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
        assert config["mode"] == "send-receive"
        assert config["modality"] == "video"
        assert config["track_constraints"]["facingMode"] == "user"
        assert config["mirror_webcam"] == "auto"
        assert config["time_limit"] is None
        assert set(config["server_fns"]) == {"get_rtc_configuration", "offer"}
        assert webrtc.preprocess(webrtc.data_model(root="abc")) == "abc"
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
        assert sent["stream_options"]["icon"].endswith("bus.png")
        assert "test/test_files" not in sent["stream_options"]["icon"]

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
        with gr.Blocks():
            slider = gr.Slider()
            audio = gr.WebRTC(modality="audio")
            with pytest.raises(ValueError, match="StreamHandler"):
                audio.stream(flip, inputs=[audio], outputs=[audio])
            with pytest.raises(ValueError, match="copy"):
                audio.stream(SyncHandler(), inputs=[audio], outputs=[audio])
            video = gr.WebRTC()
            with pytest.raises(ValueError, match="first element"):
                video.stream(flip, inputs=[slider], outputs=[video])
            with pytest.raises(ValueError, match="must be a function"):
                video.stream(EchoHandler, inputs=[video], outputs=[video])
            receive = gr.WebRTC(mode="receive")
            with pytest.raises(ValueError, match="trigger"):
                receive.stream(flip, inputs=[slider], outputs=[receive])
            with pytest.raises(ValueError, match="cannot be one of"):
                receive.stream(flip, inputs=[receive], outputs=[receive])
        with pytest.raises(AttributeError, match="Blocks context"):
            gr.WebRTC().stream(flip, inputs=[], outputs=[])

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
                VideoStreamHandler(flip, fps=10),
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

            def __init__(self):
                self.signal = asyncio.Event()

        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            number = gr.Number()
            text = gr.Textbox()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc, number, text])
        manager = get_manager(webrtc._id)
        event = FakeEvent()
        queue = SimpleNamespace(event_ids_to_events={"event": event})
        demo._queue = queue  # type: ignore
        blocks_token = LocalContext.blocks.set(demo)
        event_token = LocalContext.event_id.set("event")
        try:
            skip = gr.skip()
            assert await webrtc._run_stream("abc") == (skip, skip, skip)
            assert manager.sessions["abc"].event is event

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
            other = FakeEvent()
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
        self.manager = get_manager(webrtc._id)
        self.stream_fn = next(
            fn
            for fn in demo.fns.values()
            if (webrtc._id, "stream") in [tuple(t) for t in fn.targets]
        )
        self.http = httpx2.AsyncClient(timeout=10)

    async def join(self, webrtc_id, session_hash=None):
        response = await self.http.post(
            f"{self.api}/queue/join",
            json={
                "data": [webrtc_id],
                "fn_index": self.stream_fn._id,
                "session_hash": session_hash or webrtc_id,
            },
        )
        return response.json()["event_id"]

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

    async def offer(self, pc, webrtc_id, component=None, **extra):
        body = {
            "sdp": pc.localDescription.sdp,
            "type": pc.localDescription.type,
            **extra,
        }
        if webrtc_id is not None:
            body["webrtc_id"] = webrtc_id
        return await self.server_fn("offer", body, component)

    async def server_fn(self, fn_name, data, component=None):
        response = await self.http.post(
            f"{self.api}/component_server/",
            json={
                "session_hash": "session",
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


def completed(messages):
    return any(m.get("msg") == "process_completed" for m in messages)


class TestStreams:
    @pytest_asyncio.fixture
    async def launched(self, request, monkeypatch):
        monkeypatch.setattr(webrtc_connection, "ADMISSION_WAIT", 0.5)
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
        await h.webrtc._push_inputs("one", 0.2)
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
        "launched", [{"handler": fail_with_value_error}], indirect=True
    )
    async def test_other_errors_are_shown_only_with_show_error(
        self, launched, show_error
    ):
        h = launched
        h.demo.show_error = show_error
        pc = await make_offer(video=True)
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
        await h.webrtc._push_inputs("one", 0.2)
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
        await h.webrtc._push_inputs("one", 0.2)
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
        await h.webrtc._push_inputs("one", 21)

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
                "webrtc_id": "missing",
                "candidate": {"candidate": "not a candidate"},
            },
        )
        assert candidate["meta"]["error"] == "invalid_candidate_format"
        for pc in (first, second):
            await pc.close()

    @pytest.mark.asyncio
    async def test_inputs_reach_connection_made_through_session_copy(self, launched):
        h = launched
        # A gr.update() on the component gives the session a new instance with
        # its own id, stored under the original id, and the component_server
        # route then resolves that instance (see Blocks.postprocess_data).
        webrtc = h.webrtc
        session = h.demo.server_app.state_holder["session"]
        session[webrtc._id] = webrtc.__class__(
            **{**webrtc.constructor_args, "render": False}
        )
        replacement = session[webrtc._id]
        assert replacement is not webrtc
        assert replacement._id != webrtc._id
        await h.start("one")
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        await webrtc._push_inputs("one", 0.5)
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
        assert isinstance(h.manager.handlers["one"], EchoHandler)
        assert h.manager.handlers["one"] is not h.manager.handlers["two"]
        for pc in (first, second):
            await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"mode": "receive", "handler": VideoStreamHandler(flip, fps=5)}],
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
        await h.webrtc._push_inputs("one", 3)
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
        await h.webrtc._push_inputs("one", 0)
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
    async def test_candidates_sent_before_the_turn_are_kept(self, launched):
        h = launched
        first_event = await h.start("zero")
        await h.join("one")
        # The browser trickles its candidates while its offer waits for the turn
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
        )
        assert candidate.get("status") == "success"
        await h.http.post(f"{h.api}/stream/{first_event}/close")
        await h.wait_until(lambda: "one" in h.manager.sessions)
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        assert "one" not in h.manager.pending_candidates
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
        await h.webrtc._push_inputs("one", 0)
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
        assert await webrtc.get_rtc_configuration() == {
            "iceServers": [{"urls": "turn:example.com"}]
        }
        assert calls == [1]
        assert await gr.WebRTC().get_rtc_configuration() == {}
        assert await gr.WebRTC(
            rtc_configuration=lambda: {"iceServers": []}
        ).get_rtc_configuration() == {"iceServers": []}

        await asyncio.sleep(0)

    @pytest.mark.asyncio
    @pytest.mark.parametrize("show_error", [False, True])
    async def test_rtc_configuration_errors_follow_show_error(self, show_error):
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
    async def test_rtc_configuration_gets_the_request_of_the_page(self):
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
        assert await optional.get_rtc_configuration(None, page(session)) == {
            "iceServers": [],
            "token": "visitor-token",
        }
        assert await optional.get_rtc_configuration(None, page()) == {
            "iceServers": [],
            "token": None,
        }
        required = gr.WebRTC(rtc_configuration=logged_in_only)
        assert await required.get_rtc_configuration(None, page(session)) == {
            "iceServers": [],
            "token": "visitor-token",
        }
        assert await required.get_rtc_configuration(None, page()) == {
            "error": "This action requires a logged in user. Please sign in and retry."
        }

        def refuse():
            raise gr.Error("Sign in first.")

        assert await gr.WebRTC(rtc_configuration=refuse).get_rtc_configuration() == {
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
        await h.webrtc._push_inputs("one")
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
        assert VideoStreamHandler(flip).skip_frames
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
    async def test_mirrored_webcam_gives_video_receive_mirrored_frames(self, mirror):
        from aiortc.mediastreams import MediaStreamError

        from gradio.webrtc import AudioVideoStreamHandler
        from gradio.webrtc.tracks import HandlerVideoTrack
        from gradio.webrtc.utils import Context

        class OneFrame:
            frames = [left_column_frame()]

            async def recv(self):
                if self.frames:
                    return self.frames.pop()
                raise MediaStreamError

        class Handler(AudioVideoStreamHandler):
            received = []

            def receive(self, frame):
                pass

            def emit(self):
                pass

            def video_receive(self, frame):
                self.received.append(frame)

            def video_emit(self):
                pass

        track = HandlerVideoTrack(
            OneFrame(), event_handler=Handler(), context=Context("id"), mirror=mirror
        )
        track.channel_set.set()
        await track.process_frames()
        assert Handler.received[0][0, -1 if mirror else 0, 0] == 255

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

        class OneFrame:
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

    @staticmethod
    async def decode(*returned):
        import av

        from gradio.webrtc.utils import player_worker_decode

        queue: asyncio.Queue = asyncio.Queue()
        items = [*returned, None]

        async def next_frame():
            return items.pop(0)

        await player_worker_decode(
            next_frame, queue, asyncio.Event(), None, quit_on_none=True
        )
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
