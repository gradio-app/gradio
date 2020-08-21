# Demo: (Image) -> (HighlightedText, KeyValues, HTML)

import gradio as gr
import numpy as np

def snap(image):
    return np.flipud(image)

gr.Interface(snap, gr.inputs.Image(shape=(100,100), image_mode="L", source="webcam"), "image").launch()
