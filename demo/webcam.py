# Demo: (Image) -> (Image)

import gradio as gr
import numpy as np


def snap(image):
    return np.flipud(image)


iface = gr.Interface(snap, gr.inputs.Image(shape=(100,100), image_mode="L", source="webcam"), "image", live=True)

iface.test_launch()
if __name__ == "__main__":
    iface.launch()
