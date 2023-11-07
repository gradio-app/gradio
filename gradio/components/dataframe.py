"""gr.Dataframe() component"""

from __future__ import annotations

import warnings
from typing import Any, Callable, Dict, List, Literal, Optional

import numpy as np
import pandas as pd
import semantic_version
from gradio_client.documentation import document, set_documentation_group
from pandas.io.formats.style import Styler

from gradio.components import Component
from gradio.data_classes import GradioModel
from gradio.events import Events


class DataframeData(GradioModel):
    headers: List[str]
    data: List[List[Any]]
    metadata: Optional[Dict[str, Optional[List[Any]]]] = None


set_documentation_group("component")


@document()
class Dataframe(Component):
    """
    Accepts or displays 2D input through a spreadsheet-like component for dataframes.
    Preprocessing: passes the uploaded spreadsheet data as a {pandas.DataFrame}, {numpy.array}, or {List[List]} depending on `type`
    Postprocessing: expects a {pandas.DataFrame}, {pandas.Styler}, {numpy.array}, {List[List]}, {List}, a {Dict} with keys `data` (and optionally `headers`), or {str} path to a csv, which is rendered in the spreadsheet.
    Examples-format: a {str} filepath to a csv with data, a pandas dataframe, or a list of lists (excluding headers) where each sublist is a row of data.
    Demos: filter_records, matrix_transpose, tax_calculator
    """

    EVENTS = [Events.change, Events.input, Events.select]

    data_model = DataframeData

    def __init__(
        self,
        value: pd.DataFrame
        | Styler
        | np.ndarray
        | list
        | list[list]
        | dict
        | str
        | Callable
        | None = None,
        *,
        headers: list[str] | None = None,
        row_count: int | tuple[int, str] = (1, "dynamic"),
        col_count: int | tuple[int, str] | None = None,
        datatype: str | list[str] = "str",
        type: Literal["pandas", "numpy", "array"] = "pandas",
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        every: float | None = None,
        height: int = 500,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        wrap: bool = False,
        line_breaks: bool = True,
        column_widths: list[str | int] | None = None,
    ):
        """
        Parameters:
            value: Default value to display in the DataFrame. If a Styler is provided, it will be used to set the displayed value in the DataFrame (e.g. to set precision of numbers) if the `interactive` is False. If a Callable function is provided, the function will be called whenever the app loads to set the initial value of the component.
            headers: List of str header names. If None, no headers are shown.
            row_count: Limit number of rows for input and decide whether user can create new rows. The first element of the tuple is an `int`, the row count; the second should be 'fixed' or 'dynamic', the new row behaviour. If an `int` is passed the rows default to 'dynamic'
            col_count: Limit number of columns for input and decide whether user can create new columns. The first element of the tuple is an `int`, the number of columns; the second should be 'fixed' or 'dynamic', the new column behaviour. If an `int` is passed the columns default to 'dynamic'
            datatype: Datatype of values in sheet. Can be provided per column as a list of strings, or for the entire sheet as a single string. Valid datatypes are "str", "number", "bool", "date", and "markdown".
            type: Type of value to be returned by component. "pandas" for pandas dataframe, "numpy" for numpy array, or "array" for a Python list of lists.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            latex_delimiters: A list of dicts of the form {"left": open delimiter (str), "right": close delimiter (str), "display": whether to display in newline (bool)} that will be used to render LaTeX expressions. If not provided, `latex_delimiters` is set to `[{ "left": "$$", "right": "$$", "display": True }]`, so only expressions enclosed in $$ delimiters will be rendered as LaTeX, and in a new line. Pass in an empty list to disable LaTeX rendering. For more information, see the [KaTeX documentation](https://katex.org/docs/autorender.html). Only applies to columns whose datatype is "markdown".
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            show_label: if True, will display label.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            height: The maximum height of the dataframe, in pixels. If more rows are created than can fit in the height, a scrollbar will appear.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to edit the dataframe; if False, can only be used to display data. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            wrap: If True, the text in table cells will wrap when appropriate. If False and the `column_width` parameter is not set, the column widths will expand based on the cell contents and the table may need to be horizontally scrolled. If `column_width` is set, then any overflow text will be hidden.
            line_breaks: If True (default), will enable Github-flavored Markdown line breaks in chatbot messages. If False, single new lines will be ignored. Only applies for columns of type "markdown."
            column_widths: An optional list representing the width of each column. The elements of the list should be in the format "100px" (ints are also accepted and converted to pixel values) or "10%". If not provided, the column widths will be automatically determined based on the content of the cells. Setting this parameter will cause the browser to try to fit the table within the page width.
        """
        self.wrap = wrap
        self.row_count = self.__process_counts(row_count)
        self.col_count = self.__process_counts(
            col_count, len(headers) if headers else 3
        )

        self.__validate_headers(headers, self.col_count[0])

        self.headers = (
            headers
            if headers is not None
            else [str(i) for i in (range(1, self.col_count[0] + 1))]
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
        self.empty_input = {
            "headers": self.headers,
            "data": [
                [values[c] for c in column_dtypes] for _ in range(self.row_count[0])
            ],
            "metadata": None,
        }

        if latex_delimiters is None:
            latex_delimiters = [{"left": "$$", "right": "$$", "display": True}]
        self.latex_delimiters = latex_delimiters
        self.height = height
        self.line_breaks = line_breaks
        self.column_widths = [
            w if isinstance(w, str) else f"{w}px" for w in (column_widths or [])
        ]
        super().__init__(
            label=label,
            every=every,
            show_label=show_label,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            value=value,
        )

    def preprocess(self, payload: DataframeData) -> pd.DataFrame | np.ndarray | list:
        if self.type == "pandas":
            if payload.headers is not None:
                return pd.DataFrame(payload.data, columns=payload.headers)
            else:
                return pd.DataFrame(payload.data)
        if self.type == "numpy":
            return np.array(payload.data)
        elif self.type == "array":
            return payload.data
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'pandas', 'numpy', 'array'."
            )

    def postprocess(
        self,
        value: pd.DataFrame
        | Styler
        | np.ndarray
        | list
        | list[list]
        | dict
        | str
        | None,
    ) -> DataframeData | dict:
        if value is None:
            return self.postprocess(self.empty_input)
        if isinstance(value, dict):
            return value
        if isinstance(value, (str, pd.DataFrame)):
            if isinstance(value, str):
                value = pd.read_csv(value)  # type: ignore
            return DataframeData(
                headers=list(value.columns),  # type: ignore
                data=value.to_dict(orient="split")["data"],  # type: ignore
            )
        elif isinstance(value, Styler):
            if semantic_version.Version(pd.__version__) < semantic_version.Version(
                "1.5.0"
            ):
                raise ValueError(
                    "Styler objects are only supported in pandas version 1.5.0 or higher. Please try: `pip install --upgrade pandas` to use this feature."
                )
            if self.interactive:
                warnings.warn(
                    "Cannot display Styler object in interactive mode. Will display as a regular pandas dataframe instead."
                )
            df: pd.DataFrame = value.data  # type: ignore
            return DataframeData(
                headers=list(df.columns),
                data=df.to_dict(orient="split")["data"],  # type: ignore
                metadata=self.__extract_metadata(value),  # type: ignore
            )
        elif isinstance(value, (str, pd.DataFrame)):
            df = pd.read_csv(value) if isinstance(value, str) else value  # type: ignore
            return DataframeData(
                headers=list(df.columns),
                data=df.to_dict(orient="split")["data"],  # type: ignore
            )
        elif isinstance(value, (np.ndarray, list)):
            if len(value) == 0:
                return self.postprocess([[]])
            if isinstance(value, np.ndarray):
                value = value.tolist()
            if not isinstance(value, list):
                raise ValueError("output cannot be converted to list")

            _headers = self.headers
            if len(self.headers) < len(value[0]):
                _headers: list[str] = [
                    *self.headers,
                    *[str(i) for i in range(len(self.headers) + 1, len(value[0]) + 1)],
                ]
            elif len(self.headers) > len(value[0]):
                _headers = self.headers[: len(value[0])]

            return DataframeData(headers=_headers, data=value)
        else:
            raise ValueError("Cannot process value as a Dataframe")

    @staticmethod
    def __get_cell_style(cell_id: str, cell_styles: list[dict]) -> str:
        styles_for_cell = []
        for style in cell_styles:
            if cell_id in style.get("selectors", []):
                styles_for_cell.extend(style.get("props", []))
        styles_str = "; ".join([f"{prop}: {value}" for prop, value in styles_for_cell])
        return styles_str

    @staticmethod
    def __extract_metadata(df: Styler) -> dict[str, list[list]]:
        metadata = {"display_value": [], "styling": []}
        style_data = df._compute()._translate(None, None)  # type: ignore
        cell_styles = style_data.get("cellstyle", [])
        for i in range(len(style_data["body"])):
            metadata["display_value"].append([])
            metadata["styling"].append([])
            for j in range(len(style_data["body"][i])):
                cell_type = style_data["body"][i][j]["type"]
                if cell_type != "td":
                    continue
                display_value = style_data["body"][i][j]["display_value"]
                cell_id = style_data["body"][i][j]["id"]
                styles_str = Dataframe.__get_cell_style(cell_id, cell_styles)
                metadata["display_value"][i].append(display_value)
                metadata["styling"][i].append(styles_str)
        return metadata

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

    def example_inputs(self) -> Any:
        return {"headers": ["a", "b"], "data": [["foo", "bar"]]}
