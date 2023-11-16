import time

import gradio_client as grc
import pytest
from fastapi.testclient import TestClient

import gradio as gr


class TestQueueing:
    def test_single_request(self, connect):
        with gr.Blocks() as demo:
            name = gr.Textbox()
            output = gr.Textbox()

            def greet(x):
                return f"Hello, {x}!"

            name.submit(greet, name, output)

        demo.launch(prevent_thread_lock=True)

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
            queue_status = test_client.get("/queue/status").json()
            queue_size = queue_status["queue_size"]
            if len(sizes) == 0 or queue_size != sizes[-1]:
                sizes.append(queue_size)
            time.sleep(0.01)

        time.sleep(0.1)
        queue_status = test_client.get("/queue/status").json()
        queue_size = queue_status["queue_size"]
        if queue_size != sizes[-1]:
            sizes.append(queue_size)

        assert max(sizes) in [
            2,
            3,
            4,
        ]  # Can be 2 - 4, depending on if the workers have picked up jobs before the queue status is checked

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
                time.sleep(2)
                return x + y

        demo.queue(default_concurrency_limit=default_concurrency_limit)
        _, local_url, _ = demo.launch(
            prevent_thread_lock=True,
        )
        client = grc.Client(local_url)

        add_job_1 = client.submit(1, 1, fn_index=0)
        add_job_2 = client.submit(1, 1, fn_index=0)
        add_job_3 = client.submit(1, 1, fn_index=0)

        time.sleep(1)

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
            sub_job_3 = client.submit(1, 1, fn_index=1)
            mul_job_1 = client.submit(1, 1, fn_index=2)
            div_job_1 = client.submit(1, 1, fn_index=3)
            mul_job_2 = client.submit(1, 1, fn_index=2)

            time.sleep(1)

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

    def test_every_does_not_block_queue(self):
        with gr.Blocks() as demo:
            num = gr.Number(value=0)
            num2 = gr.Number(value=0)
            num.submit(lambda n: 2 * n, num, num, every=0.5)
            num2.submit(lambda n: 3 * n, num, num)

        app, local_url, _ = demo.queue(max_size=1).launch(prevent_thread_lock=True)
        test_client = TestClient(app)

        client = grc.Client(local_url)
        job = client.submit(1, fn_index=1)

        for _ in range(5):
            status = test_client.get("/queue/status").json()
            assert status["queue_size"] == 0
            time.sleep(0.5)

        assert job.result() == 3
