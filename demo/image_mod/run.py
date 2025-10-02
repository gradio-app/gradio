import gradio as gr
from gradio.media import get_image

def image_mod(image):
    return image.rotate(45)

# get_image() returns file paths to sample media included with Gradio
new_samples = [
    [get_image("logo.png")],
    [get_image("tower.jpg")],
]

with gr.Blocks() as demo:
    interface = gr.Interface(
        image_mod,
        gr.Image(type="pil"),
        "image",
        flagging_options=["blurry", "incorrect", "other"],
        examples=[
            get_image("cheetah1.jpg"),
            get_image("lion.jpg"),
        ],
    )

    btn = gr.Button("Update Examples")
    btn.click(lambda : gr.Dataset(samples=new_samples), None, interface.examples_handler.dataset)

if __name__ == "__main__":
    demo.launch()
