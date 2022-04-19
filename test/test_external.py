import os
import pathlib
import unittest

import transformers

import gradio as gr

"""
WARNING: These tests have an external dependency: namely that Hugging Face's
Hub and Space APIs do not change, and they keep their most famous models up.
So if, e.g. Spaces is down, then these test will not pass.
"""

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestHuggingFaceModelAPI(unittest.TestCase):
    def test_audio_to_audio(self):
        model_type = "audio-to-audio"
        interface_info = gr.external.get_huggingface_interface(
            "speechbrain/mtl-mimic-voicebank",
            api_key=None,
            alias=model_type,
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Audio)
        self.assertIsInstance(interface_info["outputs"], gr.components.Audio)

    def test_question_answering(self):
        model_type = "question-answering"
        interface_info = gr.external.get_huggingface_interface(
            "lysandre/tiny-vit-random", api_key=None, alias=model_type
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Image)
        self.assertIsInstance(interface_info["outputs"], gr.components.Label)

    def test_text_generation(self):
        model_type = "text_generation"
        interface_info = gr.external.get_huggingface_interface(
            "gpt2", api_key=None, alias=model_type
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.components.Textbox)

    def test_summarization(self):
        model_type = "summarization"
        interface_info = gr.external.get_huggingface_interface(
            "facebook/bart-large-cnn", api_key=None, alias=model_type
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.components.Textbox)

    def test_translation(self):
        model_type = "translation"
        interface_info = gr.external.get_huggingface_interface(
            "facebook/bart-large-cnn", api_key=None, alias=model_type
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.components.Textbox)

    def test_text2text_generation(self):
        model_type = "text2text-generation"
        interface_info = gr.external.get_huggingface_interface(
            "sshleifer/tiny-mbart", api_key=None, alias=model_type
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.components.Textbox)

    def test_text_classification(self):
        model_type = "text-classification"
        interface_info = gr.external.get_huggingface_interface(
            "distilbert-base-uncased-finetuned-sst-2-english",
            api_key=None,
            alias=model_type,
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.components.Label)

    def test_fill_mask(self):
        model_type = "fill-mask"
        interface_info = gr.external.get_huggingface_interface(
            "bert-base-uncased", api_key=None, alias=model_type
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.components.Label)

    def test_zero_shot_classification(self):
        model_type = "zero-shot-classification"
        interface_info = gr.external.get_huggingface_interface(
            "facebook/bart-large-mnli", api_key=None, alias=model_type
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"][0], gr.components.Textbox)
        self.assertIsInstance(interface_info["inputs"][1], gr.components.Textbox)
        self.assertIsInstance(interface_info["inputs"][2], gr.components.Checkbox)
        self.assertIsInstance(interface_info["outputs"], gr.components.Label)

    def test_automatic_speech_recognition(self):
        model_type = "automatic-speech-recognition"
        interface_info = gr.external.get_huggingface_interface(
            "facebook/wav2vec2-base-960h", api_key=None, alias=model_type
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Audio)
        self.assertIsInstance(interface_info["outputs"], gr.components.Textbox)

    def test_image_classification(self):
        model_type = "image-classification"
        interface_info = gr.external.get_huggingface_interface(
            "google/vit-base-patch16-224", api_key=None, alias=model_type
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Image)
        self.assertIsInstance(interface_info["outputs"], gr.components.Label)

    def test_feature_extraction(self):
        model_type = "feature-extraction"
        interface_info = gr.external.get_huggingface_interface(
            "sentence-transformers/distilbert-base-nli-mean-tokens",
            api_key=None,
            alias=model_type,
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.components.Dataframe)

    def test_sentence_similarity(self):
        model_type = "text-to-speech"
        interface_info = gr.external.get_huggingface_interface(
            "julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            api_key=None,
            alias=model_type,
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.components.Audio)

    def test_text_to_speech(self):
        model_type = "text-to-speech"
        interface_info = gr.external.get_huggingface_interface(
            "julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            api_key=None,
            alias=model_type,
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.components.Audio)

    def test_text_to_image(self):
        model_type = "text-to-image"
        interface_info = gr.external.get_huggingface_interface(
            "osanseviero/BigGAN-deep-128", api_key=None, alias=model_type
        )
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.components.Image)

    def test_english_to_spanish(self):
        interface_info = gr.external.get_spaces_interface(
            "abidlabs/english_to_spanish", api_key=None, alias=None
        )
        self.assertIsInstance(interface_info["inputs"][0], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"][0], gr.components.Textbox)


class TestLoadInterface(unittest.TestCase):
    def test_english_to_spanish(self):
        interface_info = gr.external.load_interface(
            "spaces/abidlabs/english_to_spanish"
        )
        self.assertIsInstance(interface_info["inputs"][0], gr.components.Textbox)
        self.assertIsInstance(interface_info["outputs"][0], gr.components.Textbox)

    def test_sentiment_model(self):
        interface_info = gr.external.load_interface(
            "models/distilbert-base-uncased-finetuned-sst-2-english",
            alias="sentiment_classifier",
        )
        io = gr.Interface(**interface_info)
        io.api_mode = True
        output = io("I am happy, I love you.")
        self.assertGreater(output["POSITIVE"], 0.5)

    def test_image_classification_model(self):
        interface_info = gr.external.load_interface(
            "models/google/vit-base-patch16-224"
        )
        io = gr.Interface(**interface_info)
        io.api_mode = True
        output = io("gradio/test_data/lion.jpg")
        self.assertGreater(output["lion"], 0.5)

    def test_translation_model(self):
        interface_info = gr.external.load_interface("models/t5-base")
        io = gr.Interface(**interface_info)
        io.api_mode = True
        output = io("My name is Sarah and I live in London")
        self.assertEqual(output, "Mein Name ist Sarah und ich lebe in London")

    def test_numerical_to_label_space(self):
        interface_info = gr.external.load_interface("spaces/abidlabs/titanic-survival")
        io = gr.Interface(**interface_info)
        io.api_mode = True
        output = io("male", 77, 10)
        self.assertLess(output["Survives"], 0.5)

    def test_speech_recognition_model(self):
        interface_info = gr.external.load_interface(
            "models/facebook/wav2vec2-large-960h-lv60-self"
        )
        io = gr.Interface(**interface_info)
        io.api_mode = True
        output = io("gradio/test_data/test_audio.wav")
        self.assertIsNotNone(output)

    def test_text_to_image_model(self):
        interface_info = gr.external.load_interface(
            "models/osanseviero/BigGAN-deep-128"
        )
        io = gr.Interface(**interface_info)
        io.api_mode = True
        filename = io("chest")
        self.assertTrue(filename.endswith(".jpg") or filename.endswith(".jpeg"))

    def test_image_to_image_space(self):
        def assertIsFile(path):
            if not pathlib.Path(path).resolve().is_file():
                raise AssertionError("File does not exist: %s" % str(path))

        interface_info = gr.external.load_interface("spaces/abidlabs/image-identity")
        io = gr.Interface(**interface_info)
        io.api_mode = True
        output = io("gradio/test_data/lion.jpg")
        assertIsFile(output)


class TestLoadFromPipeline(unittest.TestCase):
    def test_text_to_text_model_from_pipeline(self):
        pipe = transformers.pipeline(model="sshleifer/bart-tiny-random")
        output = pipe("My name is Sylvain and I work at Hugging Face in Brooklyn")
        self.assertIsNotNone(output)


if __name__ == "__main__":
    unittest.main()
