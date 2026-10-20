import asyncio
import json
import sys
import threading
import time
from typing import Any, cast
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


def test_an_acknowledged_stream_does_not_cut_off_the_open_message_stream():
    with gr.Blocks() as demo:
        audio = gr.Audio(sources=["microphone"], streaming=True)
        heard = gr.Textbox()
        audio.stream(lambda x: "chunk", audio, heard)
        gr.Button().click(lambda: "clicked", None, heard)
    _, local_url, _ = demo.launch(prevent_thread_lock=True)
    api = f"{local_url.rstrip('/')}{API_PREFIX}"
    messages = []

    def read_messages():
        with httpx2.Client(timeout=30) as http:
            with http.stream(
                "GET",
                f"{api}/queue/data",
                params={"session_hash": "s", "acknowledgements": "true"},
            ) as response:
                for line in response.iter_lines():
                    if line.startswith("data:"):
                        messages.append(json.loads(line[5:]))

    try:
        with httpx2.Client(timeout=10) as http:
            stream_event = _join(http, api, "s")
            reader = threading.Thread(target=read_messages, daemon=True)
            reader.start()
            _wait_for(
                lambda: any(m.get("msg") == "process_streaming" for m in messages)
            )
            # The page stops the stream while its message stream stays open, as
            # when a gr.Audio stream is stopped: the acknowledgement goes out
            # before the close request
            http.post(f"{api}/reset", json={"event_id": stream_event})
            http.post(f"{api}/stream/{stream_event}/close")
            time.sleep(0.5)
            click_event = http.post(
                f"{api}/queue/join",
                json={"data": [], "fn_index": 1, "session_hash": "s"},
            ).json()["event_id"]
            # The next event's result arrives on the same open stream
            _wait_for(
                lambda: any(
                    m.get("msg") == "process_completed"
                    and m.get("event_id") == click_event
                    for m in messages
                ),
                timeout=3,
                message="The open message stream missed the next event",
            )
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


@pytest.mark.parametrize("leave", ["cancel", "reset"])
def test_the_line_moves_up_when_someone_leaves_it(leave):
    from gradio.server_messages import EstimationMessage

    with gr.Blocks() as demo:
        gr.Button().click(lambda: time.sleep(3), None, None, concurrency_limit=1)
    _, local_url, _ = demo.launch(prevent_thread_lock=True)
    api = f"{local_url.rstrip('/')}{API_PREFIX}"
    queue = demo._queue

    def ranks(session_hash):
        # Peeks at the messages waiting for the page, without taking them
        waiting = queue.pending_messages_per_session[session_hash]._queue  # type: ignore
        return [m.rank for m in waiting if isinstance(m, EstimationMessage)]

    try:
        with httpx2.Client(timeout=10) as http:

            def join(session_hash):
                return http.post(
                    f"{api}/queue/join",
                    json={"data": [], "fn_index": 0, "session_hash": session_hash},
                ).json()["event_id"]

            join("running")
            _wait_for(lambda: queue.get_active_worker_count() == 1)
            ahead = join("ahead")
            join("behind")
            _wait_for(lambda: ranks("behind") == [1])
            # Someone ahead leaves the line: by the button (cancel) or by
            # closing the page (reset), while nothing new starts
            if leave == "cancel":
                http.post(
                    f"{api}/cancel",
                    json={"event_id": ahead, "fn_index": 0, "session_hash": "ahead"},
                )
            else:
                http.post(f"{api}/reset", json={"event_id": ahead})
            _wait_for(
                lambda: ranks("behind")[-1:] == [0],
                timeout=1.5,
                message="The event behind did not hear that it moved up",
            )
    finally:
        demo.close()


@pytest.mark.parametrize("generator", [False, True])
def test_history_keeps_only_the_latest_output_of_a_stream(generator):
    from types import SimpleNamespace

    from gradio.server_messages import ProcessGeneratingMessage, ServerMessage

    with gr.Blocks() as demo:
        gr.Textbox()
    demo.launch(prevent_thread_lock=True)
    try:
        queue = demo._queue
        queue.pending_messages_per_session["s"] = asyncio.Queue()
        resumable = queue.resumable_sessions.setdefault(
            "s", queueing.ResumableSession(acknowledges=True)
        )

        def event(event_id, types_generator):
            return SimpleNamespace(
                _id=event_id,
                alive=True,
                session_hash="s",
                fn=SimpleNamespace(types_generator=types_generator),
            )

        stream = event("stream", generator)
        generating = event("generating", True)
        for i in range(3):
            for e, msg in (
                (stream, ServerMessage.process_streaming),
                (generating, ServerMessage.process_generating),
            ):
                queue.send_message(
                    cast(queueing.Event, e),
                    ProcessGeneratingMessage(
                        msg=msg, output={"i": i, "data": [f"value {i}"]}, success=True
                    ),
                )
        # A wake-up with nothing new: every output skipped
        queue.send_message(
            cast(queueing.Event, stream),
            ProcessGeneratingMessage(
                msg=ServerMessage.process_streaming,
                output={"i": 3, "data": [{"__type__": "update"}]},
                success=True,
            ),
        )
        kept = [(m.event_id, cast(Any, m).output["i"]) for m in resumable.history]
        if generator:
            # A generator's outputs are diffs, each needed to rebuild the value
            assert len(kept) == 7
        else:
            # Each call of a stream sends whole values; a stream that runs for
            # hours must not fill the history, and a call that changed
            # nothing does not replace the last output
            assert kept == [
                ("generating", 0),
                ("generating", 1),
                ("stream", 2),
                ("generating", 2),
            ]
    finally:
        demo.close()


@pytest.mark.parametrize("time_limit", [10, None])
def test_eta_of_a_stream_waiting_for_a_slot(time_limit):
    with gr.Blocks() as demo:
        audio = gr.Audio(sources=["microphone"], streaming=True)
        heard = gr.Textbox()
        audio.stream(
            lambda x: "chunk",
            audio,
            heard,
            concurrency_limit=1,
            time_limit=time_limit,
        )
    _, local_url, _ = demo.launch(prevent_thread_lock=True)
    api = f"{local_url.rstrip('/')}{API_PREFIX}"
    try:
        with httpx2.Client(timeout=10) as http:

            def join(session_hash):
                return http.post(
                    f"{api}/queue/join",
                    json={"data": [None], "fn_index": 0, "session_hash": session_hash},
                ).json()["event_id"]

            stream_queue = demo._queue.event_queue_per_concurrency_id

            def wait_for_streams(count):
                deadline = time.monotonic() + 5
                group = stream_queue[demo.fns[0].concurrency_id]
                while group.current_concurrency != count:
                    if time.monotonic() > deadline:
                        pytest.fail(f"Expected {count} running streams")
                    time.sleep(0.05)

            # A stream that already ran gives the queue a processing time for
            # the function, which must not be taken as the time a stream holds
            # its slot
            http.post(f"{api}/stream/{join('earlier')}/close")
            wait_for_streams(0)

            join("first")
            wait_for_streams(1)
            join("second")
            join("third")

            etas = {}
            for session_hash in ("second", "third"):
                with http.stream(
                    "GET", f"{api}/queue/data", params={"session_hash": session_hash}
                ) as messages:
                    for line in messages.iter_lines():
                        if line.startswith("data:"):
                            message = json.loads(line[5:])
                            if message.get("msg") == "estimation":
                                etas[session_hash] = message["rank_eta"]
                                break
        if time_limit is None:
            # A stream without a time limit can hold its slot for any time
            assert etas == {"second": None, "third": None}
        else:
            # The first stream frees its slot within its time limit, and each
            # stream ahead in line can then hold it for a full time limit
            # (plus the few milliseconds the first call of a stream takes)
            assert 8 < etas["second"] <= 10.5
            assert 18 < etas["third"] <= 20.5
    finally:
        demo.close()


def test_streams_waiting_for_chunks_do_not_block_other_events():
    with gr.Blocks() as demo:
        audio = gr.Audio(sources=["microphone"], streaming=True)
        heard = gr.Textbox()
        audio.stream(lambda x: "chunk", audio, heard, concurrency_limit=None)
        button = gr.Button()
        clicked = gr.Textbox()
        button.click(lambda: "clicked", None, clicked)
    _, local_url, _ = demo.launch(prevent_thread_lock=True, max_threads=2)
    api = f"{local_url.rstrip('/')}{API_PREFIX}"
    client = grc.Client(local_url)
    stream_queue = demo._queue.event_queue_per_concurrency_id
    try:
        with httpx2.Client(timeout=10) as http:
            event_ids = {}
            for session_hash in ("a", "b"):
                response = http.post(
                    f"{api}/queue/join",
                    json={"data": [None], "fn_index": 0, "session_hash": session_hash},
                )
                event_ids[session_hash] = response.json()["event_id"]
            deadline = time.monotonic() + 5
            while stream_queue[demo.fns[0].concurrency_id].current_concurrency < 2:
                if time.monotonic() > deadline:
                    pytest.fail("The streams did not start")
                time.sleep(0.05)

            # Both streams now wait for their next chunk. Before a waiting
            # stream gave its worker slot back, they held both slots and the
            # click never ran.
            assert client.submit(fn_index=1).result(timeout=5) == "clicked"

            # A stream that gets a chunk takes a slot again and keeps going
            http.post(
                f"{api}/stream/{event_ids['a']}",
                json={"data": [None], "fn_index": 0, "session_hash": "a"},
            )
            streamed = 0
            with http.stream(
                "GET", f"{api}/queue/data", params={"session_hash": "a"}
            ) as messages:
                for line in messages.iter_lines():
                    if not line.startswith("data:"):
                        continue
                    message = json.loads(line[5:])
                    if message.get("msg") == "process_streaming":
                        assert message["output"]["data"] == ["chunk"]
                        streamed += 1
                        if streamed == 2:
                            break
            assert demo._queue.get_active_worker_count() == 0
    finally:
        client.close()
        demo.close()


def _launch_audio_stream(fn, concurrency_limit=1):
    with gr.Blocks() as demo:
        audio = gr.Audio(sources=["microphone"], streaming=True)
        heard = gr.Textbox()
        audio.stream(fn, audio, heard, concurrency_limit=concurrency_limit)
    _, local_url, _ = demo.launch(prevent_thread_lock=True)

    def group():
        return demo._queue.event_queue_per_concurrency_id[demo.fns[0].concurrency_id]

    return demo, f"{local_url.rstrip('/')}{API_PREFIX}", group


def _wait_for(condition, timeout=5.0, message="Timed out"):
    deadline = time.monotonic() + timeout
    while not condition():
        if time.monotonic() > deadline:
            pytest.fail(message)
        time.sleep(0.05)


def _join(http, api, session_hash):
    return http.post(
        f"{api}/queue/join",
        json={"data": [None], "fn_index": 0, "session_hash": session_hash},
    ).json()["event_id"]


@pytest.mark.asyncio
async def test_waking_a_stream_leaves_no_timer_behind():
    event = type("E", (), {})()
    event.signal = asyncio.Event()
    event.signal.set()
    assert await queueing.Queue.wait_for_event_or_timeout(event, 60) == "signal"
    await asyncio.sleep(0)
    # A stream woken many times a second must not leave a sleeping task each time
    timers = [t for t in asyncio.all_tasks() if "Queue.timeout" in repr(t)]
    assert timers == []


def test_a_stream_event_dropped_by_its_session_frees_its_slot():
    demo, api, group = _launch_audio_stream(lambda x: "chunk")
    try:
        with httpx2.Client(timeout=10) as http:
            event_id = _join(http, api, "s")
            _wait_for(lambda: group().current_concurrency == 1)
            # The page acknowledges the event away, as a reload does for a
            # stream it cannot continue
            http.post(f"{api}/reset", json={"event_id": event_id})
            _wait_for(
                lambda: group().current_concurrency == 0,
                timeout=3,
                message="The dropped stream kept its slot",
            )
    finally:
        demo.close()


def test_stream_chunks_keep_the_event_id():
    from gradio.context import LocalContext

    seen = []

    async def record(x):
        seen.append(LocalContext.event_id.get(None))
        return "chunk"

    demo, api, group = _launch_audio_stream(record)
    try:
        with httpx2.Client(timeout=10) as http:
            event_id = _join(http, api, "s")
            _wait_for(lambda: len(seen) == 1)
            # A chunk as the browser sends it, without the event id
            http.post(
                f"{api}/stream/{event_id}",
                json={"data": [None], "fn_index": 0, "session_hash": "s"},
            )
            _wait_for(lambda: len(seen) == 2)
            # gr.Info, progress and the like rely on it in every call
            assert seen == [event_id, event_id]
    finally:
        demo.close()


def test_leaving_the_line_completes_the_event_for_the_client():
    demo, api, group = _launch_audio_stream(lambda x: "chunk")
    try:
        with httpx2.Client(timeout=10) as http:
            _join(http, api, "a")
            _wait_for(lambda: group().current_concurrency == 1)
            waiting = _join(http, api, "b")
            _wait_for(lambda: len(group().queue) == 1)
            http.post(f"{api}/stream/{waiting}/close")
            assert not group().queue
            # The client hears that the event is over, so it stops treating it
            # as running
            completed = False
            with http.stream(
                "GET", f"{api}/queue/data", params={"session_hash": "b"}
            ) as messages:
                for line in messages.iter_lines():
                    if line.startswith("data:"):
                        message = json.loads(line[5:])
                        if message.get("msg") == "process_completed":
                            completed = message.get("event_id") == waiting
                            break
            assert completed
    finally:
        demo.close()


def test_a_stream_dropped_while_waiting_for_a_worker_does_not_run_again():
    calls = []

    def record(x):
        calls.append(time.monotonic())
        return "chunk"

    with gr.Blocks() as demo:
        audio = gr.Audio(sources=["microphone"], streaming=True)
        heard = gr.Textbox()
        audio.stream(record, audio, heard)
        gr.Button().click(lambda: time.sleep(2), None, None)
    _, local_url, _ = demo.launch(prevent_thread_lock=True, max_threads=1)
    api = f"{local_url.rstrip('/')}{API_PREFIX}"
    try:
        with httpx2.Client(timeout=10) as http:
            event_id = _join(http, api, "s")
            _wait_for(lambda: len(calls) == 1)
            # A long job takes the only worker slot while the stream waits
            http.post(
                f"{api}/queue/join",
                json={"data": [], "fn_index": 1, "session_hash": "busy"},
            )
            _wait_for(lambda: demo._queue.get_active_worker_count() == 1)
            # The next chunk wakes the stream, which waits for the slot...
            http.post(
                f"{api}/stream/{event_id}",
                json={"data": [None], "fn_index": 0, "session_hash": "s"},
            )
            time.sleep(0.2)
            # ...and its session drops it meanwhile (e.g. a reload)
            http.post(f"{api}/reset", json={"event_id": event_id})
            time.sleep(2.5)
            assert len(calls) == 1
    finally:
        demo.close()
