import numpy as np

import gradio as gr


def process(frame, flip):
    out = np.flip(frame, axis=0) if flip else frame
    height, width = frame.shape[:2]
    return out, f"{width}x{height}"


with gr.Blocks() as demo:
    gr.Markdown("# Flip a webcam stream over WebRTC")
    webcam = gr.Image(label="Webcam", sources=["webcam"], streaming=True)
    flip = gr.Checkbox(label="Flip vertically", value=True)
    size = gr.Textbox(label="Frame size")
    webcam.stream(
        process,
        inputs=[webcam, flip],
        outputs=[webcam, size],
        transport="webrtc",
        time_limit=60,
    )

if __name__ == "__main__":
    demo.launch()
