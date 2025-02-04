from dataclasses import dataclass
import gradio as gr

@dataclass
class Page:
    text: str
    image: str

@dataclass
class Book:
    pages: list[Page]
    author: str
    title: str

def illustrate_page(text):
    return image

with gr.Blocks() as demo:
    state = gr.State(Book(pages=[], author="", title=""))

    page_num = 