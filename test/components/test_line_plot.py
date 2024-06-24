import json
from unittest.mock import MagicMock, patch

import gradio as gr

from .plot_data import stocks


class TestLinePlot:
    @patch.dict("sys.modules", {"bokeh": MagicMock(__version__="3.0.3")})
    def test_get_config(self):
        assert gr.LinePlot().get_config() == {
            "caption": None,
            "elem_id": None,
            "elem_classes": [],
            "interactive": None,
            "label": None,
            "name": "lineplot",
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
            "stroke_dash": None,
            "overlay_point": None,
            "title": None,
            "tooltip": None,
            "x_title": None,
            "y_title": None,
            "color_legend_title": None,
            "stroke_dash_legend_title": None,
            "color_legend_position": None,
            "stroke_dash_legend_position": None,
            "height": None,
            "width": None,
            "x_lim": None,
            "y_lim": None,
            "x_label_angle": None,
            "y_label_angle": None,
            "_selectable": False,
            "key": None,
        }

    def test_no_color(self):
        plot = gr.LinePlot(
            x="date",
            y="price",
            tooltip=["symbol", "price"],
            title="Stock Performance",
            x_title="Trading Day",
        )
        output = plot.postprocess(stocks).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        for layer in config["layer"]:
            assert layer["mark"]["type"] in ["line", "point"]
            assert layer["encoding"]["x"]["field"] == "date"
            assert layer["encoding"]["x"]["title"] == "Trading Day"
            assert layer["encoding"]["y"]["field"] == "price"

        assert config["title"] == "Stock Performance"
        assert "height" not in config
        assert "width" not in config

    def test_height_width(self):
        plot = gr.LinePlot(x="date", y="price", height=100, width=200)
        output = plot.postprocess(stocks).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["height"] == 100
        assert config["width"] == 200

    def test_xlim_ylim(self):
        plot = gr.LinePlot(x="date", y="price", x_lim=[200, 400], y_lim=[300, 500])
        output = plot.postprocess(stocks).model_dump()
        config = json.loads(output["plot"])
        for layer in config["layer"]:
            assert layer["encoding"]["x"]["scale"] == {"domain": [200, 400]}
            assert layer["encoding"]["y"]["scale"] == {"domain": [300, 500]}

    def test_color_encoding(self):
        plot = gr.LinePlot(
            x="date", y="price", tooltip="symbol", color="symbol", overlay_point=True
        )
        output = plot.postprocess(stocks).model_dump()
        config = json.loads(output["plot"])
        for layer in config["layer"]:
            assert layer["encoding"]["color"]["field"] == "symbol"
            assert layer["encoding"]["color"]["scale"] == {
                "domain": ["MSFT", "AMZN", "IBM", "GOOG", "AAPL"],
                "range": [0, 1, 2, 3, 4],
            }
            assert layer["encoding"]["color"]["type"] == "nominal"
            if layer["mark"]["type"] == "point":
                assert layer["encoding"]["opacity"] == {}

    def test_lineplot_accepts_fn_as_value(self):
        plot = gr.LinePlot(
            value=lambda: stocks.sample(frac=0.1, replace=False),
            x="date",
            y="price",
            color="symbol",
        )
        assert isinstance(plot.value, dict)
        assert isinstance(plot.value["plot"], str)
