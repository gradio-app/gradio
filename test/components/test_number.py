import pytest

import gradio as gr


class TestNumber:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config

        """
        numeric_input = gr.Number(elem_id="num", elem_classes="first")
        assert numeric_input.preprocess(3) == 3.0
        assert numeric_input.preprocess(None) is None
        assert numeric_input.postprocess(3) == 3
        assert numeric_input.postprocess(3) == 3.0
        assert numeric_input.postprocess(2.14) == 2.14
        assert numeric_input.postprocess(None) is None
        assert numeric_input.get_config() == {
            "value": None,
            "name": "number",
            "show_label": True,
            "step": 1,
            "label": None,
            "minimum": None,
            "maximum": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": "num",
            "elem_classes": ["first"],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "info": None,
            "precision": None,
            "placeholder": None,
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "buttons": [],
        }

    def test_component_functions_integer(self):
        """
        Preprocess, postprocess, serialize, get_template_context

        """
        numeric_input = gr.Number(precision=0, value=42)
        assert numeric_input.preprocess(3) == 3
        assert numeric_input.preprocess(None) is None
        assert numeric_input.postprocess(3) == 3
        assert numeric_input.postprocess(3) == 3
        assert numeric_input.postprocess(2.85) == 3
        assert numeric_input.postprocess(None) is None
        assert numeric_input.get_config() == {
            "value": 42,
            "name": "number",
            "show_label": True,
            "step": 1,
            "label": None,
            "minimum": None,
            "maximum": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "info": None,
            "precision": 0,
            "placeholder": None,
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "buttons": [],
        }

    def test_component_functions_precision(self):
        """
        Preprocess, postprocess, serialize, get_template_context

        """
        numeric_input = gr.Number(precision=2, value=42.3428)
        assert numeric_input.preprocess(3.231241) == 3.23
        assert numeric_input.preprocess(None) is None
        assert numeric_input.postprocess(-42.1241) == -42.12
        assert numeric_input.postprocess(5.6784) == 5.68
        assert numeric_input.postprocess(2.1421) == 2.14
        assert numeric_input.postprocess(None) is None

    def test_raise_if_out_of_bounds(self):
        """
        raise_if_out_of_bounds
        """
        numeric_input = gr.Number(precision=2, minimum=0, maximum=10)
        numeric_input.preprocess(5)
        with pytest.raises(gr.Error):
            numeric_input.preprocess(11)
        with pytest.raises(gr.Error):
            numeric_input.preprocess(-1)

    def test_precision_none_with_integer(self):
        """
        Preprocess, postprocess
        """
        numeric_input = gr.Number(precision=None)
        assert numeric_input.preprocess(5) == 5
        assert isinstance(numeric_input.preprocess(5), int)
        assert numeric_input.postprocess(5) == 5
        assert isinstance(numeric_input.postprocess(5), int)

    def test_precision_none_with_float(self):
        """
        Preprocess, postprocess
        """
        numeric_input = gr.Number(value=5.5, precision=None)
        assert numeric_input.preprocess(5.5) == 5.5
        assert isinstance(numeric_input.preprocess(5.5), float)
        assert numeric_input.postprocess(5.5) == 5.5
        assert isinstance(numeric_input.postprocess(5.5), float)

    def test_in_interface_as_input(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x**2, "number", "textbox")
        assert iface(2) == "4"

    def test_precision_0_in_interface(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x**2, gr.Number(precision=0), "textbox")
        assert iface(2) == "4"

    def test_in_interface_as_output(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: int(x) ** 2, "textbox", "number")
        assert iface(2) == 4.0

    def test_static(self):
        """
        postprocess
        """
        component = gr.Number()
        assert component.get_config().get("value") is None
        component = gr.Number(3)
        assert component.get_config().get("value") == 3.0
