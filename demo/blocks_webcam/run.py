import numpy as np

import gradio as gr


def snap(image):
    return np.flipud(image)


demo = gr.Interface(snap, "webcam", "image")

if __name__ == "__main__":
    demo.launch()
