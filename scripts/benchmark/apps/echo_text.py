"""Minimal echo app — isolates framework overhead."""

import os

import gradio as gr

_cl = os.environ.get("GRADIO_CONCURRENCY_LIMIT", "1")
concurrency_limit = None if _cl == "none" else int(_cl)

<<<<<<< HEAD
demo = gr.Interface(fn=lambda x: x, inputs="textbox", outputs="textbox", concurrency_limit=concurrency_limit)
=======
demo = gr.Interface(
    fn=lambda x: x,
    inputs="textbox",
    outputs="textbox",
    concurrency_limit=concurrency_limit,
)
>>>>>>> e90020294 (Backend Profiling: Ability to trace the server and benchmark scripts (#13032))

if __name__ == "__main__":
    demo.launch()
