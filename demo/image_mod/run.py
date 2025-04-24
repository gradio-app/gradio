import gradio as gr
import os

def image_mod(image):
    """
    This is a test function that rotates an image by 45 degrees.

    Args:
        image: The image to rotate.

    Returns:
        The rotated image.
    """
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
    btn.click(lambda : gr.Dataset(samples=new_samples), None, interface.examples_handler.dataset, show_api=False)

if __name__ == "__main__":
    demo.launch()
