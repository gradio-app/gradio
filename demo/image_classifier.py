# Demo: (Image) -> (Label)

import gradio as gr
import tensorflow as tf

import numpy as np
from PIL import Image
import requests
from urllib.request import urlretrieve
import json

# Load human-readable labels for ImageNet.
with open("files/imagenet_labels.json") as labels_file:
    labels = json.load(labels_file)

mobile_net = tf.keras.applications.MobileNetV2()


def image_classifier(im):
    arr = np.expand_dims(im, axis=0)
    arr = tf.keras.applications.mobilenet.preprocess_input(arr)
    prediction = mobile_net.predict(arr).flatten()
    return {labels[i]: float(prediction[i]) for i in range(1000)}


image = gr.inputs.Image(shape=(224, 224))
label = gr.outputs.Label(num_top_classes=3)

io = gr.Interface(image_classifier, image, label,
    capture_session=True,
    interpretation="default",
    examples=[
        ["images/cheetah1.jpg"],
        ["images/lion.jpg"]
    ])

io.launch()