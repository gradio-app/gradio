import gradio as gr
import os
from pathlib import Path

from PIL import Image

root = Path(os.path.dirname(__file__))

def infer(
    text,
    guidance_scale,
):

    img = (
        Image.open(root / "cheetah.jpg")
        if text == "Cheetah"
        else Image.open(root / "frog.jpg")
    )
    img = img.resize((224, 224))

    return ([img, img, img, img], "image")

block = gr.Blocks()

examples = [
    ["A serious capybara at work, wearing a suit", 7],
    ["A Squirtle fine dining with a view to the London Eye", 7],
    ["A tamale food cart in front of a Japanese Castle", 7],
    ["a graffiti of a robot serving meals to people", 7],
    ["a beautiful cabin in Attersee, Austria, 3d animation style", 7],
]

with block as demo:
    with gr.Row(elem_id="prompt-container", equal_height=True):
        text = gr.Textbox(
            label="Enter your prompt",
            show_label=False,
            max_lines=1,
            placeholder="Enter your prompt",
            elem_id="prompt-text-input",
        )

    gallery = gr.Gallery(
        label="Generated images", show_label=False, elem_id="gallery", rows=2, columns=2
    )
    out_txt = gr.Textbox(
        label="Prompt",
        placeholder="Enter a prompt to generate an image",
        lines=3,
        elem_id="prompt-text-input",
    )

    guidance_scale = gr.Slider(
        label="Guidance Scale", minimum=0, maximum=50, value=7.5, step=0.1
    )

    ex = gr.Examples(
        examples=examples,
        fn=infer,
        inputs=[text, guidance_scale],
        outputs=[gallery, out_txt],
        cache_examples=True,
    )

    text.submit(
        infer,
        inputs=[text, guidance_scale],
        outputs=[gallery, out_txt],
        concurrency_id="infer",
        concurrency_limit=8,
    )

with gr.Blocks() as demo:
    block.render()

if __name__ == "__main__":
    demo.queue(max_size=10, api_open=False).launch(show_api=False)
