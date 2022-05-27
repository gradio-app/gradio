from math import sqrt

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import plotly.express as px
import pandas as pd
import bokeh.plotting as bk
from bokeh.models import ColumnDataSource
from bokeh.embed import json_item

import gradio as gr


def outbreak(plot_type, r, month, countries, social_distancing):
    months = ["January", "February", "March", "April", "May"]
    m = months.index(month)
    start_day = 30 * m
    final_day = 30 * (m + 1)
    x = np.arange(start_day, final_day + 1)
    pop_count = {"USA": 350, "Canada": 40, "Mexico": 300, "UK": 120}
    if social_distancing:
        r = sqrt(r)
    df = pd.DataFrame({'day': x})
    for country in countries:
        df[country] = ( x ** (r) * (pop_count[country] + 1))
        

    if plot_type == "Matplotlib":
        fig = plt.figure()
        plt.plot(df['day'], df[countries].to_numpy())
        plt.title("Outbreak in " + month)
        plt.ylabel("Cases")
        plt.xlabel("Days since Day 0")
        plt.legend(countries)
        return fig
    elif plot_type == "Plotly":
        fig = px.line(df, x='day', y=countries)
        fig.update_layout(title="Outbreak in " + month,
                   xaxis_title="Cases",
                   yaxis_title="Days Since Day 0")
        return fig
    else:
        source = ColumnDataSource(df)
        p = bk.figure(title="Outbreak in " + month, x_axis_label="Cases", y_axis_label="Days Since Day 0")
        for country in countries:
            p.line(x='day', y=country, line_width=2, source=source)
        item_text = json_item(p, "plotDiv")
        return item_text

inputs = [
        gr.Dropdown(["Matplotlib", "Plotly", "Bokeh"], label="Plot Type"),
        gr.Slider(1, 4, 3.2, label="R"),
        gr.Dropdown(["January", "February", "March", "April", "May"], label="Month"),
        gr.CheckboxGroup(["USA", "Canada", "Mexico", "UK"], label="Countries", 
                         value=["USA", "Canada"]),
        gr.Checkbox(label="Social Distancing?"),
    ]
outputs = gr.Plot()

demo = gr.Interface(fn=outbreak, inputs=inputs, outputs=outputs)


if __name__ == "__main__":
    demo.launch()
