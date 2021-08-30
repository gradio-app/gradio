# Demo: (Image) -> (Image)

import gradio as gr


def image_mod(image):
    if image is None:
        return "images/lion.jpg"
    return image.rotate(45)


iface = gr.Interface(image_mod, 
             gr.inputs.Image(type="pil", optional=True), 
             "image", 
             examples=[
                 ["images/cheetah1.jpg"],
                 ["images/cheetah2.jpg"],
                 ["images/lion.jpg"],
             ])

iface.test_launch()

if __name__ == "__main__":
    iface.launch()
