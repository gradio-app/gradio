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
    return np.fliplr(image), time() - start


gr.Interface(flip2, 
             "image", 
             ["image", "text"],
             examples=[
                 ["images/cheetah1.jpg"],
                 ["images/cheetah2.jpg"],
                 ["images/lion.jpg"],
             ]
             ).launch()