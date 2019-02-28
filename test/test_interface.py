import unittest
from gradio import Interface
import gradio.inputs
import gradio.outputs


class TestInterface(unittest.TestCase):
    def test_input_output_mapping(self):
        io = Interface(inputs='SketCHPad', outputs='textBOX', model=lambda x: x, model_type='function')
        self.assertIsInstance(io.input_interface, gradio.inputs.Sketchpad)
        self.assertIsInstance(io.output_interface, gradio.outputs.Textbox)


if __name__ == '__main__':
    unittest.main()
