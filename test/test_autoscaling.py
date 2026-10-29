"""`launch(replicas="auto")`: the gateway adds and retires app processes."""

import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor

import httpx2
import pytest
from gradio_client import Client

from gradio.processing.memory import admission

APP = """
import os, time
import gradio as gr

MODEL = []  # loaded once per process, at import

def predict(delay: float) -> str:
    MODEL.append(1)
    time.sleep(delay)
    return f"{os.getpid()} {len(MODEL)}"

demo = gr.Interface(predict, "number", "text", api_name="predict")
demo.launch(server_port=int(os.environ["PORT"]), replicas="auto")
"""


@pytest.fixture
def launch(tmp_path):
    processes = []

    def start(port, **env):
        path = tmp_path / "app.py"
        path.write_text(APP)
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
        7952,
        GRADIO_AUTOSCALE_BACKLOG_SECONDS="0.1",
        GRADIO_AUTOSCALE_IDLE_SECONDS="2",
        GRADIO_AUTOSCALE_COOLDOWN_SECONDS="1",
    )
    client = Client(url, verbose=False)
    first = [client.predict(0.3, api_name="/predict") for _ in range(4)]
    # The model is the process's own: one process served all four calls
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


def test_memory_budget():
    gib = 1024**3
    snapshot = {"kind": "cpu", "total": 32 * gib, "available": 20 * gib}
    assert admission(snapshot, 8 * gib, 0)[0]
    assert not admission(snapshot, 14 * gib, 0)[0]
    cuda = {
        **snapshot,
        "kind": "cuda",
        "gpu_total": 80 * gib,
        "gpu_available": 20 * gib,
    }
    assert not admission(cuda, gib, 66 * gib)[0]
    assert not admission({**snapshot, "error": "no telemetry"}, gib, 0)[0]
