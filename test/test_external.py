import os
import textwrap
import warnings
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from gradio_client import media_data

import gradio as gr
from gradio.context import Context
from gradio.exceptions import GradioVersionIncompatibleError, InvalidApiNameError
from gradio.external import TooManyRequestsError, cols_to_rows, get_tabular_examples

"""
WARNING: These tests have an external dependency: namely that Hugging Face's
Hub and Space APIs do not change, and they keep their most famous models up.
So if, e.g. Spaces is down, then these test will not pass.

These tests actually test gr.load() and gr.Blocks.load() but are
included in a separate file because of the above-mentioned dependency.
"""

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

# Mark the whole module as flaky
pytestmark = pytest.mark.flaky


class TestLoadInterface:
    def test_audio_to_audio(self):
        model_type = "audio-to-audio"
        interface = gr.load(
            name="speechbrain/mtl-mimic-voicebank",
            src="models",
            alias=model_type,
        )
        assert interface.__name__ == model_type
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
        assert isinstance(interface.input_components[0], gr.Image)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_text_generation(self):
        model_type = "text_generation"
        interface = gr.load(
            "models/gpt2", alias=model_type, description="This is a test description"
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Textbox)
        assert any(
            "This is a test description" in d["props"].get("value", "")
            for d in interface.get_config_file()["components"]
        )

    def test_summarization(self):
        model_type = "summarization"
        interface = gr.load(
            "models/facebook/bart-large-cnn", hf_token=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Textbox)

    def test_translation(self):
        model_type = "translation"
        interface = gr.load(
            "models/facebook/bart-large-cnn", hf_token=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Textbox)

    def test_text2text_generation(self):
        model_type = "text2text-generation"
        interface = gr.load(
            "models/sshleifer/tiny-mbart", hf_token=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Textbox)

    def test_text_classification(self):
        model_type = "text-classification"
        interface = gr.load(
            "models/distilbert-base-uncased-finetuned-sst-2-english",
            hf_token=None,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_fill_mask(self):
        model_type = "fill-mask"
        interface = gr.load("models/bert-base-uncased", hf_token=None, alias=model_type)
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_zero_shot_classification(self):
        model_type = "zero-shot-classification"
        interface = gr.load(
            "models/facebook/bart-large-mnli", hf_token=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.input_components[1], gr.Textbox)
        assert isinstance(interface.input_components[2], gr.Checkbox)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_automatic_speech_recognition(self):
        model_type = "automatic-speech-recognition"
        interface = gr.load(
            "models/facebook/wav2vec2-base-960h", hf_token=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Audio)
        assert isinstance(interface.output_components[0], gr.Textbox)

    def test_image_classification(self):
        model_type = "image-classification"
        interface = gr.load(
            "models/google/vit-base-patch16-224", hf_token=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Image)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_feature_extraction(self):
        model_type = "feature-extraction"
        interface = gr.load(
            "models/sentence-transformers/distilbert-base-nli-mean-tokens",
            hf_token=None,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Dataframe)

    def test_sentence_similarity(self):
        model_type = "text-to-speech"
        interface = gr.load(
            "models/julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            hf_token=None,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Audio)

    def test_text_to_speech(self):
        model_type = "text-to-speech"
        interface = gr.load(
            "models/julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            hf_token=None,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Audio)

    def test_text_to_image(self):
        model_type = "text-to-image"
        interface = gr.load(
            "models/osanseviero/BigGAN-deep-128", hf_token=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Image)

    def test_english_to_spanish(self):
        with pytest.raises(GradioVersionIncompatibleError):
            gr.load("spaces/gradio-tests/english_to_spanish", title="hi")

    def test_english_to_spanish_v4(self):
        with pytest.warns(UserWarning):
            io = gr.load("spaces/gradio-tests/english_to_spanishv4-sse", title="hi")
        assert isinstance(io.input_components[0], gr.Textbox)
        assert isinstance(io.output_components[0], gr.Textbox)

    def test_sentiment_model(self):
        io = gr.load("models/distilbert-base-uncased-finetuned-sst-2-english")
        try:
            assert io("I am happy, I love you")["label"] == "POSITIVE"
        except TooManyRequestsError:
            pass

    def test_image_classification_model(self):
        io = gr.load(name="models/google/vit-base-patch16-224")
        try:
            assert io("gradio/test_data/lion.jpg")["label"] == "lion"
        except TooManyRequestsError:
            pass

    def test_translation_model(self):
        io = gr.load(name="models/t5-base")
        try:
            output = io("My name is Sarah and I live in London")
            assert output == "Mein Name ist Sarah und ich lebe in London"
        except TooManyRequestsError:
            pass

    def test_raise_incompatbile_version_error(self):
        with pytest.raises(GradioVersionIncompatibleError):
            gr.load("spaces/gradio-tests/titanic-survival")

    def test_numerical_to_label_space(self):
        io = gr.load("spaces/gradio-tests/titanic-survivalv4-sse")
        try:
            assert io.theme.name == "soft"
            assert io("male", 77, 10)["label"] == "Perishes"
        except TooManyRequestsError:
            pass

    def test_visual_question_answering(self):
        io = gr.load("models/dandelin/vilt-b32-finetuned-vqa")
        try:
            output = io("gradio/test_data/lion.jpg", "What is in the image?")
            assert isinstance(output, dict) and "label" in output
        except TooManyRequestsError:
            pass

    def test_image_to_text(self):
        io = gr.load("models/nlpconnect/vit-gpt2-image-captioning")
        try:
            output = io("gradio/test_data/lion.jpg")
            assert isinstance(output, str)
        except TooManyRequestsError:
            pass

    def test_conversational_in_blocks(self):
        with gr.Blocks() as io:
            gr.load("models/microsoft/DialoGPT-medium")
        app, _, _ = io.launch(prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post(
            "/api/predict/",
            json={"session_hash": "foo", "data": ["Hi!", None], "fn_index": 0},
        )
        output = response.json()
        assert isinstance(output["data"], list)
        assert isinstance(output["data"][0], list)
        assert "foo" in app.state_holder

    def test_speech_recognition_model(self):
        io = gr.load("models/facebook/wav2vec2-base-960h")
        try:
            output = io("gradio/test_data/test_audio.wav")
            assert output is not None
        except TooManyRequestsError:
            pass

        app, _, _ = io.launch(prevent_thread_lock=True, show_error=True)
        client = TestClient(app)
        resp = client.post(
            "api/predict",
            json={"fn_index": 0, "data": [media_data.BASE64_AUDIO], "name": "sample"},
        )
        try:
            if resp.status_code != 200:
                warnings.warn("Request for speech recognition model failed!")
                if (
                    "Could not complete request to HuggingFace API"
                    in resp.json()["error"]
                ):
                    pass
                else:
                    raise AssertionError()
            else:
                assert resp.json()["data"] is not None
        finally:
            io.close()

    def test_text_to_image_model(self):
        io = gr.load("models/osanseviero/BigGAN-deep-128")
        try:
            filename = io("chest")
            assert filename.endswith(".jpg") or filename.endswith(".jpeg")
        except TooManyRequestsError:
            pass

    def test_private_space(self):
        hf_token = "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"  # Intentionally revealing this key for testing purposes
        io = gr.load(
            "spaces/gradio-tests/not-actually-private-spacev4-sse", hf_token=hf_token
        )
        try:
            output = io("abc")
            assert output == "abc"
            assert io.theme.name == "default"
        except TooManyRequestsError:
            pass

    @pytest.mark.xfail
    def test_private_space_audio(self):
        hf_token = "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"  # Intentionally revealing this key for testing purposes
        io = gr.load(
            "spaces/gradio-tests/not-actually-private-space-audiov4-sse",
            hf_token=hf_token,
        )
        try:
            output = io(media_data.BASE64_AUDIO["path"])
            assert output.endswith(".wav")
        except TooManyRequestsError:
            pass

    def test_multiple_spaces_one_private(self):
        hf_token = "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"  # Intentionally revealing this key for testing purposes
        with gr.Blocks():
            gr.load(
                "spaces/gradio-tests/not-actually-private-spacev4-sse",
                hf_token=hf_token,
            )
            gr.load(
                "spaces/gradio/test-loading-examplesv4-sse",
            )
        assert Context.hf_token == hf_token

    def test_loading_files_via_proxy_works(self):
        hf_token = "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"  # Intentionally revealing this key for testing purposes
        io = gr.load(
            "spaces/gradio-tests/test-loading-examples-privatev4-sse", hf_token=hf_token
        )
        assert io.theme.name == "default"
        app, _, _ = io.launch(prevent_thread_lock=True)
        test_client = TestClient(app)
        r = test_client.get(
            "/proxy=https://gradio-tests-test-loading-examples-privatev4-sse.hf.space/file=Bunny.obj"
        )
        assert r.status_code == 200


class TestLoadInterfaceWithExamples:
    def test_interface_load_examples(self, tmp_path):
        test_file_dir = Path(Path(__file__).parent, "test_files")
        with patch("gradio.helpers.CACHED_FOLDER", tmp_path):
            gr.load(
                name="models/google/vit-base-patch16-224",
                examples=[Path(test_file_dir, "cheetah1.jpg")],
                cache_examples=False,
            )

    def test_interface_load_cache_examples(self, tmp_path):
        test_file_dir = Path(Path(__file__).parent, "test_files")
        with patch("gradio.helpers.CACHED_FOLDER", tmp_path):
            gr.load(
                name="models/google/vit-base-patch16-224",
                examples=[Path(test_file_dir, "cheetah1.jpg")],
                cache_examples=True,
            )

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

    def test_interface_with_examples(self):
        # This demo has the "fake_event" correctly removed
        demo = gr.load("spaces/gradio-tests/test-calculator-1v4-sse")
        assert demo(2, "add", 3) == 5

        # This demo still has the "fake_event". both should work
        demo = gr.load("spaces/gradio-tests/test-calculator-2v4-sse")
        assert demo(2, "add", 4) == 6


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

    with patch("gradio.external.requests.get", return_value=mock_response):
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


@pytest.mark.xfail
def test_load_blocks_with_default_values():
    io = gr.load("spaces/gradio-tests/min-dallev4-sse")
    assert isinstance(io.get_config_file()["components"][0]["props"]["value"], list)

    io = gr.load("spaces/gradio-tests/min-dalle-laterv4-sse")
    assert isinstance(io.get_config_file()["components"][0]["props"]["value"], list)

    io = gr.load("spaces/gradio-tests/dataframe_loadv4-sse")
    assert io.get_config_file()["components"][0]["props"]["value"] == {
        "headers": ["a", "b"],
        "data": [[1, 4], [2, 5], [3, 6]],
    }


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
        "gradio.external.get_tabular_examples", return_value=hypothetical_readme
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
