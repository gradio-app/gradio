import gradio as gr

from vega_datasets import data

cars = data.cars()
iris = data.iris()


def scatter_plot_fn(dataset):
    if dataset == "iris":
        return gr.ScatterPlot(
            value=iris,
            x="petalWidth",
            y="petalLength",
            color=None,
            title="Iris Dataset",
            x_title="Petal Width",
            y_title="Petal Length",
            tooltip=["petalWidth", "petalLength", "species"],
            caption="",
            height=600,
            width=600,
        )
    else:
        return gr.ScatterPlot(
            value=cars,
            x="Horsepower",
            y="Miles_per_Gallon",
            color="Origin",
            tooltip="Name",
            title="Car Data",
            y_title="Miles per Gallon",
            caption="MPG vs Horsepower of various cars",
            height=None,
            width=None,
        )


with gr.Blocks() as scatter_plot:
    dataset = gr.Dropdown(choices=["cars", "iris"], value="cars")
    plot = gr.ScatterPlot(show_label=False)
    dataset.change(scatter_plot_fn, inputs=dataset, outputs=plot)
    scatter_plot.load(fn=scatter_plot_fn, inputs=dataset, outputs=plot)

if __name__ == "__main__":
    scatter_plot.launch()
