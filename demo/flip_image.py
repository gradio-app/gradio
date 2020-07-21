import gradio as gr
import numpy as np
from time import time


def flip(image):
    start = time()
    return image


def flip2(image):
    start = time()
    return np.fliplr(image)

def flip10(i1, i2, i3, i4, i5):
    return i1 + i2

gr.Interface(flip10, 
             ["image"] * 5, 
             ["image"],
             examples=[
                 ["images/cheetah1.jpg"] * 5,
                 ["images/cheetah2.jpg"] * 5,
                 ["images/lion.jpg"] * 5,
             ]
             ).launch()