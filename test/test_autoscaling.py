"""`launch(replicas="auto")`: the gateway adds and retires app processes."""

import json
import os
import socket
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor

import httpx2
import pytest
from gradio_client import Client

APP = """
import os, time
import gradio as gr

MODEL = []

def predict(delay: float) -> str:
    MODEL.append(1)
    time.sleep(delay)
    return f"{os.getpid()} {len(MODEL)}"

demo = gr.Interface(predict, "number", "text", api_name="predict")
demo.launch(server_port=int(os.environ["PORT"]), replicas="auto")
"""

STREAM_APP = """
import os, time
import gradio as gr

def predict(delay: float) -> str:
    time.sleep(delay)
    return str(os.getpid())

def on_chunk(chunk):
    return str(os.getpid())

with gr.Blocks() as demo:
    delay = gr.Number()
    out = gr.Textbox()
    gr.Button().click(predict, delay, out, api_name="predict")
    mic = gr.Audio(sources=["microphone"], streaming=True)
    chunk = gr.Textbox()
    mic.stream(on_chunk, chunk, out, concurrency_limit=1)
demo.launch(server_port=int(os.environ["PORT"]), replicas="auto")
"""


def free_port():
    """A port the OS reports free. It is outside the 7860+ range that other
    tests' `launch()` calls scan, so a parallel test can't take it first."""
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


@pytest.fixture
def launch(tmp_path):
    processes = []

    def start(port, app=APP, **env):
        path = tmp_path / "app.py"
        path.write_text(app)
        process = subprocess.Popen(
            [sys.executable, str(path)],
            env={**os.environ, "PORT": str(port), **env},
            start_new_session=True,
        )
        processes.append(process)
        url = f"http://127.0.0.1:{port}/"
        deadline = time.monotonic() + 120
        while True:
            try:
                Client(url, verbose=False)
                return url
            except Exception:
                if process.poll() is not None or time.monotonic() > deadline:
                    raise
                time.sleep(0.5)

    yield start
    for process in processes:
        os.killpg(process.pid, 15)
        process.wait(timeout=30)


def burst(url, delay, count):
    """`count` calls at once, each from its own session, as from new tabs."""

    def call(_):
        return Client(url, verbose=False).predict(delay, api_name="/predict")

    with ThreadPoolExecutor(count) as pool:
        return {result.split()[0] for result in pool.map(call, range(count))}


def test_auto_adds_a_replica_under_backlog_and_retires_it_when_idle(launch):
    url = launch(
        free_port(),
        GRADIO_AUTOSCALE_BACKLOG_SECONDS="0.1",
        GRADIO_AUTOSCALE_IDLE_SECONDS="2",
        GRADIO_AUTOSCALE_COOLDOWN_SECONDS="1",
    )
    client = Client(url, verbose=False)
    first = [client.predict(0.3, api_name="/predict") for _ in range(4)]
    assert [r.split()[1] for r in first] == ["1", "2", "3", "4"]
    deadline = time.monotonic() + 90
    while len(burst(url, 0.4, 8)) < 2:
        assert time.monotonic() < deadline, "no replica was added"
    deadline = time.monotonic() + 30
    while True:
        status = httpx2.get(f"{url}gradio_api/processes").json()
        if len(status["processes"]) == 1:
            break
        assert time.monotonic() < deadline, "the idle replica was not retired"
        time.sleep(0.5)
    reasons = [event["reason"] for event in status["autoscale"]["events"]]
    assert "Replica ready" in reasons
    assert "Idle replica retired" in reasons
    assert burst(url, 0.1, 2) == {first[0].split()[0]}


def stream(url, session_hash, chunks, outputs):
    """A stream from a new session that sends `chunks` more chunks, one every
    0.3 s as a webcam does, then closes. Records each chunk's output."""
    with httpx2.Client(base_url=url, timeout=30) as client:
        body = {"data": ["0"], "fn_index": 1, "session_hash": session_hash}
        event_id = client.post("gradio_api/queue/join", json=body).json()["event_id"]
        params = {"session_hash": session_hash}
        with client.stream("GET", "gradio_api/queue/data", params=params) as sse:
            for line in sse.iter_lines():
                if not line.startswith("data:"):
                    continue
                message = json.loads(line[5:])
                if message["msg"] == "process_completed":
                    return
                if message["msg"] != "process_streaming":
                    continue
                outputs.append(message["output"]["data"][0])
                time.sleep(0.3)
                if len(outputs) <= chunks:
                    body["data"] = [str(len(outputs))]
                    client.post(f"gradio_api/stream/{event_id}", json=body)
                else:
                    client.post(f"gradio_api/stream/{event_id}/close")


def test_auto_keeps_a_replica_that_is_running_a_stream(launch):
    url = launch(
        free_port(),
        app=STREAM_APP,
        GRADIO_AUTOSCALE_BACKLOG_SECONDS="0.1",
        GRADIO_AUTOSCALE_IDLE_SECONDS="1",
        GRADIO_AUTOSCALE_COOLDOWN_SECONDS="1",
    )
    client = Client(url, verbose=False)
    for _ in range(4):
        client.predict(0.3, api_name="/predict")
    deadline = time.monotonic() + 90
    while len(burst(url, 0.4, 8)) < 2:
        assert time.monotonic() < deadline, "no replica was added"
    outputs = {"a": [], "b": []}
    streams = [
        threading.Thread(target=stream, args=(url, key, 15, outputs[key]), daemon=True)
        for key in outputs
    ]
    for thread in streams:
        thread.start()
    # Each stream holds its process's slot between chunks, so neither process
    # is idle, though no event finishes for longer than IDLE_SECONDS
    while any(thread.is_alive() for thread in streams):
        status = httpx2.get(f"{url}gradio_api/processes").json()
        assert len(status["processes"]) == 2, "a replica was retired mid-stream"
        time.sleep(0.25)
    assert outputs["a"][0] != outputs["b"][0]
    assert len(outputs["a"]) == len(outputs["b"]) == 16
    deadline = time.monotonic() + 30
    while len(httpx2.get(f"{url}gradio_api/processes").json()["processes"]) > 1:
        assert time.monotonic() < deadline, "the idle replica was not retired"
        time.sleep(0.5)
