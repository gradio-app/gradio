import os
import tempfile
from unittest.mock import patch

import pytest

import gradio as gr

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


@patch("gradio.examples.CACHED_FOLDER", tempfile.mkdtemp())
class TestExamples:
    def test_handle_single_input(self):
        examples = gr.Examples(["hello", "hi"], gr.Textbox())
        assert examples.processed_examples == [["hello"], ["hi"]]

        examples = gr.Examples([["hello"]], gr.Textbox())
        assert examples.processed_examples == [["hello"]]

        examples = gr.Examples(["test/test_files/bus.png"], gr.Image())
        assert examples.processed_examples == [[gr.media_data.BASE64_IMAGE]]

    def test_handle_multiple_inputs(self):
        examples = gr.Examples(
            [["hello", "test/test_files/bus.png"]], [gr.Textbox(), gr.Image()]
        )
        assert examples.processed_examples == [["hello", gr.media_data.BASE64_IMAGE]]

    def test_handle_directory(self):
        examples = gr.Examples("test/test_files/images", gr.Image())
        assert examples.processed_examples == [
            [gr.media_data.BASE64_IMAGE],
            [gr.media_data.BASE64_IMAGE],
        ]

    def test_handle_directory_with_log_file(self):
        examples = gr.Examples(
            "test/test_files/images_log", [gr.Image(label="im"), gr.Text()]
        )
        assert examples.processed_examples == [
            [gr.media_data.BASE64_IMAGE, "hello"],
            [gr.media_data.BASE64_IMAGE, "hi"],
        ]

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
        assert prediction == [gr.media_data.BASE64_IMAGE]

    @pytest.mark.asyncio
    async def test_no_postprocessing(self):
        def im(x):
            return [gr.media_data.BASE64_IMAGE]

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
        assert prediction[0][0]["data"] == gr.media_data.BASE64_IMAGE


@patch("gradio.examples.CACHED_FOLDER", tempfile.mkdtemp())
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
    async def test_caching(self):
        io = gr.Interface(
            lambda x: "Hello " + x,
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
            trimmed_words = []
            for w, l in zip(words, lens):
                trimmed_words.append(w[:l])
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
            trimmed_words = []
            for w, l in zip(words, lens):
                trimmed_words.append(w[:l])
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
