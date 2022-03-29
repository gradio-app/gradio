import matplotlib.pyplot as plt
import numpy as np
from scipy import signal

import gradio as gr


def spectrogram(audio):
    sr, data = audio
    if len(data.shape) == 2:
        data = np.mean(data, axis=0)
    frequencies, times, spectrogram_data = signal.spectrogram(
        data, sr, window="hamming"
    )
    plt.pcolormesh(times, frequencies, np.log10(spectrogram_data))
    return plt


demo = gr.Interface(spectrogram, "audio", "plot")

if __name__ == "__main__":
    demo.launch()
