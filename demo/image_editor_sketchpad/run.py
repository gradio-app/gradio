import gradio as gr
import numpy as np

def percent_of_pixels_selected(image):
    mask = image["layers"][0]
    mask_bool = mask[:,:,3] > 0
    return f"{round(np.sum(mask_bool) / mask_bool.size * 100, 2)}%"

with gr.Blocks() as demo:
    with gr.Row():
        image_editor = gr.Sketchpad(
            type="numpy",
        )
        output_image = gr.Label(
            label="Percent of Pixels Selected"
        )
        image_editor.change(fn=percent_of_pixels_selected, inputs=image_editor, outputs=output_image)

if __name__ == "__main__":
    demo.launch()