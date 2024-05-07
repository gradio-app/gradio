import pytest

import gradio as gr


class TestTextbox:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, tokenize, get_config
        """
        text_input = gr.Textbox()
        assert text_input.preprocess("Hello World!") == "Hello World!"
        assert text_input.postprocess("Hello World!") == "Hello World!"
        assert text_input.postprocess(None) is None
        assert text_input.postprocess("Ali") == "Ali"
        assert text_input.postprocess(2) == "2"
        assert text_input.postprocess(2.14) == "2.14"
        assert text_input.get_config() == {
            "lines": 1,
            "max_lines": 20,
            "placeholder": None,
            "value": None,
            "name": "textbox",
            "show_copy_button": False,
            "show_label": True,
            "type": "text",
            "label": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "rtl": False,
            "text_align": None,
            "autofocus": False,
            "_selectable": False,
            "key": None,
            "info": None,
            "autoscroll": True,
        }

    @pytest.mark.asyncio
    async def test_in_interface_as_input(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x[::-1], "textbox", "textbox")
        assert iface("Hello") == "olleH"

    def test_in_interface_as_output(self):
        """
        Interface, process

        """
        iface = gr.Interface(lambda x: x[-1], "textbox", gr.Textbox())
        assert iface("Hello") == "o"
        iface = gr.Interface(lambda x: x / 2, "number", gr.Textbox())
        assert iface(10) == "5.0"

    def test_static(self):
        """
        postprocess
        """
        component = gr.Textbox("abc")
        assert component.get_config().get("value") == "abc"

    def test_override_template(self):
        """
        override template
        """
        component = gr.TextArea(value="abc")
        assert component.get_config().get("value") == "abc"
        assert component.get_config().get("lines") == 7
        component = gr.TextArea(value="abc", lines=4)
        assert component.get_config().get("value") == "abc"
        assert component.get_config().get("lines") == 4

    def test_faulty_type(self):
        with pytest.raises(
            ValueError, match='`type` must be one of "text", "password", or "email".'
        ):
            gr.Textbox(type="boo")

    def test_max_lines(self):
        assert gr.Textbox(type="password").get_config().get("max_lines") == 1
        assert gr.Textbox(type="email").get_config().get("max_lines") == 1
        assert gr.Textbox(type="text").get_config().get("max_lines") == 20
        assert gr.Textbox().get_config().get("max_lines") == 20
