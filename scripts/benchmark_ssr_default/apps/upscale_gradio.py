"""An "enhance resolution" demo: an input image, a before/after ImageSlider and a
button, with a ~1 s mock model (upscale_model.py). It opens with an example
already in the slider. Gradio's defaults are kept: the queue, with
concurrency_limit=1.
"""

import gradio as gr
from upscale_model import HIGH_PATH, LOW_PATH, enhance

with gr.Blocks(title="Enhance resolution") as demo:
    gr.Markdown("## Enhance resolution")
    with gr.Row():
        image = gr.Image(
            LOW_PATH, type="pil", label="Low resolution", height=300, elem_id="input"
        )
        slider = gr.ImageSlider(
            (LOW_PATH, HIGH_PATH), label="Before / after", height=300, elem_id="slider"
        )
    btn = gr.Button("Enhance", variant="primary", elem_id="enhance")
    btn.click(enhance, image, slider, api_name="enhance")
