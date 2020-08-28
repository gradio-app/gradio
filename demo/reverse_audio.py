import gradio as gr
import numpy as np


def reverse_audio(audio):
    sr, data = audio
    return (sr, np.flipud(data))


io = gr.Interface(reverse_audio, "microphone", "audio")

io.test_launch()
io.launch()
