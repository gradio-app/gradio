# Custom Buttons

Many Gradio components support custom buttons in their toolbar, allowing you to add interactive buttons that can trigger Python functions, JavaScript functions, or both. Custom buttons appear alongside built-in buttons (like "copy" or "download") in the component's toolbar.

## Basic Usage

To add custom buttons to a component, pass a list of `gr.Button()` instances to the `buttons` parameter:

```python
import gradio as gr

refresh_btn = gr.Button("Refresh", variant="secondary", size="sm")
clear_btn = gr.Button("Clear", variant="secondary", size="sm")

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

$code_textbox_custom_buttons


## Notes

- Custom buttons appear in the component's toolbar, typically in the top-right corner
- Only the `value` of the Button is used, other attributes like `icon` are not used.
- Buttons are rendered in the order they appear in the `buttons` list
- Built-in buttons (like "copy", "download") can be hidden by omitting them from the list
- Custom buttons work with component events in the same way as as regular buttons
