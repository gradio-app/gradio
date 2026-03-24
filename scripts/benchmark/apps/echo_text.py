"""Minimal echo app — isolates framework overhead."""

import os

import gradio as gr

_cl = os.environ.get("GRADIO_CONCURRENCY_LIMIT", "1")
concurrency_limit = None if _cl == "none" else int(_cl)

demo = gr.Interface(
    fn=lambda x: x,
    inputs="textbox",
    outputs="textbox",
    concurrency_limit=concurrency_limit,
)

if __name__ == "__main__":
    demo.launch()
