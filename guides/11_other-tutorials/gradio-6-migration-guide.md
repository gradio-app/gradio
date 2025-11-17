# Gradio 6 Migration Guide

We are excited to release Gradio 6, the latest major version of the Gradio library. Gradio 6 is more performant, lighter, and easier to customize than previous versions of Gradio. The Gradio team is only planning on maintaining future versions of Gradio 6 so we encourage all developers to migrate to Gradio 6.x.

Gradio 6 includes several breaking changes that were made in order to standardize the Python API. This migration guide lists the breaking changes and the specific code changes needed in order to migrate. The easiest way to know whether you need to make changes is to upgrade your Gradio app to 5.50. In 5.50, we provide deprecation warnings for any deprecated parameters, allows you to run your Gradio app

Here, we walk through the breaking changes that were introduced in Gradio 6. Code snippets are provided, allowing you to migrate your code easily to Gradio 6. You can also copy-paste this document as Markdown if you are using an LLM to help migrate your code. 

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
    js="console.log('Hello world')"
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
    js="console.log('Hello world')"
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
