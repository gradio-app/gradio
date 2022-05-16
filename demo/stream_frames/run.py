import gradio as gr
import numpy as np

with gr.Blocks() as demo:
    inp = gr.Image(source="webcam")
    out = gr.Image()

    def flip(im):
        return np.flipud(im)
    inp.stream(flip, [inp], [out])

if __name__ == "__main__":
    demo.launch()