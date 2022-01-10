import gradio as gr
import numpy as np

def reverse_audio(audio):
    sr, data = audio
    return (sr, np.flipud(data))

iface = gr.Interface(reverse_audio, "audio", "audio", examples="audio")

if __name__ == "__main__":
    iface.launch()
