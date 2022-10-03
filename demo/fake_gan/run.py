# This demo needs to be run from the repo folder.
# python demo/fake_gan/run.py
import os
import random

import gradio as gr


def fake_gan():
    images = [
        "files/cheetah1.jpg"
        for _ in range(3)
    ]
    return images


with gr.Blocks() as demo:
    # with gr.Row(variant="box"):
    #     text = gr.Textbox(
    #         label="Enter your prompt",
    #         show_label=False,
    #         max_lines=1,
    #         placeholder="Enter your prompt",
    #     ).style(
    #         container=False,
    #     )
    #     btn = gr.Button("Generate image").style(full_width=False)
    with gr.Group():
        with gr.Box():
            with gr.Row(elem_id="prompt-container").style(mobile_collapse=False, equal_height=True):
                text = gr.Textbox(
                    label="Enter your prompt",
                    show_label=False,
                    max_lines=1,
                    placeholder="Enter your prompt",
                    elem_id="prompt-text-input",
                ).style(
                    border=(True, False, True, True),
                    rounded=(True, False, False, True),
                    container=False,
                )
                btn = gr.Button("Generate image").style(
                    margin=False,
                    rounded=(False, True, True, False),
                    full_width=False,
                )


        gallery = gr.Gallery(
            label="Generated images", show_label=False, elem_id="gallery"
        ).style(grid=[2], height="auto")

    btn.click(fake_gan, None, gallery)

if __name__ == "__main__":
    demo.launch()
