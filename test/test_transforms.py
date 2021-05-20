import unittest
import gradio as gr
import PIL
import numpy as np
import scipy
import os


class TestParallel(unittest.TestCase):
    def test_in_interface(self):
        io1 = gr.Interface(lambda x: x + " world", "textbox",
                           gr.outputs.Textbox())
        io2 = gr.Interface(lambda x: x + "!", "textbox", gr.outputs.Textbox())
        series = gr.transforms.Series(io1, io2)
        self.assertEqual(series.process(["Hello"])[0], ["Hello world!"])
        # io2 = gr.Interface(lambda x: x / 2, "number",
        #                      gr.outputs.Textbox(type="number"))
        # self.assertEqual(iface.process([10])[0], [5])


if __name__ == '__main__':
    unittest.main()
