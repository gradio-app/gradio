import unittest
from gradio import Interface
import gradio.inputs
import gradio.outputs


class TestInterface(unittest.TestCase):
    def test_input_output_mapping(self):
        io = Interface(inputs='SketCHPad', outputs='textBOX', model=lambda x: x, model_type='function')
        self.assertIsInstance(io.input_interface, gradio.inputs.Sketchpad)
        self.assertIsInstance(io.output_interface, gradio.outputs.Textbox)

    def test_input_interface_is_instance(self):
        inp = gradio.inputs.ImageUpload()
        io = Interface(inputs=inp, outputs='textBOX', model=lambda x: x, model_type='function')
        self.assertEqual(io.input_interface, inp)

    def test_output_interface_is_instance(self):
        out = gradio.outputs.Label(show_confidences=False)
        io = Interface(inputs='SketCHPad', outputs=out, model=lambda x: x, model_type='function')
        self.assertEqual(io.output_interface, out)


if __name__ == '__main__':
    unittest.main()
