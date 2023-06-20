import gradio as gr
from vega_datasets import data

stocks = data.stocks()
gapminder = data.gapminder()
gapminder = gapminder.loc[
    gapminder.country.isin(["Argentina", "Australia", "Afghanistan"])
]
climate = data.climate()
seattle_weather = data.seattle_weather()

## Or generate your own fake data, here's an example for stocks:
#
# import pandas as pd
# import random
#
# stocks = pd.DataFrame(
#     {
#         "symbol": [
#             random.choice(
#                 [
#                     "MSFT",
#                     "AAPL",
#                     "AMZN",
#                     "IBM",
#                     "GOOG",
#                 ]
#             )
#             for _ in range(120)
#         ],
#         "date": [
#             pd.Timestamp(year=2000 + i, month=j, day=1)
#             for i in range(10)
#             for j in range(1, 13)
#         ],
#         "price": [random.randint(10, 200) for _ in range(120)],
#     }
# )


def line_plot_fn(dataset):
    if dataset == "stocks":
        return gr.LinePlot.update(
            stocks,
            x="date",
            y="price",
            color="symbol",
            color_legend_position="bottom",
            title="Stock Prices",
            tooltip=["date", "price", "symbol"],
            height=300,
            width=500,
        )
    elif dataset == "climate":
        return gr.LinePlot.update(
            climate,
            x="DATE",
            y="HLY-TEMP-NORMAL",
            y_lim=[250, 500],
            title="Climate",
            tooltip=["DATE", "HLY-TEMP-NORMAL"],
            height=300,
            width=500,
        )
    elif dataset == "seattle_weather":
        return gr.LinePlot.update(
            seattle_weather,
            x="date",
            y="temp_min",
            tooltip=["weather", "date"],
            overlay_point=True,
            title="Seattle Weather",
            height=300,
            width=500,
        )
    elif dataset == "gapminder":
        return gr.LinePlot.update(
            gapminder,
            x="year",
            y="life_expect",
            color="country",
            title="Life expectancy for countries",
            stroke_dash="cluster",
            x_lim=[1950, 2010],
            tooltip=["country", "life_expect"],
            stroke_dash_legend_title="Country Cluster",
            height=300,
            width=500,
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
