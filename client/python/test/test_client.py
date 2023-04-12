import json
import os
import pathlib
import tempfile
import time
from concurrent.futures import CancelledError, TimeoutError
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

from gradio_client import Client
from gradio_client.serializing import SimpleSerializable
from gradio_client.utils import Communicator, Status, StatusUpdate

os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"

HF_TOKEN = "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"  # Intentionally revealing this key for testing purposes


class TestPredictionsFromSpaces:
    @pytest.mark.flaky
    def test_raise_error_invalid_state(self):
        with pytest.raises(ValueError, match="invalid state"):
            Client("gradio-tests/paused-space")

    @pytest.mark.flaky
    def test_numerical_to_label_space(self):
        client = Client("gradio-tests/titanic-survival")
        output = client.predict("male", 77, 10, api_name="/predict")
        assert json.load(open(output))["label"] == "Perishes"
        with pytest.raises(
            ValueError,
            match="This Gradio app might have multiple endpoints. Please specify an `api_name` or `fn_index`",
        ):
            client.predict("male", 77, 10)
        with pytest.raises(
            ValueError,
            match="Cannot find a function with `api_name`: predict. Did you mean to use a leading slash?",
        ):
            client.predict("male", 77, 10, api_name="predict")

    @pytest.mark.flaky
    def test_private_space(self):
        client = Client("gradio-tests/not-actually-private-space", hf_token=HF_TOKEN)
        output = client.predict("abc", api_name="/predict")
        assert output == "abc"

    @pytest.mark.flaky
    def test_state(self):
        client = Client("gradio-tests/increment")
        output = client.predict(api_name="/increment_without_queue")
        assert output == 1
        output = client.predict(api_name="/increment_without_queue")
        assert output == 2
        output = client.predict(api_name="/increment_without_queue")
        assert output == 3
        client.reset_session()
        output = client.predict(api_name="/increment_without_queue")
        assert output == 1
        output = client.predict(api_name="/increment_with_queue")
        assert output == 2
        client.reset_session()
        output = client.predict(api_name="/increment_with_queue")
        assert output == 1
        output = client.predict(api_name="/increment_with_queue")
        assert output == 2

    @pytest.mark.flaky
    def test_job_status(self):
        statuses = []
        client = Client(src="gradio/calculator")
        job = client.submit(5, "add", 4)
        while not job.done():
            time.sleep(0.1)
            statuses.append(job.status())

        assert statuses
        # Messages are sorted by time
        assert sorted([s.time for s in statuses if s]) == [
            s.time for s in statuses if s
        ]
        assert sorted([s.code for s in statuses if s]) == [
            s.code for s in statuses if s
        ]

    @pytest.mark.flaky
    def test_job_status_queue_disabled(self):
        statuses = []
        client = Client(src="freddyaboulton/sentiment-classification")
        job = client.submit("I love the gradio python client", api_name="/classify")
        while not job.done():
            time.sleep(0.02)
            statuses.append(job.status())
        statuses.append(job.status())
        assert all(s.code in [Status.PROCESSING, Status.FINISHED] for s in statuses)

    @pytest.mark.flaky
    def test_intermediate_outputs(
        self,
    ):
        client = Client(src="gradio/count_generator")
        job = client.submit(3, api_name="/count")

        while not job.done():
            time.sleep(0.1)

        assert job.outputs() == [str(i) for i in range(3)]

        outputs = []
        for o in client.submit(3, api_name="/count"):
            outputs.append(o)
        assert outputs == [str(i) for i in range(3)]

    @pytest.mark.flaky
    def test_break_in_loop_if_error(self):
        calculator = Client(src="gradio/calculator")
        job = calculator.submit("foo", "add", 4, fn_index=0)
        output = [o for o in job]
        assert output == []

    @pytest.mark.flaky
    def test_timeout(self):
        with pytest.raises(TimeoutError):
            client = Client(src="gradio/count_generator")
            job = client.submit(api_name="/sleep")
            job.result(timeout=0.05)

    @pytest.mark.flaky
    def test_timeout_no_queue(self):
        with pytest.raises(TimeoutError):
            client = Client(src="freddyaboulton/sentiment-classification")
            job = client.submit(api_name="/sleep")
            job.result(timeout=0.1)

    @pytest.mark.flaky
    def test_raises_exception(self):
        with pytest.raises(Exception):
            client = Client(src="freddyaboulton/calculator")
            job = client.submit("foo", "add", 9, fn_index=0)
            job.result()

    @pytest.mark.flaky
    def test_raises_exception_no_queue(self):
        with pytest.raises(Exception):
            client = Client(src="freddyaboulton/sentiment-classification")
            job = client.submit([5], api_name="/sleep")
            job.result()

    def test_job_output_video(self):
        client = Client(src="gradio/video_component")
        job = client.submit(
            "https://huggingface.co/spaces/gradio/video_component/resolve/main/files/a.mp4",
            fn_index=0,
        )
        assert pathlib.Path(job.result()).exists()

    @pytest.mark.flaky
    def test_cancel_from_client_queued(self):
        client = Client(src="gradio-tests/test-cancel-from-client")
        start = time.time()
        job = client.submit(api_name="/long")
        while not job.done():
            if job.status().code == Status.STARTING:
                job.cancel()
                break
        with pytest.raises(CancelledError):
            job.result()
        # The whole prediction takes 10 seconds to run
        # and does not iterate. So this tests that we can cancel
        # halfway through a prediction
        assert time.time() - start < 10
        assert job.status().code == Status.CANCELLED

        job = client.submit(api_name="/iterate")
        iteration_count = 0
        while not job.done():
            if job.status().code == Status.ITERATING:
                iteration_count += 1
                if iteration_count == 3:
                    job.cancel()
                    break
                time.sleep(0.5)
        # Result for iterative jobs is always the first result
        assert job.result() == 0
        # The whole prediction takes 10 seconds to run
        # and does not iterate. So this tests that we can cancel
        # halfway through a prediction
        assert time.time() - start < 10

        # Test that we did not iterate all the way to the end
        assert all(o in [0, 1, 2, 3, 4, 5] for o in job.outputs())
        assert job.status().code == Status.CANCELLED

    @pytest.mark.flaky
    def test_cancel_subsequent_jobs_state_reset(self):
        client = Client("abidlabs/test-yield")
        job1 = client.submit("abcdefefadsadfs")
        time.sleep(5)
        job1.cancel()

        assert len(job1.outputs()) < len("abcdefefadsadfs")
        assert job1.status().code == Status.CANCELLED

        job2 = client.submit("abcd")
        while not job2.done():
            time.sleep(0.1)
        # Ran all iterations from scratch
        assert job2.status().code == Status.FINISHED
        assert len(job2.outputs()) == 5

    def test_upload_file_private_space(self):

        client = Client(
            src="gradio-tests/not-actually-private-file-upload", hf_token=HF_TOKEN
        )

        with patch.object(
            client.endpoints[0], "_upload", wraps=client.endpoints[0]._upload
        ) as upload:
            with tempfile.NamedTemporaryFile(mode="w", delete=False) as f:
                f.write("Hello from private space!")

            output = client.submit(1, "foo", f.name, api_name="/file_upload").result()
            assert open(output).read() == "Hello from private space!"
            upload.assert_called_once()

        with patch.object(
            client.endpoints[1], "_upload", wraps=client.endpoints[0]._upload
        ) as upload:
            with tempfile.NamedTemporaryFile(mode="w", delete=False) as f:
                f.write("Hello from private space!")

            output = client.submit(f.name, api_name="/upload_btn").result()
            open(output).read() == "Hello from private space!"
            upload.assert_called_once()

        with patch.object(
            client.endpoints[2], "_upload", wraps=client.endpoints[0]._upload
        ) as upload:
            with tempfile.NamedTemporaryFile(mode="w", delete=False) as f1:
                with tempfile.NamedTemporaryFile(mode="w", delete=False) as f2:

                    f1.write("File1")
                    f2.write("File2")

            output = client.submit(
                3, [f1.name, f2.name], "hello", api_name="/upload_multiple"
            ).result()
            assert open(output[0]).read() == "File1"
            assert open(output[1]).read() == "File2"
            upload.assert_called_once()

    def test_upload_file_upload_route_does_not_exist(self):
        client = Client(
            src="gradio-tests/not-actually-private-file-upload-old-version",
            hf_token=HF_TOKEN,
        )

        with patch.object(
            client.endpoints[0], "serialize", wraps=client.endpoints[0].serialize
        ) as serialize:
            with tempfile.NamedTemporaryFile(mode="w", delete=False) as f:
                f.write("Hello from private space!")

                output = client.submit(1, "foo", f.name, fn_index=0).result()
                open(output).read() == "Hello from private space!"
                serialize.assert_called_once_with(1, "foo", f.name)


class TestStatusUpdates:
    @patch("gradio_client.client.Endpoint.make_end_to_end_fn")
    def test_messages_passed_correctly(self, mock_make_end_to_end_fn):

        now = datetime.now()

        messages = [
            StatusUpdate(
                code=Status.STARTING,
                eta=None,
                rank=None,
                success=None,
                queue_size=None,
                time=now,
            ),
            StatusUpdate(
                code=Status.SENDING_DATA,
                eta=None,
                rank=None,
                success=None,
                queue_size=None,
                time=now + timedelta(seconds=1),
            ),
            StatusUpdate(
                code=Status.IN_QUEUE,
                eta=3,
                rank=2,
                queue_size=2,
                success=None,
                time=now + timedelta(seconds=2),
            ),
            StatusUpdate(
                code=Status.IN_QUEUE,
                eta=2,
                rank=1,
                queue_size=1,
                success=None,
                time=now + timedelta(seconds=3),
            ),
            StatusUpdate(
                code=Status.ITERATING,
                eta=None,
                rank=None,
                queue_size=None,
                success=None,
                time=now + timedelta(seconds=3),
            ),
            StatusUpdate(
                code=Status.FINISHED,
                eta=None,
                rank=None,
                queue_size=None,
                success=True,
                time=now + timedelta(seconds=4),
            ),
        ]

        class MockEndToEndFunction:
            def __init__(self, communicator: Communicator):
                self.communicator = communicator

            def __call__(self, *args, **kwargs):
                for m in messages:
                    with self.communicator.lock:
                        self.communicator.job.latest_status = m
                    time.sleep(0.1)

        mock_make_end_to_end_fn.side_effect = MockEndToEndFunction

        client = Client(src="gradio/calculator")
        job = client.submit(5, "add", 6)

        statuses = []
        while not job.done():
            statuses.append(job.status())
            time.sleep(0.09)

        assert all(s in messages for s in statuses)

    @patch("gradio_client.client.Endpoint.make_end_to_end_fn")
    def test_messages_correct_two_concurrent(self, mock_make_end_to_end_fn):

        now = datetime.now()

        messages_1 = [
            StatusUpdate(
                code=Status.STARTING,
                eta=None,
                rank=None,
                success=None,
                queue_size=None,
                time=now,
            ),
            StatusUpdate(
                code=Status.FINISHED,
                eta=None,
                rank=None,
                queue_size=None,
                success=True,
                time=now + timedelta(seconds=4),
            ),
        ]

        messages_2 = [
            StatusUpdate(
                code=Status.IN_QUEUE,
                eta=3,
                rank=2,
                queue_size=2,
                success=None,
                time=now + timedelta(seconds=2),
            ),
            StatusUpdate(
                code=Status.IN_QUEUE,
                eta=2,
                rank=1,
                queue_size=1,
                success=None,
                time=now + timedelta(seconds=3),
            ),
        ]

        class MockEndToEndFunction:
            n_counts = 0

            def __init__(self, communicator: Communicator):
                self.communicator = communicator
                self.messages = (
                    messages_1 if MockEndToEndFunction.n_counts == 0 else messages_2
                )
                MockEndToEndFunction.n_counts += 1

            def __call__(self, *args, **kwargs):
                for m in self.messages:
                    with self.communicator.lock:
                        print(f"here: {m}")
                        self.communicator.job.latest_status = m
                    time.sleep(0.1)

        mock_make_end_to_end_fn.side_effect = MockEndToEndFunction

        client = Client(src="gradio/calculator")
        job_1 = client.submit(5, "add", 6)
        job_2 = client.submit(11, "subtract", 1)

        statuses_1 = []
        statuses_2 = []
        while not (job_1.done() and job_2.done()):
            statuses_1.append(job_1.status())
            statuses_2.append(job_2.status())
            time.sleep(0.05)

        assert all(s in messages_1 for s in statuses_1)


class TestAPIInfo:
    @pytest.mark.parametrize("trailing_char", ["/", ""])
    def test_test_endpoint_src(self, trailing_char):
        src = "https://gradio-calculator.hf.space" + trailing_char
        client = Client(src=src)
        assert client.endpoints[0].root_url == "https://gradio-calculator.hf.space/"

    @pytest.mark.flaky
    def test_numerical_to_label_space(self):
        client = Client("gradio-tests/titanic-survival")
        assert client.endpoints[0].get_info() == {
            "parameters": {
                "sex": ["Any", "", "Radio"],
                "age": ["Any", "", "Slider"],
                "fare_(british_pounds)": ["Any", "", "Slider"],
            },
            "returns": {"output": ["str", "filepath to json file", "Label"]},
        }
        assert client.view_api(return_format="dict") == {
            "named_endpoints": {
                "/predict": {
                    "parameters": {
                        "sex": ["Any", "", "Radio"],
                        "age": ["Any", "", "Slider"],
                        "fare_(british_pounds)": ["Any", "", "Slider"],
                    },
                    "returns": {"output": ["str", "filepath to json file", "Label"]},
                },
                "/predict_1": {
                    "parameters": {
                        "sex": ["Any", "", "Radio"],
                        "age": ["Any", "", "Slider"],
                        "fare_(british_pounds)": ["Any", "", "Slider"],
                    },
                    "returns": {"output": ["str", "filepath to json file", "Label"]},
                },
                "/predict_2": {
                    "parameters": {
                        "sex": ["Any", "", "Radio"],
                        "age": ["Any", "", "Slider"],
                        "fare_(british_pounds)": ["Any", "", "Slider"],
                    },
                    "returns": {"output": ["str", "filepath to json file", "Label"]},
                },
            },
            "unnamed_endpoints": {},
        }

    @pytest.mark.flaky
    def test_serializable_in_mapping(self):
        client = Client("freddyaboulton/calculator")
        assert all(
            [c.__class__ == SimpleSerializable for c in client.endpoints[0].serializers]
        )

    @pytest.mark.flaky
    def test_private_space(self):
        client = Client("gradio-tests/not-actually-private-space", hf_token=HF_TOKEN)
        assert len(client.endpoints) == 3
        assert len([e for e in client.endpoints if e.is_valid]) == 2
        assert len([e for e in client.endpoints if e.is_valid and e.api_name]) == 1
        assert client.endpoints[0].get_info() == {
            "parameters": {"x": ["Any", "", "Textbox"]},
            "returns": {"output": ["Any", "", "Textbox"]},
        }
        assert client.view_api(return_format="dict") == {
            "named_endpoints": {
                "/predict": {
                    "parameters": {"x": ["Any", "", "Textbox"]},
                    "returns": {"output": ["Any", "", "Textbox"]},
                }
            },
            "unnamed_endpoints": {
                2: {
                    "parameters": {"parameter_0": ["Any", "", "Dataset"]},
                    "returns": {
                        "x": ["Any", "", "Textbox"],
                        "output": ["Any", "", "Textbox"],
                    },
                }
            },
        }


class TestEndpoints:
    def test_upload(self):
        client = Client(
            src="gradio-tests/not-actually-private-file-upload", hf_token=HF_TOKEN
        )
        response = MagicMock(status_code=200)
        response.json.return_value = [
            "file1",
            "file2",
            "file3",
            "file4",
            "file5",
            "file6",
            "file7",
        ]
        with patch("requests.post", MagicMock(return_value=response)):
            with patch("builtins.open", MagicMock()):
                with patch.object(pathlib.Path, "name") as mock_name:
                    mock_name.side_effect = lambda x: x
                    results = client.endpoints[0]._upload(
                        ["pre1", ["pre2", "pre3", "pre4"], ["pre5", "pre6"], "pre7"]
                    )

        res = []
        for re in results:
            if isinstance(re, list):
                res.append([r["name"] for r in re])
            else:
                res.append(re["name"])

        assert res == [
            "file1",
            ["file2", "file3", "file4"],
            ["file5", "file6"],
            "file7",
        ]
