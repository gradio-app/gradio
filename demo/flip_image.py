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

gr.Interface(flip2, 
             ["webcam"], 
             ["image"],
             examples=[
                 ["images/cheetah1.jpg"],
                 ["images/cheetah2.jpg"],
                 ["images/lion.jpg"],
             ]
             ).launch(share=False)
