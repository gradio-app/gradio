# This demo needs to be run from the repo folder.
# python demo/fake_gan/run.py
import os
import random

import gradio as gr


def fake_gan(count, *args):
    images = [
        (random.choice(
            [
                "files/cheetah1.jpg",
            ]
        ), f"label {i}" if i != 0 else "label" * 50)
        for i in range(int(count))
    ]
    return images


cheetah = os.path.join(os.path.dirname(__file__), "files/cheetah1.jpg")

demo = gr.Interface(
    fn=fake_gan,
    inputs=[
        gr.Number(label="Generation Count"),
        gr.Image(label="Initial Image (optional)"),
        gr.Slider(0, 50, 25, label="TV_scale (for smoothness)"),
        gr.Slider(0, 50, 25, label="Range_Scale (out of range RBG)"),
        gr.Number(label="Seed"),
        gr.Number(label="Respacing"),
    ],
    outputs=gr.Gallery(label="Generated Images").style(grid=[2]),
    title="FD-GAN",
    description="This is a fake demo of a GAN. In reality, the images are randomly chosen from Unsplash.",
    examples=[
        [2, cheetah, None, 12, None, None],
        [1, cheetah, None, 2, None, None],
        [4, cheetah, None, 42, None, None],
        [5, cheetah, None, 23, None, None],
        [4, cheetah, None, 11, None, None],
        [3, cheetah, None, 1, None, None],
    ],
)

if __name__ == "__main__":
    demo.launch()
