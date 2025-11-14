import time

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
