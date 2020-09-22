# Demo: (Image) -> (Image)

import gradio as gr


def image_mod(image):
    return image.rotate(45)



io = gr.Interface(image_mod, 
             gr.inputs.Image(type="pil"), 
             "image", 
             # examples=[
             #     ["images/cheetah1.jpg"],
             #     ["images/cheetah2.jpg"],
             #     ["images/lion.jpg"],
             # ],
             live=True, server_port=7860)

gr.reset_all()
io.test_launch()
io.launch()
