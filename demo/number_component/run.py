import gradio as gr 

with gr.Blocks() as demo:
    gr.Number()

demo.launch()