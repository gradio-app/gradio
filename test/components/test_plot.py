import pytest

import gradio as gr
from gradio import utils


class TestPlot:
    @pytest.mark.asyncio
    async def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def plot(num):
            import matplotlib.pyplot as plt

            fig = plt.figure()
            plt.plot(range(num), range(num))
            return fig

        iface = gr.Interface(plot, "slider", "plot")
        with utils.MatplotlibBackendMananger():
            output = await iface.process_api(block_fn=0, inputs=[10])
        assert output["data"][0]["type"] == "matplotlib"
        assert output["data"][0]["plot"].startswith("data:image/webp;base64")

    def test_static(self):
        """
        postprocess
        """
        with utils.MatplotlibBackendMananger():
            import matplotlib.pyplot as plt

            fig = plt.figure()
            plt.plot([1, 2, 3], [1, 2, 3])

        component = gr.Plot(fig)
        assert component.get_config().get("value") is not None
        component = gr.Plot(None)
        assert component.get_config().get("value") is None

    def test_postprocess_altair(self):
        import altair as alt
        from vega_datasets import data

        cars = data.cars()
        chart = (
            alt.Chart(cars)
            .mark_point()
            .encode(
                x="Horsepower",
                y="Miles_per_Gallon",
                color="Origin",
            )
        )
        assert (out := gr.Plot().postprocess(chart))
        out = out.model_dump()
        assert isinstance(out["plot"], str)
        assert out["plot"] == chart.to_json()

    def test_plot_format_parameter(self):
        """
        postprocess
        """
        with utils.MatplotlibBackendMananger():
            import matplotlib.pyplot as plt

            fig = plt.figure()
            plt.plot([1, 2, 3], [1, 2, 3])

        component = gr.Plot(format="jpeg")
        assert (result := component.postprocess(fig))
        assert result.plot.startswith("data:image/jpeg")
