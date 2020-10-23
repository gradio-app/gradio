# Demo: (Image) -> (Image)

import gradio as gr


def image_mod(image):
    return image.rotate(45)


io = gr.Interface(image_mod, 
             gr.inputs.Image(type="pil"), 
             "image", 
             examples=[
                 ["images/cheetah1.jpg"],
                 ["images/cheetah2.jpg"],
                 ["images/lion.jpg"],
             ],
             live=True)

io.test_launch()

if __name__ == "__main__":
    io.launch()
