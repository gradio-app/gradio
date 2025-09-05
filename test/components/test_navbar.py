import pytest

import gradio as gr


class TestNavbar:
    def test_component_functions(self):
        """
        Test get_config
        """
        navbar_component = gr.Navbar(visible=True, home_page_title="My App")
        config = navbar_component.get_config()

        assert config["visible"] == True
        assert config["elem_id"] is None
        assert config["elem_classes"] == []
        assert config["name"] == "navbar"
        assert config["_selectable"] == False
        assert config["key"] is None
        assert config["value"] == {"visible": True, "home_page_title": "My App"}

    def test_component_functions_defaults(self):
        """
        Test get_config with default values
        """
        navbar_component = gr.Navbar()
        config = navbar_component.get_config()

        assert config["visible"] == True
        assert config["value"] == {"visible": True, "home_page_title": "Home"}

    def test_preprocess(self):
        """
        Test preprocess method
        """
        navbar_component = gr.Navbar()
        assert navbar_component.preprocess(
            {"visible": False, "home_page_title": "Test"}
        ) == {"visible": False, "home_page_title": "Test"}
        assert navbar_component.preprocess(None) is None

    def test_postprocess(self):
        """
        Test postprocess method
        """
        navbar_component = gr.Navbar()
        assert navbar_component.postprocess(
            {"visible": True, "home_page_title": "Custom"}
        ) == {"visible": True, "home_page_title": "Custom"}
        assert navbar_component.postprocess(None) == {
            "visible": True,
            "home_page_title": "Home",
        }

    def test_single_navbar_validation(self):
        """
        Test that only one Navbar component can exist in a Blocks app
        """
        # Test valid case - single navbar
        with gr.Blocks() as demo:
            navbar = gr.Navbar(visible=True, home_page_title="My App")
            gr.Textbox(label="Content")

        # Should not raise an error during launch validation
        try:
            demo.validate_navbar_settings()
        except ValueError:
            pytest.fail("Single navbar should not raise validation error")

        # Test invalid case - multiple navbars
        with gr.Blocks() as demo:
            navbar1 = gr.Navbar(visible=True, home_page_title="App 1")
            navbar2 = gr.Navbar(visible=False, home_page_title="App 2")
            gr.Textbox(label="Content")

        # Should raise an error during launch validation
        with pytest.raises(
            ValueError, match="Only one gr.Navbar component can exist per Blocks app"
        ):
            demo.validate_navbar_settings()

    def test_navbar_config_integration(self):
        """
        Test that navbar config is properly integrated into Blocks config
        """
        with gr.Blocks() as demo:
            navbar = gr.Navbar(visible=False, home_page_title="Custom Home")
            gr.Textbox(label="Content")

        navbar_config = demo.get_navbar_config()
        assert navbar_config is not None
        assert navbar_config["visible"] == False
        assert navbar_config["home_page_title"] == "Custom Home"

    def test_no_navbar_config_integration(self):
        """
        Test that navbar config is None when no Navbar component exists
        """
        with gr.Blocks() as demo:
            gr.Textbox(label="Content")

        navbar_config = demo.get_navbar_config()
        assert navbar_config is None
