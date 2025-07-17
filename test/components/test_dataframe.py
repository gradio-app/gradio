from datetime import datetime

import numpy as np
import pandas as pd
import polars as pl
import pytest

import gradio as gr
from gradio.components.dataframe import DataframeData


class TestDataframe:
    def test_component_functions(self):
        """
        Preprocess, serialize, get_config
        """
        x_data = {
            "data": [["Tim", 12, False], ["Jan", 24, True]],
            "headers": ["Name", "Age", "Member"],
            "metadata": None,
        }
        x_payload = DataframeData(**x_data)
        dataframe_input = gr.Dataframe(headers=["Name", "Age", "Member"])
        output = dataframe_input.preprocess(x_payload)
        assert output["Age"][1] == 24  # type: ignore
        assert not output["Member"][0]  # type: ignore
        assert dataframe_input.postprocess(output) == x_payload

        dataframe_input = gr.Dataframe(
            headers=["Name", "Age", "Member"], label="Dataframe Input"
        )
        assert dataframe_input.get_config() == {
            "value": {
                "headers": ["Name", "Age", "Member"],
                "data": [],
                "metadata": None,
            },
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "headers": ["Name", "Age", "Member"],
            "row_count": (1, "dynamic"),
            "col_count": (3, "dynamic"),
            "datatype": "str",
            "type": "pandas",
            "label": "Dataframe Input",
            "show_label": True,
            "scale": None,
            "min_width": 160,
            "interactive": None,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "show_row_numbers": False,
            "show_search": "none",
            "static_columns": [],
            "pinned_columns": None,
            "wrap": False,
            "proxy_url": None,
            "name": "dataframe",
            "max_height": 500,
            "latex_delimiters": [{"display": True, "left": "$$", "right": "$$"}],
            "line_breaks": True,
            "column_widths": [],
            "show_fullscreen_button": False,
            "show_copy_button": False,
            "max_chars": None,
        }
        dataframe_input = gr.Dataframe()
        output = dataframe_input.preprocess(DataframeData(**x_data))
        assert output["Age"][1] == 24  # type: ignore

        x_data = {
            "data": [["Tim", 12, False], ["Jan", 24, True]],
            "headers": ["Name", "Age", "Member"],
            "metadata": {"display_value": None, "styling": None},
        }
        dataframe_input.preprocess(DataframeData(**x_data))

        with pytest.raises(ValueError):
            gr.Dataframe(type="unknown")  # type: ignore

        dataframe_output = gr.Dataframe()
        assert dataframe_output.get_config() == {
            "value": {
                "headers": ["1", "2", "3"],
                "data": [],
                "metadata": None,
            },
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "headers": ["1", "2", "3"],
            "row_count": (1, "dynamic"),
            "col_count": (3, "dynamic"),
            "datatype": "str",
            "type": "pandas",
            "label": None,
            "show_label": True,
            "show_row_numbers": False,
            "show_search": "none",
            "static_columns": [],
            "pinned_columns": None,
            "scale": None,
            "min_width": 160,
            "interactive": None,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "wrap": False,
            "proxy_url": None,
            "name": "dataframe",
            "max_height": 500,
            "latex_delimiters": [{"display": True, "left": "$$", "right": "$$"}],
            "line_breaks": True,
            "column_widths": [],
            "show_fullscreen_button": False,
            "max_chars": None,
            "show_copy_button": False,
        }

        dataframe_input = gr.Dataframe(column_widths=["100px", 200, "50%"])
        assert dataframe_input.get_config()["column_widths"] == [
            "100px",
            "200px",
            "50%",
        ]

    def test_postprocess(self):
        """
        postprocess
        """
        dataframe_output = gr.Dataframe()
        output = dataframe_output.postprocess(np.zeros((2, 2))).model_dump()
        assert output == {
            "data": [[0, 0], [0, 0]],
            "headers": ["1", "2"],
            "metadata": None,
        }
        output = dataframe_output.postprocess([[1, 3, 5]]).model_dump()
        assert output == {
            "data": [[1, 3, 5]],
            "headers": ["1", "2", "3"],
            "metadata": None,
        }
        output = dataframe_output.postprocess(
            pd.DataFrame([[2, True], [3, True], [4, False]], columns=["num", "prime"])  # type: ignore
        ).model_dump()
        assert output == {
            "headers": ["num", "prime"],
            "data": [[2, True], [3, True], [4, False]],
            "metadata": None,
        }
        with pytest.raises(ValueError):
            gr.Dataframe(type="unknown")  # type: ignore

        # When the headers don't match the data
        dataframe_output = gr.Dataframe(headers=["one", "two", "three"])
        output = dataframe_output.postprocess([[2, True], [3, True]]).model_dump()
        assert output == {
            "headers": ["one", "two"],
            "data": [[2, True], [3, True]],
            "metadata": None,
        }
        dataframe_output = gr.Dataframe(headers=["one", "two", "three"])
        output = dataframe_output.postprocess(
            [[2, True, "ab", 4], [3, True, "cd", 5]]
        ).model_dump()
        assert output == {
            "headers": ["one", "two", "three", "4"],
            "data": [[2, True, "ab", 4], [3, True, "cd", 5]],
            "metadata": None,
        }

        dataframe_output = gr.Dataframe(headers=["one", "two", "three"])
        output = dataframe_output.postprocess([(1, 2, 3), (4, 5, 6)]).model_dump()
        assert output == {
            "headers": ["one", "two", "three"],
            "data": [[1, 2, 3], [4, 5, 6]],
            "metadata": None,
        }

    def test_dataframe_postprocess_all_types(self):
        df = pd.DataFrame(
            {
                "date_1": pd.date_range("2021-01-01", periods=2),
                "date_2": pd.date_range("2022-02-15", periods=2).strftime(
                    "%B %d, %Y, %r"
                ),
                "number": np.array([0.2233, 0.57281]),
                "number_2": np.array([84, 23]).astype(np.int64),
                "bool": [True, False],
                "markdown": ["# Hello", "# Goodbye"],
            }
        )
        component = gr.Dataframe(
            datatype=["date", "date", "number", "number", "bool", "markdown"]
        )
        output = component.postprocess(df).model_dump()
        assert output == {
            "headers": list(df.columns),
            "data": [
                [
                    pd.Timestamp("2021-01-01 00:00:00"),
                    "February 15, 2022, 12:00:00 AM",
                    0.2233,
                    84,
                    True,
                    "# Hello",
                ],
                [
                    pd.Timestamp("2021-01-02 00:00:00"),
                    "February 16, 2022, 12:00:00 AM",
                    0.57281,
                    23,
                    False,
                    "# Goodbye",
                ],
            ],
            "metadata": None,
        }

    def test_dataframe_postprocess_only_dates(self):
        df = pd.DataFrame(
            {
                "date_1": pd.date_range("2021-01-01", periods=2),
                "date_2": pd.date_range("2022-02-15", periods=2),
            }
        )
        component = gr.Dataframe(datatype=["date", "date"])
        output = component.postprocess(df).model_dump()
        assert output == {
            "headers": list(df.columns),
            "data": [
                [
                    pd.Timestamp("2021-01-01 00:00:00"),
                    pd.Timestamp("2022-02-15 00:00:00"),
                ],
                [
                    pd.Timestamp("2021-01-02 00:00:00"),
                    pd.Timestamp("2022-02-16 00:00:00"),
                ],
            ],
            "metadata": None,
        }

    def test_dataframe_postprocess_styler(self):
        component = gr.Dataframe()
        df = pd.DataFrame(
            {
                "name": ["Adam", "Mike"] * 4,
                "gpa": [1.1, 1.12] * 4,
                "sat": [800, 800] * 4,
            }
        )
        s = df.style.format(precision=1, decimal=",")
        output = component.postprocess(s).model_dump()  # type: ignore
        assert output == {
            "data": [
                ["Adam", 1.1, 800],
                ["Mike", 1.12, 800],
                ["Adam", 1.1, 800],
                ["Mike", 1.12, 800],
                ["Adam", 1.1, 800],
                ["Mike", 1.12, 800],
                ["Adam", 1.1, 800],
                ["Mike", 1.12, 800],
            ],
            "headers": ["name", "gpa", "sat"],
            "metadata": {
                "display_value": [
                    ["Adam", "1,1", "800"],
                    ["Mike", "1,1", "800"],
                    ["Adam", "1,1", "800"],
                    ["Mike", "1,1", "800"],
                    ["Adam", "1,1", "800"],
                    ["Mike", "1,1", "800"],
                    ["Adam", "1,1", "800"],
                    ["Mike", "1,1", "800"],
                ],
                "styling": [
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                ],
            },
        }

        df = pd.DataFrame(
            {
                "A": [14, 4, 5, 4, 1],
                "B": [5, 2, 54, 3, 2],
                "C": [20, 20, 7, 3, 8],
                "D": [14, 3, 6, 2, 6],
                "E": [23, 45, 64, 32, 23],
            }
        )

        t = df.style.highlight_max(color="lightgreen", axis=0)
        output = component.postprocess(t).model_dump()
        assert output == {
            "data": [
                [14, 5, 20, 14, 23],
                [4, 2, 20, 3, 45],
                [5, 54, 7, 6, 64],
                [4, 3, 3, 2, 32],
                [1, 2, 8, 6, 23],
            ],
            "headers": ["A", "B", "C", "D", "E"],
            "metadata": {
                "display_value": [
                    ["14", "5", "20", "14", "23"],
                    ["4", "2", "20", "3", "45"],
                    ["5", "54", "7", "6", "64"],
                    ["4", "3", "3", "2", "32"],
                    ["1", "2", "8", "6", "23"],
                ],
                "styling": [
                    [
                        "background-color: lightgreen",
                        "",
                        "background-color: lightgreen",
                        "background-color: lightgreen",
                        "",
                    ],
                    ["", "", "background-color: lightgreen", "", ""],
                    [
                        "",
                        "background-color: lightgreen",
                        "",
                        "",
                        "background-color: lightgreen",
                    ],
                    ["", "", "", "", ""],
                    ["", "", "", "", ""],
                ],
            },
        }

    def test_dataframe_hidden_columns(self):
        """Test that hidden columns are properly excluded from the output"""
        component = gr.Dataframe()
        df = pd.DataFrame(
            {"a": [1, 2, 3], "b": [4, 5, 6], "color": ["red", "blue", "green"]}
        )
        styled_df = df.style.hide(axis=1, subset=["color"])
        output = component.postprocess(styled_df).model_dump()
        assert output == {
            "data": [
                [1, 4],
                [2, 5],
                [3, 6],
            ],
            "headers": ["a", "b"],
            "metadata": {
                "display_value": [
                    ["1", "4"],
                    ["2", "5"],
                    ["3", "6"],
                ],
                "styling": [
                    ["", ""],
                    ["", ""],
                    ["", ""],
                ],
            },
        }

    def test_is_empty(self):
        """Test is_empty method with various data types"""
        df = gr.Dataframe()
        assert df.is_empty([])
        assert df.is_empty([[]])
        assert df.is_empty(np.array([]))
        assert df.is_empty(np.zeros((2, 0)))
        assert df.is_empty(None)
        assert df.is_empty({})
        assert df.is_empty({"data": [], "headers": ["a", "b"]})
        assert df.is_empty({"data": []})
        assert not df.is_empty({"data": [1, 2]})
        assert not df.is_empty([[1, 2], [3, 4]])
        assert not df.is_empty(pd.DataFrame({"a": [1, 2]}))
        assert not df.is_empty(pd.DataFrame({"a": [1, 2]}).style)

    def test_get_headers(self):
        """Test get_headers method with various data types"""
        df = gr.Dataframe()
        test_df = pd.DataFrame({"col1": [1, 2], "col2": [3, 4]})
        assert df.get_headers(test_df) == ["col1", "col2"]
        assert df.get_headers(test_df.style) == ["col1", "col2"]
        assert df.get_headers({"headers": ["a", "b"]}) == ["a", "b"]
        assert df.get_headers(np.array([[1, 2], [3, 4]])) == []
        assert df.get_headers(None) == []

    def test_get_cell_data(self):
        """Test get_cell_data method with various data types"""
        df = gr.Dataframe()
        test_data = [[1, 2], [3, 4]]
        test_df = pd.DataFrame({"col1": [1, 3], "col2": [2, 4]})
        assert df.get_cell_data(test_data) == [[1, 2], [3, 4]]
        assert df.get_cell_data(test_df) == [[1, 2], [3, 4]]
        assert df.get_cell_data({"data": test_data}) == [[1, 2], [3, 4]]

        styled_df = test_df.style
        styled_df.hide(axis=1, subset=["col2"])
        assert df.get_cell_data(styled_df) == [[1], [3]]

    def test_static_columns(self):
        # when static_columns is specified, col_count should be fixed
        dataframe = gr.Dataframe(static_columns=[0, 1])
        assert dataframe.col_count[1] == "fixed"

        # when static_columns is specified with dynamic col_count, it should be converted to fixed
        dataframe = gr.Dataframe(col_count=(4, "dynamic"), static_columns=[0, 1])
        assert dataframe.col_count[1] == "fixed"

        # when static_columns is empty, col_count should remain as specified
        dataframe = gr.Dataframe(col_count=(4, "dynamic"), static_columns=[])
        assert dataframe.col_count[1] == "dynamic"

        # when static_columns is None, col_count should remain as specified
        dataframe = gr.Dataframe(col_count=(4, "dynamic"), static_columns=None)
        assert dataframe.col_count[1] == "dynamic"

        # when static_columns is not specified at all, col_count should remain as specified
        dataframe = gr.Dataframe(col_count=(4, "dynamic"))
        assert dataframe.col_count[1] == "dynamic"

    def test_auto_datatype(self):
        df_headers = [
            "String",
            "Int",
            "Float",
            "Pandas Time",
            "Numpy Time",
            "Datetime",
            "Boolean",
        ]

        list_data = [
            [
                "Irish Red Fox",
                185000,
                4.2,
                pd.Timestamp("2017-01-01T12"),
                np.datetime64("now"),
                datetime(2022, 1, 1),
                True,
            ],
            [
                "Irish Badger",
                95000,
                8.5,
                pd.Timestamp("2018-01-01T12"),
                np.datetime64("now"),
                datetime(2023, 1, 1),
                True,
            ],
            [
                "Irish Otter",
                13500,
                5.5,
                pd.Timestamp("2025-01-01T12"),
                np.datetime64("now"),
                datetime(2024, 1, 1),
                False,
            ],
        ]
        np_data = np.array(list_data, dtype=object)
        pl_data = pl.DataFrame(list_data, schema=df_headers)

        pd_data = pd.DataFrame(list_data, columns=df_headers)  # type: ignore
        styler_data = pd_data.style.apply(
            lambda row: [
                "background-color: lightgreen" if row["Boolean"] else "" for _ in row
            ],
            axis=1,
        )

        result = ["str", "number", "number", "date", "date", "date", "bool"]

        dataframe = gr.Dataframe(
            value=pd_data, headers=df_headers, interactive=True, datatype="auto"
        )
        assert dataframe.datatype == result

        dataframe = gr.Dataframe(
            value=list_data, headers=df_headers, interactive=True, datatype="auto"
        )
        assert dataframe.datatype == result

        dataframe = gr.Dataframe(
            value=np_data, headers=df_headers, interactive=True, datatype="auto"
        )
        assert dataframe.datatype == result

        dataframe = gr.Dataframe(
            value=styler_data, headers=df_headers, interactive=True, datatype="auto"
        )
        assert dataframe.datatype == result

        dataframe = gr.Dataframe(
            value=pl_data, headers=df_headers, interactive=True, datatype="auto"
        )
        result = ["str", "number", "number", "str", "str", "date", "bool"]
        assert dataframe.datatype == result
