import gradio as gr
import pandas as pd

simple = pd.DataFrame(
    {
        "item": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
        "inventory": [28, 55, 43, 91, 81, 53, 19, 87, 52],
    }
)

with gr.Blocks() as demo:
    gr.BarPlot(
        value=simple,
        x="item",
        y="inventory",
        title="Simple Bar Plot",
        container=False,
    )

if __name__ == "__main__":
    demo.launch()
