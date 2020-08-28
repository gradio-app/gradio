import gradio as gr
import matplotlib.pyplot as plt
import numpy as np
from scipy import signal


def spectogram(audio):
    sr, data = audio
    data = np.delete(data, 1, 1).reshape(-1)
    frequencies, times, spectrogram = signal.spectrogram(data.reshape(-1), sr, window="hamming")
    plt.pcolormesh(times, frequencies, np.log10(spectrogram))
    return plt


io = gr.Interface(spectogram, "audio", "plot")

io.test_launch()
io.launch()
