import gradio as gr
import os

def image_mod(image):
    return image.rotate(45)

new_samples = [
    [os.path.join(os.path.dirname(__file__), "images/logo.png")],
    [os.path.join(os.path.dirname(__file__), "images/tower.jpg")],
]

with gr.Blocks() as demo:
    interface = gr.Interface(
        image_mod,
        gr.Image(type="pil"),
        "image",
        flagging_options=["blurry", "incorrect", "other"],
        examples=[
            os.path.join(os.path.dirname(__file__), "images/cheetah1.jpg"),
            os.path.join(os.path.dirname(__file__), "images/lion.jpg"),
        ],
    )

    btn = gr.Button("Update Examples")
    btn.click(lambda : gr.Dataset(samples=new_samples), None, interface.examples_handler.dataset)

if __name__ == "__main__":
    demo.launch()
