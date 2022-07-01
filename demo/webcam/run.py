import numpy as np

import gradio as gr


def snap(image):
    return image


demo = gr.Interface(snap, gr.Image(source="webcam", tool=None), "image")

if __name__ == "__main__":
    demo.launch()
