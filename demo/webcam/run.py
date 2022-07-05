import numpy as np

import gradio as gr


def snap(image, video):
    return [image, video]


demo = gr.Interface(
    snap,
    [gr.Image(source="webcam", tool=None), gr.Video(source="webcam")],
    ["image", "video"],
)

if __name__ == "__main__":
    demo.launch()
