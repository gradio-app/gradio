import numpy as np

import gradio as gr
from gradio import Templates


def snap(image):
    return np.flipud(image)


demo = gr.Interface(snap, Templates.Webcam(), gr.Image())

if __name__ == "__main__":
    demo.launch()
