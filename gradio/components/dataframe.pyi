"""gr.Dataframe() component"""

from __future__ import annotations

import re
import warnings
from collections.abc import Callable, Sequence
from typing import (
    TYPE_CHECKING,
    Any,
    Literal,
    Union,
)

import numpy as np
import semantic_version
from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.data_classes import GradioModel
from gradio.events import Events
from gradio.i18n import I18nData

if TYPE_CHECKING:
    import pandas as pd
    import polars as pl  # type: ignore
    from pandas.io.formats.style import Styler

    from gradio.components import Timer


def _is_polars_available():
    import importlib.util

    spec = importlib.util.find_spec("polars")
    return bool(spec)


def _import_polars():
    import polars as pl  # type: ignore

    return pl


class DataframeData(GradioModel):
    headers: list[Any]
    data: Union[list[list[Any]], list[tuple[Any, ...]]]
    metadata: dict[str, list[Any] | None] | None = None

from gradio.events import Dependency

@document()
class Dataframe(Component):
    """
    This component displays a table of value spreadsheet-like component. Can be used to display data as an output component, or as an input to collect data from the user.
    Demos: filter_records, matrix_transpose, tax_calculator, sort_records
    Guides: styling-the-gradio-dataframe, filters-tables-and-stats
    """

    EVENTS = [Events.change, Events.input, Events.select, Events.edit]

    data_model = DataframeData

    def __init__(
        self,
        value: pd.DataFrame
        | Styler
        | np.ndarray
        | pl.DataFrame
        | list
        | list[list]
        | dict
        | str
        | Callable
        | None = None,
        *,
        headers: list[str] | None = None,
        row_count: int | None = None,
        row_limits: tuple[int | None, int | None] | None = None,
        col_count: None = None,
        column_count: int | None = None,
        column_limits: tuple[int | None, int | None] | None = None,
        datatype: Literal[
            "str", "number", "bool", "date", "markdown", "html", "image", "auto"
        ]
        | Sequence[
            Literal["str", "number", "bool", "date", "markdown", "html"]
        ] = "str",
        type: Literal["pandas", "numpy", "array", "polars"] = "pandas",
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        label: str | I18nData | None = None,
        show_label: bool | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        max_height: int | str = 500,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        wrap: bool = False,
        line_breaks: bool = True,
        column_widths: list[str | int] | None = None,
        buttons: list[Literal["fullscreen", "copy"]] | None = None,
        show_row_numbers: bool = False,
        max_chars: int | None = None,
        show_search: Literal["none", "search", "filter"] = "none",
        pinned_columns: int | None = None,
        static_columns: list[int] | None = None,
    ):
        """
        Parameters:
            value: Default value to display in the DataFrame. Supports pandas, numpy, polars, and list of lists. If a Styler is provided, it will be used to set the displayed value in the DataFrame (e.g. to set precision of numbers) if the `interactive` is False. If a Callable function is provided, the function will be called whenever the app loads to set the initial value of the component.
            headers: List of str header names. These are used to set the column headers of the dataframe if the value does not have headers. If None, no headers are shown.
            row_count: The number of rows to initially display in the dataframe. If None, the number of rows is determined automatically based on the `value`.
            row_limits: A tuple of two integers specifying the minimum and maximum number of rows that can be created in the dataframe via the UI. If the first element is None, there is no minimum number of rows. If the second element is None, there is no maximum number of rows. Only applies if `interactive` is True.
            col_count: This parameter is deprecated. Please use `column_count` instead.
            column_count: The number of columns to initially display in the dataframe. If None, the number of columns is determined automatically based on the `value`.
            column_limits: A tuple of two integers specifying the minimum and maximum number of columns that can be created in the dataframe via the UI. If the first element is None, there is no minimum number of columns. If the second element is None, there is no maximum number of columns. Only applies if `interactive` is True.
            datatype: Datatype of values in sheet. Can be provided per column as a list of strings, or for the entire sheet as a single string. Valid datatypes are "str", "number", "bool", "date", and "markdown". Boolean columns will display as checkboxes. If the datatype "auto" is used, the column datatypes are automatically selected based on the value input if possible.
            type: Type of value to be returned by component. "pandas" for pandas dataframe, "numpy" for numpy array, "polars" for polars dataframe, or "array" for a Python list of lists.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            latex_delimiters: A list of dicts of the form {"left": open delimiter (str), "right": close delimiter (str), "display": whether to display in newline (bool)} that will be used to render LaTeX expressions. If not provided, `latex_delimiters` is set to `[{ "left": "$$", "right": "$$", "display": True }]`, so only expressions enclosed in $$ delimiters will be rendered as LaTeX, and in a new line. Pass in an empty list to disable LaTeX rendering. For more information, see the [KaTeX documentation](https://katex.org/docs/autorender.html). Only applies to columns whose datatype is "markdown".
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            show_label: if True, will display label.
            every: Continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            max_height: The maximum height of the dataframe, specified in pixels if a number is passed, or in CSS units if a string is passed. If more rows are created than can fit in the height, a scrollbar will appear.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to edit the dataframe; if False, can only be used to display data. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            wrap: If True, the text in table cells will wrap when appropriate. If False and the `column_width` parameter is not set, the column widths will expand based on the cell contents and the table may need to be horizontally scrolled. If `column_width` is set, then any overflow text will be hidden.
            line_breaks: If True (default), will enable Github-flavored Markdown line breaks in chatbot messages. If False, single new lines will be ignored. Only applies for columns of type "markdown."
            column_widths: An optional list representing the width of each column. The elements of the list should be in the format "100px" (ints are also accepted and converted to pixel values) or "10%". The percentage width is calculated based on the viewport width of the table. If not provided, the column widths will be automatically determined based on the content of the cells.
            buttons: A list of buttons to show in the top right corner of the component. Valid options are "fullscreen" and "copy". The "fullscreen" button allows the user to view the table in fullscreen mode. The "copy" button allows the user to copy the table data to the clipboard. By default, all buttons are shown.
            show_row_numbers: If True, will display row numbers in a separate column.
            max_chars: Maximum number of characters to display in each cell before truncating (single-clicking a cell value will still reveal the full content). If None, no truncation is applied.
            show_search: Show a search input in the toolbar. If "search", a search input is shown. If "filter", a search input and filter buttons are shown. If "none", no search input is shown.
            pinned_columns: If provided, will pin the specified number of columns from the left.
            static_columns: List of column indices (int) that should not be editable. Only applies when interactive=True. When specified, col_count is automatically set to "fixed" and columns cannot be inserted or deleted.
        """
        if isinstance(row_count, tuple):
            warnings.warn(
                "Passing a tuple to 'row_count' will be removed in Gradio 6.0. "
                "You will need to use 'row_count' for the initial row count and 'row_limits' for min/max constraints instead. "
                "For example, row_count=(5, 'fixed') should become row_count=5, row_limits=(5, 5).",
                DeprecationWarning,
                stacklevel=2,
            )

        if col_count is not None:
            warnings.warn(
                "The 'col_count' parameter will be removed in Gradio 6.0. "
                "You will need to use 'column_count' instead.",
                DeprecationWarning,
                stacklevel=2,
            )

        if isinstance(col_count, tuple):
            warnings.warn(
                "Passing a tuple to 'col_count' will be removed in Gradio 6.0. "
                "You will need to use 'column_count' for the initial column count and 'column_limits' for min/max constraints instead. "
                "For example, col_count=(3, 'fixed') should become column_count=3, column_limits=(3, 3).",
                DeprecationWarning,
                stacklevel=2,
            )

        self.wrap = wrap
        # TODO: This is a temporary fix to ensure that the row_count and column_count are processed correctly.
        # with the older version of the dataframe js component. Once we migrate the dataframe js component to
        # Svelte 5, we'll remove self.__process_counts and drop self.col_count.
        self.row_count = self.__process_counts(row_count)
        if row_limits is not None:
            warnings.warn(
                "The `row_limits` parameter is not yet implemented.",
                UserWarning,
            )
        self.row_limits = row_limits
        self.column_count = self.col_count = self.__process_counts(
            column_count, len(headers) if headers else 3
        )
        if col_count is not None:
            warnings.warn(
                "The `col_count` parameter is deprecated and will be removed. Please use `column_count` instead.",
                UserWarning,
            )
        if column_limits is not None:
            warnings.warn(
                "The `column_limits` parameter is not yet implemented.",
                UserWarning,
            )
        self.column_limits = column_limits
        self.static_columns = static_columns or []

        self.__validate_headers(headers, self.column_count[0])

        self.headers = (
            headers
            if headers is not None
            else [str(i) for i in (range(1, self.column_count[0] + 1))]
        )

        valid_types = ["pandas", "numpy", "array", "polars"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        if type == "polars" and not _is_polars_available():
            raise ImportError(
                "Polars is not installed. Please install using `pip install polars`."
            )
        self.type = type

        if datatype == "auto":
            self.set_auto_datatype(value)
        else:
            self.datatype = datatype

        if latex_delimiters is None:
            latex_delimiters = [{"left": "$$", "right": "$$", "display": True}]
        self.latex_delimiters = latex_delimiters
        self.max_height = max_height
        self.line_breaks = line_breaks
        self.column_widths = [
            w
            if isinstance(w, str)
            and (w.endswith("px") or w.endswith("%") or w == "auto")
            else f"{w}px"
            for w in (column_widths or [])
        ]
        self.buttons = buttons
        self.show_row_numbers = show_row_numbers
        self.max_chars = max_chars
        self.show_search = show_search
        self.pinned_columns = pinned_columns

        super().__init__(
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            value=value,
        )
        self._value_description = (
            "a pandas dataframe"
            if type == "pandas"
            else "a list of lists"
            if type == "array"
            else "a numpy array"
            if type == "numpy"
            else "a polars dataframe"
        )

    def preprocess(
        self, payload: DataframeData
    ) -> pd.DataFrame | np.ndarray | pl.DataFrame | list[list]:
        """
        Parameters:
            payload: the uploaded spreadsheet data as an object with `headers` and `data` attributes. Note that sorting the columns in the browser will not affect the values passed to this function.
        Returns:
            Passes the uploaded spreadsheet data as a `pandas.DataFrame`, `numpy.array`, `polars.DataFrame`, or native 2D Python `list[list]` depending on `type`.
        """
        import pandas as pd

        if self.type == "pandas":
            if payload.headers is not None:
                return pd.DataFrame(
                    [] if payload.data == [[]] else payload.data,
                    columns=payload.headers,  # type: ignore
                )
            else:
                return pd.DataFrame(payload.data)
        if self.type == "polars":
            polars = _import_polars()
            if payload.headers is not None:
                return polars.DataFrame(
                    [] if payload.data == [[]] else payload.data,
                    schema=payload.headers,
                    orient="row",
                )
            else:
                return polars.DataFrame(payload.data)
        if self.type == "numpy":
            return np.array(payload.data)
        elif self.type == "array":
            return payload.data  # type: ignore
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'pandas', 'numpy', 'array', 'polars'."
            )

    @staticmethod
    def is_empty(
        value: pd.DataFrame
        | Styler
        | np.ndarray
        | pl.DataFrame
        | list
        | list[list]
        | dict
        | str
        | None,
    ) -> bool:
        """
        Checks if the value of the dataframe provided is empty.
        """
        import pandas as pd
        from pandas.io.formats.style import Styler

        if value is None:
            return True
        if isinstance(value, pd.DataFrame):
            return value.empty
        elif isinstance(value, Styler):
            return value.data.empty  # type: ignore
        elif isinstance(value, np.ndarray):
            return value.size == 0
        elif _is_polars_available() and isinstance(value, _import_polars().DataFrame):
            return value.is_empty()
        elif isinstance(value, list):
            if len(value) > 0 and isinstance(value[0], list):
                return len(value[0]) == 0
            return len(value) == 0
        elif isinstance(value, dict):
            if "data" in value:
                return len(value["data"]) == 0
            return len(value) == 0
        return False

    def get_headers(
        self,
        value: pd.DataFrame
        | Styler
        | np.ndarray
        | pl.DataFrame
        | list
        | list[list]
        | dict
        | str
        | None,
    ) -> list[str]:
        """
        Returns the headers of the dataframes based on the value provided. For values
        that do not have headers, an empty list is returned.
        """
        import pandas as pd
        from pandas.io.formats.style import Styler

        if value is None:
            return []
        if isinstance(value, pd.DataFrame):
            return list(value.columns)
        elif isinstance(value, Styler):
            return list(value.data.columns)  # type: ignore
        elif isinstance(value, str):
            return list(pd.read_csv(value).columns)
        elif _is_polars_available() and isinstance(value, _import_polars().DataFrame):
            return list(value.columns)
        elif isinstance(value, dict):
            return value.get("headers", [])  # type: ignore
        elif isinstance(value, (list, np.ndarray)):
            return []
        return []

    @staticmethod
    def get_cell_data(
        value: pd.DataFrame
        | Styler
        | np.ndarray
        | pl.DataFrame
        | list
        | list[list]
        | dict
        | str
        | None,
    ) -> list[list[Any]]:
        """
        Gets the cell data (as a list of lists) from the value provided.
        """
        import pandas as pd
        from pandas.io.formats.style import Styler

        if isinstance(value, dict):
            return value.get("data", [[]])  # type: ignore
        if isinstance(value, (str, pd.DataFrame)):
            if isinstance(value, str):
                value = pd.read_csv(value)  # type: ignore
            return value.to_dict(orient="split")["data"]
        elif isinstance(value, Styler):
            df: pd.DataFrame = value.data  # type: ignore
            hidden_columns = getattr(value, "hidden_columns", [])
            visible_cols = [
                i for i, _ in enumerate(df.columns) if i not in hidden_columns
            ]
            df = df.iloc[:, visible_cols]
            return df.to_dict(orient="split")["data"]
        elif _is_polars_available() and isinstance(value, _import_polars().DataFrame):
            df_dict = value.to_dict()  # type: ignore
            data = list(zip(*df_dict.values()))
            return data
        elif isinstance(value, (np.ndarray, list)):
            if isinstance(value, np.ndarray):
                value = value.tolist()
            if not isinstance(value, list):
                raise ValueError("output cannot be converted to list")
            if not isinstance(value[0], list):
                if isinstance(value[0], tuple):
                    return [list(v) for v in value]
                return [[v] for v in value]
            return value  # type: ignore
        else:
            raise ValueError(
                f"Cannot process value of type {type(value)} in gr.Dataframe"
            )

    @staticmethod
    def get_metadata(
        value: pd.DataFrame
        | Styler
        | np.ndarray
        | pl.DataFrame
        | list
        | list[list]
        | dict
        | str
        | None,
    ) -> dict[str, list[list]] | None:
        """
        Gets the metadata from the value provided.
        """
        from pandas.io.formats.style import Styler

        if isinstance(value, Styler):
            return Dataframe.__extract_metadata(
                value, [int(c) for c in getattr(value, "hidden_columns", [])]
            )
        elif isinstance(value, dict):
            return value.get("metadata", None)  # type: ignore
        return None

    def postprocess(
        self,
        value: pd.DataFrame
        | Styler
        | np.ndarray
        | pl.DataFrame
        | list
        | list[list]
        | dict
        | str
        | None,
    ) -> DataframeData:
        """
        Parameters:
            value: Expects data in any of these formats:
                - `pandas.DataFrame`
                - `pandas.Styler`
                - `numpy.array`
                -  `polars.DataFrame`
                - `list[list]`
                - `list`
                - `dict` with keys 'data' (and optionally 'headers')
                - `str` path to a csv, which is rendered as the spreadsheet.
        Returns:
            the uploaded spreadsheet data as an object with `headers` and `data` keys and optional `metadata` key
        """
        import pandas as pd
        from pandas.io.formats.style import Styler

        if isinstance(value, Styler) and semantic_version.Version(
            pd.__version__
        ) < semantic_version.Version("1.5.0"):
            raise ValueError(
                "Styler objects are only supported in pandas version 1.5.0 or higher. Please try: `pip install --upgrade pandas` to use this feature."
            )
        if isinstance(value, Styler) and self.interactive:
            warnings.warn(
                "Cannot display Styler object in interactive mode. Will display as a regular pandas dataframe instead."
            )

        headers = self.get_headers(value) or self.headers
        data = [] if self.is_empty(value) else self.get_cell_data(value)
        if len(data) == 0:
            return DataframeData(headers=headers, data=[], metadata=None)
        if len(headers) > len(data[0]):
            headers = headers[: len(data[0])]
        elif len(headers) < len(data[0]):
            headers = [
                *headers,
                *[str(i) for i in range(len(headers) + 1, len(data[0]) + 1)],
            ]
        metadata = self.get_metadata(value)
        return DataframeData(
            headers=headers,
            data=data,
            metadata=metadata,  # type: ignore
        )

    def set_auto_datatype(self, value):
        """
        Automatically sets the datatype of each column based on the data provided. If the datatype can't be inferred, it defaults to "str".
        """
        import pandas as pd
        from pandas.io.formats.style import Styler

        dtype_mapping = {
            "str": "str",
            "object": "str",
            "string": "str",
            "utf": "str",
            "int": "number",
            "float": "number",
            "bool": "bool",
            "boolean": "bool",
            "datetime": "date",
            "date": "date",
            "timedelta": "date",
            "timestamp": "date",
            "category": "str",
            "categorical": "str",
        }

        brackets_re = re.compile(
            r"\[.*?\]|\(.*?\)"
        )  # Matches brackets and their contents
        numbers_re = re.compile(r"\s*\d+\s*$")  # Matches trailing numbers and spaces

        if isinstance(value, pd.DataFrame):
            self.datatype = [
                dtype_mapping.get(
                    numbers_re.sub("", brackets_re.sub("", str(dtype))).lower(), "str"
                )
                for dtype in value.dtypes
            ]

        elif isinstance(value, Styler):
            self.datatype = [
                dtype_mapping.get(
                    numbers_re.sub("", brackets_re.sub("", str(dtype))).lower(), "str"
                )
                for dtype in value.data.dtypes
            ]

        elif isinstance(value, np.ndarray):
            if value.size == 0 or value.ndim < 2:
                self.datatype = "str"
            else:
                self.datatype = [
                    dtype_mapping.get(
                        numbers_re.sub(
                            "", brackets_re.sub("", str(type(value[0, i]).__name__))
                        ).lower(),
                        "str",
                    )
                    for i in range(value.shape[1])
                ]

        elif isinstance(value, list):
            if len(value) == 0 or not isinstance(value[0], (list, tuple)):
                self.datatype = "str"
            else:
                self.datatype = [
                    dtype_mapping.get(
                        numbers_re.sub(
                            "", brackets_re.sub("", str(type(val).__name__))
                        ).lower(),
                        "str",
                    )
                    for val in value[0]
                ]

        elif _is_polars_available():
            pl = _import_polars()
            if isinstance(value, pl.DataFrame):
                self.datatype = [
                    dtype_mapping.get(
                        numbers_re.sub("", brackets_re.sub("", str(dtype))).lower(),
                        "str",
                    )
                    for dtype in value.dtypes
                ]
            else:
                self.datatype = "str"

        else:
            self.datatype = "str"

    @staticmethod
    def __extract_metadata(
        df: Styler, hidden_cols: list[int] | None = None
    ) -> dict[str, list[list]]:
        style_data = df._compute()._translate(None, None)  # type: ignore
        cell_styles = style_data.get("cellstyle", [])
        style_dict = {}
        for style in cell_styles:
            for selector in style.get("selectors", []):
                style_dict[selector] = "; ".join(
                    f"{prop}: {value}" for prop, value in style.get("props", [])
                )
        hidden_cols_set = set(hidden_cols) if hidden_cols is not None else set()
        metadata = {"display_value": [], "styling": []}

        for row in style_data["body"]:
            row_display = []
            row_styling = []
            # First, filter out the column with row numbers (if present).
            # Then, filter out the hidden columns so that column indices map correctly
            cells = [cell for cell in row if cell["type"] == "td"]
            cells = [
                cell
                for col_idx, cell in enumerate(cells)
                if col_idx not in hidden_cols_set
            ]
            for cell in cells:
                row_display.append(cell["display_value"])
                row_styling.append(style_dict.get(cell["id"], ""))
            metadata["display_value"].append(row_display)
            metadata["styling"].append(row_styling)
        return metadata

    @staticmethod
    def __validate_headers(headers: list[str] | None, column_count: int):
        if headers is not None and len(headers) != column_count:
            raise ValueError(
                f"The length of the headers list must be equal to the column_count.\n"
                f"The column count is set to {column_count} but `headers` has {len(headers)} items. "
                f"Check the values passed to `column_count` and `headers`."
            )

    @staticmethod
    def __process_counts(count, default=3) -> tuple[int, str]:
        if count is None:
            return (default, "dynamic")
        if isinstance(count, (int, float)):
            return (int(count), "dynamic")
        else:
            return count

    def process_example(
        self,
        value: pd.DataFrame
        | Styler
        | np.ndarray
        | pl.DataFrame
        | list
        | list[list]
        | dict
        | str
        | None,
    ):
        import pandas as pd

        if value is None:
            return ""
        value_df_data = self.postprocess(value)
        value_df = pd.DataFrame(value_df_data.data, columns=value_df_data.headers)  # type: ignore
        return value_df.head(n=5).to_dict(orient="split")["data"]

    def example_payload(self) -> Any:
        return {"headers": ["a", "b"], "data": [["foo", "bar"]]}

    def example_value(self) -> Any:
        return {"headers": ["a", "b"], "data": [["foo", "bar"]]}
    from typing import Callable, Literal, Sequence, Any, TYPE_CHECKING
    from gradio.blocks import Block
    if TYPE_CHECKING:
        from gradio.components import Timer
        from gradio.components.base import Component


    def change(self,
        fn: Callable[..., Any] | None = None,
        inputs: Block | Sequence[Block] | set[Block] | None = None,
        outputs: Block | Sequence[Block] | None = None,
        api_name: str | None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        show_progress_on: Component | Sequence[Component] | None = None,
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: Timer | float | None = None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
        js: str | Literal[True] | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        api_visibility: Literal["public", "private", "undocumented"] = "public",
        key: int | str | tuple[int | str, ...] | None = None,
        api_description: str | None | Literal[False] = None,
        validator: Callable[..., Any] | None = None,

        ) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: list of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: list of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: defines how the endpoint appears in the API docs. Can be a string or None. If set to a string, the endpoint will be exposed in the API docs with the given name. If None (default), the name of the function will be used as the API endpoint.
            scroll_to_output: if True, will scroll to output component on completion
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            show_progress_on: Component or list of components to show the progress animation on. If None, will show the progress animation on all of the output components.
            queue: if True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: if True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: if False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: if False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: a list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            trigger_mode: if "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
            js: optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            concurrency_limit: if set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
            concurrency_id: if set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            api_visibility: controls the visibility and accessibility of this endpoint. Can be "public" (shown in API docs and callable by clients), "private" (hidden from API docs and not callable by the Gradio client libraries), or "undocumented" (hidden from API docs but callable by clients and via gr.load). If fn is None, api_visibility will automatically be set to "private".
            key: A unique key for this event listener to be used in @gr.render(). If set, this value identifies an event as identical across re-renders when the key is identical.
            api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
            validator: Optional validation function to run before the main function. If provided, this function will be executed first with queue=False, and only if it completes successfully will the main function be called. The validator receives the same inputs as the main function.

        """
        ...

    def input(self,
        fn: Callable[..., Any] | None = None,
        inputs: Block | Sequence[Block] | set[Block] | None = None,
        outputs: Block | Sequence[Block] | None = None,
        api_name: str | None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        show_progress_on: Component | Sequence[Component] | None = None,
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: Timer | float | None = None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
        js: str | Literal[True] | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        api_visibility: Literal["public", "private", "undocumented"] = "public",
        key: int | str | tuple[int | str, ...] | None = None,
        api_description: str | None | Literal[False] = None,
        validator: Callable[..., Any] | None = None,

        ) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: list of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: list of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: defines how the endpoint appears in the API docs. Can be a string or None. If set to a string, the endpoint will be exposed in the API docs with the given name. If None (default), the name of the function will be used as the API endpoint.
            scroll_to_output: if True, will scroll to output component on completion
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            show_progress_on: Component or list of components to show the progress animation on. If None, will show the progress animation on all of the output components.
            queue: if True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: if True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: if False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: if False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: a list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            trigger_mode: if "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
            js: optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            concurrency_limit: if set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
            concurrency_id: if set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            api_visibility: controls the visibility and accessibility of this endpoint. Can be "public" (shown in API docs and callable by clients), "private" (hidden from API docs and not callable by the Gradio client libraries), or "undocumented" (hidden from API docs but callable by clients and via gr.load). If fn is None, api_visibility will automatically be set to "private".
            key: A unique key for this event listener to be used in @gr.render(). If set, this value identifies an event as identical across re-renders when the key is identical.
            api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
            validator: Optional validation function to run before the main function. If provided, this function will be executed first with queue=False, and only if it completes successfully will the main function be called. The validator receives the same inputs as the main function.

        """
        ...

    def select(self,
        fn: Callable[..., Any] | None = None,
        inputs: Block | Sequence[Block] | set[Block] | None = None,
        outputs: Block | Sequence[Block] | None = None,
        api_name: str | None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        show_progress_on: Component | Sequence[Component] | None = None,
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: Timer | float | None = None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
        js: str | Literal[True] | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        api_visibility: Literal["public", "private", "undocumented"] = "public",
        key: int | str | tuple[int | str, ...] | None = None,
        api_description: str | None | Literal[False] = None,
        validator: Callable[..., Any] | None = None,

        ) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: list of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: list of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: defines how the endpoint appears in the API docs. Can be a string or None. If set to a string, the endpoint will be exposed in the API docs with the given name. If None (default), the name of the function will be used as the API endpoint.
            scroll_to_output: if True, will scroll to output component on completion
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            show_progress_on: Component or list of components to show the progress animation on. If None, will show the progress animation on all of the output components.
            queue: if True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: if True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: if False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: if False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: a list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            trigger_mode: if "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
            js: optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            concurrency_limit: if set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
            concurrency_id: if set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            api_visibility: controls the visibility and accessibility of this endpoint. Can be "public" (shown in API docs and callable by clients), "private" (hidden from API docs and not callable by the Gradio client libraries), or "undocumented" (hidden from API docs but callable by clients and via gr.load). If fn is None, api_visibility will automatically be set to "private".
            key: A unique key for this event listener to be used in @gr.render(). If set, this value identifies an event as identical across re-renders when the key is identical.
            api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
            validator: Optional validation function to run before the main function. If provided, this function will be executed first with queue=False, and only if it completes successfully will the main function be called. The validator receives the same inputs as the main function.

        """
        ...

    def edit(self,
        fn: Callable[..., Any] | None = None,
        inputs: Block | Sequence[Block] | set[Block] | None = None,
        outputs: Block | Sequence[Block] | None = None,
        api_name: str | None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        show_progress_on: Component | Sequence[Component] | None = None,
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: Timer | float | None = None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
        js: str | Literal[True] | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        api_visibility: Literal["public", "private", "undocumented"] = "public",
        key: int | str | tuple[int | str, ...] | None = None,
        api_description: str | None | Literal[False] = None,
        validator: Callable[..., Any] | None = None,

        ) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: list of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: list of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: defines how the endpoint appears in the API docs. Can be a string or None. If set to a string, the endpoint will be exposed in the API docs with the given name. If None (default), the name of the function will be used as the API endpoint.
            scroll_to_output: if True, will scroll to output component on completion
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            show_progress_on: Component or list of components to show the progress animation on. If None, will show the progress animation on all of the output components.
            queue: if True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: if True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: if False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: if False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: a list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            trigger_mode: if "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
            js: optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            concurrency_limit: if set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
            concurrency_id: if set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            api_visibility: controls the visibility and accessibility of this endpoint. Can be "public" (shown in API docs and callable by clients), "private" (hidden from API docs and not callable by the Gradio client libraries), or "undocumented" (hidden from API docs but callable by clients and via gr.load). If fn is None, api_visibility will automatically be set to "private".
            key: A unique key for this event listener to be used in @gr.render(). If set, this value identifies an event as identical across re-renders when the key is identical.
            api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
            validator: Optional validation function to run before the main function. If provided, this function will be executed first with queue=False, and only if it completes successfully will the main function be called. The validator receives the same inputs as the main function.

        """
        ...