#!/usr/bin/env python3
"""
Gradio Mockup Generator Showcase

This application demonstrates the Gradio mockup generator functionality.
Users can input ASCII art and see the generated HTML mockup in real-time.
"""

import gradio as gr
import tempfile
import os
from gradio.mockup import MockupParser
from gradio.mockup_renderer import generate_mockup_html


def generate_mockup_from_ascii(ascii_art: str):
    """
    Generate HTML mockup from ASCII art input.
    
    Args:
        ascii_art: ASCII art string containing component definitions
        
    Returns:
        Tuple of (html_output, status_message)
    """
    if not ascii_art.strip():
        return "", "⚠️ Please enter some ASCII art"
    
    try:
        # Parse the ASCII art
        parsed = MockupParser.parse(ascii_art)
        
        # Generate HTML
        html = generate_mockup_html(parsed)
        
        return html, f"✅ Mockup generated successfully! Found {len(parsed['layout'])} components."
        
    except Exception as e:
        return "", f"❌ Error generating mockup: {str(e)}"


def save_mockup_to_file(html_content: str) -> str:
    """
    Save HTML mockup to a temporary file and return the file path.
    
    Args:
        html_content: HTML content to save
        
    Returns:
        File path of the saved HTML file
    """
    if not html_content.strip():
        return "No mockup to save"
    
    try:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
            f.write(html_content)
            temp_path = f.name
        
        return f"✅ Mockup saved to: {temp_path}"
        
    except Exception as e:
        return f"❌ Error saving mockup: {str(e)}"


# Example ASCII art for demonstration
EXAMPLE_ASCII = """[textbox] "Name"
[row]
  [textbox:3] "Bio"
  [column]
    [slider] "Age" min=0 max=100
    [checkbox] "Agree to terms"
[button] "Submit"
"""

SIMPLE_EXAMPLE = """[textbox] "Enter your message"
[button] "Send"
"""

COMPLEX_EXAMPLE = """[textbox] "Title"
[row]
  [textbox:5] "Description"
  [column]
    [slider] "Priority" min=1 max=5
    [checkbox] "Urgent"
    [checkbox] "Public"
[row]
  [button] "Save Draft"
  [button] "Publish"
"""


def load_example(example_name: str) -> str:
    """Load example ASCII art based on selection."""
    examples = {
        "Simple Form": SIMPLE_EXAMPLE,
        "Basic Form": EXAMPLE_ASCII,
        "Complex Layout": COMPLEX_EXAMPLE
    }
    return examples.get(example_name, SIMPLE_EXAMPLE)


# Create the Gradio interface
with gr.Blocks(
    title="Gradio Mockup Generator",
    theme=gr.themes.Soft(),
    css="""
    .mockup-container {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        background: #f9f9f9;
    }
    .example-button {
        margin: 5px;
    }
    """
) as demo:
    
    gr.Markdown(
        """
        # 🎨 Gradio Mockup Generator
        
        Create beautiful UI mockups from ASCII art! This tool helps you visualize Gradio layouts
        before implementing them in code.
        
        ## 📝 Supported Components:
        - `[textbox] "label"` - Single line text input
        - `[textbox:N] "label"` - Multi-line text input (N lines)
        - `[slider] "label" min=X max=Y` - Range slider
        - `[button] "label"` - Button component
        - `[checkbox] "label"` - Checkbox component
        - `[row]` - Horizontal container
        - `[column]` - Vertical container
        """
    )
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### 🎯 Examples")
            
            example_dropdown = gr.Dropdown(
                choices=["Simple Form", "Basic Form", "Complex Layout"],
                value="Basic Form",
                label="Load Example",
                interactive=True
            )
            
            with gr.Row():
                load_btn = gr.Button("📋 Load Example", variant="secondary", size="sm")
                clear_btn = gr.Button("🗑️ Clear", variant="secondary", size="sm")
            
            ascii_input = gr.Textbox(
                value=EXAMPLE_ASCII,
                label="ASCII Art Input",
                placeholder="Enter your ASCII art here...",
                lines=15,
                max_lines=30,
                info="Use the syntax shown above to create your mockup"
            )
            
            with gr.Row():
                generate_btn = gr.Button("🚀 Generate Mockup", variant="primary", size="lg")
                save_btn = gr.Button("💾 Save HTML", variant="secondary", size="sm")
        
        with gr.Column(scale=1):
            gr.Markdown("### 🔍 Preview")
            
            status_output = gr.Textbox(
                label="Status",
                value="Ready to generate mockup...",
                interactive=False,
                lines=1
            )
            
            html_output = gr.HTML(
                label="Generated Mockup",
                value="<div class='mockup-container'>Your mockup will appear here...</div>"
            )
            
            save_status = gr.Textbox(
                label="Save Status",
                visible=False,
                interactive=False
            )
    
    # Advanced options
    with gr.Accordion("⚙️ Advanced Options", open=False):
        gr.Markdown(
            """
            ### 💡 Tips:
            - Use indentation to show nesting (though it's not required)
            - Containers group subsequent components until a new container starts
            - Buttons with names like "Submit", "Create Task" automatically move to top level
            - Empty lines are ignored
            
            ### 🔧 ASCII Art Syntax:
            ```
            [textbox] "Name"           # Single line text input
            [textbox:3] "Bio"          # 3-line text area
            [slider] "Age" min=0 max=100  # Range slider
            [button] "Submit"          # Button
            [checkbox] "Agree"         # Checkbox
            [row]                      # Start horizontal container
            [column]                   # Start vertical container
            ```
            """
        )
    
    # Event handlers
    def on_generate(ascii_art):
        html, status = generate_mockup_from_ascii(ascii_art)
        return html, status
    
    def on_save(html_content):
        if html_content and html_content.strip():
            save_result = save_mockup_to_file(html_content)
            return gr.update(visible=True, value=save_result)
        return gr.update(visible=True, value="No mockup to save")
    
    def on_load_example(example_name):
        return load_example(example_name)
    
    def on_clear():
        return "", "<div class='mockup-container'>Your mockup will appear here...</div>", "Ready to generate mockup..."
    
    # Wire up events
    generate_btn.click(
        fn=on_generate,
        inputs=[ascii_input],
        outputs=[html_output, status_output]
    )
    
    save_btn.click(
        fn=on_save,
        inputs=[html_output],
        outputs=[save_status]
    )
    
    load_btn.click(
        fn=on_load_example,
        inputs=[example_dropdown],
        outputs=[ascii_input]
    )
    
    clear_btn.click(
        fn=on_clear,
        outputs=[ascii_input, html_output, status_output]
    )
    
    # Auto-generate on text change (with debouncing)
    ascii_input.change(
        fn=on_generate,
        inputs=[ascii_input],
        outputs=[html_output, status_output]
    )
    
    # Footer
    gr.Markdown(
        """
        ---
        
        ### 🚀 Usage in Your Projects:
        
        1. **In your source file**, add ASCII art between special markers:
        ```python
        # GRADIO MOCKUP START
        # [textbox] "Name"
        # [button] "Submit"
        # GRADIO MOCKUP END
        ```
        
        2. **Generate mockup** using the CLI:
        ```bash
        gradio mockup your_file.py
        ```
        
        3. **Open `mockup_preview.html`** to see your mockup!
        
        ---
        
        Built with ❤️ using Gradio
        """
    )


if __name__ == "__main__":
    demo.launch(
        share=False,
        server_name="0.0.0.0",
        server_port=7860,
        show_error=True
    )
