import json
import os
import time
from datetime import datetime, timedelta
from queue import LifoQueue
from unittest.mock import patch

import pytest
from gradio_client import Client
from gradio_client.utils import Status, StatusUpdate

os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"


class TestPredictionsFromSpaces:
    @pytest.mark.flaky
    def test_numerical_to_label_space(self):
        client = Client(space="abidlabs/titanic-survival")
        output = client.predict("male", 77, 10).result()
        assert json.load(open(output))["label"] == "Perishes"

    @pytest.mark.flaky
    def test_private_space(self):
        hf_token = "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"  # Intentionally revealing this key for testing purposes
        client = Client(
            space="gradio-tests/not-actually-private-space", hf_token=hf_token
        )
        output = client.predict("abc").result()
        assert output == "abc"

    @pytest.mark.flaky
    def test_job_status(self):
        statuses = []
        client = Client(space="gradio/calculator")
        job = client.predict(5, "add", 4)
        while not job.done():
            time.sleep(0.1)
            statuses.append(job.status())

        assert statuses
        # Messages are sorted by time
        assert sorted([s.time for s in statuses if s]) == [
            s.time for s in statuses if s
        ]
        assert sorted([s.status for s in statuses if s]) == [
            s.status for s in statuses if s
        ]

    @pytest.mark.flaky
    def test_job_status_queue_disabled(self):
        statuses = []
        client = Client(space="freddyaboulton/sentiment-classification")
        job = client.predict("I love the gradio python client")
        while not job.done():
            time.sleep(0.02)
            statuses.append(job.status())
        statuses.append(job.status())
        assert all(s.status in [Status.ITERATING, Status.FINISHED] for s in statuses)


class TestStatusUpdates:
    @patch("gradio_client.client.Endpoint.make_end_to_end_fn")
    def test_put_updates_in_queue(self, mock_make_end_to_end_fn):

        now = datetime.now()

        messages = [
            StatusUpdate(
                code=Status.STARTING,
                rank=None,
                success=None,
                queue_size=None,
                time=now,
            ),
            StatusUpdate(
                code=Status.SENDING_DATA,
                rank=None,
                success=None,
                queue_size=None,
                time=now + timedelta(seconds=1),
            ),
            StatusUpdate(
                code=Status.IN_QUEUE,
                rank=2,
                queue_size=2,
                success=None,
                time=now + timedelta(seconds=2),
            ),
            StatusUpdate(
                code=Status.IN_QUEUE,
                rank=1,
                queue_size=1,
                success=None,
                time=now + timedelta(seconds=3),
            ),
            StatusUpdate(
                code=Status.ITERATING,
                rank=None,
                queue_size=None,
                success=None,
                time=now + timedelta(seconds=3),
            ),
            StatusUpdate(
                code=Status.FINISHED,
                rank=None,
                queue_size=None,
                success=True,
                time=now + timedelta(seconds=4),
            ),
        ]

        class MockEndToEndFunction:
            def __init__(self, queue: LifoQueue):
                self.queue = queue

            def __call__(self, *args, **kwargs):
                for m in messages:
                    self.queue.put_nowait(m)
                    time.sleep(0.1)

        mock_make_end_to_end_fn.side_effect = MockEndToEndFunction

        client = Client(space="gradio/calculator")
        job = client.predict(5, "add", 6, fn_index=0)

        statuses = []
        while not job.done():
            statuses.append(job.status())
            time.sleep(0.09)

        assert all(s in messages for s in statuses)
