import unittest
import gradio as gr
from gradio import mix

class TestSeries(unittest.TestCase):
    def test_in_interface(self):
        io1 = gr.Interface(lambda x: x + " World", "textbox",
                           gr.outputs.Textbox())
        io2 = gr.Interface(lambda x: x + "!", "textbox", gr.outputs.Textbox())
        series = mix.Series(io1, io2)
        self.assertEqual(series.process(["Hello"])[0], ["Hello World!"])

class TestParallel(unittest.TestCase):
    def test_in_interface(self):
        io1 = gr.Interface(lambda x: x + " World 1!", "textbox",
                           gr.outputs.Textbox())
        io2 = gr.Interface(lambda x: x + " World 2!", "textbox",
                           gr.outputs.Textbox())
        parallel = mix.Parallel(io1, io2)
        self.assertEqual(parallel.process(["Hello"])[0], ["Hello World 1!",
                                                          "Hello World 2!"])


if __name__ == '__main__':
    unittest.main()
