import gradio as gr
import numpy as np


def image_mod(text):
    return text[::-1]

block = gr.Blocks()

with block:
    text = gr.Textbox()
    btn = gr.Button("Run")
    btn.click(image_mod, text, text)

print(block.get_config_file())
if __name__ == "__main__":
    block.launch()
