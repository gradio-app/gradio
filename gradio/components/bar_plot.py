"""gr.BarPlot() component."""

from __future__ import annotations

from typing import Callable, Literal

import altair as alt
import pandas as pd
from gradio_client.documentation import document, set_documentation_group

from gradio.blocks import Default, get
from gradio.components.plot import AltairPlot, Plot

set_documentation_group("component")


@document()
class BarPlot(Plot):
    """
    Create a bar plot.

    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a pandas dataframe with the data to plot.

    Demos: bar_plot, chicago-bikeshare-dashboard
    """

    def __init__(
        self,
        value: pd.DataFrame | Callable | None | Default = Default(None),
        x: str | None | Default = Default(None),
        y: str | None | Default = Default(None),
        *,
        color: str | None | Default = Default(None),
        vertical: bool | None | Default = Default(True),
        group: str | None | Default = Default(None),
        title: str | None | Default = Default(None),
        tooltip: list[str] | str | None | Default = Default(None),
        x_title: str | None | Default = Default(None),
        y_title: str | None | Default = Default(None),
        color_legend_title: str | None | Default = Default(None),
        group_title: str | None | Default = Default(None),
        color_legend_position: Literal[
            "left",
            "right",
            "top",
            "bottom",
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "none",
        ]
        | None = None,
        height: int | None | Default = Default(None),
        width: int | None | Default = Default(None),
        y_lim: list[int] | None | Default = Default(None),
        caption: str | None | Default = Default(None),
        interactive: bool | None | Default = Default(True),
        label: str | None | Default = Default(None),
        show_label: bool | None | Default = Default(None),
        container: bool | None | Default = Default(True),
        scale: int | None | Default = Default(None),
        min_width: int | None | Default = Default(160),
        every: float | None | Default = Default(None),
        visible: bool |  Default = Default(True),
        elem_id: str | None | Default = Default(None),
        elem_classes: list[str] | str | None | Default = Default(None),
    ):
        """
        Parameters:
            value: The pandas dataframe containing the data to display in a scatter plot.
            x: Column corresponding to the x axis.
            y: Column corresponding to the y axis.
            color: The column to determine the bar color. Must be categorical (discrete values).
            vertical: If True, the bars will be displayed vertically. If False, the x and y axis will be switched, displaying the bars horizontally. Default is True.
            group: The column with which to split the overall plot into smaller subplots.
            title: The title to display on top of the chart.
            tooltip: The column (or list of columns) to display on the tooltip when a user hovers over a bar.
            x_title: The title given to the x axis. By default, uses the value of the x parameter.
            y_title: The title given to the y axis. By default, uses the value of the y parameter.
            color_legend_title: The title given to the color legend. By default, uses the value of color parameter.
            group_title: The label displayed on top of the subplot columns (or rows if vertical=True). Use an empty string to omit.
            color_legend_position: The position of the color legend. If the string value 'none' is passed, this legend is omitted. For other valid position values see: https://vega.github.io/vega/docs/legends/#orientation.
            height: The height of the plot in pixels.
            width: The width of the plot in pixels.
            y_lim: A tuple of list containing the limits for the y-axis, specified as [y_min, y_max].
            caption: The (optional) caption to display below the plot.
            interactive: Whether users should be able to interact with the plot by panning or zooming with their mouse or trackpad.
            label: The (optional) label to display on the top left corner of the plot.
            show_label: Whether the label should be displayed.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            visible: Whether the plot should be visible.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.vertical = get(vertical)
        self.interactive = get(interactive)
        self.x = get(x)
        self.y = get(y)
        self.color = get(color)
        self.vertical = get(vertical)
        self.group = get(group)
        self.group_title = get(group_title)
        self.tooltip = get(tooltip)
        self.title = get(title)
        self.x_title = get(x_title)
        self.y_title = get(y_title)
        self.color_legend_title = get(color_legend_title)
        self.group_title = get(group_title)
        self.color_legend_position = get(color_legend_position)
        self.y_lim = get(y_lim)
        self.caption = get(caption)
        self.interactive_chart = get(interactive)
        self.width = get(width)
        self.height = get(height)
        super().__init__(
            value=value,
            label=label,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            every=every,
        )

    def get_block_name(self) -> str:
        return "plot"

    @staticmethod
    def create_plot(
        value: pd.DataFrame,
        x: str,
        y: str,
        color: str | None = None,
        vertical: bool = True,
        group: str | None = None,
        title: str | None = None,
        tooltip: list[str] | str | None = None,
        x_title: str | None = None,
        y_title: str | None = None,
        color_legend_title: str | None = None,
        group_title: str | None = None,
        color_legend_position: Literal[
            "left",
            "right",
            "top",
            "bottom",
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "none",
        ]
        | None = None,
        height: int | None = None,
        width: int | None = None,
        y_lim: list[int] | None = None,
        interactive: bool | None = True,
    ):
        """Helper for creating the bar plot."""
        interactive = True if interactive is None else interactive
        orientation = (
            {"field": group, "title": group_title if group_title is not None else group}
            if group
            else {}
        )

        x_title = x_title or x
        y_title = y_title or y

        # If horizontal, switch x and y
        if not vertical:
            y, x = x, y
            x = f"sum({x}):Q"
            y_title, x_title = x_title, y_title
            orientation = {"row": alt.Row(**orientation)} if orientation else {}  # type: ignore
            x_lim = y_lim
            y_lim = None
        else:
            y = f"sum({y}):Q"
            x_lim = None
            orientation = {"column": alt.Column(**orientation)} if orientation else {}  # type: ignore

        encodings = dict(
            x=alt.X(
                x,  # type: ignore
                title=x_title,  # type: ignore
                scale=AltairPlot.create_scale(x_lim),  # type: ignore
            ),
            y=alt.Y(
                y,  # type: ignore
                title=y_title,  # type: ignore
                scale=AltairPlot.create_scale(y_lim),  # type: ignore
            ),
            **orientation,
        )
        properties = {}
        if title:
            properties["title"] = title
        if height:
            properties["height"] = height
        if width:
            properties["width"] = width

        if color:
            domain = value[color].unique().tolist()
            range_ = list(range(len(domain)))
            encodings["color"] = {
                "field": color,
                "type": "nominal",
                "scale": {"domain": domain, "range": range_},
                "legend": AltairPlot.create_legend(
                    position=color_legend_position, title=color_legend_title or color
                ),
            }

        if tooltip:
            encodings["tooltip"] = tooltip

        chart = (
            alt.Chart(value)  # type: ignore
            .mark_bar()  # type: ignore
            .encode(**encodings)
            .properties(background="transparent", **properties)
        )
        if interactive:
            chart = chart.interactive()

        return chart

    def postprocess(self, y: pd.DataFrame | dict | None) -> dict[str, str] | None:
        # if None or update
        if y is None or isinstance(y, dict):
            return y
        if self.x is None or self.y is None:
            raise ValueError("No value provided for required parameters `x` and `y`.")
        chart = self.create_plot(
            value=y,
            x=self.x,
            y=self.y,
            color=self.color,
            vertical=self.vertical,
            group=self.group,
            title=self.title,
            tooltip=self.tooltip,
            x_title=self.x_title,
            y_title=self.y_title,
            color_legend_title=self.color_legend_title,
            color_legend_position=self.color_legend_position,  # type: ignore
            group_title=self.group_title,
            y_lim=self.y_lim,
            interactive=self.interactive_chart,
            height=self.height,
            width=self.width,
        )

        return {"type": "altair", "plot": chart.to_json(), "chart": "bar"}
