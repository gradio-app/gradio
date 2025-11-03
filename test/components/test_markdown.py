import gradio as gr


class TestMarkdown:
    def test_component_functions(self):
        markdown_component = gr.Markdown("# Let's learn about $x$", label="Markdown")
        assert markdown_component.get_config()["value"] == "# Let's learn about $x$"
        assert not markdown_component.get_config()["buttons"]

    def test_in_interface(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x, "text", "markdown")
        input_data = "    Here's an [image](https://gradio.app/images/gradio_logo.png)"
        output_data = iface(input_data)
        assert output_data == input_data.strip()

    def test_show_copy_button(self):
        markdown_component = gr.Markdown("# Let's learn about $x$", buttons=["copy"])
        assert markdown_component.get_config()["buttons"] == ["copy"]
