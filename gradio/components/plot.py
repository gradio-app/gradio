"""gr.Plot() component."""

from __future__ import annotations

import json
from collections.abc import Sequence
from types import ModuleType
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio import processing_utils, wasm_utils
from gradio.components.base import Component
from gradio.data_classes import GradioModel
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer


class PlotData(GradioModel):
    type: Literal["altair", "bokeh", "plotly", "matplotlib"]
    plot: str


class AltairPlotData(PlotData):
    chart: Literal["bar", "line", "scatter"]
    type: Literal["altair"] = "altair"  # type: ignore


@document()
class Plot(Component):
    """
    Creates a plot component to display various kinds of plots (matplotlib, plotly, altair, or bokeh plots are supported). As this component does
    not accept user input, it is rarely used as an input component.

    Demos: blocks_kinematics, stock_forecast
    Guides: plot-component-for-maps
    """

    data_model = PlotData
    EVENTS = [Events.change]

    def __init__(
        self,
        value: Any | None = None,
        *,
        format: str = "png"
        if wasm_utils.IS_WASM
        else "webp",  # webp is a good default for speed (see #7845) but can't be used in Wasm because the the version of matplotlib used in Wasm (3.5.2 in the case of Pyodide 0.26.1) doesn't support it.
        label: str | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
    ):
        """
        Parameters:
            value: Optionally, supply a default plot object to display, must be a matplotlib, plotly, altair, or bokeh figure, or a callable. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            format: File format in which to send matplotlib plots to the front end, such as 'jpg' or 'png'.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
        """
        self.format = format
        super().__init__(
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            value=value,
        )

    def get_config(self):
        try:
            import bokeh  # type: ignore

            bokeh_version = bokeh.__version__
        except ImportError:
            bokeh_version = None

        config = super().get_config()
        config["bokeh_version"] = bokeh_version
        return config

    def preprocess(self, payload: PlotData | None) -> PlotData | None:
        """
        Parameters:
            payload: The data to display in the plot.
        Returns:
            (Rarely used) passes the data displayed in the plot as an PlotData dataclass, which includes the plot information as a JSON string, as well as the type of chart and the plotting library.
        """
        return payload

    def example_payload(self) -> Any:
        return None

    def example_value(self) -> Any:
        return None

    def postprocess(self, value: Any) -> PlotData | None:
        """
        Parameters:
            value: Expects plot data in one of these formats: a matplotlib.Figure, bokeh.Model, plotly.Figure, or altair.Chart object.
        Returns:
            PlotData: A dataclass containing the plot data as a JSON string, as well as the type of chart and the plotting library.
        """
        if value is None:
            return None
        if isinstance(value, PlotData):
            return value
        if isinstance(value, ModuleType) or "matplotlib" in value.__module__:
            dtype = "matplotlib"
            out_y = processing_utils.encode_plot_to_base64(value, self.format)
        elif "bokeh" in value.__module__:
            dtype = "bokeh"
            from bokeh.embed import json_item

            out_y = json.dumps(json_item(value))
        else:
            is_altair = "altair" in value.__module__
            dtype = "altair" if is_altair else "plotly"
            out_y = value.to_json()
        return PlotData(type=dtype, plot=out_y)


class AltairPlot:
    @staticmethod
    def create_legend(position, title):
        if position == "none":
            legend = None
        else:
            position = {"orient": position} if position else {}
            legend = {"title": title, **position}

        return legend

    @staticmethod
    def create_scale(limit):
        import altair as alt

        return alt.Scale(domain=limit) if limit else alt.Undefined
