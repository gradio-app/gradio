# This demo needs to be run from the repo folder.
# python demo/fake_gan/run.py
import os
import random
import time

import gradio as gr


def fake_gan(count, *args):
    images = [
        random.choice(
            [
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
                "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=386&q=80",
                "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aHVtYW4lMjBmYWNlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",
                "https://images.unsplash.com/photo-1546456073-92b9f0a8d413?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
                "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=464&q=80",
            ]
        )
        for _ in range(int(count))
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
    outputs=gr.Gallery(label="Generated Images"),
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
