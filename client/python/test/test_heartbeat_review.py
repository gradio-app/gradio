"""Exercise heartbeat lifecycle behavior using real local HTTP connections."""

import gc
import threading
import time
import weakref
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import gradio as gr
import pytest

from gradio_client import Client


def wait_for(predicate, timeout=5):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate():
            return
        time.sleep(0.01)
    assert predicate()


@contextmanager
def heartbeat_server(respond):
    attempts = []
    stop = threading.Event()

    class Handler(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, *args):
            pass

        def do_GET(self):
            attempts.append((time.monotonic(), self.path))
            status, content_type, body = respond(len(attempts))
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            if body is not None and not isinstance(body, float):
                self.send_header("Content-Length", str(len(body)))
            else:
                self.send_header("Connection", "close")
            self.end_headers()
            try:
                if body is None or isinstance(body, float):
                    deadline = (
                        time.monotonic() + body
                        if isinstance(body, float)
                        else float("inf")
                    )
                    while not stop.is_set():
                        if time.monotonic() >= deadline:
                            break
                        self.wfile.write(b"data: ALIVE\n\n")
                        self.wfile.flush()
                        stop.wait(0.02)
                else:
                    self.wfile.write(body)
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    server.daemon_threads = True
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}", attempts
    finally:
        stop.set()
        server.shutdown()
        server.server_close()
        thread.join(2)


@contextmanager
def heartbeat_client(url):
    # Use the real Client lifecycle and stream implementation without needing
    # unrelated /config and /info endpoints on the fault-injection server.
    client = Client.__new__(Client)
    client.heartbeat_url = url + "/heartbeat/{session_hash}"
    client.session_hash = "initial"
    client.httpx_kwargs = {"trust_env": False}
    client.headers = {}
    client.cookies = {}
    client.ssl_verify = True
    client._refresh_heartbeat = threading.Event()
    client._kill_heartbeat = threading.Event()
    client.heartbeat = threading.Thread(
        target=Client._stream_heartbeat,
        args=(weakref.ref(client), client._refresh_heartbeat, client._kill_heartbeat),
        daemon=True,
    )
    client.heartbeat.start()
    try:
        yield client
    finally:
        client.close()
        client.heartbeat.join(2)
        assert not client.heartbeat.is_alive()


@pytest.fixture
def short_backoff(monkeypatch):
    monkeypatch.setattr("gradio_client.client.HEARTBEAT_RETRY_DELAY_MIN", 0.1)
    monkeypatch.setattr("gradio_client.client.HEARTBEAT_RETRY_DELAY_MAX", 0.4)


@pytest.mark.parametrize("status", [301, 307, 400, 401, 403, 404, 410])
def test_terminal_responses_stop(status):
    with heartbeat_server(lambda _: (status, "text/plain", b"")) as (url, attempts):
        with heartbeat_client(url) as client:
            client.heartbeat.join(2)
            assert not client.heartbeat.is_alive()
            assert len(attempts) == 1


@pytest.mark.parametrize(
    "response",
    [
        (429, "text/plain", b""),
        (500, "text/plain", b""),
        (502, "text/plain", b""),
        (503, "text/plain", b""),
        (200, "text/html", b"<html>sleeping</html>"),
        (200, "text/event-stream", b""),
        (200, "text/event-stream", b"data: ALIVE\n\n"),
    ],
)
def test_failed_connections_increase_backoff(response, short_backoff):
    with heartbeat_server(lambda _: response) as (url, attempts):
        with heartbeat_client(url):
            wait_for(lambda: len(attempts) >= 4)
            gaps = [b[0] - a[0] for a, b in zip(attempts, attempts[1:])]
            assert gaps[0] >= 0.1
            assert gaps[1] >= 0.2
            assert gaps[2] >= 0.4


def test_recovers_after_retryable_errors(short_backoff):
    def respond(attempt):
        return (
            (502, "text/plain", b"")
            if attempt < 3
            else (200, "text/event-stream", None)
        )

    with heartbeat_server(respond) as (url, attempts):
        with heartbeat_client(url) as client:
            wait_for(lambda: len(attempts) == 3)
            time.sleep(0.2)
            assert len(attempts) == 3
            assert client.heartbeat.is_alive()


def test_healthy_stream_resets_accumulated_backoff(short_backoff, monkeypatch):
    monkeypatch.setattr("gradio_client.client.HEARTBEAT_RETRY_RESET_AFTER", 0.15)

    def respond(attempt):
        if attempt == 3:
            return 200, "text/event-stream", 0.2
        return 502, "text/plain", b""

    with heartbeat_server(respond) as (url, attempts):
        with heartbeat_client(url):
            wait_for(lambda: len(attempts) == 4)
            # After two failures the delay has reached 0.4s. A healthy stream
            # resets it to 0.1s, in addition to its own 0.2s duration.
            assert 0.3 <= attempts[3][0] - attempts[2][0] < 0.5


def test_reset_session_reconnects_to_new_hash():
    with heartbeat_server(lambda _: (200, "text/event-stream", None)) as (
        url,
        attempts,
    ):
        with heartbeat_client(url) as client:
            wait_for(lambda: len(attempts) == 1)
            client.reset_session()
            wait_for(lambda: len(attempts) == 2)
            assert attempts[0][1] == "/heartbeat/initial"
            assert attempts[1][1] == f"/heartbeat/{client.session_hash}"


def test_stops_promptly_during_backoff(monkeypatch):
    monkeypatch.setattr("gradio_client.client.HEARTBEAT_RETRY_DELAY_MIN", 60)
    with heartbeat_server(lambda _: (503, "text/plain", b"")) as (url, attempts):
        with heartbeat_client(url) as client:
            wait_for(lambda: len(attempts) == 1)
            time.sleep(0.05)
            started = time.monotonic()
            client.close()
            assert not client.heartbeat.is_alive()
            assert time.monotonic() - started < 0.5


def test_missing_flag_preserves_heartbeat(increment_demo, monkeypatch):
    get_config = Client._get_config

    def legacy_config(self):
        config = get_config(self)
        config.pop("connect_heartbeat")
        return config

    monkeypatch.setattr(Client, "_get_config", legacy_config)
    _, url, _ = increment_demo.launch(prevent_thread_lock=True)
    client = None
    try:
        client = Client(url)
        assert client.predict(api_name="/increment_without_queue") == 1
        assert client.heartbeat.is_alive()
    finally:
        if client is not None:
            client.close()
        increment_demo.close()


def test_gc_runs_unload_and_closes_session(monkeypatch):
    monkeypatch.setenv("GRADIO_HEARTBEAT_INTERVAL", "0.05")
    unloaded = threading.Event()
    with gr.Blocks() as demo:
        state = gr.State(0)
        output = gr.Number()
        gr.Button().click(
            lambda x: (x + 1, x + 1), state, [state, output], api_name="increment"
        )
        demo.unload(unloaded.set)
    _, url, _ = demo.launch(prevent_thread_lock=True)
    try:
        client = Client(url)
        assert client.predict(api_name="/increment") == 1
        session_hash = client.session_hash
        heartbeat = client.heartbeat
        client_ref = weakref.ref(client)
        del client

        def collected():
            gc.collect()
            return client_ref() is None

        wait_for(collected)
        heartbeat.join(2)
        assert not heartbeat.is_alive()
        assert unloaded.wait(2)
        assert demo.state_holder.session_data[session_hash].is_closed
    finally:
        demo.close()


def test_per_request_clients_release_heartbeats(monkeypatch):
    monkeypatch.setenv("GRADIO_HEARTBEAT_INTERVAL", "0.05")
    unloaded = []
    with gr.Blocks() as demo:
        state = gr.State(0)
        output = gr.Number()
        gr.Button().click(
            lambda x: (x + 1, x + 1), state, [state, output], api_name="increment"
        )
        demo.unload(lambda: unloaded.append(True))
    _, url, _ = demo.launch(prevent_thread_lock=True)
    refs, heartbeats = [], []
    try:
        for _ in range(32):
            client = Client(url, verbose=False)
            assert client.predict(api_name="/increment") == 1
            refs.append(weakref.ref(client))
            heartbeats.append(client.heartbeat)
            del client

        def collected():
            gc.collect()
            return all(ref() is None for ref in refs)

        wait_for(collected)
        for heartbeat in heartbeats:
            heartbeat.join(2)
        assert not any(heartbeat.is_alive() for heartbeat in heartbeats)
        wait_for(lambda: len(unloaded) == 32)
    finally:
        demo.close()


def test_live_job_keeps_its_client_until_released(monkeypatch):
    monkeypatch.setenv("GRADIO_HEARTBEAT_INTERVAL", "0.05")
    running, finish = threading.Event(), threading.Event()

    def increment(value):
        running.set()
        assert finish.wait(5)
        return value + 1, value + 1

    with gr.Blocks() as demo:
        state = gr.State(0)
        output = gr.Number()
        gr.Button().click(increment, state, [state, output], api_name="increment")
    _, url, _ = demo.launch(prevent_thread_lock=True)
    try:
        client = Client(url, verbose=False)
        job = client.submit(api_name="/increment")
        heartbeat = client.heartbeat
        client_ref = weakref.ref(client)
        assert running.wait(2)
        del client
        gc.collect()
        assert client_ref() is not None
        assert heartbeat.is_alive()
        finish.set()
        assert job.result(timeout=5) == 1
        del job

        def collected():
            gc.collect()
            return client_ref() is None

        wait_for(collected)
        heartbeat.join(2)
        assert not heartbeat.is_alive()
    finally:
        finish.set()
        demo.close()
