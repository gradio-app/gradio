import numpy as np

import gradio as gr
from gradio import Templates


def snap(image):
    return np.flipud(image)


demo = gr.Interface(snap, gr.component("webcam"), gr.component("image"))

if __name__ == "__main__":
    demo.launch()
