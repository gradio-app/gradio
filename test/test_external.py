import json
import os
import pathlib
import textwrap
import unittest
from unittest.mock import MagicMock, patch

import pytest
import transformers

import gradio as gr
from gradio import utils
from gradio.external import TooManyRequestsError, cols_to_rows, get_tabular_examples

"""
WARNING: These tests have an external dependency: namely that Hugging Face's
Hub and Space APIs do not change, and they keep their most famous models up.
So if, e.g. Spaces is down, then these test will not pass.

These tests actually test gr.Interface.load() and gr.Blocks.load() but are
included in a separate file because of the above-mentioned dependency.
"""

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

# Mark the whole module as flaky
pytestmark = pytest.mark.flaky


class TestLoadInterface(unittest.TestCase):
    def test_audio_to_audio(self):
        model_type = "audio-to-audio"
        interface = gr.Interface.load(
            name="speechbrain/mtl-mimic-voicebank",
            src="models",
            alias=model_type,
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Audio)
        self.assertIsInstance(interface.output_components[0], gr.components.Audio)

    def test_question_answering(self):
        model_type = "image-classification"
        interface = gr.Blocks.load(
            name="lysandre/tiny-vit-random", src="models", alias=model_type
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Image)
        self.assertIsInstance(interface.output_components[0], gr.components.Label)

    def test_text_generation(self):
        model_type = "text_generation"
        interface = gr.Interface.load("models/gpt2", alias=model_type)
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Textbox)

    def test_summarization(self):
        model_type = "summarization"
        interface = gr.Interface.load(
            "models/facebook/bart-large-cnn", api_key=None, alias=model_type
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Textbox)

    def test_translation(self):
        model_type = "translation"
        interface = gr.Interface.load(
            "models/facebook/bart-large-cnn", api_key=None, alias=model_type
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Textbox)

    def test_text2text_generation(self):
        model_type = "text2text-generation"
        interface = gr.Interface.load(
            "models/sshleifer/tiny-mbart", api_key=None, alias=model_type
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Textbox)

    def test_text_classification(self):
        model_type = "text-classification"
        interface = gr.Interface.load(
            "models/distilbert-base-uncased-finetuned-sst-2-english",
            api_key=None,
            alias=model_type,
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Label)

    def test_fill_mask(self):
        model_type = "fill-mask"
        interface = gr.Interface.load(
            "models/bert-base-uncased", api_key=None, alias=model_type
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Label)

    def test_zero_shot_classification(self):
        model_type = "zero-shot-classification"
        interface = gr.Interface.load(
            "models/facebook/bart-large-mnli", api_key=None, alias=model_type
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.input_components[1], gr.components.Textbox)
        self.assertIsInstance(interface.input_components[2], gr.components.Checkbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Label)

    def test_automatic_speech_recognition(self):
        model_type = "automatic-speech-recognition"
        interface = gr.Interface.load(
            "models/facebook/wav2vec2-base-960h", api_key=None, alias=model_type
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Audio)
        self.assertIsInstance(interface.output_components[0], gr.components.Textbox)

    def test_image_classification(self):
        model_type = "image-classification"
        interface = gr.Interface.load(
            "models/google/vit-base-patch16-224", api_key=None, alias=model_type
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Image)
        self.assertIsInstance(interface.output_components[0], gr.components.Label)

    def test_feature_extraction(self):
        model_type = "feature-extraction"
        interface = gr.Interface.load(
            "models/sentence-transformers/distilbert-base-nli-mean-tokens",
            api_key=None,
            alias=model_type,
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Dataframe)

    def test_sentence_similarity(self):
        model_type = "text-to-speech"
        interface = gr.Interface.load(
            "models/julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            api_key=None,
            alias=model_type,
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Audio)

    def test_text_to_speech(self):
        model_type = "text-to-speech"
        interface = gr.Interface.load(
            "models/julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            api_key=None,
            alias=model_type,
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Audio)

    def test_text_to_image(self):
        model_type = "text-to-image"
        interface = gr.Interface.load(
            "models/osanseviero/BigGAN-deep-128", api_key=None, alias=model_type
        )
        self.assertEqual(interface.__name__, model_type)
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Image)

    def test_english_to_spanish(self):
        interface = gr.Interface.load("spaces/abidlabs/english_to_spanish")
        self.assertIsInstance(interface.input_components[0], gr.components.Textbox)
        self.assertIsInstance(interface.output_components[0], gr.components.Textbox)

    def test_sentiment_model(self):
        io = gr.Interface.load("models/distilbert-base-uncased-finetuned-sst-2-english")
        try:
            output = io("I am happy, I love you")
            assert json.load(open(output))["label"] == "POSITIVE"
        except TooManyRequestsError:
            pass

    def test_image_classification_model(self):
        io = gr.Blocks.load(name="models/google/vit-base-patch16-224")
        try:
            output = io("gradio/test_data/lion.jpg")
            assert json.load(open(output))["label"] == "lion"
        except TooManyRequestsError:
            pass

    def test_translation_model(self):
        io = gr.Blocks.load(name="models/t5-base")
        try:
            output = io("My name is Sarah and I live in London")
            self.assertEqual(output, "Mein Name ist Sarah und ich lebe in London")
        except TooManyRequestsError:
            pass

    def test_numerical_to_label_space(self):
        io = gr.Interface.load("spaces/abidlabs/titanic-survival")
        try:
            output = io("male", 77, 10)
            assert json.load(open(output))["label"] == "Perishes"
        except TooManyRequestsError:
            pass

    def test_speech_recognition_model(self):
        io = gr.Interface.load("models/facebook/wav2vec2-base-960h")
        try:
            output = io("gradio/test_data/test_audio.wav")
            self.assertIsNotNone(output)
        except TooManyRequestsError:
            pass

    def test_text_to_image_model(self):
        io = gr.Interface.load("models/osanseviero/BigGAN-deep-128")
        try:
            filename = io("chest")
            self.assertTrue(filename.endswith(".jpg") or filename.endswith(".jpeg"))
        except TooManyRequestsError:
            pass


class TestLoadFromPipeline(unittest.TestCase):
    def test_text_to_text_model_from_pipeline(self):
        pipe = transformers.pipeline(model="sshleifer/bart-tiny-random")
        output = pipe("My name is Sylvain and I work at Hugging Face in Brooklyn")
        self.assertIsNotNone(output)


def test_interface_load_cache_examples(tmp_path):
    test_file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
    with patch("gradio.examples.CACHED_FOLDER", tmp_path):
        gr.Interface.load(
            name="models/google/vit-base-patch16-224",
            examples=[pathlib.Path(test_file_dir, "cheetah1.jpg")],
            cache_examples=True,
        )


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
        assert not any([c for c in config["components"] if c["type"] == "dataset"])
    else:
        dataset = next(c for c in config["components"] if c["type"] == "dataset")
        assert dataset["props"]["samples"] == [
            [utils.delete_none(cols_to_rows(readme_examples)[1])]
        ]


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
        io = gr.Interface.load("models/scikit-learn/tabular-playground")
        check_dataframe(io.config)
        check_dataset(io.config, hypothetical_readme)


if __name__ == "__main__":
    unittest.main()
