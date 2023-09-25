import gradio as gr
import pandas as pd

from vega_datasets import data

barley = data.barley()
simple = pd.DataFrame({
    'a': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    'b': [28, 55, 43, 91, 81, 53, 19, 87, 52]
})

def bar_plot_fn(display):
    if display == "simple":
        return gr.BarPlot(
            simple,
            x="a",
            y="b",
            color=None,
            group=None,
            title="Simple Bar Plot with made up data",
            tooltip=['a', 'b'],
            y_lim=[20, 100],
            x_title=None,
            y_title=None,
            vertical=True,
        )
    elif display == "stacked":
        return gr.BarPlot(
            barley,
            x="variety",
            y="yield",
            color="site",
            group=None,
            title="Barley Yield Data",
            tooltip=['variety', 'site'],
            y_lim=None,
            x_title=None,
            y_title=None,
            vertical=True,
        )
    elif display == "grouped":
        return gr.BarPlot(
            barley.astype({"year": str}),
            x="year",
            y="yield",
            color="year",
            group="site",
            title="Barley Yield by Year and Site",
            tooltip=["yield", "site", "year"],
            y_lim=None,
            x_title=None,
            y_title=None,
            vertical=True,
        )
    elif display == "simple-horizontal":
        return gr.BarPlot(
            simple,
            x="a",
            y="b",
            color=None,
            group=None,
            title="Simple Bar Plot with made up data",
            tooltip=['a', 'b'],
            y_lim=[20, 100],
            x_title="Variable A",
            y_title="Variable B",
            vertical=False,
        )
    elif display == "stacked-horizontal":
        return gr.BarPlot(
            barley,
            x="variety",
            y="yield",
            color="site",
            group=None,
            title="Barley Yield Data",
            tooltip=['variety', 'site'],
            y_lim=None,
            x_title=None,
            y_title=None,
            vertical=False,
        )
    elif display == "grouped-horizontal":
        return gr.BarPlot(
            barley.astype({"year": str}),
            x="year",
            y="yield",
            color="year",
            group="site",
            title="Barley Yield by Year and Site",
            group_title="",
            tooltip=["yield", "site", "year"],
            y_lim=None,
            x_title=None,
            y_title=None,
            vertical=False
        )


with gr.Blocks() as bar_plot:
    with gr.Row():
        with gr.Column():
            display = gr.Dropdown(
                choices=["simple", "stacked", "grouped", "simple-horizontal", "stacked-horizontal", "grouped-horizontal"],
                value="simple",
                label="Type of Bar Plot"
            )
        with gr.Column():
            plot = gr.BarPlot(show_label=False, show_actions_button=True)
    display.change(bar_plot_fn, inputs=display, outputs=plot)
    bar_plot.load(fn=bar_plot_fn, inputs=display, outputs=plot)
