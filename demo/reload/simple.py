"""
A simple example of how to use gradio in development mode. To use this, navigate to the
demo/reload directory, and then run `gradio simple.py` in the terminal. 
"""
import gradio as gr


def greet(str):
    return str


with gr.Blocks() as demo:
    text = gr.Textbox("abcdef")
    text_2 = gr.Textbox("ghi")
    text.change(greet, text, text_2)

