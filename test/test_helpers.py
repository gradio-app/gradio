import asyncio
import json
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from unittest.mock import patch

import httpx
import pytest
import requests
from gradio_client import media_data, utils
from pydub import AudioSegment
from starlette.testclient import TestClient
from tqdm import tqdm

import gradio as gr


@patch("gradio.helpers.CACHED_FOLDER", tempfile.mkdtemp())
class TestExamples:
    def test_handle_single_input(self):
        examples = gr.Examples(["hello", "hi"], gr.Textbox())
        assert examples.processed_examples == [["hello"], ["hi"]]

        examples = gr.Examples([["hello"]], gr.Textbox())
        assert examples.processed_examples == [["hello"]]

        examples = gr.Examples(["test/test_files/bus.png"], gr.Image())
        assert (
            utils.encode_file_to_base64(examples.processed_examples[0][0]["path"])
            == media_data.BASE64_IMAGE
        )

    def test_handle_multiple_inputs(self):
        examples = gr.Examples(
            [["hello", "test/test_files/bus.png"]], [gr.Textbox(), gr.Image()]
        )
        assert examples.processed_examples[0][0] == "hello"
        assert (
            utils.encode_file_to_base64(examples.processed_examples[0][1]["path"])
            == media_data.BASE64_IMAGE
        )

    def test_handle_directory(self):
        examples = gr.Examples("test/test_files/images", gr.Image())
        assert len(examples.processed_examples) == 2
        for row in examples.processed_examples:
            for output in row:
                assert (
                    utils.encode_file_to_base64(output["path"])
                    == media_data.BASE64_IMAGE
                )

    def test_handle_directory_with_log_file(self):
        examples = gr.Examples(
            "test/test_files/images_log", [gr.Image(label="im"), gr.Text()]
        )
        ex = utils.traverse(
            examples.processed_examples,
            lambda s: utils.encode_file_to_base64(s["path"]),
            lambda x: isinstance(x, dict) and Path(x["path"]).exists(),
        )
        assert ex == [
            [media_data.BASE64_IMAGE, "hello"],
            [media_data.BASE64_IMAGE, "hi"],
        ]
        for sample in examples.dataset.samples:
            assert os.path.isabs(sample[0])

    def test_examples_per_page(self):
        examples = gr.Examples(["hello", "hi"], gr.Textbox(), examples_per_page=2)
        assert examples.dataset.get_config()["samples_per_page"] == 2

    def test_no_preprocessing(self):
        with gr.Blocks():
            image = gr.Image()
            textbox = gr.Textbox()

            examples = gr.Examples(
                examples=["test/test_files/bus.png"],
                inputs=image,
                outputs=textbox,
                fn=lambda x: x["path"],
                cache_examples=True,
                preprocess=False,
            )

        prediction = examples.load_from_cache(0)
        assert utils.encode_file_to_base64(prediction[0]) == media_data.BASE64_IMAGE

    def test_no_postprocessing(self):
        def im(x):
            return [
                {
                    "image": {
                        "path": "test/test_files/bus.png",
                    },
                    "caption": "hi",
                }
            ]

        with gr.Blocks():
            text = gr.Textbox()
            gall = gr.Gallery()

            examples = gr.Examples(
                examples=["hi"],
                inputs=text,
                outputs=gall,
                fn=im,
                cache_examples=True,
                postprocess=False,
            )

        prediction = examples.load_from_cache(0)
        file = prediction[0].root[0].image.path
        assert utils.encode_url_or_file_to_base64(
            file
        ) == utils.encode_url_or_file_to_base64("test/test_files/bus.png")


@patch("gradio.helpers.CACHED_FOLDER", tempfile.mkdtemp())
class TestExamplesDataset:
    def test_no_headers(self):
        examples = gr.Examples("test/test_files/images_log", [gr.Image(), gr.Text()])
        assert examples.dataset.headers == []

    def test_all_headers(self):
        examples = gr.Examples(
            "test/test_files/images_log",
            [gr.Image(label="im"), gr.Text(label="your text")],
        )
        assert examples.dataset.headers == ["im", "your text"]

    def test_some_headers(self):
        examples = gr.Examples(
            "test/test_files/images_log", [gr.Image(label="im"), gr.Text()]
        )
        assert examples.dataset.headers == ["im", ""]


def test_example_caching_relaunch(connect):
    def combine(a, b):
        return a + " " + b

    with gr.Blocks() as demo:
        txt = gr.Textbox(label="Input")
        txt_2 = gr.Textbox(label="Input 2")
        txt_3 = gr.Textbox(value="", label="Output")
        btn = gr.Button(value="Submit")
        btn.click(combine, inputs=[txt, txt_2], outputs=[txt_3])
        gr.Examples(
            [["hi", "Adam"], ["hello", "Eve"]],
            [txt, txt_2],
            txt_3,
            combine,
            cache_examples=True,
            api_name="examples",
        )

    with connect(demo) as client:
        assert client.predict(1, api_name="/examples") == (
            "hello",
            "Eve",
            "hello Eve",
        )

    # Let the server shut down
    time.sleep(1)

    with connect(demo) as client:
        assert client.predict(1, api_name="/examples") == (
            "hello",
            "Eve",
            "hello Eve",
        )


@patch("gradio.helpers.CACHED_FOLDER", tempfile.mkdtemp())
class TestProcessExamples:
    def test_caching(self):
        io = gr.Interface(
            lambda x: f"Hello {x}",
            "text",
            "text",
            examples=[["World"], ["Dunya"], ["Monde"]],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(1)
        assert prediction[0] == "Hello Dunya"

    def test_example_caching_relaunch(self, connect):
        def combine(a, b):
            return a + " " + b

        with gr.Blocks() as demo:
            txt = gr.Textbox(label="Input")
            txt_2 = gr.Textbox(label="Input 2")
            txt_3 = gr.Textbox(value="", label="Output")
            btn = gr.Button(value="Submit")
            btn.click(combine, inputs=[txt, txt_2], outputs=[txt_3])
            gr.Examples(
                [["hi", "Adam"], ["hello", "Eve"]],
                [txt, txt_2],
                txt_3,
                combine,
                cache_examples=True,
                api_name="examples",
            )

        with connect(demo) as client:
            assert client.predict(1, api_name="/examples") == (
                "hello",
                "Eve",
                "hello Eve",
            )

        with connect(demo) as client:
            assert client.predict(1, api_name="/examples") == (
                "hello",
                "Eve",
                "hello Eve",
            )

    def test_caching_image(self):
        io = gr.Interface(
            lambda x: x,
            "image",
            "image",
            examples=[["test/test_files/bus.png"]],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(0)
        assert utils.encode_url_or_file_to_base64(prediction[0].path).startswith(
            "data:image/png;base64,iVBORw0KGgoAAA"
        )

    def test_caching_audio(self):
        io = gr.Interface(
            lambda x: x,
            "audio",
            "audio",
            examples=[["test/test_files/audio_sample.wav"]],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(0)
        file = prediction[0].path
        assert utils.encode_url_or_file_to_base64(file).startswith(
            "data:audio/wav;base64,UklGRgA/"
        )

    def test_caching_with_update(self):
        io = gr.Interface(
            lambda x: gr.update(visible=False),
            "text",
            "image",
            examples=[["World"], ["Dunya"], ["Monde"]],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(1)
        assert prediction[0] == {
            "visible": False,
            "__type__": "update",
        }

    def test_caching_with_mix_update(self):
        io = gr.Interface(
            lambda x: [gr.update(lines=4, value="hello"), "test/test_files/bus.png"],
            "text",
            ["text", "image"],
            examples=[["World"], ["Dunya"], ["Monde"]],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(1)
        assert prediction[0] == {
            "lines": 4,
            "value": "hello",
            "__type__": "update",
        }

    def test_caching_with_dict(self):
        text = gr.Textbox()
        out = gr.Label()

        io = gr.Interface(
            lambda _: {text: gr.update(lines=4, interactive=False), out: "lion"},
            "textbox",
            [text, out],
            examples=["abc"],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(0)
        assert prediction == [
            {"lines": 4, "__type__": "update", "interactive": False},
            gr.Label.data_model(**{"label": "lion", "confidences": None}),
        ]

    def test_caching_with_generators(self):
        def test_generator(x):
            for y in range(len(x)):
                yield "Your output: " + x[: y + 1]

        io = gr.Interface(
            test_generator,
            "textbox",
            "textbox",
            examples=["abcdef"],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(0)
        assert prediction[0] == "Your output: abcdef"

    def test_caching_with_generators_and_streamed_output(self):
        file_dir = Path(Path(__file__).parent, "test_files")
        audio = str(file_dir / "audio_sample.wav")

        def test_generator(x):
            for y in range(int(x)):
                yield audio, y * 5

        io = gr.Interface(
            test_generator,
            "number",
            [gr.Audio(streaming=True), "number"],
            examples=[3],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(0)
        len_input_audio = len(AudioSegment.from_wav(audio))
        len_output_audio = len(AudioSegment.from_wav(prediction[0].path))
        length_ratio = len_output_audio / len_input_audio
        assert round(length_ratio, 1) == 3.0  # might not be exactly 3x
        assert float(prediction[1]) == 10.0

    def test_caching_with_async_generators(self):
        async def test_generator(x):
            for y in range(len(x)):
                yield "Your output: " + x[: y + 1]

        io = gr.Interface(
            test_generator,
            "textbox",
            "textbox",
            examples=["abcdef"],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(0)
        assert prediction[0] == "Your output: abcdef"

    def test_raise_helpful_error_message_if_providing_partial_examples(self, tmp_path):
        def foo(a, b):
            return a + b

        with pytest.warns(
            UserWarning,
            match="^Examples are being cached but not all input components have",
        ):
            with pytest.raises(Exception):
                gr.Interface(
                    foo,
                    inputs=["text", "text"],
                    outputs=["text"],
                    examples=[["foo"], ["bar"]],
                    cache_examples=True,
                )

        with pytest.warns(
            UserWarning,
            match="^Examples are being cached but not all input components have",
        ):
            with pytest.raises(Exception):
                gr.Interface(
                    foo,
                    inputs=["text", "text"],
                    outputs=["text"],
                    examples=[["foo", "bar"], ["bar", None]],
                    cache_examples=True,
                )

        def foo_no_exception(a, b=2):
            return a * b

        gr.Interface(
            foo_no_exception,
            inputs=["text", "number"],
            outputs=["text"],
            examples=[["foo"], ["bar"]],
            cache_examples=True,
        )

        def many_missing(a, b, c):
            return a * b

        with pytest.warns(
            UserWarning,
            match="^Examples are being cached but not all input components have",
        ):
            with pytest.raises(Exception):
                gr.Interface(
                    many_missing,
                    inputs=["text", "number", "number"],
                    outputs=["text"],
                    examples=[["foo", None, None], ["bar", 2, 3]],
                    cache_examples=True,
                )

    def test_caching_with_batch(self):
        def trim_words(words, lens):
            trimmed_words = [word[:length] for word, length in zip(words, lens)]
            return [trimmed_words]

        io = gr.Interface(
            trim_words,
            ["textbox", gr.Number(precision=0)],
            ["textbox"],
            batch=True,
            max_batch_size=16,
            examples=[["hello", 3], ["hi", 4]],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(0)
        assert prediction == ["hel"]

    def test_caching_with_batch_multiple_outputs(self):
        def trim_words(words, lens):
            trimmed_words = [word[:length] for word, length in zip(words, lens)]
            return trimmed_words, lens

        io = gr.Interface(
            trim_words,
            ["textbox", gr.Number(precision=0)],
            ["textbox", gr.Number(precision=0)],
            batch=True,
            max_batch_size=16,
            examples=[["hello", 3], ["hi", 4]],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(0)
        assert prediction == ["hel", "3"]

    def test_caching_with_non_io_component(self):
        def predict(name):
            return name, gr.update(visible=True)

        with gr.Blocks():
            t1 = gr.Textbox()
            with gr.Column(visible=False) as c:
                t2 = gr.Textbox()

            examples = gr.Examples(
                [["John"], ["Mary"]],
                fn=predict,
                inputs=[t1],
                outputs=[t2, c],
                cache_examples=True,
            )

        prediction = examples.load_from_cache(0)
        assert prediction == ["John", {"visible": True, "__type__": "update"}]

    def test_end_to_end(self):
        def concatenate(str1, str2):
            return str1 + str2

        with gr.Blocks() as demo:
            t1 = gr.Textbox()
            t2 = gr.Textbox()
            t1.submit(concatenate, [t1, t2], t2)

            gr.Examples(
                [["Hello,", None], ["Michael", None]],
                inputs=[t1, t2],
                api_name="load_example",
            )

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)

        response = client.post("/api/load_example/", json={"data": [0]})
        assert response.json()["data"] == [
            {
                "lines": 1,
                "max_lines": 20,
                "show_label": True,
                "container": True,
                "min_width": 160,
                "autofocus": False,
                "autoscroll": True,
                "elem_classes": [],
                "rtl": False,
                "show_copy_button": False,
                "__type__": "update",
                "visible": True,
                "value": "Hello,",
                "type": "text",
            }
        ]

        response = client.post("/api/load_example/", json={"data": [1]})
        assert response.json()["data"] == [
            {
                "lines": 1,
                "max_lines": 20,
                "show_label": True,
                "container": True,
                "min_width": 160,
                "autofocus": False,
                "autoscroll": True,
                "elem_classes": [],
                "rtl": False,
                "show_copy_button": False,
                "__type__": "update",
                "visible": True,
                "value": "Michael",
                "type": "text",
            }
        ]

    def test_end_to_end_cache_examples(self):
        def concatenate(str1, str2):
            return f"{str1} {str2}"

        with gr.Blocks() as demo:
            t1 = gr.Textbox()
            t2 = gr.Textbox()
            t1.submit(concatenate, [t1, t2], t2)

            gr.Examples(
                examples=[["Hello,", "World"], ["Michael", "Jordan"]],
                inputs=[t1, t2],
                outputs=[t2],
                fn=concatenate,
                cache_examples=True,
                api_name="load_example",
            )

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)

        response = client.post("/api/load_example/", json={"data": [0]})
        assert response.json()["data"] == ["Hello,", "World", "Hello, World"]

        response = client.post("/api/load_example/", json={"data": [1]})
        assert response.json()["data"] == ["Michael", "Jordan", "Michael Jordan"]


def test_multiple_file_flagging(tmp_path):
    with patch("gradio.helpers.CACHED_FOLDER", str(tmp_path)):
        io = gr.Interface(
            fn=lambda *x: list(x),
            inputs=[
                gr.Image(type="filepath", label="frame 1"),
                gr.Image(type="filepath", label="frame 2"),
            ],
            outputs=[gr.Files()],
            examples=[["test/test_files/cheetah1.jpg", "test/test_files/bus.png"]],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(0)

        assert len(prediction[0].root) == 2
        assert all(isinstance(d, gr.FileData) for d in prediction[0].root)


def test_examples_keep_all_suffixes(tmp_path):
    with patch("gradio.helpers.CACHED_FOLDER", str(tmp_path)):
        file_1 = tmp_path / "foo.bar.txt"
        file_1.write_text("file 1")
        file_2 = tmp_path / "file_2"
        file_2.mkdir(parents=True)
        file_2 = file_2 / "foo.bar.txt"
        file_2.write_text("file 2")
        io = gr.Interface(
            fn=lambda x: x.name,
            inputs=gr.File(),
            outputs=[gr.File()],
            examples=[[str(file_1)], [str(file_2)]],
            cache_examples=True,
        )
        prediction = io.examples_handler.load_from_cache(0)
        assert Path(prediction[0].path).read_text() == "file 1"
        assert prediction[0].orig_name == "foo.bar.txt"
        assert prediction[0].path.endswith("foo.bar.txt")
        prediction = io.examples_handler.load_from_cache(1)
        assert Path(prediction[0].path).read_text() == "file 2"
        assert prediction[0].orig_name == "foo.bar.txt"
        assert prediction[0].path.endswith("foo.bar.txt")


def test_make_waveform_with_spaces_in_filename():
    with tempfile.TemporaryDirectory() as tmpdirname:
        audio = os.path.join(tmpdirname, "test audio.wav")
        shutil.copy("test/test_files/audio_sample.wav", audio)
        waveform = gr.make_waveform(audio)
        assert waveform.endswith(".mp4")

        try:
            command = [
                "ffprobe",
                "-v",
                "error",
                "-select_streams",
                "v:0",
                "-show_entries",
                "stream=width,height",
                "-of",
                "json",
                waveform,
            ]

            result = subprocess.run(command, capture_output=True, text=True, check=True)
            output = result.stdout
            data = json.loads(output)

            width = data["streams"][0]["width"]
            height = data["streams"][0]["height"]
            assert width == 1000
            assert height == 400

        except subprocess.CalledProcessError as e:
            print("Error retrieving resolution of output waveform video:", e)


def test_make_waveform_raises_if_ffmpeg_fails(tmp_path, monkeypatch):
    """
    Test that make_waveform raises an exception if ffmpeg fails,
    instead of returning a path to a non-existent or empty file.
    """
    audio = tmp_path / "test audio.wav"
    shutil.copy("test/test_files/audio_sample.wav", audio)

    def _failing_ffmpeg(*args, **kwargs):
        raise subprocess.CalledProcessError(1, "ffmpeg")

    monkeypatch.setattr(subprocess, "call", _failing_ffmpeg)
    with pytest.raises(Exception):
        gr.make_waveform(str(audio))


class TestProgressBar:
    @pytest.mark.asyncio
    async def test_progress_bar(self):
        with gr.Blocks() as demo:
            name = gr.Textbox()
            greeting = gr.Textbox()
            button = gr.Button(value="Greet")

            def greet(s, prog=gr.Progress()):
                prog(0, desc="start")
                time.sleep(0.15)
                for _ in prog.tqdm(range(4), unit="iter"):
                    time.sleep(0.15)
                time.sleep(0.15)
                for _ in tqdm(["a", "b", "c"], desc="alphabet"):
                    time.sleep(0.15)
                return f"Hello, {s}!"

            button.click(greet, name, greeting)
        demo.queue(max_size=1).launch(prevent_thread_lock=True)

        progress_updates = []
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "GET",
                f"http://localhost:{demo.server_port}/queue/join",
                params={"fn_index": 0, "session_hash": "shdce"},
            ) as response:
                async for line in response.aiter_text():
                    if line.startswith("data:"):
                        msg = json.loads(line[5:])
                    if msg["msg"] == "send_data":
                        event_id = msg["event_id"]
                        req = requests.post(
                            f"http://localhost:{demo.server_port}/queue/data",
                            json={
                                "event_id": event_id,
                                "data": [0],
                                "fn_index": 0,
                            },
                        )
                        if not req.ok:
                            raise ValueError(
                                f"Could not send payload to endpoint: {req.text}"
                            )
                    if msg["msg"] == "progress":
                        progress_updates.append(msg["progress_data"])
                    if msg["msg"] == "process_completed":
                        break

        assert progress_updates == [
            [
                {
                    "index": None,
                    "length": None,
                    "unit": "steps",
                    "progress": 0.0,
                    "desc": "start",
                }
            ],
            [{"index": 0, "length": 4, "unit": "iter", "progress": None, "desc": None}],
            [{"index": 1, "length": 4, "unit": "iter", "progress": None, "desc": None}],
            [{"index": 2, "length": 4, "unit": "iter", "progress": None, "desc": None}],
            [{"index": 3, "length": 4, "unit": "iter", "progress": None, "desc": None}],
            [{"index": 4, "length": 4, "unit": "iter", "progress": None, "desc": None}],
        ]

    @pytest.mark.asyncio
    async def test_progress_bar_track_tqdm(self):
        with gr.Blocks() as demo:
            name = gr.Textbox()
            greeting = gr.Textbox()
            button = gr.Button(value="Greet")

            def greet(s, prog=gr.Progress(track_tqdm=True)):
                prog(0, desc="start")
                time.sleep(0.15)
                for _ in prog.tqdm(range(4), unit="iter"):
                    time.sleep(0.15)
                time.sleep(0.15)
                for _ in tqdm(["a", "b", "c"], desc="alphabet"):
                    time.sleep(0.15)
                return f"Hello, {s}!"

            button.click(greet, name, greeting)
        demo.queue(max_size=1).launch(prevent_thread_lock=True)

        progress_updates = []
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "GET",
                f"http://localhost:{demo.server_port}/queue/join",
                params={"fn_index": 0, "session_hash": "shdce"},
            ) as response:
                async for line in response.aiter_text():
                    if line.startswith("data:"):
                        msg = json.loads(line[5:])
                    if msg["msg"] == "send_data":
                        event_id = msg["event_id"]
                        req = requests.post(
                            f"http://localhost:{demo.server_port}/queue/data",
                            json={
                                "event_id": event_id,
                                "data": [0],
                                "fn_index": 0,
                            },
                        )
                        if not req.ok:
                            raise ValueError(
                                f"Could not send payload to endpoint: {req.text}"
                            )
                    if msg["msg"] == "progress":
                        progress_updates.append(msg["progress_data"])
                    if msg["msg"] == "process_completed":
                        break

        assert progress_updates == [
            [
                {
                    "index": None,
                    "length": None,
                    "unit": "steps",
                    "progress": 0.0,
                    "desc": "start",
                }
            ],
            [{"index": 0, "length": 4, "unit": "iter", "progress": None, "desc": None}],
            [{"index": 1, "length": 4, "unit": "iter", "progress": None, "desc": None}],
            [{"index": 2, "length": 4, "unit": "iter", "progress": None, "desc": None}],
            [{"index": 3, "length": 4, "unit": "iter", "progress": None, "desc": None}],
            [{"index": 4, "length": 4, "unit": "iter", "progress": None, "desc": None}],
            [
                {
                    "index": 0,
                    "length": 3,
                    "unit": "steps",
                    "progress": None,
                    "desc": "alphabet",
                }
            ],
            [
                {
                    "index": 1,
                    "length": 3,
                    "unit": "steps",
                    "progress": None,
                    "desc": "alphabet",
                }
            ],
            [
                {
                    "index": 2,
                    "length": 3,
                    "unit": "steps",
                    "progress": None,
                    "desc": "alphabet",
                }
            ],
        ]

    @pytest.mark.asyncio
    async def test_progress_bar_track_tqdm_without_iterable(self):
        def greet(s, _=gr.Progress(track_tqdm=True)):
            with tqdm(total=len(s)) as progress_bar:
                for _c in s:
                    progress_bar.update()
                    time.sleep(0.15)
            return f"Hello, {s}!"

        demo = gr.Interface(greet, "text", "text")
        demo.queue().launch(prevent_thread_lock=True)

        progress_updates = []
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "GET",
                f"http://localhost:{demo.server_port}/queue/join",
                params={"fn_index": 0, "session_hash": "shdce"},
            ) as response:
                async for line in response.aiter_text():
                    if line.startswith("data:"):
                        msg = json.loads(line[5:])
                    if msg["msg"] == "send_data":
                        event_id = msg["event_id"]
                        req = requests.post(
                            f"http://localhost:{demo.server_port}/queue/data",
                            json={
                                "event_id": event_id,
                                "data": ["abc"],
                                "fn_index": 0,
                            },
                        )
                        if not req.ok:
                            raise ValueError(
                                f"Could not send payload to endpoint: {req.text}"
                            )
                    if msg["msg"] == "progress":
                        progress_updates.append(msg["progress_data"])
                    if msg["msg"] == "process_completed":
                        break

        assert progress_updates == [
            [
                {
                    "index": 1,
                    "length": 3,
                    "unit": "steps",
                    "progress": None,
                    "desc": None,
                }
            ],
            [
                {
                    "index": 2,
                    "length": 3,
                    "unit": "steps",
                    "progress": None,
                    "desc": None,
                }
            ],
            [
                {
                    "index": 3,
                    "length": 3,
                    "unit": "steps",
                    "progress": None,
                    "desc": None,
                }
            ],
        ]

    @pytest.mark.asyncio
    async def test_info_and_warning_alerts(self):
        def greet(s):
            for _c in s:
                gr.Info(f"Letter {_c}")
                time.sleep(0.15)
            if len(s) < 5:
                gr.Warning("Too short!")
            return f"Hello, {s}!"

        demo = gr.Interface(greet, "text", "text")
        demo.queue().launch(prevent_thread_lock=True)

        log_messages = []
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "GET",
                f"http://localhost:{demo.server_port}/queue/join",
                params={"fn_index": 0, "session_hash": "shdce"},
            ) as response:
                async for line in response.aiter_text():
                    if line.startswith("data:"):
                        msg = json.loads(line[5:])
                    if msg["msg"] == "send_data":
                        event_id = msg["event_id"]
                        req = requests.post(
                            f"http://localhost:{demo.server_port}/queue/data",
                            json={
                                "event_id": event_id,
                                "data": ["abc"],
                                "fn_index": 0,
                            },
                        )
                        if not req.ok:
                            raise ValueError(
                                f"Could not send payload to endpoint: {req.text}"
                            )
                    if msg["msg"] == "log":
                        log_messages.append([msg["log"], msg["level"]])
                    if msg["msg"] == "process_completed":
                        break

        assert log_messages == [
            ["Letter a", "info"],
            ["Letter b", "info"],
            ["Letter c", "info"],
            ["Too short!", "warning"],
        ]


@pytest.mark.asyncio
@pytest.mark.parametrize("async_handler", [True, False])
async def test_info_isolation(async_handler: bool):
    async def greet_async(name):
        await asyncio.sleep(2)
        gr.Info(f"Hello {name}")
        return name

    def greet_sync(name):
        time.sleep(2)
        gr.Info(f"Hello {name}")
        return name

    demo = gr.Interface(
        greet_async if async_handler else greet_sync,
        "text",
        "text",
        concurrency_limit=2,
    )
    demo.launch(prevent_thread_lock=True)

    async def session_interaction(name, delay=0):
        await asyncio.sleep(delay)

        log_messages = []
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "GET",
                f"http://localhost:{demo.server_port}/queue/join",
                params={"fn_index": 0, "session_hash": name},
            ) as response:
                async for line in response.aiter_text():
                    if line.startswith("data:"):
                        msg = json.loads(line[5:])
                    if msg["msg"] == "send_data":
                        event_id = msg["event_id"]
                        req = requests.post(
                            f"http://localhost:{demo.server_port}/queue/data",
                            json={
                                "event_id": event_id,
                                "data": [name],
                                "fn_index": 0,
                            },
                        )
                        if not req.ok:
                            raise ValueError(
                                f"Could not send payload to endpoint: {req.text}"
                            )
                    if msg["msg"] == "log":
                        log_messages.append(msg["log"])
                    if msg["msg"] == "process_completed":
                        break
        return log_messages

    alice_logs, bob_logs = await asyncio.gather(
        session_interaction("Alice"),
        session_interaction("Bob", delay=1),
    )

    assert alice_logs == ["Hello Alice"]
    assert bob_logs == ["Hello Bob"]
