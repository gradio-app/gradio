import asyncio
import json
import sys
import threading
import time
from unittest.mock import patch

import gradio_client as grc
import pytest
from fastapi.testclient import TestClient

import gradio as gr
from gradio.route_utils import API_PREFIX


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


@pytest.mark.skipif(
    sys.platform == "win32",
    reason="Heartbeat task is not reliably cancelled by the time the SSE stream "
    "loop returns on Windows CI (cancellation does not propagate within a "
    "reasonable wait). Passes on Linux/macOS.",
)
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

        # First event gets picked up by the worker; second and third are queued.
        # The worker dequeues asynchronously, so wait for it to settle before
        # asserting (avoids a race on slower CI runners where all three are
        # momentarily still in the queue).
        for _ in range(50):
            if len(demo._queue) == 2:
                break
            time.sleep(0.1)
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


class TestQueueDoesNotAccumulate:
    def test_finished_events_are_not_retained(self, connect):
        with gr.Blocks() as demo:
            box = gr.Textbox()
            out = gr.Textbox()
            box.submit(lambda x: x, box, out)

        with connect(demo) as client:
            for _ in range(5):
                client.predict("a", api_name="/lambda")

        assert demo._queue.event_ids_to_events == {}

    def test_finished_tasks_are_not_retained(self, connect):
        with gr.Blocks() as demo:
            box = gr.Textbox()
            out = gr.Textbox()
            box.submit(lambda x: x, box, out)

        with connect(demo) as client:
            for _ in range(5):
                client.predict("a", api_name="/lambda")

        assert demo._queue._asyncio_tasks == set()

    def test_completing_an_event_does_not_mark_its_iterator_for_reset(self, connect):
        with gr.Blocks() as demo:
            box = gr.Textbox()
            out = gr.Textbox()
            box.submit(lambda x: x, box, out)

        with connect(demo) as client:
            for _ in range(5):
                client.predict("a", api_name="/lambda")

        assert demo._queue.server_app.iterators_to_reset == set()

    def test_event_analytics_is_bounded(self, connect):
        with gr.Blocks() as demo:
            box = gr.Textbox()
            out = gr.Textbox()
            box.submit(lambda x: x, box, out)

        demo._queue.ANALYTICS_MAX_EVENTS = 3
        with connect(demo) as client:
            for _ in range(8):
                client.predict("a", api_name="/lambda")

        assert len(demo._queue.event_analytics) == 3
        assert demo._queue.events_recorded == 8
        assert (
            demo._queue.cached_event_analytics_summary["functions"]["lambda"][
                "total_requests"
            ]
            == 8
        )


def join(test_client, session_hash: str, fn_index: int = 0) -> str:
    response = test_client.post(
        f"{API_PREFIX}/queue/join",
        json={
            "data": [],
            "fn_index": fn_index,
            "event_data": None,
            "session_hash": session_hash,
            "trigger_id": None,
        },
    )
    assert response.status_code == 200
    return response.json()["event_id"]


def slow_demo(started: threading.Event | None = None):
    with gr.Blocks() as demo:
        start = gr.Button()

        def slow():
            if started is not None:
                started.set()
            time.sleep(30)

        start.click(slow)

    demo.queue(default_concurrency_limit=1)
    return demo


def test_losing_a_stream_does_not_remove_the_event():
    """A dropped connection is not a departure: the work is kept for a reconnection."""
    started = threading.Event()
    demo = slow_demo(started)
    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)

    try:
        event_id = join(test_client, "dropped")
        assert started.wait(timeout=2)

        # The stream opens and is then lost, which is what a backgrounded phone or a
        # few seconds without signal looks like from the server.
        stream = object()
        demo._queue.attach_stream("dropped", stream)
        asyncio.run(
            demo._queue.schedule_cancel(
                "dropped", after=demo._queue.cancel_after_disconnect, stream=stream
            )
        )

        event = demo._queue.event_ids_to_events[event_id]
        assert event.cancel_at is not None
        assert event.cancel_at > time.monotonic() + 60
        assert event.alive is True

        asyncio.run(demo._queue.run_due_cancellations())
        assert event_id in demo._queue.event_ids_to_events
        assert event.alive is True
    finally:
        demo.close()


def test_reconnecting_clears_a_scheduled_cancellation():
    demo = slow_demo()
    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)

    try:
        event_id = join(test_client, "returning")
        first = object()
        demo._queue.attach_stream("returning", first)
        asyncio.run(demo._queue.schedule_cancel("returning", after=3600, stream=first))
        assert demo._queue.event_ids_to_events[event_id].cancel_at is not None

        demo._queue.attach_stream("returning", object())
        assert demo._queue.event_ids_to_events[event_id].cancel_at is None
    finally:
        demo.close()


def test_a_replaced_stream_cannot_condemn_the_new_one():
    """A refresh reconnects before the server notices the previous stream dropped."""
    demo = slow_demo()
    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)

    try:
        event_id = join(test_client, "refreshed")
        old_stream, new_stream = object(), object()
        demo._queue.attach_stream("refreshed", old_stream)
        demo._queue.attach_stream("refreshed", new_stream)

        asyncio.run(
            demo._queue.schedule_cancel("refreshed", after=0, stream=old_stream)
        )

        assert demo._queue.event_ids_to_events[event_id].cancel_at is None
        assert demo._queue.attached_streams["refreshed"] is new_stream
    finally:
        demo.close()


def test_closing_the_page_stops_the_event_and_unloads():
    started = threading.Event()
    unloaded = threading.Event()

    with gr.Blocks() as demo:
        start = gr.Button()

        def slow():
            started.set()
            time.sleep(30)

        start.click(slow)
        demo.unload(unloaded.set)

    demo.queue(default_concurrency_limit=1)
    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)

    try:
        event_id = join(test_client, "departed")
        assert started.wait(timeout=2)

        response = test_client.post(
            f"{API_PREFIX}/queue/close", json={"session_hash": "departed"}
        )
        assert response.status_code == 200
        event = demo._queue.event_ids_to_events[event_id]
        assert event.cancel_at is not None
        assert event.cancel_at <= time.monotonic()

        # The sweep is throttled, so the queue loop may not have run it yet.
        demo._queue.last_cancellation_sweep = 0
        asyncio.run(demo._queue.run_due_cancellations())

        assert event.alive is False
        assert event.run_time == float("inf")
        assert event.signal.is_set()
        assert unloaded.wait(timeout=2)
        assert app.state_holder.session_data["departed"].is_closed is True
    finally:
        demo.close()


def test_cancel_route_still_completes_a_queued_event():
    with gr.Blocks() as demo:
        start = gr.Button()
        output = gr.Textbox()

        def slow():
            time.sleep(30)
            return "done"

        start.click(slow, None, output)

    demo.queue(default_concurrency_limit=1)
    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)

    try:
        first = join(test_client, "cancels")
        second = join(test_client, "cancels")
        for _ in range(50):
            if len(demo._queue) == 1:
                break
            time.sleep(0.1)
        assert len(demo._queue) == 1

        response = test_client.post(
            f"{API_PREFIX}/cancel",
            json={"session_hash": "cancels", "fn_index": 0, "event_id": second},
        )
        assert response.status_code == 200
        assert second not in demo._queue.event_ids_to_events
        assert len(demo._queue) == 0
        assert first in demo._queue.event_ids_to_events

        # The client is told the cancelled job finished so that it stops waiting.
        messages = demo._queue.pending_messages_per_session["cancels"]
        completed = [messages.get_nowait() for _ in range(messages.qsize())]
        assert any(
            message.event_id == second and message.msg == "process_completed"
            for message in completed
        )
    finally:
        demo.close()
