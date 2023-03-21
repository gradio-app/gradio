import gradio as gr
from vega_datasets import data

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

with gr.Blocks(css=css) as demo:
    gr.LinePlot(
        data.stocks(),
        x="date",
        y="price",
        color="symbol",
        color_legend_position="bottom",
        title="Stock Prices",
        tooltip=["date", "price", "symbol"],
        height=300,
        width=300,
        show_label=False,
    ).style(
        container=False,
    )

if __name__ == "__main__":
    demo.launch()
