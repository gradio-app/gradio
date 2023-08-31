import numpy as np
import gradio as gr


with gr.Blocks() as demo:
    gr.Markdown("Flip text or image files using this demo.")
    with gr.Tab("Flip Text"):
        text_input = gr.Textbox()
        text_output = gr.Textbox()
        text_button = gr.Button("Flip")
    with gr.Tab("Flip Image"):
        with gr.Row():
            image_input = gr.Image()
            image_output = gr.Image()
        image_button = gr.Button("Flip")

    with gr.Accordion("Open for More!"):
        gr.Markdown("Look at me...")

    @text_button.click(inputs=text_input, outputs=text_output)
    def flip_text(x):
        return x[::-1]

    @image_button.click(inputs=image_input, outputs=image_output)
    def flip_image(x):
        return np.fliplr(x)

if __name__ == "__main__":
    demo.launch()
