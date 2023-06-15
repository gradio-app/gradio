import gradio as gr
from vega_datasets import data

cars = data.cars()
iris = data.iris()

# # Or generate your own fake data

# import pandas as pd
# import random

# cars_data = {
#     "Name": ["car name " + f" {int(i/10)}" for i in range(400)],
#     "Miles_per_Gallon": [random.randint(10, 30) for _ in range(400)],
#     "Origin": [random.choice(["USA", "Europe", "Japan"]) for _ in range(400)],
#     "Horsepower": [random.randint(50, 250) for _ in range(400)],
# }

# iris_data = {
#     "petalWidth": [round(random.uniform(0, 2.5), 2) for _ in range(150)],
#     "petalLength": [round(random.uniform(0, 7), 2) for _ in range(150)],
#     "species": [
#         random.choice(["setosa", "versicolor", "virginica"]) for _ in range(150)
#     ],
# }

# cars = pd.DataFrame(cars_data)
# iris = pd.DataFrame(iris_data)


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
            plot = gr.ScatterPlot()
    dataset.change(scatter_plot_fn, inputs=dataset, outputs=plot)
    scatter_plot.load(fn=scatter_plot_fn, inputs=dataset, outputs=plot)

if __name__ == "__main__":
    scatter_plot.launch()
