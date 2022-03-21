import gradio as gr

block = gr.Blocks()

with block:
    gr.Textbox("Hello")

block.launch()