import gradio as gr
import matplotlib.pyplot as plt
import numpy as np
from scipy import signal
from scipy.io import wavfile


def reverse_audio(audio):
    sr, data = audio
    data = np.delete(data, 1, 1).reshape(-1)
    frequencies, times, spectrogram = signal.spectrogram(data.reshape(-1), sr, window="hamming")

    plt.pcolormesh(times, frequencies, np.log10(spectrogram))
    return plt


gr.Interface(reverse_audio, "audio", "plot").launch()
