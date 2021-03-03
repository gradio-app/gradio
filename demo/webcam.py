# Demo: (Image) -> (Image)

import gradio as gr
import numpy as np


def snap(image):
    return np.flipud(image)


iface = gr.Interface(snap, gr.inputs.Image(source="webcam", tool=None), "image")

iface.test_launch()
if __name__ == "__main__":
    iface.launch()
 