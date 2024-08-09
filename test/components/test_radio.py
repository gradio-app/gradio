import pytest

import gradio as gr


class TestRadio:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config

        """
        radio_input = gr.Radio(["a", "b", "c"])
        assert radio_input.preprocess("c") == "c"
        assert radio_input.postprocess("a") == "a"
        radio_input = gr.Radio(
            choices=["a", "b", "c"], value="a", label="Pick Your One Input"
        )
        assert radio_input.get_config() == {
            "choices": [("a", "a"), ("b", "b"), ("c", "c")],
            "value": "a",
            "name": "radio",
            "show_label": True,
            "label": "Pick Your One Input",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "_selectable": False,
            "key": None,
            "type": "value",
            "info": None,
        }

        radio = gr.Radio(choices=["a", "b"], type="index")
        assert radio.preprocess("a") == 0
        assert radio.preprocess("b") == 1
        with pytest.raises(gr.Error):
            radio.preprocess("c")

        # When a Gradio app is loaded with gr.load, the tuples are converted to lists,
        # so we need to test that case as well
        radio = gr.Radio(["a", "b", ["c", "c full"]])  # type: ignore
        assert radio.choices == [("a", "a"), ("b", "b"), ("c", "c full")]

        with pytest.raises(ValueError):
            gr.Radio(["a", "b"], type="unknown")  # type: ignore

    def test_in_interface(self):
        """
        Interface, process
        """
        radio_input = gr.Radio(["a", "b", "c"])
        iface = gr.Interface(lambda x: 2 * x, radio_input, "textbox")
        assert iface("c") == "cc"
