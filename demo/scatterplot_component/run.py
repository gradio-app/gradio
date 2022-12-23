import gradio as gr
from vega_datasets import data

cars = data.cars()

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

with gr.Blocks(css=css) as demo:
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