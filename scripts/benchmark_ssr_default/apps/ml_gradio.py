"""simple_gradio.py with a slow, model-like function (see ml_work.py).

Gradio's defaults are kept: the event goes through the queue with
concurrency_limit=1, so one call runs at a time and the rest wait their turn.
"""

import gradio as gr
from ml_work import work


def greet(name):
    work()
    return f"Hello {name}!"


with gr.Blocks(title="bench") as demo:
    name = gr.Textbox(label="Name", elem_id="name")
    btn = gr.Button("Greet", elem_id="greet")
    out = gr.Textbox(label="Greeting", elem_id="out")
    btn.click(greet, name, out, api_name="greet")
