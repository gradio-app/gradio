import numpy as np
import pandas as pd
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
        assert output["Age"][1] == 24
        assert not output["Member"][0]
        assert dataframe_input.postprocess(output) == x_payload

        dataframe_input = gr.Dataframe(
            headers=["Name", "Age", "Member"], label="Dataframe Input"
        )
        assert dataframe_input.get_config() == {
            "value": {
                "headers": ["Name", "Age", "Member"],
                "data": [["", "", ""]],
                "metadata": None,
            },
            "_selectable": False,
            "key": None,
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
            "wrap": False,
            "proxy_url": None,
            "name": "dataframe",
            "height": 500,
            "latex_delimiters": [{"display": True, "left": "$$", "right": "$$"}],
            "line_breaks": True,
            "column_widths": [],
        }
        dataframe_input = gr.Dataframe()
        output = dataframe_input.preprocess(DataframeData(**x_data))
        assert output["Age"][1] == 24

        x_data = {
            "data": [["Tim", 12, False], ["Jan", 24, True]],
            "headers": ["Name", "Age", "Member"],
            "metadata": {"display_value": None, "styling": None},
        }
        dataframe_input.preprocess(DataframeData(**x_data))

        with pytest.raises(ValueError):
            gr.Dataframe(type="unknown")

        dataframe_output = gr.Dataframe()
        assert dataframe_output.get_config() == {
            "value": {
                "headers": ["1", "2", "3"],
                "data": [["", "", ""]],
                "metadata": None,
            },
            "_selectable": False,
            "key": None,
            "headers": ["1", "2", "3"],
            "row_count": (1, "dynamic"),
            "col_count": (3, "dynamic"),
            "datatype": "str",
            "type": "pandas",
            "label": None,
            "show_label": True,
            "scale": None,
            "min_width": 160,
            "interactive": None,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "wrap": False,
            "proxy_url": None,
            "name": "dataframe",
            "height": 500,
            "latex_delimiters": [{"display": True, "left": "$$", "right": "$$"}],
            "line_breaks": True,
            "column_widths": [],
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
        output = dataframe_output.postprocess([]).model_dump()
        assert output == {"data": [[]], "headers": ["1", "2", "3"], "metadata": None}
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
            pd.DataFrame([[2, True], [3, True], [4, False]], columns=["num", "prime"])
        ).model_dump()
        assert output == {
            "headers": ["num", "prime"],
            "data": [[2, True], [3, True], [4, False]],
            "metadata": None,
        }
        with pytest.raises(ValueError):
            gr.Dataframe(type="unknown")

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
        output = component.postprocess(s).model_dump()
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
