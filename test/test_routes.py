"""Contains tests for networking.py and app.py"""
import functools
import os
import tempfile
from contextlib import closing
from unittest import mock as mock

import gradio_client as grc
import numpy as np
import pandas as pd
import pytest
import starlette.routing
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
    wasm_utils,
)
from gradio.route_utils import FnIndexInferError


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

    def test_favicon_route(self, test_client):
        response = test_client.get("/favicon.ico")
        assert response.status_code == 200

    def test_upload_path(self, test_client):
        with open("test/test_files/alphabet.txt", "rb") as f:
            response = test_client.post("/upload", files={"files": f})
        assert response.status_code == 200
        file = response.json()[0]
        assert "alphabet" in file
        assert file.endswith(".txt")
        with open(file, "rb") as saved_file:
            assert saved_file.read() == b"abcdefghijklmnopqrstuvwxyz"

    def test_custom_upload_path(self, gradio_temp_dir):
        io = Interface(lambda x: x + x, "text", "text")
        app, _, _ = io.launch(prevent_thread_lock=True)
        test_client = TestClient(app)
        with open("test/test_files/alphabet.txt", "rb") as f:
            response = test_client.post("/upload", files={"files": f})
        assert response.status_code == 200
        file = response.json()[0]
        assert "alphabet" in file
        assert file.startswith(str(gradio_temp_dir))
        assert file.endswith(".txt")
        with open(file, "rb") as saved_file:
            assert saved_file.read() == b"abcdefghijklmnopqrstuvwxyz"

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

        demo.queue(api_open=True)
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

    def test_allowed_and_blocked_paths(self):
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
            io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
            app, _, _ = io.launch(
                prevent_thread_lock=True,
                allowed_paths=[os.path.dirname(tmp_file.name)],
            )
            client = TestClient(app)
            file_response = client.get(f"/file={tmp_file.name}")
            assert file_response.status_code == 200
        io.close()
        os.remove(tmp_file.name)

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

    def test_get_file_created_by_app(self, test_client):
        app, _, _ = gr.Interface(lambda s: s.name, gr.File(), gr.File()).launch(
            prevent_thread_lock=True
        )
        client = TestClient(app)
        with open("test/test_files/alphabet.txt", "rb") as f:
            file_response = test_client.post("/upload", files={"files": f})
        response = client.post(
            "/api/predict/",
            json={
                "data": [
                    {
                        "path": file_response.json()[0],
                        "size": os.path.getsize("test/test_files/alphabet.txt"),
                    }
                ],
                "fn_index": 0,
                "session_hash": "_",
            },
        ).json()
        created_file = response["data"][0]["path"]
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

    def test_mount_gradio_app_with_app_kwargs(self):
        app = FastAPI()

        demo = gr.Interface(lambda s: f"You said {s}!", "textbox", "textbox").queue()

        app = gr.mount_gradio_app(
            app, demo, path="/echo", app_kwargs={"docs_url": "/docs-custom"}
        )

        # Use context manager to trigger start up events
        with TestClient(app) as client:
            assert client.get("/echo/docs-custom").is_success

    def test_static_file_missing(self, test_client):
        response = test_client.get(r"/static/not-here.js")
        assert response.status_code == 404

    def test_asset_file_missing(self, test_client):
        response = test_client.get(r"/assets/not-here.js")
        assert response.status_code == 404

    def test_cannot_access_files_in_working_directory(self, test_client):
        response = test_client.get(r"/file=not-here.js")
        assert response.status_code == 403

    def test_cannot_access_directories_in_working_directory(self, test_client):
        response = test_client.get(r"/file=gradio")
        assert response.status_code == 403

    def test_do_not_expose_existence_of_files_outside_working_directory(
        self, test_client
    ):
        response = test_client.get(r"/file=../fake-file-that-does-not-exist.js")
        assert response.status_code == 403  # not a 404

    def test_proxy_route_is_restricted_to_load_urls(self):
        gr.context.Context.hf_token = "abcdef"
        app = routes.App()
        interface = gr.Interface(lambda x: x, "text", "text")
        app.configure_app(interface)
        with pytest.raises(PermissionError):
            app.build_proxy_request(
                "https://gradio-tests-test-loading-examples-private.hf.space/file=Bunny.obj"
            )
        with pytest.raises(PermissionError):
            app.build_proxy_request("https://google.com")
        interface.proxy_urls = {
            "https://gradio-tests-test-loading-examples-private.hf.space"
        }
        app.build_proxy_request(
            "https://gradio-tests-test-loading-examples-private.hf.space/file=Bunny.obj"
        )

    def test_proxy_does_not_leak_hf_token_externally(self):
        gr.context.Context.hf_token = "abcdef"
        app = routes.App()
        interface = gr.Interface(lambda x: x, "text", "text")
        interface.proxy_urls = {
            "https://gradio-tests-test-loading-examples-private.hf.space",
            "https://google.com",
        }
        app.configure_app(interface)
        r = app.build_proxy_request(
            "https://gradio-tests-test-loading-examples-private.hf.space/file=Bunny.obj"
        )
        assert "authorization" in dict(r.headers)
        r = app.build_proxy_request("https://google.com")
        assert "authorization" not in dict(r.headers)


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

        response = client.post(
            "/login",
            data={"username": " test ", "password": "correct_password"},
        )
        assert response.status_code == 200


class TestQueueRoutes:
    @pytest.mark.asyncio
    async def test_queue_join_routes_sets_app_if_none_set(self):
        io = Interface(lambda x: x, "text", "text").queue()
        io.launch(prevent_thread_lock=True)
        io._queue.server_path = None

        client = grc.Client(io.local_url)
        client.predict("test")

        assert io._queue.server_app == io.server_app


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
    def test_request_included_with_interface(self):
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

    def test_request_included_with_chat_interface(self):
        def identity(x, y, request: gr.Request):
            assert isinstance(request.client.host, str)
            return x

        app, _, _ = gr.ChatInterface(identity).launch(
            prevent_thread_lock=True,
        )
        client = TestClient(app)

        response = client.post("/api/chat/", json={"data": ["test", None]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test", None]

    def test_request_included_with_chat_interface_when_streaming(self):
        def identity(x, y, request: gr.Request):
            assert isinstance(request.client.host, str)
            for i in range(len(x)):
                yield x[: i + 1]

        app, _, _ = (
            gr.ChatInterface(identity)
            .queue(api_open=True)
            .launch(
                prevent_thread_lock=True,
            )
        )
        client = TestClient(app)

        response = client.post("/api/chat/", json={"data": ["test", None]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["t", None]

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
    assert io.show_api
    client = TestClient(app)
    result = client.post(
        "/api/predict", json={"fn_index": 0, "data": [5], "session_hash": "foo"}
    )
    assert result.status_code == 404


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
    assert demo.show_api
    client = TestClient(app)

    result = client.post("/api/blocked", json={"data": [], "session_hash": "foo"})
    assert result.status_code == 404
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
    assert not demo.show_api
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


def test_file_route_does_not_allow_dot_paths(tmp_path):
    dot_file = tmp_path / ".env"
    dot_file.write_text("secret=1234")
    subdir = tmp_path / "subdir"
    subdir.mkdir()
    sub_dot_file = subdir / ".env"
    sub_dot_file.write_text("secret=1234")
    secret_sub_dir = tmp_path / ".versioncontrol"
    secret_sub_dir.mkdir()
    secret_sub_dir_regular_file = secret_sub_dir / "settings"
    secret_sub_dir_regular_file.write_text("token = 8")
    with closing(gr.Interface(lambda s: s.name, gr.File(), gr.File())) as io:
        app, _, _ = io.launch(prevent_thread_lock=True)
        client = TestClient(app)
        assert client.get("/file=.env").status_code == 403
        assert client.get("/file=subdir/.env").status_code == 403
        assert client.get("/file=.versioncontrol/settings").status_code == 403


def test_api_name_set_for_all_events(connect):
    with gr.Blocks() as demo:
        i = Textbox()
        o = Textbox()
        btn = Button()
        btn1 = Button()
        btn2 = Button()
        btn3 = Button()
        btn4 = Button()
        btn5 = Button()
        btn6 = Button()
        btn7 = Button()
        btn8 = Button()

        def greet(i):
            return "Hello " + i

        def goodbye(i):
            return "Goodbye " + i

        def greet_me(i):
            return "Hello"

        def say_goodbye(i):
            return "Goodbye"

        say_goodbye.__name__ = "Say_$$_goodbye"

        # Otherwise changed by ruff
        foo = lambda s: s  # noqa

        def foo2(s):
            return s + " foo"

        foo2.__name__ = "foo-2"

        class Callable:
            def __call__(self, a) -> str:
                return "From __call__"

        def from_partial(a, b):
            return b + a

        part = functools.partial(from_partial, b="From partial: ")

        btn.click(greet, i, o)
        btn1.click(goodbye, i, o)
        btn2.click(greet_me, i, o)
        btn3.click(say_goodbye, i, o)
        btn4.click(None, i, o)
        btn5.click(foo, i, o)
        btn6.click(foo2, i, o)
        btn7.click(Callable(), i, o)
        btn8.click(part, i, o)

    with closing(demo) as io:
        app, _, _ = io.launch(prevent_thread_lock=True)
        client = TestClient(app)
        assert client.post(
            "/api/greet", json={"data": ["freddy"], "session_hash": "foo"}
        ).json()["data"] == ["Hello freddy"]
        assert client.post(
            "/api/goodbye", json={"data": ["freddy"], "session_hash": "foo"}
        ).json()["data"] == ["Goodbye freddy"]
        assert client.post(
            "/api/greet_me", json={"data": ["freddy"], "session_hash": "foo"}
        ).json()["data"] == ["Hello"]
        assert client.post(
            "/api/Say__goodbye", json={"data": ["freddy"], "session_hash": "foo"}
        ).json()["data"] == ["Goodbye"]
        assert client.post(
            "/api/lambda", json={"data": ["freddy"], "session_hash": "foo"}
        ).json()["data"] == ["freddy"]
        assert client.post(
            "/api/foo-2", json={"data": ["freddy"], "session_hash": "foo"}
        ).json()["data"] == ["freddy foo"]
        assert client.post(
            "/api/Callable", json={"data": ["freddy"], "session_hash": "foo"}
        ).json()["data"] == ["From __call__"]
        assert client.post(
            "/api/partial", json={"data": ["freddy"], "session_hash": "foo"}
        ).json()["data"] == ["From partial: freddy"]
        with pytest.raises(FnIndexInferError):
            client.post(
                "/api/Say_goodbye", json={"data": ["freddy"], "session_hash": "foo"}
            )

    with connect(demo) as client:
        assert client.predict("freddy", api_name="/greet") == "Hello freddy"
        assert client.predict("freddy", api_name="/goodbye") == "Goodbye freddy"
        assert client.predict("freddy", api_name="/greet_me") == "Hello"
        assert client.predict("freddy", api_name="/Say__goodbye") == "Goodbye"


class TestShowAPI:
    @mock.patch.object(wasm_utils, "IS_WASM", True)
    def test_show_api_false_when_is_wasm_true(self):
        interface = Interface(lambda x: x, "text", "text", examples=[["hannah"]])
        assert (
            interface.show_api is False
        ), "show_api should be False when IS_WASM is True"

    @mock.patch.object(wasm_utils, "IS_WASM", False)
    def test_show_api_true_when_is_wasm_false(self):
        interface = Interface(lambda x: x, "text", "text", examples=[["hannah"]])
        assert (
            interface.show_api is True
        ), "show_api should be True when IS_WASM is False"
