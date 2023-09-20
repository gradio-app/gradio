
import gradio as gr
from newtext import NewText

with gr.Blocks() as demo:
    NewText(interactive=True)
    NewText(interactive=False)
    

demo.launch()
