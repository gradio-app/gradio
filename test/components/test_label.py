from pathlib import Path

import numpy as np
import pytest

import gradio as gr
from gradio import FileData


class TestLabel:
    def test_component_functions(self):
        """
        Process, postprocess, deserialize
        """
        y = "happy"
        label_output = gr.Label()
        label = label_output.postprocess(y).model_dump()  # type: ignore
        assert label == {"label": "happy", "confidences": None}

        y = {3: 0.7, 1: 0.2, 0: 0.1}
        label = label_output.postprocess(y).model_dump()  # type: ignore
        assert label == {
            "label": 3,
            "confidences": [
                {"label": 3, "confidence": 0.7},
                {"label": 1, "confidence": 0.2},
                {"label": 0, "confidence": 0.1},
            ],
        }
        label_output = gr.Label(num_top_classes=2)
        label = label_output.postprocess(y).model_dump()  # type: ignore

        assert label == {
            "label": 3,
            "confidences": [
                {"label": 3, "confidence": 0.7},
                {"label": 1, "confidence": 0.2},
            ],
        }
        with pytest.raises(ValueError):
            label_output.postprocess([1, 2, 3]).model_dump()  # type: ignore

        test_file_dir = Path(__file__).parent.parent / "test_files"
        path = str(test_file_dir / "test_label_json.json")
        label_dict = label_output.postprocess(path).model_dump()  # type: ignore
        assert label_dict["label"] == "web site"

        assert label_output.get_config() == {
            "name": "label",
            "show_label": True,
            "num_top_classes": 2,
            "value": {},
            "label": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "proxy_url": None,
            "color": None,
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "show_heading": True,
        }

    def test_color_argument(self):
        label = gr.Label(value=-10, color="red")
        assert label.get_config()["color"] == "red"

    def test_in_interface(self):
        """
        Interface, process
        """
        x_img = FileData(path="test/test_files/bus.png")

        def rgb_distribution(img):
            rgb_dist = np.mean(img, axis=(0, 1))
            rgb_dist /= np.sum(rgb_dist)
            rgb_dist = np.round(rgb_dist, decimals=2)
            return {
                "red": rgb_dist[0],
                "green": rgb_dist[1],
                "blue": rgb_dist[2],
            }

        iface = gr.Interface(rgb_distribution, "image", "label")
        output = iface(x_img)
        assert output == {
            "label": "red",
            "confidences": [
                {"label": "red", "confidence": 0.44},
                {"label": "green", "confidence": 0.28},
                {"label": "blue", "confidence": 0.28},
            ],
        }
