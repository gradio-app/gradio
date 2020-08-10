import gradio as gr
import random

def upload(file):
    print(file.name)
    return "/mnt/c/Users/aliab/projects/gradio/gradio/static/js/interfaces/output/file.js"

gr.Interface(upload, "file", "file").launch()
