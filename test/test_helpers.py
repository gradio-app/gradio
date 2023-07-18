import json
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from unittest.mock import patch

import pytest
import websockets
from gradio_client import media_data
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
        assert examples.processed_examples == [[media_data.BASE64_IMAGE]]

    def test_handle_multiple_inputs(self):
        examples = gr.Examples(
            [["hello", "test/test_files/bus.png"]], [gr.Textbox(), gr.Image()]
        )
        assert examples.processed_examples == [["hello", media_data.BASE64_IMAGE]]

    def test_handle_directory(self):
        examples = gr.Examples("test/test_files/images", gr.Image())
        assert examples.processed_examples == [
            [media_data.BASE64_IMAGE],
            [media_data.BASE64_IMAGE],
        ]

    def test_handle_directory_with_log_file(self):
        examples = gr.Examples(
            "test/test_files/images_log", [gr.Image(label="im"), gr.Text()]
        )
        assert examples.processed_examples == [
            [media_data.BASE64_IMAGE, "hello"],
            [media_data.BASE64_IMAGE, "hi"],
        ]
        for sample in examples.dataset.samples:
            assert os.path.isabs(sample[0])

    def test_examples_per_page(self):
        examples = gr.Examples(["hello", "hi"], gr.Textbox(), examples_per_page=2)
        assert examples.dataset.get_config()["samples_per_page"] == 2

    @pytest.mark.asyncio
    async def test_no_preprocessing(self):
        with gr.Blocks():
            image = gr.Image()
            textbox = gr.Textbox()

            examples = gr.Examples(
                examples=["test/test_files/bus.png"],
                inputs=image,
                outputs=textbox,
                fn=lambda x: x,
                cache_examples=True,
                preprocess=False,
            )

        prediction = await examples.load_from_cache(0)
        assert prediction == [media_data.BASE64_IMAGE]

    @pytest.mark.asyncio
    async def test_no_postprocessing(self):
        def im(x):
            return [media_data.BASE64_IMAGE]

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

        prediction = await examples.load_from_cache(0)
        assert prediction[0][0][0]["data"] == media_data.BASE64_IMAGE


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


@patch("gradio.helpers.CACHED_FOLDER", tempfile.mkdtemp())
class TestProcessExamples:
    @pytest.mark.asyncio
    async def test_caching(self):
        io = gr.Interface(
            lambda x: f"Hello {x}",
            "text",
            "text",
            examples=[["World"], ["Dunya"], ["Monde"]],
            cache_examples=True,
        )
        prediction = await io.examples_handler.load_from_cache(1)
        assert prediction[0] == "Hello Dunya"

    @pytest.mark.asyncio
    async def test_caching_image(self):
        io = gr.Interface(
            lambda x: x,
            "image",
            "image",
            examples=[["test/test_files/bus.png"]],
            cache_examples=True,
        )
        prediction = await io.examples_handler.load_from_cache(0)
        assert prediction[0].startswith("data:image/png;base64,iVBORw0KGgoAAA")

    @pytest.mark.asyncio
    async def test_caching_audio(self):
        io = gr.Interface(
            lambda x: x,
            "audio",
            "audio",
            examples=[["test/test_files/audio_sample.wav"]],
            cache_examples=True,
        )
        prediction = await io.examples_handler.load_from_cache(0)
        assert prediction[0]["data"].startswith("data:audio/wav;base64,UklGRgA/")

    @pytest.mark.asyncio
    async def test_caching_with_update(self):
        io = gr.Interface(
            lambda x: gr.update(visible=False),
            "text",
            "image",
            examples=[["World"], ["Dunya"], ["Monde"]],
            cache_examples=True,
        )
        prediction = await io.examples_handler.load_from_cache(1)
        assert prediction[0] == {
            "visible": False,
            "__type__": "update",
        }

    @pytest.mark.asyncio
    async def test_caching_with_mix_update(self):
        io = gr.Interface(
            lambda x: [gr.update(lines=4, value="hello"), "test/test_files/bus.png"],
            "text",
            ["text", "image"],
            examples=[["World"], ["Dunya"], ["Monde"]],
            cache_examples=True,
        )
        prediction = await io.examples_handler.load_from_cache(1)
        assert prediction[0] == {
            "lines": 4,
            "value": "hello",
            "__type__": "update",
        }

    @pytest.mark.asyncio
    async def test_caching_with_dict(self):
        text = gr.Textbox()
        out = gr.Label()

        io = gr.Interface(
            lambda _: {text: gr.update(lines=4, interactive=False), out: "lion"},
            "textbox",
            [text, out],
            examples=["abc"],
            cache_examples=True,
        )
        prediction = await io.examples_handler.load_from_cache(0)
        assert not any(d["trigger"] == "fake_event" for d in io.config["dependencies"])
        assert prediction == [
            {"lines": 4, "__type__": "update", "mode": "static"},
            {"label": "lion"},
        ]

    @pytest.mark.asyncio
    async def test_caching_with_generators(self):
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
        prediction = await io.examples_handler.load_from_cache(0)
        assert prediction[0] == "Your output: abcdef"

    @pytest.mark.asyncio
    async def test_caching_with_async_generators(self):
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
        prediction = await io.examples_handler.load_from_cache(0)
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

    @pytest.mark.asyncio
    async def test_caching_with_batch(self):
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
        prediction = await io.examples_handler.load_from_cache(0)
        assert prediction == ["hel"]

    @pytest.mark.asyncio
    async def test_caching_with_batch_multiple_outputs(self):
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
        prediction = await io.examples_handler.load_from_cache(0)
        assert prediction == ["hel", "3"]

    @pytest.mark.asyncio
    async def test_caching_with_non_io_component(self):
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

        prediction = await examples.load_from_cache(0)
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
        assert response.json()["data"] == ["Hello,"]

        response = client.post("/api/load_example/", json={"data": [1]})
        assert response.json()["data"] == ["Michael"]

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


@pytest.mark.asyncio
async def test_multiple_file_flagging(tmp_path):
    with patch("gradio.helpers.CACHED_FOLDER", str(tmp_path)):
        io = gr.Interface(
            fn=lambda *x: list(x),
            inputs=[
                gr.Image(source="upload", type="filepath", label="frame 1"),
                gr.Image(source="upload", type="filepath", label="frame 2"),
            ],
            outputs=[gr.Files()],
            examples=[["test/test_files/cheetah1.jpg", "test/test_files/bus.png"]],
            cache_examples=True,
        )
        prediction = await io.examples_handler.load_from_cache(0)

        assert len(prediction[0]) == 2
        assert all(isinstance(d, dict) for d in prediction[0])


@pytest.mark.asyncio
async def test_examples_keep_all_suffixes(tmp_path):
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
        prediction = await io.examples_handler.load_from_cache(0)
        assert Path(prediction[0]["name"]).read_text() == "file 1"
        assert prediction[0]["orig_name"] == "foo.bar.txt"
        prediction = await io.examples_handler.load_from_cache(1)
        assert Path(prediction[0]["name"]).read_text() == "file 2"
        assert prediction[0]["orig_name"] == "foo.bar.txt"


def test_make_waveform_with_spaces_in_filename():
    with tempfile.TemporaryDirectory() as tmpdirname:
        audio = os.path.join(tmpdirname, "test audio.wav")
        shutil.copy("test/test_files/audio_sample.wav", audio)
        waveform = gr.make_waveform(audio)
        assert waveform.endswith(".mp4")


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

        async with websockets.connect(
            f"{demo.local_url.replace('http', 'ws')}queue/join"
        ) as ws:
            completed = False
            progress_updates = []
            while not completed:
                msg = json.loads(await ws.recv())
                if msg["msg"] == "send_data":
                    await ws.send(json.dumps({"data": [0], "fn_index": 0}))
                if msg["msg"] == "send_hash":
                    await ws.send(json.dumps({"fn_index": 0, "session_hash": "shdce"}))
                if msg["msg"] == "progress":
                    progress_updates.append(msg["progress_data"])
                if msg["msg"] == "process_completed":
                    completed = True
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

        async with websockets.connect(
            f"{demo.local_url.replace('http', 'ws')}queue/join"
        ) as ws:
            completed = False
            progress_updates = []
            while not completed:
                msg = json.loads(await ws.recv())
                if msg["msg"] == "send_data":
                    await ws.send(json.dumps({"data": [0], "fn_index": 0}))
                if msg["msg"] == "send_hash":
                    await ws.send(json.dumps({"fn_index": 0, "session_hash": "shdce"}))
                if (
                    msg["msg"] == "progress" and msg["progress_data"]
                ):  # Ignore empty lists which sometimes appear on Windows
                    progress_updates.append(msg["progress_data"])
                if msg["msg"] == "process_completed":
                    completed = True
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

        async with websockets.connect(
            f"{demo.local_url.replace('http', 'ws')}queue/join"
        ) as ws:
            completed = False
            progress_updates = []
            while not completed:
                msg = json.loads(await ws.recv())
                if msg["msg"] == "send_data":
                    await ws.send(json.dumps({"data": ["abc"], "fn_index": 0}))
                if msg["msg"] == "send_hash":
                    await ws.send(json.dumps({"fn_index": 0, "session_hash": "shdce"}))
                if (
                    msg["msg"] == "progress" and msg["progress_data"]
                ):  # Ignore empty lists which sometimes appear on Windows
                    progress_updates.append(msg["progress_data"])
                if msg["msg"] == "process_completed":
                    completed = True
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

        async with websockets.connect(
            f"{demo.local_url.replace('http', 'ws')}queue/join"
        ) as ws:
            completed = False
            log_messages = []
            while not completed:
                msg = json.loads(await ws.recv())
                if msg["msg"] == "send_data":
                    await ws.send(json.dumps({"data": ["abc"], "fn_index": 0}))
                if msg["msg"] == "send_hash":
                    await ws.send(json.dumps({"fn_index": 0, "session_hash": "shdce"}))
                if (
                    msg["msg"] == "log"
                ):  # Ignore empty lists which sometimes appear on Windows
                    log_messages.append([msg["log"], msg["level"]])
                if msg["msg"] == "process_completed":
                    completed = True
                    break
        assert log_messages == [
            ["Letter a", "info"],
            ["Letter b", "info"],
            ["Letter c", "info"],
            ["Too short!", "warning"],
        ]
