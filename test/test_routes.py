"""Contains tests for networking.py and app.py"""
import json
import os
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pandas as pd
import pytest
import starlette.routing
import websockets
from fastapi import FastAPI
from fastapi.testclient import TestClient
from gradio_client import media_data

import gradio as gr
from gradio import (
    Blocks,
    Button,
    Interface,
    Number,
    Textbox,
    close_all,
    routes,
)

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


@pytest.fixture()
def test_client():
    io = Interface(lambda x: x + x, "text", "text")
    app, _, _ = io.launch(prevent_thread_lock=True)
    test_client = TestClient(app)
    yield test_client
    io.close()
    close_all()


class TestRoutes:
    def test_get_main_route(self, test_client):
        response = test_client.get("/")
        assert response.status_code == 200

    def test_static_files_served_safely(self, test_client):
        # Make sure things outside the static folder are not accessible
        response = test_client.get(r"/static/..%2findex.html")
        assert response.status_code == 403
        response = test_client.get(r"/static/..%2f..%2fapi_docs.html")
        assert response.status_code == 403

    def test_get_config_route(self, test_client):
        response = test_client.get("/config/")
        assert response.status_code == 200

    def test_upload_path(self, test_client):
        response = test_client.post(
            "/upload", files={"files": open("test/test_files/alphabet.txt", "r")}
        )
        assert response.status_code == 200
        file = response.json()[0]
        assert "alphabet" in file
        assert file.endswith(".txt")
        with open(file) as saved_file:
            assert saved_file.read() == "abcdefghijklmnopqrstuvwxyz"

    def test_custom_upload_path(self):
        os.environ["GRADIO_TEMP_DIR"] = str(Path(tempfile.gettempdir()) / "gradio-test")
        io = Interface(lambda x: x + x, "text", "text")
        app, _, _ = io.launch(prevent_thread_lock=True)
        test_client = TestClient(app)
        try:
            response = test_client.post(
                "/upload", files={"files": open("test/test_files/alphabet.txt", "r")}
            )
            assert response.status_code == 200
            file = response.json()[0]
            assert "alphabet" in file
            assert file.startswith(str(Path(tempfile.gettempdir()) / "gradio-test"))
            assert file.endswith(".txt")
            with open(file) as saved_file:
                assert saved_file.read() == "abcdefghijklmnopqrstuvwxyz"
        finally:
            os.environ["GRADIO_TEMP_DIR"] = ""

    def test_predict_route(self, test_client):
        response = test_client.post(
            "/api/predict/", json={"data": ["test"], "fn_index": 0}
        )
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["testtest"]

    def test_named_predict_route(self):
        with Blocks() as demo:
            i = Textbox()
            o = Textbox()
            i.change(lambda x: f"{x}1", i, o, api_name="p")
            i.change(lambda x: f"{x}2", i, o, api_name="q")

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post("/api/p/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test1"]

        response = client.post("/api/q/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test2"]

    def test_same_named_predict_route(self):
        with Blocks() as demo:
            i = Textbox()
            o = Textbox()
            i.change(lambda x: f"{x}0", i, o, api_name="p")
            i.change(lambda x: f"{x}1", i, o, api_name="p")

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post("/api/p/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test0"]

        response = client.post("/api/p_1/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test1"]

    def test_multiple_renamed(self):
        with Blocks() as demo:
            i = Textbox()
            o = Textbox()
            i.change(lambda x: f"{x}0", i, o, api_name="p")
            i.change(lambda x: f"{x}1", i, o, api_name="p")
            i.change(lambda x: f"{x}2", i, o, api_name="p_1")

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post("/api/p/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test0"]

        response = client.post("/api/p_1/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test1"]

        response = client.post("/api/p_1_1/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test2"]

    def test_predict_route_without_fn_index(self, test_client):
        response = test_client.post("/api/predict/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["testtest"]

    def test_predict_route_batching(self):
        def batch_fn(x):
            results = []
            for word in x:
                results.append(f"Hello {word}")
            return (results,)

        with gr.Blocks() as demo:
            text = gr.Textbox()
            btn = gr.Button()
            btn.click(batch_fn, inputs=text, outputs=text, batch=True, api_name="pred")

        demo.queue()
        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post("/api/pred/", json={"data": ["test"]})
        output = dict(response.json())
        assert output["data"] == ["Hello test"]

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post(
            "/api/pred/", json={"data": [["test", "test2"]], "batched": True}
        )
        output = dict(response.json())
        assert output["data"] == [["Hello test", "Hello test2"]]

    def test_state(self):
        def predict(input, history):
            if history is None:
                history = ""
            history += input
            return history, history

        io = Interface(predict, ["textbox", "state"], ["textbox", "state"])
        app, _, _ = io.launch(prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post(
            "/api/predict/",
            json={"data": ["test", None], "fn_index": 0, "session_hash": "_"},
        )
        output = dict(response.json())
        assert output["data"] == ["test", None]
        response = client.post(
            "/api/predict/",
            json={"data": ["test", None], "fn_index": 0, "session_hash": "_"},
        )
        output = dict(response.json())
        assert output["data"] == ["testtest", None]

    def test_get_allowed_paths(self):
        allowed_file = tempfile.NamedTemporaryFile(mode="w", delete=False)
        allowed_file.write(media_data.BASE64_IMAGE)
        allowed_file.flush()

        io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
        app, _, _ = io.launch(prevent_thread_lock=True)
        client = TestClient(app)
        file_response = client.get(f"/file={allowed_file.name}")
        assert file_response.status_code == 403
        io.close()

        io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
        app, _, _ = io.launch(
            prevent_thread_lock=True,
            allowed_paths=[os.path.dirname(allowed_file.name)],
        )
        client = TestClient(app)
        file_response = client.get(f"/file={allowed_file.name}")
        assert file_response.status_code == 200
        assert len(file_response.text) == len(media_data.BASE64_IMAGE)
        io.close()

        io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
        app, _, _ = io.launch(
            prevent_thread_lock=True,
            allowed_paths=[os.path.abspath(allowed_file.name)],
        )
        client = TestClient(app)
        file_response = client.get(f"/file={allowed_file.name}")
        assert file_response.status_code == 200
        assert len(file_response.text) == len(media_data.BASE64_IMAGE)
        io.close()

    def test_get_blocked_paths(self):
        # Test that blocking a default Gradio file path works
        with tempfile.NamedTemporaryFile(
            dir=".", suffix=".jpg", delete=False
        ) as tmp_file:
            io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
            app, _, _ = io.launch(
                prevent_thread_lock=True,
            )
            client = TestClient(app)
            file_response = client.get(f"/file={tmp_file.name}")
            assert file_response.status_code == 200
        io.close()
        os.remove(tmp_file.name)

        with tempfile.NamedTemporaryFile(
            dir=".", suffix=".jpg", delete=False
        ) as tmp_file:
            io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
            app, _, _ = io.launch(
                prevent_thread_lock=True, blocked_paths=[os.path.abspath(tmp_file.name)]
            )
            client = TestClient(app)
            file_response = client.get(f"/file={tmp_file.name}")
            assert file_response.status_code == 403
        io.close()
        os.remove(tmp_file.name)

        # Test that blocking a default Gradio directory works
        with tempfile.NamedTemporaryFile(
            dir=".", suffix=".jpg", delete=False
        ) as tmp_file:
            io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
            app, _, _ = io.launch(
                prevent_thread_lock=True, blocked_paths=[os.path.abspath(tmp_file.name)]
            )
            client = TestClient(app)
            file_response = client.get(f"/file={tmp_file.name}")
            assert file_response.status_code == 403
        io.close()
        os.remove(tmp_file.name)

        # Test that blocking a directory works even if it's also allowed
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
            io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
            app, _, _ = io.launch(
                prevent_thread_lock=True,
                allowed_paths=[os.path.dirname(tmp_file.name)],
                blocked_paths=[os.path.dirname(tmp_file.name)],
            )
            client = TestClient(app)
            file_response = client.get(f"/file={tmp_file.name}")
            assert file_response.status_code == 403
        io.close()
        os.remove(tmp_file.name)

    def test_get_file_created_by_app(self):
        app, _, _ = gr.Interface(lambda s: s.name, gr.File(), gr.File()).launch(
            prevent_thread_lock=True
        )
        client = TestClient(app)
        response = client.post(
            "/api/predict/",
            json={
                "data": [
                    {
                        "data": media_data.BASE64_IMAGE,
                        "name": "bus.png",
                        "size": len(media_data.BASE64_IMAGE),
                    }
                ],
                "fn_index": 0,
                "session_hash": "_",
            },
        ).json()
        created_file = response["data"][0]["name"]
        file_response = client.get(f"/file={created_file}")
        assert file_response.is_success

        backwards_compatible_file_response = client.get(f"/file/{created_file}")
        assert backwards_compatible_file_response.is_success

        file_response_with_full_range = client.get(
            f"/file={created_file}", headers={"Range": "bytes=0-"}
        )
        assert file_response_with_full_range.is_success
        assert file_response.text == file_response_with_full_range.text

        file_response_with_partial_range = client.get(
            f"/file={created_file}", headers={"Range": "bytes=0-10"}
        )
        assert file_response_with_partial_range.is_success
        assert len(file_response_with_partial_range.text) == 11

    def test_mount_gradio_app(self):
        app = FastAPI()

        demo = gr.Interface(
            lambda s: f"Hello from ps, {s}!", "textbox", "textbox"
        ).queue()
        demo1 = gr.Interface(
            lambda s: f"Hello from py, {s}!", "textbox", "textbox"
        ).queue()

        app = gr.mount_gradio_app(app, demo, path="/ps")
        app = gr.mount_gradio_app(app, demo1, path="/py")

        # Use context manager to trigger start up events
        with TestClient(app) as client:
            assert client.get("/ps").is_success
            assert client.get("/py").is_success

    def test_static_file_missing(self, test_client):
        response = test_client.get(r"/static/not-here.js")
        assert response.status_code == 404

    def test_asset_file_missing(self, test_client):
        response = test_client.get(r"/assets/not-here.js")
        assert response.status_code == 404

    def test_dynamic_file_missing(self, test_client):
        response = test_client.get(r"/file=not-here.js")
        assert response.status_code == 404

    def test_dynamic_file_directory(self, test_client):
        response = test_client.get(r"/file=gradio")
        assert response.status_code == 403

    def test_mount_gradio_app_raises_error_if_event_queued_but_queue_disabled(self):
        with gr.Blocks() as demo:
            with gr.Row():
                with gr.Column():
                    input_ = gr.Textbox()
                    btn = gr.Button("Greet")
                with gr.Column():
                    output = gr.Textbox()
            btn.click(
                lambda x: f"Hello, {x}",
                inputs=input_,
                outputs=output,
                queue=True,
                api_name="greet",
            )

        with pytest.raises(ValueError, match="The queue is enabled for event greet"):
            demo.launch(prevent_thread_lock=True)

        demo.close()


class TestGeneratorRoutes:
    def test_generator(self):
        def generator(string):
            for char in string:
                yield char

        io = Interface(generator, "text", "text")
        app, _, _ = io.queue().launch(prevent_thread_lock=True)
        client = TestClient(app)

        response = client.post(
            "/api/predict/",
            json={"data": ["abc"], "fn_index": 0, "session_hash": "11"},
            headers={"Authorization": f"Bearer {app.queue_token}"},
        )
        output = dict(response.json())
        assert output["data"][0] == "a"

        response = client.post(
            "/api/predict/",
            json={"data": ["abc"], "fn_index": 0, "session_hash": "11"},
            headers={"Authorization": f"Bearer {app.queue_token}"},
        )
        output = dict(response.json())
        assert output["data"][0] == "b"

        response = client.post(
            "/api/predict/",
            json={"data": ["abc"], "fn_index": 0, "session_hash": "11"},
            headers={"Authorization": f"Bearer {app.queue_token}"},
        )
        output = dict(response.json())
        assert output["data"][0] == "c"

        response = client.post(
            "/api/predict/",
            json={"data": ["abc"], "fn_index": 0, "session_hash": "11"},
            headers={"Authorization": f"Bearer {app.queue_token}"},
        )
        output = dict(response.json())
        assert output["data"] == [
            {"__type__": "update"},
            {"__type__": "update", "visible": True},
            {"__type__": "update", "visible": False},
        ]

        response = client.post(
            "/api/predict/",
            json={"data": ["abc"], "fn_index": 0, "session_hash": "11"},
            headers={"Authorization": f"Bearer {app.queue_token}"},
        )
        output = dict(response.json())
        assert output["data"][0] is None

        response = client.post(
            "/api/predict/",
            json={"data": ["abc"], "fn_index": 0, "session_hash": "11"},
            headers={"Authorization": f"Bearer {app.queue_token}"},
        )
        output = dict(response.json())
        assert output["data"][0] == "a"


class TestApp:
    def test_create_app(self):
        app = routes.App.create_app(Interface(lambda x: x, "text", "text"))
        assert isinstance(app, FastAPI)


class TestAuthenticatedRoutes:
    def test_post_login(self):
        io = Interface(lambda x: x, "text", "text")
        app, _, _ = io.launch(
            auth=("test", "correct_password"),
            prevent_thread_lock=True,
            enable_queue=False,
        )
        client = TestClient(app)

        response = client.post(
            "/login",
            data={"username": "test", "password": "correct_password"},
        )
        assert response.status_code == 200
        response = client.post(
            "/login",
            data={"username": "test", "password": "incorrect_password"},
        )
        assert response.status_code == 400


class TestQueueRoutes:
    @pytest.mark.asyncio
    @pytest.mark.skipif(
        sys.version_info < (3, 8),
        reason="Mocks don't work with async context managers in 3.7",
    )
    @patch("gradio.routes.get_server_url_from_ws_url", return_value="foo_url")
    async def test_queue_join_routes_sets_url_if_none_set(self, mock_get_url):
        io = Interface(lambda x: x, "text", "text").queue()
        io.launch(prevent_thread_lock=True)
        io._queue.server_path = None
        async with websockets.connect(
            f"{io.local_url.replace('http', 'ws')}queue/join"
        ) as ws:
            completed = False
            while not completed:
                msg = json.loads(await ws.recv())
                if msg["msg"] == "send_data":
                    await ws.send(json.dumps({"data": ["foo"], "fn_index": 0}))
                if msg["msg"] == "send_hash":
                    await ws.send(json.dumps({"fn_index": 0, "session_hash": "shdce"}))
                completed = msg["msg"] == "process_completed"
        assert io._queue.server_path == "foo_url"

    @pytest.mark.parametrize(
        "ws_url,answer",
        [
            ("ws://127.0.0.1:7861/queue/join", "http://127.0.0.1:7861/"),
            (
                "ws://127.0.0.1:7861/gradio/gradio/gradio/queue/join",
                "http://127.0.0.1:7861/gradio/gradio/gradio/",
            ),
            (
                "wss://gradio-titanic-survival.hf.space/queue/join",
                "https://gradio-titanic-survival.hf.space/",
            ),
        ],
    )
    def test_get_server_url_from_ws_url(self, ws_url, answer):
        assert routes.get_server_url_from_ws_url(ws_url) == answer


class TestDevMode:
    def test_mount_gradio_app_set_dev_mode_false(self):
        app = FastAPI()

        @app.get("/")
        def read_main():
            return {"message": "Hello!"}

        with gr.Blocks() as blocks:
            gr.Textbox("Hello from gradio!")

        app = routes.mount_gradio_app(app, blocks, path="/gradio")
        gradio_fast_api = next(
            route for route in app.routes if isinstance(route, starlette.routing.Mount)
        )
        assert not gradio_fast_api.app.blocks.dev_mode


class TestPassingRequest:
    def test_request_included_with_regular_function(self):
        def identity(name, request: gr.Request):
            assert isinstance(request.client.host, str)
            return name

        app, _, _ = gr.Interface(identity, "textbox", "textbox").launch(
            prevent_thread_lock=True,
        )
        client = TestClient(app)

        response = client.post("/api/predict/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test"]

    def test_request_get_headers(self):
        def identity(name, request: gr.Request):
            assert isinstance(request.headers["user-agent"], str)
            assert isinstance(request.headers.items(), list)
            assert isinstance(request.headers.keys(), list)
            assert isinstance(request.headers.values(), list)
            assert isinstance(dict(request.headers), dict)
            user_agent = request.headers["user-agent"]
            assert "testclient" in user_agent
            return name

        app, _, _ = gr.Interface(identity, "textbox", "textbox").launch(
            prevent_thread_lock=True,
        )
        client = TestClient(app)

        response = client.post("/api/predict/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test"]

    def test_request_includes_username_as_none_if_no_auth(self):
        def identity(name, request: gr.Request):
            assert request.username is None
            return name

        app, _, _ = gr.Interface(identity, "textbox", "textbox").launch(
            prevent_thread_lock=True,
        )
        client = TestClient(app)

        response = client.post("/api/predict/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test"]

    def test_request_includes_username_with_auth(self):
        def identity(name, request: gr.Request):
            assert request.username == "admin"
            return name

        app, _, _ = gr.Interface(identity, "textbox", "textbox").launch(
            prevent_thread_lock=True, auth=("admin", "password")
        )
        client = TestClient(app)

        client.post(
            "/login",
            data={"username": "admin", "password": "password"},
        )
        response = client.post("/api/predict/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test"]


def test_predict_route_is_blocked_if_api_open_false():
    io = Interface(lambda x: x, "text", "text", examples=[["freddy"]]).queue(
        api_open=False
    )
    app, _, _ = io.launch(prevent_thread_lock=True)
    assert not io.show_api
    client = TestClient(app)
    result = client.post(
        "/api/predict", json={"fn_index": 0, "data": [5], "session_hash": "foo"}
    )
    assert result.status_code == 401


def test_predict_route_not_blocked_if_queue_disabled():
    with Blocks() as demo:
        input = Textbox()
        output = Textbox()
        number = Number()
        button = Button()
        button.click(
            lambda x: f"Hello, {x}!", input, output, queue=False, api_name="not_blocked"
        )
        button.click(lambda: 42, None, number, queue=True, api_name="blocked")
    app, _, _ = demo.queue(api_open=False).launch(
        prevent_thread_lock=True, show_api=True
    )
    assert not demo.show_api
    client = TestClient(app)

    result = client.post("/api/blocked", json={"data": [], "session_hash": "foo"})
    assert result.status_code == 401
    result = client.post(
        "/api/not_blocked", json={"data": ["freddy"], "session_hash": "foo"}
    )
    assert result.status_code == 200
    assert result.json()["data"] == ["Hello, freddy!"]


def test_predict_route_not_blocked_if_routes_open():
    with Blocks() as demo:
        input = Textbox()
        output = Textbox()
        button = Button()
        button.click(
            lambda x: f"Hello, {x}!", input, output, queue=True, api_name="not_blocked"
        )
    app, _, _ = demo.queue(api_open=True).launch(
        prevent_thread_lock=True, show_api=False
    )
    assert demo.show_api
    client = TestClient(app)

    result = client.post(
        "/api/not_blocked", json={"data": ["freddy"], "session_hash": "foo"}
    )
    assert result.status_code == 200
    assert result.json()["data"] == ["Hello, freddy!"]

    demo.close()
    demo.queue(api_open=False).launch(prevent_thread_lock=True, show_api=False)
    assert not demo.show_api


def test_show_api_queue_not_enabled():
    io = Interface(lambda x: x, "text", "text", examples=[["freddy"]])
    app, _, _ = io.launch(prevent_thread_lock=True)
    assert io.show_api
    io.close()
    io.launch(prevent_thread_lock=True, show_api=False)
    assert not io.show_api


def test_orjson_serialization():
    df = pd.DataFrame(
        {
            "date_1": pd.date_range("2021-01-01", periods=2),
            "date_2": pd.date_range("2022-02-15", periods=2).strftime("%B %d, %Y, %r"),
            "number": np.array([0.2233, 0.57281]),
            "number_2": np.array([84, 23]).astype(np.int64),
            "bool": [True, False],
            "markdown": ["# Hello", "# Goodbye"],
        }
    )

    with gr.Blocks() as demo:
        gr.DataFrame(df)
    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)
    response = test_client.get("/")
    assert response.status_code == 200
    demo.close()
