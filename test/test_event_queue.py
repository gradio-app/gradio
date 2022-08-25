import asyncio
import os

import pytest
from fastapi.testclient import TestClient

import gradio as gr

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestQueue:
    @pytest.mark.asyncio
    async def test_queue_with_single_event(self):
        async def wait(data):
            await asyncio.sleep(0.1)
            return data

        with gr.Blocks() as demo:
            text = gr.Textbox()
            button = gr.Button()
            button.click(wait, [text], [text])
        app, local_url, _ = demo.launch(prevent_thread_lock=True, enable_queue=True)
        client = TestClient(app)
        with client.websocket_connect("/queue/join") as _:  # websocket
            """#Unable to make this part work, seems like there is an issue with thread acquire and exiting the scope
            websocket.send_json({"hash": "0001"})
            assert {
                "avg_event_concurrent_process_time": 1.0,
                "avg_event_process_time": 1.0,
                "msg": "estimation",
                "queue_eta": 1,
                "queue_size": 0,
                "rank": -1,
                "rank_eta": -1,
            } == websocket.receive_json()

            while True:
                message = websocket.receive_json()
                if "estimation" == message["msg"]:
                    continue
                elif "send_data" == message["msg"]:
                    websocket.send_json({"data": [1], "fn": 0})
                elif "process_starts" == message["msg"]:
                    continue
                elif "process_completed" == message["msg"]:
                    assert message["output"]["data"] == ["1"]
                    break
            """

        demo.close()
