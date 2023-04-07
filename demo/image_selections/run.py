import gradio as gr
import numpy as np

with gr.Blocks() as demo:
    with gr.Row():
        non_selectable_input_image = gr.Image(label="No select input")
        non_selectable_output_image = gr.Image(label="No select output")
    with gr.Row():
        selectable_input_image = gr.Image(label="Select input")
        selectable_output_image = gr.Image(label="Select out", interactive=False).style(height=200)
    with gr.Row():
        img_input_coords = gr.Textbox(label="Input coords")
        img_output_coords = gr.Textbox(label="Output coords")

    non_selectable_input_image.change(lambda x:x, non_selectable_input_image, non_selectable_output_image)
    selectable_input_image.change(lambda x:x, selectable_input_image, selectable_output_image)

    def get_select_coords(evt: gr.SelectData):
        return evt.index
    selectable_input_image.select(get_select_coords, None, img_input_coords)
    selectable_output_image.select(get_select_coords, None, img_output_coords)

if __name__ == "__main__":
    demo.launch()
