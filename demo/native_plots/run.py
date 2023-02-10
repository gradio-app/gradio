import gradio as gr

from scatter_plot_demo import scatter_plot
from line_plot_demo import line_plot
from bar_plot_demo import bar_plot


with gr.Blocks() as demo:
    with gr.Tabs():
        with gr.TabItem("Scatter Plot"):
            scatter_plot.render()
        with gr.TabItem("Line Plot"):
            line_plot.render()
        with gr.TabItem("Bar Plot"):
            bar_plot.render()

if __name__ == "__main__":
    demo.launch()
