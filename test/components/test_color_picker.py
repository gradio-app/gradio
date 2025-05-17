import gradio as gr


class TestColorPicker:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, tokenize, get_config
        """
        color_picker_input = gr.ColorPicker()
        assert color_picker_input.preprocess("#000000") == "#000000"
        assert color_picker_input.postprocess("#000000") == "#000000"
        assert color_picker_input.postprocess(None) is None
        assert color_picker_input.postprocess("#FFFFFF") == "#FFFFFF"

        assert color_picker_input.get_config() == {
            "value": None,
            "show_label": True,
            "label": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "name": "colorpicker",
            "info": None,
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
        }

    def test_in_interface_as_input(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x, "colorpicker", "colorpicker")
        assert iface("#000000") == "#000000"

    def test_in_interface_as_output(self):
        """
        Interface, process

        """
        iface = gr.Interface(lambda x: x, "colorpicker", gr.ColorPicker())
        assert iface("#000000") == "#000000"

    def test_static(self):
        """
        postprocess
        """
        component = gr.ColorPicker("#000000")
        assert component.get_config().get("value") == "#000000"
