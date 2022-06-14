import os
import unittest

import gradio as gr
from gradio import mix
from gradio.external import TooManyRequestsError

"""
WARNING: Some of these tests have an external dependency: namely that Hugging Face's Hub and Space APIs do not change, and they keep their most famous models up. So if, e.g. Spaces is down, then these test will not pass.
"""


os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestSeries(unittest.TestCase):
    def test_in_interface(self):
        io1 = gr.Interface(lambda x: x + " World", "textbox", gr.outputs.Textbox())
        io2 = gr.Interface(lambda x: x + "!", "textbox", gr.outputs.Textbox())
        series = mix.Series(io1, io2)
        self.assertEqual(series.process(["Hello"]), ["Hello World!"])

    def test_with_external(self):
        io1 = gr.Interface.load("spaces/abidlabs/image-identity")
        io2 = gr.Interface.load("spaces/abidlabs/image-classifier")
        series = mix.Series(io1, io2)
        try:
            output = series("gradio/test_data/lion.jpg")
            self.assertGreater(output["lion"], 0.5)
        except TooManyRequestsError:
            pass


class TestParallel(unittest.TestCase):
    def test_in_interface(self):
        io1 = gr.Interface(lambda x: x + " World 1!", "textbox", gr.outputs.Textbox())
        io2 = gr.Interface(lambda x: x + " World 2!", "textbox", gr.outputs.Textbox())
        parallel = mix.Parallel(io1, io2)
        self.assertEqual(
            parallel.process(["Hello"]), ["Hello World 1!", "Hello World 2!"]
        )

    def test_with_external(self):
        io1 = gr.Interface.load("spaces/abidlabs/english_to_spanish")
        io2 = gr.Interface.load("spaces/abidlabs/english2german")
        parallel = mix.Parallel(io1, io2)
        try:
            hello_es, hello_de = parallel("Hello")
            self.assertIn("hola", hello_es.lower())
            self.assertIn("hallo", hello_de.lower())
        except TooManyRequestsError:
            pass


if __name__ == "__main__":
    unittest.main()
