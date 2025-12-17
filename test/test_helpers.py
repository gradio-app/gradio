import asyncio
import os
import tempfile
import time
from pathlib import Path
from unittest.mock import patch

import gradio_client as grc
import pytest
from gradio_client import utils as client_utils
from pydub import AudioSegment
from starlette.testclient import TestClient
from tqdm import tqdm

import gradio as gr
from gradio import helpers, utils
from gradio.media import get_audio, get_image
from gradio.route_utils import API_PREFIX


@patch("gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp()))
class TestExamples:
    def test_handle_single_input(self, patched_cache_folder, media_data):
        examples = gr.Examples(["hello", "hi"], gr.Textbox())
        assert examples.non_none_processed_examples.as_list() == [["hello"], ["hi"]]

        examples = gr.Examples([["hello"]], gr.Textbox())
        assert examples.non_none_processed_examples.as_list() == [["hello"]]

        examples = gr.Examples(["test/test_files/bus.png"], gr.Image())
        assert (
            client_utils.encode_file_to_base64(
                examples.non_none_processed_examples.as_list()[0][0]["path"]
            )
            == media_data.BASE64_IMAGE
        )

    def test_handle_multiple_inputs(self, patched_cache_folder, media_data):
        examples = gr.Examples(
            [["hello", "test/test_files/bus.png"]], [gr.Textbox(), gr.Image()]
        )
        assert examples.non_none_processed_examples.as_list()[0][0] == "hello"
        assert (
            client_utils.encode_file_to_base64(
                examples.non_none_processed_examples.as_list()[0][1]["path"]
            )
            == media_data.BASE64_IMAGE
        )

    def test_handle_directory(self, patched_cache_folder, media_data):
        examples = gr.Examples("test/test_files/images", gr.Image())
        assert len(examples.non_none_processed_examples.as_list()) == 2
        for row in examples.non_none_processed_examples.as_list():
            for output in row:
                assert (
                    client_utils.encode_file_to_base64(output["path"])
                    == media_data.BASE64_IMAGE
                )

    def test_handle_directory_with_log_file(self, patched_cache_folder, media_data):
        examples = gr.Examples(
            "test/test_files/images_log", [gr.Image(label="im"), gr.Text()]
        )
        ex = client_utils.traverse(
            examples.non_none_processed_examples.as_list(),
            lambda s: client_utils.encode_file_to_base64(s["path"]),
            lambda x: isinstance(x, dict) and Path(x["path"]).exists(),
        )
        assert ex == [
            [media_data.BASE64_IMAGE, "hello"],
            [media_data.BASE64_IMAGE, "hi"],
        ]
        for sample in examples.dataset.samples:
            assert os.path.isabs(sample[0]["path"])

    def test_examples_per_page(self, patched_cache_folder):
        examples = gr.Examples(["hello", "hi"], gr.Textbox(), examples_per_page=2)
        assert examples.dataset.get_config()["samples_per_page"] == 2

    def test_no_preprocessing(self, patched_cache_folder, connect, media_data):
        with gr.Blocks() as demo:
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

        with connect(demo):
            prediction = examples.load_from_cache(0)
        assert (
            client_utils.encode_file_to_base64(prediction[0]) == media_data.BASE64_IMAGE
        )

    def test_no_postprocessing(self, patched_cache_folder, connect):
        def im(x):
            return [
                {
                    "image": {
                        "path": "test/test_files/bus.png",
                    },
                    "caption": "hi",
                }
            ]

        with gr.Blocks() as demo:
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

        with connect(demo):
            prediction = examples.load_from_cache(0)
        file = prediction[0].root[0].image.path
        assert client_utils.encode_url_or_file_to_base64(
            file
        ) == client_utils.encode_url_or_file_to_base64("test/test_files/bus.png")


def test_setting_cache_dir_env_variable(monkeypatch, connect):
    temp_dir = tempfile.mkdtemp()
    monkeypatch.setenv("GRADIO_EXAMPLES_CACHE", temp_dir)
    with gr.Blocks() as demo:
        image = gr.Image()
        image2 = gr.Image()

        examples = gr.Examples(
            examples=["test/test_files/bus.png"],
            inputs=image,
            outputs=image2,
            fn=lambda x: x,
            cache_examples=True,
        )

    with connect(demo):
        prediction = examples.load_from_cache(0)
    path_to_cached_file = Path(prediction[0].path)
    assert utils.is_in_or_equal(path_to_cached_file, temp_dir)
    monkeypatch.delenv("GRADIO_EXAMPLES_CACHE", raising=False)


@patch("gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp()))
class TestExamplesDataset:
    def test_no_headers(self, patched_cache_folder):
        examples = gr.Examples("test/test_files/images_log", [gr.Image(), gr.Number()])
        assert examples.dataset.headers == []

    def test_all_headers(self, patched_cache_folder):
        examples = gr.Examples(
            "test/test_files/images_log",
            [gr.Image(label="im"), gr.Text(label="your text")],
        )
        assert examples.dataset.headers == ["im", "your text"]

    def test_some_headers(self, patched_cache_folder):
        examples = gr.Examples(
            "test/test_files/images_log", [gr.Image(label="im"), gr.Number()]
        )
        assert examples.dataset.headers == ["im", ""]

    def test_example_labels(self, patched_cache_folder):
        examples = gr.Examples(
            examples=[
                [5, "add", 3],
                [4, "divide", 2],
                [-4, "multiply", 2.5],
                [0, "subtract", 1.2],
            ],
            inputs=[
                gr.Number(),
                gr.Radio(["add", "divide", "multiply", "subtract"]),
                gr.Number(),
            ],
            example_labels=["add", "divide", "multiply", "subtract"],
        )
        assert examples.dataset.sample_labels == [
            "add",
            "divide",
            "multiply",
            "subtract",
        ]


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
        assert client.predict(1, api_name="/examples") == "hello Eve"

    # Let the server shut down
    time.sleep(1)

    with connect(demo) as client:
        assert client.predict(1, api_name="/examples") == "hello Eve"


@patch("gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp()))
class TestProcessExamples:
    def test_caching(self, patched_cache_folder, connect):
        io = gr.Interface(
            lambda x: f"Hello {x}",
            "text",
            "text",
            examples=[["World"], ["Dunya"], ["Monde"]],
            cache_examples=True,
        )
        with connect(io):
            prediction = io.examples_handler.load_from_cache(1)
        assert prediction[0] == "Hello Dunya"

    def test_example_caching_relaunch(self, patched_cache_folder, connect):
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
            assert client.predict(1, api_name="/examples") == "hello Eve"

        with connect(demo) as client:
            assert client.predict(1, api_name="/examples") == "hello Eve"

    def test_caching_image(self, patched_cache_folder, connect):
        io = gr.Interface(
            lambda x: x,
            "image",
            "image",
            examples=[["test/test_files/bus.png"]],
            cache_examples=True,
        )
        with connect(io):
            prediction = io.examples_handler.load_from_cache(0)
        assert prediction[0].path.endswith(".webp")

    def test_caching_audio_with_progress(self, patched_cache_folder, connect):
        def audio_identity(x, prog=gr.Progress()):
            for _ in prog.tqdm(range(5)):
                pass
            return x

        io = gr.Interface(
            audio_identity,
            "audio",
            "audio",
            examples=[[get_audio("audio_sample.wav")]],
            cache_examples=True,
        )
        with connect(io):
            prediction = io.examples_handler.load_from_cache(0)
        file = prediction[0].path
        assert client_utils.encode_url_or_file_to_base64(file).startswith(
            "data:audio/wav;base64,UklGRgA/AABXQVZFZm10I"
        )

    def test_caching_with_update(self, patched_cache_folder, connect):
        io = gr.Interface(
            lambda x: gr.update(visible=False),
            "text",
            "image",
            examples=[["World"], ["Dunya"], ["Monde"]],
            cache_examples=True,
        )
        with connect(io):
            prediction = io.examples_handler.load_from_cache(1)
        assert prediction[0] == {
            "visible": False,
            "__type__": "update",
        }

    def test_caching_with_mix_update(self, patched_cache_folder, connect):
        io = gr.Interface(
            lambda x: [gr.update(lines=4, value="hello"), "test/test_files/bus.png"],
            "text",
            ["text", "image"],
            examples=[["World"], ["Dunya"], ["Monde"]],
            cache_examples=True,
        )
        with connect(io):
            prediction = io.examples_handler.load_from_cache(1)
        assert prediction[0] == {
            "lines": 4,
            "value": "hello",
            "__type__": "update",
        }

    def test_caching_with_dict(self, patched_cache_folder, connect):
        text = gr.Textbox()
        out = gr.Label()

        io = gr.Interface(
            lambda _: {text: gr.update(lines=4, interactive=False), out: "lion"},
            "textbox",
            [text, out],
            examples=["abc"],
            cache_examples=True,
        )
        with connect(io):
            prediction = io.examples_handler.load_from_cache(0)
        assert prediction == [
            {"lines": 4, "__type__": "update", "interactive": False},
            gr.Label.data_model(**{"label": "lion", "confidences": None}),  # type: ignore
        ]

    def test_caching_with_generators(self, patched_cache_folder, connect):
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
        with connect(io):
            prediction = io.examples_handler.load_from_cache(0)
        assert prediction[0] == "Your output: abcdef"

    def test_caching_with_generators_and_streamed_output(
        self, patched_cache_folder, connect
    ):
        audio = get_audio("audio_sample.wav")

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
        with connect(io):
            prediction = io.examples_handler.load_from_cache(0)
        len_input_audio = len(AudioSegment.from_file(audio))
        len_output_audio = len(AudioSegment.from_file(prediction[0].path))
        length_ratio = len_output_audio / len_input_audio
        assert 3 <= round(length_ratio, 1) < 4  # might not be exactly 3x
        assert float(prediction[1]) == 10.0

    def test_caching_with_async_generators(self, patched_cache_folder, connect):
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
        with connect(io):
            prediction = io.examples_handler.load_from_cache(0)
        assert prediction[0] == "Your output: abcdef"

    @pytest.mark.asyncio
    async def test_raise_helpful_error_message_if_providing_partial_examples(
        self, patched_cache_folder, tmp_path
    ):
        def foo(a, b):
            return a + b

        with pytest.warns(
            UserWarning,
            match="^Examples will be cached but not all input components have",
        ):
            with pytest.raises(Exception):
                io = gr.Interface(
                    foo,
                    inputs=["text", "text"],
                    outputs=["text"],
                    examples=[["foo"], ["bar"]],
                    cache_examples=True,
                )
                await io.examples_handler._start_caching()

        with pytest.warns(
            UserWarning,
            match="^Examples will be cached but not all input components have",
        ):
            with pytest.raises(Exception):
                io = gr.Interface(
                    foo,
                    inputs=["text", "text"],
                    outputs=["text"],
                    examples=[["foo", "bar"], ["bar", None]],
                    cache_examples=True,
                )
                await io.examples_handler._start_caching()

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
            match="^Examples will be cached but not all input components have",
        ):
            with pytest.raises(Exception):
                io = gr.Interface(
                    many_missing,
                    inputs=["text", "number", "number"],
                    outputs=["text"],
                    examples=[["foo", None, None], ["bar", 2, 3]],
                    cache_examples=True,
                )
                await io.examples_handler._start_caching()

    def test_caching_with_batch(self, patched_cache_folder, connect):
        def trim_words(words, lens):
            trimmed_words = [
                word[:length] for word, length in zip(words, lens, strict=False)
            ]
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
        with connect(io):
            prediction = io.examples_handler.load_from_cache(0)
        assert prediction == ["hel"]

    def test_caching_with_batch_multiple_outputs(self, patched_cache_folder, connect):
        def trim_words(words, lens):
            trimmed_words = [
                word[:length] for word, length in zip(words, lens, strict=False)
            ]
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
        with connect(io):
            prediction = io.examples_handler.load_from_cache(0)
        assert prediction == ["hel", 3]

    def test_caching_with_float_numbers(self, patched_cache_folder, connect):
        def foo(a, b):
            return a, b

        io = gr.Interface(
            foo,
            ["slider", "number"],
            ["slider", "number"],
            examples=[[1.7, 2.85]],
            cache_examples=True,
        )

        with connect(io):
            prediction = io.examples_handler.load_from_cache(0)
        assert prediction == [1.7, 2.85]

    def test_caching_with_non_io_component(self, patched_cache_folder, connect):
        def predict(name):
            return name, gr.update(visible=True)

        with gr.Blocks() as demo:
            t1 = gr.Textbox()
            with gr.Column(visible=False) as c:
                t2 = gr.Textbox()

            examples = gr.Examples(
                [["John"], ["Mary"]],
                fn=predict,
                inputs=[t1],
                outputs=[t2, c],  # type: ignore
                cache_examples=True,
            )

        with connect(demo):
            prediction = examples.load_from_cache(0)
        assert prediction == ["John", {"visible": True, "__type__": "update"}]

    def test_end_to_end(self, patched_cache_folder):
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

        response = client.post(f"{API_PREFIX}/api/load_example/", json={"data": [0]})
        assert response.json()["data"] == [
            {
                "lines": 1,
                "show_label": True,
                "container": True,
                "min_width": 160,
                "autofocus": False,
                "autoscroll": True,
                "elem_classes": [],
                "rtl": False,
                "__type__": "update",
                "visible": True,
                "preserved_by_key": ["value"],
                "value": "Hello,",
                "type": "text",
                "stop_btn": False,
                "submit_btn": False,
                "buttons": [],
            }
        ]

        response = client.post(f"{API_PREFIX}/api/load_example/", json={"data": [1]})
        assert response.json()["data"] == [
            {
                "lines": 1,
                "show_label": True,
                "container": True,
                "min_width": 160,
                "autofocus": False,
                "autoscroll": True,
                "elem_classes": [],
                "rtl": False,
                "preserved_by_key": ["value"],
                "__type__": "update",
                "visible": True,
                "value": "Michael",
                "type": "text",
                "stop_btn": False,
                "submit_btn": False,
                "buttons": [],
            }
        ]

    def test_end_to_end_cache_examples(self, patched_cache_folder):
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

        response = client.post(f"{API_PREFIX}/api/load_example/", json={"data": [0]})
        assert response.json()["data"] == ["Hello, World"]

        response = client.post(f"{API_PREFIX}/api/load_example/", json={"data": [1]})
        assert response.json()["data"] == ["Michael Jordan"]

    def test_end_to_end_lazy_cache_examples(self, patched_cache_folder):
        def image_identity(image, string):
            return image

        with gr.Blocks() as demo:
            i1 = gr.Image()
            t = gr.Textbox()
            i2 = gr.Image()

            gr.Examples(
                examples=[
                    [get_image("cheetah1.jpg"), "cheetah"],
                    ["test/test_files/bus.png", "bus"],
                ],
                inputs=[i1, t],
                outputs=[i2],
                fn=image_identity,
                cache_examples=True,
                cache_mode="lazy",
                api_name="load_example",
            )

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)

        response = client.post(f"{API_PREFIX}/api/load_example/", json={"data": [0]})
        data = response.json()["data"]
        assert data[0]["path"].endswith("image.webp")

        response = client.post(f"{API_PREFIX}/api/load_example/", json={"data": [1]})
        data = response.json()["data"]
        assert data[0]["path"].endswith("image.webp")


def test_multiple_file_flagging(tmp_path, connect):
    with patch("gradio.utils.get_cache_folder", return_value=tmp_path):
        io = gr.Interface(
            fn=lambda *x: list(x),
            inputs=[
                gr.Image(type="filepath", label="frame 1"),
                gr.Image(type="filepath", label="frame 2"),
            ],
            outputs=[gr.Files()],
            examples=[[get_image("cheetah1.jpg"), "test/test_files/bus.png"]],
            cache_examples=True,
        )
        with connect(io):
            prediction = io.examples_handler.load_from_cache(0)

        assert len(prediction[0].root) == 2
        assert all(isinstance(d, gr.FileData) for d in prediction[0].root)


def test_examples_keep_all_suffixes(tmp_path, connect):
    with patch("gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp())):
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
        with connect(io):
            prediction = io.examples_handler.load_from_cache(0)
        assert Path(prediction[0].path).read_text() == "file 1"
        assert prediction[0].orig_name == "foo.bar.txt"
        assert prediction[0].path.endswith("foo.bar.txt")
        prediction = io.examples_handler.load_from_cache(1)
        assert Path(prediction[0].path).read_text() == "file 2"
        assert prediction[0].orig_name == "foo.bar.txt"
        assert prediction[0].path.endswith("foo.bar.txt")


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
        assert demo.local_url

        client = grc.Client(demo.local_url)
        job = client.submit("Gradio")

        status_updates = []
        while not job.done():
            status = job.status()
            update = (
                status.progress_data[0].index if status.progress_data else None,
                status.progress_data[0].desc if status.progress_data else None,
            )
            if update != (None, None) and (
                len(status_updates) == 0 or status_updates[-1] != update
            ):
                status_updates.append(update)
            time.sleep(0.05)

        assert all(
            s
            in [
                (None, "start"),
                (0, None),
                (1, None),
                (2, None),
                (3, None),
                (4, None),
            ]
            for s in status_updates
        )

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
        assert demo.local_url

        client = grc.Client(demo.local_url)
        job = client.submit("Gradio")

        status_updates = []
        while not job.done():
            status = job.status()
            update = (
                status.progress_data[0].index if status.progress_data else None,
                status.progress_data[0].desc if status.progress_data else None,
            )
            if update != (None, None) and (
                len(status_updates) == 0 or status_updates[-1] != update
            ):
                status_updates.append(update)
            time.sleep(0.05)

        assert status_updates == [
            (None, "start"),
            (0, None),
            (1, None),
            (2, None),
            (3, None),
            (4, None),
            (0, "alphabet"),
            (1, "alphabet"),
            (2, "alphabet"),
        ]

    @pytest.mark.asyncio
    @pytest.mark.flaky(reruns=5)
    async def test_progress_bar_track_tqdm_without_iterable(self):
        def greet(s, _=gr.Progress(track_tqdm=True)):
            with tqdm(total=len(s)) as progress_bar:
                for _c in s:
                    progress_bar.update()
                    time.sleep(0.1)
            return f"Hello, {s}!"

        demo = gr.Interface(greet, "text", "text")
        demo.queue().launch(prevent_thread_lock=True)
        assert demo.local_url

        client = grc.Client(demo.local_url)
        job = client.submit("Gradio")

        status_updates = []
        while not job.done():
            status = job.status()
            update = (
                status.progress_data[0].index if status.progress_data else None,
                status.progress_data[0].unit if status.progress_data else None,
            )
            if update != (None, None) and (
                len(status_updates) == 0 or status_updates[-1] != update
            ):
                status_updates.append(update)
            time.sleep(0.05)

        assert status_updates[-1] == (6, "steps")

    @pytest.mark.asyncio
    async def test_info_and_warning_alerts(self):
        def greet(s):
            for _c in s:
                gr.Info(f"Letter {_c}")
                time.sleep(0.15)
            if len(s) < 5:
                gr.Warning("Too short!")
                time.sleep(0.15)
            return f"Hello, {s}!"

        demo = gr.Interface(greet, "text", "text")
        demo.queue().launch(prevent_thread_lock=True)
        assert demo.local_url

        client = grc.Client(demo.local_url)
        job = client.submit("Jon")

        status_updates = []
        while not job.done():
            status = job.status()
            update = status.log
            if update is not None and (
                len(status_updates) == 0 or status_updates[-1] != update
            ):
                status_updates.append(update)
            time.sleep(0.05)

        assert status_updates == [
            ("Letter J", "info"),
            ("Letter o", "info"),
            ("Letter n", "info"),
            ("Too short!", "warning"),
        ]


@pytest.mark.asyncio
@pytest.mark.parametrize("async_handler", [True, False])
async def test_info_isolation(async_handler: bool):
    async def greet_async(name):
        await asyncio.sleep(2)
        gr.Info(f"Hello {name}")
        await asyncio.sleep(1)
        return name

    def greet_sync(name):
        time.sleep(2)
        gr.Info(f"Hello {name}")
        time.sleep(1)
        return name

    demo = gr.Interface(
        greet_async if async_handler else greet_sync,
        "text",
        "text",
        concurrency_limit=2,
    )
    demo.launch(prevent_thread_lock=True)

    async def session_interaction(name, delay=0):
        assert demo.local_url
        client = grc.Client(demo.local_url)
        job = client.submit(name)

        status_updates = []
        while not job.done():
            status = job.status()
            update = status.log
            if update is not None and (
                len(status_updates) == 0 or status_updates[-1] != update
            ):
                status_updates.append(update)
            time.sleep(0.05)
        return status_updates[-1][0] if status_updates else None

    alice_logs, bob_logs = await asyncio.gather(
        session_interaction("Alice"),
        session_interaction("Bob", delay=1),
    )

    assert alice_logs == "Hello Alice"
    assert bob_logs == "Hello Bob"


def test_check_event_data_in_cache():
    def get_select_index(evt: gr.SelectData):
        return evt.index

    with pytest.raises(gr.Error):
        helpers.special_args(
            get_select_index,
            inputs=[],
            event_data=helpers.EventData(
                None,
                {
                    "index": {"path": "foo", "meta": {"_type": "gradio.FileData"}},
                    "value": "whatever",
                },
            ),
        )


def test_request_session_none_without_sessionmiddleware():
    from starlette.requests import Request

    def foo(a: int, prof: gr.OAuthProfile | None = None):
        return a

    inputs, *_ = helpers.special_args(
        foo,
        inputs=[5],
        request=Request(scope={"type": "http"}),  # type: ignore
    )
    assert inputs == [5, None]


def test_examples_no_cache_optional_inputs():
    def foo(a, b, c, d):
        return {"a": a, "b": b, "c": c, "d": d}

    io = gr.Interface(
        foo,
        ["text", "text", "text", "text"],
        "json",
        cache_examples=False,
        examples=[["a", "b", None, "d"], ["a", "b", None, "de"]],
        api_name="predict",
    )

    try:
        app, _, _ = io.launch(prevent_thread_lock=True)

        client = TestClient(app)
        with client as c:
            for i in range(2):
                response = c.post(
                    f"{API_PREFIX}/run/predict/",
                    json={
                        "data": [i],
                        "fn_index": 6,
                        "trigger_id": 19,
                        "session_hash": "test",
                    },
                )
                assert response.status_code == 200
    finally:
        io.close()
