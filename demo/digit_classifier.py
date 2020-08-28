# Demo: (Image) -> (Label)

import tensorflow as tf
import gradio
import gradio as gr
from urllib.request import urlretrieve

urlretrieve("https://gr-models.s3-us-west-2.amazonaws.com/mnist-model.h5", "mnist-model.h5")
model = tf.keras.models.load_model("mnist-model.h5")


def recognize_digit(image):
    image = image.reshape(1, -1)
    prediction = model.predict(image).tolist()[0]
    return {str(i): prediction[i] for i in range(10)}


io = gr.Interface(
    recognize_digit, 
    "sketchpad", 
    gradio.outputs.Label(num_top_classes=3),
    live=True,
    capture_session=True,
)

io.test_launch()
io.launch()
