import gradio as gr
import numpy as np
import time
import os
from PIL import Image
import requests
from io import BytesIO

def create_gif(images):
    pil_images = []
    for image in images:
        if isinstance(image, str):
            response = requests.get(image)
            image = Image.open(BytesIO(response.content))
        else:
            image = Image.fromarray((image * 255).astype(np.uint8))
        pil_images.append(image)
    fp_out = os.path.join(os.path.dirname(__file__), "image.gif")
    img = pil_images.pop(0)
    img.save(fp=fp_out, format='GIF', append_images=pil_images,
            save_all=True, duration=400, loop=0)
    return fp_out

def fake_diffusion(steps):
    rng = np.random.default_rng()
    images = []
    for _ in range(steps):
        time.sleep(1)
        image = rng.random((600, 600, 3))
        images.append(image)
        yield image, gr.Image(visible=False)

    time.sleep(1)
    image = "https://gradio-builds.s3.amazonaws.com/diffusion_image/cute_dog.jpg"
    images.append(image)
    gif_path = create_gif(images)

    yield image, gr.Image(value=gif_path, visible=True)

demo = gr.Interface(fake_diffusion,
                    inputs=gr.Slider(1, 10, 3, step=1),
                    outputs=["image", gr.Image(label="All Images", visible=False)])

if __name__ == "__main__":
    demo.launch()
