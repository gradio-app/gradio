# Demo: (Audio) -> (Image)

import gradio as gr
import matplotlib.pyplot as plt
import numpy as np
from scipy import signal


def spectrogram(audio):
    sr, data = audio
    if len(data.shape) == 2:
        data = np.mean(data, axis=0)
    frequencies, times, spectrogram_data = signal.spectrogram(data, sr, window="hamming")
    plt.pcolormesh(times, frequencies, np.log10(spectrogram_data))
    return plt


io = gr.Interface(spectrogram, "audio", "plot")

io.test_launch()
io.launch()
