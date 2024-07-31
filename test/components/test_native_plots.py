import gradio as gr

from .plot_data import barley, simple


class TestNativePlot:
    def test_plot_recognizes_correct_datatypes(self):
        plot = gr.BarPlot(
            value=simple,
            x="date",
            y="b",
        )
        assert plot.value["datatypes"]["date"] == "temporal"
        assert plot.value["datatypes"]["b"] == "quantitative"

        plot = gr.BarPlot(
            value=simple,
            x="a",
            y="b",
            color="c",
        )
        assert plot.value["datatypes"]["a"] == "nominal"
        assert plot.value["datatypes"]["b"] == "quantitative"
        assert plot.value["datatypes"]["c"] == "quantitative"

    def test_plot_accepts_fn_as_value(self):
        plot = gr.BarPlot(
            value=lambda: barley.sample(frac=0.1, replace=False),
            x="year",
            y="yield",
        )
        assert plot.value["mark"] == "bar"
