import gradio as gr
with gr.Blocks() as demo:
     component = gr.Radio(choices=["First Choice", "Second Choice", "Third Choice"])
demo.launch()