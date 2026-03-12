import tempfile
import warnings
from concurrent.futures import wait
from pathlib import Path
from unittest.mock import patch

import pytest
from gradio_client import handle_file

import gradio as gr
from gradio.components.chatbot import Message, TextMessage


def invalid_fn(message):
    return message


def double(message, history):
    return message + " " + message


async def async_greet(message, history):
    return "hi, " + message


def stream(message, history):
    for i in range(len(message)):
        yield message[: i + 1]


async def async_stream(message, history):
    for i in range(len(message)):
        yield message[: i + 1]


def count(message, history):
    return str(len(history))


def echo_system_prompt_plus_message(message, history, system_prompt, tokens):
    response = f"{system_prompt} {message}"
    for i in range(min(len(response), int(tokens))):
        yield response[: i + 1]


class TestInit:
    def test_no_fn(self):
        with pytest.raises(TypeError):
            gr.ChatInterface()  # type: ignore

    def test_concurrency_limit(self):
        chat = gr.ChatInterface(double, concurrency_limit=10)
        assert chat.concurrency_limit == 10
        fns = [
            fn
            for fn in chat.fns.values()
            if fn.name in {"_submit_fn", "_api_submit_fn"}
        ]
        assert all(fn.concurrency_limit == 10 for fn in fns)

    def test_custom_textbox(self):
        def chat():
            return "Hello"

        gr.ChatInterface(
            chat,
            chatbot=gr.Chatbot(height=400),
            textbox=gr.Textbox(placeholder="Type Message", container=False, scale=7),
            title="Test",
        )
        gr.ChatInterface(
            chat,
            chatbot=gr.Chatbot(height=400),
            textbox=gr.MultimodalTextbox(container=False, scale=7),
            title="Test",
        )

    def test_events_attached(self):
        chatbot = gr.ChatInterface(double)
        dependencies = chatbot.fns.values()
        textbox = chatbot.textbox._id
        assert next(
            (d for d in dependencies if d.targets == [(textbox, "submit")]),
            None,
        )

    def test_example_caching(self, connect):
        with patch(
            "gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp())
        ):
            chatbot = gr.ChatInterface(
                double, examples=["hello", "hi"], cache_examples=True
            )
            with connect(chatbot):
                prediction_hello = chatbot.examples_handler.load_from_cache(0)
                prediction_hi = chatbot.examples_handler.load_from_cache(1)
            assert prediction_hello[0].root == [
                Message(role="user", content=[TextMessage(text="hello")]),
                Message(role="assistant", content=[TextMessage(text="hello hello")]),
            ]
            assert prediction_hi[0].root == [
                Message(role="user", content=[TextMessage(text="hi")]),
                Message(role="assistant", content=[TextMessage(text="hi hi")]),
            ]

    @pytest.mark.asyncio
    async def test_example_caching_lazy(self):
        with patch(
            "gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp())
        ):
            chatbot = gr.ChatInterface(
                double,
                examples=["hello", "hi"],
                cache_examples=True,
                cache_mode="lazy",
            )
            prediction_hello = chatbot.examples_handler.load_from_cache(0)
            assert prediction_hello[0].root == [
                Message(role="user", content=[TextMessage(text="hello")]),
                Message(role="assistant", content=[TextMessage(text="hello hello")]),
            ]
            prediction_hi = chatbot.examples_handler.load_from_cache(1)
            assert prediction_hi[0].root == [
                Message(role="user", content=[TextMessage(text="hi")]),
                Message(role="assistant", content=[TextMessage(text="hi hi")]),
            ]

    def test_example_caching_async(self, connect):
        with patch(
            "gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp())
        ):
            chatbot = gr.ChatInterface(
                async_greet, examples=["abubakar", "tom"], cache_examples=True
            )

            with connect(chatbot):
                prediction_hello = chatbot.examples_handler.load_from_cache(0)
                prediction_hi = chatbot.examples_handler.load_from_cache(1)
            assert prediction_hello[0].root == [
                Message(role="user", content=[TextMessage(text="abubakar")]),
                Message(role="assistant", content=[TextMessage(text="hi, abubakar")]),
            ]
            assert prediction_hi[0].root == [
                Message(role="user", content=[TextMessage(text="tom")]),
                Message(role="assistant", content=[TextMessage(text="hi, tom")]),
            ]

    def test_example_caching_with_streaming(self, connect):
        with patch(
            "gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp())
        ):
            chatbot = gr.ChatInterface(
                stream, examples=["hello", "hi"], cache_examples=True
            )
            with connect(chatbot):
                prediction_hello = chatbot.examples_handler.load_from_cache(0)
                prediction_hi = chatbot.examples_handler.load_from_cache(1)
            assert prediction_hello[0].root == [
                Message(role="user", content=[TextMessage(text="hello")]),
                Message(role="assistant", content=[TextMessage(text="hello")]),
            ]
            assert prediction_hi[0].root == [
                Message(role="user", content=[TextMessage(text="hi")]),
                Message(role="assistant", content=[TextMessage(text="hi")]),
            ]

    def test_example_caching_with_streaming_async(self, connect):
        with patch(
            "gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp())
        ):
            chatbot = gr.ChatInterface(
                async_stream, examples=["hello", "hi"], cache_examples=True
            )
            with connect(chatbot):
                prediction_hello = chatbot.examples_handler.load_from_cache(0)
                prediction_hi = chatbot.examples_handler.load_from_cache(1)
            assert prediction_hello[0].root == [
                Message(role="user", content=[TextMessage(text="hello")]),
                Message(role="assistant", content=[TextMessage(text="hello")]),
            ]
            assert prediction_hi[0].root == [
                Message(role="user", content=[TextMessage(text="hi")]),
                Message(role="assistant", content=[TextMessage(text="hi")]),
            ]

    def test_default_accordion_params(self):
        chatbot = gr.ChatInterface(
            echo_system_prompt_plus_message,
            additional_inputs=["textbox", "slider"],
        )
        accordion = [
            comp
            for comp in chatbot.blocks.values()
            if comp.get_config().get("name") == "accordion"
        ][0]
        assert accordion.get_config().get("open") is False
        assert (
            accordion.get_config().get("label").key  # type: ignore
            == "chat_interface.additional_inputs"
        )

    def test_setting_accordion_params(self, monkeypatch):
        chatbot = gr.ChatInterface(
            echo_system_prompt_plus_message,
            additional_inputs=["textbox", "slider"],
            additional_inputs_accordion=gr.Accordion(open=True, label="MOAR"),
        )
        accordion = [
            comp
            for comp in chatbot.blocks.values()
            if comp.get_config().get("name") == "accordion"
        ][0]
        assert accordion.get_config().get("open") is True
        assert accordion.get_config().get("label") == "MOAR"

    def test_example_caching_with_additional_inputs(self, monkeypatch, connect):
        with patch(
            "gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp())
        ):
            chatbot = gr.ChatInterface(
                echo_system_prompt_plus_message,
                additional_inputs=["textbox", "slider"],
                examples=[["hello", "robot", 100], ["hi", "robot", 2]],
                cache_examples=True,
            )
            with connect(chatbot):
                prediction_hello = chatbot.examples_handler.load_from_cache(0)
                prediction_hi = chatbot.examples_handler.load_from_cache(1)
            assert prediction_hello[0].root == [
                Message(role="user", content=[TextMessage(text="hello")]),
                Message(role="assistant", content=[TextMessage(text="robot hello")]),
            ]
            assert prediction_hi[0].root == [
                Message(role="user", content=[TextMessage(text="hi")]),
                Message(role="assistant", content=[TextMessage(text="ro")]),
            ]

    def test_example_caching_with_additional_inputs_already_rendered(
        self, monkeypatch, connect
    ):
        with patch(
            "gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp())
        ):
            with gr.Blocks() as demo:
                with gr.Accordion("Inputs"):
                    text = gr.Textbox()
                    slider = gr.Slider()
                    chatbot = gr.ChatInterface(
                        echo_system_prompt_plus_message,
                        additional_inputs=[text, slider],
                        examples=[["hello", "robot", 100], ["hi", "robot", 2]],
                        cache_examples=True,
                    )
            with connect(demo):
                prediction_hello = chatbot.examples_handler.load_from_cache(0)
                prediction_hi = chatbot.examples_handler.load_from_cache(1)
            assert prediction_hello[0].root == [
                Message(role="user", content=[TextMessage(text="hello")]),
                Message(role="assistant", content=[TextMessage(text="robot hello")]),
            ]
            assert prediction_hi[0].root == [
                Message(role="user", content=[TextMessage(text="hi")]),
                Message(role="assistant", content=[TextMessage(text="ro")]),
            ]

    def test_custom_chatbot_with_events(self):
        with gr.Blocks() as demo:
            chatbot = gr.Chatbot()
            chatbot.like(lambda: None, None, None)
            gr.ChatInterface(fn=lambda x, y: x, chatbot=chatbot)
        dependencies = demo.fns.values()
        assert next(
            (d for d in dependencies if d.targets == [(chatbot._id, "like")]),
            None,
        )


class TestAPI:
    def test_get_api_info(self):
        chatbot = gr.ChatInterface(double, api_name="chat")
        api_info = chatbot.get_api_info()
        assert api_info
        assert len(api_info["named_endpoints"]) == 1
        assert len(api_info["unnamed_endpoints"]) == 0
        assert "/chat" in api_info["named_endpoints"]

    def test_streaming_api(self, connect):
        chatbot = gr.ChatInterface(stream).queue()
        with connect(chatbot) as client:
            job = client.submit("hello")
            wait([job])
            assert job.outputs() == ["h", "he", "hel", "hell", "hello"]

    def test_streaming_api_async(self, connect):
        chatbot = gr.ChatInterface(async_stream).queue()
        with connect(chatbot) as client:
            job = client.submit("hello")
            wait([job])
            assert job.outputs() == ["h", "he", "hel", "hell", "hello"]

    def test_non_streaming_api(self, connect):
        chatbot = gr.ChatInterface(double)
        with connect(chatbot) as client:
            result = client.predict("hello")
            assert result == "hello hello"

    def test_non_streaming_api_default(self, connect):
        chatbot = gr.ChatInterface(double, api_name="double")
        with connect(chatbot) as client:
            result = client.predict("hello", api_name="/double")
            assert result == "hello hello"

    def test_non_streaming_api_async(self, connect):
        chatbot = gr.ChatInterface(async_greet)
        with connect(chatbot) as client:
            result = client.predict("gradio")
            assert result == "hi, gradio"

    def test_streaming_api_with_additional_inputs(self, connect):
        chatbot = gr.ChatInterface(
            echo_system_prompt_plus_message,
            additional_inputs=["textbox", "slider"],
        ).queue()
        with connect(chatbot) as client:
            job = client.submit("hello", "robot", 7)
            wait([job])
            assert job.outputs() == [
                "r",
                "ro",
                "rob",
                "robo",
                "robot",
                "robot ",
                "robot h",
            ]

    def test_multimodal_api(self, connect):
        def double_multimodal(msg, history):
            return msg["text"] + " " + msg["text"]

        chatbot = gr.ChatInterface(
            double_multimodal,
            multimodal=True,
            api_name="chat",
        )
        with connect(chatbot) as client:
            result = client.predict({"text": "hello", "files": []}, api_name="/chat")
            assert result == "hello hello"

    def test_component_returned(self, connect):
        def mock_chat_fn(msg, history):
            return gr.Audio("test/test_files/audio_sample.wav")

        chatbot = gr.ChatInterface(
            mock_chat_fn,
            multimodal=True,
            api_name="chat",
        )
        with connect(chatbot) as client:
            result = client.predict(
                {
                    "text": "hello",
                    "files": [handle_file("test/test_files/audio_sample.wav")],
                },
                api_name="/chat",
            )
            assert result["value"] == "test/test_files/audio_sample.wav"

    def test_multiple_messages(self, connect):
        def multiple_messages(msg, history):
            return [msg["text"], msg["text"]]

        chatbot = gr.ChatInterface(
            multiple_messages,
            multimodal=True,
            api_name="chat",
        )
        with connect(chatbot) as client:
            result = client.predict({"text": "hello", "files": []}, api_name="/chat")
            assert result == ["hello", "hello"]


class TestExampleMessages:
    def test_setup_example_messages_with_strings(self):
        chat = gr.ChatInterface(
            double,
            examples=["hello", "hi", "hey"],
            example_labels=["Greeting 1", "Greeting 2", "Greeting 3"],
        )
        assert len(chat.examples_messages) == 3
        assert chat.examples_messages[0] == {
            "text": "hello",
            "display_text": "Greeting 1",
        }
        assert chat.examples_messages[1] == {
            "text": "hi",
            "display_text": "Greeting 2",
        }
        assert chat.examples_messages[2] == {
            "text": "hey",
            "display_text": "Greeting 3",
        }

    def test_setup_example_messages_with_multimodal(self):
        chat = gr.ChatInterface(
            double,
            examples=[  # type: ignore
                {"text": "hello", "files": ["file1.txt"]},
                {"text": "hi", "files": ["file2.txt", "file3.txt"]},
                {"text": "", "files": ["file4.txt"]},
            ],
        )
        assert len(chat.examples_messages) == 3
        assert chat.examples_messages[0]["text"] == "hello"  # type: ignore
        assert chat.examples_messages[0]["files"][0]["path"].endswith("file1.txt")  # type: ignore

    def test_setup_example_messages_with_lists(self):
        chat = gr.ChatInterface(
            double,
            examples=[
                ["hello", "other_value"],
                ["hi", "another_value"],
            ],
        )
        assert len(chat.examples_messages) == 2
        assert chat.examples_messages[0] == {"text": "hello"}
        assert chat.examples_messages[1] == {"text": "hi"}

    def test_setup_example_messages_empty(self):
        chat = gr.ChatInterface(double)
        chat._setup_example_messages(None)
        assert chat.examples_messages == []

    def test_chat_interface_api_name(self, connect):
        chat = gr.ChatInterface(double, api_visibility="private")
        assert chat.api_visibility == "private"
        with connect(chat) as client:
            assert client.view_api(return_format="dict")["named_endpoints"] == {}
        chat = gr.ChatInterface(double, api_name="double")
        with connect(chat) as client:
            assert "/double" in client.view_api(return_format="dict")["named_endpoints"]

    def test_chat_interface_api_names_with_additional_inputs(self, connect):
        def response(message, history, random_number: int):
            return str(random_number)

        chat = gr.ChatInterface(
            response,
            additional_inputs=[gr.Textbox(label="Random number")],
            api_name="chat",
        )
        with connect(chat) as client:
            endpoints = client.view_api(return_format="dict")["named_endpoints"]
            assert "/chat" in endpoints
            assert any(
                p["parameter_name"] == "random_number"
                for p in endpoints["/chat"]["parameters"]
            )

    def test_example_icons_set_if_multimodal_false(self):
        demo = gr.ChatInterface(
            fn=double,
            title="🌤️ Weather Assistant",
            description="Ask about the weather anywhere! Watch as I gather the information step by step.",
            examples=[
                "What's the weather like in Tokyo?",
                "Is it sunny in Paris right now?",
                "Should I bring an umbrella in New York today?",
            ],
            example_icons=[
                "https://cdn3.iconfinder.com/data/icons/landmark-outline/432/japan_tower_tokyo_landmark_travel_architecture_tourism_view-256.png",
                "https://cdn2.iconfinder.com/data/icons/city-building-1/200/ArcdeTriomphe-256.png",
                "https://cdn2.iconfinder.com/data/icons/city-icons-for-offscreen-magazine/80/new-york-256.png",
            ],
        )
        assert len(demo.examples_messages) == 3
        assert (
            demo.examples_messages[0].get("icon", {}).get("url")  # type: ignore
            == "https://cdn3.iconfinder.com/data/icons/landmark-outline/432/japan_tower_tokyo_landmark_travel_architecture_tourism_view-256.png"
        )
        assert (
            demo.examples_messages[1].get("icon", {}).get("url")  # type: ignore
            == "https://cdn2.iconfinder.com/data/icons/city-building-1/200/ArcdeTriomphe-256.png"
        )
        assert (
            demo.examples_messages[2].get("icon", {}).get("url")  # type: ignore
            == "https://cdn2.iconfinder.com/data/icons/city-icons-for-offscreen-magazine/80/new-york-256.png"
        )


def chat(message, history):
    return f"Echo: {message}"


class TestTextboxParameterConflicts:
    """Test that warnings are shown for conflicting textbox parameters."""

    def test_warning_with_custom_textbox_and_submit_btn(self):
        """Should warn when submit_btn is set on ChatInterface with custom Textbox."""
        with pytest.warns(UserWarning, match="submit_btn.*will be ignored"):
            gr.ChatInterface(
                chat,
                textbox=gr.Textbox(placeholder="Custom textbox"),
                submit_btn="submit",
            )

    def test_warning_with_custom_textbox_and_stop_btn(self):
        """Should warn when stop_btn is set on ChatInterface with custom Textbox."""
        with pytest.warns(UserWarning, match="stop_btn.*will be ignored"):
            gr.ChatInterface(
                chat,
                textbox=gr.Textbox(placeholder="Custom textbox"),
                stop_btn="Stop",
            )

    def test_warning_with_multiple_conflicts(self):
        """Should warn about all conflicting parameters."""
        with pytest.warns(UserWarning, match="submit_btn.*stop_btn.*will be ignored"):
            gr.ChatInterface(
                chat,
                textbox=gr.Textbox(placeholder="Custom textbox"),
                submit_btn="Send",
                stop_btn="Stop",
            )

    def test_no_warning_when_params_set_on_textbox(self):
        """Should NOT warn when params are correctly set on the textbox itself."""
        with warnings.catch_warnings():
            warnings.simplefilter("error")

            gr.ChatInterface(
                chat,
                textbox=gr.Textbox(placeholder="Custom textbox", submit_btn="submit"),
            )

    def test_no_warning_without_custom_textbox(self):
        """Should NOT warn when using default textbox with ChatInterface params."""
        with warnings.catch_warnings():
            warnings.simplefilter("error")

            gr.ChatInterface(
                chat,
                submit_btn="Submit",
            )

    def test_no_warning_when_textbox_already_has_matching_value(self):
        """Should NOT warn if textbox already has the same value as ChatInterface param."""
        with warnings.catch_warnings():
            warnings.simplefilter("error")

            gr.ChatInterface(
                chat,
                textbox=gr.Textbox(placeholder="Test", submit_btn="Send"),
                submit_btn="Send",
            )

    def test_warning_with_multimodal_textbox(self):
        """Should warn for MultimodalTextbox conflicts too."""
        with pytest.warns(UserWarning, match="stop_btn.*will be ignored"):
            gr.ChatInterface(
                chat,
                multimodal=True,
                textbox=gr.MultimodalTextbox(placeholder="Custom"),
                stop_btn="Stop",
            )

    def test_no_warning_multimodal_with_correct_usage(self):
        """Should NOT warn when MultimodalTextbox params are set correctly."""
        with warnings.catch_warnings():
            warnings.simplefilter("error")
            gr.ChatInterface(
                chat,
                multimodal=True,
                textbox=gr.MultimodalTextbox(placeholder="Custom", stop_btn="Stop"),
            )
