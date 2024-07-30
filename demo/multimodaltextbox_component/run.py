import gradio as gr

with gr.Blocks() as demo:
    gr.MultimodalTextbox(interactive=True)

demo.launch()
