import gradio as gr
with gr.Blocks() as demo:
     component = gr.Dropdown(choices=["First Choice", "Second Choice", "Third Choice"])
demo.launch()