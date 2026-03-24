"""Image generation app — exercises file caching and downloading on output."""

import os

import numpy as np

import gradio as gr

_cl = os.environ.get("GRADIO_CONCURRENCY_LIMIT", "1")
concurrency_limit = None if _cl == "none" else int(_cl)


def generate_image(text):
    # Generate a random 256x256 RGB image to exercise file serialization
    rng = np.random.default_rng(hash(text) % 2**32)
    img = rng.integers(0, 255, (256, 256, 3), dtype=np.uint8)
    return img


demo = gr.Interface(
    fn=generate_image,
    inputs=gr.Textbox(),
    outputs=gr.Image(),
    concurrency_limit=concurrency_limit,
)

if __name__ == "__main__":
    demo.launch()
