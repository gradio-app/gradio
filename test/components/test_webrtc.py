import asyncio
import pickle
from contextlib import closing

import pytest
from aiortc import (
    AudioStreamTrack,
    RTCPeerConnection,
    RTCSessionDescription,
    VideoStreamTrack,
)
from fastapi.testclient import TestClient

import gradio as gr
from gradio.route_utils import API_PREFIX
from gradio.webrtc import (
    AdditionalOutputs,
    AsyncStreamHandler,
    StreamHandler,
    VideoStreamHandler,
)
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
        assert set(config["server_fns"]) == {
            "get_rtc_configuration",
            "offer",
            "stop_outputs",
        }
        assert webrtc.preprocess(webrtc.data_model(root="abc")) == "abc"
        assert webrtc.preprocess(None) is None
        assert webrtc.postprocess("abc") == "abc"
        assert webrtc.api_info()["type"] == "string"

        plain = gr.WebRTC()
        assert pickle.loads(pickle.dumps(plain)).get_config() == plain.get_config()

    def test_media_constraints(self):
        audio = gr.WebRTC(
            modality="audio", microphone_options={"echoCancellation": False}
        )
        assert audio.get_config()["track_constraints"] == {"echoCancellation": False}
        both = gr.WebRTC(
            modality="audio-video",
            webcam_options=gr.WebcamOptions(
                mirror=False, constraints={"video": {"width": 640}}
            ),
        )
        config = both.get_config()
        assert config["track_constraints"]["video"] == {"width": 640}
        assert config["track_constraints"]["audio"]["echoCancellation"] is True
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

    def test_stream_registers_hidden_events(self):
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
        push = triggers[(webrtc._id, "tick")]
        assert push.api_visibility == "private"
        assert push.concurrency_limit is None
        assert [i._id for i in push.inputs] == [webrtc._id, slider._id]
        change = triggers[(slider._id, "change")]
        assert change.name == push.name == "_push_inputs"
        assert change.api_visibility == "private"
        drain = triggers[(webrtc._id, "state_change")]
        assert drain.api_visibility == "private"
        assert [o._id for o in drain.outputs] == [number._id]
        assert (receive._id, "tick") in triggers
        assert triggers[(button._id, "click")].api_visibility == "private"

        assert webrtc.get_config()["time_limit"] == 30
        manager = get_manager(webrtc._id)
        assert manager is not None
        assert manager.concurrency_limit is None
        assert manager.time_limit == 30
        assert get_manager(receive._id).mode == "receive"

    @pytest.mark.asyncio
    async def test_drain_outputs_maps_additional_outputs(self):
        with gr.Blocks():
            webrtc = gr.WebRTC()
            number = gr.Number()
            text = gr.Textbox()
            webrtc.stream(flip, inputs=[webrtc], outputs=[webrtc, number, text])
        manager = get_manager(webrtc._id)
        set_outputs = manager._output_setter("abc")
        set_outputs(AdditionalOutputs(1, "a"))
        set_outputs(AdditionalOutputs(2, "b"))
        received = []
        async for item in webrtc._drain_outputs("abc"):
            received.append(item)
            if len(received) == 2:
                manager.stop_outputs("abc")
        assert received == [(1, "a"), (2, "b")]

        with gr.Blocks():
            single = gr.WebRTC()
            single.stream(flip, inputs=[single], outputs=[single, number])
        manager = get_manager(single._id)
        manager._output_setter("xyz")(AdditionalOutputs(3))
        manager.stop_outputs("xyz")
        assert [item async for item in single._drain_outputs("xyz")] == [3]


async def make_offer(audio=False, video=False):
    pc = RTCPeerConnection()
    pc.createDataChannel("text")
    if audio:
        pc.addTrack(AudioStreamTrack())
    if video:
        pc.addTrack(VideoStreamTrack())
    await pc.setLocalDescription(await pc.createOffer())
    return pc


def post_offer(client, component, pc, webrtc_id, session_hash="session"):
    body = {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
    if webrtc_id is not None:
        body["webrtc_id"] = webrtc_id
    response = client.post(
        f"{API_PREFIX}/component_server/",
        json={
            "session_hash": session_hash,
            "component_id": component._id,
            "fn_name": "offer",
            "data": body,
        },
    )
    assert response.status_code == 200
    return response.json()


class TestSignaling:
    @pytest.fixture
    def launched(self, request):
        params = getattr(request, "param", {})
        handler = params.pop("handler", flip)
        stream_kwargs = params.pop("stream_kwargs", {})
        with gr.Blocks() as demo:
            webrtc = gr.WebRTC(**params)
            slider = gr.Slider()
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
                    handler, inputs=[webrtc, slider], outputs=[webrtc], **stream_kwargs
                )
        with closing(demo) as io:
            app, _, _ = io.launch(prevent_thread_lock=True)
            with TestClient(app) as client:
                yield app, client, webrtc
            manager = get_manager(webrtc._id)
            for webrtc_id in list(manager.pcs):
                manager.clean_up(webrtc_id)

    @pytest.mark.asyncio
    async def test_video_offer_gets_answer(self, launched):
        _, client, webrtc = launched
        pc = await make_offer(video=True)
        answer = post_offer(client, webrtc, pc, "one")
        assert answer["type"] == "answer"
        assert "m=video" in answer["sdp"]
        assert "webrtc-datachannel" in answer["sdp"]
        await pc.setRemoteDescription(
            RTCSessionDescription(answer["sdp"], answer["type"])
        )
        manager = get_manager(webrtc._id)
        assert "one" in manager.pcs
        assert len(manager.connections["one"]) == 1
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"modality": "audio", "handler": EchoHandler}], indirect=True
    )
    async def test_unsupported_track_is_rejected(self, launched):
        _, client, webrtc = launched
        pc = await make_offer(video=True)
        response = post_offer(client, webrtc, pc, "one")
        assert response["status"] == "failed"
        assert response["meta"]["error"] == "unsupported_track"
        assert "one" not in get_manager(webrtc._id).pcs
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"modality": "audio", "handler": EchoHandler, "allow_extra_tracks": True}],
        indirect=True,
    )
    async def test_extra_tracks_allowed(self, launched):
        _, client, webrtc = launched
        pc = await make_offer(audio=True, video=True)
        answer = post_offer(client, webrtc, pc, "one")
        assert answer["type"] == "answer"
        assert "m=audio" in answer["sdp"]
        await pc.close()

    @pytest.mark.asyncio
    async def test_duplicate_id_and_concurrency_limit(self, launched):
        _, client, webrtc = launched
        first = await make_offer(video=True)
        second = await make_offer(video=True)
        third = await make_offer(video=True)
        assert post_offer(client, webrtc, first, "one")["type"] == "answer"
        duplicate = post_offer(client, webrtc, second, "one")
        assert duplicate["meta"]["error"] == "connection_already_exists"
        rejected = post_offer(client, webrtc, third, "two")
        assert rejected["meta"] == {"error": "concurrency_limit_reached", "limit": 1}
        for pc in (first, second, third):
            await pc.close()

    @pytest.mark.asyncio
    async def test_invalid_offers(self, launched):
        _, client, webrtc = launched
        pc = await make_offer(video=True)
        assert post_offer(client, webrtc, pc, None)["meta"]["error"] == "invalid_offer"
        candidate = client.post(
            f"{API_PREFIX}/component_server/",
            json={
                "session_hash": "session",
                "component_id": webrtc._id,
                "fn_name": "offer",
                "data": {
                    "type": "ice-candidate",
                    "webrtc_id": "missing",
                    "candidate": {
                        "candidate": "candidate:1 1 udp 1 1.2.3.4 1 typ host"
                    },
                },
            },
        ).json()
        assert candidate["meta"]["error"] == "unknown_connection"
        await pc.close()

    @pytest.mark.asyncio
    async def test_inputs_reach_connection_made_through_session_copy(self, launched):
        app, client, webrtc = launched
        # A gr.update() on the component gives the session a new instance with
        # its own id, stored under the original id, and the component_server
        # route then resolves that instance (see Blocks.postprocess_data).
        session = app.state_holder["session"]
        session[webrtc._id] = webrtc.__class__(
            **{**webrtc.constructor_args, "render": False}
        )
        replacement = session[webrtc._id]
        assert replacement is not webrtc
        assert replacement._id != webrtc._id
        pc = await make_offer(video=True)
        answer = post_offer(client, webrtc, pc, "one")
        assert answer["type"] == "answer"
        assert answer["time_limit"] is None
        await webrtc._push_inputs("one", 0.5)
        track = get_manager(webrtc._id).connections["one"][0]
        assert track.latest_args == [0.5]
        await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched", [{"modality": "audio", "handler": EchoHandler}], indirect=True
    )
    async def test_handler_class_instantiated_per_connection(self, launched):
        _, client, webrtc = launched
        manager = get_manager(webrtc._id)
        manager.concurrency_limit = 2
        first = await make_offer(audio=True)
        second = await make_offer(audio=True)
        assert post_offer(client, webrtc, first, "one")["type"] == "answer"
        assert post_offer(client, webrtc, second, "two")["type"] == "answer"
        assert isinstance(manager.handlers["one"], EchoHandler)
        assert manager.handlers["one"] is not manager.handlers["two"]
        for pc in (first, second):
            await pc.close()

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "launched",
        [{"mode": "receive", "handler": VideoStreamHandler(flip, fps=5)}],
        indirect=True,
    )
    async def test_receive_mode_adds_server_track(self, launched):
        _, client, webrtc = launched
        pc = RTCPeerConnection()
        pc.createDataChannel("text")
        pc.addTransceiver("video", direction="recvonly")
        await pc.setLocalDescription(await pc.createOffer())
        answer = post_offer(client, webrtc, pc, "one")
        assert answer["type"] == "answer"
        assert "a=sendonly" in answer["sdp"]
        track = get_manager(webrtc._id).connections["one"][0]
        assert track.fps == 5
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
