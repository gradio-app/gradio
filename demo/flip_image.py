import gradio as gr
import numpy as np
from time import time


def flip(image):
    start = time()
    return image


def flip2(image):
    start = time()
    return np.fliplr(image)


gr.Interface(flip, 
             gr.inputs.Image(), 
             ["image"],
             examples=[
                 ["images/cheetah1.jpg"],
                 ["images/cheetah2.jpg"],
                 ["images/lion.jpg"],
             ]
             ).launch()