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
).values.tolist()

styling = [[
    "background: linear-gradient(to right, lightgreen 50%, transparent 50%);", "background: linear-gradient(to right, lightgreen 20%, transparent 20%);", "", "", ""
    "", "", "", "", ""
    "", "", "", "", ""
    "", "", "", "", ""
    "", "", "", "", ""
]]


with gr.Blocks() as demo:
    gr.Dataframe({"data": df, "metadata": {"styling": styling}})

if __name__ == "__main__":
    demo.launch()
