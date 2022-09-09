# URL: https://huggingface.co/spaces/gradio/animeganv2
# imports
import gradio as gr
from PIL import Image
import torch

# load the models
model2 = torch.hub.load(
    "AK391/animegan2-pytorch:main",
    "generator",
    pretrained=True,
    progress=False
)
model1 = torch.hub.load("AK391/animegan2-pytorch:main", "generator", pretrained="face_paint_512_v1")
face2paint = torch.hub.load(
    'AK391/animegan2-pytorch:main', 'face2paint', 
    size=512, side_by_side=False
)

# define the core function
def inference(img, ver):
    if ver == 'version 2 (🔺 robustness,🔻 stylization)':
        out = face2paint(model2, img)
    else:
        out = face2paint(model1, img)
    return out

# define the title, description and examples
title = "AnimeGANv2"
description = "Gradio Demo for AnimeGanv2 Face Portrait. To use it, simply upload your image, or click one of the examples to load them. Read more at the links below. Please use a cropped portrait picture for best results similar to the examples below."
article = "<p style='text-align: center'><a href='https://github.com/bryandlee/animegan2-pytorch' target='_blank'>Github Repo Pytorch</a></p> <center><img src='https://visitor-badge.glitch.me/badge?page_id=akhaliq_animegan' alt='visitor badge'></center></p>"
examples=[['groot.jpeg','version 2 (🔺 robustness,🔻 stylization)'],['bill.png','version 1 (🔺 stylization, 🔻 robustness)'],['tony.png','version 1 (🔺 stylization, 🔻 robustness)'],['elon.png','version 2 (🔺 robustness,🔻 stylization)'],['IU.png','version 1 (🔺 stylization, 🔻 robustness)'],['billie.png','version 2 (🔺 robustness,🔻 stylization)'],['will.png','version 2 (🔺 robustness,🔻 stylization)'],['beyonce.png','version 1 (🔺 stylization, 🔻 robustness)'],['gongyoo.jpeg','version 1 (🔺 stylization, 🔻 robustness)']]

# define the interface
demo = gr.Interface(
    fn=inference, 
    inputs=[gr.inputs.Image(type="pil"),gr.inputs.Radio(['version 1 (🔺 stylization, 🔻 robustness)','version 2 (🔺 robustness,🔻 stylization)'], type="value", default='version 2 (🔺 robustness,🔻 stylization)', label='version')], 
    outputs=gr.outputs.Image(type="pil"),
    title=title,
    description=description,
    article=article,
    examples=examples)

# launch    
demo.launch()