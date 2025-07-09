import gradio as gr
from gradio.mockup import MockupParser
from gradio.mockup_renderer import generate_mockup_html
from gradio.playground_examples import PLAYGROUND_EXAMPLES

def get_example_list():
    """Get a list of all available examples"""
    examples = []
    for category, demos in PLAYGROUND_EXAMPLES.items():
        for demo_name in demos:
            examples.append(f"{category} → {demo_name}")
    return examples

def load_example(example_name):
    """Load an example by name"""
    if not example_name or "→" not in example_name:
        return ""
    
    category, demo_name = example_name.split(" → ", 1)
    if category in PLAYGROUND_EXAMPLES and demo_name in PLAYGROUND_EXAMPLES[category]:
        return PLAYGROUND_EXAMPLES[category][demo_name].strip()
    return ""

def generate_mockup(ascii_input, example_selection):
    """Generate HTML mockup from ASCII input"""
    if not ascii_input.strip():
        if example_selection:
            ascii_input = load_example(example_selection)
        else:
            return "<p>Please enter ASCII art or select an example.</p>"
    
    try:
        # Remove comment prefixes if present
        lines = []
        for line in ascii_input.split('\n'):
            line = line.strip()
            if line.startswith('#'):
                line = line[1:].strip()
            if line:
                lines.append(line)
        
        cleaned_ascii = '\n'.join(lines)
        parsed = MockupParser.parse(cleaned_ascii)
        html = generate_mockup_html(parsed)
        return html
    except Exception as e:
        return f"<p style='color: red;'>Error generating mockup: {str(e)}</p>"

# Create custom CSS for the showcase app
custom_css = """
.mockup-preview {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    background: white;
    max-height: 600px;
    overflow-y: auto;
}

.example-section {
    margin: 10px 0;
}

.instructions {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #4CAF50;
}
"""

# Available components documentation
components_doc = """
## Available Components

### Basic Components
- `[textbox] "Label"` - Single line text input
- `[textbox:N] "Label"` - Multi-line text input (N lines)
- `[button] "Label"` - Button component
- `[checkbox] "Label"` - Checkbox component
- `[slider] "Label" min=X max=Y` - Range slider
- `[number] "Label"` - Number input

### Selection Components
- `[dropdown] "Label"` - Dropdown selection
- `[radio] "Label"` - Radio button group
- `[checkboxgroup] "Label"` - Checkbox group

### Media Components
- `[image] "Label"` - Image upload/display
- `[video] "Label"` - Video upload/display
- `[audio] "Label"` - Audio upload/display
- `[file] "Label"` - File upload

### Data Components
- `[dataframe] "Label"` - Data table
- `[plot] "Label"` - Plot/chart display
- `[highlightedtext] "Label"` - Text with highlighting

### Communication Components
- `[chatbot] "Label"` - Chat interface
- `[markdown] "Text content"` - Markdown text

### Layout Components
- `[row]` - Horizontal layout container
- `[column]` - Vertical layout container
- `[tabs]` - Tab container
- `[tab] "Tab Name"` - Individual tab
- `[accordion] "Section Name"` - Collapsible section

### Other Components
- `[html] "Label"` - HTML content
- `[uploadbutton] "Label"` - Upload button
"""

# Example ASCII art for different categories
example_ascii_samples = {
    "Simple Form": """[textbox] "Name"
[textbox] "Email"
[number] "Age"
[button] "Submit"
""",
    
    "Media Interface": """[image] "Upload Image"
[video] "Upload Video"
[audio] "Upload Audio"
[button] "Process Media"
""",
    
    "Complex Layout": """[textbox] "Title"
[row]
  [textbox:3] "Description"
  [column]
    [slider] "Priority" min=1 max=5
    [checkbox] "Urgent"
    [dropdown] "Category"
[button] "Create Task"
""",
    
    "Chat Interface": """[chatbot] "AI Assistant"
[markdown] "Powered by Gradio"
""",
    
    "Data Analysis": """[file] "Upload Dataset"
[dataframe] "Data Preview"
[plot] "Visualization"
[button] "Analyze Data"
""",
    
    "Tabbed Interface": """[tabs]
  [tab] "Input"
    [textbox] "Enter text"
    [button] "Process"
  [tab] "Output"
    [textbox] "Results"
  [tab] "Settings"
    [slider] "Temperature" min=0 max=1
    [checkbox] "Advanced mode"
"""
}

# Create the Gradio interface
with gr.Blocks(css=custom_css, title="Gradio Mockup Generator", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🎨 Gradio Mockup Generator
    
    Create visual mockups of Gradio interfaces using simple ASCII art! This tool helps you prototype 
    and visualize your Gradio app layouts before writing the actual code.
    """)
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### ASCII Art Input", elem_classes=["instructions"])
            
            # Example selection
            with gr.Group():
                gr.Markdown("**Quick Start - Load an Example:**")
                example_dropdown = gr.Dropdown(
                    choices=get_example_list(),
                    label="Select a playground example",
                    value=None,
                    interactive=True
                )
                
                # Or sample examples
                gr.Markdown("**Or try these samples:**")
                sample_dropdown = gr.Dropdown(
                    choices=list(example_ascii_samples.keys()),
                    label="Sample layouts",
                    value=None,
                    interactive=True
                )
            
            # ASCII input area
            ascii_input = gr.Textbox(
                label="ASCII Art",
                placeholder="Enter your ASCII art here or select an example above...",
                lines=15,
                max_lines=25
            )
            
            generate_btn = gr.Button("🎨 Generate Mockup", variant="primary", size="lg")
            
            # Instructions
            with gr.Accordion("📖 Instructions & Components", open=False):
                gr.Markdown(components_doc)
        
        with gr.Column(scale=1):
            gr.Markdown("### Generated Mockup Preview")
            
            mockup_output = gr.HTML(
                value="<p style='text-align: center; color: #666; padding: 40px;'>Your mockup will appear here...</p>",
                elem_classes=["mockup-preview"]
            )
    
    # Event handlers
    def load_playground_example(example_name):
        return load_example(example_name)
    
    def load_sample_example(sample_name):
        if sample_name in example_ascii_samples:
            return example_ascii_samples[sample_name]
        return ""
    
    example_dropdown.change(
        load_playground_example,
        inputs=[example_dropdown],
        outputs=[ascii_input]
    )
    
    sample_dropdown.change(
        load_sample_example,
        inputs=[sample_dropdown],
        outputs=[ascii_input]
    )
    
    generate_btn.click(
        generate_mockup,
        inputs=[ascii_input, example_dropdown],
        outputs=[mockup_output]
    )
    
    # Auto-generate on input change (with debounce)
    ascii_input.change(
        generate_mockup,
        inputs=[ascii_input, example_dropdown],
        outputs=[mockup_output]
    )

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )
