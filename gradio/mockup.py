"""
Gradio Mockup Parser Module

This module provides functionality to parse ASCII art representations of Gradio UI components
and convert them into structured data that can be used to generate HTML mockups.

Classes:
    MockupParser: Main parser class for converting ASCII art to structured layout data.

Example:
    >>> ascii_art = '''
    ... [textbox] "Name"
    ... [button] "Submit"
    ... '''
    >>> parser = MockupParser()
    >>> result = parser.parse(ascii_art)
    >>> print(result)
    {'layout': [{'type': 'textbox', 'label': 'Name', 'lines': 1}, {'type': 'button', 'label': 'Submit'}]}
"""

import re


class MockupParser:
    """
    Parser class for converting ASCII art UI descriptions into structured layout data.
    
    This class provides methods to parse ASCII art representations of Gradio components
    and convert them into a structured format that can be used to generate HTML mockups.
    
    Attributes:
        ASCII_COMPONENTS (dict): Dictionary mapping component types to their regex patterns.
        
    Supported Components:
        - textbox: Single or multiline text input
        - slider: Range slider with min/max values
        - button: Clickable button
        - checkbox: Boolean checkbox input
        - row: Horizontal container layout
        - column: Vertical container layout
        
    Example:
        >>> ascii_art = '[textbox] "Name"\\n[button] "Submit"'
        >>> result = MockupParser.parse(ascii_art)
        >>> print(result['layout'])
        [{'type': 'textbox', 'label': 'Name', 'lines': 1}, {'type': 'button', 'label': 'Submit'}]
    """
    
    ASCII_COMPONENTS = {
        "textbox": r'\[textbox(:\d+)?\]\s+"([^"]*)"',
        "slider": r'\[slider\]\s+"([^"]*)"\s+min=(\d+)\s+max=(\d+)',
        "button": r'\[button\]\s+"([^"]*)"',
        "checkbox": r'\[checkbox\]\s+"([^"]*)"',
        "row": r'\[row\]',
        "column": r'\[column\]'
    }

    @staticmethod
    def parse(ascii_str: str) -> dict:
        """
        Parse ASCII art string into structured layout data.
        
        This method processes an ASCII art string containing Gradio component definitions
        and converts them into a structured dictionary format that can be used to generate
        HTML mockups.
        
        Args:
            ascii_str (str): ASCII art string containing component definitions.
                           Should use the format: [component_type] "label" [options]
                           
        Returns:
            dict: Dictionary containing a 'layout' key with a list of parsed components.
                  Each component is a dictionary with 'type' and component-specific properties.
                  
        Example:
            >>> ascii_art = '[textbox] "Name"\\n[button] "Submit"'
            >>> result = MockupParser.parse(ascii_art)
            >>> print(result)
            {'layout': [{'type': 'textbox', 'label': 'Name', 'lines': 1}, {'type': 'button', 'label': 'Submit'}]}
            
        Supported syntax:
            - [textbox] "label" - Single line text input
            - [textbox:N] "label" - Multi-line text input (N lines)
            - [slider] "label" min=X max=Y - Range slider
            - [button] "label" - Button component
            - [checkbox] "label" - Checkbox component
            - [row] - Horizontal container (subsequent components are added to this row)
            - [column] - Vertical container (subsequent components are added to this column)
        """
        lines = ascii_str.strip().split('\n')
        elements = []
        container_stack = []  # Stack to handle nested containers
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check for container starts
            if re.match(MockupParser.ASCII_COMPONENTS["row"], line):
                container = {"type": "row", "elements": []}
                if container_stack:
                    container_stack[-1]["elements"].append(container)
                else:
                    elements.append(container)
                container_stack.append(container)
            elif re.match(MockupParser.ASCII_COMPONENTS["column"], line):
                container = {"type": "column", "elements": []}
                if container_stack:
                    container_stack[-1]["elements"].append(container)
                else:
                    elements.append(container)
                container_stack.append(container)
                
            # Check components
            else:
                component = None
                for comp_type, pattern in MockupParser.ASCII_COMPONENTS.items():
                    if comp_type in ["row", "column"]:
                        continue
                    match = re.match(pattern, line)
                    if match:
                        if comp_type == "textbox":
                            component = {
                                "type": "textbox",
                                "label": match.group(2),
                                "lines": int(match.group(1)[1:]) if match.group(1) else 1
                            }
                        elif comp_type == "slider":
                            component = {
                                "type": "slider",
                                "label": match.group(1),
                                "min": int(match.group(2)),
                                "max": int(match.group(3))
                            }
                        else:
                            component = {"type": comp_type, "label": match.group(1)}
                        break
                
                if component:
                    # Add component to current container first
                    if container_stack:
                        container_stack[-1]["elements"].append(component)
                    else:
                        elements.append(component)
                    
                    # Then check if we need to exit containers for specific buttons
                    if (component["type"] == "button" and 
                        len(container_stack) > 1 and  # Only exit if we're in nested containers
                        component["label"].lower() in ["submit", "create task", "save form", "send message"]):
                        # Remove the button from the container and add it to top level
                        container_stack[-1]["elements"].pop()  # Remove button from container
                        container_stack.clear()  # Clear all containers
                        elements.append(component)  # Add button to top level
        
        return {"layout": elements}
