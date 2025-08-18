import gradio as gr

from scatter_plot_demo import scatter_plots  # type: ignore
from line_plot_demo import line_plots  # type: ignore
from bar_plot_demo import bar_plots  # type: ignore

with gr.Blocks() as demo:
    with gr.Tabs():
        with gr.TabItem("Line Plot"):
            line_plots.render()
        with gr.TabItem("Scatter Plot"):
            scatter_plots.render()
        with gr.TabItem("Bar Plot"):
            bar_plots.render()

if __name__ == "__main__":
    demo.launch()
