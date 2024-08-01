import gradio as gr
from data import df

with gr.Blocks() as demo:
    with gr.Row():
        start = gr.DateTime("now - 24h")
        end = gr.DateTime("now")
        apply_btn = gr.Button("Apply")
    plot = gr.LinePlot(df, x="time", y="price")

    apply_btn.click(lambda start, end: gr.BarPlot(x_lim=[start, end]), [start, end], plot)
    
if __name__ == "__main__":
    demo.launch()