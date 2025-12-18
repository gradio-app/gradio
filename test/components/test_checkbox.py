import gradio as gr


class TestCheckbox:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        bool_input = gr.Checkbox()
        assert bool_input.preprocess(True)
        assert bool_input.postprocess(True)
        assert bool_input.postprocess(True)
        bool_input = gr.Checkbox(value=True, label="Check Your Input")
        assert bool_input.get_config() == {
            "value": True,
            "name": "checkbox",
            "show_label": True,
            "label": "Check Your Input",
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
            "preserved_by_key": ["value"],
            "info": None,
            "buttons": [],
        }

    def test_in_interface(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: 1 if x else 0, "checkbox", "number")
        assert iface(True) == 1
