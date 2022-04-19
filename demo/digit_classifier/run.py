import os
from urllib.request import urlretrieve

import tensorflow as tf

import gradio
import gradio as gr

urlretrieve(
    "https://gr-models.s3-us-west-2.amazonaws.com/mnist-model.h5", "mnist-model.h5"
)
model = tf.keras.models.load_model("mnist-model.h5")


def recognize_digit(image):
    image = image.reshape(1, -1)
    prediction = model.predict(image).tolist()[0]
    return {str(i): prediction[i] for i in range(10)}


im = gradio.Image(shape=(28, 28), image_mode="L", invert_colors=False, source="canvas")

demo = gr.Interface(
    recognize_digit,
    im,
    gradio.Label(num_top_classes=3),
    live=True,
    interpretation="default",
    capture_session=True,
)

if __name__ == "__main__":
    demo.launch()
