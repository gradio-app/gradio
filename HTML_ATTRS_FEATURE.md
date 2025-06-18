# HTML Attributes Feature for Textbox Components

This feature adds support for custom HTML attributes to be applied to textbox input and textarea elements in Gradio.

## Overview

The `html_attrs` parameter allows you to pass a dictionary of HTML attributes that will be applied directly to the underlying HTML input or textarea elements. This is particularly useful for:

- Disabling autocorrect and spellcheck
- Adding custom data attributes
- Setting autocomplete behavior
- Adding any other valid HTML attributes

## Implementation

### Python Side

The feature has been implemented in the following components:

1. **Textbox** (`gradio/components/textbox.py`)
2. **SimpleTextbox** (`gradio/_simple_templates/simpletextbox.py`)
3. **MultimodalTextbox** (`gradio/components/multimodal_textbox.py`)
4. **TextArea** template (`gradio/templates.py`)

### Frontend Side

The feature has been implemented in the following Svelte components:

1. **Textbox** (`js/textbox/Index.svelte` and `js/textbox/shared/Textbox.svelte`)
2. **SimpleTextbox** (`js/simpletextbox/Index.svelte`)
3. **MultimodalTextbox** (`js/multimodaltextbox/Index.svelte` and `js/multimodaltextbox/shared/MultimodalTextbox.svelte`)

## Usage

### Basic Example

```python
import gradio as gr

# Disable autocorrect and spellcheck
textbox = gr.Textbox(
    label="No autocorrect",
    html_attrs={"autocorrect": "off", "spellcheck": "false"}
)
```

### Advanced Example

```python
import gradio as gr

# Multiple custom attributes
textbox = gr.Textbox(
    label="Custom attributes",
    html_attrs={
        "autocorrect": "off",
        "spellcheck": "false",
        "autocomplete": "off",
        "data-custom": "example",
        "aria-label": "Custom input field"
    }
)
```

### With MultimodalTextbox

```python
import gradio as gr

multimodal_textbox = gr.MultimodalTextbox(
    label="Multimodal with custom attributes",
    html_attrs={"autocorrect": "off", "spellcheck": "false"}
)
```

## Common Use Cases

### Disable Autocorrect

```python
gr.Textbox(html_attrs={"autocorrect": "off"})
```

### Disable Spellcheck

```python
gr.Textbox(html_attrs={"spellcheck": "false"})
```

### Disable Autocomplete

```python
gr.Textbox(html_attrs={"autocomplete": "off"})
```

### Add Custom Data Attributes

```python
gr.Textbox(html_attrs={"data-testid": "my-textbox", "data-custom": "value"})
```

### Accessibility Attributes

```python
gr.Textbox(html_attrs={"aria-label": "Description", "aria-describedby": "help-text"})
```

## Technical Details

### How it Works

1. The `html_attrs` parameter is passed from Python to the frontend via the component configuration
2. The Svelte components receive the `html_attrs` as a prop
3. The attributes are applied to the HTML elements using the spread operator (`{...html_attrs}`)
4. This allows any valid HTML attribute to be applied to the input/textarea elements

### Supported Components

- `gr.Textbox()` - Standard textbox component
- `gr.SimpleTextbox()` - Simple textbox template
- `gr.MultimodalTextbox()` - Multimodal textbox with file upload support
- `gr.TextArea()` - TextArea template (inherits from Textbox)

### Validation

The feature accepts a dictionary of string key-value pairs:
- Keys must be valid HTML attribute names
- Values must be strings
- The dictionary is optional (defaults to `None`)

## Testing

The feature includes comprehensive tests:

- Unit tests for the Python components
- Integration tests for the frontend components
- Demo application showcasing various use cases

## Related Issue

This implementation addresses [GitHub Issue #10550](https://github.com/gradio-app/gradio/issues/10550) which requested the ability to disable autocorrect in textbox inputs. 