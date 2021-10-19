import unittest
import gradio as gr

"""
WARNING: These tests have an external dependency: namely that Hugging Face's Hub and Space APIs do not change, and they keep their most famous models up.
"""

class TestHuggingFaceModels(unittest.TestCase):
    def test_gpt2(self):
        interface_info = gr.external.get_huggingface_interface("gpt2", api_key=None, alias=None)
        self.assertEqual(interface_info["fn"].__name__, "gpt2")
        self.assertIsInstance(interface_info["inputs"], gr.inputs.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.outputs.Textbox)
    
    def test_distilbert_classification(self):
        interface_info = gr.external.get_huggingface_interface("distilbert-base-uncased-finetuned-sst-2-english", api_key=None, alias="sentiment_classifier")
        self.assertEqual(interface_info["fn"].__name__, "sentiment_classifier")
        self.assertIsInstance(interface_info["inputs"], gr.inputs.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.outputs.Label)

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

    def test_models_src(self):
        interface_info = gr.external.load_interface("models/distilbert-base-uncased-finetuned-sst-2-english", alias="sentiment_classifier")
        self.assertEqual(interface_info["fn"].__name__, "sentiment_classifier")
        self.assertIsInstance(interface_info["inputs"], gr.inputs.Textbox)
        self.assertIsInstance(interface_info["outputs"], gr.outputs.Label)


if __name__ == '__main__':
    unittest.main()