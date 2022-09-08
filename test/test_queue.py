import os
from unittest.mock import MagicMock
import pytest

from gradio.queue import Queue, Event

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

@pytest.fixture()
def queue() -> Queue:
    queue_object = Queue(live_updates=True, concurrency_count=1, data_gathering_start=1, update_intervals=1, max_size=None)
    yield queue_object
    queue_object.close()

@pytest.fixture()
def mock_event() -> Event:
    websocket = MagicMock()
    event = Event(websocket=websocket)
    yield event
    

class TestQueue():
    @pytest.mark.asyncio
    async def test_start(self, queue: Queue):
        await queue.start()
        assert queue.stopped is False
        assert queue.get_active_worker_count() == 0

    @pytest.mark.asyncio
    async def test_stop_resume(self, queue: Queue):
        await queue.start()
        queue.close()
        assert queue.stopped
        queue.resume()
        assert queue.stopped is False

    @pytest.mark.asyncio
    async def test_receive(self, queue: Queue, mock_event: Event):
        await queue.get_message(mock_event)
        assert mock_event.websocket.receive_json.called
