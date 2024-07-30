import gradio as gr
from data import df

with gr.Blocks() as demo:
    gr.BarPlot(df, x="weight", y="height", x_bin=10, y_aggregate="sum")

if __name__ == "__main__":
    demo.launch()