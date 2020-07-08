import gradio as gr
import numpy as np

def snap(image):
    return image

gr.Interface(snap, gr.inputs.Webcam(shape=(50,100)), "image").launch()
