"""Contains tests for networking.py and app.py"""

import os
import unittest

from gradio import queueing
from gradio.routes import QueuePushBody

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestQueuingOpenClose(unittest.TestCase):
    def test_init(self):
        queueing.init()
        self.assertTrue(os.path.exists(queueing.DB_FILE))
        os.remove(queueing.DB_FILE)

    def test_close(self):
        queueing.close()
        self.assertFalse(os.path.exists(queueing.DB_FILE))


class TestQueuingActions(unittest.TestCase):
    def setUp(self):
        queueing.init()

    def test_hashing(self):
        hash1 = queueing.generate_hash()
        hash2 = queueing.generate_hash()
        self.assertNotEquals(hash1, hash2)
        queueing.close()

    def test_push_pop_status(self):
        request = QueuePushBody(data="test1", action="predict")
        hash1, position = queueing.push(request)
        self.assertEquals(position, 0)
        request = QueuePushBody(data="test2", action="predict")
        hash2, position = queueing.push(request)
        self.assertEquals(position, 1)
        status, position = queueing.get_status(hash2)
        self.assertEquals(status, "QUEUED")
        self.assertEquals(position, 1)
        _, hash_popped, input_data, action = queueing.pop()
        self.assertEquals(hash_popped, hash1)
        self.assertEquals(input_data, {"data": "test1"})
        self.assertEquals(action, "predict")

    def test_jobs(self):
        request = QueuePushBody(data="test1", action="predict")
        hash1, _ = queueing.push(request)
        hash2, position = queueing.push(request)
        self.assertEquals(position, 1)

        queueing.start_job(hash1)
        _, position = queueing.get_status(hash2)
        self.assertEquals(position, 1)
        queueing.pass_job(hash1, {"data": "result"})
        _, position = queueing.get_status(hash2)
        self.assertEquals(position, 0)

        queueing.start_job(hash2)
        queueing.fail_job(hash2, "failure")
        status, _ = queueing.get_status(hash2)
        self.assertEquals(status, "FAILED")

    def tearDown(self):
        queueing.close()


if __name__ == "__main__":
    unittest.main()
