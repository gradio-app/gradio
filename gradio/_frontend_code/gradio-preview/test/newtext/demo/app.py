
import gradio as gr
from newtext import NewText

with gr.Blocks() as demo:
    NewText()

demo.launch()
