"""
CLI command for generating UI mockups from ASCII art in source files.

This module provides a command-line interface for the Gradio mockup generator,
allowing developers to generate HTML mockups from ASCII art embedded in their
source code files.

Usage:
    gradio mockup <file_path>

The command looks for ASCII art between special comment markers:
    # GRADIO MOCKUP START
    [textbox] "Name"
    [button] "Submit"
    # GRADIO MOCKUP END

Functions:
    mockup: Main CLI command function that processes files and generates mockups.
"""

import re
import typer

from gradio.mockup import MockupParser
from gradio.mockup_renderer import generate_mockup_html


def mockup(file_path: str):
    """
    Generate UI mockup from ASCII art in source file.
    
    This function reads a source file, extracts ASCII art between special comment
    markers, parses it into component data, and generates an HTML mockup file.
    
    Args:
        file_path (str): Path to the source file containing ASCII art mockup definition.
                        The file should contain ASCII art between the markers:
                        # GRADIO MOCKUP START
                        ... ASCII art here ...
                        # GRADIO MOCKUP END
    
    Output:
        Creates a file named 'mockup_preview.html' in the current directory
        containing the generated mockup with embedded CSS styling.
        
    Example:
        >>> # In your source file (app.py):
        >>> # GRADIO MOCKUP START
        >>> # [textbox] "Name"
        >>> # [button] "Submit"
        >>> # GRADIO MOCKUP END
        >>> 
        >>> # Then run: gradio mockup app.py
        >>> # This creates mockup_preview.html
    """
    with open(file_path) as f:
        content = f.read()

    ascii_art = re.search(r"# GRADIO MOCKUP START(.*?)# GRADIO MOCKUP END", content, re.DOTALL)
    if not ascii_art:
        print("No valid mockup found in file")
        return

    parsed = MockupParser.parse(ascii_art.group(1).strip())
    html = generate_mockup_html(parsed)

    output_file = "mockup_preview.html"
    with open(output_file, "w") as f:
        f.write(html)

    print(f"Mockup generated: {output_file}")


app = typer.Typer()
app.command()(mockup)
