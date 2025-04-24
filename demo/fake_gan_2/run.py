# This demo needs to be run from the repo folder.
# python demo/fake_gan/run.py
import random
import time

import gradio as gr

def fake_gan(desc):
    if desc == "NSFW":
        raise gr.Error("NSFW - banned content.")
    if desc == "error":
        raise ValueError("error")
    time.sleep(9)
    image = random.choice(
        [
            "files/cheetah1.jpg",
            "files/elephant.jpg",
            "files/tiger.jpg",
            "files/zebra.jpg",
        ]
    )
    return image

demo = gr.Interface(
    fn=fake_gan,
    inputs=gr.Textbox(),
    outputs=gr.Image(label="Generated Image"),
    title="FD-GAN",
    description="This is a fake demo of a GAN. In reality, the images are randomly chosen from Unsplash.",
)
demo.queue(max_size=3)

if __name__ == "__main__":
    demo.launch()
