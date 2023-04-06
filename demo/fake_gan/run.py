# This demo needs to be run from the repo folder.
# python demo/fake_gan/run.py
import random

import gradio as gr


def fake_gan():
    images = [
        (random.choice(
            [
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
                "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=386&q=80",
                "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aHVtYW4lMjBmYWNlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",
                "https://images.unsplash.com/photo-1546456073-92b9f0a8d413?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
                "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=464&q=80",
            ]
        ), f"label {i}" if i != 0 else "label" * 50)
        for i in range(3)
    ]
    return images


with gr.Blocks() as demo:
    with gr.Column(variant="panel"):
        with gr.Row(variant="compact"):
            text = gr.Textbox(
                label="Enter your prompt",
                show_label=False,
                max_lines=1,
                placeholder="Enter your prompt",
            ).style(
                container=False,
            )
            btn = gr.Button("Generate image").style(full_width=False)

        gallery = gr.Gallery(
            label="Generated images", show_label=False, elem_id="gallery"
        ).style(columns=[2], rows=[2], object_fit="contain", height="auto")

    btn.click(fake_gan, None, gallery)

if __name__ == "__main__":
    demo.launch()
