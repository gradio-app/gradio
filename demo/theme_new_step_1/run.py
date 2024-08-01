import gradio as gr
from gradio.themes.base import Base
import time

class Seafoam(Base):
    pass

seafoam = Seafoam()

with gr.Blocks(theme=seafoam) as demo:
    textbox = gr.Textbox(label="Name")
    slider = gr.Slider(label="Count", minimum=0, maximum=100, step=1)
    with gr.Row():
        button = gr.Button("Submit", variant="primary")
        clear = gr.Button("Clear")
    output = gr.Textbox(label="Output")

    def repeat(name, count):
        time.sleep(3)
        return name * count

    button.click(repeat, [textbox, slider], output)

if __name__ == "__main__":
    demo.launch()
