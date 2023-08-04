"""gr.Dataframe() component"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable, Literal

import numpy as np
import pandas as pd
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import JSONSerializable

from gradio import utils
from gradio.blocks import Default, get, NoOverride
from gradio.components.base import IOComponent
from gradio.events import (
    Changeable,
    EventListenerMethod,
    Inputable,
    Selectable,
)

if TYPE_CHECKING:
    from typing import TypedDict

    class DataframeData(TypedDict):
        headers: list[str]
        data: list[list[str | int | bool]]


set_documentation_group("component")


@document()
class Dataframe(Changeable, Inputable, Selectable, IOComponent, JSONSerializable):
    """
    Accepts or displays 2D input through a spreadsheet-like component for dataframes.
    Preprocessing: passes the uploaded spreadsheet data as a {pandas.DataFrame}, {numpy.array}, {List[List]}, or {List} depending on `type`
    Postprocessing: expects a {pandas.DataFrame}, {numpy.array}, {List[List]}, {List}, a {Dict} with keys `data` (and optionally `headers`), or {str} path to a csv, which is rendered in the spreadsheet.
    Examples-format: a {str} filepath to a csv with data, a pandas dataframe, or a list of lists (excluding headers) where each sublist is a row of data.
    Demos: filter_records, matrix_transpose, tax_calculator
    """

    markdown_parser = None

    def __init__(
        self,
        value: list[list[Any]] | Callable | None | Default = Default(None),
        *,
        headers: list[str] | None | Default = Default(None),
        row_count: int | tuple[int, str] | None | Default = Default((1, "dynamic")),
        col_count: int | tuple[int, str] | None | Default = Default(None),
        datatype: str | list[str] | None | Default = Default("str"),
        type: Literal["pandas", "numpy", "array"] | None | Default = Default("pandas"),
        max_rows: int | None | Default = Default(20),
        max_cols: int | None | Default = Default(None),
        overflow_row_behaviour: Literal["paginate", "show_ends"]
        | None
        | Default = Default("paginate"),
        label: str | None | Default = Default(None),
        every: float | None | Default = Default(None),
        show_label: bool | None | Default = Default(None),
        scale: int | None | Default = Default(None),
        min_width: int | None | Default = Default(160),
        interactive: bool | None | Default = Default(None),
        visible: bool |  Default = Default(True),
        elem_id: str | None | Default = Default(None),
        elem_classes: list[str] | str | None | Default = Default(None),
        wrap: bool | None | Default = Default(False),
        **kwargs,
    ):
        """
        Parameters:
            value: Default value as a 2-dimensional list of values. If callable, the function will be called whenever the app loads to set the initial value of the component.
            headers: List of str header names. If None, no headers are shown.
            row_count: Limit number of rows for input and decide whether user can create new rows. The first element of the tuple is an `int`, the row count; the second should be 'fixed' or 'dynamic', the new row behaviour. If an `int` is passed the rows default to 'dynamic'
            col_count: Limit number of columns for input and decide whether user can create new columns. The first element of the tuple is an `int`, the number of columns; the second should be 'fixed' or 'dynamic', the new column behaviour. If an `int` is passed the columns default to 'dynamic'
            datatype: Datatype of values in sheet. Can be provided per column as a list of strings, or for the entire sheet as a single string. Valid datatypes are "str", "number", "bool", "date", and "markdown".
            type: Type of value to be returned by component. "pandas" for pandas dataframe, "numpy" for numpy array, or "array" for a Python array.
            label: component name in interface.
            max_rows: Maximum number of rows to display at once. Set to None for infinite.
            max_cols: Maximum number of columns to display at once. Set to None for infinite.
            overflow_row_behaviour: If set to "paginate", will create pages for overflow rows. If set to "show_ends", will show initial and final rows and truncate middle rows.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to edit the dataframe; if False, can only be used to display data. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            wrap: if True text in table cells will wrap when appropriate, if False the table will scroll horizontally. Defaults to False.
        """
        self.row_count = get(row_count)
        if self.row_count != NoOverride:
            self.row_count = self.__process_counts(self.row_count)
        self.datatype = get(datatype)
        self.type = get(type)
        valid_types = ["pandas", "numpy", "array"]
        if self.type not in valid_types + [NoOverride]:
            raise ValueError(
                f"Invalid value for parameter `type`: {self.type}. Please choose from one of: {valid_types}"
            )

        self.max_rows = get(max_rows)
        self.overflow_row_behaviour = get(overflow_row_behaviour)
        self.wrap = get(wrap)
        self.col_count = get(col_count)
        self.headers = get(headers)
        if self.col_count != NoOverride and self.headers != NoOverride:
            self.col_count = self.__process_counts(
                self.col_count, len(self.headers) if self.headers else 3
            )
            self.__validate_headers(self.headers, self.col_count[0])

            self.headers = (
                self.headers
                if self.headers is not None
                else list(range(1, self.col_count[0] + 1))
            )

        self.max_cols = get(max_cols)
        self.datatype = get(datatype)
        if self.datatype != NoOverride:
            self.datatype = (
                self.datatype
                if isinstance(self.datatype, list)
                else [self.datatype] * self.col_count[0]
            )
        values = {
            "str": "",
            "number": 0,
            "bool": False,
            "date": "01/01/1970",
            "markdown": "",
            "html": "",
        }
        column_dtypes = (
            [self.datatype] * self.col_count[0]
            if isinstance(self.datatype, str)
            else self.datatype
        )
        self.empty_input = [
            [values[c] for c in column_dtypes] for _ in range(self.row_count[0])
        ]

        self.select: EventListenerMethod
        """
        Event listener for when the user selects cell within Dataframe.
        Uses event data gradio.SelectData to carry `value` referring to value of selected cell, and `index` tuple to refer to index row and column.
        See EventData documentation on how to use this event data.
        """
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )

    def preprocess(self, x: DataframeData):
        """
        Parameters:
            x: 2D array of str, numeric, or bool data
        Returns:
            Dataframe in requested format
        """
        if self.type == "pandas":
            if x.get("headers") is not None:
                return pd.DataFrame(x["data"], columns=x.get("headers"))
            else:
                return pd.DataFrame(x["data"])
        if self.type == "numpy":
            return np.array(x["data"])
        elif self.type == "array":
            return x["data"]
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'pandas', 'numpy', 'array'."
            )

    def postprocess(
        self, y: str | pd.DataFrame | np.ndarray | list[list[str | float]] | dict
    ) -> dict:
        """
        Parameters:
            y: dataframe in given format
        Returns:
            JSON object with key 'headers' for list of header names, 'data' for 2D array of string or numeric data
        """
        if y is None:
            return self.postprocess(self.empty_input)
        if isinstance(y, dict):
            return y
        if isinstance(y, str):
            dataframe = pd.read_csv(y)
            return {
                "headers": list(dataframe.columns),
                "data": Dataframe.__process_markdown(
                    dataframe.to_dict(orient="split")["data"], self.datatype
                ),
            }
        if isinstance(y, pd.DataFrame):
            return {
                "headers": list(y.columns),  # type: ignore
                "data": Dataframe.__process_markdown(
                    y.to_dict(orient="split")["data"], self.datatype  # type: ignore
                ),
            }
        if isinstance(y, (np.ndarray, list)):
            if len(y) == 0:
                return self.postprocess([[]])
            if isinstance(y, np.ndarray):
                y = y.tolist()
            assert isinstance(y, list), "output cannot be converted to list"

            _headers = self.headers

            if len(self.headers) < len(y[0]):
                _headers = [
                    *self.headers,
                    *list(range(len(self.headers) + 1, len(y[0]) + 1)),
                ]
            elif len(self.headers) > len(y[0]):
                _headers = self.headers[: len(y[0])]

            return {
                "headers": _headers,
                "data": Dataframe.__process_markdown(y, self.datatype),
            }
        raise ValueError("Cannot process value as a Dataframe")

    @staticmethod
    def __process_counts(count, default=3) -> tuple[int, str]:
        if count is None:
            return (default, "dynamic")
        if type(count) == int or type(count) == float:
            return (int(count), "dynamic")
        else:
            return count

    @staticmethod
    def __validate_headers(headers: list[str] | None, col_count: int):
        if headers is not None and len(headers) != col_count:
            raise ValueError(
                f"The length of the headers list must be equal to the col_count int.\n"
                f"The column count is set to {col_count} but `headers` has {len(headers)} items. "
                f"Check the values passed to `col_count` and `headers`."
            )

    @classmethod
    def __process_markdown(cls, data: list[list[Any]], datatype: list[str]):
        if "markdown" not in datatype:
            return data

        if cls.markdown_parser is None:
            cls.markdown_parser = utils.get_markdown_parser()

        for i in range(len(data)):
            for j in range(len(data[i])):
                if datatype[j] == "markdown":
                    data[i][j] = cls.markdown_parser.render(data[i][j])

        return data

    def as_example(self, input_data: pd.DataFrame | np.ndarray | str | None):
        if input_data is None:
            return ""
        elif isinstance(input_data, pd.DataFrame):
            return input_data.head(n=5).to_dict(orient="split")["data"]  # type: ignore
        elif isinstance(input_data, np.ndarray):
            return input_data.tolist()
        return input_data
