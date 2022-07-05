import gradio as gr
import numpy as np
from PIL import Image, ImageColor



def change_color(icon, color):


    """
    Function that given an icon in .png format changes its color
    Args:
        icon: Icon whose color needs to be changed.
        color: Chosen color with which to edit the input icon.
    Returns:
        edited_image: Edited icon.
    """
    img = icon.convert("LA")
    img = img.convert("RGBA")
    image_np = np.array(icon)
    _, _, _, alpha = image_np.T
    mask = (alpha > 0)
    image_np[..., :-1][mask.T] = ImageColor.getcolor(color, "RGB")
    edited_image = Image.fromarray(image_np)
    return edited_image


inputs = [
        gr.Image(label="icon", type="pil", image_mode="RGBA"),
        gr.ColorPicker(label="color")
    ]
outputs = gr.Image(label="colored icon")

demo = gr.Interface(
    fn=change_color,
    inputs=inputs,
    outputs=outputs,
)

if __name__ == "__main__":
    demo.launch()

