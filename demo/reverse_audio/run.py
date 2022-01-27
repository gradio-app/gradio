import numpy as np

import gradio as gr


def reverse_audio(audio):
    sr, data = audio
    return (sr, np.flipud(data))

<<<<<<< HEAD
iface = gr.Interface(reverse_audio, "audio", "audio", examples="audio")
=======

iface = gr.Interface(reverse_audio, "microphone", "audio", examples="audio")
>>>>>>> master

if __name__ == "__main__":
    iface.launch()
