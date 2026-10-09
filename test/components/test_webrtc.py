import asyncio
import json
import pickle
import time
from contextlib import closing
from types import SimpleNamespace

import httpx2
import pytest
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
    StreamHandler,
    VideoStreamHandler,
)
from gradio.webrtc import connection as webrtc_connection
from gradio.webrtc.connection import get_manager


def flip(frame, *args):
    return frame


class EchoHandler(AsyncStreamHandler):
    async def receive(self, frame):
        pass

    async def emit(self):
        return None


class SyncHandler(StreamHandler):
    def receive(self, frame):
        pass

    def emit(self):
        return None


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
        assert [i._id for i in stream.inputs] == [webrtc._id, slider._id]
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
        assert [i._id for i in receive_stream.inputs] == [receive._id, slider._id]
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
    async def test_run_stream_admits_then_delivers_the_newest_outputs(self):
        from gradio.context import LocalContext

        with gr.Blocks() as demo:
            webrtc = gr.WebRTC()
            number = gr.Number()
            text = gr.Textbox()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc, number, text])
        manager = get_manager(webrtc._id)
        event = SimpleNamespace(
            _id="event", signal=asyncio.Event(), alive=True, closed=False
        )
        queue = SimpleNamespace(event_ids_to_events={"event": event})
        demo._queue = queue  # type: ignore
        blocks_token = LocalContext.blocks.set(demo)
        event_token = LocalContext.event_id.set("event")
        try:
            skip = gr.skip()
            assert await webrtc._run_stream("abc") == (skip, skip, skip)
            assert manager.sessions["abc"].event is event

            set_outputs = manager._output_setter("abc")
            set_outputs(AdditionalOutputs(1, "a"))
            set_outputs(AdditionalOutputs(2, "b"))
            assert event.signal.is_set()
            assert await webrtc._run_stream("abc") == (skip, 2, "b")
            assert await webrtc._run_stream("abc") == (skip, skip, skip)

            set_outputs(AdditionalOutputs(3))
            with pytest.raises(ValueError, match="2 outputs besides"):
                await webrtc._run_stream("abc")
        finally:
            LocalContext.blocks.reset(blocks_token)
            LocalContext.event_id.reset(event_token)
            queue.event_ids_to_events.clear()
            await asyncio.wait_for(manager.sessions["abc"].watcher, 2)  # type: ignore
        assert "abc" not in manager.sessions


async def make_offer(audio=False, video=False, receive=None):
    pc = RTCPeerConnection()
    pc.createDataChannel("text")
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

    async def join(self, webrtc_id, *args, session_hash=None):
        response = await self.http.post(
            f"{self.api}/queue/join",
            json={
                "data": [webrtc_id, *(args or [0])],
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

    async def start(self, webrtc_id, *args):
        event_id = await self.join(webrtc_id, *args)
        await self.wait_until(lambda: webrtc_id in self.manager.sessions)
        return event_id

    async def offer(self, pc, webrtc_id, component=None):
        body = {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
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
    @pytest.fixture
    def launched(self, request, monkeypatch):
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
            yield Harness(demo, local_url, webrtc)

    @pytest.mark.asyncio
    async def test_video_offer_gets_answer_once_admitted(self, launched):
        h = launched
        await h.start("one", 0.5)
        pc = await make_offer(video=True)
        answer = await h.connect(pc, "one")
        assert "m=video" in answer["sdp"]
        assert "webrtc-datachannel" in answer["sdp"]
        assert answer["time_limit"] is None
        assert "one" in h.manager.pcs
        # The values the stream joined with reach the handler right away
        assert h.manager.connections["one"][0].latest_args == [0.5]
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
    async def test_input_values_reach_the_connection(self, launched, monkeypatch):
        h = launched
        monkeypatch.setattr(webrtc_connection, "KEEPALIVE_INTERVAL", 0.3)
        event_id = await h.start("one", 0.1)
        pc = await make_offer(video=True)
        await h.connect(pc, "one")
        track = h.manager.connections["one"][0]
        assert track.latest_args == [0.1]

        # A value pushed by an input's change event outlives the event's
        # later wakes, which still carry the values it joined with
        await h.webrtc._push_inputs("one", 0.2)
        await asyncio.sleep(1)
        assert track.latest_args == [0.2]

        # New values sent as a chunk of the stream's event are applied
        await h.http.post(
            f"{h.api}/stream/{event_id}",
            json={
                "data": ["one", 0.3],
                "fn_index": h.stream_fn._id,
                "session_hash": "one",
            },
        )
        await h.wait_until(lambda: track.latest_args == [0.3])
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"handler": lambda frame, x: (frame, AdditionalOutputs(x * 2))}],
        indirect=True,
    )
    async def test_additional_outputs_reach_the_other_outputs(self, launched):
        h = launched
        await h.start("one", 21)
        pc = await make_offer(video=True)
        await h.connect(pc, "one")

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
                "candidate": {"candidate": "candidate:1 1 udp 1 1.2.3.4 1 typ host"},
            },
        )
        assert candidate["meta"]["error"] == "unknown_connection"
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
        await h.start("one", 3)
        pc = await make_offer(receive="video")
        answer = await h.offer(pc, "one")
        assert answer["type"] == "answer"
        assert "a=sendonly" in answer["sdp"]
        track = h.manager.connections["one"][0]
        assert track.fps == 5
        assert track.latest_args == [3]
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

        def broken():
            raise RuntimeError("no credentials")

        assert await gr.WebRTC(rtc_configuration=broken).get_rtc_configuration() == {
            "error": "no credentials"
        }
        await asyncio.sleep(0)


def video_frame(pts: int):
    import fractions

    import numpy as np
    from av import VideoFrame

    frame = VideoFrame.from_ndarray(np.zeros((16, 16, 3), dtype=np.uint8), "bgr24")
    frame.pts = pts
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
