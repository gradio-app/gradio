"""Stateful counter app — tests SessionState deep copy with large state."""

import os

import gradio as gr

_cl = os.environ.get("GRADIO_CONCURRENCY_LIMIT", "1")
concurrency_limit = None if _cl == "none" else int(_cl)


def increment(text, state):
    state = state or {"count": 0, "data": list(range(100))}
    state["count"] += 1
    return str(state["count"]), state


with gr.Blocks() as demo:
    state = gr.State()
    inp = gr.Textbox(label="Input")
    output = gr.Textbox(label="Count")
    btn = gr.Button("Increment")
    btn.click(
        fn=increment,
        inputs=[inp, state],
        outputs=[output, state],
        concurrency_limit=concurrency_limit,
    )

if __name__ == "__main__":
    demo.launch()
