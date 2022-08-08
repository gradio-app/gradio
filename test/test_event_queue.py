import asyncio

import pytest
from fastapi.testclient import TestClient
from websocket import create_connection

import gradio as gr


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
        with client.websocket_connect("/queue/join") as websocket:
            assert {
                "msg": "estimation",
                "queue_size": 0,
                "avg_event_concurrent_process_time": 1.0,
                "avg_event_process_time": 1.0,
                "queue_eta": 1,
                "rank": -1,
                "rank_eta": -1,
            } == websocket.receive_json()
            websocket.send_json({"hash": "0001"})
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
        demo.close()
