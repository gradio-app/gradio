# Gradio 6 Migration Guide

We are excited to release Gradio 6, the latest major version of the Gradio library. Gradio 6 is significantly more performant, lighter, and easier to customize than previous versions of Gradio. The Gradio team is only planning on maintaining future versions of Gradio 6 so we encourage all developers to migrate to Gradio 6.x.

Gradio 6 includes several breaking changes that were made in order to standardize the Python API. This migration guide lists the breaking changes and the specific code changes needed in order to migrate. The easiest way to know whether you need to make changes is to upgrade your Gradio app to 5.50 (`pip install --upgrade gradio==5.50`). Gradio 5.50 emits deprecation warnings for any parameters removed in Gradio 6, allowing you to know whether your Gradio app will be compatible with Gradio 6.

Here, we walk through the breaking changes that were introduced in Gradio 6. Code snippets are provided, allowing you to migrate your code easily to Gradio 6. You can also copy-paste this document as Markdown if you are using an LLM to help migrate your code. 

## Breaking Changes

### App-level parameters have been moved from `Blocks` to `launch()`

The `gr.Blocks` class constructor contained several parameters that applied to your entire Gradio app, specifically:

* `theme`: The theme for your Gradio app
* `css`: Custom CSS code as a string
* `css_paths`: Paths to custom CSS files
* `js`: Custom JavaScript code
* `head`: Custom HTML code to insert in the head of the page
* `head_paths`: Paths to custom HTML files to insert in the head

Since `gr.Blocks` can be nested and are not necessarily unique to a Gradio app, these parameters have now been moved to `Blocks.launch()`, which can only be called once for your entire Gradio app.

**Before (Gradio 5.x):**

```python
import gradio as gr

with gr.Blocks(
    theme=gr.themes.Soft(),
    css=".my-class { color: red; }",
) as demo:
    gr.Textbox(label="Input")

demo.launch()
```

**After (Gradio 6.x):**

```python
import gradio as gr

with gr.Blocks() as demo:
    gr.Textbox(label="Input")

demo.launch(
    theme=gr.themes.Soft(),
    css=".my-class { color: red; }",
)
```

This change makes it clearer that these parameters apply to the entire app and not to individual `Blocks` instances.

### `show_api` parameter replaced with `footer_links`

The `show_api` parameter in `launch()` has been replaced with a more flexible `footer_links` parameter that allows you to control which links appear in the footer of your Gradio app.

**In Gradio 5.x:**
- `show_api=True` (default) showed the API documentation link in the footer
- `show_api=False` hid the API documentation link

**In Gradio 6.x:**
- `footer_links` accepts a list of strings: `["api", "gradio", "settings"]`
- You can now control precisely which footer links are shown:
  - `"api"`: Shows the API documentation link
  - `"gradio"`: Shows the "Built with Gradio" link
  - `"settings"`: Shows the settings link

**Before (Gradio 5.x):**

```python
import gradio as gr

with gr.Blocks() as demo:
    gr.Textbox(label="Input")

demo.launch(show_api=False)
```

**After (Gradio 6.x):**

```python
import gradio as gr

with gr.Blocks() as demo:
    gr.Textbox(label="Input")

demo.launch(footer_links=["gradio", "settings"])
```

To replicate the old behavior:
- `show_api=True` → `footer_links=["api", "gradio", "settings"]` (or just omit the parameter, as this is the default)
- `show_api=False` → `footer_links=["gradio", "settings"]`

### Event listener parameters: `show_api` removed and `api_name=False` no longer supported

In event listeners (such as `.click()`, `.change()`, etc.), the `show_api` parameter has been removed, and `api_name` no longer accepts `False` as a valid value. These have been replaced with a new `api_visibility` parameter that provides more fine-grained control.

**In Gradio 5.x:**
- `show_api=True` (default) showed the endpoint in the API documentation
- `show_api=False` hid the endpoint from API docs but still allowed downstream apps to use it
- `api_name=False` completely disabled the API endpoint (no downstream apps could use it)

**In Gradio 6.x:**
- `api_visibility` accepts one of three string values:
  - `"public"`: The endpoint is shown in API docs and accessible to all (equivalent to old `show_api=True`)
  - `"undocumented"`: The endpoint is hidden from API docs but still accessible to downstream apps (equivalent to old `show_api=False`)
  - `"private"`: The endpoint is completely disabled and inaccessible (equivalent to old `api_name=False`)

**Before (Gradio 5.x):**

```python
import gradio as gr

with gr.Blocks() as demo:
    btn = gr.Button("Click me")
    output = gr.Textbox()
    
    btn.click(fn=lambda: "Hello", outputs=output, show_api=False)
    
demo.launch()
```

Or to completely disable the API:

```python
btn.click(fn=lambda: "Hello", outputs=output, api_name=False)
```

**After (Gradio 6.x):**

```python
import gradio as gr

with gr.Blocks() as demo:
    btn = gr.Button("Click me")
    output = gr.Textbox()
    
    btn.click(fn=lambda: "Hello", outputs=output, api_visibility="undocumented")
    
demo.launch()
```

Or to completely disable the API:

```python
btn.click(fn=lambda: "Hello", outputs=output, api_visibility="private")
```

To replicate the old behavior:
- `show_api=True` → `api_visibility="public"` (or just omit the parameter, as this is the default)
- `show_api=False` → `api_visibility="undocumented"`
- `api_name=False` → `api_visibility="private"`

### Default API names for `Interface` and `ChatInterface` now use function names

The default API endpoint names for `gr.Interface` and `gr.ChatInterface` have changed to be consistent with how `gr.Blocks` events work and to better support MCP (Model Context Protocol) tools.

**In Gradio 5.x:**
- `gr.Interface` had a default API name of `/predict`
- `gr.ChatInterface` had a default API name of `/chat`

**In Gradio 6.x:**
- Both `gr.Interface` and `gr.ChatInterface` now use the name of the function you pass in as the default API endpoint name
- This makes the API more descriptive and consistent with `gr.Blocks` behavior

**Before (Gradio 5.x):**

```python
import gradio as gr

def generate_text(prompt):
    return f"Generated: {prompt}"

demo = gr.Interface(fn=generate_text, inputs="text", outputs="text")
demo.launch()
```

The API endpoint would be: `/predict`

**After (Gradio 6.x):**

```python
import gradio as gr

def generate_text(prompt):
    return f"Generated: {prompt}"

demo = gr.Interface(fn=generate_text, inputs="text", outputs="text")
demo.launch()
```

The API endpoint will be: `/generate_text`

**To maintain the old endpoint names:**

If you need to keep the old endpoint names for backward compatibility (e.g., if you have external services calling these endpoints), you can explicitly set the `api_name` parameter:

```python
demo = gr.Interface(fn=generate_text, inputs="text", outputs="text", api_name="predict")
```

Similarly for `ChatInterface`:

```python
demo = gr.ChatInterface(fn=chat_function, api_name="chat")
```

### `allow_tags=True` is now the default for `gr.Chatbot`

Due to the rise in LLMs returning HTML, markdown tags, and custom tags (such as `<thinking>` tags), the default value of `allow_tags` in `gr.Chatbot` has changed from `False` to `True` in Gradio 6.

**In Gradio 5.x:**
- `allow_tags=False` was the default
- All HTML and custom tags were sanitized/removed from chatbot messages (unless explicitly allowed)

**In Gradio 6.x:**
- `allow_tags=True` is the default
- All custom tags (non-standard HTML tags) are preserved in chatbot messages
- Standard HTML tags are still sanitized for security unless `sanitize_html=False`

**Before (Gradio 5.x):**

```python
import gradio as gr

chatbot = gr.Chatbot()
```

This would remove all tags from messages, including custom tags like `<thinking>`.

**After (Gradio 6.x):**

```python
import gradio as gr

chatbot = gr.Chatbot()
```

This will now preserve custom tags like `<thinking>` in the messages.

**To maintain the old behavior:**

If you want to continue removing all tags from chatbot messages (the old default behavior), explicitly set `allow_tags=False`:

```python
import gradio as gr

chatbot = gr.Chatbot(allow_tags=False)
```

**Note:** You can also specify a list of specific tags to allow:

```python
chatbot = gr.Chatbot(allow_tags=["thinking", "tool_call"])
```

This will only preserve `<thinking>` and `<tool_call>` tags while removing all other custom tags.

