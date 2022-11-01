import math
import gradio as gr
import datetime
import plotly.express as px
import numpy as np
import time


def get_time():
    return datetime.datetime.now()


def get_plot(period=1):
    plot_end = time.mktime(datetime.datetime.now().timetuple())
    x = np.arange(plot_end - 2 * math.pi, plot_end, 0.02)
    dates = [datetime.datetime.fromtimestamp(ut) for ut in x]
    y = np.sin(2 * math.pi * period * x)
    fig = px.line(x=dates, y=y)
    plot_end += 2 * math.pi
    return fig


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
            plot = gr.Plot(label="Plot (updates every half second)")
        with gr.Column():
            name = gr.Textbox(label="Enter your name")
            greeting = gr.Textbox(label="Greeting")
            button = gr.Button(value="Greet")
            button.click(lambda s: f"Hello {s}", name, greeting)

    demo.load(lambda: datetime.datetime.now(), None, c_time2, every=1)
    dep = demo.load(get_plot, None, plot, every=0.5)
    period.change(get_plot, period, plot, every=0.5, cancels=[dep])

if __name__ == "__main__":
    demo.queue().launch()
