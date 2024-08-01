import gradio as gr
from data import df

with gr.Blocks() as demo:
    gr.BarPlot(df, x="ethnicity", y="height", y_aggregate="mean")

if __name__ == "__main__":
    demo.launch()