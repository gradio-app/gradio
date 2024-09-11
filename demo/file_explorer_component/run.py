import gradio as gr

with gr.Blocks() as demo:
    gr.FileExplorer()

demo.launch()
