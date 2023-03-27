import json

import pytest

from gradio_client import Client
import time


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
        assert sorted([s.time for s in statuses if s]) == [s.time for s in statuses if s]
        assert sorted([s.status for s in statuses if s]) == [s.status for s in statuses if s]