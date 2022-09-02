import gradio as gr
import numpy as np
import time
import os


def fake_diffusion(steps):
    for i in range(steps):
        time.sleep(1)
        yield np.random.random((200, 200, 3))
    time.sleep(1)
    yield os.path.join(os.path.dirname(__file__), "cheetah.jpg")

with gr.Blocks() as demo:
    slider = gr.Slider(1, 10, 3)
    button = gr.Button()
    image = gr.Image()
    button.click(fake_diffusion, slider, image)

if __name__ == "__main__":
    demo.launch()
