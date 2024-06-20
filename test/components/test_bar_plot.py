import json
from unittest.mock import MagicMock, patch

import gradio as gr

from .plot_data import barley, simple


class TestBarPlot:
    @patch.dict("sys.modules", {"bokeh": MagicMock(__version__="3.0.3")})
    def test_get_config(self):
        assert gr.BarPlot().get_config() == {
            "caption": None,
            "elem_id": None,
            "elem_classes": [],
            "interactive": None,
            "label": None,
            "name": "barplot",
            "bokeh_version": "3.0.3",
            "show_actions_button": False,
            "proxy_url": None,
            "show_label": False,
            "container": True,
            "min_width": 160,
            "scale": None,
            "value": None,
            "visible": True,
            "x": None,
            "y": None,
            "color": None,
            "vertical": True,
            "group": None,
            "title": None,
            "tooltip": None,
            "x_title": None,
            "y_title": None,
            "color_legend_title": None,
            "group_title": None,
            "color_legend_position": None,
            "height": None,
            "width": None,
            "y_lim": None,
            "x_label_angle": None,
            "y_label_angle": None,
            "sort": None,
            "_selectable": False,
            "key": None,
        }

    def test_no_color(self):
        plot = gr.BarPlot(
            x="a",
            y="b",
            tooltip=["a", "b"],
            title="Made Up Bar Plot",
            x_title="Variable A",
            sort="x",
        )
        output = plot.postprocess(simple).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        assert output["chart"] == "bar"
        config = json.loads(output["plot"])
        assert config["encoding"]["x"]["sort"] == "x"
        assert config["encoding"]["x"]["field"] == "a"
        assert config["encoding"]["x"]["title"] == "Variable A"
        assert config["encoding"]["y"]["field"] == "b"
        assert config["encoding"]["y"]["title"] == "b"

        assert config["title"] == "Made Up Bar Plot"
        assert "height" not in config
        assert "width" not in config

    def test_height_width(self):
        plot = gr.BarPlot(x="a", y="b", height=100, width=200)
        output = plot.postprocess(simple).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["height"] == 100
        assert config["width"] == 200

    def test_ylim(self):
        plot = gr.BarPlot(x="a", y="b", y_lim=[15, 100])
        output = plot.postprocess(simple).model_dump()
        config = json.loads(output["plot"])
        assert config["encoding"]["y"]["scale"] == {"domain": [15, 100]}

    def test_horizontal(self):
        output = gr.BarPlot(
            simple,
            x="a",
            y="b",
            x_title="Variable A",
            y_title="Variable B",
            title="Simple Bar Plot with made up data",
            tooltip=["a", "b"],
            vertical=False,
            y_lim=[20, 100],
        ).get_config()
        assert output["value"]["chart"] == "bar"
        config = json.loads(output["value"]["plot"])
        assert config["encoding"]["x"]["field"] == "b"
        assert config["encoding"]["x"]["scale"] == {"domain": [20, 100]}
        assert config["encoding"]["x"]["title"] == "Variable B"

        assert config["encoding"]["y"]["field"] == "a"
        assert config["encoding"]["y"]["title"] == "Variable A"

    def test_barplot_accepts_fn_as_value(self):
        plot = gr.BarPlot(
            value=lambda: barley.sample(frac=0.1, replace=False),
            x="year",
            y="yield",
        )
        assert isinstance(plot.value, dict)
        assert isinstance(plot.value["plot"], str)
