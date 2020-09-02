# Demo: (Image) -> (Image)

import gradio as gr
from time import time
from PIL import Image


def image_mod(image):
    return image.rotate(45)


gr.Interface(image_mod, 
             gr.inputs.Image(type="pil"), 
             "image", 
             examples=[
                 ["images/cheetah1.jpg"],
                 ["images/cheetah2.jpg"],
                 ["images/lion.jpg"],
             ],
             ).launch(share=True)
