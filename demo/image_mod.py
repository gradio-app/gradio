import gradio as gr
from time import time
from PIL import Image, ImageFilter


def image_mod(image):
    return image.rotate(45), image.filter(ImageFilter.FIND_EDGES)


gr.Interface(image_mod, 
             gr.inputs.Image(type="pil"), 
             [
                gr.outputs.Image(type="pil"), 
                gr.outputs.Image(type="pil"), 
             ],
             examples=[
                 ["images/cheetah1.jpg"],
                 ["images/cheetah2.jpg"],
                 ["images/lion.jpg"],
             ]
             ).launch(share=True)
