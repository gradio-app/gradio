import gradio as gr
from vega_datasets import data

stocks = data.stocks()
gapminder = data.gapminder()
gapminder = gapminder.loc[
    gapminder.country.isin(["Argentina", "Australia", "Afghanistan"])
]
climate = data.climate()
seattle_weather = data.seattle_weather()


def line_plot_fn(dataset):
    if dataset == "stocks":
        return gr.LinePlot(
            stocks,
            x="date",
            y="price",
            color="symbol",
            x_lim=None,
            y_lim=None,
            stroke_dash=None,
            tooltip=['date', 'price', 'symbol'],
            overlay_point=False,
            title="Stock Prices",
            stroke_dash_legend_title=None,
            height=300,
            width=500
        )
    elif dataset == "climate":
        return gr.LinePlot(
            climate,
            x="DATE",
            y="HLY-TEMP-NORMAL",
            color=None,
            x_lim=None,
            y_lim=[250, 500],
            stroke_dash=None,
            tooltip=['DATE', 'HLY-TEMP-NORMAL'],
            overlay_point=False,
            title="Climate",
            stroke_dash_legend_title=None,
            height=300,
            width=500
        )
    elif dataset == "seattle_weather":
        return gr.LinePlot(
            seattle_weather,
            x="date",
            y="temp_min",
            color=None,
            x_lim=None,
            y_lim=None,
            stroke_dash=None,
            tooltip=["weather", "date"],
            overlay_point=True,
            title="Seattle Weather",
            stroke_dash_legend_title=None,
            height=300,
            width=500
        )
    elif dataset == "gapminder":
        return gr.LinePlot(
            gapminder,
            x="year",
            y="life_expect",
            color="country",
            x_lim=[1950, 2010],
            y_lim=None,
            stroke_dash="cluster",
            tooltip=['country', 'life_expect'],
            overlay_point=False,
            title="Life expectancy for countries",
            stroke_dash_legend_title="Country Cluster",
            height=300,
            width=500
        )


with gr.Blocks() as line_plot:
    with gr.Row():
        with gr.Column():
            dataset = gr.Dropdown(
                choices=["stocks", "climate", "seattle_weather", "gapminder"],
                value="stocks",
            )
        with gr.Column():
            plot = gr.LinePlot()
    dataset.change(line_plot_fn, inputs=dataset, outputs=plot)
    line_plot.load(fn=line_plot_fn, inputs=dataset, outputs=plot)


if __name__ == "__main__":
    line_plot.launch()
