import gradio as gr
import numpy as np
from time import time


def flip(image):
    start = time()
    return image, {
        "1": 0.2,
        "2": 0.8
    }


def flip2(image):
    start = time()
    return np.fliplr(image), "stuff"


gr.Interface([flip, flip2], 
             gr.inputs.Image(shape=(50, 50, 3)), 
             ["image", "label"],
             examples=[
                 ["images/cheetah1.jpg"],
                 ["images/cheetah2.jpg"],
                 ["images/lion.jpg"],
             ]
             ).launch()