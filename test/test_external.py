import unittest
import gradio as gr

class TestHuggingFaceModels(unittest.TestCase):
    def test_text_generation(self):
        model_type = "text_generation"
        interface_info = gr.external.get_huggingface_interface("gpt2", api_key=None, alias=None)
        self.assertEqual(interface_info["fn"].__name__, "gpt2")
        self.assertIsInstance(interface_info["inputs"], gr.inputs.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.outputs.Textbox)

    def test_sentiment_classifier(self):
        model_type = "sentiment_classifier"
        interface_info = gr.external.get_huggingface_interface(
            "distilbert-base-uncased-finetuned-sst-2-english", api_key=None,
            alias=model_type)
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.inputs.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.outputs.Label)

    def test_sentence_similarity(self):
        model_type = "text-to-speech"
        interface_info = gr.external.get_huggingface_interface(
            "julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            api_key=None, alias=model_type)
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.inputs.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.outputs.Audio)

    def test_text_to_speech(self):
        model_type = "text-to-speech"
        interface_info = gr.external.get_huggingface_interface(
            "julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            api_key=None, alias=model_type)
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.inputs.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.outputs.Audio)

    def test_text_to_image(self):
        model_type = "text-to-image"
        interface_info = gr.external.get_huggingface_interface(
            "osanseviero/BigGAN-deep-128",
            api_key=None, alias=model_type)
        self.assertEqual(interface_info["fn"].__name__, model_type)
        self.assertIsInstance(interface_info["inputs"], gr.inputs.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.outputs.Image)

class TestHuggingFaceSpaces(unittest.TestCase):
    def test_english_to_spanish(self):
        interface_info = gr.external.get_spaces_interface("abidlabs/english_to_spanish", api_key=None, alias=None)
        self.assertIsInstance(interface_info["inputs"][0], gr.inputs.Textbox)
        self.assertIsInstance(interface_info["outputs"][0], gr.outputs.Textbox)    

class TestLoadInterface(unittest.TestCase):
    def test_english_to_spanish(self):
        interface_info = gr.external.load_interface("spaces/abidlabs/english_to_spanish")
        self.assertIsInstance(interface_info["inputs"][0], gr.inputs.Textbox)
        self.assertIsInstance(interface_info["outputs"][0], gr.outputs.Textbox)    

    def test_distilbert_classification(self):
        interface_info = gr.external.load_interface("distilbert-base-uncased-finetuned-sst-2-english", src="huggingface", alias="sentiment_classifier")
        self.assertEqual(interface_info["fn"].__name__, "sentiment_classifier")
        self.assertIsInstance(interface_info["inputs"], gr.inputs.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.outputs.Label)



if __name__ == '__main__':
    unittest.main()