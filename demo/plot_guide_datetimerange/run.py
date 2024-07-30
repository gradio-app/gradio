import gradio as gr
from gradio_datetimerange import DateTimeRange
from data import df

with gr.Blocks() as demo:
    daterange = DateTimeRange(["now - 24h", "now"])
    plot1 = gr.LinePlot(df, x="time", y="price")
    plot2 = gr.LinePlot(df, x="time", y="price", color="origin")
    daterange.bind([plot1, plot2])

if __name__ == "__main__":
    demo.launch()