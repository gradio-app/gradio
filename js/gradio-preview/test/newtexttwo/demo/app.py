
import gradio as gr
from newtexttwo import NewTextTwo

with gr.Blocks() as demo:
    NewTextTwo()

demo.launch()
