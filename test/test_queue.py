import os
import pytest

from gradio.queue import Queue

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

@pytest.fixture()
def queue() -> Queue:
    queue_object = Queue(live_updates=True, concurrency_count=1, data_gathering_start=1, update_intervals=1, max_size=None)
    yield queue_object
    queue_object.close()


class TestQueue():
    @pytest.mark.asyncio
    async def test_start(self, queue):
        await queue.start()
        assert queue.get_active_worker_count() == 0
        