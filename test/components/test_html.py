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
            "autoscroll": True,
        }

    def test_autoscroll_parameter(self):
        """
        Test that autoscroll parameter is properly set
        """
        # Test default autoscroll (True)
        html_component_default = gr.components.HTML("#Welcome")
        assert html_component_default.autoscroll is True
        
        # Test autoscroll=False
        html_component_no_scroll = gr.components.HTML("#Welcome", autoscroll=False)
        assert html_component_no_scroll.autoscroll is False
        
        # Test autoscroll=True explicitly
        html_component_scroll = gr.components.HTML("#Welcome", autoscroll=True)
        assert html_component_scroll.autoscroll is True

    def test_in_interface(self):
        """
        Interface, process
        """

        def bold_text(text):
            return f"<strong>{text}</strong>"

        iface = gr.Interface(bold_text, "text", "html")
        assert iface("test") == "<strong>test</strong>"
