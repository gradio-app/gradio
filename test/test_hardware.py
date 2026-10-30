"""Behavior tests for hardware preview: worker lifecycle, isolation, and controls."""

import os
import platform
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import gradio as gr
from gradio.hardware.executor import Executor
from gradio.hardware.profiles import resolve
from gradio.hardware.resource import resource
from gradio.hardware.ui import install


def test_aliases_and_lazy_resource():
    assert gr.App is gr.Server
    app = gr.App()
    calls = []

    @app.resource()
    def value():
        calls.append(1)
        return object()

    assert calls == []
    assert value() is value()
    assert calls == [1]

    @app.queue()
    def echo(x: str) -> str:
        return x

    assert app._deferred_apis[0][0] is echo
    assert app._deferred_apis[0][1]["queue"] is True


def test_resource_failure_can_retry():
    calls = []

    @resource
    def value():
        calls.append(1)
        if len(calls) == 1:
            raise ValueError("transient")
        return 42

    with pytest.raises(ValueError):
        value()
    assert value() == 42


def test_profiles_are_explicit_about_estimates():
    assert resolve("MacBook Pro M3").bandwidth_gbs == 100
    assert resolve("iPhone 18 Pro").bandwidth_gbs is None
    with pytest.raises(ValueError, match="Unknown hardware"):
        resolve("invented")


@pytest.fixture
def worker_app(tmp_path):
    path = tmp_path / "app.py"
    path.write_text("""
import os
import gradio as gr
app=gr.App()
@app.resource()
def counter(): return []
@app.queue()
def identify():
    state=counter();state.append(1)
    return [os.getpid(),len(state)]
@app.queue()
def stream(n):
    for i in range(n): yield i
@app.queue()
async def asynchronous(n): return n+1
@app.queue()
async def async_stream(n):
    for i in range(n): yield i
@app.queue()
def fail(): raise ValueError('user failure')
if __name__=='__main__': app.launch()
""")
    executor = Executor(str(path))
    yield executor
    executor.close()


def test_worker_reuses_model_and_isolates_process(worker_app):
    first = list(worker_app.run(0, (), {}))[0]
    second = list(worker_app.run(0, (), {}))[0]
    assert first[0] != os.getpid()
    assert first[0] == second[0]
    assert [first[1], second[1]] == [1, 2]
    assert list(worker_app.run(1, (3,), {})) == [0, 1, 2]
    assert list(worker_app.run(2, (4,), {})) == [5]
    assert list(worker_app.run(3, (3,), {})) == [0, 1, 2]
    with pytest.raises(RuntimeError, match="user failure"):
        list(worker_app.run(4, (), {}))
    assert list(worker_app.run(2, (4,), {})) == [5]


def test_abandon_stream_restarts_worker(worker_app):
    stream = worker_app.run(1, (100000,), {})
    assert next(stream) == 0
    process = worker_app.process
    stream.close()
    assert process.poll() is not None
    assert list(worker_app.run(2, (4,), {})) == [5]


def test_switch_rejected_during_job(worker_app):
    stream = worker_app.run(1, (3,), {})
    next(stream)
    try:
        with pytest.raises(RuntimeError, match="active job"):
            worker_app.select("host")
    finally:
        stream.close()


def test_controls_are_local_and_require_token(worker_app):
    app = gr.App()
    install(app, worker_app)
    with TestClient(app) as client:
        assert client.get("/__gradio_hardware/status").status_code == 200
        assert (
            client.post(
                "/__gradio_hardware/select", json={"hardware": "host"}
            ).status_code
            == 403
        )
        assert (
            client.get(
                "/__gradio_hardware/status", headers={"host": "evil.example"}
            ).status_code
            == 403
        )
        assert (
            client.get("/__gradio_hardware/overlay.js").headers["cache-control"]
            == "no-store"
        )


@pytest.mark.skipif(
    platform.system() != "Darwin" or platform.machine() != "arm64",
    reason="Native Metal integration",
)
def test_native_buffer_budget(tmp_path):
    import subprocess

    from gradio.hardware.native import build, calibrate

    library = build()
    assert calibrate()["valid"]
    # Use the same native probe as calibration, with a deliberately tiny cap.
    probe = next((Path.home() / ".cache/gradio/hardware").glob("probe-*"))
    result = subprocess.run(
        [str(probe)],
        env={
            **os.environ,
            "DYLD_INSERT_LIBRARIES": str(library),
            "GRADIO_METAL_RATE": "1",
            "GRADIO_METAL_MEMORY_BYTES": "1048576",
        },
        capture_output=True,
        text=True,
        check=False,
        timeout=30,
    )
    assert result.returncode == 4
    assert "Buffer allocation rejected" in result.stderr


@pytest.mark.asyncio
async def test_cancel_while_waiting_for_native_function(tmp_path):
    import asyncio

    path = tmp_path / "slow.py"
    path.write_text("""
import time
import gradio as gr
app=gr.App()
@app.queue()
def wait():
    time.sleep(60)
    return 'done'
""")
    executor = Executor(str(path))
    events = executor.events(0, (), {})
    task = asyncio.create_task(anext(events))
    try:
        await asyncio.sleep(0.3)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await asyncio.wait_for(task, 5)
        assert executor.process is None
        assert not executor.active
    finally:
        await events.aclose()
        executor.close()


def test_host_job_prevents_profile_changes(worker_app):
    assert worker_app.begin_local()
    try:
        with pytest.raises(RuntimeError, match="active job"):
            worker_app.select("host")
    finally:
        worker_app.end_local()
