# This demo needs to be run from the /demo/ folder.

import random
import time

import gradio as gr

def fake_gan(*args):
    time.sleep(2)
    return "fake_gan/fake" + str(random.randint(0, 5)) + ".jpg"

demo = gr.Interface(
    fn = fake_gan,
    inputs = [
        gr.Image(label="Initial Image (optional)"),
        gr.Slider(25, minimum=0, maximum=50, label="TV_scale (for smoothness)"),
        gr.Slider(25, minimum=0, maximum=50, label="Range_Scale (out of range RBG)"),
        gr.Number(label="Seed"),
        gr.Number(label="Respacing"),
    ],
    outputs = gr.Image(label="Generated Image"),
)


if __name__ == "__main__":
    demo.launch()