import gradio as gr
import pathlib
from PIL import Image
import numpy as np
import urllib.request

source_dir = pathlib.Path(__file__).parent

urllib.request.urlretrieve(
  'https://gradio-builds.s3.amazonaws.com/demo-files/base.png',
   str(source_dir / "base.png")
)
urllib.request.urlretrieve(
    "https://gradio-builds.s3.amazonaws.com/demo-files/buildings.png",
    str(source_dir / "buildings.png")
)

base_image = Image.open(str(source_dir / "base.png"))
building_image = Image.open(str(source_dir / "buildings.png"))

# Create segmentation mask
building_image = np.asarray(building_image)[:, :, -1] > 0

with gr.Blocks() as demo:
    gr.AnnotatedImage(
        value=(base_image, [(building_image, "buildings")]),
        height=500,
    )

demo.launch()
