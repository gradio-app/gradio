import gradio as gr
import numpy as np
import pandas as pd

with gr.Blocks() as demo:
    gr.Markdown("# Draggable Dashboard Demo")
    gr.Markdown("Drag the charts around to reorder them!")
    
    x = np.linspace(0, 10, 100)
    data = pd.DataFrame({
        'x': x,
        'y1': np.random.normal(100, 20, 100) + 10 * np.sin(x),
        'y2': np.random.normal(500, 100, 100) + 50 * np.cos(x),
        'y3': np.random.normal(1000, 200, 100) + 100 * np.sin(x/2),
        'y4': np.random.normal(0.15, 0.05, 100) + 0.05 * np.cos(x/3)
    })
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### Horizontal Layout (orientation='row')")
            with gr.Draggable(orientation="row"):
                gr.LinePlot(
                    data,
                    x="x",
                    y="y1",
                    title="Chart 1",
                    height=200,
                )
                gr.LinePlot(
                    data,
                    x="x",
                    y="y2",
                    title="Chart 2",
                    height=200,
                )
                gr.LinePlot(
                    data,
                    x="x",
                    y="y3",
                    title="Chart 3",
                    height=200,
                )
                gr.LinePlot(
                    data,
                    x="x",
                    y="y4",
                    title="Chart 4",
                    height=200,
                )
        
        with gr.Column(scale=1):
            gr.Markdown("### Vertical Layout (orientation='column')")
            with gr.Draggable(orientation="column"):
                gr.LinePlot(
                    data,
                    x="x",
                    y="y1",
                    title="Chart 1",
                    height=200,
                )
                gr.LinePlot(
                    data,
                    x="x",
                    y="y2",
                    title="Chart 2",
                    height=200,
                )
                gr.LinePlot(
                    data,
                    x="x",
                    y="y3",
                    title="Chart 3",
                    height=200,
                )
                gr.LinePlot(
                    data,
                    x="x",
                    y="y4",
                    title="Chart 4",
                    height=200,
                )

if __name__ == "__main__":
    demo.launch()