import gradio as gr
import tensorflow as tf
# from vis.utils import utils
# from vis.visualization import visualize_cam

import numpy as np
from PIL import Image
import requests
from urllib.request import urlretrieve

# # Download human-readable labels for ImageNet.
# response = requests.get("https://git.io/JJkYN") 
# labels = response.text.split("\n")
labels = range(1000)  # comment this later

mobile_net = tf.keras.applications.MobileNetV2()


def image_classifier(im):
    arr = np.expand_dims(im, axis=0)
    arr = tf.keras.applications.mobilenet.preprocess_input(arr)
    prediction = mobile_net.predict(arr).flatten()
    return {labels[i]: float(prediction[i]) for i in range(1000)}

def image_explain(im):
    model.layers[-1].activation = tf.keras.activations.linear
    model = utils.apply_modifications(model)
    penultimate_layer_idx =  2
    class_idx  = class_idxs_sorted[0]
    seed_input = img
    grad_top1  = visualize_cam(model, layer_idx, class_idx, seed_input, 
                            penultimate_layer_idx = penultimate_layer_idx,#None,
                            backprop_modifier     = None,
                            grad_modifier         = None)
    print(grad_top_1)
    return grad_top1


image = gr.inputs.Image(shape=(224, 224))
label = gr.outputs.Label(num_top_classes=3)

gr.Interface(image_classifier, image, label,
    capture_session=True,
    interpretation="default",
    examples=[
        ["images/cheetah1.jpg"],
        ["images/lion.jpg"]
    ]).launch();