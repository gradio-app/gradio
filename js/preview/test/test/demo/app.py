
import gradio as gr
from gradio_test import Test


example = Test().example_inputs()

with gr.Blocks() as demo:
    Test(value=example, interactive=True)
    Test(value=example, interactive=False)


demo.launch()
