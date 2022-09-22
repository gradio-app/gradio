import filecmp
import os
import tempfile
from unittest.mock import patch

import pytest

import gradio as gr
from gradio import processing_utils

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestExamples:
    def test_handle_single_input(self):
        examples = gr.Examples(["hello", "hi"], gr.Textbox())
        assert examples.processed_examples == [["hello"], ["hi"]]

        examples = gr.Examples([["hello"]], gr.Textbox())
        assert examples.processed_examples == [["hello"]]

        examples = gr.Examples(["test/test_files/bus.png"], gr.Image())

        tmp_filename = examples.processed_examples[0][0]["name"]
        assert tmp_filename is not None

        assert filecmp.cmp(tmp_filename, "test/test_files/bus.png")

    def test_handle_multiple_inputs(self):
        examples = gr.Examples(
            [["hello", "test/test_files/bus.png"]], [gr.Textbox(), gr.Image()]
        )
        assert examples.processed_examples[0][0] == "hello"
        tmp_filename = examples.processed_examples[0][1]["name"]
        assert tmp_filename is not None
        assert filecmp.cmp(tmp_filename, "test/test_files/bus.png")

    def test_handle_directory(self):
        examples = gr.Examples("test/test_files/images", gr.Image())

        tmp_filename = examples.processed_examples[0][0]["name"]
        assert tmp_filename is not None
        assert filecmp.cmp(tmp_filename, "test/test_files/bus.png")

        tmp_filename = examples.processed_examples[1][0]["name"]
        assert tmp_filename is not None
        assert filecmp.cmp(tmp_filename, "test/test_files/images/bus_copy.png")

    def test_handle_directory_with_log_file(self):
        examples = gr.Examples(
            "test/test_files/images_log", [gr.Image(label="im"), gr.Text()]
        )

        tmp_filename = examples.processed_examples[0][0]["name"]
        assert tmp_filename is not None
        assert filecmp.cmp(tmp_filename, "test/test_files/images_log/im/bus.png")
        assert examples.processed_examples[0][1] == "hello"

        tmp_filename = examples.processed_examples[1][0]["name"]
        assert tmp_filename is not None
        assert filecmp.cmp(tmp_filename, "test/test_files/images_log/im/bus_copy.png")
        assert examples.processed_examples[1][1] == "hi"


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


@patch("gradio.examples.CACHED_FOLDER", tempfile.mkdtemp())
class TestProcessExamples:
    @pytest.mark.asyncio
    async def test_predict_example(self):
        io = gr.Interface(lambda x: "Hello " + x, "text", "text", examples=[["World"]])
        prediction = await io.examples_handler.predict_example(0)
        assert prediction[0] == "Hello World"

    @pytest.mark.asyncio
    async def test_coroutine_process_example(self):
        async def coroutine(x):
            return "Hello " + x

        io = gr.Interface(coroutine, "text", "text", examples=[["World"]])
        prediction = await io.examples_handler.predict_example(0)
        assert prediction[0] == "Hello World"

    @pytest.mark.asyncio
    async def test_caching(self):
        io = gr.Interface(
            lambda x: "Hello " + x,
            "text",
            "text",
            examples=[["World"], ["Dunya"], ["Monde"]],
        )
        await io.examples_handler.cache_interface_examples()
        prediction = await io.examples_handler.load_from_cache(1)
        assert prediction[0] == "Hello Dunya"

    @pytest.mark.asyncio
    async def test_caching_image(self):
        io = gr.Interface(
            lambda x: x,
            "image",
            "image",
            examples=[["test/test_files/bus.png"]],
        )
        io.launch(prevent_thread_lock=True)
        await io.examples_handler.cache_interface_examples()
        prediction = await io.examples_handler.load_from_cache(0)
        io.close()
        assert prediction[0]["data"].startswith("data:image/png;base64,iVBORw0KGgoAAA")

    @pytest.mark.asyncio
    async def test_caching_audio(self):
        io = gr.Interface(
            lambda x: x,
            "audio",
            "audio",
            examples=[["test/test_files/audio_sample.wav"]],
        )
        io.launch(prevent_thread_lock=True)
        await io.examples_handler.cache_interface_examples()
        prediction = await io.examples_handler.load_from_cache(0)
        io.close()
        assert prediction[0]["data"].startswith("data:audio/wav;base64,UklGRgA/")

    async def test_caching_with_update(self):
        io = gr.Interface(
            lambda x: gr.update(visible=False),
            "text",
            "image",
            examples=[["World"], ["Dunya"], ["Monde"]],
        )
        await io.examples_handler.cache_interface_examples()
        prediction = await io.examples_handler.load_from_cache(1)
        assert prediction[0] == {"visible": False, "__type__": "update"}

    @pytest.mark.asyncio
    async def test_caching_with_mix_update(self):
        io = gr.Interface(
            lambda x: [gr.update(lines=4, value="hello"), "test/test_files/bus.png"],
            "text",
            ["text", "image"],
            examples=[["World"], ["Dunya"], ["Monde"]],
        )
        await io.examples_handler.cache_interface_examples()
        prediction = await io.examples_handler.load_from_cache(1)
        assert prediction[0] == {"lines": 4, "value": "hello", "__type__": "update"}

    @pytest.mark.asyncio
    async def test_caching_with_dict(self):
        text = gr.Textbox()
        out = gr.Label()

        io = gr.Interface(
            lambda _: {text: gr.update(lines=4), out: "lion"},
            "textbox",
            [text, out],
            examples=["abc"],
            cache_examples=True,
        )
        await io.examples_handler.cache_interface_examples()
        prediction = await io.examples_handler.load_from_cache(0)
        assert prediction == [{"lines": 4, "__type__": "update"}, {"label": "lion"}]

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
