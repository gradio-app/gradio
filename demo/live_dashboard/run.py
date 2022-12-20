import math

import pandas as pd

import gradio as gr
import datetime
import numpy as np


def get_time():
    return datetime.datetime.now()


plot_end = 2 * math.pi


def get_plot(period=1):
    global plot_end
    x = np.arange(plot_end - 2 * math.pi, plot_end, 0.02)
    y = np.sin(2 * math.pi * period * x)
    update = gr.LinePlot.update(
        value=pd.DataFrame({"x": x, "y": y}),
        x="x",
        y="y",
        title="Plot (updates every second)",
        width=600,
        height=350,
    )
    plot_end += 2 * math.pi
    if plot_end > 1000:
        plot_end = 2 * math.pi
    return update


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            c_time2 = gr.Textbox(label="Current Time refreshed every second")
            gr.Textbox(
                "Change the value of the slider to automatically update the plot",
                label="",
            )
            period = gr.Slider(
                label="Period of plot", value=1, minimum=0, maximum=10, step=1
            )
            plot = gr.LinePlot(show_label=False)
        with gr.Column():
            name = gr.Textbox(label="Enter your name")
            greeting = gr.Textbox(label="Greeting")
            button = gr.Button(value="Greet")
            button.click(lambda s: f"Hello {s}", name, greeting)

    demo.load(lambda: datetime.datetime.now(), None, c_time2, every=1)
    dep = demo.load(get_plot, None, plot, every=1)
    period.change(get_plot, period, plot, every=1, cancels=[dep])

if __name__ == "__main__":
    demo.queue().launch()
