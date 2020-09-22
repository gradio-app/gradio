# Demo: (Audio) -> (Image)

import gradio as gr
import matplotlib.pyplot as plt
import numpy as np
from scipy import signal


def spectrogram(audio):
    sr, data = audio
    data = np.delete(data, 1, 1).reshape(-1)
    frequencies, times, spectrogram_data = signal.spectrogram(data.reshape(-1), sr, window="hamming")
    plt.pcolormesh(times, frequencies, np.log10(spectrogram_data))
    return plt


io = gr.Interface(spectrogram, "audio", "plot")

io.test_launch()
io.launch()
