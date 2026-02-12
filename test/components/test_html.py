import gradio as gr


class TestHTML:
    def test_component_functions(self):
        """
        get_config
        """
        html_component = gr.components.HTML("#Welcome onboard", label="HTML Input")
        assert html_component.get_config() == {
            "_retryable": False,
            "_selectable": False,
            "_undoable": False,
            "apply_default_css": True,
            "autoscroll": False,
            "component_class_name": "HTML",
            "container": False,
            "css_template": "",
            "elem_classes": [],
            "elem_id": None,
            "html_template": "${value}",
            "js_on_load": "element.addEventListener('click', function() { trigger('click') });",
            "key": None,
            "label": "HTML Input",
            "likeable": False,
            "max_height": None,
            "min_height": None,
            "name": "html",
            "padding": False,
            "preserved_by_key": [
                "value",
            ],
            "props": {},
            "proxy_url": None,
            "show_label": False,
            "streamable": False,
            "value": "#Welcome onboard",
            "visible": True,
            "buttons": [],
        }

    def test_in_interface(self):
        """
        Interface, process
        """

        def bold_text(text):
            return f"<strong>{text}</strong>"

        iface = gr.Interface(bold_text, "text", "html")
        assert iface("test") == "<strong>test</strong>"
