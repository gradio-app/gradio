import gradio as gr
from imageslider import ImageSlider

with gr.Blocks() as demo:
    ImageSlider(label="asd", interactive=True)
    ImageSlider(label="Static", interactive=False)


demo.launch()
