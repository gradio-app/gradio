import time

import pytest

import gradio as gr


def invalid_fn(message):
    return message


def double(message, history):
    return message + " " + message


def stream(message, history):
    for i in range(len(message)):
        yield message[: i + 1]


def count(message, history):
    return str(len(history))


class TestInit:
    def test_no_fn(self):
        with pytest.raises(TypeError):
            gr.ChatInterface()

    def test_invalid_fn_inputs(self):
        with pytest.warns(UserWarning):
            gr.ChatInterface(invalid_fn)

    def test_configuring_buttons(self):
        chatbot = gr.ChatInterface(double, submit_btn=None, retry_btn=None)
        assert chatbot.submit_btn is None
        assert chatbot.retry_btn is None

    def test_events_attached(self):
        chatbot = gr.ChatInterface(double)
        dependencies = chatbot.dependencies
        textbox = chatbot.textbox._id
        assert next(
            (
                d
                for d in dependencies
                if d["targets"] == [textbox] and d["trigger"] == "submit"
            ),
            None,
        )
        for btn_id in [
            chatbot.submit_btn._id,
            chatbot.retry_btn._id,
            chatbot.clear_btn._id,
            chatbot.undo_btn._id,
        ]:
            assert next(
                (
                    d
                    for d in dependencies
                    if d["targets"] == [btn_id] and d["trigger"] == "click"
                ),
                None,
            )

    @pytest.mark.asyncio
    async def test_example_caching(self):
        chatbot = gr.ChatInterface(
            double, examples=["hello", "hi"], cache_examples=True
        )
        prediction_hello = await chatbot.examples_handler.load_from_cache(0)
        prediction_hi = await chatbot.examples_handler.load_from_cache(1)
        assert prediction_hello[0][0] == ["hello", "hello hello"]
        assert prediction_hi[0][0] == ["hi", "hi hi"]

    @pytest.mark.asyncio
    async def test_example_caching_with_streaming(self):
        chatbot = gr.ChatInterface(
            stream, examples=["hello", "hi"], cache_examples=True
        )
        prediction_hello = await chatbot.examples_handler.load_from_cache(0)
        prediction_hi = await chatbot.examples_handler.load_from_cache(1)
        assert prediction_hello[0][0] == ["hello", "hello"]
        assert prediction_hi[0][0] == ["hi", "hi"]


class TestAPI:
    def test_get_api_info(self):
        chatbot = gr.ChatInterface(double)
        api_info = gr.blocks.get_api_info(chatbot.get_config_file())
        assert len(api_info["named_endpoints"]) == 1
        assert len(api_info["unnamed_endpoints"]) == 0
        assert "/chat" in api_info["named_endpoints"]

    def test_streaming_api(self, connect):
        chatbot = gr.ChatInterface(stream).queue()
        with connect(chatbot) as client:
            job = client.submit("hello")
            while not job.done():
                time.sleep(0.1)
            assert job.outputs() == ["h", "he", "hel", "hell", "hello"]

    def test_non_streaming_api(self, connect):
        chatbot = gr.ChatInterface(double)
        with connect(chatbot) as client:
            result = client.predict("hello")
            assert result == "hello hello"
