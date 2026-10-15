import numpy as np

import gradio as gr
from gradio.webrtc import AdditionalOutputs

frames = {"count": 0}


def process(frame, flip):
    frames["count"] += 1
    out = np.flip(frame, axis=0) if flip else frame
    if frames["count"] % 30 == 0:
        return out, AdditionalOutputs(frames["count"])
    return out


with gr.Blocks() as demo:
    gr.Markdown("# Flip a webcam stream over WebRTC")
    webrtc = gr.WebRTC(label="Webcam", mode="send-receive", modality="video")
    flip = gr.Checkbox(label="Flip vertically", value=True)
    count = gr.Number(label="Frames processed")
    webrtc.stream(
        process, inputs=[webrtc, flip], outputs=[webrtc, count], time_limit=60
    )

if __name__ == "__main__":
    demo.launch()
