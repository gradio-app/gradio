from math import sqrt
from statistics import mode

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import plotly.graph_objects as go
import bokeh.plotting as bk
from bokeh.embed import json_item
import pandas as pd

import gradio as gr


def outbreak(plot_type, r, month, countries, social_distancing):
    x_values = []
    months = ["January", "February", "March", "April", "May"]
    m = months.index(month)
    start_day = 30 * m
    final_day = 30 * (m + 1)
    x = np.arange(start_day, final_day + 1)
    day_count = x.shape[0]
    pop_count = {"USA": 350, "Canada": 40, "Mexico": 300, "UK": 120}
    r = sqrt(r)
    if social_distancing:
        r = sqrt(r)
    for i, country in enumerate(countries):
        x_values.append(x)
        series = x ** (r) * (i + 1)

    if plot_type == "Matplotlib":
        plt.plot(x, series)
        plt.title("Outbreak in " + month)
        plt.ylabel("Cases")
        plt.xlabel("Days since Day 0")
        plt.legend(countries)
        return plt
    elif plot_type == "Plotly":
        fig = go.Figure(data=go.Line(x=x_values, y=series, line=dict(color='firebrick', width=4)))
        fig.update_layout(title="Outbreak in " + month,
                   xaxis_title="Cases",
                   yaxis_title="Days Since Day 0")
        return fig
    else:
        p = bk.figure(title="Outbreak in " + month, x_axis_label="Cases", y_axis_label="Days Since Day 0")
        p.line(x, series, legend_label="Temp.", color="blue", line_width=2)
        item_text = json_item(p, "plotDiv")
        return item_text



iface = gr.Interface(
    outbreak,
    [
        gr.inputs.Dropdown(
            ["Matplotlib", "Bokeh", "Plotly"], label="Plot Type"
        ),
        gr.inputs.Slider(1, 4, default=3.2, label="R"),
        gr.inputs.Dropdown(
            ["January", "February", "March", "April", "May"], label="Month"
        ),
        gr.inputs.CheckboxGroup(["USA", "Canada", "Mexico", "UK"], label="Countries"),
        gr.inputs.Checkbox(label="Social Distancing?"),
    ],
    gr.outputs.Plot(type="auto"),
)

if __name__ == "__main__":
    iface.launch()
