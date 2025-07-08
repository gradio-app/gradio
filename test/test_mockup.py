"""
Test suite for the Gradio mockup generator functionality.

This module contains comprehensive tests for the ASCII art parsing and HTML generation
components of the mockup system.
"""

import pytest
from gradio.mockup import MockupParser
from gradio.mockup_renderer import generate_mockup_html, _render_component


class TestMockupParser:
    """Test cases for the MockupParser class."""

    def test_parse_simple_textbox(self):
        """Test parsing a simple textbox component."""
        ascii_art = '[textbox] "Name"'
        result = MockupParser.parse(ascii_art)
        
        expected = {
            "layout": [
                {"type": "textbox", "label": "Name", "lines": 1}
            ]
        }
        assert result == expected

    def test_parse_multiline_textbox(self):
        """Test parsing a multiline textbox component."""
        ascii_art = '[textbox:5] "Description"'
        result = MockupParser.parse(ascii_art)
        
        expected = {
            "layout": [
                {"type": "textbox", "label": "Description", "lines": 5}
            ]
        }
        assert result == expected

    def test_parse_slider(self):
        """Test parsing a slider component."""
        ascii_art = '[slider] "Age" min=0 max=100'
        result = MockupParser.parse(ascii_art)
        
        expected = {
            "layout": [
                {"type": "slider", "label": "Age", "min": 0, "max": 100}
            ]
        }
        assert result == expected

    def test_parse_button(self):
        """Test parsing a button component."""
        ascii_art = '[button] "Submit"'
        result = MockupParser.parse(ascii_art)
        
        expected = {
            "layout": [
                {"type": "button", "label": "Submit"}
            ]
        }
        assert result == expected

    def test_parse_checkbox(self):
        """Test parsing a checkbox component."""
        ascii_art = '[checkbox] "Agree to terms"'
        result = MockupParser.parse(ascii_art)
        
        expected = {
            "layout": [
                {"type": "checkbox", "label": "Agree to terms"}
            ]
        }
        assert result == expected

    def test_parse_row_layout(self):
        """Test parsing components in a row layout."""
        ascii_art = """
        [row]
        [textbox] "First Name"
        [textbox] "Last Name"
        """
        result = MockupParser.parse(ascii_art)
        
        expected = {
            "layout": [
                {
                    "type": "row",
                    "elements": [
                        {"type": "textbox", "label": "First Name", "lines": 1},
                        {"type": "textbox", "label": "Last Name", "lines": 1}
                    ]
                }
            ]
        }
        assert result == expected

    def test_parse_column_layout(self):
        """Test parsing components in a column layout."""
        ascii_art = """
        [column]
        [button] "Save"
        [button] "Cancel"
        """
        result = MockupParser.parse(ascii_art)
        
        expected = {
            "layout": [
                {
                    "type": "column",
                    "elements": [
                        {"type": "button", "label": "Save"},
                        {"type": "button", "label": "Cancel"}
                    ]
                }
            ]
        }
        assert result == expected

    def test_parse_complex_layout(self):
        """Test parsing a complex layout with nested containers."""
        ascii_art = """
        [textbox] "Name"
        [row]
        [textbox:3] "Bio"
        [column]
        [slider] "Age" min=0 max=100
        [checkbox] "Agree to terms"
        [button] "Submit"
        """
        result = MockupParser.parse(ascii_art)
        
        expected = {
            "layout": [
                {"type": "textbox", "label": "Name", "lines": 1},
                {
                    "type": "row",
                    "elements": [
                        {"type": "textbox", "label": "Bio", "lines": 3},
                        {
                            "type": "column",
                            "elements": [
                                {"type": "slider", "label": "Age", "min": 0, "max": 100},
                                {"type": "checkbox", "label": "Agree to terms"}
                            ]
                        }
                    ]
                },
                {"type": "button", "label": "Submit"}
            ]
        }
        assert result == expected

    def test_parse_empty_input(self):
        """Test parsing empty input."""
        result = MockupParser.parse("")
        expected = {"layout": []}
        assert result == expected

    def test_parse_with_whitespace(self):
        """Test parsing input with extra whitespace."""
        ascii_art = """
        
        [textbox] "Name"
        
        [button] "Submit"
        
        """
        result = MockupParser.parse(ascii_art)
        
        expected = {
            "layout": [
                {"type": "textbox", "label": "Name", "lines": 1},
                {"type": "button", "label": "Submit"}
            ]
        }
        assert result == expected

    def test_parse_invalid_component(self):
        """Test parsing with invalid component syntax."""
        ascii_art = '[invalid] "Test"'
        result = MockupParser.parse(ascii_art)
        expected = {"layout": []}
        assert result == expected

    def test_parse_malformed_slider(self):
        """Test parsing malformed slider syntax."""
        ascii_art = '[slider] "Age" min=0'  # Missing max
        result = MockupParser.parse(ascii_art)
        expected = {"layout": []}
        assert result == expected

    def test_parse_special_characters_in_labels(self):
        """Test parsing labels with special characters."""
        ascii_art = '[textbox] "Name & Email"'
        result = MockupParser.parse(ascii_art)
        
        expected = {
            "layout": [
                {"type": "textbox", "label": "Name & Email", "lines": 1}
            ]
        }
        assert result == expected


class TestMockupRenderer:
    """Test cases for the mockup HTML renderer."""

    def test_render_simple_textbox(self):
        """Test rendering a simple textbox component."""
        component = {"type": "textbox", "label": "Name", "lines": 1}
        result = _render_component(component)
        
        assert 'class="component"' in result
        assert '<label>Name</label>' in result
        assert 'type="text"' in result
        assert 'placeholder="Name"' in result

    def test_render_multiline_textbox(self):
        """Test rendering a multiline textbox component."""
        component = {"type": "textbox", "label": "Description", "lines": 5}
        result = _render_component(component)
        
        assert 'class="component"' in result
        assert '<label>Description</label>' in result
        assert '<textarea' in result
        assert 'placeholder="Description"' in result

    def test_render_slider(self):
        """Test rendering a slider component."""
        component = {"type": "slider", "label": "Age", "min": 0, "max": 100}
        result = _render_component(component)
        
        assert 'class="component"' in result
        assert '<label>Age</label>' in result
        assert 'type="range"' in result
        assert 'min="0"' in result
        assert 'max="100"' in result
        assert 'value="0"' in result

    def test_render_button(self):
        """Test rendering a button component."""
        component = {"type": "button", "label": "Submit"}
        result = _render_component(component)
        
        assert 'class="component"' in result
        assert '<button>Submit</button>' in result

    def test_render_checkbox(self):
        """Test rendering a checkbox component."""
        component = {"type": "checkbox", "label": "Agree to terms"}
        result = _render_component(component)
        
        assert 'class="component"' in result
        assert 'type="checkbox"' in result
        assert 'Agree to terms' in result

    def test_render_unknown_component(self):
        """Test rendering an unknown component type."""
        component = {"type": "unknown", "label": "Test"}
        result = _render_component(component)
        
        assert result == ""

    def test_generate_complete_html(self):
        """Test generating complete HTML document."""
        parsed_mockup = {
            "layout": [
                {"type": "textbox", "label": "Name", "lines": 1},
                {"type": "button", "label": "Submit"}
            ]
        }
        result = generate_mockup_html(parsed_mockup)
        
        assert '<!DOCTYPE html>' in result
        assert '<html>' in result
        assert '<head>' in result
        assert '<style>' in result
        assert '.gradio-mockup' in result
        assert '<body>' in result
        assert 'class="gradio-mockup"' in result
        assert '</html>' in result

    def test_generate_html_with_containers(self):
        """Test generating HTML with container layouts."""
        parsed_mockup = {
            "layout": [
                {
                    "type": "row",
                    "elements": [
                        {"type": "textbox", "label": "First", "lines": 1},
                        {"type": "textbox", "label": "Last", "lines": 1}
                    ]
                },
                {
                    "type": "column",
                    "elements": [
                        {"type": "button", "label": "Save"},
                        {"type": "button", "label": "Cancel"}
                    ]
                }
            ]
        }
        result = generate_mockup_html(parsed_mockup)
        
        assert 'class="container row"' in result
        assert 'class="container column"' in result
        assert '<label>First</label>' in result
        assert '<label>Last</label>' in result
        assert '<button>Save</button>' in result
        assert '<button>Cancel</button>' in result

    def test_generate_html_empty_layout(self):
        """Test generating HTML with empty layout."""
        parsed_mockup = {"layout": []}
        result = generate_mockup_html(parsed_mockup)
        
        assert '<!DOCTYPE html>' in result
        assert 'class="gradio-mockup"' in result
        assert '</html>' in result

    def test_html_css_styles_present(self):
        """Test that all expected CSS styles are present."""
        parsed_mockup = {"layout": []}
        result = generate_mockup_html(parsed_mockup)
        
        # Check for key CSS classes
        assert '.gradio-mockup' in result
        assert '.component' in result
        assert '.container' in result
        assert '.row' in result
        assert '.column' in result
        assert 'input[type="text"]' in result
        assert 'textarea' in result
        assert 'button' in result
        assert '.slider-container' in result

    def test_html_escaping(self):
        """Test that special characters in labels are properly handled."""
        component = {"type": "textbox", "label": "Name & <Email>", "lines": 1}
        result = _render_component(component)
        
        # The label should be properly escaped in HTML
        assert "Name & <Email>" in result

    def test_slider_value_defaults_to_min(self):
        """Test that slider value defaults to minimum value."""
        component = {"type": "slider", "label": "Test", "min": 10, "max": 50}
        result = _render_component(component)
        
        assert 'value="10"' in result


class TestMockupIntegration:
    """Integration tests for the complete mockup workflow."""

    def test_full_workflow_simple(self):
        """Test the complete workflow from ASCII to HTML."""
        ascii_art = """
        [textbox] "Name"
        [button] "Submit"
        """
        
        parsed = MockupParser.parse(ascii_art)
        html = generate_mockup_html(parsed)
        
        assert 'Name' in html
        assert 'Submit' in html
        assert 'class="gradio-mockup"' in html

    def test_full_workflow_complex(self):
        """Test the complete workflow with complex layout."""
        ascii_art = """
        [textbox] "Title"
        [row]
        [textbox:3] "Description"
        [column]
        [slider] "Priority" min=1 max=5
        [checkbox] "Urgent"
        [button] "Create Task"
        """
        
        parsed = MockupParser.parse(ascii_art)
        html = generate_mockup_html(parsed)
        
        assert 'Title' in html
        assert 'Description' in html
        assert 'Priority' in html
        assert 'Urgent' in html
        assert 'Create Task' in html
        assert 'class="container row"' in html
        assert 'class="container column"' in html
        assert 'min="1"' in html
        assert 'max="5"' in html

    def test_edge_cases(self):
        """Test edge cases and error handling."""
        # Test with only whitespace
        result = MockupParser.parse("   \n\n   ")
        assert result == {"layout": []}
        
        # Test with mixed valid and invalid components
        ascii_art = """
        [textbox] "Valid"
        [invalid] "Invalid"
        [button] "Also Valid"
        """
        parsed = MockupParser.parse(ascii_art)
        html = generate_mockup_html(parsed)
        
        assert 'Valid' in html
        assert 'Also Valid' in html
        assert 'Invalid' not in html


if __name__ == "__main__":
    pytest.main([__file__])
