import os
import json
import pathlib
import unittest
from unittest.mock import patch

import pytest
import transformers

import gradio as gr
from gradio.external import TooManyRequestsError

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
            self.assertGreater(output["POSITIVE"], 0.5)
        except TooManyRequestsError:
            pass

    def test_image_classification_model(self):
        io = gr.Blocks.load(name="models/google/vit-base-patch16-224")
        try:
            output = io("gradio/test_data/lion.jpg")
            self.assertGreater(output["lion"], 0.5)
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


if __name__ == "__main__":
    unittest.main()
