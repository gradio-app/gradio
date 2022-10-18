import gradio as gr 

with gr.Blocks() as demo:
    gr.File()

demo.launch()