from math import sqrt

import matplotlib.pyplot as plt
import numpy as np

import gradio as gr


def outbreak(r, month, countries, social_distancing):
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
        series = x ** (r) * (i + 1)
        plt.plot(x, series)
    plt.title("Outbreak in " + month)
    plt.ylabel("Cases")
    plt.xlabel("Days since Day 0")
    plt.legend(countries)
    return plt


demo = gr.Interface(
    outbreak,
    [
        gr.Slider(minimum=1, maximum=4, default_value=3.2, label="R"),
        gr.Dropdown(["January", "February", "March", "April", "May"], label="Month"),
        gr.CheckboxGroup(["USA", "Canada", "Mexico", "UK"], label="Countries"),
        gr.Checkbox(label="Social Distancing?"),
    ],
    "plot",
)
if __name__ == "__main__":
    demo.launch()
