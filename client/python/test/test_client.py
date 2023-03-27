import json

import pytest

from gradio_client import Client


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
