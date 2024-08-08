import gradio as gr
from data import df

with gr.Blocks() as demo:
    plt1 = gr.LinePlot(df, x="weight", y="height")
    plt2 = gr.BarPlot(df, x="weight", y="age", x_bin=10)
    plots = [plt1, plt2]

    def select_region(selection: gr.SelectData):
        min_w, max_w = selection.index
        return [gr.LinePlot(x_lim=(min_w, max_w))] * len(plots) # type: ignore

    for plt in plots:
        plt.select(select_region, None, plots)
        plt.double_click(lambda: [gr.LinePlot(x_lim=None)] * len(plots), None, plots)

if __name__ == "__main__":
    demo.launch()