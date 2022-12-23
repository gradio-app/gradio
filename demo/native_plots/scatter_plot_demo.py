import gradio as gr

from vega_datasets import data

cars = data.cars()
iris = data.iris()


def scatter_plot_fn(dataset):
    if dataset == "iris":
        return gr.ScatterPlot.update(
            value=iris,
            x="petalWidth",
            y="petalLength",
            color="species",
            title="Iris Dataset",
            color_legend_title="Species",
            x_title="Petal Width",
            y_title="Petal Length",
            tooltip=["petalWidth", "petalLength", "species"],
            caption="",
        )
    else:
        return gr.ScatterPlot.update(
            value=cars,
            x="Horsepower",
            y="Miles_per_Gallon",
            color="Origin",
            tooltip="Name",
            title="Car Data",
            y_title="Miles per Gallon",
            color_legend_title="Origin of Car",
            caption="MPG vs Horsepower of various cars",
        )


with gr.Blocks() as scatter_plot:
    with gr.Row():
        with gr.Column():
            dataset = gr.Dropdown(choices=["cars", "iris"], value="cars")
        with gr.Column():
            plot = gr.ScatterPlot(show_label=False).style(container=True)
    dataset.change(scatter_plot_fn, inputs=dataset, outputs=plot)
    scatter_plot.load(fn=scatter_plot_fn, inputs=dataset, outputs=plot)

if __name__ == "__main__":
    scatter_plot.launch()
