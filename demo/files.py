import gradio as gr
import random

def upload(file):
    print(file.name)
    with file:
        return file.name

gr.Interface(upload, "file", "text").launch()
