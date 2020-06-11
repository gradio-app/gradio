import gradio as gr
import numpy as np

def snap(image):
    return np.flipud(image)

gr.Interface(snap, "webcam", "image", live=True, show_input=False).launch()