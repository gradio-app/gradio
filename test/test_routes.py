"""Contains tests for networking.py and app.py"""

import functools
import inspect
import json
import os
import pickle
import tempfile
import time
from contextlib import asynccontextmanager, closing
from pathlib import Path
from threading import Thread
from unittest.mock import patch

import gradio_client as grc
import httpx
import numpy as np
import pandas as pd
import pytest
import requests
import starlette.routing
from fastapi import FastAPI, Request
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
from gradio.route_utils import (
    API_PREFIX,
    FnIndexInferError,
    compare_passwords_securely,
    get_api_call_path,
    get_request_origin,
    get_root_url,
    starts_with_protocol,
)


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

    def test_openapi_route(self, test_client):
        response = test_client.get(f"{API_PREFIX}/openapi.json")
        assert response.status_code == 200
        assert response.json()["openapi"] == "3.0.2"

    def test_upload_path(self, test_client):
        with open("test/test_files/alphabet.txt", "rb") as f:
            response = test_client.post(f"{API_PREFIX}/upload", files={"files": f})
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
            response = test_client.post(f"{API_PREFIX}/upload", files={"files": f})
        assert response.status_code == 200
        file = response.json()[0]
        assert "alphabet" in file
        assert file.startswith(str(gradio_temp_dir))
        assert file.endswith(".txt")
        with open(file, "rb") as saved_file:
            assert saved_file.read() == b"abcdefghijklmnopqrstuvwxyz"

    def test_header_size_limit(self, test_client):
        with open("test/test_files/alphabet.txt", "rb") as f:
            long_filename = "5" * 9000
            response = test_client.post(
                f"{API_PREFIX}/upload",
                files={"files": (long_filename, f, "text/plain")},
            )
        assert response.status_code == 413

    def test_predict_route(self, test_client):
        response = test_client.post(
            f"{API_PREFIX}/api/predict/", json={"data": ["test"], "fn_index": 0}
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
        response = client.post(f"{API_PREFIX}/api/p/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test1"]

        response = client.post(f"{API_PREFIX}/api/q/", json={"data": ["test"]})
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
        response = client.post(f"{API_PREFIX}/api/p/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test0"]

        response = client.post(f"{API_PREFIX}/api/p_1/", json={"data": ["test"]})
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
        response = client.post(f"{API_PREFIX}/api/p/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test0"]

        response = client.post(f"{API_PREFIX}/api/p_1/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test1"]

        response = client.post(f"{API_PREFIX}/api/p_1_1/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test2"]

    def test_predict_route_without_fn_index(self, test_client):
        response = test_client.post(
            f"{API_PREFIX}/api/predict/", json={"data": ["test"]}
        )
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
        response = client.post(f"{API_PREFIX}/api/pred/", json={"data": ["test"]})
        output = dict(response.json())
        assert output["data"] == ["Hello test"]

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post(
            f"{API_PREFIX}/api/pred/",
            json={"data": [["test", "test2"]], "batched": True},
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
            f"{API_PREFIX}/api/predict/",
            json={"data": ["test", None], "fn_index": 0, "session_hash": "_"},
        )
        output = dict(response.json())
        assert output["data"] == ["test", None]
        response = client.post(
            f"{API_PREFIX}/api/predict/",
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
        file_response = client.get(f"{API_PREFIX}/file={allowed_file.name}")
        assert file_response.status_code == 403
        io.close()

        io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
        app, _, _ = io.launch(
            prevent_thread_lock=True,
            allowed_paths=[os.path.dirname(allowed_file.name)],
        )
        client = TestClient(app)
        file_response = client.get(f"{API_PREFIX}/file={allowed_file.name}")
        assert file_response.status_code == 200
        assert len(file_response.text) == len(media_data.BASE64_IMAGE)
        io.close()

        io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
        app, _, _ = io.launch(
            prevent_thread_lock=True,
            allowed_paths=[os.path.abspath(allowed_file.name)],
        )
        client = TestClient(app)
        file_response = client.get(f"{API_PREFIX}/file={allowed_file.name}")
        assert file_response.status_code == 200
        assert len(file_response.text) == len(media_data.BASE64_IMAGE)
        io.close()

    def test_response_attachment_format(self):
        image_file = tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".png")
        image_file.write(media_data.BASE64_IMAGE)
        image_file.flush()

        html_file = tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".html")
        html_file.write("<html>Hello, world!</html>")
        html_file.flush()

        io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
        app, _, _ = io.launch(
            prevent_thread_lock=True,
            allowed_paths=[
                image_file.name,
                html_file.name,
            ],
        )

        html_file2 = tempfile.NamedTemporaryFile(
            mode="w", delete=False, suffix=".html", dir=app.uploaded_file_dir
        )
        html_file2.write("<html>Hello, world!</html>")
        html_file2.flush()
        html_file2_name = str(Path(app.uploaded_file_dir) / html_file2.name)

        client = TestClient(app)

        file_response = client.get(f"{API_PREFIX}/file={image_file.name}")
        assert file_response.headers["Content-Type"] == "image/png"
        assert "inline" in file_response.headers["Content-Disposition"]

        file_response = client.get(f"{API_PREFIX}/file={html_file.name}")
        assert file_response.headers["Content-Type"] == "text/html; charset=utf-8"
        assert "inline" in file_response.headers["Content-Disposition"]

        file_response = client.get(f"{API_PREFIX}/file={html_file2_name}")
        assert file_response.headers["Content-Type"] == "application/octet-stream"
        assert "attachment" in file_response.headers["Content-Disposition"]

    def test_allowed_and_blocked_paths(self):
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
            io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
            app, _, _ = io.launch(
                prevent_thread_lock=True,
                allowed_paths=[os.path.dirname(tmp_file.name)],
            )
            client = TestClient(app)
            file_response = client.get(f"{API_PREFIX}/file={tmp_file.name}")
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
            file_response = client.get(f"{API_PREFIX}/file={tmp_file.name}")
            assert file_response.status_code == 403
        io.close()
        os.remove(tmp_file.name)

    def test_blocked_path_case_insensitive(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            tmp_file = Path(temp_dir) / "blocked" / "test.txt"
            tmp_file.parent.mkdir(parents=True, exist_ok=True)
            tmp_file.touch()
            io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
            app, _, _ = io.launch(
                prevent_thread_lock=True,
                allowed_paths=[temp_dir],
                blocked_paths=[str(tmp_file.parent)],
            )
            client = TestClient(app)
            file_response = client.get(
                f"{API_PREFIX}/file={str(Path(temp_dir) / 'BLOCKED' / 'test.txt')}"
            )
            assert file_response.status_code == 403
            io.close()

    def test_get_file_created_by_app(self, test_client):
        app, _, _ = gr.Interface(lambda s: s.name, gr.File(), gr.File()).launch(
            prevent_thread_lock=True
        )
        client = TestClient(app)
        with open("test/test_files/alphabet.txt", "rb") as f:
            file_response = test_client.post(f"{API_PREFIX}/upload", files={"files": f})
        response = client.post(
            f"{API_PREFIX}/api/predict/",
            json={
                "data": [
                    {
                        "path": file_response.json()[0],
                        "size": os.path.getsize("test/test_files/alphabet.txt"),
                        "meta": {"_type": "gradio.FileData"},
                    }
                ],
                "fn_index": 0,
                "session_hash": "_",
            },
        ).json()
        created_file = response["data"][0]["path"]
        file_response = client.get(f"{API_PREFIX}/file={created_file}")
        assert file_response.is_success

        backwards_compatible_file_response = client.get(
            f"{API_PREFIX}/file/{created_file}"
        )
        assert backwards_compatible_file_response.is_success

        file_response_with_full_range = client.get(
            f"{API_PREFIX}/file={created_file}", headers={"Range": "bytes=0-"}
        )
        assert file_response_with_full_range.is_success
        assert file_response.text == file_response_with_full_range.text

        file_response_with_partial_range = client.get(
            f"{API_PREFIX}/file={created_file}", headers={"Range": "bytes=0-10"}
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
            app,
            demo,
            path="/echo",
            app_kwargs={"docs_url": "/docs-custom"},
        )
        # Use context manager to trigger start up events
        with TestClient(app) as client:
            assert client.get("/echo/docs-custom").is_success

    def test_mount_gradio_app_with_auth_and_params(self):
        app = FastAPI()
        demo = gr.Interface(lambda s: f"You said {s}!", "textbox", "textbox").queue()
        app = gr.mount_gradio_app(
            app,
            demo,
            path=f"{API_PREFIX}/echo",
            auth=("a", "b"),
            root_path=f"{API_PREFIX}/echo",
            allowed_paths=["test/test_files/bus.png"],
        )
        # Use context manager to trigger start up events
        with TestClient(app) as client:
            assert client.get(f"{API_PREFIX}/echo/config").status_code == 401
        assert demo.root_path == f"{API_PREFIX}/echo"
        assert demo.allowed_paths == ["test/test_files/bus.png"]
        assert demo.show_error

    def test_mount_gradio_app_with_lifespan(self):
        @asynccontextmanager
        async def empty_lifespan(app: FastAPI):
            yield

        app = FastAPI(lifespan=empty_lifespan)

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

    def test_mount_gradio_app_with_startup(self):
        app = FastAPI()

        @app.on_event("startup")
        async def empty_startup():
            return

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

    def test_gradio_app_with_auth_dependency(self):
        def block_anonymous(request: Request):
            return request.headers.get("user")

        demo = gr.Interface(lambda s: s, "textbox", "textbox")
        app, _, _ = demo.launch(
            auth_dependency=block_anonymous, prevent_thread_lock=True
        )

        with TestClient(app) as client:
            assert not client.get("/", headers={}).is_success
            assert client.get("/", headers={"user": "abubakar"}).is_success

    def test_mount_gradio_app_with_auth_dependency(self):
        app = FastAPI()

        def get_user(request: Request):
            return request.headers.get("user")

        demo = gr.Interface(lambda s: f"Hello from ps, {s}!", "textbox", "textbox")

        app = gr.mount_gradio_app(app, demo, path="/demo", auth_dependency=get_user)

        with TestClient(app) as client:
            assert client.get("/demo", headers={"user": "abubakar"}).is_success
            assert not client.get("/demo").is_success

    def test_static_file_missing(self, test_client):
        response = test_client.get(rf"{API_PREFIX}/static/not-here.js")
        assert response.status_code == 404

    def test_asset_file_missing(self, test_client):
        response = test_client.get(rf"{API_PREFIX}/assets/not-here.js")
        assert response.status_code == 404

    def test_cannot_access_files_in_working_directory(self, test_client):
        response = test_client.get(rf"{API_PREFIX}/file=not-here.js")
        assert response.status_code == 403
        response = test_client.get(rf"{API_PREFIX}/file=subdir/.env")
        assert response.status_code == 403

    def test_cannot_access_directories_in_working_directory(self, test_client):
        response = test_client.get(rf"{API_PREFIX}/file=gradio")
        assert response.status_code == 403

    def test_block_protocols_that_expose_windows_credentials(self, test_client):
        response = test_client.get(rf"{API_PREFIX}/file=//11.0.225.200/share")
        assert response.status_code == 403

    def test_do_not_expose_existence_of_files_outside_working_directory(
        self, test_client
    ):
        response = test_client.get(
            rf"{API_PREFIX}/file=../fake-file-that-does-not-exist.js"
        )
        assert response.status_code == 403  # not a 404

    def test_proxy_route_is_restricted_to_load_urls(self):
        gr.context.Context.hf_token = "abcdef"  # type: ignore
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
        gr.context.Context.hf_token = "abcdef"  # type: ignore
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

    def test_can_get_config_that_includes_non_pickle_able_objects(self):
        my_dict = {"a": 1, "b": 2, "c": 3}
        with Blocks() as demo:
            gr.JSON(my_dict.keys())  # type: ignore

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)
        response = client.get("/")
        assert response.is_success
        response = client.get("/config/")
        assert response.is_success

    def test_default_cors_restrictions(self):
        io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
        app, _, _ = io.launch(prevent_thread_lock=True)
        client = TestClient(app)
        custom_headers = {
            "host": "localhost:7860",
            "origin": "https://example.com",
        }
        file_response = client.get(f"{API_PREFIX}/config", headers=custom_headers)
        assert "access-control-allow-origin" not in file_response.headers

        custom_headers = {
            "host": "localhost:7860",
            "origin": "null",
        }
        file_response = client.get(f"{API_PREFIX}/config", headers=custom_headers)
        assert "access-control-allow-origin" not in file_response.headers

        custom_headers = {
            "host": "localhost:7860",
            "origin": "127.0.0.1",
        }
        file_response = client.get(f"{API_PREFIX}/config", headers=custom_headers)
        assert file_response.headers["access-control-allow-origin"] == "127.0.0.1"

        io.close()

    def test_loose_cors_restrictions(self):
        io = gr.Interface(lambda s: s.name, gr.File(), gr.File())
        app, _, _ = io.launch(prevent_thread_lock=True, strict_cors=False)
        client = TestClient(app)
        custom_headers = {
            "host": "localhost:7860",
            "origin": "https://example.com",
        }
        file_response = client.get(f"{API_PREFIX}/config", headers=custom_headers)
        assert "access-control-allow-origin" not in file_response.headers

        custom_headers = {
            "host": "localhost:7860",
            "origin": "null",
        }
        file_response = client.get(f"{API_PREFIX}/config", headers=custom_headers)
        assert file_response.headers["access-control-allow-origin"] == "null"

        io.close()

    def test_delete_cache(self, connect, gradio_temp_dir, capsys):
        def check_num_files_exist(blocks: Blocks):
            num_files = 0
            for temp_file_set in blocks.temp_file_sets:
                for temp_file in temp_file_set:
                    if os.path.exists(temp_file):
                        num_files += 1
            return num_files

        demo = gr.Interface(lambda s: s, gr.Textbox(), gr.File(), delete_cache=None)
        with connect(demo) as client:
            client.predict("test/test_files/cheetah1.jpg")
        assert check_num_files_exist(demo) == 1

        demo_delete = gr.Interface(
            lambda s: s, gr.Textbox(), gr.File(), delete_cache=(60, 30)
        )
        with connect(demo_delete) as client:
            client.predict("test/test_files/alphabet.txt")
            client.predict("test/test_files/bus.png")
            assert check_num_files_exist(demo_delete) == 2
        assert check_num_files_exist(demo_delete) == 0
        assert check_num_files_exist(demo) == 1

        @asynccontextmanager
        async def mylifespan(app: FastAPI):
            print("IN CUSTOM LIFESPAN")
            yield
            print("AFTER CUSTOM LIFESPAN")

        demo_custom_lifespan = gr.Interface(
            lambda s: s, gr.Textbox(), gr.File(), delete_cache=(5, 1)
        )

        with connect(
            demo_custom_lifespan, app_kwargs={"lifespan": mylifespan}
        ) as client:
            client.predict("test/test_files/alphabet.txt")
        assert check_num_files_exist(demo_custom_lifespan) == 0
        captured = capsys.readouterr()
        assert "IN CUSTOM LIFESPAN" in captured.out
        assert "AFTER CUSTOM LIFESPAN" in captured.out

    def test_monitoring_link(self):
        with Blocks() as demo:
            i = Textbox()
            o = Textbox()
            i.change(lambda x: x, i, o)

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)
        response = client.get("/monitoring")
        assert response.status_code == 200

    def test_monitoring_link_disabled(self):
        with Blocks() as demo:
            i = Textbox()
            o = Textbox()
            i.change(lambda x: x, i, o)

        app, _, _ = demo.launch(prevent_thread_lock=True, enable_monitoring=False)
        client = TestClient(app)
        response = client.get("/monitoring")
        assert response.status_code == 403


def test_api_listener(connect):
    with gr.Blocks() as demo:

        def fn(a: int, b: int, c: str) -> tuple[int, str]:
            return a + b, c[a:b]

        gr.api(fn, api_name="addition")

    with connect(demo) as client:
        assert client.predict(a=1, b=3, c="testing", api_name="/addition") == (4, "es")


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

        client.post(
            "/login",
            data={"username": "test", "password": "correct_password"},
        )
        response = client.post(
            "/login",
            data={"username": " test ", "password": "correct_password"},
        )
        assert response.status_code == 200

    def test_logout(self):
        io = Interface(lambda x: x, "text", "text")
        app, _, _ = io.launch(
            auth=("test", "correct_password"),
            prevent_thread_lock=True,
        )
        client = TestClient(app)

        client.post(
            "/login",
            data={"username": "test", "password": "correct_password"},
        )

        response = client.post(
            f"{API_PREFIX}/run/predict",
            json={"data": ["test"]},
        )
        assert response.status_code == 200

        response = client.get("/logout")

        response = client.post(
            "{API_PREFIX}/run/predict",
            json={"data": ["test"]},
        )
        assert response.status_code == 404

    def test_monitoring_route(self):
        io = Interface(lambda x: x, "text", "text")
        app, _, _ = io.launch(
            auth=("test", "correct_password"),
            prevent_thread_lock=True,
        )
        client = TestClient(app)
        client.post(
            "/login",
            data={"username": "test", "password": "correct_password"},
        )

        response = client.get(
            "/monitoring",
        )
        assert response.status_code == 200

        response = client.get("/logout")

        response = client.get(
            "/monitoring",
        )
        assert response.status_code == 401


class TestQueueRoutes:
    @pytest.mark.asyncio
    async def test_queue_join_routes_sets_app_if_none_set(self):
        io = Interface(lambda x: x, "text", "text").queue()
        io.launch(prevent_thread_lock=True)
        assert io.local_url
        client = grc.Client(io.local_url)
        client.predict("test")

        assert io._queue.server_app == io.server_app


class TestDevMode:
    def test_mount_gradio_app_set_dev_mode_false(self):
        app = FastAPI()

        @app.get(f"{API_PREFIX}/")
        def read_main():
            return {"message": "Hello!"}

        with gr.Blocks() as blocks:
            gr.Textbox("Hello from gradio!")

        app = routes.mount_gradio_app(app, blocks, path=f"{API_PREFIX}/gradio")
        gradio_fast_api = next(
            route for route in app.routes if isinstance(route, starlette.routing.Mount)
        )
        assert not gradio_fast_api.app.blocks.dev_mode  # type: ignore


class TestPassingRequest:
    def test_request_included_with_interface(self):
        def identity(name, request: gr.Request):
            assert isinstance(request.client.host, str)
            return name

        app, _, _ = gr.Interface(identity, "textbox", "textbox").launch(
            prevent_thread_lock=True,
        )
        client = TestClient(app)

        response = client.post(f"{API_PREFIX}/api/predict/", json={"data": ["test"]})
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

        response = client.post(f"{API_PREFIX}/api/chat/", json={"data": ["test", None]})
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

        response = client.post(f"{API_PREFIX}/api/chat/", json={"data": ["test", None]})
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

        response = client.post(f"{API_PREFIX}/api/predict/", json={"data": ["test"]})
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

        response = client.post(f"{API_PREFIX}/api/predict/", json={"data": ["test"]})
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
        response = client.post(f"{API_PREFIX}/api/predict/", json={"data": ["test"]})
        assert response.status_code == 200
        output = dict(response.json())
        assert output["data"] == ["test"]

    def test_request_is_pickleable(self):
        """
        For ZeroGPU, we need to ensure that the gr.Request object is pickle-able.
        """

        def identity(name, request: gr.Request):
            pickled = pickle.dumps(request)
            unpickled = pickle.loads(pickled)
            assert request.client.host == unpickled.client.host
            assert request.client.port == unpickled.client.port
            assert dict(request.query_params) == dict(unpickled.query_params)
            assert request.query_params["a"] == unpickled.query_params["a"]
            assert dict(request.headers) == dict(unpickled.headers)
            assert request.username == unpickled.username
            return name

        app, _, _ = gr.Interface(identity, "textbox", "textbox").launch(
            prevent_thread_lock=True,
        )
        client = TestClient(app)

        response = client.post(f"{API_PREFIX}/api/predict?a=b", json={"data": ["test"]})
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
        f"{API_PREFIX}/api/predict",
        json={"fn_index": 0, "data": [5], "session_hash": "foo"},
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

    result = client.post(
        f"{API_PREFIX}/api/blocked", json={"data": [], "session_hash": "foo"}
    )
    assert result.status_code == 404
    result = client.post(
        f"{API_PREFIX}/api/not_blocked",
        json={"data": ["freddy"], "session_hash": "foo"},
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
        f"{API_PREFIX}/api/not_blocked",
        json={"data": ["freddy"], "session_hash": "foo"},
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
            f"{API_PREFIX}/api/greet", json={"data": ["freddy"], "session_hash": "foo"}
        ).json()["data"] == ["Hello freddy"]
        assert client.post(
            f"{API_PREFIX}/api/goodbye",
            json={"data": ["freddy"], "session_hash": "foo"},
        ).json()["data"] == ["Goodbye freddy"]
        assert client.post(
            f"{API_PREFIX}/api/greet_me",
            json={"data": ["freddy"], "session_hash": "foo"},
        ).json()["data"] == ["Hello"]
        assert client.post(
            f"{API_PREFIX}/api/Say__goodbye",
            json={"data": ["freddy"], "session_hash": "foo"},
        ).json()["data"] == ["Goodbye"]
        assert client.post(
            f"{API_PREFIX}/api/lambda", json={"data": ["freddy"], "session_hash": "foo"}
        ).json()["data"] == ["freddy"]
        assert client.post(
            f"{API_PREFIX}/api/foo-2", json={"data": ["freddy"], "session_hash": "foo"}
        ).json()["data"] == ["freddy foo"]
        assert client.post(
            f"{API_PREFIX}/api/Callable",
            json={"data": ["freddy"], "session_hash": "foo"},
        ).json()["data"] == ["From __call__"]
        assert client.post(
            f"{API_PREFIX}/api/partial",
            json={"data": ["freddy"], "session_hash": "foo"},
        ).json()["data"] == ["From partial: freddy"]
        with pytest.raises(FnIndexInferError):
            client.post(
                f"{API_PREFIX}/api/Say_goodbye",
                json={"data": ["freddy"], "session_hash": "foo"},
            )

    with connect(demo) as client:
        assert client.predict("freddy", api_name="/greet") == "Hello freddy"
        assert client.predict("freddy", api_name="/goodbye") == "Goodbye freddy"
        assert client.predict("freddy", api_name="/greet_me") == "Hello"
        assert client.predict("freddy", api_name="/Say__goodbye") == "Goodbye"


class TestShowAPI:
    @patch.object(wasm_utils, "IS_WASM", True)
    def test_show_api_false_when_is_wasm_true(self):
        interface = Interface(lambda x: x, "text", "text", examples=[["hannah"]])
        assert interface.show_api is False, (
            "show_api should be False when IS_WASM is True"
        )

    @patch.object(wasm_utils, "IS_WASM", False)
    def test_show_api_true_when_is_wasm_false(self):
        interface = Interface(lambda x: x, "text", "text", examples=[["hannah"]])
        assert interface.show_api is True, (
            "show_api should be True when IS_WASM is False"
        )


def test_component_server_endpoints(connect):
    here = os.path.dirname(os.path.abspath(__file__))
    with gr.Blocks() as demo:
        file_explorer = gr.FileExplorer(root_dir=here)

    with closing(demo) as io:
        app, _, _ = io.launch(prevent_thread_lock=True)
        client = TestClient(app)
        success_req = client.post(
            f"{API_PREFIX}/component_server/",
            json={
                "session_hash": "123",
                "component_id": file_explorer._id,
                "fn_name": "ls",
                "data": None,
            },
        )
        assert success_req.status_code == 200
        assert len(success_req.json()) > 0
        fail_req = client.post(
            f"{API_PREFIX}/component_server/",
            json={
                "session_hash": "123",
                "component_id": file_explorer._id,
                "fn_name": "preprocess",
                "data": None,
            },
        )
        assert fail_req.status_code == 404


@pytest.mark.parametrize(
    "request_url, route_path, root_path, expected_root_url",
    [
        (
            f"http://localhost:7860/{API_PREFIX}",
            f"{API_PREFIX}/",
            None,
            "http://localhost:7860",
        ),
        (
            f"http://localhost:7860/{API_PREFIX}/demo/test",
            f"{API_PREFIX}/demo/test",
            None,
            "http://localhost:7860",
        ),
        (
            f"http://localhost:7860/{API_PREFIX}/demo/test?query=1",
            f"{API_PREFIX}/demo/test",
            None,
            "http://localhost:7860",
        ),
        (
            f"http://localhost:7860/{API_PREFIX}/demo/test?query=1",
            f"{API_PREFIX}/demo/test/",
            "/gradio",
            "http://localhost:7860/gradio",
        ),
        (
            "http://localhost:7860/demo/test?query=1",
            "/demo/test",
            "/gradio/",
            "http://localhost:7860/gradio",
        ),
        (
            "https://localhost:7860/demo/test?query=1",
            "/demo/test",
            "/gradio/",
            "https://localhost:7860/gradio",
        ),
        (
            "https://www.gradio.app/playground/",
            f"{API_PREFIX}/",
            "/playground",
            "https://www.gradio.app/playground",
        ),
        (
            "https://www.gradio.app/playground/",
            f"{API_PREFIX}/",
            "http://www.gradio.app/",
            "http://www.gradio.app",
        ),
    ],
)
def test_get_root_url(
    request_url: str, route_path: str, root_path: str, expected_root_url: str
):
    scope = {
        "type": "http",
        "headers": [],
        "path": request_url,
    }
    request = Request(scope)
    assert get_root_url(request, route_path, root_path) == expected_root_url


@pytest.mark.parametrize(
    "headers, root_path, route_path, expected_root_url",
    [
        ({}, "/gradio/", "/", "http://gradio.app/gradio"),
        (
            {"x-forwarded-proto": "http"},
            "/gradio/",
            "/",
            "http://gradio.app/gradio",
        ),
        (
            {"x-forwarded-proto": "https"},
            "/gradio/",
            "/",
            "https://gradio.app/gradio",
        ),
        (
            {"x-forwarded-host": "gradio.dev"},
            "/gradio/",
            "/",
            "http://gradio.dev/gradio",
        ),
        (
            {"x-forwarded-host": "gradio.dev"},
            "/gradio/",
            "/config",
            "http://gradio.dev/gradio",
        ),
        (
            {"x-forwarded-host": "gradio.dev", "x-forwarded-proto": "https"},
            "/",
            "/",
            "https://gradio.dev",
        ),
        (
            {
                "x-forwarded-host": "gradio.dev,internal.gradio.dev",
                "x-forwarded-proto": "https,http",
            },
            "/",
            "/",
            "https://gradio.dev",
        ),
        (
            {"x-forwarded-host": "gradio.dev", "x-forwarded-proto": "https"},
            "http://google.com",
            "/",
            "http://google.com",
        ),
    ],
)
def test_get_root_url_headers(
    headers: dict[str, str], root_path: str, route_path: str, expected_root_url: str
):
    scope = {
        "type": "http",
        "headers": [(k.encode(), v.encode()) for k, v in headers.items()],
        "path": "http://gradio.app",
    }
    request = Request(scope)
    assert get_root_url(request, route_path, root_path) == expected_root_url


class TestSimpleAPIRoutes:
    def get_demo(self):
        with Blocks() as demo:
            input = Textbox()
            output = Textbox()
            output2 = Textbox()

            def fn_1(x):
                return f"Hello, {x}!"

            def fn_2(x):
                for i in range(len(x)):
                    time.sleep(0.5)
                    yield f"Hello, {x[: i + 1]}!"
                if len(x) < 3:
                    raise ValueError("Small input")

            def fn_3():
                return "a", "b"

            btn1, btn2, btn3 = Button(), Button(), Button()
            btn1.click(fn_1, input, output, api_name="fn1")
            btn2.click(fn_2, input, output2, api_name="fn2")
            btn3.click(fn_3, None, [output, output2], api_name="fn3")
        return demo

    def test_successful_simple_route(self):
        demo = self.get_demo()
        demo.launch(prevent_thread_lock=True)

        response = requests.post(
            f"{demo.local_api_url}call/fn1", json={"data": ["world"]}
        )

        assert response.status_code == 200, "Failed to call fn1"
        response = response.json()
        event_id = response["event_id"]

        output = []
        response = requests.get(f"{demo.local_api_url}call/fn1/{event_id}", stream=True)

        for line in response.iter_lines():
            if line:
                output.append(line.decode("utf-8"))

        assert output == ["event: complete", 'data: ["Hello, world!"]']

        response = requests.post(f"{demo.local_api_url}call/fn3", json={"data": []})

        assert response.status_code == 200, "Failed to call fn3"
        response = response.json()
        event_id = response["event_id"]

        output = []
        response = requests.get(f"{demo.local_api_url}call/fn3/{event_id}", stream=True)

        for line in response.iter_lines():
            if line:
                output.append(line.decode("utf-8"))

        assert output == ["event: complete", 'data: ["a", "b"]']

    def test_generative_simple_route(self):
        demo = self.get_demo()
        demo.launch(prevent_thread_lock=True)

        response = requests.post(
            f"{demo.local_api_url}call/fn2", json={"data": ["world"]}
        )

        assert response.status_code == 200, "Failed to call fn2"
        response = response.json()
        event_id = response["event_id"]

        output = []
        response = requests.get(f"{demo.local_api_url}call/fn2/{event_id}", stream=True)

        for line in response.iter_lines():
            if line:
                output.append(line.decode("utf-8"))

        assert output == [
            "event: generating",
            'data: ["Hello, w!"]',
            "event: generating",
            'data: ["Hello, wo!"]',
            "event: generating",
            'data: ["Hello, wor!"]',
            "event: generating",
            'data: ["Hello, worl!"]',
            "event: generating",
            'data: ["Hello, world!"]',
            "event: complete",
            'data: ["Hello, world!"]',
        ]

        response = requests.post(f"{demo.local_api_url}call/fn2", json={"data": ["w"]})

        assert response.status_code == 200, "Failed to call fn2"
        response = response.json()
        event_id = response["event_id"]

        output = []
        response = requests.get(f"{demo.local_api_url}call/fn2/{event_id}", stream=True)

        for line in response.iter_lines():
            if line:
                output.append(line.decode("utf-8"))

        assert output == [
            "event: generating",
            'data: ["Hello, w!"]',
            "event: error",
            "data: null",
        ]


def test_compare_passwords_securely():
    password1 = "password"
    password2 = "pässword"
    assert compare_passwords_securely(password1, password1)
    assert not compare_passwords_securely(password1, password2)
    assert compare_passwords_securely(password2, password2)


@pytest.mark.parametrize(
    "string, expected",
    [
        ("http://localhost:7860/", True),
        ("https://localhost:7860/", True),
        ("ftp://localhost:7860/", True),
        ("smb://example.com", True),
        ("ipfs://QmTzQ1Nj5R9BzF1djVQv8gvzZxVkJb1vhrLcXL1QyJzZE", True),
        ("usr/local/bin", False),
        ("localhost:7860", False),
        ("localhost", False),
        ("C:/Users/username", False),
        ("//path", True),
        ("\\\\path", True),
        ("/usr/bin//test", False),
        ("/\\10.0.225.200/share", True),
        ("\\/10.0.225.200/share", True),
        ("/home//user", False),
        ("C:\\folder\\file", False),
    ],
)
def test_starts_with_protocol(string, expected):
    assert starts_with_protocol(string) == expected


def test_max_file_size_used_in_upload_route(connect):
    with gr.Blocks() as demo:
        gr.Markdown("Max file size demo")

    app, _, _ = demo.launch(prevent_thread_lock=True, max_file_size="1kb")
    test_client = TestClient(app)
    with open("test/test_files/cheetah1.jpg", "rb") as f:
        r = test_client.post(f"{API_PREFIX}/upload", files={"files": f})
        assert r.status_code == 413
    with open("test/test_files/alphabet.txt", "rb") as f:
        r = test_client.post(f"{API_PREFIX}/upload", files={"files": f})
        assert r.status_code == 200


def test_docs_url():
    with gr.Blocks() as demo:
        num = gr.Number(value=0)
        button = gr.Button()
        button.click(lambda n: n + 1, [num], [num])

    app, _, _ = demo.launch(
        app_kwargs={"docs_url": f"{API_PREFIX}/docs"}, prevent_thread_lock=True
    )
    try:
        test_client = TestClient(app)
        with test_client:
            r = test_client.get(f"{API_PREFIX}/docs")
            assert r.status_code == 200
    finally:
        demo.close()


def test_file_access():
    with gr.Blocks() as demo:
        gr.Markdown("Test")

    allowed_dir = (Path(tempfile.gettempdir()) / "test_file_access_dir").resolve()
    allowed_dir.mkdir(parents=True, exist_ok=True)
    allowed_file = Path(allowed_dir / "allowed.txt")
    allowed_file.touch()

    not_allowed_file = Path(tempfile.gettempdir()) / "not_allowed.txt"
    not_allowed_file.touch()

    app, _, _ = demo.launch(
        prevent_thread_lock=True,
        blocked_paths=["test/test_files"],
        allowed_paths=[str(allowed_dir)],
    )
    test_client = TestClient(app)
    try:
        with test_client:
            r = test_client.get(f"{API_PREFIX}/file={allowed_dir}/allowed.txt")
            assert r.status_code == 200
            r = test_client.get(f"{API_PREFIX}/file={allowed_dir}/../not_allowed.txt")
            assert r.status_code in [403, 404]  # 403 in Linux, 404 in Windows
            r = test_client.get(f"{API_PREFIX}/file=//test/test_files/cheetah1.jpg")
            assert r.status_code == 403
            r = test_client.get(f"{API_PREFIX}/file=test/test_files/cheetah1.jpg")
            assert r.status_code == 403
            r = test_client.get(f"{API_PREFIX}/file=//test/test_files/cheetah1.jpg")
            assert r.status_code == 403
            tmp = Path(tempfile.gettempdir()) / "upload_test.txt"
            tmp.write_text("Hello")
            with open(str(tmp), "rb") as f:
                files = {"files": ("..", f)}
                response = test_client.post(f"{API_PREFIX}/upload", files=files)
                assert response.status_code == 400
    finally:
        demo.close()
        not_allowed_file.unlink()
        allowed_file.unlink()


def test_bash_api_serialization():
    demo = gr.Interface(lambda x: x, "json", "json")

    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)

    with test_client:
        submit = test_client.post(
            f"{API_PREFIX}/call/predict", json={"data": [{"a": 1}]}
        )
        event_id = submit.json()["event_id"]
        response = test_client.get(f"{API_PREFIX}/call/predict/{event_id}")
        assert response.status_code == 200
        assert "event: complete\ndata:" in response.text
        assert json.dumps({"a": 1}) in response.text


def test_bash_api_multiple_inputs_outputs():
    demo = gr.Interface(
        lambda x, y: (y, x), ["textbox", "number"], ["number", "textbox"]
    )

    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)

    with test_client:
        submit = test_client.post(
            f"{API_PREFIX}/call/predict", json={"data": ["abc", 123]}
        )
        event_id = submit.json()["event_id"]
        response = test_client.get(f"{API_PREFIX}/call/predict/{event_id}")
        assert response.status_code == 200
        assert "event: complete\ndata:" in response.text
        assert json.dumps([123, "abc"]) in response.text


def test_attacker_cannot_change_root_in_config(
    attacker_threads=1, victim_threads=10, max_attempts=30
):
    def attacker(url):
        """Simulates the attacker sending a request with a malicious header."""
        for _ in range(max_attempts):
            httpx.get(url + "config", headers={"X-Forwarded-Host": "evil"})

    def victim(url, results):
        """Simulates the victim making a normal request and checking the response."""
        for _ in range(max_attempts):
            res = httpx.get(url)
            config = json.loads(
                res.text.split("window.gradio_config =", 1)[1].split(";</script>", 1)[0]
            )
            if "evil" in config["root"]:
                results.append(True)
                return

        results.append(False)

    with gr.Blocks() as demo:
        i1 = gr.Image("test/test_files/cheetah1.jpg")
        t = gr.Textbox()
        i2 = gr.Image()
        t.change(lambda x: x, i1, i2)

    _, url, _ = demo.launch(prevent_thread_lock=True)

    threads = []
    results = []

    for _ in range(attacker_threads):
        t_attacker = Thread(target=attacker, args=(url,))
        threads.append(t_attacker)

    for _ in range(victim_threads):
        t_victim = Thread(
            target=victim,
            args=(
                url,
                results,
            ),
        )
        threads.append(t_victim)

    for t in threads:
        t.start()

    for t in threads:
        t.join()

    assert not any(results), "attacker was able to modify a victim's config root url"


def test_file_without_meta_key_not_moved():
    demo = gr.Interface(
        fn=lambda s: str(s), inputs=gr.File(type="binary"), outputs="textbox"
    )

    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)
    try:
        with test_client:
            req = test_client.post(
                "gradio_api/run/predict",
                json={
                    "data": [
                        {
                            "path": "test/test_files/alphabet.txt",
                            "orig_name": "test.txt",
                            "size": 4,
                            "mime_type": "text/plain",
                        }
                    ]
                },
            )
            assert req.status_code == 500
    finally:
        demo.close()


def test_mount_gradio_app_args_match_launch_args():
    """Test that all arguments in Blocks.launch() are also valid in mount_gradio_app()."""
    # Get the parameters from both functions
    launch_params = inspect.signature(gr.Blocks.launch).parameters
    mount_params = inspect.signature(routes.mount_gradio_app).parameters

    # Parameters that are intentionally not included in mount_gradio_app
    exception_list = {
        "inline",
        "inbrowser",
        "prevent_thread_lock",
        "debug",
        "quiet",
        "height",
        "width",
        "ssl_keyfile",
        "ssl_certfile",
        "ssl_keyfile_password",
        "ssl_verify",
        "share",
        "share_server_address",
        "share_server_protocol",
        "share_server_tls_certificate",
        "state_session_capacity",
        "_frontend",
        "self",
        "strict_cors",
        "max_threads",
        "i18n",
    }

    missing_params = []
    for param_name in launch_params:
        if param_name not in exception_list and param_name not in mount_params:
            missing_params.append(param_name)

    assert not missing_params, (
        f"Parameters in launch() but missing in mount_gradio_app(): {missing_params}"
    )


@pytest.mark.parametrize(
    "server, path",
    [
        # ASGI HTTP Connection Scope. Ref: https://asgi.readthedocs.io/en/latest/specs/www.html#http-connection-scopeg
        (
            None,  # 'server' is optional. Requests from Gradio-Lite will be this case.
            f"{API_PREFIX}/queue/join",
        ),
        (("localhost", 7860), f"{API_PREFIX}/queue/join"),
        (
            ("localhost", 7860),
            f"{API_PREFIX}/queue/join?__theme=dark",  # With query params.
        ),
        (
            ("localhost", 7860),
            f"{API_PREFIX}/queue/join?foo=bar&__theme=dark",  # With multiple query params.
        ),
        (
            None,
            f"http://localhost:7860{API_PREFIX}/queue/join?__theme=dark",  # Putting the server in the path may be invalid but we test it anyway.
        ),
    ],
)
def test_get_api_call_path_queue_join(server, path):
    scope = {"type": "http", "headers": [], "server": server, "path": path}
    request = Request(scope)

    path = get_api_call_path(request)
    assert path == f"{API_PREFIX}/queue/join"


@pytest.mark.parametrize(
    "server, path, expected",
    [
        (
            ("localhost", 7860),
            f"{API_PREFIX}/call/predict",
            f"{API_PREFIX}/call/predict",
        ),
        (
            None,
            f"http://localhost:7860{API_PREFIX}/call/predict",
            f"{API_PREFIX}/call/predict",
        ),
        (
            ("localhost", 7860),
            f"{API_PREFIX}/call/custom_function/with/extra/parts",
            f"{API_PREFIX}/call/custom_function/with/extra/parts",
        ),
        (
            None,
            f"http://localhost:7860{API_PREFIX}/call/custom_function/with/extra/parts",
            f"{API_PREFIX}/call/custom_function/with/extra/parts",
        ),
        (  # Query params are ignored.
            ("localhost", 7860),
            f"{API_PREFIX}/call/custom_function/with/extra/parts?__theme=light",
            f"{API_PREFIX}/call/custom_function/with/extra/parts",
        ),
        (  # Query params are ignored.
            None,
            f"http://localhost:7860{API_PREFIX}/call/custom_function/with/extra/parts?__theme=light",
            f"{API_PREFIX}/call/custom_function/with/extra/parts",
        ),
    ],
)
def test_get_api_call_path_generic_call(server, path, expected):
    scope = {"type": "http", "headers": [], "server": server, "path": path}
    request = Request(scope)
    path = get_api_call_path(request)
    assert path == expected


@pytest.mark.parametrize(
    "headers, server, route_path, expected_origin",
    [
        (
            {},
            ("localhost", 7860),
            "/gradio_api/predict",
            httpx.URL("http://localhost:7860"),
        ),
        (
            {"x-forwarded-host": "example.com"},
            ("localhost", 7860),
            "/gradio_api/predict",
            httpx.URL("http://example.com"),
        ),
        (
            {"x-forwarded-host": "example.com", "x-forwarded-proto": "https"},
            ("localhost", 7860),
            "/gradio_api/predict",
            httpx.URL("https://example.com"),
        ),
        (
            {
                "x-forwarded-host": "example.com,internal.example.com",
                "x-forwarded-proto": "https,http",
            },
            ("localhost", 7860),
            "/gradio_api/predict",
            httpx.URL("https://example.com"),
        ),
    ],
)
def test_get_request_origin_with_headers(headers, server, route_path, expected_origin):
    scope = {
        "type": "http",
        "headers": [(k.encode(), v.encode()) for k, v in headers.items()],
        "server": server,
        "path": route_path,
    }
    request = Request(scope)
    origin = get_request_origin(request, route_path)
    assert origin == expected_origin


def test_deep_link_unique_per_session():
    import requests
    from gradio_client import Client

    with gr.Blocks() as demo:
        text = gr.Textbox()
        out = gr.Textbox(label="output")
        gr.DeepLinkButton()
        text.submit(fn=lambda x: gr.Textbox(x, lines=int(x)), inputs=text, outputs=out)

    _, url, _ = demo.launch(prevent_thread_lock=True)
    client_1 = Client(url)
    client_2 = Client(url)
    _ = client_1.predict(x="9", api_name="/lambda_1")
    _ = client_2.predict(x="6", api_name="/lambda_1")

    link_1 = requests.get(
        f"{url}/gradio_api/deep_link?session_hash={client_1.session_hash}"
    ).text
    link_2 = requests.get(
        f"{url}/gradio_api/deep_link?session_hash={client_2.session_hash}"
    ).text

    config_1 = requests.get(f"{url}/config?deep_link={link_1[1:-1]}").json()
    config_2 = requests.get(f"{url}/config?deep_link={link_2[1:-1]}").json()
    verified_configs = [False, False]
    for i, config in enumerate([config_1, config_2]):
        for component in config["components"]:
            if component["props"].get("label", "") == "output":
                number = 9
                if i == 1:
                    number = 6
                verified_configs[i] = component["props"][
                    "lines"
                ] == number and component["props"]["value"][0] == str(number)

    assert all(verified_configs)
