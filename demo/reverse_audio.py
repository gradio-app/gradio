# Demo: (Audio) -> (Audio)

import gradio as gr
import numpy as np
import random

def reverse_audio(audio):
    sr, data = audio
    return (sr, np.flipud(data))

gr.Interface(reverse_audio, "microphone", "audio").launch()
