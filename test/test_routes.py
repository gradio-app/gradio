"""Contains tests for networking.py and app.py"""
import json
import os
import sys
from unittest.mock import patch

import pytest
import starlette.routing
import websockets
from fastapi import FastAPI
from fastapi.testclient import TestClient

import gradio as gr
from gradio import Blocks, Button, Interface, Number, Textbox, close_all, routes

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
        assert response.status_code == 404
        response = test_client.get(r"/static/..%2f..%2fapi_docs.html")
        assert response.status_code == 404

    def test_get_config_route(self, test_client):
        response = test_client.get("/config/")
        assert response.status_code == 200

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
            i.change(lambda x: x + "1", i, o, api_name="p")
            i.change(lambda x: x + "2", i, o, api_name="q")

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
            i.change(lambda x: x + "0", i, o, api_name="p")
            i.change(lambda x: x + "1", i, o, api_name="p")

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
            i.change(lambda x: x + "0", i, o, api_name="p")
            i.change(lambda x: x + "1", i, o, api_name="p")
            i.change(lambda x: x + "2", i, o, api_name="p_1")

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
                results.append("Hello " + word)
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
        assert output["data"] == ["a"]

        response = client.post(
            "/api/predict/",
            json={"data": ["abc"], "fn_index": 0, "session_hash": "11"},
            headers={"Authorization": f"Bearer {app.queue_token}"},
        )
        output = dict(response.json())
        assert output["data"] == ["b"]

        response = client.post(
            "/api/predict/",
            json={"data": ["abc"], "fn_index": 0, "session_hash": "11"},
            headers={"Authorization": f"Bearer {app.queue_token}"},
        )
        output = dict(response.json())
        assert output["data"] == ["c"]

        response = client.post(
            "/api/predict/",
            json={"data": ["abc"], "fn_index": 0, "session_hash": "11"},
            headers={"Authorization": f"Bearer {app.queue_token}"},
        )
        output = dict(response.json())
        assert output["data"] == [None]

        response = client.post(
            "/api/predict/",
            json={"data": ["abc"], "fn_index": 0, "session_hash": "11"},
            headers={"Authorization": f"Bearer {app.queue_token}"},
        )
        output = dict(response.json())
        assert output["data"] == ["a"]


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
            data=dict(username="test", password="correct_password"),
            follow_redirects=False,
        )
        assert response.status_code == 302
        response = client.post(
            "/login",
            data=dict(username="test", password="incorrect_password"),
            follow_redirects=False,
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
