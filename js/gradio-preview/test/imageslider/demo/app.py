import gradio as gr
from imageslider import ImageSlider

with gr.Blocks() as demo:
    img_one = gr.Image(label="Image 1")
    img_two = gr.Image(label="Image 2")
    btn = gr.Button("Compare")
    img_slider = ImageSlider(label="Image Slider")
    btn.click(lambda x, y: (x, y), inputs=[img_one, img_two], outputs=[img_slider])


demo.launch()
