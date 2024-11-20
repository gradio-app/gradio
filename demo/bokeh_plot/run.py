# type: ignore
import gradio as gr
import xyzservices.providers as xyz
from bokeh.models import ColumnDataSource, Whisker
from bokeh.plotting import figure
from bokeh.sampledata.autompg2 import autompg2 as df
from bokeh.sampledata.penguins import data
from bokeh.transform import factor_cmap, jitter, factor_mark

def get_plot(plot_type):
    if plot_type == "map":
        plot = figure(
            x_range=(-2000000, 6000000),
            y_range=(-1000000, 7000000),
            x_axis_type="mercator",
            y_axis_type="mercator",
        )
        plot.add_tile(xyz.OpenStreetMap.Mapnik)  # type: ignore
        return plot
    elif plot_type == "whisker":
        classes = sorted(df["class"].unique())

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
        plot_type = gr.Radio(value="scatter", choices=["scatter", "whisker", "map"])
        plot = gr.Plot()
    plot_type.change(get_plot, inputs=[plot_type], outputs=[plot])
    demo.load(get_plot, inputs=[plot_type], outputs=[plot])

if __name__ == "__main__":
    demo.launch()
