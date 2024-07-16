"""gr.BarPlot() component"""

from __future__ import annotations

from gradio_client.documentation import document

from gradio.components.native_plot import NativePlot


@document()
class BarPlot(NativePlot):
    """
    Creates a bar plot component to display data from a pandas DataFrame.

    Demos: live_dashboard
    """

    def get_block_name(self) -> str:
        return "nativeplot"

    def get_mark(self) -> str:
        return "bar"
