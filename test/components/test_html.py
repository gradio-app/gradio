import gradio as gr


class TestToPublishFormat:
    def test_basic_gr_html(self):
        comp = gr.HTML(
            value="hello",
            label="My Label",
            html_template="<p>${value}</p>",
            css_template="p { color: red; }",
            js_on_load="console.log('hi');",
        )
        result = comp._to_publish_format(
            name="My Widget",
            description="A test widget",
            author="tester",
            tags=["test", "widget"],
        )
        assert result["id"] == "my-widget"
        assert result["name"] == "My Widget"
        assert result["description"] == "A test widget"
        assert result["author"] == "tester"
        assert result["tags"] == ["test", "widget"]
        assert result["html_template"] == "<p>${value}</p>"
        assert result["css_template"] == "p { color: red; }"
        assert result["js_on_load"] == "console.log('hi');"
        assert result["default_props"]["value"] == "hello"
        assert result["default_props"]["label"] == "My Label"
        assert result["head"] == ""
        assert "repo_url" not in result
        assert "python_code" in result

    def test_name_defaults_to_label(self):
        comp = gr.HTML(label="Star Rating")
        result = comp._to_publish_format()
        assert result["name"] == "Star Rating"
        assert result["id"] == "star-rating"

    def test_name_defaults_to_untitled(self):
        comp = gr.HTML()
        result = comp._to_publish_format()
        assert result["name"] == "Untitled Component"
        assert result["id"] == "untitled-component"

    def test_subclass_name_from_class(self):
        class MyFancyWidget(gr.HTML):
            def __init__(self):
                super().__init__(value="test")

        comp = MyFancyWidget()
        result = comp._to_publish_format()
        assert result["name"] == "My Fancy Widget"
        assert result["id"] == "my-fancy-widget"

    def test_subclass_python_code_from_source(self):
        class SimpleWidget(gr.HTML):
            def __init__(self):
                super().__init__(value="x")

        comp = SimpleWidget()
        result = comp._to_publish_format()
        assert "class SimpleWidget" in result["python_code"]

    def test_explicit_name_overrides_class_name(self):
        class MyWidget(gr.HTML):
            def __init__(self):
                super().__init__(value="x")

        comp = MyWidget()
        result = comp._to_publish_format(name="Custom Name")
        assert result["name"] == "Custom Name"
        assert result["id"] == "custom-name"

    def test_tags_default_to_empty_list(self):
        comp = gr.HTML(value="x")
        result = comp._to_publish_format(name="Test")
        assert result["tags"] == []

    def test_repo_url_included_when_provided(self):
        comp = gr.HTML(value="x")
        result = comp._to_publish_format(
            name="Test",
            repo_url="https://github.com/example/repo",
        )
        assert result["repo_url"] == "https://github.com/example/repo"

    def test_repo_url_excluded_when_empty(self):
        comp = gr.HTML(value="x")
        result = comp._to_publish_format(name="Test", repo_url="")
        assert "repo_url" not in result

    def test_head_included(self):
        comp = gr.HTML(value="x")
        result = comp._to_publish_format(
            name="Test",
            head='<script src="https://cdn.example.com/lib.js"></script>',
        )
        assert (
            result["head"] == '<script src="https://cdn.example.com/lib.js"></script>'
        )

    def test_default_props_includes_custom_props(self):
        comp = gr.HTML(
            value="hello",
            html_template="<p>${value} ${color}</p>",
            color="red",
        )
        result = comp._to_publish_format(name="Test")
        assert result["default_props"]["value"] == "hello"
        assert result["default_props"]["color"] == "red"

    def test_none_value_becomes_empty_string(self):
        comp = gr.HTML(value=None)
        result = comp._to_publish_format(name="Test")
        assert result["default_props"]["value"] == ""

    def test_none_js_on_load_becomes_empty_string(self):
        comp = gr.HTML(value="x", js_on_load=None)
        result = comp._to_publish_format(name="Test")
        assert result["js_on_load"] == ""

    def test_id_slugification(self):
        comp = gr.HTML(value="x")
        result = comp._to_publish_format(name="  Hello World!!! ")
        assert result["id"] == "hello-world"

    def test_id_slugification_special_chars(self):
        comp = gr.HTML(value="x")
        result = comp._to_publish_format(name="3D Camera Control")
        assert result["id"] == "3d-camera-control"


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
