import gradio as gr
import numpy as np 
import requests 
from io import BytesIO
from PIL import Image

base_image = "https://gradio-docs-json.s3.us-west-2.amazonaws.com/base.png"
building_image = requests.get("https://gradio-docs-json.s3.us-west-2.amazonaws.com/buildings.png")
building_image = np.asarray(Image.open(BytesIO(building_image.content)))[:, :, -1] > 0

with gr.Blocks() as demo:
    gr.AnnotatedImage(
        value=(base_image, [(building_image, "buildings")]),
        height=500,
    )

demo.launch()