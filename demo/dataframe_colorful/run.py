import pandas as pd
import gradio as gr

df = pd.DataFrame(
    {
        "A": [14, 4, 5, 4, 1],
        "B": [5, 2, 54, 3, 2],
        "C": [20, 20, 7, 3, 8],
        "D": [14, 3, 6, 2, 6],
        "E": [23, 45, 64, 32, 23],
    }
)

t = df.style.highlight_max(color="lightgreen", axis=0)

with gr.Blocks() as demo:
    gr.Dataframe(t)

if __name__ == "__main__":
    demo.launch()
