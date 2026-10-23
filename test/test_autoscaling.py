"""`launch(executor="process", replicas=...)`: copies of the app's process."""

import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor

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
demo.launch(executor="process", server_port=int(os.environ["PORT"]))
"""


@pytest.fixture
def launch(tmp_path):
    processes = []

    def start(replicas, port, **env):
        path = tmp_path / "app.py"
        path.write_text(APP)
        process = subprocess.Popen(
            [sys.executable, str(path)],
            env={
                **os.environ,
                "PORT": str(port),
                "GRADIO_PROCESS_REPLICAS": str(replicas),
                "GRADIO_ANALYTICS_ENABLED": "False",
                **env,
            },
            start_new_session=True,
        )
        processes.append(process)
        deadline = time.monotonic() + 120
        while True:
            try:
                return Client(f"http://127.0.0.1:{port}/", verbose=False)
            except Exception:
                if process.poll() is not None or time.monotonic() > deadline:
                    raise
                time.sleep(0.5)

    yield start
    for process in processes:
        os.killpg(process.pid, 15)
        process.wait(timeout=30)


def pids(client, delay, count):
    with ThreadPoolExecutor(count) as pool:
        results = list(
            pool.map(lambda _: client.predict(delay, api_name="/predict"), range(count))
        )
    return {result.split()[0] for result in results}


def test_fixed_replicas_share_the_load(launch):
    client = launch(2, 7951)
    assert len(pids(client, 0.5, 6)) == 2


def test_auto_adds_a_replica_under_backlog_and_retires_it_when_idle(launch):
    client = launch(
        "auto",
        7952,
        GRADIO_AUTOSCALE_BACKLOG_SECONDS="0.1",
        GRADIO_AUTOSCALE_IDLE_SECONDS="2",
        GRADIO_AUTOSCALE_COOLDOWN_SECONDS="1",
    )
    first = [client.predict(0.3, api_name="/predict") for _ in range(4)]
    assert len({r.split()[0] for r in first}) == 1
    # The model is the process's own: one process served all four calls
    assert [r.split()[1] for r in first] == ["1", "2", "3", "4"]
    deadline = time.monotonic() + 60
    while len(pids(client, 0.4, 12)) < 2:
        assert time.monotonic() < deadline, "no replica was added"
    time.sleep(5)
    assert pids(client, 0.1, 2) == {first[0].split()[0]}


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
