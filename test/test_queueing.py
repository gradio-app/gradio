import asyncio
import time
from concurrent.futures import wait

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

    def test_concurrency_limits(self, connect):
        with gr.Blocks() as demo:
            a = gr.Number()
            b = gr.Number()
            output = gr.Number()

            add_btn = gr.Button("Add")

            @add_btn.click(inputs=[a, b], outputs=output, concurrency_limit=2)
            def add(x, y):
                time.sleep(2)
                return x + y

            sub_btn = gr.Button("Subtract")

            @sub_btn.click(inputs=[a, b], outputs=output, concurrency_limit=None)
            def sub(x, y):
                time.sleep(2)
                return x - y

            mul_btn = gr.Button("Multiply")

            @mul_btn.click(
                inputs=[a, b],
                outputs=output,
                concurrency_limit=2,
                concurrency_id="muldiv",
            )
            def mul(x, y):
                time.sleep(2)
                return x * y

            div_btn = gr.Button("Divide")

            @div_btn.click(
                inputs=[a, b],
                outputs=output,
                concurrency_limit=2,
                concurrency_id="muldiv",
            )
            def div(x, y):
                time.sleep(2)
                return x / y

        with connect(demo) as client:
            add_job_1 = client.submit(1, 1, fn_index=0)
            add_job_2 = client.submit(1, 1, fn_index=0)
            add_job_3 = client.submit(1, 1, fn_index=0)
            sub_job_1 = client.submit(1, 1, fn_index=1)
            sub_job_2 = client.submit(1, 1, fn_index=1)
            sub_job_3 = client.submit(1, 1, fn_index=1)
            mul_job_1 = client.submit(1, 1, fn_index=2)
            div_job_1 = client.submit(1, 1, fn_index=3)
            mul_job_2 = client.submit(1, 1, fn_index=2)

            time.sleep(2)

            add_job_statuses = [
                add_job_1.status(),
                add_job_2.status(),
                add_job_3.status(),
            ]
            assert sorted([s.code.value for s in add_job_statuses]) == [
                "IN_QUEUE",
                "PROCESSING",
                "PROCESSING",
            ]

            sub_job_statuses = [
                sub_job_1.status(),
                sub_job_2.status(),
                sub_job_3.status(),
            ]
            assert [s.code.value for s in sub_job_statuses] == [
                "PROCESSING",
                "PROCESSING",
                "PROCESSING",
            ]

            muldiv_job_statuses = [
                mul_job_1.status(),
                div_job_1.status(),
                mul_job_2.status(),
            ]
            assert sorted([s.code.value for s in muldiv_job_statuses]) == [
                "IN_QUEUE",
                "PROCESSING",
                "PROCESSING",
            ]
            wait(
                [
                    add_job_1,
                    add_job_2,
                    add_job_3,
                    sub_job_1,
                    sub_job_2,
                    sub_job_3,
                    sub_job_3,
                    mul_job_1,
                    div_job_1,
                    mul_job_2,
                ]
            )

    @staticmethod
    async def async_generator():
        for i in range(10):
            yield i
            await asyncio.sleep(0.1)

    def test_reset_iterators(self, connect):
        with gr.Blocks() as demo:
            name = gr.Textbox()
            output = gr.Textbox()

            def greet(x):
                return f"Hello, {x}!"

            name.submit(greet, name, output)

        app, local_url, _ = demo.launch(prevent_thread_lock=True)
        test_client = TestClient(app)

        event_id = "test_event"
        demo.server_app.iterators[event_id] = self.async_generator()
        assert event_id in demo.server_app.iterators

        response = test_client.post(
            f"{API_PREFIX}/cancel",
            json={"event_id": event_id, "session_hash": "session_1", "fn_index": 0},
        )

        assert response.status_code == 200
        assert event_id not in demo.server_app.iterators

    def test_reset_iterators_no_event(self, connect):
        with gr.Blocks() as demo:
            name = gr.Textbox()
            output = gr.Textbox()

            def greet(x):
                return f"Hello, {x}!"

            name.submit(greet, name, output)

        app, local_url, _ = demo.launch(prevent_thread_lock=True)
        test_client = TestClient(app)

        event_id = "nonexistent_event"
        response = test_client.post(
            f"{API_PREFIX}/cancel",
            json={"event_id": event_id, "session_hash": "session_1", "fn_index": 0},
        )

        assert response.status_code == 404

    def test_cancel_event(self, connect):
        with gr.Blocks() as demo:
            a = gr.Number()
            b = gr.Number()
            output = gr.Number()

            add_btn = gr.Button("Add")

            @add_btn.click(inputs=[a, b], outputs=output)
            def add(x, y):
                time.sleep(2)
                return x + y

        app, local_url, _ = demo.launch(prevent_thread_lock=True)
        test_client = TestClient(app)

        event_id = "test_event"
        session_hash = "session_123"
        fn_index = 0

        demo.server_app.iterators[event_id] = self.async_generator()
        assert event_id in demo.server_app.iterators

        response = test_client.post(
            f"{API_PREFIX}/cancel",
            json={
                "session_hash": session_hash,
                "fn_index": fn_index,
                "event_id": event_id,
            },
        )

        assert response.status_code == 200
        assert response.json() == {"success": True}
        assert event_id not in demo.server_app.iterators
        assert event_id in demo.server_app.iterators_to_reset
