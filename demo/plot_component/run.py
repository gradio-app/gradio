import gradio as gr 
import matplotlib.pyplot as plt
import numpy as np

Fs = 8000
f = 5
sample = 8000
x = np.arange(sample)
y = np.sin(2 * np.pi * f * x / Fs)
plt.plot(x, y)

with gr.Blocks() as demo:
    gr.Plot(value=plt)

demo.launch()