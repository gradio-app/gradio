"""gr.ScatterPlot() component."""

from __future__ import annotations

import warnings
from typing import TYPE_CHECKING, Any, Callable, Literal, Sequence

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.components.plot import AltairPlot, AltairPlotData, Plot

if TYPE_CHECKING:
    import pandas as pd

    from gradio.components import Timer


@document()
class ScatterPlot(Plot):
    """
    Creates a scatter plot component to display data from a pandas DataFrame (as output). As this component does
    not accept user input, it is rarely used as an input component.

    Guides: creating-a-dashboard-from-bigquery-data
    """

    data_model = AltairPlotData

    def __init__(
        self,
        value: pd.DataFrame | Callable | None = None,
        x: str | None = None,
        y: str | None = None,
        *,
        color: str | None = None,
        size: str | None = None,
        shape: str | None = None,
        title: str | None = None,
        tooltip: list[str] | str | None = None,
        x_title: str | None = None,
        y_title: str | None = None,
        x_label_angle: float | None = None,
        y_label_angle: float | None = None,
        color_legend_title: str | None = None,
        size_legend_title: str | None = None,
        shape_legend_title: str | None = None,
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
        size_legend_position: Literal[
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
        shape_legend_position: Literal[
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
        x_lim: list[int | float] | None = None,
        y_lim: list[int | float] | None = None,
        caption: str | None = None,
        interactive: bool | None = True,
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
        show_actions_button: bool = False,
    ):
        """
        Parameters:
            value: The pandas dataframe containing the data to display in a scatter plot, or a callable. If callable, the function will be called whenever the app loads to set the initial value of the component.
            x: Column corresponding to the x axis.
            y: Column corresponding to the y axis.
            color: The column to determine the point color. If the column contains numeric data, gradio will interpolate the column data so that small values correspond to light colors and large values correspond to dark values.
            size: The column used to determine the point size. Should contain numeric data so that gradio can map the data to the point size.
            shape: The column used to determine the point shape. Should contain categorical data. Gradio will map each unique value to a different shape.
            title: The title to display on top of the chart.
            tooltip: The column (or list of columns) to display on the tooltip when a user hovers a point on the plot.
            x_title: The title given to the x-axis. By default, uses the value of the x parameter.
            y_title: The title given to the y-axis. By default, uses the value of the y parameter.
            x_label_angle:  The angle for the x axis labels rotation. Positive values are clockwise, and negative values are counter-clockwise.
            y_label_angle:  The angle for the y axis labels rotation. Positive values are clockwise, and negative values are counter-clockwise.
            color_legend_title: The title given to the color legend. By default, uses the value of color parameter.
            size_legend_title: The title given to the size legend. By default, uses the value of the size parameter.
            shape_legend_title: The title given to the shape legend. By default, uses the value of the shape parameter.
            color_legend_position: The position of the color legend. If the string value 'none' is passed, this legend is omitted. For other valid position values see: https://vega.github.io/vega/docs/legends/#orientation.
            size_legend_position: The position of the size legend. If the string value 'none' is passed, this legend is omitted. For other valid position values see: https://vega.github.io/vega/docs/legends/#orientation.
            shape_legend_position: The position of the shape legend. If the string value 'none' is passed, this legend is omitted. For other valid position values see: https://vega.github.io/vega/docs/legends/#orientation.
            height: The height of the plot in pixels.
            width: The width of the plot in pixels. If None, expands to fit.
            x_lim: A tuple or list containing the limits for the x-axis, specified as [x_min, x_max].
            y_lim: A tuple of list containing the limits for the y-axis, specified as [y_min, y_max].
            caption: The (optional) caption to display below the plot.
            interactive: Whether users should be able to interact with the plot by panning or zooming with their mouse or trackpad.
            label: The (optional) label to display on the top left corner of the plot.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: Whether the label should be displayed.
            visible: Whether the plot should be visible.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            show_actions_button: Whether to show the actions button on the top right corner of the plot.
        """
        self.x = x
        self.y = y
        self.color = color
        self.size = size
        self.shape = shape
        self.tooltip = tooltip
        self.title = title
        self.x_title = x_title
        self.y_title = y_title
        self.x_label_angle = x_label_angle
        self.y_label_angle = y_label_angle
        self.color_legend_title = color_legend_title
        self.color_legend_position = color_legend_position
        self.size_legend_title = size_legend_title
        self.size_legend_position = size_legend_position
        self.shape_legend_title = shape_legend_title
        self.shape_legend_position = shape_legend_position
        self.caption = caption
        self.interactive_chart = interactive
        if isinstance(width, str):
            width = None
            warnings.warn(
                "Width should be an integer, not a string. Setting width to None."
            )
        if isinstance(height, str):
            warnings.warn(
                "Height should be an integer, not a string. Setting height to None."
            )
            height = None
        self.width = width
        self.height = height
        self.x_lim = x_lim
        self.y_lim = y_lim
        self.show_actions_button = show_actions_button
        if label is None and show_label is None:
            show_label = False
        super().__init__(
            value=value,
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
        )

    def get_block_name(self) -> str:
        return "plot"

    @staticmethod
    def create_plot(
        value: pd.DataFrame,
        x: str,
        y: str,
        color: str | None = None,
        size: str | None = None,
        shape: str | None = None,
        title: str | None = None,
        tooltip: list[str] | str | None = None,
        x_title: str | None = None,
        y_title: str | None = None,
        x_label_angle: float | None = None,
        y_label_angle: float | None = None,
        color_legend_title: str | None = None,
        size_legend_title: str | None = None,
        shape_legend_title: str | None = None,
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
        size_legend_position: Literal[
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
        shape_legend_position: Literal[
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
        x_lim: list[int | float] | None = None,
        y_lim: list[int | float] | None = None,
        interactive: bool | None = True,
    ):
        """Helper for creating the scatter plot."""
        import altair as alt
        from pandas.api.types import is_numeric_dtype

        interactive = True if interactive is None else interactive
        encodings = {
            "x": alt.X(
                x,  # type: ignore
                title=x_title or x,  # type: ignore
                scale=AltairPlot.create_scale(x_lim),  # type: ignore
                axis=alt.Axis(labelAngle=x_label_angle)
                if x_label_angle is not None
                else alt.Axis(),
            ),  # ignore: type
            "y": alt.Y(
                y,  # type: ignore
                title=y_title or y,  # type: ignore
                scale=AltairPlot.create_scale(y_lim),  # type: ignore
                axis=alt.Axis(labelAngle=y_label_angle)
                if y_label_angle is not None
                else alt.Axis(),
            ),
        }
        properties = {}
        if title:
            properties["title"] = title
        if height:
            properties["height"] = height
        if width:
            properties["width"] = width
        if color:
            if is_numeric_dtype(value[color]):
                domain = [value[color].min(), value[color].max()]
                range_ = [0, 1]
                type_ = "quantitative"
            else:
                domain = value[color].unique().tolist()
                range_ = list(range(len(domain)))
                type_ = "nominal"

            color_legend_position = color_legend_position or "bottom"
            encodings["color"] = {
                "field": color,
                "type": type_,
                "legend": AltairPlot.create_legend(
                    position=color_legend_position, title=color_legend_title
                ),
                "scale": {"domain": domain, "range": range_},
            }
        if tooltip:
            encodings["tooltip"] = tooltip
        if size:
            encodings["size"] = {
                "field": size,
                "type": "quantitative" if is_numeric_dtype(value[size]) else "nominal",
                "legend": AltairPlot.create_legend(
                    position=size_legend_position, title=size_legend_title
                ),
            }
        if shape:
            encodings["shape"] = {
                "field": shape,
                "type": "quantitative" if is_numeric_dtype(value[shape]) else "nominal",
                "legend": AltairPlot.create_legend(
                    position=shape_legend_position, title=shape_legend_title
                ),
            }
        chart = (
            alt.Chart(value)  # type: ignore
            .mark_point(clip=True)  # type: ignore
            .encode(**encodings)
            .properties(background="transparent", **properties)
        )
        if interactive:
            chart = chart.interactive()

        return chart

    def preprocess(self, payload: AltairPlotData | None) -> AltairPlotData | None:
        """
        Parameters:
            payload: The data to display in a scatter plot.
        Returns:
            (Rarely used) passes the data displayed in the scatter plot as an AltairPlotData dataclass, which includes the plot information as a JSON string, as well as the type of plot (in this case, "scatter").
        """
        return payload

    def postprocess(
        self, value: pd.DataFrame | dict | None
    ) -> AltairPlotData | dict | None:
        """
        Parameters:
            value: Expects a pandas DataFrame containing the data to display in the scatter plot. The DataFrame should contain at least two columns, one for the x-axis (corresponding to this component's `x` argument) and one for the y-axis (corresponding to `y`).
        Returns:
            The data to display in a scatter plot, in the form of an AltairPlotData dataclass, which includes the plot information as a JSON string, as well as the type of plot (in this case, "scatter").
        """
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
            size=self.size,
            shape=self.shape,
            title=self.title,
            tooltip=self.tooltip,
            x_title=self.x_title,
            y_title=self.y_title,
            x_label_angle=self.x_label_angle,
            y_label_angle=self.y_label_angle,
            color_legend_title=self.color_legend_title,
            size_legend_title=self.size_legend_title,
            shape_legend_title=self.size_legend_title,
            color_legend_position=self.color_legend_position,  # type: ignore
            size_legend_position=self.size_legend_position,  # type: ignore
            shape_legend_position=self.shape_legend_position,  # type: ignore
            interactive=self.interactive_chart,
            height=self.height,
            width=self.width,
            x_lim=self.x_lim,
            y_lim=self.y_lim,
        )

        return AltairPlotData(type="altair", plot=chart.to_json(), chart="scatter")

    def example_payload(self) -> Any:
        return None

    def example_value(self) -> Any:
        import pandas as pd

        return pd.DataFrame({self.x: [1, 2, 3], self.y: [4, 5, 6]})
