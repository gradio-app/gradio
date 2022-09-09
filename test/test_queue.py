import os
from unittest import mock
from unittest.mock import MagicMock

import pytest

from gradio.queue import Event, Queue

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class AsyncMock(MagicMock):
    async def __call__(self, *args, **kwargs):
        return super(AsyncMock, self).__call__(*args, **kwargs)


@pytest.fixture()
def queue() -> Queue:
    queue_object = Queue(
        live_updates=True,
        concurrency_count=1,
        data_gathering_start=1,
        update_intervals=1,
        max_size=None,
    )
    yield queue_object
    queue_object.close()


@pytest.fixture()
def mock_event() -> Event:
    websocket = MagicMock()
    event = Event(websocket=websocket)
    yield event


class TestQueueMethods:
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

    @pytest.mark.asyncio
    async def test_send(self, queue: Queue, mock_event: Event):
        await queue.send_message(mock_event, {})
        assert mock_event.websocket.send_json.called

    @pytest.mark.asyncio
    async def test_add_to_queue(self, queue: Queue, mock_event: Event):
        queue.push(mock_event)
        assert len(queue.event_queue) == 1

    @pytest.mark.asyncio
    async def test_add_to_queue_with_max_size(self, queue: Queue, mock_event: Event):
        queue.max_size = 1
        queue.push(mock_event)
        assert len(queue.event_queue) == 1
        queue.push(mock_event)
        assert len(queue.event_queue) == 1

    @pytest.mark.asyncio
    async def test_clean_event(self, queue: Queue, mock_event: Event):
        queue.push(mock_event)
        await queue.clean_event(mock_event)
        assert len(queue.event_queue) == 0

    @pytest.mark.asyncio
    async def test_gather_event_data(self, queue: Queue, mock_event: Event):
        queue.send_message = AsyncMock()
        queue.get_message = AsyncMock()
        queue.send_message.return_value = True
        queue.get_message.return_value = {"data": ["test"], "fn": 0}
        
        assert await queue.gather_event_data(mock_event)
        assert queue.send_message.called
        assert mock_event.data == {"data": ["test"], "fn": 0}
        
        queue.send_message.called = False
        assert await queue.gather_event_data(mock_event)
        assert not(queue.send_message.called)
        
    @pytest.mark.asyncio
    async def test_gather_data_for_first_ranks(self, queue: Queue, mock_event: Event):
        websocket = MagicMock()
        mock_event2 = Event(websocket=websocket)
        queue.send_message = AsyncMock()
        queue.get_message = AsyncMock()
        queue.send_message.return_value = True
        queue.get_message.return_value = {"data": ["test"], "fn": 0}
        
        queue.push(mock_event)
        queue.push(mock_event2)
        await queue.gather_data_for_first_ranks()
        assert mock_event.data is not None
        assert mock_event2.data is None
    
# class TestQueueEstimation:
#     # get_estimation, update_estimation, send_estimation, broadcast_estimations
    
# class TestQueueProcessEvents:
#     # call_prediction, process_event
    
# class TestQueueWebsocketCommunication:
#     # 