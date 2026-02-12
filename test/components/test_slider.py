from unittest.mock import patch

import pytest

import gradio as gr


class TestSlider:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        slider_input = gr.Slider()
        assert slider_input.preprocess(3.0) == 3.0
        assert slider_input.postprocess(3) == 3
        assert slider_input.postprocess(3) == 3
        assert slider_input.postprocess(None) == 0

        slider_input = gr.Slider(10, 20, value=15, step=1, label="Slide Your Input")
        assert slider_input.get_config() == {
            "minimum": 10,
            "maximum": 20,
            "step": 1,
            "precision": None,
            "value": 15,
            "name": "slider",
            "show_label": True,
            "buttons": None,
            "label": "Slide Your Input",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "info": None,
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
        }

    def test_in_interface(self):
        """ "
        Interface, process
        """
        iface = gr.Interface(lambda x: x**2, "slider", "textbox")
        assert iface(2) == "4"

    def test_static(self):
        """
        postprocess
        """
        component = gr.Slider(0, 100, 5)
        assert component.get_config().get("value") == 5
        component = gr.Slider(0, 100, None)
        assert component.get_config().get("value") == 0

    @patch("gradio.Slider.get_random_value", return_value=7)
    def test_slider_get_random_value_on_load(self, mock_get_random_value):
        slider = gr.Slider(minimum=-5, maximum=10, randomize=True)
        assert slider.value == 7
        assert slider.load_event_to_attach
        assert slider.load_event_to_attach[0]() == 7
        assert not slider.load_event_to_attach[1]

    @patch("random.randint", return_value=3)
    def test_slider_rounds_when_using_default_randomizer(self, mock_randint):
        slider = gr.Slider(minimum=0, maximum=1, randomize=True, step=0.1)
        # If get_random_value didn't round, this test would fail
        # because 0.30000000000000004 != 0.3
        assert slider.get_random_value() == 0.3
        mock_randint.assert_called()

    def test_raise_if_out_of_bounds(self):
        """
        raise_if_out_of_bounds
        """
        slider = gr.Slider(precision=2, minimum=0, maximum=10)
        slider.preprocess(5)
        with pytest.raises(gr.Error):
            slider.preprocess(11)
        with pytest.raises(gr.Error):
            slider.preprocess(-1)

    def test_precision(self):
        """
        Preprocess, postprocess
        """
        slider = gr.Slider(precision=None)
        assert slider.preprocess(5.1) == 5.1
        assert slider.api_info()["type"] == "number"

        slider = gr.Slider(precision=0)
        assert slider.preprocess(5.1) == 5
        assert slider.api_info()["type"] == "integer"
