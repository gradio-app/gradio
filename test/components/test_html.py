import gradio as gr


class TestHTML:
    def test_component_functions(self):
        """
        get_config
        """
        html_component = gr.components.HTML("#Welcome onboard", label="HTML Input")
        assert html_component.get_config() == {
            "value": "#Welcome onboard",
            "label": "HTML Input",
            "show_label": False,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "proxy_url": None,
            "name": "html",
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "min_height": None,
            "max_height": None,
            "container": False,
            "padding": True,
        }

    def test_in_interface(self):
        """
        Interface, process
        """

        def bold_text(text):
            return f"<strong>{text}</strong>"

        iface = gr.Interface(bold_text, "text", "html")
        assert iface("test") == "<strong>test</strong>"
