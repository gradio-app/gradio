import gradio as gr
from data import df

with gr.Blocks() as demo:
    plot = gr.BarPlot(df, x="time", y="price", x_bin="10m")

    bins = gr.Radio(["10m", "30m", "1h"], label="Bin Size")
    bins.change(lambda bins: gr.BarPlot(x_bin=bins), bins, plot)

if __name__ == "__main__":
    demo.launch()