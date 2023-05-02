import matplotlib.pyplot as plt
import numpy as np

import gradio as gr


def plot_forecast(final_year, companies, noise, show_legend, point_style):
    start_year = 2020
    x = np.arange(start_year, final_year + 1)
    year_count = x.shape[0]
    plt_format = ({"cross": "X", "line": "-", "circle": "o--"})[point_style]
    fig = plt.figure()
    ax = fig.add_subplot(111)
    for i, company in enumerate(companies):
        series = np.arange(0, year_count, dtype=float)
        series = series**2 * (i + 1)
        series += np.random.rand(year_count) * noise
        ax.plot(x, series, plt_format)
    if show_legend:
        plt.legend(companies)
    return fig


demo = gr.Interface(
    plot_forecast,
    [
        gr.Radio([2025, 2030, 2035, 2040], label="Project to:"),
        gr.CheckboxGroup(["Google", "Microsoft", "Gradio"], label="Company Selection"),
        gr.Slider(1, 100, label="Noise Level"),
        gr.Checkbox(label="Show Legend"),
        gr.Dropdown(["cross", "line", "circle"], label="Style"),
    ],
    gr.Plot(label="forecast"),
)

if __name__ == "__main__":
    demo.launch()
