
import gradio as gr
from newnewtext import NewNewText

with gr.Blocks() as demo:
    NewNewText()

demo.launch()
