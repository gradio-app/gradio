import gradio as gr
from data import df

with gr.Blocks() as demo:
    gr.ScatterPlot(df, x="weight", y="height")

if __name__ == "__main__":
    demo.launch()