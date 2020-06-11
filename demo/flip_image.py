import gradio as gr
import numpy as np
from time import time

def flip(image):
    start = time()
    return np.flipud(image), time() - start

def flip2(image):
    start = time()
    return np.fliplr(image), time() - start


gr.Interface([flip, flip2], 
             "imagein", 
             [
                 "image", 
                 gr.outputs.Textbox(lines=1)
             ]).launch()