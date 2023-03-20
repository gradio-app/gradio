import gradio as gr
import pandas as pd

simple = pd.DataFrame(
    {
        "item": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
        "inventory": [28, 55, 43, 91, 81, 53, 19, 87, 52],
    }
)

css = (
    "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"
)

with gr.Blocks(css=css) as demo:
    gr.BarPlot(value=simple, x="item", y="inventory", title="Simple Bar Plot").style(
        container=False,
    )

if __name__ == "__main__":
    demo.launch()
