import gradio as gr
from data import df

with gr.Blocks() as demo:
    plt = gr.LinePlot(df, x="weight", y="height")

    def select_region(selection: gr.SelectData):
        min_w, max_w = selection.index
        return gr.LinePlot(x_lim=(min_w, max_w)) # type: ignore

    plt.select(select_region, None, plt)
    plt.double_click(lambda: gr.LinePlot(x_lim=None), None, plt)

if __name__ == "__main__":
    demo.launch()