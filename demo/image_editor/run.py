import gradio as gr
import numpy as np
from gradio.components.image_editor import EditorValue


def process_image(image: EditorValue):
    return image["layers"][0].sum() if image["layers"] else 0


def default_image() -> EditorValue:
    size = 512
    img = np.zeros((size, size, 3), np.uint8)
    mask = np.zeros((size, size, 4), np.uint8)
    return EditorValue(
        background=img,
        layers=[mask],
        composite=None,
    )


with gr.Blocks() as demo:
    image_editor = gr.ImageEditor(
        value=default_image(),
    )

    text = gr.Textbox(
        value=process_image,
        inputs=[image_editor],
    )

    @image_editor.clear(outputs=[image_editor])
    def on_clear() -> EditorValue:
        print("on_clear")
        return default_image()


demo.launch()
