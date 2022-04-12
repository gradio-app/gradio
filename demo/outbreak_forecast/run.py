from math import sqrt

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import plotly.express as px
import bokeh.plotting as bk
from bokeh.embed import json_item
import pandas as pd

import gradio as gr


def outbreak(plot_type, r, month, countries, social_distancing):
    # if plot_type == "Matplotlib":
    #     months = ["January", "February", "March", "April", "May"]
    #     m = months.index(month)
    #     start_day = 30 * m
    #     final_day = 30 * (m + 1)
    #     x = np.arange(start_day, final_day + 1)
    #     day_count = x.shape[0]
    #     pop_count = {"USA": 350, "Canada": 40, "Mexico": 300, "UK": 120}
    #     r = sqrt(r)
    #     if social_distancing:
    #         r = sqrt(r)
    #     for i, country in enumerate(countries):
    #         series = x ** (r) * (i + 1)
    #         plt.plot(x, series)
    #     plt.title("Outbreak in " + month)
    #     plt.ylabel("Cases")
    #     plt.xlabel("Days since Day 0")
    #     plt.legend(countries)
    #     return plt
    # elif plot_type == "Plotly":
    #     months = ["January", "February", "March", "April", "May"]
    #     m = months.index(month)
    #     start_day = 30 * m
    #     final_day = 30 * (m + 1)
    #     x = np.arange(start_day, final_day + 1)
    #     day_count = x.shape[0]
    #     pop_count = {"USA": 350, "Canada": 40, "Mexico": 300, "UK": 120}
    #     r = sqrt(r)
    #     x_values = []
    #     y_values = []
    #     if social_distancing:
    #         r = sqrt(r)
    #     for i, country in enumerate(countries):
    #         series = x ** (r) * (i + 1)
    #         x_values.append(x)
    #         y_values.append(series)
    #     df = pd.DataFrame(dict(
    #         x = x_values,
    #         y = y_values
    #     ))
    #     fig = px.line(df)
    #     return fig
    # else:
        # prepare some data
        x = [1, 2, 3, 4, 5]
        y = [6, 7, 2, 4, 5]

        # create a new plot with a title and axis labels
        p = bk.figure(title="Simple line example", x_axis_label="x", y_axis_label="y")

        # add a line renderer with legend and line thickness
        p.line(x, y, legend_label="Temp.", line_width=2)

        # show the results
        item_text = json_item(p, "plotDiv")
        return item_text



iface = gr.Interface(
    outbreak,
    [
        gr.inputs.Dropdown(
            ["Plotly", "Matplotlib"], label="Plot Type"
        ),
        gr.inputs.Slider(1, 4, default=3.2, label="R"),
        gr.inputs.Dropdown(
            ["January", "February", "March", "April", "May"], label="Month"
        ),
        gr.inputs.CheckboxGroup(["USA", "Canada", "Mexico", "UK"], label="Countries"),
        gr.inputs.Checkbox(label="Social Distancing?"),
    ],
    gr.outputs.Plot(type="bokeh"),
)

if __name__ == "__main__":
    iface.launch()
