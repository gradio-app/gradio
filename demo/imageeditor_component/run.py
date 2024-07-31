import gradio as gr

with gr.Blocks() as demo:
    gr.ImageEditor()

demo.launch()
