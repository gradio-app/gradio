import gradio as gr
import numpy as np
import time

def fake_diffusion(steps):
    for i in range(steps):
        time.sleep(1)
        yield np.random.random((200, 200, 3))
    time.sleep(1)
    yield "lion.jpg"

demo = gr.Interface(fake_diffusion, gr.Slider(1, 10, 3), "image")

if __name__ == "__main__":
    demo.launch()
