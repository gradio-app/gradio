"""gr.BarPlot() component."""

from __future__ import annotations

from typing import Any, Callable, Literal

import altair as alt
import pandas as pd
from gradio_client.documentation import document, set_documentation_group

from gradio.components.plot import AltairPlot, AltairPlotData, Plot

set_documentation_group("component")


@document()
class BarPlot(Plot):
    """
    Create a bar plot.

    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a pandas dataframe with the data to plot.

    Demos: bar_plot, chicago-bikeshare-dashboard
    """

    data_model = AltairPlotData

    def __init__(
        self,
        value: pd.DataFrame | Callable | None = None,
        x: str | None = None,
        y: str | None = None,
        *,
        color: str | None = None,
        vertical: bool = True,
        group: str | None = None,
        title: str | None = None,
        tooltip: list[str] | str | None = None,
        x_title: str | None = None,
        y_title: str | None = None,
        x_label_angle: float | None = None,
        y_label_angle: float | None = None,
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
        caption: str | None = None,
        interactive: bool | None = True,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        every: float | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        sort: Literal["x", "y", "-x", "-y"] | None = None,
        show_actions_button: bool = False,
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
            x_label_angle: The angle (in degrees) of the x axis labels. Positive values are clockwise, and negative values are counter-clockwise.
            y_label_angle: The angle (in degrees) of the y axis labels. Positive values are clockwise, and negative values are counter-clockwise.
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
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            sort: Specifies the sorting axis as either "x", "y", "-x" or "-y". If None, no sorting is applied.
            show_actions_button: Whether to show the actions button on the top right corner of the plot.
        """
        self.x = x
        self.y = y
        self.color = color
        self.vertical = vertical
        self.group = group
        self.group_title = group_title
        self.tooltip = tooltip
        self.title = title
        self.x_title = x_title
        self.y_title = y_title
        self.x_label_angle = x_label_angle
        self.y_label_angle = y_label_angle
        self.color_legend_title = color_legend_title
        self.group_title = group_title
        self.color_legend_position = color_legend_position
        self.y_lim = y_lim
        self.caption = caption
        self.interactive_chart = interactive
        self.width = width
        self.height = height
        self.sort = sort
        self.show_actions_button = show_actions_button
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
            render=render,
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
        x_label_angle: float | None = None,
        y_label_angle: float | None = None,
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
        sort: Literal["x", "y", "-x", "-y"] | None = None,
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
                axis=alt.Axis(labelAngle=x_label_angle)
                if x_label_angle is not None
                else alt.Axis(),
                sort=sort if vertical and sort is not None else None,
            ),
            y=alt.Y(
                y,  # type: ignore
                title=y_title,  # type: ignore
                scale=AltairPlot.create_scale(y_lim),  # type: ignore
                axis=alt.Axis(labelAngle=y_label_angle)
                if y_label_angle is not None
                else alt.Axis(),
                sort=sort if not vertical and sort is not None else None,
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

    def postprocess(
        self, value: pd.DataFrame | dict | None
    ) -> AltairPlotData | dict | None:
        # if None or update
        if value is None or isinstance(value, dict):
            return value
        if self.x is None or self.y is None:
            raise ValueError("No value provided for required parameters `x` and `y`.")
        chart = self.create_plot(
            value=value,
            x=self.x,
            y=self.y,
            color=self.color,
            vertical=self.vertical,
            group=self.group,
            title=self.title,
            tooltip=self.tooltip,
            x_title=self.x_title,
            y_title=self.y_title,
            x_label_angle=self.x_label_angle,
            y_label_angle=self.y_label_angle,
            color_legend_title=self.color_legend_title,
            color_legend_position=self.color_legend_position,  # type: ignore
            group_title=self.group_title,
            y_lim=self.y_lim,
            interactive=self.interactive_chart,
            height=self.height,
            width=self.width,
            sort=self.sort,  # type: ignore
        )

        return AltairPlotData(type="altair", plot=chart.to_json(), chart="bar")

    def example_inputs(self) -> dict[str, Any]:
        return {}

    def preprocess(self, payload: AltairPlotData) -> AltairPlotData:
        return payload
