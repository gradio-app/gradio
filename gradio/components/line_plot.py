"""gr.LinePlot() component"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable, Literal

from gradio_client.documentation import document

from gradio.components.plot import AltairPlot, AltairPlotData, Plot

if TYPE_CHECKING:
    import pandas as pd


@document()
class LinePlot(Plot):
    """
    Creates a line plot component to display data from a pandas DataFrame (as output). As this component does
    not accept user input, it is rarely used as an input component.

    Demos: live_dashboard
    """

    data_model = AltairPlotData

    def __init__(
        self,
        value: pd.DataFrame | Callable | None = None,
        x: str | None = None,
        y: str | None = None,
        *,
        color: str | None = None,
        stroke_dash: str | None = None,
        overlay_point: bool | None = None,
        title: str | None = None,
        tooltip: list[str] | str | None = None,
        x_title: str | None = None,
        y_title: str | None = None,
        x_label_angle: float | None = None,
        y_label_angle: float | None = None,
        color_legend_title: str | None = None,
        stroke_dash_legend_title: str | None = None,
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
        stroke_dash_legend_position: Literal[
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
        height: int | str | None = None,
        width: int | str | None = None,
        x_lim: list[int] | None = None,
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
        show_actions_button: bool = False,
    ):
        """
        Parameters:
            value: The pandas dataframe containing the data to display in a scatter plot.
            x: Column corresponding to the x axis.
            y: Column corresponding to the y axis.
            color: The column to determine the point color. If the column contains numeric data, gradio will interpolate the column data so that small values correspond to light colors and large values correspond to dark values.
            stroke_dash: The column to determine the symbol used to draw the line, e.g. dashed lines, dashed lines with points.
            overlay_point: Whether to draw a point on the line for each (x, y) coordinate pair.
            title: The title to display on top of the chart.
            tooltip: The column (or list of columns) to display on the tooltip when a user hovers a point on the plot.
            x_title: The title given to the x axis. By default, uses the value of the x parameter.
            y_title: The title given to the y axis. By default, uses the value of the y parameter.
            x_label_angle: The angle for the x axis labels. Positive values are clockwise, and negative values are counter-clockwise.
            y_label_angle: The angle for the y axis labels. Positive values are clockwise, and negative values are counter-clockwise.
            color_legend_title: The title given to the color legend. By default, uses the value of color parameter.
            stroke_dash_legend_title: The title given to the stroke_dash legend. By default, uses the value of the stroke_dash parameter.
            color_legend_position: The position of the color legend. If the string value 'none' is passed, this legend is omitted. For other valid position values see: https://vega.github.io/vega/docs/legends/#orientation.
            stroke_dash_legend_position: The position of the stoke_dash legend. If the string value 'none' is passed, this legend is omitted. For other valid position values see: https://vega.github.io/vega/docs/legends/#orientation.
            height: The height of the plot, specified in pixels if a number is passed, or in CSS units if a string is passed.
            width: The width of the plot, specified in pixels if a number is passed, or in CSS units if a string is passed.
            x_lim: A tuple or list containing the limits for the x-axis, specified as [x_min, x_max].
            y_lim: A tuple of list containing the limits for the y-axis, specified as [y_min, y_max].
            caption: The (optional) caption to display below the plot.
            interactive: Whether users should be able to interact with the plot by panning or zooming with their mouse or trackpad.
            label: The (optional) label to display on the top left corner of the plot.
            show_label: Whether the label should be displayed.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            visible: Whether the plot should be visible.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            show_actions_button: Whether to show the actions button on the top right corner of the plot.
        """
        self.x = x
        self.y = y
        self.color = color
        self.stroke_dash = stroke_dash
        self.tooltip = tooltip
        self.title = title
        self.x_title = x_title
        self.y_title = y_title
        self.x_label_angle = x_label_angle
        self.y_label_angle = y_label_angle
        self.color_legend_title = color_legend_title
        self.stroke_dash_legend_title = stroke_dash_legend_title
        self.color_legend_position = color_legend_position
        self.stroke_dash_legend_position = stroke_dash_legend_position
        self.overlay_point = overlay_point
        self.x_lim = x_lim
        self.y_lim = y_lim
        self.caption = caption
        self.interactive_chart = interactive
        self.width = width
        self.height = height
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
        stroke_dash: str | None = None,
        overlay_point: bool | None = None,
        title: str | None = None,
        tooltip: list[str] | str | None = None,
        x_title: str | None = None,
        y_title: str | None = None,
        x_label_angle: float | None = None,
        y_label_angle: float | None = None,
        color_legend_title: str | None = None,
        stroke_dash_legend_title: str | None = None,
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
        stroke_dash_legend_position: Literal[
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
        x_lim: list[int] | None = None,
        y_lim: list[int] | None = None,
        interactive: bool | None = None,
    ):
        """Helper for creating the scatter plot."""
        import altair as alt

        interactive = True if interactive is None else interactive
        encodings = {
            "x": alt.X(
                x,  # type: ignore
                title=x_title or x,  # type: ignore
                scale=AltairPlot.create_scale(x_lim),  # type: ignore
                axis=alt.Axis(labelAngle=x_label_angle)
                if x_label_angle is not None
                else alt.Axis(),
            ),
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

        highlight = None
        if interactive and any([color, stroke_dash]):
            highlight = alt.selection(
                type="single",  # type: ignore
                on="mouseover",
                fields=[c for c in [color, stroke_dash] if c],
                nearest=True,
            )

        if stroke_dash:
            stroke_dash = {
                "field": stroke_dash,  # type: ignore
                "legend": AltairPlot.create_legend(  # type: ignore
                    position=stroke_dash_legend_position,  # type: ignore
                    title=stroke_dash_legend_title or stroke_dash,  # type: ignore
                ),  # type: ignore
            }  # type: ignore
        else:
            stroke_dash = alt.value(alt.Undefined)  # type: ignore

        if tooltip:
            encodings["tooltip"] = tooltip

        chart = alt.Chart(value).encode(**encodings)  # type: ignore

        points = chart.mark_point(clip=True).encode(
            opacity=alt.value(alt.Undefined) if overlay_point else alt.value(0),
        )
        lines = chart.mark_line(clip=True).encode(strokeDash=stroke_dash)

        if highlight:
            points = points.add_selection(highlight)

            lines = lines.encode(
                size=alt.condition(highlight, alt.value(4), alt.value(1)),
            )

        chart = (lines + points).properties(background="transparent", **properties)
        if interactive:
            chart = chart.interactive()

        return chart

    def preprocess(self, payload: AltairPlotData | None) -> AltairPlotData | None:
        """
        Parameters:
            payload: The data to display in a line plot.
        Returns:
            (Rarely used) passes the data displayed in the line plot as an AltairPlotData dataclass, which includes the plot information as a JSON string, as well as the type of plot (in this case, "line").
        """
        return payload

    def postprocess(
        self, value: pd.DataFrame | dict | None
    ) -> AltairPlotData | dict | None:
        """
        Parameters:
            value: Expects a pandas DataFrame containing the data to display in the line plot. The DataFrame should contain at least two columns, one for the x-axis (corresponding to this component's `x` argument) and one for the y-axis (corresponding to `y`).
        Returns:
            The data to display in a line plot, in the form of an AltairPlotData dataclass, which includes the plot information as a JSON string, as well as the type of plot (in this case, "line").
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
            overlay_point=self.overlay_point,
            title=self.title,
            tooltip=self.tooltip,
            x_title=self.x_title,
            y_title=self.y_title,
            x_label_angle=self.x_label_angle,
            y_label_angle=self.y_label_angle,
            color_legend_title=self.color_legend_title,  # type: ignore
            color_legend_position=self.color_legend_position,  # type: ignore
            stroke_dash_legend_title=self.stroke_dash_legend_title,
            stroke_dash_legend_position=self.stroke_dash_legend_position,  # type: ignore
            x_lim=self.x_lim,
            y_lim=self.y_lim,
            stroke_dash=self.stroke_dash,
            interactive=self.interactive_chart,
            height=self.height,
            width=self.width,
        )

        return AltairPlotData(type="altair", plot=chart.to_json(), chart="line")

    def example_payload(self) -> Any:
        return None

    def example_value(self) -> Any:
        import pandas as pd

        return pd.DataFrame({self.x: [1, 2, 3], self.y: [4, 5, 6]})
