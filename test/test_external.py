import os
import tempfile
import textwrap
from pathlib import Path
from unittest.mock import MagicMock, patch

import huggingface_hub
import pytest

import gradio as gr
from gradio.context import Context
from gradio.exceptions import GradioVersionIncompatibleError, InvalidApiNameError
from gradio.external import TooManyRequestsError
from gradio.external_utils import cols_to_rows, get_tabular_examples

"""
WARNING: These tests have an external dependency: namely that Hugging Face's
Hub and Space APIs do not change, and they keep their most famous models up.
So if, e.g. Spaces is down, then these test will not pass.

These tests actually test gr.load() and gr.Blocks.load() but are
included in a separate file because of the above-mentioned dependency.
"""

# Mark the whole module as flaky
pytestmark = pytest.mark.flaky

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

HF_TOKEN = huggingface_hub.get_token()


class TestLoadInterface:
    def test_audio_to_audio(self):
        model_type = "audio-to-audio"
        interface = gr.load(
            name="speechbrain/mtl-mimic-voicebank",
            src="models",
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Audio)
        assert isinstance(interface.output_components[0], gr.Audio)

    def test_question_answering(self):
        model_type = "image-classification"
        interface = gr.load(
            name="lysandre/tiny-vit-random",
            src="models",
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Image)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_text_generation(self):
        model_type = "text_generation"
        interface = gr.load(
            "models/gpt2", alias=model_type, description="This is a test description"
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Textbox)
        assert any(
            "This is a test description" in d["props"].get("value", "")
            for d in interface.get_config_file()["components"]
        )

    def test_summarization(self):
        model_type = "summarization"
        interface = gr.load(
            "models/facebook/bart-large-cnn", hf_token=HF_TOKEN, alias=model_type
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Textbox)

    def test_translation(self):
        model_type = "translation"
        interface = gr.load(
            "models/facebook/bart-large-cnn", hf_token=HF_TOKEN, alias=model_type
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Textbox)

    def test_text_classification(self):
        model_type = "text-classification"
        interface = gr.load(
            "models/distilbert-base-uncased-finetuned-sst-2-english",
            hf_token=HF_TOKEN,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_fill_mask(self):
        model_type = "fill-mask"
        interface = gr.load(
            "models/bert-base-uncased", hf_token=HF_TOKEN, alias=model_type
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_zero_shot_classification(self):
        model_type = "zero-shot-classification"
        interface = gr.load(
            "models/facebook/bart-large-mnli", hf_token=HF_TOKEN, alias=model_type
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.input_components[1], gr.Textbox)
        assert isinstance(interface.input_components[2], gr.Checkbox)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_automatic_speech_recognition(self):
        model_type = "automatic-speech-recognition"
        interface = gr.load(
            "models/facebook/wav2vec2-base-960h", hf_token=HF_TOKEN, alias=model_type
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Audio)
        assert isinstance(interface.output_components[0], gr.Textbox)

    def test_image_classification(self):
        model_type = "image-classification"
        interface = gr.load(
            "models/google/vit-base-patch16-224", hf_token=HF_TOKEN, alias=model_type
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Image)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_feature_extraction(self):
        model_type = "feature-extraction"
        interface = gr.load(
            "models/sentence-transformers/distilbert-base-nli-mean-tokens",
            hf_token=HF_TOKEN,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Dataframe)

    def test_sentence_similarity(self):
        model_type = "text-to-speech"
        interface = gr.load(
            "models/julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            hf_token=HF_TOKEN,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Audio)

    def test_text_to_speech(self):
        model_type = "text-to-speech"
        interface = gr.load(
            "models/julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            hf_token=HF_TOKEN,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert interface.input_components and interface.output_components
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Audio)

    def test_raise_incompatbile_version_error(self):
        with pytest.raises(GradioVersionIncompatibleError):
            gr.load("spaces/gradio-tests/titanic-survival")

    def test_multiple_spaces_one_private(self):
        with gr.Blocks():
            gr.load(
                "spaces/gradio-tests/not-actually-private-spacev4-sse",
                hf_token=HF_TOKEN,
            )
            gr.load(
                "spaces/gradio/test-loading-examplesv4-sse",
            )
        assert Context.token == HF_TOKEN

    def test_private_space_v4_sse_v1(self):
        io = gr.load(
            "spaces/gradio-tests/not-actually-private-spacev4-sse-v1",
            hf_token=HF_TOKEN,
        )
        try:
            output = io("abc")
            assert output == "abc"
            assert io.theme.name == "gradio/monochrome"
        except TooManyRequestsError:
            pass


class TestLoadInterfaceWithExamples:
    def test_interface_load_examples(self, tmp_path):
        test_file_dir = Path(Path(__file__).parent, "test_files")
        with patch("gradio.utils.get_cache_folder", return_value=tmp_path):
            gr.load(
                name="models/google/vit-base-patch16-224",
                examples=[Path(test_file_dir, "cheetah1.jpg")],
                cache_examples=False,
            )

    def test_interface_load_cache_examples(self, tmp_path):
        test_file_dir = Path(Path(__file__).parent, "test_files")
        with patch(
            "gradio.utils.get_cache_folder", return_value=Path(tempfile.mkdtemp())
        ):
            try:
                gr.load(
                    name="models/google/vit-base-patch16-224",
                    examples=[Path(test_file_dir, "cheetah1.jpg")],
                    cache_examples=True,
                    hf_token=HF_TOKEN,
                )
            except TooManyRequestsError:
                pass

    def test_proxy_url(self):
        demo = gr.load("spaces/gradio/test-loading-examplesv4-sse")
        assert all(
            c["props"]["proxy_url"]
            == "https://gradio-test-loading-examplesv4-sse.hf.space/"
            for c in demo.get_config_file()["components"]
        )

    def test_root_url_deserialization(self):
        demo = gr.load("spaces/gradio/simple_galleryv4-sse")
        gallery = demo("test")
        assert all("caption" in d for d in gallery)

    def test_loading_chatbot_with_avatar_images_does_not_raise_errors(self):
        gr.load("gradio/chatbot_multimodal", src="spaces")


def test_get_tabular_examples_replaces_nan_with_str_nan():
    readme = """
        ---
        tags:
        - sklearn
        - skops
        - tabular-classification
        widget:
          structuredData:
            attribute_0:
            - material_7
            - material_7
            - material_7
            measurement_2:
            - 14.206
            - 15.094
            - .nan
        ---
    """
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = textwrap.dedent(readme)

    with patch("gradio.external.httpx.get", return_value=mock_response):
        examples = get_tabular_examples("foo-model")
        assert examples["measurement_2"] == [14.206, 15.094, "NaN"]


def test_cols_to_rows():
    assert cols_to_rows({"a": [1, 2, "NaN"], "b": [1, "NaN", 3]}) == (
        ["a", "b"],
        [[1, 1], [2, "NaN"], ["NaN", 3]],
    )
    assert cols_to_rows({"a": [1, 2, "NaN", 4], "b": [1, "NaN", 3]}) == (
        ["a", "b"],
        [[1, 1], [2, "NaN"], ["NaN", 3], [4, "NaN"]],
    )
    assert cols_to_rows({"a": [1, 2, "NaN"], "b": [1, "NaN", 3, 5]}) == (
        ["a", "b"],
        [[1, 1], [2, "NaN"], ["NaN", 3], ["NaN", 5]],
    )
    assert cols_to_rows({"a": None, "b": [1, "NaN", 3, 5]}) == (
        ["a", "b"],
        [["NaN", 1], ["NaN", "NaN"], ["NaN", 3], ["NaN", 5]],
    )
    assert cols_to_rows({"a": None, "b": None}) == (["a", "b"], [])


def check_dataframe(config):
    input_df = next(
        c for c in config["components"] if c["props"].get("label", "") == "Input Rows"
    )
    assert input_df["props"]["headers"] == ["a", "b"]
    assert input_df["props"]["row_count"] == (1, "dynamic")
    assert input_df["props"]["col_count"] == (2, "fixed")


def check_dataset(config, readme_examples):
    # No Examples
    if not any(readme_examples.values()):
        assert not any(c for c in config["components"] if c["type"] == "dataset")
    else:
        dataset = next(c for c in config["components"] if c["type"] == "dataset")
        assert dataset["props"]["samples"] == [[cols_to_rows(readme_examples)[1]]]


@pytest.mark.parametrize(
    "hypothetical_readme",
    [
        {"a": [1, 2, "NaN"], "b": [1, "NaN", 3]},
        {"a": [1, 2, "NaN", 4], "b": [1, "NaN", 3]},
        {"a": [1, 2, "NaN"], "b": [1, "NaN", 3, 5]},
        {"a": None, "b": [1, "NaN", 3, 5]},
        {"a": None, "b": None},
    ],
)
def test_can_load_tabular_model_with_different_widget_data(hypothetical_readme):
    with patch(
        "gradio.external_utils.get_tabular_examples", return_value=hypothetical_readme
    ):
        io = gr.load("models/scikit-learn/tabular-playground")
        check_dataframe(io.config)
        check_dataset(io.config, hypothetical_readme)


def test_raise_value_error_when_api_name_invalid():
    demo = gr.load(name="spaces/gradio/hello_worldv4-sse")
    with pytest.raises(InvalidApiNameError):
        demo("freddy", api_name="route does not exist")


def test_use_api_name_in_call_method():
    # Interface
    demo = gr.load(name="spaces/gradio/hello_worldv4-sse")
    assert demo("freddy", api_name="predict") == "Hello freddy!"

    # Blocks demo with multiple functions
    # app = gr.load(name="spaces/gradio/multiple-api-name-test")
    # assert app(15, api_name="minus_one") == 14
    # assert app(4, api_name="double") == 8


def test_load_custom_component():
    from gradio_pdf import PDF  # noqa

    demo = gr.load("spaces/freddyaboulton/gradiopdf")
    output = demo(
        "test/test_files/sample_file.pdf", "What does this say?", api_name="predict"
    )
    assert isinstance(output, str)


def test_load_inside_blocks():
    demo = gr.load("spaces/abidlabs/en2fr")
    output = demo("Hello")
    assert isinstance(output, str)


def test_load_callable():
    def mock_src(name: str, token: str | None, **kwargs) -> gr.Blocks:
        assert name == "test_model"
        assert token == "test_token"
        assert kwargs == {"param1": "value1", "param2": "value2"}
        return gr.Blocks()

    result = gr.load(
        "test_model",
        mock_src,
        "test_token",
        None,
        param1="value1",
        param2="value2",
    )

    assert isinstance(result, gr.Blocks)


@patch("openai.OpenAI")
def test_load_chat_basic(mock_openai):
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value.choices[
        0
    ].message.content = "Hello human!"
    mock_openai.return_value = mock_client

    chat = gr.load_chat(
        "http://fake-api.com/v1",
        model="test-model",
        token="fake-token",
        streaming=False,
    )
    response = chat.fn("Hi AI!", None)
    assert response == "Hello human!"


@patch("openai.OpenAI")
def test_load_chat_with_streaming(mock_openai):
    mock_client = MagicMock()
    mock_stream = [
        MagicMock(choices=[MagicMock(delta=MagicMock(content="Hello"))]),
        MagicMock(choices=[MagicMock(delta=MagicMock(content=" World"))]),
        MagicMock(choices=[MagicMock(delta=MagicMock(content="!"))]),
    ]
    mock_client.chat.completions.create.return_value = mock_stream
    mock_openai.return_value = mock_client
    chat = gr.load_chat(
        "http://fake-api.com/v1", model="test-model", token="fake-token", streaming=True
    )
    response_stream = chat.fn("Hi!", None)
    responses = list(response_stream)
    assert responses == ["Hello", "Hello World", "Hello World!"]


def test_load_chat_textbox_override():
    from gradio import ChatInterface

    custom_textbox = gr.Textbox(placeholder="Custom textbox", container=False)
    chat = gr.load_chat(
        base_url="http://localhost:1234/v1/",
        model="demo",
        token="dummy",
        textbox=custom_textbox,
        streaming=False,
    )
    assert isinstance(chat, ChatInterface)
    assert chat.textbox is custom_textbox
