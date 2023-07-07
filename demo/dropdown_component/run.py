import gradio as gr 

with gr.Blocks() as demo:
    gr.Dropdown(choices=["First Choice", "Second Choice", "Third Choice"])

demo.launch()