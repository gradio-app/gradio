# Custom Buttons

Many Gradio components support custom buttons in their toolbar, allowing you to add interactive buttons that can trigger Python functions, JavaScript functions, or both. Custom buttons appear alongside built-in buttons (like "copy" or "download") in the component's toolbar.

## Supported Components

Custom buttons are available on many Gradio components, including:

- **Input components**: `Textbox`, `Code`, `Number`, `Checkbox`, `CheckboxGroup`, `Radio`, `Dropdown`, `DateTime`, `File`, `FileExplorer`
- **Output components**: `Label`, `HighlightedText`, `HTML`, `Plot`, `Model3D`, `Video`, `Audio`, `Image`, `Gallery`, and more

## Basic Usage

To add custom buttons to a component, pass a list of `gr.Button()` instances to the `buttons` parameter:

```python
import gradio as gr

# Create custom buttons
refresh_btn = gr.Button("Refresh", variant="secondary", size="sm")
clear_btn = gr.Button("Clear", variant="secondary", size="sm")

# Add them to a component
textbox = gr.Textbox(
    value="Sample text",
    label="Text Input",
    buttons=[refresh_btn, clear_btn]
)
```

You can also mix built-in buttons (as strings) with custom buttons:

```python
code = gr.Code(
    value="print('Hello')",
    language="python",
    buttons=["copy", "download", refresh_btn, export_btn]
)
```

## Connecting Button Events

Custom buttons work just like regular `gr.Button` components. You can connect them to Python functions or JavaScript functions using the `.click()` method:

### Python Functions

```python
def refresh_data():
    import random
    return f"Refreshed: {random.randint(1000, 9999)}"

refresh_btn.click(refresh_data, outputs=textbox)
```

### JavaScript Functions

```python
clear_btn.click(
    None,
    inputs=[],
    outputs=textbox,
    js="() => ''"
)
```

### Combined Python and JavaScript

You can use the same button for both Python and JavaScript logic:

```python
alert_btn.click(
    None,
    inputs=textbox,
    outputs=[],
    js="(text) => { alert('Text: ' + text); return []; }"
)
```

## Complete Example

Here's a complete example showing custom buttons with both Python and JavaScript functions:

```python
import gradio as gr

def export_data(text):
    print("Exporting data:", text)
    return "Data exported to server!"

def refresh_data():
    import random
    return f"Refreshed content: {random.randint(1000, 9999)}"

with gr.Blocks() as demo:
    gr.Markdown("# Custom Buttons Demo")
    
    # Create custom buttons
    refresh_btn = gr.Button("Refresh", variant="secondary", size="sm")
    alert_btn = gr.Button("⚠️ Alert", variant="secondary", size="sm")
    clear_btn = gr.Button("🗑️ Clear", variant="secondary", size="sm")
    
    # Add buttons to textbox
    textbox = gr.Textbox(
        value="Sample text content that can be exported, refreshed, or cleared.",
        buttons=["copy", refresh_btn, alert_btn, clear_btn],
        label="Text Input",
        lines=5
    )
    
    # Connect Python function
    refresh_btn.click(refresh_data, outputs=textbox)
    
    # Connect JavaScript function
    alert_btn.click(
        None,
        inputs=textbox,
        outputs=[],
        js="(text) => { alert('This is a JavaScript alert!\\n\\nTextbox content: ' + text); return []; }"
    )
    
    # Connect JavaScript function to clear
    clear_btn.click(
        None,
        inputs=[],
        outputs=textbox,
        js="() => ''"
    )

demo.launch()
```

## Button Styling

Custom buttons support all the same styling options as regular `gr.Button` components:

- `variant`: "primary", "secondary", "stop"
- `size`: "sm", "lg"
- `icon`: Add an icon to the button
- `visible`: Control button visibility
- `interactive`: Enable/disable the button

```python
custom_btn = gr.Button(
    "Custom Action",
    variant="secondary",
    size="sm",
    icon="⚙️"
)
```

## Tips

- Custom buttons appear in the component's toolbar, typically in the top-right corner
- Buttons are rendered in the order they appear in the `buttons` list
- Built-in buttons (like "copy", "download") can be hidden by omitting them from the list
- Custom buttons work seamlessly with component events and can access component values through their click handlers

