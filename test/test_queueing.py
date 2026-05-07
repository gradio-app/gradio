import asyncio
import contextvars
import json
import threading
import time
from unittest.mock import patch

import gradio_client as grc
import pytest
from fastapi.testclient import TestClient

import gradio as gr
from gradio.route_utils import API_PREFIX
from gradio.routes import App

request_context = contextvars.ContextVar("request_context", default="unset")


class ContextHeaderMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        headers = dict(scope.get("headers", []))
        value = headers.get(b"x-test-context", b"missing").decode()
        token = request_context.set(value)
        try:
            await self.app(scope, receive, send)
        finally:
            request_context.reset(token)


class TestQueueing:
    def test_single_request(self, connect):
        with gr.Blocks() as demo:
            name = gr.Textbox()
            output = gr.Textbox()

            def greet(x):
                return f"Hello, {x}!"

            name.submit(greet, name, output)

        with connect(demo) as client:
            job = client.submit("x", fn_index=0)
            assert job.result() == "Hello, x!"

    def test_all_status_messages(self, connect):
        with gr.Blocks() as demo:
            name = gr.Textbox()
            output = gr.Textbox()

            def greet(x):
                time.sleep(2)
                return f"Hello, {x}!"

            name.submit(greet, name, output, concurrency_limit=2)

        app, local_url, _ = demo.launch(prevent_thread_lock=True)
        test_client = TestClient(app)
        client = grc.Client(local_url)

        client.submit("a", fn_index=0)
        job2 = client.submit("b", fn_index=0)
        client.submit("c", fn_index=0)
        job4 = client.submit("d", fn_index=0)

        sizes = []
        while job4.status().code.value != "FINISHED":
            queue_status = test_client.get(f"{API_PREFIX}/queue/status").json()
            queue_size = queue_status["queue_size"]
            if len(sizes) == 0 or queue_size != sizes[-1]:
                sizes.append(queue_size)
            time.sleep(0.01)

        time.sleep(0.1)
        queue_status = test_client.get(f"{API_PREFIX}/queue/status").json()
        queue_size = queue_status["queue_size"]
        if queue_size != sizes[-1]:
            sizes.append(queue_size)

        assert (
            max(sizes)
            in [
                2,
                3,
                4,
            ]
        )  # Can be 2 - 4, depending on if the workers have picked up jobs before the queue status is checked

        assert min(sizes) == 0
        assert sizes[-1] == 0

        assert job2.result() == "Hello, b!"
        assert job4.result() == "Hello, d!"

    def test_cached_generator_finishes_on_queue_cache_hit(self, connect):
        call_count = 0

        @gr.cache
        def stream_text(text):
            nonlocal call_count
            call_count += 1
            for i in range(len(text)):
                yield text[: i + 1]

        with gr.Blocks() as demo:
            name = gr.Textbox()
            output = gr.Textbox()
            name.submit(stream_text, name, output)

        demo.queue()

        with connect(demo) as client:
            first = client.submit("hello", fn_index=0)
            assert first.result(timeout=5) == "hello"
            assert first.outputs() == ["h", "he", "hel", "hell", "hello"]

            second = client.submit("hello", fn_index=0)
            assert second.result(timeout=5) == "hello"
            assert second.outputs() == ["h", "he", "hel", "hell", "hello"]

        assert call_count == 1

    def test_queue_average_excludes_manual_cache_hits(self, connect):
        def greet(x, c=gr.Cache()):
            hit = c.get(x)
            if hit is not None:
                return hit["value"]
            time.sleep(0.02)
            value = f"Hello, {x}!"
            c.set(x, value=value)
            return value

        with gr.Blocks() as demo:
            name = gr.Textbox()
            output = gr.Textbox()
            name.submit(greet, name, output)

        demo.queue()

        with connect(demo) as client:
            first = client.submit("x", fn_index=0)
            assert first.result(timeout=5) == "Hello, x!"

            second = client.submit("x", fn_index=0)
            assert second.result(timeout=5) == "Hello, x!"

        process_time = demo._queue.process_time_per_fn[demo.fns[0]]
        assert process_time.count == 1
        assert process_time.avg_time >= 0.02

    @pytest.mark.flaky
    @pytest.mark.parametrize(
        "default_concurrency_limit, statuses",
        [
            ("not_set", ["IN_QUEUE", "IN_QUEUE", "PROCESSING"]),
            (None, ["PROCESSING", "PROCESSING", "PROCESSING"]),
            (1, ["IN_QUEUE", "IN_QUEUE", "PROCESSING"]),
            (2, ["IN_QUEUE", "PROCESSING", "PROCESSING"]),
        ],
    )
    def test_default_concurrency_limits(self, default_concurrency_limit, statuses):
        with gr.Blocks() as demo:
            a = gr.Number()
            b = gr.Number()
            output = gr.Number()

            add_btn = gr.Button("Add")

            @add_btn.click(inputs=[a, b], outputs=output)
            def add(x, y):
                time.sleep(4)
                return x + y

        demo.queue(default_concurrency_limit=default_concurrency_limit)
        _, local_url, _ = demo.launch(
            prevent_thread_lock=True,
        )
        client = grc.Client(local_url)

        add_job_1 = client.submit(1, 1, fn_index=0)
        add_job_2 = client.submit(1, 1, fn_index=0)
        add_job_3 = client.submit(1, 1, fn_index=0)

        time.sleep(2)

        add_job_statuses = [add_job_1.status(), add_job_2.status(), add_job_3.status()]
        assert sorted([s.code.value for s in add_job_statuses]) == statuses


def test_heartbeat_task_cancelled_after_stream_completes():
    """Verify the heartbeat task is cancelled when the SSE stream ends normally."""
    with gr.Blocks() as demo:
        name = gr.Textbox()
        output = gr.Textbox()

        def greet(x):
            return f"Hello, {x}!"

        name.submit(greet, name, output)

    app, local_url, _ = demo.launch(prevent_thread_lock=True)

    heartbeat_tasks = []
    original_create_task = asyncio.create_task

    def tracking_create_task(coro, **kwargs):
        task = original_create_task(coro, **kwargs)
        heartbeat_tasks.append(task)
        return task

    with patch("gradio.routes.asyncio.create_task", side_effect=tracking_create_task):
        test_client = TestClient(app)
        r = test_client.post(
            f"{API_PREFIX}/queue/join",
            json={
                "data": ["hello"],
                "fn_index": 0,
                "event_data": None,
                "session_hash": "test_heartbeat",
                "trigger_id": None,
            },
        )
        assert r.status_code == 200

        r = test_client.get(f"{API_PREFIX}/queue/data?session_hash=test_heartbeat")

        # Verify we got a process_completed message
        got_completed = False
        for line in r.iter_lines():
            if "data" in line:
                data = json.loads(line[5:])
                if data["msg"] == "process_completed":
                    got_completed = True
        assert got_completed

    assert len(heartbeat_tasks) > 0, "No heartbeat tasks were created"
    for task in heartbeat_tasks:
        assert task.cancelled() or task.done(), (
            "Heartbeat task was not cancelled after stream completed"
        )
    demo.close()


@pytest.mark.parametrize("generator", [False, True])
@pytest.mark.parametrize("asynchronous", [False, True])
def test_queue_event_propagates_context_from_join_request(
    asynchronous: bool, generator: bool
):
    with gr.Blocks() as demo:
        start = gr.Button()
        output = gr.Textbox()

        def read_context():
            return request_context.get()

        def read_context_gen():
            yield request_context.get()

        async def read_context_async():
            return request_context.get()

        async def read_context_asyncgen():
            yield request_context.get()

        match asynchronous, generator:
            case False, False:
                fn = read_context
            case False, True:
                fn = read_context_gen
            case True, False:
                fn = read_context_async
            case True, True:
                fn = read_context_asyncgen

        start.click(fn, None, output)

    demo.queue()
    app = App.create_app(demo)
    app.add_middleware(ContextHeaderMiddleware)  # ty: ignore[invalid-argument-type]

    try:
        with TestClient(app) as test_client:
            startup = test_client.get(
                f"{API_PREFIX}/startup-events",
                headers={"x-test-context": "startup"},
            )
            assert startup.status_code == 200

            join = test_client.post(
                f"{API_PREFIX}/queue/join",
                headers={"x-test-context": "join"},
                json={
                    "data": [],
                    "fn_index": 0,
                    "event_data": None,
                    "session_hash": "context_session",
                    "trigger_id": None,
                },
            )
            assert join.status_code == 200

            stream = test_client.get(
                f"{API_PREFIX}/queue/data?session_hash=context_session"
            )

            output_data = None
            for line in stream.iter_lines():
                if not line.startswith("data: "):
                    continue
                message = json.loads(line[6:])
                if message["msg"] == "process_completed":
                    output_data = message["output"]["data"]
                    break

            assert output_data == ["join"]
    finally:
        demo.close()


def test_queue_context_task_is_cancelled_with_event():
    started = threading.Event()
    cancelled = threading.Event()
    completed = threading.Event()

    with gr.Blocks() as demo:
        start = gr.Button()
        output = gr.Textbox()

        async def wait_forever():
            try:
                assert request_context.get() == "join"
                started.set()
                await asyncio.Event().wait()
                completed.set()
                return "done"
            finally:
                cancelled.set()

        start.click(wait_forever, None, output)

    demo.queue()
    app = App.create_app(demo)
    app.add_middleware(ContextHeaderMiddleware)  # ty: ignore[invalid-argument-type]

    try:
        with TestClient(app) as test_client:
            startup = test_client.get(
                f"{API_PREFIX}/startup-events",
                headers={"x-test-context": "startup"},
            )
            assert startup.status_code == 200

            join = test_client.post(
                f"{API_PREFIX}/queue/join",
                headers={"x-test-context": "join"},
                json={
                    "data": [],
                    "fn_index": 0,
                    "event_data": None,
                    "session_hash": "cancel_context_session",
                    "trigger_id": None,
                },
            )
            assert join.status_code == 200
            event_id = join.json()["event_id"]

            assert started.wait(timeout=2)

            cancel = test_client.post(
                f"{API_PREFIX}/cancel",
                json={
                    "session_hash": "cancel_context_session",
                    "fn_index": 0,
                    "event_id": event_id,
                },
            )
            assert cancel.status_code == 200
            assert cancelled.wait(timeout=2)
            assert not completed.is_set()
    finally:
        demo.close()


def test_cancel_removes_pending_event_from_queue():
    """Cancelling a queued (not yet running) event should remove it from the queue."""
    with gr.Blocks() as demo:
        start = gr.Button()
        output = gr.Textbox()

        def slow():
            time.sleep(2)
            return "done"

        start.click(slow, None, output)

    demo.queue(default_concurrency_limit=1)
    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)

    join_payload = {
        "data": [],
        "fn_index": 0,
        "event_data": None,
        "session_hash": "sess1",
        "trigger_id": None,
    }

    try:
        first = test_client.post(f"{API_PREFIX}/queue/join", json=join_payload)
        second = test_client.post(f"{API_PREFIX}/queue/join", json=join_payload)
        third = test_client.post(f"{API_PREFIX}/queue/join", json=join_payload)
        assert first.status_code == 200
        assert second.status_code == 200
        assert third.status_code == 200

        second_event_id = second.json()["event_id"]
        third_event_id = third.json()["event_id"]

        # First event gets picked up by the worker; second and third are queued
        assert len(demo._queue) == 2
        assert second_event_id in demo._queue.event_ids_to_events
        assert second_event_id in demo._queue.pending_event_ids_session["sess1"]

        # Cancel the second (pending/queued) event
        resp = test_client.post(
            f"{API_PREFIX}/cancel",
            json={
                "session_hash": "sess1",
                "fn_index": 0,
                "event_id": second_event_id,
            },
        )
        assert resp.status_code == 200
        assert third_event_id in demo._queue.event_ids_to_events

        assert len(demo._queue) == 1
        r = test_client.get(f"{API_PREFIX}/queue/data?session_hash=sess1")

        # Verify we got a process_completed message
        got_completed = False
        for line in r.iter_lines():
            if "data" in line:
                data = json.loads(line[5:])
                if data["msg"] == "process_completed":
                    got_completed = True
        assert got_completed
        assert second_event_id not in demo._queue.pending_event_ids_session["sess1"]
        assert second_event_id not in demo._queue.event_ids_to_events
    finally:
        demo.close()


def test_analytics_summary(monkeypatch):
    """Test that the analytics summary endpoint is correctly being computed every N requests,
    where N is set by the GRADIO_ANALYTICS_CACHE_FREQUENCY environment variable."""
    monkeypatch.setenv("GRADIO_ANALYTICS_CACHE_FREQUENCY", 2)
    with gr.Blocks() as demo:
        name = gr.Textbox()
        output = gr.Textbox()

        def greet(x):
            return f"Hello, {x}!"

        name.submit(greet, name, output, api_name="predict")

    _, local_url, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(demo.app)
    client = grc.Client(local_url)
    with test_client as tc:
        event_analytics = tc.get("/monitoring/summary").json()
        assert event_analytics == {"functions": {}}
        client.predict(
            "a",
            api_name="/predict",
        )
        client.predict(
            "a",
            api_name="/predict",
        )
        event_analytics = tc.get("/monitoring/summary").json()
        assert "predict" in event_analytics["functions"]
        assert event_analytics["functions"]["predict"]["total_requests"] == 2
        client.predict("a", api_name="/predict")
        event_analytics = tc.get("/monitoring/summary").json()
        assert "predict" in event_analytics["functions"]
        assert event_analytics["functions"]["predict"]["total_requests"] == 2
        client.predict("a", api_name="/predict")
        event_analytics = tc.get("/monitoring/summary").json()
        assert "predict" in event_analytics["functions"]
        assert event_analytics["functions"]["predict"]["total_requests"] == 4
