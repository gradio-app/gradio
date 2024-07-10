import gradio as gr
from vega_datasets import data

stocks = data.stocks()

with gr.Blocks() as demo:
    date_time_range = gr.DateTimeRange(include_time=False)
    merged = gr.LinePlot(
        stocks,
        x="year(date)",
        y="sum(price)",
    )
    split = gr.LinePlot(
        stocks,
        x="date",
        y="price",
        color="symbol",
        x_lim=(994481635 * 1000, 1057553635 * 1000),
    )
        
    date_time_range.bind([merged, split])

if __name__ == "__main__":
    demo.launch()
