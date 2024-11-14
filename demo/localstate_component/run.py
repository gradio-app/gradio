import gradio as gr

with gr.Blocks() as demo:
    gr.LocalState()

demo.launch()
