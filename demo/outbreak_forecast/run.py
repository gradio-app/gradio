import gradio as gr
from math import sqrt
import numpy as np
import pandas as pd

def outbreak(plot_type, r, month, countries, social_distancing):
    months = ["January", "February", "March", "April", "May"]
    m = months.index(month)
    start_day = 30 * m
    final_day = 30 * (m + 1)
    x = np.arange(start_day, final_day + 1)
    pop_count = {"USA": 350, "Canada": 40, "Mexico": 300, "UK": 120}
    if social_distancing:
        r = sqrt(r)
    df = pd.DataFrame({"day": x})
    for country in countries:
        df[country] = x ** (r) * (pop_count[country] + 1)

    if plot_type == "Matplotlib":
        import matplotlib.pyplot as plt

        fig = plt.figure()
        plt.plot(df["day"], df[countries].to_numpy())
        plt.title("Outbreak in " + month)
        plt.ylabel("Cases")
        plt.xlabel("Days since Day 0")
        plt.legend(countries)
        return fig
    elif plot_type == "Plotly":
        import plotly.express as px

        fig = px.line(df, x="day", y=countries)
        fig.update_layout(
            title="Outbreak in " + month,
            xaxis_title="Cases",
            yaxis_title="Days Since Day 0",
        )
        return fig
    elif plot_type == "Altair":
        import altair

        df = df.melt(id_vars="day").rename(columns={"variable": "country"})
        fig = altair.Chart(df).mark_line().encode(x="day", y="value", color="country")
        return fig
    elif plot_type == "Bokeh":
        from bokeh.plotting import figure
        from bokeh.models import ColumnDataSource

        source = ColumnDataSource(df)
        fig = figure(title="Outbreak in " + month, x_axis_label="Days since Day 0", y_axis_label="Cases")
        for country in countries:
            fig.line("day", country, source=source, legend_label=country)
        return fig
    else:
        raise ValueError("A plot type must be selected")

inputs = [
    gr.Dropdown(["Matplotlib", "Plotly", "Altair", "Bokeh"], label="Plot Type", value="Matplotlib"),
    gr.Slider(1, 4, 3.2, label="R"),
    gr.Dropdown(["January", "February", "March", "April", "May"], label="Month", value="March"),
    gr.CheckboxGroup(
        ["USA", "Canada", "Mexico", "UK"], label="Countries", value=["USA", "Canada"]
    ),
    gr.Checkbox(label="Social Distancing?"),
]
outputs = gr.Plot()

demo = gr.Interface(
    fn=outbreak,
    inputs=inputs,
    outputs=outputs,
    examples=[
        ["Matplotlib", 2, "March", ["Mexico", "UK"], True],
        ["Altair", 2, "March", ["Mexico", "Canada"], True],
        ["Plotly", 3.6, "February", ["Canada", "Mexico", "UK"], False],
        ["Bokeh", 3.2, "April", ["Canada", "UK"], False],
    ],
    cache_examples=True,
    preload_example=False,
)

if __name__ == "__main__":
    demo.launch()
