import numpy as np

import gradio as gr


def snap(image):
    return np.flipud(image)


iface = gr.Interface(snap, gr.inputs.Image(source="webcam", tool=None), "image")
if __name__ == "__main__":
    iface.launch()
