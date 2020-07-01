import unittest
import numpy as np
import gradio as gr
import gradio.inputs
import gradio.outputs


class TestInterface(unittest.TestCase):
    def test_input_output_mapping(self):
        io = gr.Interface(inputs='SketCHPad', outputs='textBOX', fn=lambda
            x: x)
        self.assertIsInstance(io.input_interfaces[0], gradio.inputs.Sketchpad)
        self.assertIsInstance(io.output_interfaces[0], gradio.outputs.Textbox)

    def test_input_interface_is_instance(self):
        inp = gradio.inputs.Image()
        io = gr.Interface(inputs=inp, outputs='textBOX', fn=lambda x: x)
        self.assertEqual(io.input_interfaces[0], inp)

    def test_output_interface_is_instance(self):
        # out = gradio.outputs.Label(show_confidences=False)
        out = gradio.outputs.Label()
        io = gr.Interface(inputs='SketCHPad', outputs=out, fn=lambda x: x)
        self.assertEqual(io.output_interfaces[0], out)

    def test_keras_model(self):
        try:
            import tensorflow as tf
        except:
            raise unittest.SkipTest("Need tensorflow installed to do keras-based tests")
        inputs = tf.keras.Input(shape=(3,))
        x = tf.keras.layers.Dense(4, activation=tf.nn.relu)(inputs)
        outputs = tf.keras.layers.Dense(5, activation=tf.nn.softmax)(x)
        model = tf.keras.Model(inputs=inputs, outputs=outputs)
        io = gr.Interface(inputs='SketCHPad', outputs='textBOX', fn=model)
        # pred = io.predict(np.ones(shape=(1, 3), ))
        # self.assertEqual(pred.shape, (1, 5))

    def test_func_model(self):
        def model(x):
            return 2*x
        io = gr.Interface(inputs='SketCHPad', outputs='textBOX', fn=model)
        # pred = io.predict(np.ones(shape=(1, 3)))
        # self.assertEqual(pred.shape, (1, 3))

    def test_pytorch_model(self):
        try:
            import torch
        except:
            raise unittest.SkipTest("Need torch installed to do pytorch-based tests")

        class TwoLayerNet(torch.nn.Module):
            def __init__(self):
                super(TwoLayerNet, self).__init__()
                self.linear1 = torch.nn.Linear(3, 4)
                self.linear2 = torch.nn.Linear(4, 5)

            def forward(self, x):
                h_relu = torch.nn.functional.relu(self.linear1(x))
                y_pred = self.linear2(h_relu)
                return y_pred

        model = TwoLayerNet()
        io = gr.Interface(inputs='SketCHPad', outputs='textBOX', fn=model)
        # pred = io.predict(np.ones(shape=(1, 3), dtype=np.float32))
        # self.assertEqual(pred.shape, (1, 5))


if __name__ == '__main__':
    unittest.main()