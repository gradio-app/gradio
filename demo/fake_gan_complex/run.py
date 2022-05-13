# This demo needs to be run from the repo folder.
# python demo/fake_gan/run.py
import random
import time

import gradio as gr


def fake_gan(*args):
    time.sleep(1)
    image = random.choice(
        [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
            "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=386&q=80",
            "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aHVtYW4lMjBmYWNlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",
            "https://images.unsplash.com/photo-1546456073-92b9f0a8d413?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
            "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=464&q=80",
        ]
    )
    return image


demo = gr.Interface(
    fn=fake_gan,
    inputs=[
        gr.Image(label="Initial Image (optional)"),    
#  gr.Section not compatible yet, maybe post 3.0 https://github.com/gradio-app/gradio/issues/1241
#        gr.Section("**Parameters**"),
        gr.Slider(25, minimum=0, maximum=50, label="TV_scale (for smoothness)"),
        gr.Slider(25, minimum=0, maximum=50, label="Range_Scale (out of range RBG)"),
        gr.Number(label="Respacing"),
#        gr.Section("**Parameters Two**"),
        gr.Slider(25, minimum=0, maximum=50, label="Range_Scale (out of range RBG)"),
        gr.Number(label="Respacing"),
#        gr.Section("**Parameters Three**"),
        gr.Textbox(label="Respacing"),
    ],
    outputs=gr.Image(label="Generated Image"),
    title="FD-GAN",
    description="This is a fake demo of a GAN. In reality, the images are randomly chosen from Unsplash.",
)

if __name__ == "__main__":
    demo.launch()
