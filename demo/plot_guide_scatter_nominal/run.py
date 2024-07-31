import gradio as gr
from data import df

with gr.Blocks() as demo:
    gr.ScatterPlot(df, x="ethnicity", y="height")

if __name__ == "__main__":
    demo.launch()