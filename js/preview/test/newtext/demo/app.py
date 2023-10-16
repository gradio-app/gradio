import gradio as gr
from gradio_newtext import NewText


example = NewText().example_inputs()

with gr.Blocks() as demo:
    NewText(value=example, interactive=True)
    NewText(value=example, interactive=False)


demo.launch()
