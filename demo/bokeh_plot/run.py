import gradio as gr
import xyzservices.providers as xyz
from bokeh.plotting import figure
from bokeh.tile_providers import get_provider
import numpy as np
from scipy.integrate import odeint
from bokeh.models import ColumnDataSource, Whisker
from bokeh.plotting import figure
from bokeh.sampledata.autompg2 import autompg2 as df
from bokeh.sampledata.penguins import data
from bokeh.transform import factor_cmap, jitter, factor_mark


def get_lorenz_curve():
    sigma = 10
    rho = 28
    beta = 8.0 / 3
    theta = 3 * np.pi / 4

    def lorenz(xyz, t):
        x, y, z = xyz
        x_dot = sigma * (y - x)
        y_dot = x * rho - x * z - y
        z_dot = x * y - beta * z
        return [x_dot, y_dot, z_dot]

    initial = (-10, -7, 35)
    t = np.arange(0, 100, 0.006)

    solution = odeint(lorenz, initial, t)

    x = solution[:, 0]
    y = solution[:, 1]
    z = solution[:, 2]
    xprime = np.cos(theta) * x - np.sin(theta) * y

    colors = [
        "#C6DBEF",
        "#9ECAE1",
        "#6BAED6",
        "#4292C6",
        "#2171B5",
        "#08519C",
        "#08306B",
    ]

    p = figure(title="Lorenz attractor example", background_fill_color="#fafafa")

    p.multi_line(
        np.array_split(xprime, 7),
        np.array_split(z, 7),
        line_color=colors,
        line_alpha=0.8,
        line_width=1.5,
    )
    return p


def get_plot(plot_type):
    if plot_type == "map":
        tile_provider = get_provider(xyz.OpenStreetMap.Mapnik)
        plot = figure(
            x_range=(-2000000, 6000000),
            y_range=(-1000000, 7000000),
            x_axis_type="mercator",
            y_axis_type="mercator",
        )
        plot.add_tile(tile_provider)
        return plot
    elif plot_type == "lorenz":
        return get_lorenz_curve()
    elif plot_type == "whisker":
        classes = list(sorted(df["class"].unique()))

        p = figure(
            height=400,
            x_range=classes,
            background_fill_color="#efefef",
            title="Car class vs HWY mpg with quintile ranges",
        )
        p.xgrid.grid_line_color = None

        g = df.groupby("class")
        upper = g.hwy.quantile(0.80)
        lower = g.hwy.quantile(0.20)
        source = ColumnDataSource(data=dict(base=classes, upper=upper, lower=lower))

        error = Whisker(
            base="base",
            upper="upper",
            lower="lower",
            source=source,
            level="annotation",
            line_width=2,
        )
        error.upper_head.size = 20
        error.lower_head.size = 20
        p.add_layout(error)

        p.circle(
            jitter("class", 0.3, range=p.x_range),
            "hwy",
            source=df,
            alpha=0.5,
            size=13,
            line_color="white",
            color=factor_cmap("class", "Light6", classes),
        )
        return p
    elif plot_type == "scatter":

        SPECIES = sorted(data.species.unique())
        MARKERS = ["hex", "circle_x", "triangle"]

        p = figure(title="Penguin size", background_fill_color="#fafafa")
        p.xaxis.axis_label = "Flipper Length (mm)"
        p.yaxis.axis_label = "Body Mass (g)"

        p.scatter(
            "flipper_length_mm",
            "body_mass_g",
            source=data,
            legend_group="species",
            fill_alpha=0.4,
            size=12,
            marker=factor_mark("species", MARKERS, SPECIES),
            color=factor_cmap("species", "Category10_3", SPECIES),
        )

        p.legend.location = "top_left"
        p.legend.title = "Species"
        return p

with gr.Blocks() as demo:
    with gr.Row():
        plot_type = gr.Radio(value="scatter", choices=["scatter", "lorenz", "whisker", "map"])
        plot = gr.Plot()
    plot_type.change(get_plot, inputs=[plot_type], outputs=[plot])


if __name__ == "__main__":
    demo.launch()