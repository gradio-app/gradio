import inspect
import time
from collections.abc import Iterator
from contextlib import asynccontextmanager

import pytest
from fastapi import Request
from fastapi.responses import PlainTextResponse
from fastapi.testclient import TestClient
from gradio_client import Client

import gradio as gr
from gradio.route_utils import API_PREFIX


class TestServer:
    def test_server_launch_merges_lifespan_into_request_state(self):
        @asynccontextmanager
        async def lifespan(_):
            yield {"hello": "world"}

        server = gr.Server()

        @server.get("/state-check")
        def state_check(request: Request):
            return PlainTextResponse(request.state.hello)

        @server.api(name="echo")
        def echo(x: str) -> str:
            return x

        app, _, _ = server.launch(
            app_kwargs={"lifespan": lifespan}, prevent_thread_lock=True
        )
        try:
            with TestClient(app) as client:
                assert client.get("/state-check").text.strip() == "world"
        finally:
            gr.close_all()

    def test_server_launch_queue_and_api_predict(self):
        server = gr.Server()

        @server.api(name="echo")
        def echo(x: str) -> str:
            return x

        app, local_url, _ = server.launch(prevent_thread_lock=True)
        try:
            with TestClient(app) as client:
                status = client.get(f"{API_PREFIX}/queue/status")
                assert status.status_code == 200
                assert "queue_size" in status.json()

            client_g = Client(local_url)
            try:
                assert client_g.predict("hi", api_name="/echo") == "hi"
            finally:
                client_g.close()
        finally:
            gr.close_all()

    def test_server_stream_can_resume_with_python_client(self):
        server = gr.Server()

        @server.api(name="count")
        def count(limit: int) -> Iterator[str]:
            for value in range(limit):
                time.sleep(0.02)
                yield str(value)

        app, local_url, _ = server.launch(prevent_thread_lock=True)
        session_hash = "server-resume-session"
        try:
            with TestClient(app) as test_client:
                response = test_client.post(
                    f"{API_PREFIX}/queue/join",
                    json={
                        "data": [3],
                        "fn_index": 0,
                        "event_data": None,
                        "session_hash": session_hash,
                        "trigger_id": None,
                    },
                )
                event_id = response.json()["event_id"]

            client = Client(local_url)
            try:
                job = client.resume_jobs(
                    [{"event_id": event_id, "fn_index": 0}],
                    session_hash=session_hash,
                )[0]
                deadline = time.monotonic() + 5
                while not job.done() and time.monotonic() < deadline:
                    time.sleep(0.01)
                assert job.done()
                assert job.outputs() == ["0", "1", "2"]
            finally:
                client.close()
        finally:
            gr.close_all()

    def test_server_api_generator_can_skip_an_output(self):
        server = gr.Server()

        @server.api(name="count")
        def count(limit: int) -> Iterator[str]:
            yield "0"
            yield gr.skip()
            yield "1"

        _, local_url, _ = server.launch(prevent_thread_lock=True)
        try:
            client = Client(local_url)
            try:
                assert client.predict(2, api_name="/count") == "1"
            finally:
                client.close()
        finally:
            gr.close_all()

    def test_server_api_taking_an_oauth_token_gets_the_callers_token_without_login(
        self, monkeypatch
    ):
        # An API caller passes its token with Client(oauth_token=...), so the
        # app needs no sign-in: it must start without gradio[oauth], an HF
        # login on the machine, or `hf_oauth: true` on a Space
        from gradio import oauth

        def no_login():
            raise ValueError("Your machine must be logged in to HF")

        monkeypatch.setattr(oauth, "_get_mocked_oauth_info", no_login)
        server = gr.Server()

        @server.api(name="report")
        def report(token: gr.OAuthToken | None) -> str:
            return token.token if token else "none"

        app, local_url, _ = server.launch(prevent_thread_lock=True, executor="thread")
        try:
            with TestClient(app) as client:
                login = client.get("/login/huggingface", follow_redirects=False)
            assert login.status_code == 404
            client = Client(local_url, oauth_token="caller-token")
            try:
                assert client.predict(api_name="/report") == "caller-token"
            finally:
                client.close()
        finally:
            gr.close_all()

    def test_server_launch_enables_mcp(self):
        server = gr.Server()

        @server.api(name="double")
        def double(word: str) -> str:
            """
            Doubles the input word.

            Parameters:
                word: The word to double
            Returns:
                The doubled word
            """
            return word * 2

        app, _, _ = server.launch(prevent_thread_lock=True, mcp_server=True)
        try:
            blocks = app.get_blocks()
            if mcp_error := getattr(blocks, "mcp_error", None):
                pytest.skip(mcp_error)
            assert blocks.mcp_server is True
            assert blocks.mcp_server_obj is not None
        finally:
            gr.close_all()

    def test_server_api_appears_in_gradio_api_info(self):
        server = gr.Server()

        @server.api(name="named_echo")
        def named_echo(msg: str) -> str:
            return msg

        app, _, _ = server.launch(prevent_thread_lock=True)
        try:
            with TestClient(app) as client:
                info = client.get(f"{API_PREFIX}/info").json()
            assert "/named_echo" in info.get("named_endpoints", {})
        finally:
            gr.close_all()


def test_server_launch_args_match_blocks_launch():
    launch_params = inspect.signature(gr.Blocks.launch).parameters
    server_params = inspect.signature(gr.Server.launch).parameters

    exception_list = {"self", "_app"}
    missing_params = []
    for param_name in launch_params:
        if param_name not in exception_list and param_name not in server_params:
            missing_params.append(param_name)

    assert not missing_params, (
        f"Parameters in Blocks.launch() but missing in Server.launch(): {missing_params}"
    )

    extra_params = []
    for param_name in server_params:
        if param_name not in launch_params and param_name != "self":
            extra_params.append(param_name)

    assert not extra_params, (
        f"Parameters in Server.launch() but not in Blocks.launch(): {extra_params}"
    )
