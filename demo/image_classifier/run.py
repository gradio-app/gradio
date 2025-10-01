import requests
import tensorflow as tf  # type: ignore

import gradio as gr
# get_image() returns the file path to sample images included with Gradio
from gradio.media import get_image

inception_net = tf.keras.applications.MobileNetV2()  # load the model

# Download human-readable labels for ImageNet.
response = requests.get("https://git.io/JJkYN")
labels = response.text.split("\n")

def classify_image(inp):
    inp = inp.reshape((-1, 224, 224, 3))
    inp = tf.keras.applications.mobilenet_v2.preprocess_input(inp)
    prediction = inception_net.predict(inp).flatten()
    return {labels[i]: float(prediction[i]) for i in range(1000)}

image = gr.Image()
label = gr.Label(num_top_classes=3)

demo = gr.Interface(
    fn=classify_image,
    inputs=image,
    outputs=label,
    examples=[
        get_image("cheetah1.jpg"),
        get_image("lion.jpg")
        ]
    )

if __name__ == "__main__":
    demo.launch()

