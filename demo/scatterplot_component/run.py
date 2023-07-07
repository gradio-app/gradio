import gradio as gr
from vega_datasets import data

cars = data.cars()

with gr.Blocks() as demo:
    gr.ScatterPlot(show_label=False,
                   value=cars,
                   x="Horsepower",
                   y="Miles_per_Gallon",
                   color="Origin",
                   tooltip="Name",
                   title="Car Data",
                   y_title="Miles per Gallon",
                   color_legend_title="Origin of Car").style(container=False)

if __name__ == "__main__":
    demo.launch()