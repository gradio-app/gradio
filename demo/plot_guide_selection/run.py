import gradio as gr
from data import df

with gr.Blocks() as demo:
    plt = gr.LinePlot(df, x="weight", y="height")
    selection_total = gr.Number(label="Total Weight of Selection")

    def select_region(selection: gr.SelectData):
        min_w, max_w = selection.index
        return df[(df["weight"] >= min_w) & (df["weight"] <= max_w)]["weight"].sum()

    plt.select(select_region, None, selection_total)

if __name__ == "__main__":
    demo.launch()