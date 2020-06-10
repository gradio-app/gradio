import gradio as gr
import numpy as np

def flip(image):
    return np.flipud(image)

gr.Interface(flip, "image", "image").launch()