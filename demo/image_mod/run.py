import gradio as gr
import os


def image_mod(image):
    return image.rotate(45)


demo = gr.Interface(image_mod, gr.Image(type="pil"), "image",
    flagging_options=["blurry", "incorrect", "other"], examples=[
        os.path.join(os.path.dirname(__file__), "images/cheetah1.jpg"),
        os.path.join(os.path.dirname(__file__), "images/lion.jpg"),
        os.path.join(os.path.dirname(__file__), "images/logo.png")
        ])

if __name__ == "__main__":
    demo.launch()
