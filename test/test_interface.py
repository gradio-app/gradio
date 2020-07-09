import unittest
import numpy as np
import gradio as gr
import gradio.inputs
import gradio.outputs


class TestInterface(unittest.TestCase):
    def test_input_output_mapping(self):
        io = gr.Interface(inputs='SketCHPad', outputs='TexT', fn=lambda x: x)
        self.assertIsInstance(io.input_interfaces[0], gradio.inputs.Sketchpad)
        self.assertIsInstance(io.output_interfaces[0], gradio.outputs.Textbox)

    def test_input_interface_is_instance(self):
        inp = gradio.inputs.Image()
        io = gr.Interface(inputs=inp, outputs='teXT', fn=lambda x: x)
        self.assertEqual(io.input_interfaces[0], inp)

    def test_output_interface_is_instance(self):
        out = gradio.outputs.Label()
        io = gr.Interface(inputs='SketCHPad', outputs=out, fn=lambda x: x)
        self.assertEqual(io.output_interfaces[0], out)

    def test_prediction(self):
        def model(x):
            return 2*x
        io = gr.Interface(inputs='textbox', outputs='TEXT', fn=model)
        self.assertEqual(io.predict[0](11), 22)


if __name__ == '__main__':
    unittest.main()