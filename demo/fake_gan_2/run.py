# This demo needs to be run from the repo folder.
# python demo/fake_gan/run.py
import time

import gradio as gr
# get_image() returns file paths (randomly if None) to sample media included with Gradio
from gradio.media import get_image

def fake_gan(desc):
    if desc == "NSFW":
        raise gr.Error("NSFW - banned content.")
    if desc == "error":
        raise ValueError("error")
    time.sleep(9)
    image = get_image()

    return image

demo = gr.Interface(
    fn=fake_gan,
    inputs=gr.Textbox(),
    outputs=gr.Image(label="Generated Image"),
    title="FD-GAN",
    description="This is a fake demo of a GAN. In reality, the images are randomly chosen from Unsplash.",
    api_name="predict"
)
demo.queue(max_size=3)

if __name__ == "__main__":
    demo.launch()
