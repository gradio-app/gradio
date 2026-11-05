from decimal import localcontext
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

    @pytest.mark.parametrize(
        "minimum, maximum, step, first, last",
        [
            (0.04, 0.35, 0.1, 0.04, 0.34),
            (0, 0.3, 0.1, 0, 0.3),
            (1e-6, 1, 0.1, 1e-6, 0.900001),
            (0, 7e-05, 1e-05, 0, 7e-05),
            (0, 0.29999999995, 0.1, 0, 0.2),
            (1.2e-05, 5e-05, None, 1.2e-05, 5e-05),
            (0.001, 0.0065, None, 0.001, 0.0065),
            (0, 100, None, 0, 100),
            (0, 1, 1e-28, 0, 1),
        ],
    )
    def test_random_value_covers_first_and_last_step(
        self, minimum, maximum, step, first, last
    ):
        slider = gr.Slider(minimum=minimum, maximum=maximum, step=step)
        with patch("random.randint", side_effect=lambda a, b: a):
            assert slider.get_random_value() == first
        with patch("random.randint", side_effect=lambda a, b: b):
            assert slider.get_random_value() == last

    def test_random_value_ignores_decimal_context(self):
        with localcontext() as context:
            context.prec = 6
            with patch("random.randint", side_effect=lambda a, b: b):
                slider = gr.Slider(0, 1, step=1e-6, randomize=True)
                assert slider.value == 1
                assert slider.preprocess(slider.value) == 1

    def test_random_value_preserves_integer_type(self):
        with patch("random.randint", return_value=3):
            slider = gr.Slider(0, 10, step=1, randomize=True)
            assert slider.value == 3
            assert type(slider.value) is int

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

    @pytest.mark.parametrize("minimum,maximum", [(5, 5), (10, 5)])
    def test_slider_requires_minimum_less_than_maximum(self, minimum, maximum):
        with pytest.raises(ValueError, match="minimum must be less than maximum"):
            gr.Slider(minimum=minimum, maximum=maximum)
