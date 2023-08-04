"""gr.Plot() component."""

from __future__ import annotations

import json
from types import ModuleType
from typing import Any, Callable, Literal

import altair as alt
import pandas as pd
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import JSONSerializable

from gradio import processing_utils
from gradio.components.base import IOComponent, _Keywords
from gradio.deprecation import warn_style_method_deprecation
from gradio.events import Changeable, Clearable

set_documentation_group("component")


@document()
class Plot(Changeable, Clearable, IOComponent, JSONSerializable):
    """
    Used to display various kinds of plots (matplotlib, plotly, or bokeh are supported)
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects either a {matplotlib.figure.Figure}, a {plotly.graph_objects._figure.Figure}, or a {dict} corresponding to a bokeh plot (json_item format)

    Demos: altair_plot, outbreak_forecast, blocks_kinematics, stock_forecast, map_airbnb
    Guides: plot-component-for-maps
    """

    def __init__(
        self,
        value: Callable | None | pd.DataFrame = None,
        *,
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Optionally, supply a default plot object to display, must be a matplotlib, plotly, altair, or bokeh figure, or a callable. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )

    def get_config(self):
        try:
            import bokeh  # type: ignore

            bokeh_version = bokeh.__version__
        except ImportError:
            bokeh_version = None
        return {
            "value": self.value,
            "bokeh_version": bokeh_version,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Any | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        visible: bool | None = None,
    ):
        updated_config = {
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def postprocess(self, y) -> dict[str, str] | None:
        """
        Parameters:
            y: plot data
        Returns:
            plot type mapped to plot base64 data
        """
        import matplotlib.figure

        if y is None:
            return None
        if isinstance(y, (ModuleType, matplotlib.figure.Figure)):  # type: ignore
            dtype = "matplotlib"
            out_y = processing_utils.encode_plot_to_base64(y)
        elif "bokeh" in y.__module__:
            dtype = "bokeh"
            from bokeh.embed import json_item  # type: ignore

            out_y = json.dumps(json_item(y))
        else:
            is_altair = "altair" in y.__module__
            dtype = "altair" if is_altair else "plotly"
            out_y = y.to_json()
        return {"type": dtype, "plot": out_y}

    def style(self, container: bool | None = None):
        """
        This method is deprecated. Please set these arguments in the constructor instead.
        """
        warn_style_method_deprecation()
        if container is not None:
            self.container = container
        return self


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
        return alt.Scale(domain=limit) if limit else alt.Undefined
