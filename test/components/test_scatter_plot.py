import json
from unittest.mock import MagicMock, patch

import gradio as gr

from .plot_data import cars


class TestScatterPlot:
    @patch.dict("sys.modules", {"bokeh": MagicMock(__version__="3.0.3")})
    def test_get_config(self):
        print(gr.ScatterPlot().get_config())
        assert gr.ScatterPlot().get_config() == {
            "caption": None,
            "elem_id": None,
            "elem_classes": [],
            "interactive": None,
            "label": None,
            "name": "scatterplot",
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
            "size": None,
            "shape": None,
            "title": None,
            "tooltip": None,
            "x_title": None,
            "y_title": None,
            "color_legend_title": None,
            "size_legend_title": None,
            "shape_legend_title": None,
            "color_legend_position": None,
            "size_legend_position": None,
            "shape_legend_position": None,
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
        plot = gr.ScatterPlot(
            x="Horsepower",
            y="Miles_per_Gallon",
            tooltip="Name",
            title="Car Data",
            x_title="Horse",
        )
        output = plot.postprocess(cars).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["encoding"]["x"]["field"] == "Horsepower"
        assert config["encoding"]["x"]["title"] == "Horse"
        assert config["encoding"]["y"]["field"] == "Miles_per_Gallon"
        assert config["title"] == "Car Data"
        assert "height" not in config
        assert "width" not in config

    def test_no_interactive(self):
        plot = gr.ScatterPlot(
            x="Horsepower", y="Miles_per_Gallon", tooltip="Name", interactive=False
        )
        output = plot.postprocess(cars).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert "selection" not in config

    def test_height_width(self):
        plot = gr.ScatterPlot(
            x="Horsepower", y="Miles_per_Gallon", height=100, width=200
        )
        output = plot.postprocess(cars).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["height"] == 100
        assert config["width"] == 200

    def test_xlim_ylim(self):
        plot = gr.ScatterPlot(
            x="Horsepower", y="Miles_per_Gallon", x_lim=[200, 400], y_lim=[300, 500]
        )
        output = plot.postprocess(cars).model_dump()
        config = json.loads(output["plot"])
        assert config["encoding"]["x"]["scale"] == {"domain": [200, 400]}
        assert config["encoding"]["y"]["scale"] == {"domain": [300, 500]}

    def test_color_encoding(self):
        plot = gr.ScatterPlot(
            x="Horsepower",
            y="Miles_per_Gallon",
            tooltip="Name",
            title="Car Data",
            color="Origin",
        )
        output = plot.postprocess(cars).model_dump()
        config = json.loads(output["plot"])
        assert config["encoding"]["color"]["field"] == "Origin"
        assert config["encoding"]["color"]["scale"] == {
            "domain": ["USA", "Europe", "Japan"],
            "range": [0, 1, 2],
        }
        assert config["encoding"]["color"]["type"] == "nominal"

    def test_two_encodings(self):
        plot = gr.ScatterPlot(
            show_label=False,
            title="Two encodings",
            x="Horsepower",
            y="Miles_per_Gallon",
            color="Acceleration",
            shape="Origin",
        )
        output = plot.postprocess(cars).model_dump()
        config = json.loads(output["plot"])
        assert config["encoding"]["color"]["field"] == "Acceleration"
        assert config["encoding"]["color"]["scale"] == {
            "domain": [cars.Acceleration.min(), cars.Acceleration.max()],
            "range": [0, 1],
        }
        assert config["encoding"]["color"]["type"] == "quantitative"

        assert config["encoding"]["shape"]["field"] == "Origin"
        assert config["encoding"]["shape"]["type"] == "nominal"

    def test_legend_position(self):
        plot = gr.ScatterPlot(
            show_label=False,
            title="Two encodings",
            x="Horsepower",
            y="Miles_per_Gallon",
            color="Acceleration",
            color_legend_position="none",
            color_legend_title="Foo",
            shape="Origin",
            shape_legend_position="none",
            shape_legend_title="Bar",
            size="Acceleration",
            size_legend_title="Accel",
            size_legend_position="none",
        )
        output = plot.postprocess(cars).model_dump()
        config = json.loads(output["plot"])
        assert config["encoding"]["color"]["legend"] is None
        assert config["encoding"]["shape"]["legend"] is None
        assert config["encoding"]["size"]["legend"] is None

    def test_scatterplot_accepts_fn_as_value(self):
        plot = gr.ScatterPlot(
            value=lambda: cars.sample(frac=0.1, replace=False),
            x="Horsepower",
            y="Miles_per_Gallon",
            color="Origin",
        )
        assert isinstance(plot.value, dict)
        assert isinstance(plot.value["plot"], str)
