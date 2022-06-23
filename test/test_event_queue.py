import asyncio
import pytest
import pytest_asyncio
import time

import gradio as gr
import gradio.event_queue as event_queue
from gradio.routes import PredictBody

from httpx import AsyncClient
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket
from websocket import create_connection

import unittest.mock as mock


@pytest_asyncio.fixture(scope="function", autouse=True)
async def client():
    """
    A fixture to mock the async client object.
    """
    async with AsyncClient() as mock_client:
        with mock.patch("gradio.utils.client", mock_client):
            yield


class TestQueue:

    @pytest.mark.asyncio
    async def test_queue_with_several_events(self):
        async def wait():
            await asyncio.sleep(1)
            return True

        with gr.Blocks() as demo:
            text = gr.Textbox()
            button = gr.Button()
            button.click(wait, [text], [text])
        app, local_url, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)
        with client.websocket_connect("/queue/join") as websocket:
            websocket.send_json({"hash": "0001"})
            assert {"message": "joined_queue"} == websocket.receive_json()
