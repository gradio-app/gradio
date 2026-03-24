"""Realistic text-to-image app — uses HuggingFace Inference API."""

import os

from huggingface_hub import InferenceClient

import gradio as gr

_cl = os.environ.get("GRADIO_CONCURRENCY_LIMIT", "1")
concurrency_limit = None if _cl == "none" else int(_cl)

client = InferenceClient(provider="fal-ai")


def generate(prompt):
    image = client.text_to_image(
        prompt,
        model="black-forest-labs/FLUX.1-schnell",
    )
    return image


demo = gr.Interface(
    fn=generate,
    inputs=gr.Textbox(label="Prompt"),
    outputs=gr.Image(label="Generated Image"),
    concurrency_limit=concurrency_limit,
)

if __name__ == "__main__":
    demo.launch()
