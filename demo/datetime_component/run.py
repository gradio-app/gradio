import gradio as gr

with gr.Blocks() as demo:
    gr.DateTime()

demo.launch()
