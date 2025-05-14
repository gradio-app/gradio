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
    update = gr.LinePlot(
        value=pd.DataFrame({"x": x, "y": y}),
        x="x",
        y="y",
        title="Plot (updates every second)",
        width=600,
        height=350,
    )
    plot_end += 0.1
    return update

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            c_time2 = gr.Textbox(label="Current Time refreshed every second")
            period = gr.Slider(
                label="Period of plot", value=1, minimum=0, maximum=10
            )
            plot = gr.LinePlot(show_label=False)
        with gr.Column():
            start_time = gr.Textbox(label="Start Time")
            end_time = gr.Textbox(label="End Time")

    timer = gr.Timer(1)

    timer.tick(lambda: datetime.datetime.now(), None, c_time2)
    timer.tick(get_plot, period, plot)

    def select(selection_range: gr.SelectData):
        return gr.LinePlot(x_lim=selection_range.index), selection_range.index[0], selection_range.index[1]
    plot.select(select, None, [plot, start_time, end_time])
    plot.double_click(lambda: gr.LinePlot(x_lim=None), None, plot)

if __name__ == "__main__":
    demo.launch()
