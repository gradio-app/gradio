from __future__ import annotations

import json
import warnings
from typing import (
    TYPE_CHECKING,
    AbstractSet,
    Any,
    Callable,
    Dict,
    List,
    Literal,
    Sequence,
)

import pandas as pd
from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.data_classes import GradioModel
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer


class PlotData(GradioModel):
    columns: List[str]
    data: List[List[Any]]
    datatypes: Dict[str, Literal["quantitative", "nominal", "temporal"]]
    mark: str


class NativePlot(Component):
    """
    Creates a native Gradio plot component to display data from a pandas DataFrame. Supports interactivity and updates.

    Demos: native_plots
    """

    EVENTS = [Events.select, Events.double_click]

    def __init__(
        self,
        value: pd.DataFrame | Callable | None = None,
        x: str | None = None,
        y: str | None = None,
        *,
        color: str | None = None,
        title: str | None = None,
        x_title: str | None = None,
        y_title: str | None = None,
        color_title: str | None = None,
        x_bin: str | float | None = None,
        y_aggregate: Literal["sum", "mean", "median", "min", "max", "count"]
        | None = None,
        color_map: dict[str, str] | None = None,
        x_lim: list[float] | None = None,
        y_lim: list[float] | None = None,
        x_label_angle: float = 0,
        y_label_angle: float = 0,
        caption: str | None = None,
        sort: Literal["x", "y", "-x", "-y"] | list[str] | None = None,
        height: int | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | AbstractSet[Component] | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: The pandas dataframe containing the data to display in the plot.
            x: Column corresponding to the x axis. Column can be numeric, datetime, or string/category.
            y: Column corresponding to the y axis. Column must be numeric.
            color: Column corresponding to series, visualized by color. Column must be string/category.
            title: The title to display on top of the chart.
            x_title: The title given to the x axis. By default, uses the value of the x parameter.
            y_title: The title given to the y axis. By default, uses the value of the y parameter.
            color_title: The title given to the color legend. By default, uses the value of color parameter.
            x_bin: Grouping used to cluster x values. If x column is numeric, should be number to bin the x values. If x column is datetime, should be string such as "1h", "15m", "10s", using "s", "m", "h", "d" suffixes.
            y_aggregate: Aggregation function used to aggregate y values, used if x_bin is provided or x is a string/category. Must be one of "sum", "mean", "median", "min", "max".
            color_map: Mapping of series to color names or codes. For example, {"success": "green", "fail": "#FF8888"}.
            height: The height of the plot in pixels.
            x_lim: A tuple or list containing the limits for the x-axis, specified as [x_min, x_max]. If x column is datetime type, x_lim should be timestamps.
            y_lim: A tuple of list containing the limits for the y-axis, specified as [y_min, y_max].
            x_label_angle: The angle of the x-axis labels in degrees offset clockwise.
            y_label_angle: The angle of the y-axis labels in degrees offset clockwise.
            caption: The (optional) caption to display below the plot.
            sort: The sorting order of the x values, if x column is type string/category. Can be "x", "y", "-x", "-y", or list of strings that represent the order of the categories.
            height: The height of the plot in pixels.
            label: The (optional) label to display on the top left corner of the plot.
            show_label: Whether the label should be displayed.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            visible: Whether the plot should be visible.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
        """
        self.x = x
        self.y = y
        self.color = color
        self.title = title
        self.x_title = x_title
        self.y_title = y_title
        self.color_title = color_title
        self.x_bin = x_bin
        self.y_aggregate = y_aggregate
        self.color_map = color_map
        self.x_lim = x_lim
        self.y_lim = y_lim
        self.x_label_angle = x_label_angle
        self.y_label_angle = y_label_angle
        self.caption = caption
        self.sort = sort
        self.height = height

        if label is None and show_label is None:
            show_label = False
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
            key=key,
            every=every,
            inputs=inputs,
        )
        for key, val in kwargs.items():
            if key == "color_legend_title":
                self.color_title = val
            if key in [
                "stroke_dash",
                "overlay_point",
                "tooltip",
                "x_label_angle",
                "y_label_angle",
                "interactive",
                "show_actions_button",
                "color_legend_title",
                "width",
            ]:
                warnings.warn(
                    f"Argument '{key}' has been deprecated.", DeprecationWarning
                )

    def get_block_name(self) -> str:
        return "nativeplot"

    def get_mark(self) -> str:
        return "native"

    def preprocess(self, payload: PlotData | None) -> PlotData | None:
        """
        Parameters:
            payload: The data to display in a line plot.
        Returns:
            The data to display in a line plot.
        """
        return payload

    def postprocess(self, value: pd.DataFrame | dict | None) -> PlotData | None:
        """
        Parameters:
            value: Expects a pandas DataFrame containing the data to display in the line plot. The DataFrame should contain at least two columns, one for the x-axis (corresponding to this component's `x` argument) and one for the y-axis (corresponding to `y`).
        Returns:
            The data to display in a line plot, in the form of an AltairPlotData dataclass, which includes the plot information as a JSON string, as well as the type of plot (in this case, "line").
        """
        # if None or update
        if value is None or isinstance(value, dict):
            return value

        def get_simplified_type(dtype):
            if pd.api.types.is_numeric_dtype(dtype):
                return "quantitative"
            elif pd.api.types.is_string_dtype(
                dtype
            ) or pd.api.types.is_categorical_dtype(dtype):
                return "nominal"
            elif pd.api.types.is_datetime64_any_dtype(dtype):
                return "temporal"
            else:
                raise ValueError(f"Unsupported data type: {dtype}")

        split_json = json.loads(value.to_json(orient="split", date_unit="ms"))
        datatypes = {
            col: get_simplified_type(value[col].dtype) for col in value.columns
        }
        return PlotData(
            columns=split_json["columns"],
            data=split_json["data"],
            datatypes=datatypes,
            mark=self.get_mark(),
        )

    def example_payload(self) -> Any:
        return None

    def example_value(self) -> Any:
        import pandas as pd

        return pd.DataFrame({self.x: [1, 2, 3], self.y: [4, 5, 6]})

    def api_info(self) -> dict[str, Any]:
        return {"type": {}, "description": "any valid json"}


@document()
class BarPlot(NativePlot):
    """
    Creates a bar plot component to display data from a pandas DataFrame.

    Demos: native_plots
    """

    def get_block_name(self) -> str:
        return "nativeplot"

    def get_mark(self) -> str:
        return "bar"


@document()
class LinePlot(NativePlot):
    """
    Creates a line plot component to display data from a pandas DataFrame.

    Demos: native_plots
    """

    def get_block_name(self) -> str:
        return "nativeplot"

    def get_mark(self) -> str:
        return "line"


@document()
class ScatterPlot(NativePlot):
    """
    Creates a scatter plot component to display data from a pandas DataFrame.

    Demos: native_plots
    """

    def get_block_name(self) -> str:
        return "nativeplot"

    def get_mark(self) -> str:
        return "point"
