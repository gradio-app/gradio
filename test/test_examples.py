import os

import pytest

import gradio as gr

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestExamples:
    @pytest.mark.asyncio
    async def test_handle_single_input(self):
        examples = await gr.Examples(["hello", "hi"], gr.Textbox()).create()
        assert examples.processed_examples == [["hello"], ["hi"]]

        examples = await gr.Examples([["hello"]], gr.Textbox()).create()
        assert examples.processed_examples == [["hello"]]

        examples = await gr.Examples(["test/test_files/bus.png"], gr.Image()).create()
        assert examples.processed_examples == [[gr.media_data.BASE64_IMAGE]]

    @pytest.mark.asyncio
    async def test_handle_multiple_inputs(self):
        examples = await gr.Examples(
            [["hello", "test/test_files/bus.png"]], [gr.Textbox(), gr.Image()]
        ).create()
        assert examples.processed_examples == [["hello", gr.media_data.BASE64_IMAGE]]

    @pytest.mark.asyncio
    async def test_handle_directory(self):
        examples = await gr.Examples("test/test_files/images", gr.Image()).create()
        assert examples.processed_examples == [
            [gr.media_data.BASE64_IMAGE],
            [gr.media_data.BASE64_IMAGE],
        ]

    @pytest.mark.asyncio
    async def test_handle_directory_with_log_file(self):
        examples = await gr.Examples(
            "test/test_files/images_log", [gr.Image(label="im"), gr.Text()]
        ).create()
        assert examples.processed_examples == [
            [gr.media_data.BASE64_IMAGE, "hello"],
            [gr.media_data.BASE64_IMAGE, "hi"],
        ]


class TestExamplesDataset:
    @pytest.mark.asyncio
    async def test_no_headers(self):
        examples = await gr.Examples(
            "test/test_files/images_log", [gr.Image(), gr.Text()]
        ).create()
        assert examples.dataset.headers == []

    @pytest.mark.asyncio
    async def test_all_headers(self):
        examples = await gr.Examples(
            "test/test_files/images_log",
            [gr.Image(label="im"), gr.Text(label="your text")],
        ).create()
        assert examples.dataset.headers == ["im", "your text"]

    @pytest.mark.asyncio
    async def test_some_headers(self):
        examples = await gr.Examples(
            "test/test_files/images_log", [gr.Image(label="im"), gr.Text()]
        ).create()
        assert examples.dataset.headers == ["im", ""]


class TestProcessExamples:
    @pytest.mark.asyncio
    async def test_process_example(self):
        io = gr.Interface(lambda x: "Hello " + x, "text", "text", examples=[["World"]])
        prediction = await io.examples_handler.process_example(0)
        assert prediction[0] == "Hello World"

    @pytest.mark.asyncio
    async def test_caching(self):
        io = gr.Interface(
            lambda x: "Hello " + x,
            "text",
            "text",
            examples=[["World"], ["Dunya"], ["Monde"]],
        )
        io.launch(prevent_thread_lock=True)
        await io.examples_handler.cache_interface_examples()
        prediction = await io.examples_handler.load_from_cache(1)
        io.close()
        assert prediction[0] == "Hello Dunya"
