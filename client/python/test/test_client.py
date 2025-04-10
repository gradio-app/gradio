from __future__ import annotations

import json
import pathlib
import tempfile
import time
import uuid
from concurrent.futures import CancelledError, TimeoutError, wait
from contextlib import contextmanager
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import MagicMock, patch

import gradio as gr
import httpx
import huggingface_hub
import pytest
from huggingface_hub.utils import RepositoryNotFoundError

from gradio_client import Client, handle_file
from gradio_client.client import DEFAULT_TEMP_DIR
from gradio_client.exceptions import AuthenticationError
from gradio_client.utils import (
    Communicator,
    ProgressUnit,
    QueueError,
    Status,
    StatusUpdate,
)

HF_TOKEN = huggingface_hub.get_token()


@contextmanager
def connect(
    demo: gr.Blocks,
    download_files: str = DEFAULT_TEMP_DIR,
    client_kwargs: dict | None = None,
    **kwargs,
):
    _, local_url, _ = demo.launch(prevent_thread_lock=True, **kwargs)
    if client_kwargs is None:
        client_kwargs = {}
    try:
        yield Client(local_url, download_files=download_files, **client_kwargs)
    finally:
        # A more verbose version of .close() because we should set a timeout
        # the tests that call .cancel() can get stuck waiting for the thread to join
        demo.close()


class TestClientInitialization:
    @pytest.mark.flaky
    def test_headers_constructed_correctly(self):
        client = Client("gradio-tests/titanic-survival", hf_token=HF_TOKEN)
        assert {"authorization": f"Bearer {HF_TOKEN}"}.items() <= client.headers.items()
        client = Client(
            "gradio-tests/titanic-survival",
            hf_token=HF_TOKEN,
            headers={"additional": "value"},
        )
        assert {
            "authorization": f"Bearer {HF_TOKEN}",
            "additional": "value",
        }.items() <= client.headers.items()
        client = Client(
            "gradio-tests/titanic-survival",
            hf_token=HF_TOKEN,
            headers={"authorization": "Bearer abcde"},
        )
        assert {"authorization": "Bearer abcde"}.items() <= client.headers.items()

    def test_many_endpoint_demo_loads_quickly(self, many_endpoint_demo):
        import datetime

        start = datetime.datetime.now()
        with connect(many_endpoint_demo):
            pass
        assert (datetime.datetime.now() - start).seconds < 5


class TestClientPredictions:
    @pytest.mark.flaky
    def test_raise_error_invalid_state(self):
        with pytest.raises(ValueError, match="invalid state"):
            Client("gradio-tests/paused-space")

    def test_raise_error_max_file_size(self, max_file_size_demo):
        with connect(max_file_size_demo, max_file_size="15kb") as client:
            with pytest.raises(ValueError, match="exceeds the maximum file size"):
                client.predict(
                    handle_file(Path(__file__).parent / "files" / "cheetah1.jpg"),
                    api_name="/upload_1b",
                )
            client.predict(
                handle_file(Path(__file__).parent / "files" / "alphabet.txt"),
                api_name="/upload_1b",
            )

    @pytest.mark.flaky
    def test_numerical_to_label_space(self):
        client = Client("gradio-tests/titanic-survival")
        label = json.load(
            open(client.predict("male", 77, 10, api_name="/predict"))  # noqa: SIM115
        )
        assert label["label"] == "Perishes"
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
    def test_numerical_to_label_space_v4(self):
        client = Client("gradio-tests/titanic-survivalv4-sse")
        label = client.predict("male", 77, 10, api_name="/predict")
        assert label["label"] == "Perishes"

    @pytest.mark.flaky
    def test_private_space(self):
        space_id = "gradio-tests/not-actually-private-space"
        api = huggingface_hub.HfApi()
        assert api.space_info(space_id).private
        client = Client(space_id, hf_token=HF_TOKEN)
        output = client.predict("abc", api_name="/predict")
        assert output == "abc"

    @pytest.mark.flaky
    def test_private_space_v4(self):
        space_id = "gradio-tests/not-actually-private-spacev4-sse"
        api = huggingface_hub.HfApi()
        assert api.space_info(space_id).private
        client = Client(
            space_id,
            hf_token=HF_TOKEN,
        )
        output = client.predict("abc", api_name="/predict")
        assert output == "abc"

    @pytest.mark.flaky
    def test_private_space_v4_sse_v1(self):
        space_id = "gradio-tests/not-actually-private-spacev4-sse-v1"
        api = huggingface_hub.HfApi()
        assert api.space_info(space_id).private
        client = Client(
            space_id,
            hf_token=HF_TOKEN,
        )
        output = client.predict("abc", api_name="/predict")
        assert output == "abc"

    @pytest.mark.flaky
    def test_space_with_files_v4_sse_v2(self):
        space_id = "gradio-tests/space_with_files_v4_sse_v2"
        client = Client(space_id)
        payload = (
            handle_file(
                "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3"
            ),
            {
                "video": handle_file(
                    "https://github.com/gradio-app/gradio/raw/main/demo/video_component/files/world.mp4"
                ),
                "subtitle": None,
            },
            handle_file(
                "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3"
            ),
        )
        output = client.predict(*payload, api_name="/predict")
        assert output[0].endswith(".wav")  # Audio files are converted to wav
        assert output[1]["video"].endswith(
            "world.mp4"
        )  # Video files are not converted by default
        assert "sample-0.mp3" in output[2]

    def test_state(self, increment_demo):
        with connect(increment_demo) as client:
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

    def test_job_status(self, calculator_demo):
        with connect(calculator_demo) as client:
            statuses = []
            job = client.submit(5, "add", 4, api_name="/predict")
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
    def test_intermediate_outputs(self, count_generator_demo):
        with connect(count_generator_demo) as client:
            job = client.submit(3, fn_index=0)

            while not job.done():
                time.sleep(0.1)

            assert job.outputs() == [str(i) for i in range(3)]

            outputs = []
            for o in client.submit(3, fn_index=0):
                outputs.append(o)
            assert outputs == [str(i) for i in range(3)]

    def test_break_in_loop_if_error(self, calculator_demo):
        with connect(calculator_demo) as client:
            job = client.submit("foo", "add", 4, fn_index=0)
            output = list(job)
            assert output == []

    @pytest.mark.flaky
    def test_timeout(self, sentiment_classification_demo):
        with pytest.raises(TimeoutError):
            with connect(sentiment_classification_demo.queue()) as client:
                job = client.submit(api_name="/sleep")
                job.result(timeout=0.05)

    @pytest.mark.flaky
    def test_timeout_no_queue(self, sentiment_classification_demo):
        with pytest.raises(TimeoutError):
            with connect(sentiment_classification_demo) as client:
                job = client.submit(api_name="/sleep")
                job.result(timeout=0.1)

    def test_raises_exception(self, calculator_demo):
        with pytest.raises(Exception):
            with connect(calculator_demo) as client:
                job = client.submit("foo", "add", 9, fn_index=0)
                job.result()

    @pytest.mark.flaky
    def test_job_output_video(self, video_component):
        with connect(video_component) as client:
            job = client.submit(
                {
                    "video": handle_file(
                        "https://huggingface.co/spaces/gradio/video_component/resolve/main/files/a.mp4"
                    )
                },
                fn_index=0,
            )
            assert Path(job.result()["video"]).exists()
            assert (
                Path(DEFAULT_TEMP_DIR).resolve()
                in Path(job.result()["video"]).resolve().parents
            )

        temp_dir = tempfile.mkdtemp()
        with connect(video_component, download_files=temp_dir) as client:
            job = client.submit(
                {
                    "video": handle_file(
                        "https://huggingface.co/spaces/gradio/video_component/resolve/main/files/a.mp4"
                    )
                },
                fn_index=0,
            )
            assert Path(job.result()["video"]).exists()
            assert (
                Path(temp_dir).resolve()
                in Path(job.result()["video"]).resolve().parents
            )

    def test_progress_updates(self, progress_demo):
        with connect(progress_demo) as client:
            job = client.submit("hello", api_name="/predict")
            statuses = []
            while not job.done():
                statuses.append(job.status())
                time.sleep(0.02)
            assert any(s.code == Status.PROGRESS for s in statuses)
            assert any(s.progress_data is not None for s in statuses)
            all_progress_data = [
                p for s in statuses if s.progress_data for p in s.progress_data
            ]
            count = 0
            for i in range(20):
                unit = ProgressUnit(
                    index=i, length=20, unit="steps", progress=None, desc=None
                )
                count += unit in all_progress_data
            assert count

    def test_upload_and_download_with_auth(self):
        demo = gr.Interface(lambda x: x, "text", "text")
        _, url, _ = demo.launch(auth=("user", "pass"), prevent_thread_lock=True)
        with pytest.raises(AuthenticationError):
            client = Client(url)
        client = Client(url, auth=("user", "pass"))
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as f:
            f.write("Hello file!")
        output = client.predict(f.name, api_name="/predict")
        with open(output) as f:
            assert f.read() == "Hello file!"

    def test_upload_preserves_orig_name(self):
        demo = gr.Interface(lambda x: x, "image", "text")
        with connect(demo) as client:
            test_file = str(Path(__file__).parent / "files" / "cheetah1.jpg")
            output = client.endpoints[0]._upload_file({"path": test_file}, data_index=0)
            assert output["orig_name"] == "cheetah1.jpg"

            output = client.endpoints[0]._upload_file(
                {
                    "path": "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
                },
                data_index=0,
            )
            assert output["orig_name"] == "bus.png"

    @pytest.mark.flaky(reruns=5)
    def test_cancel_from_client_queued(self, cancel_from_client_demo):
        with connect(cancel_from_client_demo) as client:
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
            # Result for iterative jobs will raise there is an exception
            with pytest.raises(Exception):
                job.result()
            # The whole prediction takes 10 seconds to run
            # and does not iterate. So this tests that we can cancel
            # halfway through a prediction
            assert time.time() - start < 10

            # Test that we did not iterate all the way to the end
            assert all(o in [0, 1, 2, 3, 4, 5] for o in job.outputs())
            assert job.status().code == Status.CANCELLED

    def test_job_cancel_stops_upstream_server_if_cancel_event_defined(self):
        global current_step
        current_step = 0

        def iteration_quick():
            for i in range(20):
                print(f"i: {i}")
                global current_step
                current_step = i
                yield i
                time.sleep(0.1)

        with gr.Blocks() as demo:
            num = gr.Number()

            btn = gr.Button(value="Iterate")
            iterate_quick = btn.click(
                iteration_quick, None, num, api_name="iterate_quick"
            )
            btn3 = gr.Button(value="Cancel")
            btn3.click(None, None, None, cancels=[iterate_quick])

        with connect(demo) as client:
            job = client.submit(api_name="/iterate_quick")
            while len(job.outputs()) < 5:
                time.sleep(0.1)
            job.cancel()
            time.sleep(2)

        assert current_step < 19

    def test_cancel_subsequent_jobs_state_reset(self, yield_demo):
        with connect(yield_demo) as client:
            job1 = client.submit("abcdefefadsadfs", api_name="/predict")
            time.sleep(3)
            job1.cancel()

            assert len(job1.outputs()) > 0
            assert len(job1.outputs()) < len("abcdefefadsadfs")
            assert job1.status().code == Status.CANCELLED

            job2 = client.submit("abcd", api_name="/predict")
            assert len(job2.outputs()) == 0
            while not job2.done():
                time.sleep(0.1)
            # Ran all iterations from scratch
            assert job2.status().code == Status.FINISHED
            assert len(job2.outputs()) == 4

    @pytest.mark.xfail
    def test_stream_audio(self, stream_audio):
        with connect(stream_audio) as client:
            job1 = client.submit(
                handle_file(
                    "https://gradio-builds.s3.amazonaws.com/demo-files/bark_demo.mp4"
                ),
                api_name="/predict",
            )
            assert Path(job1.result()).exists()

            job2 = client.submit(
                handle_file(
                    "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav"
                ),
                api_name="/predict",
            )
            assert Path(job2.result()).exists()
            assert all(Path(p).exists() for p in job2.outputs())

    @pytest.mark.xfail
    def test_upload_file_private_space_v4(self):
        client = Client(
            src="gradio-tests/not-actually-private-file-uploadv4-sse",
        )

        with patch.object(
            client.endpoints[0], "_upload", wraps=client.endpoints[0]._upload
        ) as upload:
            with patch.object(
                client.endpoints[0], "serialize", wraps=client.endpoints[0].serialize
            ) as serialize:
                with tempfile.NamedTemporaryFile(mode="w", delete=False) as f:
                    f.write("Hello from private space!")

                output = client.submit(
                    1, "foo", f.name, api_name="/file_upload"
                ).result()
            with open(output) as f:
                assert f.read() == "Hello from private space!"
            upload.assert_called_once()
            assert all(f["is_file"] for f in serialize.return_value())

        with patch.object(
            client.endpoints[1], "_upload", wraps=client.endpoints[0]._upload
        ) as upload:
            with tempfile.NamedTemporaryFile(mode="w", delete=False) as f:
                f.write("Hello from private space!")

            with open(client.submit(f.name, api_name="/upload_btn").result()) as f:
                assert f.read() == "Hello from private space!"
            upload.assert_called_once()

        with patch.object(
            client.endpoints[2], "_upload", wraps=client.endpoints[0]._upload
        ) as upload:
            # `delete=False` is required for Windows compat
            with tempfile.NamedTemporaryFile(mode="w", delete=False) as f1:
                with tempfile.NamedTemporaryFile(mode="w", delete=False) as f2:
                    f1.write("File1")
                    f2.write("File2")
            r1, r2 = client.submit(
                3,
                [f1.name, f2.name],
                "hello",
                api_name="/upload_multiple",
            ).result()
            with open(r1) as f:
                assert f.read() == "File1"
            with open(r2) as f:
                assert f.read() == "File2"
            upload.assert_called_once()

    @pytest.mark.flaky
    def test_upload_file_private_space(self):
        client = Client(
            src="gradio-tests/not-actually-private-file-upload",
            hf_token=HF_TOKEN,
        )

        with patch.object(
            client.endpoints[0], "serialize", wraps=client.endpoints[0].serialize
        ) as serialize:
            with tempfile.NamedTemporaryFile(mode="w", delete=False) as f:
                f.write("Hello from private space!")

            output = client.submit(1, "foo", f.name, api_name="/file_upload").result()
        with open(output) as f:
            assert f.read() == "Hello from private space!"
        assert all(f["is_file"] for f in serialize.return_value())

        with tempfile.NamedTemporaryFile(mode="w", delete=False) as f:
            f.write("Hello from private space!")

        with open(client.submit(f.name, api_name="/upload_btn").result()) as f:
            assert f.read() == "Hello from private space!"

        with tempfile.NamedTemporaryFile(mode="w", delete=False) as f1:
            with tempfile.NamedTemporaryFile(mode="w", delete=False) as f2:
                f1.write("File1")
                f2.write("File2")
        r1, r2 = client.submit(
            3,
            [f1.name, f2.name],
            "hello",
            api_name="/upload_multiple",
        ).result()
        with open(r1) as f:
            assert f.read() == "File1"
        with open(r2) as f:
            assert f.read() == "File2"

    @pytest.mark.flaky
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

                client.submit(1, "foo", f.name, fn_index=0).result()
                serialize.assert_called_once_with(1, "foo", f.name)

    def test_does_not_upload_dir(self, stateful_chatbot):
        with connect(stateful_chatbot) as client:
            initial_history = [["", None]]
            message = "Hello"
            ret = client.predict(message, initial_history, api_name="/submit")
            assert ret == ("", [["", None], ["Hello", "I love you"]])

    @pytest.mark.flaky
    def test_predict_with_space_with_api_name_false(self):
        client = Client("gradio-tests/client-bool-api-name-error")
        assert client.predict("Hello!", api_name="/run") == "Hello!"
        assert client.predict("Freddy", api_name="/say_hello") == "hello"

    def test_return_layout_component(self, hello_world_with_group):
        with connect(hello_world_with_group) as demo:
            assert demo.predict("Freddy", api_name="/greeting") == "Hello Freddy"
            assert demo.predict(api_name="/show_group") == ()

    def test_return_layout_and_state_components(
        self, hello_world_with_state_and_accordion
    ):
        with connect(hello_world_with_state_and_accordion) as demo:
            assert demo.predict("Freddy", api_name="/greeting") == ("Hello Freddy", 1)
            assert demo.predict("Abubakar", api_name="/greeting") == (
                "Hello Abubakar",
                2,
            )
            assert demo.predict(api_name="/open") == 3
            assert demo.predict(api_name="/close") == 4
            assert demo.predict("Ali", api_name="/greeting") == ("Hello Ali", 5)

    def test_long_response_time_with_gr_info_and_big_payload(
        self, long_response_with_info
    ):
        with connect(long_response_with_info) as demo:
            assert demo.predict(api_name="/predict") == "\ta\nb" * 90000

    def test_queue_full_raises_error(self):
        demo = gr.Interface(lambda s: f"Hello {s}", "textbox", "textbox").queue(
            max_size=1
        )
        with connect(demo) as client:
            with pytest.raises(QueueError):
                job1 = client.submit("Freddy", api_name="/predict")
                job2 = client.submit("Abubakar", api_name="/predict")
                job3 = client.submit("Pete", api_name="/predict")
                wait([job1, job2, job3])
                job1.result()
                job2.result()
                job3.result()

    def test_json_parse_error(self):
        data = (
            "Bonjour Olivier, tu as l'air bien r\u00e9veill\u00e9 ce matin. Tu veux que je te pr\u00e9pare tes petits-d\u00e9j.\n",
            None,
        )

        def return_bad():
            return data

        demo = gr.Interface(return_bad, None, ["text", "text"])
        with connect(demo) as client:
            pred = client.predict(api_name="/predict")
            assert pred[0] == data[0]

    def test_state_reset_when_session_changes(self, capsys, state_demo, monkeypatch):
        monkeypatch.setenv("GRADIO_IS_E2E_TEST", "1")
        with connect(state_demo) as client:
            client.predict("Hello", api_name="/predict")
            client.reset_session()
            time.sleep(5)
        out = capsys.readouterr().out
        assert "STATE DELETED" in out

    @pytest.mark.flaky
    def test_add_zero_gpu_headers_no_gradio_context(self):
        client = Client("gradio/calculator")
        headers = {"existing": "header"}
        new_headers = client.add_zero_gpu_headers(headers)
        assert new_headers == headers  # No changes when not in Gradio context

    @pytest.mark.flaky
    def test_add_zero_gpu_headers_with_ip_token(self, monkeypatch):
        client = Client("gradio/calculator")
        headers = {"existing": "header"}

        class MockRequest:
            headers = {"x-ip-token": "test-token"}

        class MockContext:
            request = MagicMock()
            request.get.return_value = MockRequest()

        monkeypatch.setattr("gradio.context.LocalContext", MockContext)
        new_headers = client.add_zero_gpu_headers(headers)
        assert new_headers == {"existing": "header", "x-ip-token": "test-token"}


class TestClientPredictionsWithKwargs:
    def test_no_default_params(self, calculator_demo):
        with connect(calculator_demo) as client:
            result = client.predict(
                num1=3, operation="add", num2=3, api_name="/predict"
            )
            assert result == 6

            result = client.predict(33, operation="add", num2=3, api_name="/predict")
            assert result == 36

    def test_default_params(self, calculator_demo_with_defaults):
        with connect(calculator_demo_with_defaults) as client:
            result = client.predict(num2=10, api_name="/predict")
            assert result == 20

            result = client.predict(num2=33, operation="multiply", api_name="/predict")
            assert result == 330

    def test_missing_params(self, calculator_demo):
        with connect(calculator_demo) as client:
            with pytest.raises(
                TypeError, match="No value provided for required argument: num2"
            ):
                client.predict(num1=3, operation="add", api_name="/predict")

    def test_chatbot_message_format(self, chatbot_message_format):
        with connect(chatbot_message_format) as client:
            _, history = client.predict("hello", [], api_name="/chat")
            assert history[1]["role"] == "assistant"
            assert history[1]["content"] in [
                "How are you?",
                "I love you",
                "I'm very hungry",
            ]
            _, history = client.predict("hi", history, api_name="/chat")
            assert history[2]["role"] == "user"
            assert history[2]["content"] == "hi"
            assert history[3]["role"] == "assistant"
            assert history[3]["content"] in [
                "How are you?",
                "I love you",
                "I'm very hungry",
            ]


class TestStatusUpdates:
    @patch("gradio_client.client.Endpoint.make_end_to_end_fn")
    def test_messages_passed_correctly(self, mock_make_end_to_end_fn, calculator_demo):
        now = datetime.now()

        messages = [
            StatusUpdate(
                code=Status.STARTING,
                eta=None,
                rank=None,
                success=None,
                queue_size=None,
                time=now,
                progress_data=None,
            ),
            StatusUpdate(
                code=Status.SENDING_DATA,
                eta=None,
                rank=None,
                success=None,
                queue_size=None,
                time=now + timedelta(seconds=1),
                progress_data=None,
            ),
            StatusUpdate(
                code=Status.IN_QUEUE,
                eta=3,
                rank=2,
                queue_size=2,
                success=None,
                time=now + timedelta(seconds=2),
                progress_data=None,
            ),
            StatusUpdate(
                code=Status.IN_QUEUE,
                eta=2,
                rank=1,
                queue_size=1,
                success=None,
                time=now + timedelta(seconds=3),
                progress_data=None,
            ),
            StatusUpdate(
                code=Status.ITERATING,
                eta=None,
                rank=None,
                queue_size=None,
                success=None,
                time=now + timedelta(seconds=3),
                progress_data=None,
            ),
            StatusUpdate(
                code=Status.FINISHED,
                eta=None,
                rank=None,
                queue_size=None,
                success=True,
                time=now + timedelta(seconds=4),
                progress_data=None,
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

        with connect(calculator_demo) as client:
            job = client.submit(5, "add", 6, api_name="/predict")

            statuses = []
            while not job.done():
                statuses.append(job.status())
                time.sleep(0.09)

            assert all(s in messages for s in statuses)

    @pytest.mark.flaky
    @patch("gradio_client.client.Endpoint.make_end_to_end_fn")
    def test_messages_correct_two_concurrent(
        self, mock_make_end_to_end_fn, calculator_demo
    ):
        now = datetime.now()

        messages_1 = [
            StatusUpdate(
                code=Status.STARTING,
                eta=None,
                rank=None,
                success=None,
                queue_size=None,
                time=now,
                progress_data=None,
            ),
            StatusUpdate(
                code=Status.FINISHED,
                eta=None,
                rank=None,
                queue_size=None,
                success=True,
                time=now + timedelta(seconds=4),
                progress_data=None,
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
                progress_data=None,
            ),
            StatusUpdate(
                code=Status.IN_QUEUE,
                eta=2,
                rank=1,
                queue_size=1,
                success=None,
                time=now + timedelta(seconds=3),
                progress_data=None,
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

        with connect(calculator_demo) as client:
            job_1 = client.submit(5, "add", 6, api_name="/predict")
            job_2 = client.submit(11, "subtract", 1, api_name="/predict")

            statuses_1 = []
            statuses_2 = []
            while not (job_1.done() and job_2.done()):
                statuses_1.append(job_1.status())
                statuses_2.append(job_2.status())
                time.sleep(0.05)

            assert all(s in messages_1 for s in statuses_1)


class TestAPIInfo:
    @pytest.mark.flaky
    @pytest.mark.parametrize("trailing_char", ["/", ""])
    def test_test_endpoint_src(self, trailing_char):
        src = "https://gradio-calculator.hf.space" + trailing_char
        client = Client(src=src)
        assert client.endpoints[0].root_url == "https://gradio-calculator.hf.space/"

    @pytest.mark.flaky
    def test_numerical_to_label_space(self):
        client = Client("gradio-tests/titanic-survival")
        assert client.view_api(return_format="dict") == {
            "named_endpoints": {
                "/predict": {
                    "parameters": [
                        {
                            "label": "Sex",
                            "type": {"type": "string"},
                            "python_type": {"type": "str", "description": ""},
                            "component": "Radio",
                            "example_input": "Howdy!",
                            "serializer": "StringSerializable",
                        },
                        {
                            "label": "Age",
                            "type": {"type": "number"},
                            "python_type": {"type": "int | float", "description": ""},
                            "component": "Slider",
                            "example_input": 5,
                            "serializer": "NumberSerializable",
                        },
                        {
                            "label": "Fare (british pounds)",
                            "type": {"type": "number"},
                            "python_type": {"type": "int | float", "description": ""},
                            "component": "Slider",
                            "example_input": 5,
                            "serializer": "NumberSerializable",
                        },
                    ],
                    "returns": [
                        {
                            "label": "output",
                            "type": {"type": {}, "description": "any valid json"},
                            "python_type": {
                                "type": "dict[Any, Any]",
                                "description": "any valid json",
                            },
                            "component": "Label",
                            "serializer": "JSONSerializable",
                        }
                    ],
                },
                "/predict_1": {
                    "parameters": [
                        {
                            "label": "Sex",
                            "type": {"type": "string"},
                            "python_type": {"type": "str", "description": ""},
                            "component": "Radio",
                            "example_input": "Howdy!",
                            "serializer": "StringSerializable",
                        },
                        {
                            "label": "Age",
                            "type": {"type": "number"},
                            "python_type": {"type": "int | float", "description": ""},
                            "component": "Slider",
                            "example_input": 5,
                            "serializer": "NumberSerializable",
                        },
                        {
                            "label": "Fare (british pounds)",
                            "type": {"type": "number"},
                            "python_type": {"type": "int | float", "description": ""},
                            "component": "Slider",
                            "example_input": 5,
                            "serializer": "NumberSerializable",
                        },
                    ],
                    "returns": [
                        {
                            "label": "output",
                            "type": {"type": {}, "description": "any valid json"},
                            "python_type": {
                                "type": "dict[Any, Any]",
                                "description": "any valid json",
                            },
                            "component": "Label",
                            "serializer": "JSONSerializable",
                        }
                    ],
                },
                "/predict_2": {
                    "parameters": [
                        {
                            "label": "Sex",
                            "type": {"type": "string"},
                            "python_type": {"type": "str", "description": ""},
                            "component": "Radio",
                            "example_input": "Howdy!",
                            "serializer": "StringSerializable",
                        },
                        {
                            "label": "Age",
                            "type": {"type": "number"},
                            "python_type": {"type": "int | float", "description": ""},
                            "component": "Slider",
                            "example_input": 5,
                            "serializer": "NumberSerializable",
                        },
                        {
                            "label": "Fare (british pounds)",
                            "type": {"type": "number"},
                            "python_type": {"type": "int | float", "description": ""},
                            "component": "Slider",
                            "example_input": 5,
                            "serializer": "NumberSerializable",
                        },
                    ],
                    "returns": [
                        {
                            "label": "output",
                            "type": {"type": {}, "description": "any valid json"},
                            "python_type": {
                                "type": "dict[Any, Any]",
                                "description": "any valid json",
                            },
                            "component": "Label",
                            "serializer": "JSONSerializable",
                        }
                    ],
                },
            },
            "unnamed_endpoints": {},
        }

    def test_state_does_not_appear(self, state_demo):
        with connect(state_demo) as client:
            api_info = client.view_api(return_format="dict")
            assert isinstance(api_info, dict)
            for parameter in api_info["named_endpoints"]["/predict"]["parameters"]:
                assert parameter["component"] != "State"

    @pytest.mark.flaky
    def test_private_space(self):
        client = Client(
            "gradio-tests/not-actually-private-space",
            hf_token=HF_TOKEN,
        )
        assert len(client.endpoints) == 3
        assert len([e for e in client.endpoints.values() if e.is_valid]) == 2
        assert (
            len([e for e in client.endpoints.values() if e.is_valid and e.api_name])
            == 1
        )
        assert client.view_api(return_format="dict") == {
            "named_endpoints": {
                "/predict": {
                    "parameters": [
                        {
                            "label": "x",
                            "type": {"type": "string"},
                            "python_type": {"type": "str", "description": ""},
                            "component": "Textbox",
                            "example_input": "Howdy!",
                            "serializer": "StringSerializable",
                        }
                    ],
                    "returns": [
                        {
                            "label": "output",
                            "type": {"type": "string"},
                            "python_type": {"type": "str", "description": ""},
                            "component": "Textbox",
                            "serializer": "StringSerializable",
                        }
                    ],
                }
            },
            "unnamed_endpoints": {},
        }

    def test_api_info_of_local_demo(self, calculator_demo):
        with connect(calculator_demo) as client:
            api_info = client.view_api(return_format="dict")
            assert isinstance(api_info, dict)
            assert api_info["named_endpoints"]["/predict"] == {
                "parameters": [
                    {
                        "label": "num1",
                        "parameter_name": "num1",
                        "parameter_has_default": False,
                        "parameter_default": None,
                        "type": {"type": "number"},
                        "python_type": {"type": "float", "description": ""},
                        "component": "Number",
                        "example_input": 3,
                    },
                    {
                        "label": "operation",
                        "parameter_name": "operation",
                        "parameter_has_default": False,
                        "parameter_default": None,
                        "type": {
                            "enum": ["add", "subtract", "multiply", "divide"],
                            "title": "Radio",
                            "type": "string",
                        },
                        "python_type": {
                            "type": "Literal['add', 'subtract', 'multiply', 'divide']",
                            "description": "",
                        },
                        "component": "Radio",
                        "example_input": "add",
                    },
                    {
                        "label": "num2",
                        "parameter_name": "num2",
                        "parameter_has_default": False,
                        "parameter_default": None,
                        "type": {"type": "number"},
                        "python_type": {"type": "float", "description": ""},
                        "component": "Number",
                        "example_input": 3,
                    },
                ],
                "returns": [
                    {
                        "label": "output",
                        "type": {"type": "number"},
                        "python_type": {"type": "float", "description": ""},
                        "component": "Number",
                    }
                ],
            }
            assert api_info["unnamed_endpoints"] == {}

    def test_unnamed_endpoints_use_fn_index(self, count_generator_demo):
        with connect(count_generator_demo) as client:
            info = client.view_api(return_format="str")
            assert "fn_index" not in info
            assert "api_name" in info

    def test_api_false_endpoints_do_not_appear(self, count_generator_no_api):
        with connect(count_generator_no_api) as client:
            info = client.view_api(return_format="dict")
            assert len(info["named_endpoints"]) == 0

    def test_api_false_endpoints_cannot_be_accessed_with_fn_index(self, increment_demo):
        with connect(increment_demo) as client:
            with pytest.raises(ValueError):
                client.submit(1, fn_index=2)

    def test_file_io(self, file_io_demo):
        with connect(file_io_demo) as client:
            info = client.view_api(return_format="dict")
            inputs = info["named_endpoints"]["/predict"]["parameters"]
            outputs = info["named_endpoints"]["/predict"]["returns"]

            assert inputs[0]["type"]["type"] == "array"
            assert inputs[0]["python_type"]["type"] == "list[filepath]"

            assert isinstance(inputs[0]["example_input"], list)
            assert isinstance(inputs[0]["example_input"][0], dict)

            assert inputs[1]["python_type"]["type"] == "filepath"
            assert isinstance(inputs[1]["example_input"], dict)

            assert outputs[0]["python_type"]["type"] == "list[filepath]"
            assert outputs[0]["type"]["type"] == "array"

            assert outputs[1]["python_type"]["type"] == "filepath"

    def test_layout_components_in_output(self, hello_world_with_group):
        with connect(hello_world_with_group) as client:
            info = client.view_api(return_format="dict")
            assert info == {
                "named_endpoints": {
                    "/greeting": {
                        "parameters": [
                            {
                                "label": "name",
                                "parameter_name": "name",
                                "parameter_has_default": False,
                                "parameter_default": None,
                                "type": {"type": "string"},
                                "python_type": {"type": "str", "description": ""},
                                "component": "Textbox",
                                "example_input": "Hello!!",
                            }
                        ],
                        "returns": [
                            {
                                "label": "greeting",
                                "type": {"type": "string"},
                                "python_type": {"type": "str", "description": ""},
                                "component": "Textbox",
                            }
                        ],
                    },
                    "/show_group": {"parameters": [], "returns": []},
                },
                "unnamed_endpoints": {},
            }

    def test_layout_and_state_components_in_output(
        self, hello_world_with_state_and_accordion
    ):
        with connect(hello_world_with_state_and_accordion) as client:
            info = client.view_api(return_format="dict")
            assert info == {
                "named_endpoints": {
                    "/greeting": {
                        "parameters": [
                            {
                                "label": "name",
                                "parameter_name": "name",
                                "parameter_has_default": False,
                                "parameter_default": None,
                                "type": {"type": "string"},
                                "python_type": {"type": "str", "description": ""},
                                "component": "Textbox",
                                "example_input": "Hello!!",
                            }
                        ],
                        "returns": [
                            {
                                "label": "greeting",
                                "type": {"type": "string"},
                                "python_type": {"type": "str", "description": ""},
                                "component": "Textbox",
                            },
                            {
                                "label": "count",
                                "type": {"type": "number"},
                                "python_type": {"type": "float", "description": ""},
                                "component": "Number",
                            },
                        ],
                    },
                    "/open": {
                        "parameters": [],
                        "returns": [
                            {
                                "label": "count",
                                "type": {"type": "number"},
                                "python_type": {"type": "float", "description": ""},
                                "component": "Number",
                            }
                        ],
                    },
                    "/close": {
                        "parameters": [],
                        "returns": [
                            {
                                "label": "count",
                                "type": {"type": "number"},
                                "python_type": {"type": "float", "description": ""},
                                "component": "Number",
                            }
                        ],
                    },
                },
                "unnamed_endpoints": {},
            }


class TestEndpoints:
    @pytest.mark.flaky
    def test_upload(self):
        client = Client(
            src="gradio-tests/not-actually-private-file-upload",
            hf_token=HF_TOKEN,
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
        with patch("httpx.post", MagicMock(return_value=response)):
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

    @pytest.mark.flaky
    def test_download_private_file(self, gradio_temp_dir):
        client = Client(
            src="gradio/zip_files",
        )
        url_path = handle_file(
            "https://gradio-tests-not-actually-private-spacev4-sse.hf.space/file=lion.jpg"
        )
        file = client.endpoints[0]._upload_file(url_path, 0)  # type: ignore
        assert file["path"].endswith(".jpg")

    @pytest.mark.flaky
    def test_download_tmp_copy_of_file_does_not_save_errors(
        self, monkeypatch, gradio_temp_dir
    ):
        client = Client(
            src="gradio/zip_files",
        )
        error_response = httpx.Response(status_code=404)
        monkeypatch.setattr(httpx, "get", lambda *args, **kwargs: error_response)
        with pytest.raises(httpx.HTTPStatusError):
            client.endpoints[0]._download_file({"path": "https://example.com/foo"})  # type: ignore


cpu = huggingface_hub.SpaceHardware.CPU_BASIC


class TestDuplication:
    @pytest.mark.flaky
    @patch("huggingface_hub.get_space_runtime", return_value=MagicMock(hardware=cpu))
    @patch("gradio_client.client.Client.__init__", return_value=None)
    def test_new_space_id(self, mock_init, mock_runtime):
        Client.duplicate(
            "gradio/calculator",
            "test",
            hf_token=HF_TOKEN,
        )
        mock_runtime.assert_any_call("gradio/calculator", token=HF_TOKEN)
        mock_init.assert_called()
        Client.duplicate(
            "gradio/calculator",
            "gradio-tests/test",
            hf_token=HF_TOKEN,
        )
        mock_runtime.assert_any_call("gradio/calculator", token=HF_TOKEN)
        mock_init.assert_called()

    @pytest.mark.flaky
    @patch("gradio_client.utils.set_space_timeout")
    @patch("huggingface_hub.get_space_runtime", return_value=MagicMock(hardware=cpu))
    @patch("gradio_client.client.Client.__init__", return_value=None)
    def test_dont_set_timeout_if_default_hardware(
        self, mock_init, mock_runtime, mock_set_timeout
    ):
        Client.duplicate(
            "gradio/calculator",
            "test",
        )
        mock_set_timeout.assert_not_called()

    @pytest.mark.flaky
    @patch("huggingface_hub.request_space_hardware")
    @patch("gradio_client.utils.set_space_timeout")
    @patch(
        "huggingface_hub.get_space_runtime",
        return_value=MagicMock(hardware=huggingface_hub.SpaceHardware.CPU_UPGRADE),
    )
    @patch("gradio_client.client.Client.__init__", return_value=None)
    def test_set_timeout_if_not_default_hardware(
        self, mock_init, mock_runtime, mock_set_timeout, mock_request_hardware
    ):
        Client.duplicate(
            "gradio/calculator",
            "test",
            hardware="cpu-upgrade",
            sleep_timeout=15,
            hf_token=HF_TOKEN,
        )
        assert mock_set_timeout.call_count == 1
        _, called_kwargs = mock_set_timeout.call_args
        assert called_kwargs["timeout_in_seconds"] == 15 * 60

    @pytest.mark.flaky
    @patch("huggingface_hub.add_space_secret")
    @patch("huggingface_hub.duplicate_space")
    @patch("gradio_client.client.Client.__init__", return_value=None)
    @patch("gradio_client.utils.set_space_timeout")
    def test_add_secrets(self, mock_time, mock_init, mock_duplicate, mock_add_secret):
        with pytest.raises(RepositoryNotFoundError):
            name = str(uuid.uuid4())
            Client.duplicate(
                "gradio/calculator",
                name,
                hf_token=HF_TOKEN,
                secrets={"test_key": "test_value", "test_key2": "test_value2"},
            )
            mock_add_secret.assert_called_with(
                f"gradio-tests/{name}",
                "test_key",
                "test_value",
                token=HF_TOKEN,
            )
            mock_add_secret.assert_any_call(
                f"gradio-tests/{name}",
                "test_key2",
                "test_value2",
                token=HF_TOKEN,
            )


def test_httpx_kwargs(increment_demo):
    with connect(
        increment_demo, client_kwargs={"httpx_kwargs": {"timeout": 5}}
    ) as client:
        with patch("httpx.post", MagicMock()) as mock_post:
            with pytest.raises(Exception):
                client.predict(1, api_name="/increment_with_queue")
            assert mock_post.call_args.kwargs["timeout"] == 5
