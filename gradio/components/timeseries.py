"""gr.Timeseries() component."""

from __future__ import annotations

from pathlib import Path
from typing import Callable

import pandas as pd
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import JSONSerializable

from gradio.blocks import Default, get
from gradio.components.base import IOComponent
from gradio.events import Changeable

set_documentation_group("component")


@document()
class Timeseries(Changeable, IOComponent, JSONSerializable):
    """
    Creates a component that can be used to upload/preview timeseries csv files or display a dataframe consisting of a time series graphically.
    Preprocessing: passes the uploaded timeseries data as a {pandas.DataFrame} into the function
    Postprocessing: expects a {pandas.DataFrame} or {str} path to a csv to be returned, which is then displayed as a timeseries graph
    Examples-format: a {str} filepath of csv data with time series data.
    Demos: fraud_detector
    """

    def __init__(
        self,
        value: str | Callable | None | Default = Default(None),
        *,
        x: str | None | Default = Default(None),
        y: str | list[str] | None | Default = Default(None),
        colors: list[str] | None | Default = Default(None),
        label: str | None | Default = Default(None),
        every: float | None | Default = Default(None),
        show_label: bool | None | Default = Default(None),
        container: bool | None | Default = Default(True),
        scale: int | None | Default = Default(None),
        min_width: int | None | Default = Default(160),
        interactive: bool | None | Default = Default(None),
        visible: bool | Default = Default(True),
        elem_id: str | None | Default = Default(None),
        elem_classes: list[str] | str | None | Default = Default(None),
        **kwargs,
    ):
        """
        Parameters:
            value: File path for the timeseries csv file. If callable, the function will be called whenever the app loads to set the initial value of the component.
            x: Column name of x (time) series. None if csv has no headers, in which case first column is x series.
            y: Column name of y series, or list of column names if multiple series. None if csv has no headers, in which case every column after first is a y series.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            colors: an ordered list of colors to use for each line plot
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to upload a timeseries csv; if False, can only be used to display timeseries data. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.x = get(x)
        self.y = get(y)
        if isinstance(self.y, str):
            self.y = [self.y]
        self.colors = get(colors)
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )

    def preprocess(self, x: dict | None) -> pd.DataFrame | None:
        """
        Parameters:
            x: Dict with keys 'data': 2D array of str, numeric, or bool data, 'headers': list of strings for header names, 'range': optional two element list designating start of end of subrange.
        Returns:
            Dataframe of timeseries data
        """
        if x is None:
            return x
        elif x.get("is_file"):
            dataframe = pd.read_csv(x["name"])
        else:
            dataframe = pd.DataFrame(data=x["data"], columns=x["headers"])
        if x.get("range") is not None:
            dataframe = dataframe.loc[dataframe[self.x or 0] >= x["range"][0]]
            dataframe = dataframe.loc[dataframe[self.x or 0] <= x["range"][1]]
        return dataframe

    def postprocess(self, y: str | pd.DataFrame | None) -> dict | None:
        """
        Parameters:
            y: csv or dataframe with timeseries data
        Returns:
            JSON object with key 'headers' for list of header names, 'data' for 2D array of string or numeric data
        """
        if y is None:
            return None
        if isinstance(y, str):
            dataframe = pd.read_csv(y)
            return {
                "headers": dataframe.columns.values.tolist(),
                "data": dataframe.values.tolist(),
            }
        if isinstance(y, pd.DataFrame):
            return {"headers": y.columns.values.tolist(), "data": y.values.tolist()}
        raise ValueError("Cannot process value as Timeseries data")

    def as_example(self, input_data: str | None) -> str:
        return Path(input_data).name if input_data else ""
