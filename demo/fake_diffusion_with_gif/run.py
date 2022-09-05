import gradio as gr
import numpy as np
import time
import os
import PIL
from PIL import Image


def create_gif(images):
    pil_images = []
    for image in images:
        if isinstance(image, str):
            image = Image.open(image)
        else:
            image = Image.fromarray((image * 255).astype(np.uint8))
        pil_images.append(image)
    fp_out = os.path.join(os.path.dirname(__file__), "image.gif")
    img = pil_images.pop(0)
    img.save(fp=fp_out, format='GIF', append_images=pil_images,
            save_all=True, duration=400, loop=0)
    return fp_out


def fake_diffusion(steps):
    images = []
    for _ in range(steps):
        time.sleep(1)
        image = np.random.random((200, 200, 3))
        images.append(image)
        yield image, gr.Image.update(visible=False)
    
    time.sleep(1)
    image = os.path.join(os.path.dirname(__file__), "cheetah.jpg")
    images.append(image)
    gif_path = create_gif(images)
    
    yield image, gr.Image.update(value=gif_path, visible=True)


demo = gr.Interface(fake_diffusion, 
                    inputs=gr.Slider(1, 10, 3), 
                    outputs=["image", gr.Image(label="All Images", visible=False)])
demo.queue()

if __name__ == "__main__":
    demo.launch()
