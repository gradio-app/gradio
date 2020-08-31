# Demo: (Image) -> (Image)

import gradio as gr


def snap(image):
    return np.flipud(image)


io = gr.Interface(snap, gr.inputs.Image(shape=(100,100), image_mode="L", source="webcam"), "image")

io.test_launch()
io.launch()
