import gradio as gr
import numpy as np
from time import time


def flip(image):
    start = time()
    return image


def flip2(image):
    start = time()
    return np.fliplr(image)


gr.Interface([flip, flip2], 
             gr.inputs.Image(shape=(50, 50, 3)), 
             ["image"],
             examples=[
                 ["images/cheetah1.jpg"],
                 ["images/cheetah2.jpg"],
                 ["images/lion.jpg"],
             ]
             ).launch()