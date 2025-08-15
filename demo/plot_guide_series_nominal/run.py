import gradio as gr
from data import df  # type: ignore

with gr.Blocks() as demo:
    gr.ScatterPlot(df, x="weight", y="height", color="ethnicity")

if __name__ == "__main__":
    demo.launch()