import gradio as gr
from PIL import ImageFilter


def image_mod(image):
    return image.rotate(45), image.filter(ImageFilter.FIND_EDGES)


io = gr.Interface(
    image_mod,
    gr.inputs.Image(type="pil", tool="select"),
    [
        gr.outputs.Image(type="pil"),
        gr.outputs.Image(type="pil"),
    ],
    examples=[
        ["images/cheetah1.jpg"],
        ["images/cheetah2.jpg"],
        ["images/lion.jpg"],
    ], live=True)

io.test_launch()
io.launch()
