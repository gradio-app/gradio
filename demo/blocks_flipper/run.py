import numpy as np
import gradio as gr


def flip_text(x):
    return x[::-1]

def flip_image(x):
    return np.fliplr(x)

demo = gr.Blocks()

with demo:
    gr.Markdown("Flip text or image files using this demo.")
    with gr.Tabs():
        with gr.TabItem("Text", css="{backround-color: #f0f0f0 !important;}"):
            with gr.Column():
                text_input = gr.Textbox()
            with gr.Column():
                text_output = gr.Textbox()
            text_button = gr.Button("Flip")
        with gr.TabItem("Image", css="{backround-color: #e1e1e1 !important;}"):
            with gr.Column():
                image_input = gr.Image()
            with gr.Column():
                image_output = gr.Image()
            image_button = gr.Button("Flip")
    
    text_button.click(flip_text, inputs=text_input, outputs=text_output)
    image_button.click(flip_image, inputs=image_input, outputs=image_output)
    
demo.launch()