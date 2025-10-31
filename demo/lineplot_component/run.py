import gradio as gr
from vega_datasets import data

with gr.Blocks() as demo:
    gr.LinePlot(
        data.stocks(),
        x="date",
        y="price",
        color="symbol",
        title="Stock Prices",
        tooltip=["date", "price", "symbol"],
        height=300,
        container=False,
    )

if __name__ == "__main__":
    demo.launch()
