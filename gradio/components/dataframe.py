"""gr.Dataframe() component"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable, Literal

import numpy as np
import pandas as pd
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import JSONSerializable

from gradio.components.base import IOComponent, _Keywords
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

    def __init__(
        self,
        value: list[list[Any]] | Callable | None = None,
        *,
        headers: list[str] | None = None,
        row_count: int | tuple[int, str] = (1, "dynamic"),
        col_count: int | tuple[int, str] | None = None,
        datatype: str | list[str] = "str",
        type: Literal["pandas", "numpy", "array"] = "pandas",
        max_rows: int | None = 20,
        max_cols: int | None = None,
        overflow_row_behaviour: Literal["paginate", "show_ends"] = "paginate",
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        height: int | float | None = None,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        wrap: bool = False,
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
            latex_delimiters: A list of dicts of the form {"left": open delimiter (str), "right": close delimiter (str), "display": whether to display in newline (bool)} that will be used to render LaTeX expressions. If not provided, `latex_delimiters` is set to `[{ "left": "$", "right": "$", "display": False }]`, so only expressions enclosed in $ delimiters will be rendered as LaTeX, and in the same line. Pass in an empty list to disable LaTeX rendering. For more information, see the [KaTeX documentation](https://katex.org/docs/autorender.html). Only applies to columns whose datatype is "markdown".
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            height: The maximum height of the file component, in pixels. If more files are uploaded than can fit in the height, a scrollbar will appear.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to edit the dataframe; if False, can only be used to display data. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            wrap: if True text in table cells will wrap when appropriate, if False the table will scroll horizontally. Defaults to False.
        """

        self.wrap = wrap
        self.row_count = self.__process_counts(row_count)
        self.col_count = self.__process_counts(
            col_count, len(headers) if headers else 3
        )

        self.__validate_headers(headers, self.col_count[0])

        self.headers = (
            headers if headers is not None else list(range(1, self.col_count[0] + 1))
        )
        self.datatype = (
            datatype if isinstance(datatype, list) else [datatype] * self.col_count[0]
        )
        valid_types = ["pandas", "numpy", "array"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        values = {
            "str": "",
            "number": 0,
            "bool": False,
            "date": "01/01/1970",
            "markdown": "",
            "html": "",
        }
        column_dtypes = (
            [datatype] * self.col_count[0] if isinstance(datatype, str) else datatype
        )
        self.empty_input = [
            [values[c] for c in column_dtypes] for _ in range(self.row_count[0])
        ]

        self.max_rows = max_rows
        self.max_cols = max_cols
        self.overflow_row_behaviour = overflow_row_behaviour
        if latex_delimiters is None:
            latex_delimiters = [{"left": "$", "right": "$", "display": False}]
        self.latex_delimiters = latex_delimiters
        self.height = height

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

    def get_config(self):
        return {
            "headers": self.headers,
            "datatype": self.datatype,
            "row_count": self.row_count,
            "col_count": self.col_count,
            "value": self.value,
            "max_rows": self.max_rows,
            "max_cols": self.max_cols,
            "overflow_row_behaviour": self.overflow_row_behaviour,
            "wrap": self.wrap,
            "latex_delimiters": self.latex_delimiters,
            "height": self.height,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Any | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        max_rows: int | None = None,
        max_cols: str | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        height: int | float | None = None,
        interactive: bool | None = None,
        visible: bool | None = None,
    ):
        return {
            "max_rows": max_rows,
            "max_cols": max_cols,
            "label": label,
            "show_label": show_label,
            "scale": scale,
            "min_width": min_width,
            "height": height,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "latex_delimiters": latex_delimiters,
            "__type__": "update",
        }

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
        if isinstance(y, (str, pd.DataFrame)):
            if isinstance(y, str):
                y = pd.read_csv(y)
            return {
                "headers": list(y.columns),  # type: ignore
                "data": y.to_dict(orient="split")["data"],  # type: ignore
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
                "data": y,
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

    def as_example(self, input_data: pd.DataFrame | np.ndarray | str | None):
        if input_data is None:
            return ""
        elif isinstance(input_data, pd.DataFrame):
            return input_data.head(n=5).to_dict(orient="split")["data"]  # type: ignore
        elif isinstance(input_data, np.ndarray):
            return input_data.tolist()
        return input_data
