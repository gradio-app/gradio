import numpy as np

import gradio as gr
from gradio.webrtc import AdditionalOutputs


def process(frame, flip):
    out = np.flip(frame, axis=0) if flip else frame
    height, width = frame.shape[:2]
    return out, AdditionalOutputs(f"{width}x{height}")


with gr.Blocks() as demo:
    gr.Markdown("# Flip a webcam stream over WebRTC")
    webrtc = gr.WebRTC(label="Webcam", mode="send-receive", modality="video")
    flip = gr.Checkbox(label="Flip vertically", value=True)
    size = gr.Textbox(label="Frame size")
    webrtc.stream(process, inputs=[webrtc, flip], outputs=[webrtc, size], time_limit=60)

if __name__ == "__main__":
    demo.launch()
