import asyncio
import json
import sys
import threading
import time
from unittest.mock import patch

import fastapi
import gradio_client as grc
import httpx2
import pytest
from fastapi.testclient import TestClient

import gradio as gr
from gradio import queueing
from gradio.route_utils import API_PREFIX
from gradio.server_messages import ProcessCompletedMessage


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

    app, _, _ = demo.launch(prevent_thread_lock=True)

    heartbeat_tasks = []
    original_create_task = asyncio.create_task

    def tracking_create_task(coro, **kwargs):
        task = original_create_task(coro, **kwargs)
        heartbeat_tasks.append(task)
        return task

    with TestClient(app) as test_client:
        with patch(
            "gradio.routes.asyncio.create_task", side_effect=tracking_create_task
        ):
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


def test_detached_queue_session_can_resume():
    finished = threading.Event()

    with gr.Blocks() as demo:
        start = gr.Button()
        output = gr.Textbox()

        def slow():
            time.sleep(0.05)
            finished.set()
            return "done"

        start.click(slow, None, output)

    demo.queue(default_concurrency_limit=1)
    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)

    try:
        # A client that acknowledges results (and so may resume) has attached
        demo._queue.mark_session_attached("resume_session")
        response = test_client.post(
            f"{API_PREFIX}/queue/join",
            json={
                "data": [],
                "fn_index": 0,
                "event_data": None,
                "session_hash": "resume_session",
                "trigger_id": None,
            },
        )
        assert response.status_code == 200
        event_id = response.json()["event_id"]

        asyncio.run(demo._queue.mark_session_detached("resume_session"))

        assert event_id in demo._queue.event_ids_to_events
        assert event_id in demo._queue.pending_event_ids_session["resume_session"]
        assert "resume_session" in demo._queue.pending_messages_per_session
        assert finished.wait(timeout=1)

        deadline = time.monotonic() + 1
        while any(demo._queue.active_jobs) and time.monotonic() < deadline:
            time.sleep(0.01)
        assert not any(demo._queue.active_jobs)

        response = test_client.get(
            f"{API_PREFIX}/queue/data?session_hash=resume_session"
            f"&resume_event_id={event_id}&acknowledgements=true"
        )
        completed_data = None
        for line in response.iter_lines():
            if "data" not in line:
                continue
            data = json.loads(line[5:])
            if data["msg"] == "process_completed":
                completed_data = data["output"]["data"]

        assert completed_data == ["done"]
        assert event_id not in demo._queue.pending_event_ids_session["resume_session"]
        assert demo._queue.resumable_sessions["resume_session"].history

        response = test_client.post(
            f"{API_PREFIX}/reset",
            json={"event_id": event_id},
        )
        assert response.status_code == 200
        assert "resume_session" not in demo._queue.pending_event_ids_session
        assert "resume_session" not in demo._queue.resumable_sessions
    finally:
        demo.close()


def test_missing_resumed_event_closes_stream():
    with gr.Blocks() as demo:
        gr.Button().click(lambda: None)

    demo.queue()
    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)

    try:
        response = test_client.get(
            f"{API_PREFIX}/queue/data?session_hash=missing_session"
            "&resume_event_id=missing_event&acknowledgements=true"
        )
        messages = [json.loads(line[5:]) for line in response.iter_lines() if line]

        assert messages[0]["session_not_found"] is True
        assert messages[-1]["msg"] == "close_stream"
    finally:
        demo.close()


def test_expired_detached_session_is_fully_cleaned_up():
    started = threading.Event()
    unloaded = threading.Event()

    with gr.Blocks() as demo:
        start = gr.Button()

        def slow():
            started.set()
            time.sleep(0.5)

        start.click(slow)
        demo.unload(unloaded.set)

    demo.queue(default_concurrency_limit=1)
    app, _, _ = demo.launch(prevent_thread_lock=True)
    test_client = TestClient(app)

    try:
        response = test_client.post(
            f"{API_PREFIX}/queue/join",
            json={
                "data": [],
                "fn_index": 0,
                "event_data": None,
                "session_hash": "expired_session",
                "trigger_id": None,
            },
        )
        event_id = response.json()["event_id"]
        assert started.wait(timeout=1)

        response = test_client.post(
            f"{API_PREFIX}/queue/close",
            json={"session_hash": "expired_session"},
        )
        assert response.status_code == 200
        assert (
            demo._queue.resumable_sessions["expired_session"].expires_at
            <= time.monotonic() + 5
        )

        demo._queue.resumable_sessions["expired_session"].expires_at = 0
        asyncio.run(demo._queue.clean_expired_detached_sessions())

        # The server's own queue loop may have picked the session up first, in
        # the background, so wait for it to be done
        assert unloaded.wait(timeout=5)
        deadline = time.monotonic() + 5
        while (
            "expired_session" in demo._queue.resumable_sessions
            or "expired_session" in demo._queue.pending_event_ids_session
        ) and time.monotonic() < deadline:
            time.sleep(0.05)
        assert unloaded.is_set()
        assert app.state_holder.session_data["expired_session"].is_closed is True
        assert event_id not in demo._queue.event_ids_to_events
        assert "expired_session" not in demo._queue.pending_event_ids_session

        response = test_client.get(
            f"{API_PREFIX}/queue/data?session_hash=expired_session"
            f"&resume_event_id={event_id}&acknowledgements=true"
        )
        messages = [json.loads(line[5:]) for line in response.iter_lines() if line]
        assert messages[0]["session_not_found"] is True
        assert messages[-1]["msg"] == "close_stream"
    finally:
        demo.close()


def test_expired_session_runs_unload_after_its_events_are_gone():
    # A job that finished while nobody was watching leaves no event to take a
    # request from, so the queue keeps the heartbeat's one for `unload`.
    unloaded = threading.Event()
    with gr.Blocks() as demo:
        demo.unload(unloaded.set)

    app, _, _ = demo.launch(prevent_thread_lock=True)
    try:
        queue = demo._queue
        request = fastapi.Request(
            {
                "type": "http",
                "method": "GET",
                "path": f"{API_PREFIX}/heartbeat/finished_session",
                "headers": [],
                "query_string": b"",
                "server": ("testserver", 80),
                "scheme": "http",
                "root_path": "",
                "client": ("127.0.0.1", 1234),
            }
        )
        queue.pending_event_ids_session["finished_session"] = {"done-event"}
        queue.remember_unload_request(
            "finished_session",
            request,
            None,
            f"{API_PREFIX}/heartbeat/finished_session",
        )
        queue.resumable_sessions["finished_session"].expires_at = 0
        asyncio.run(queue.clean_expired_detached_sessions())

        # The server's own queue loop may have picked the session up first, in
        # the background, so wait for it to be done
        deadline = time.monotonic() + 5
        while (
            "finished_session" in queue.resumable_sessions
            and time.monotonic() < deadline
        ):
            time.sleep(0.05)
        assert unloaded.is_set()
        assert "finished_session" not in queue.resumable_sessions
    finally:
        demo.close()


def test_closing_a_session_with_an_unacknowledged_result_uses_the_grace_period():
    # The job finished (no pending ids), but the page never acknowledged its
    # result, so only its buffered messages are left for a reload to replay.
    with gr.Blocks() as demo:
        gr.Textbox()
    demo.launch(prevent_thread_lock=True)
    try:
        queue = demo._queue
        resumable = queue.resumable_sessions.setdefault(
            "finished", queueing.ResumableSession()
        )
        resumable.history.append(
            ProcessCompletedMessage(output={}, success=True, event_id="done")
        )
        queue.mark_session_closing("finished")
        assert resumable.closing is True
        assert resumable.expires_at is not None
        assert resumable.expires_at <= time.monotonic() + queue.close_grace_period
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


class TestOwnEventStream:
    """sse_v4: a `queue/join` that asks for `text/event-stream` gets that one
    event's messages on its own response, instead of an event id to look up
    on the session's `queue/data` stream."""

    @staticmethod
    def join(demo, dep_index, data, session_hash):
        dep = demo.config["dependencies"][dep_index]
        return httpx2.stream(
            "POST",
            f"{demo.local_url}{API_PREFIX.lstrip('/')}/queue/join",
            json={
                "data": data,
                "fn_index": dep["id"],
                "session_hash": session_hash,
                "event_data": None,
                "trigger_id": None,
            },
            headers={"Accept": "text/event-stream"},
            timeout=10,
        )

    @staticmethod
    def read(lines, until=None):
        messages = []
        for line in lines:
            if line.startswith("data:"):
                messages.append(json.loads(line[5:]))
                if messages[-1]["msg"] == until:
                    break
        return messages

    def test_config_keeps_sse_v3_for_older_clients(self):
        with gr.Blocks() as demo:
            gr.Textbox()
        config = demo.get_config_file()
        assert config["protocol"] == "sse_v3"
        assert config["supported_protocols"] == ["sse_v3", "sse_v4"]

    def test_streams_the_event_on_the_join_response(self):
        def count(n):
            for i in range(int(n)):
                yield str(i)

        with gr.Blocks() as demo:
            n, out = gr.Number(), gr.Textbox()
            gr.Button().click(count, n, out)
        demo.launch(prevent_thread_lock=True)
        try:
            with self.join(demo, 0, [3], "own-stream") as response:
                assert response.status_code == 200
                assert response.headers["content-type"].startswith("text/event-stream")
                messages = self.read(response.iter_lines())
            assert [m["msg"] for m in messages] == [
                "estimation",
                "process_starts",
                "process_generating",
                "process_generating",
                "process_generating",
                "process_completed",
            ]
            assert len({m["event_id"] for m in messages}) == 1
            assert messages[-1]["output"]["data"] == ["2"]
            queue = demo._queue
            assert queue.pending_messages_per_event == {}
            assert "own-stream" not in queue.pending_event_ids_session
            # Nothing was set up for a `queue/data` stream to read.
            assert "own-stream" not in queue.pending_messages_per_session
        finally:
            demo.close()

    def test_rejected_join_keeps_its_http_status(self):
        with gr.Blocks() as demo:
            t, out = gr.Textbox(), gr.Textbox()
            gr.Button().click(
                lambda x: x,
                t,
                out,
                validator=lambda x: gr.validate(len(x) < 5, "too long"),
            )
        demo.launch(prevent_thread_lock=True)
        try:
            with self.join(demo, 0, ["far too long"], "rejected") as response:
                response.read()
            assert response.status_code == 422
            assert response.json()["detail"][0]["message"] == "too long"
            assert demo._queue.pending_messages_per_event == {}
        finally:
            demo.close()

    def test_leaving_cancels_only_that_event(self):
        """A dropped stream used to delete the whole session's message queue
        (https://github.com/gradio-app/gradio/issues/13895)."""
        finished = []

        async def slow(x):
            await asyncio.sleep(1.5)
            finished.append(x)
            return x

        with gr.Blocks() as demo:
            t, out = gr.Textbox(), gr.Textbox()
            gr.Button().click(slow, t, out, concurrency_limit=None)
        demo.launch(prevent_thread_lock=True)
        try:
            with self.join(demo, 0, ["kept"], "one-session") as kept:
                with self.join(demo, 0, ["dropped"], "one-session") as dropped:
                    self.read(dropped.iter_lines(), until="process_starts")
                messages = self.read(kept.iter_lines())
            assert messages[-1]["msg"] == "process_completed"
            assert messages[-1]["output"]["data"] == ["kept"]
            time.sleep(0.5)
            assert finished == ["kept"]
            assert demo._queue.pending_messages_per_event == {}
            assert not any(demo._queue.active_jobs)
        finally:
            demo.close()

    def test_a_page_that_resumes_keeps_the_event_when_its_request_drops(self):
        """With `acknowledgements`, as the browser sends when it resumes sessions,
        a dropped request hands the event over to the session's `queue/data`
        stream, where the page picks it up again instead of losing it."""
        finished = []

        async def slow(x):
            await asyncio.sleep(1)
            finished.append(x)
            return x

        with gr.Blocks() as demo:
            t, out = gr.Textbox(), gr.Textbox()
            gr.Button().click(slow, t, out)
        demo.launch(prevent_thread_lock=True)
        try:
            dep = demo.config["dependencies"][0]
            base = f"{demo.local_url}{API_PREFIX.lstrip('/')}"
            with httpx2.stream(
                "POST",
                f"{base}/queue/join",
                params={"acknowledgements": "true"},
                json={
                    "data": ["kept"],
                    "fn_index": dep["id"],
                    "session_hash": "resumes",
                    "event_data": None,
                    "trigger_id": None,
                },
                headers={"Accept": "text/event-stream"},
                timeout=10,
            ) as dropped:
                started = self.read(dropped.iter_lines(), until="process_starts")
            event_id = started[-1]["event_id"]
            with httpx2.stream(
                "GET",
                f"{base}/queue/data",
                params={
                    "session_hash": "resumes",
                    "resume_event_id": event_id,
                    "acknowledgements": "true",
                },
                timeout=10,
            ) as resumed:
                messages = self.read(resumed.iter_lines(), until="process_completed")
            # What the dropped request already delivered is replayed first
            assert [m["msg"] for m in messages][:2] == ["estimation", "process_starts"]
            assert messages[-1]["event_id"] == event_id
            assert messages[-1]["output"]["data"] == ["kept"]
            assert finished == ["kept"]
        finally:
            demo.close()

    def test_cancel_route_ends_the_event_stream(self):
        async def slow():
            await asyncio.sleep(5)
            return "done"

        with gr.Blocks() as demo:
            out = gr.Textbox()
            gr.Button().click(slow, None, out)
        demo.launch(prevent_thread_lock=True)
        try:
            with self.join(demo, 0, [], "cancelled") as response:
                lines = response.iter_lines()
                started = self.read(lines, until="process_starts")
                event_id = started[-1]["event_id"]
                httpx2.post(
                    f"{demo.local_url}{API_PREFIX.lstrip('/')}/cancel",
                    json={
                        "session_hash": "cancelled",
                        "fn_index": demo.config["dependencies"][0]["id"],
                        "event_id": event_id,
                    },
                )
                rest = self.read(lines)
            assert rest[-1]["msg"] == "process_completed"
            assert rest[-1]["event_id"] == event_id
            assert not any(demo._queue.active_jobs)
        finally:
            demo.close()

    def test_leaving_before_the_stream_starts_still_cancels(self):
        """The response's generator never starts if the client has already left,
        so cleanup cannot rely on it."""
        ran = []

        def slow_validator(x):
            time.sleep(1)
            return gr.validate(True, "")

        def fn(x):
            ran.append(x)
            return x

        with gr.Blocks() as demo:
            t, out = gr.Textbox(), gr.Textbox()
            gr.Button().click(fn, t, out, validator=slow_validator)
        demo.launch(prevent_thread_lock=True)
        try:
            # Gives up while the server is still validating the join.
            with pytest.raises(httpx2.ReadTimeout):
                with httpx2.stream(
                    "POST",
                    f"{demo.local_url}{API_PREFIX.lstrip('/')}/queue/join",
                    json={
                        "data": ["x"],
                        "fn_index": demo.config["dependencies"][0]["id"],
                        "session_hash": "left-early",
                        "event_data": None,
                        "trigger_id": None,
                    },
                    headers={"Accept": "text/event-stream"},
                    timeout=httpx2.Timeout(5, read=0.3),
                ) as response:
                    response.read()
            time.sleep(2)
            assert ran == []
            assert demo._queue.pending_messages_per_event == {}
            assert "left-early" not in demo._queue.pending_event_ids_session
        finally:
            demo.close()


def test_resuming_one_event_keeps_messages_waiting_for_another():
    from gradio.server_messages import ProcessStartsMessage

    with gr.Blocks() as demo:
        gr.Textbox()
    demo.launch(prevent_thread_lock=True)
    try:
        queue = demo._queue
        waiting = ProcessCompletedMessage(output={}, success=True, event_id="fast")
        replayed = ProcessStartsMessage(event_id="slow")
        queue.pending_messages_per_session["s"] = asyncio.Queue()
        queue.pending_messages_per_session["s"].put_nowait(waiting)
        resumable = queue.resumable_sessions.setdefault(
            "s", queueing.ResumableSession(acknowledges=True)
        )
        resumable.history.append(replayed)
        queue.event_ids_to_events["slow"] = type("E", (), {"session_hash": "s"})()
        try:
            queue.resume_session("s", ["slow"])
        finally:
            queue.event_ids_to_events.pop("slow", None)
        messages = queue.pending_messages_per_session["s"]
        order = [messages.get_nowait().event_id for _ in range(messages.qsize())]
        assert order == ["slow", "fast"]
    finally:
        demo.close()


def test_history_is_only_kept_for_clients_that_may_resume():
    with gr.Blocks() as demo:
        name = gr.Textbox()
        name.submit(lambda x: x, name, name, api_name="echo")
    app, _, _ = demo.launch(prevent_thread_lock=True)
    try:
        with TestClient(app) as client:
            for _ in range(3):
                event_id = client.post(
                    f"{API_PREFIX}/call/echo", json={"data": ["hi"]}
                ).json()["event_id"]
                client.get(f"{API_PREFIX}/call/echo/{event_id}")
        assert not any(
            resumable.history for resumable in demo._queue.resumable_sessions.values()
        )
    finally:
        demo.close()
