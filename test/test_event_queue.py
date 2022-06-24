import asyncio
import time
import unittest.mock as mock

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket
from httpx import AsyncClient
from websocket import create_connection

import gradio as gr
import gradio.event_queue
import gradio.event_queue as event_queue
from gradio.routes import PredictBody

"""
class TestQueue:
    @pytest.mark.asyncio
    async def test_queue_with_several_events(self):
        async def wait():
            await asyncio.sleep(0.1)
            return True

        with gr.Blocks() as demo:
            text = gr.Textbox()
            button = gr.Button()
            button.click(wait, [text], [text])
        app, local_url, _ = demo.launch(prevent_thread_lock=True, enable_queue=True)
        client = TestClient(app)
        with client.websocket_connect("/queue/join") as websocket:
            websocket.send_json({"hash": "0001"})
            # Don't know why but websocket cannot receive any data and waits forever
            assert {"msg": "joined_queue"} == websocket.receive_json()
        demo.close()
"""
