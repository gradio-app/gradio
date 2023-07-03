import gradio as gr
import pandas as pd
import random

simple = pd.DataFrame(
    {
        "a": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
        "b": [28, 55, 43, 91, 81, 53, 19, 87, 52],
    }
)

fake_barley = pd.DataFrame(
    {
        "site": [
            random.choice(
                [
                    "University Farm",
                    "Waseca",
                    "Morris",
                    "Crookston",
                    "Grand Rapids",
                    "Duluth",
                ]
            )
            for _ in range(120)
        ],
        "yield": [random.randint(25, 75) for _ in range(120)],
        "variety": [
            random.choice(
                [
                    "Manchuria",
                    "Wisconsin No. 38",
                    "Glabron",
                    "No. 457",
                    "No. 462",
                    "No. 475",
                ]
            )
            for _ in range(120)
        ],
        "year": [
            random.choice(
                [
                    "1931",
                    "1932",
                ]
            )
            for _ in range(120)
        ],
    }
)


def bar_plot_fn(display):
    if display == "simple":
        return gr.BarPlot.update(
            simple,
            x="a",
            y="b",
            title="Simple Bar Plot with made up data",
            tooltip=["a", "b"],
            y_lim=[20, 100],
        )
    elif display == "stacked":
        return gr.BarPlot.update(
            fake_barley,
            x="variety",
            y="yield",
            color="site",
            title="Barley Yield Data",
            tooltip=["variety", "site"],
        )
    elif display == "grouped":
        return gr.BarPlot.update(
            fake_barley.astype({"year": str}),
            x="year",
            y="yield",
            color="year",
            group="site",
            title="Barley Yield by Year and Site",
            group_title="",
            tooltip=["yield", "site", "year"],
        )
    elif display == "simple-horizontal":
        return gr.BarPlot.update(
            simple,
            x="a",
            y="b",
            x_title="Variable A",
            y_title="Variable B",
            title="Simple Bar Plot with made up data",
            tooltip=["a", "b"],
            vertical=False,
            y_lim=[20, 100],
        )
    elif display == "stacked-horizontal":
        return gr.BarPlot.update(
            fake_barley,
            x="variety",
            y="yield",
            color="site",
            title="Barley Yield Data",
            vertical=False,
            tooltip=["variety", "site"],
        )
    elif display == "grouped-horizontal":
        return gr.BarPlot.update(
            fake_barley.astype({"year": str}),
            x="year",
            y="yield",
            color="year",
            group="site",
            title="Barley Yield by Year and Site",
            group_title="",
            tooltip=["yield", "site", "year"],
            vertical=False,
        )


with gr.Blocks() as bar_plot:
    with gr.Row():
        with gr.Column():
            display = gr.Dropdown(
                choices=[
                    "simple",
                    "stacked",
                    "grouped",
                    "simple-horizontal",
                    "stacked-horizontal",
                    "grouped-horizontal",
                ],
                value="simple",
                label="Type of Bar Plot",
            )
        with gr.Column():
            plot = gr.BarPlot()
    display.change(bar_plot_fn, inputs=display, outputs=plot)
    bar_plot.load(fn=bar_plot_fn, inputs=display, outputs=plot)

bar_plot.launch()
