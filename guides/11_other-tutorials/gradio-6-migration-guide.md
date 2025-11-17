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

### `gr.Chatbot` and `gr.ChatInterface` tuple format removed

The tuple format for chatbot messages has been removed in Gradio 6.0. You must now use the messages format with dictionaries containing "role" and "content" keys.

**In Gradio 5.x:**
- You could use `type="tuples"` or the default tuple format: `[["user message", "assistant message"], ...]`
- The tuple format was a list of lists where each inner list had two elements: `[user_message, assistant_message]`

**In Gradio 6.x:**
- Only the messages format is supported: `type="messages"`
- Messages must be dictionaries with "role" and "content" keys: `[{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there!"}]`

**Before (Gradio 5.x):**

```python
import gradio as gr

# Using tuple format
chatbot = gr.Chatbot(value=[["Hello", "Hi there!"]])
```

Or with `type="tuples"`:

```python
chatbot = gr.Chatbot(value=[["Hello", "Hi there!"]], type="tuples")
```

**After (Gradio 6.x):**

```python
import gradio as gr

# Must use messages format
chatbot = gr.Chatbot(
    value=[
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"}
    ],
    type="messages"
)
```

Similarly for `gr.ChatInterface`, if you were manually setting the chat history:

```python
# Before (Gradio 5.x)
demo = gr.ChatInterface(
    fn=chat_function,
    examples=[["Hello", "Hi there!"]]
)

# After (Gradio 6.x)
demo = gr.ChatInterface(
    fn=chat_function,
    examples=[{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there!"}]
)
```

**Note:** If you're using `gr.ChatInterface` with a function that returns messages, the function should return messages in the new format. The tuple format is no longer supported.

### `gr.ChatInterface` `history` format now uses structured content

The `history` format in `gr.ChatInterface` has been updated to consistently use OpenAI-style structured content format. Content is now always a list of content blocks, even for simple text messages.

**In Gradio 5.x:**
- Content could be a simple string: `{"role": "user", "content": "Hello"}`
- Simple text messages used a string directly

**In Gradio 6.x:**
- Content is always a list of content blocks: `{"role": "user", "content": [{"type": "text", "text": "Hello"}]}`
- This format is consistent with OpenAI's message format and supports multimodal content (text, images, etc.)

**Before (Gradio 5.x):**

```python
history = [
    {"role": "user", "content": "What is the capital of France?"},
    {"role": "assistant", "content": "Paris"}
]
```

**After (Gradio 6.x):**

```python
history = [
    {"role": "user", "content": [{"type": "text", "text": "What is the capital of France?"}]},
    {"role": "assistant", "content": [{"type": "text", "text": "Paris"}]}
]
```

**With files:**

When files are uploaded in the chat, they are represented as content blocks with `"type": "file"`. All content blocks (files and text) are grouped together in the same message's content array:

```python
history = [
    {
        "role": "user",
        "content": [
            {"type": "file", "file": {"path": "cat1.png"}},
            {"type": "file", "file": {"path": "cat2.png"}},
            {"type": "text", "text": "What's the difference between these two images?"}
        ]
    }
]
```

This structured format allows for multimodal content (text, images, files, etc.) in chat messages, making it consistent with OpenAI's API format. All files uploaded in a single message are grouped together in the `content` array along with any text content.

## Component-level Changes

### `gr.Video` no longer accepts tuple values for video and subtitles

The tuple format for returning video with subtitles has been deprecated. Instead of returning a tuple `(video_path, subtitle_path)`, you should now use the `gr.Video` component directly with the `subtitles` parameter.

**In Gradio 5.x:**
- You could return a tuple of `(video_path, subtitle_path)` from a function
- The tuple format was `(str | Path, str | Path | None)`

**In Gradio 6.x:**
- Return a `gr.Video` component instance with the `subtitles` parameter
- This provides more flexibility and consistency with other components

**Before (Gradio 5.x):**

```python
import gradio as gr

def generate_video_with_subtitles(input):
    video_path = "output.mp4"
    subtitle_path = "subtitles.srt"
    return (video_path, subtitle_path)

demo = gr.Interface(
    fn=generate_video_with_subtitles,
    inputs="text",
    outputs=gr.Video()
)
demo.launch()
```

**After (Gradio 6.x):**

```python
import gradio as gr

def generate_video_with_subtitles(input):
    video_path = "output.mp4"
    subtitle_path = "subtitles.srt"
    return gr.Video(value=video_path, subtitles=subtitle_path)

demo = gr.Interface(
    fn=generate_video_with_subtitles,
    inputs="text",
    outputs=gr.Video()
)
demo.launch()
```

Or if using `gr.Blocks`:

```python
import gradio as gr

def process_video(input):
    video = "output.mp4"
    subtitle = "subtitles.srt"
    return gr.Video(value=video, subtitles=subtitle)

with gr.Blocks() as demo:
    input_text = gr.Textbox()
    output_video = gr.Video()
    btn = gr.Button("Generate")
    btn.click(fn=process_video, inputs=input_text, outputs=output_video)

demo.launch()
```

### `gr.ImageEditor` `crop_size` parameter renamed to `canvas_size`

The `crop_size` parameter in `gr.ImageEditor` has been renamed to `canvas_size` to better reflect its purpose.

**Before (Gradio 5.x):**

```python
import gradio as gr

editor = gr.ImageEditor(crop_size=(512, 512))
```

**After (Gradio 6.x):**

```python
import gradio as gr

editor = gr.ImageEditor(canvas_size=(512, 512))
```

### `gr.Dataframe` `row_count` and `col_count` parameters restructured

The `row_count` and `col_count` parameters in `gr.Dataframe` have been restructured to provide more flexibility and clarity. The tuple format for specifying fixed/dynamic behavior has been replaced with separate parameters for initial counts and limits.

**In Gradio 5.x:**
- `row_count: int | tuple[int, str]` - Could be an int or tuple like `(5, "fixed")` or `(5, "dynamic")`
- `col_count: int | tuple[int, str] | None` - Could be an int or tuple like `(3, "fixed")` or `(3, "dynamic")`

**In Gradio 6.x:**
- `row_count: int | None` - Just the initial number of rows to display
- `row_limits: tuple[int | None, int | None] | None` - Tuple specifying (min_rows, max_rows) constraints
- `column_count: int | None` - The initial number of columns to display
- `column_limits: tuple[int | None, int | None] | None` - Tuple specifying (min_columns, max_columns) constraints

**Before (Gradio 5.x):**

```python
import gradio as gr

# Fixed number of rows (users can't add/remove rows)
df = gr.Dataframe(row_count=(5, "fixed"), col_count=(3, "dynamic"))
```

Or with dynamic rows:

```python
# Dynamic rows (users can add/remove rows)
df = gr.Dataframe(row_count=(5, "dynamic"), col_count=(3, "fixed"))
```

Or with just integers (defaults to dynamic):

```python
df = gr.Dataframe(row_count=5, col_count=3)
```

**After (Gradio 6.x):**

```python
import gradio as gr

# Fixed number of rows (users can't add/remove rows)
df = gr.Dataframe(row_count=5, row_limits=(5, 5), column_count=3, column_limits=None)
```

Or with dynamic rows (users can add/remove rows):

```python
# Dynamic rows with no limits
df = gr.Dataframe(row_count=5, row_limits=None, column_count=3, column_limits=None)
```

Or with min/max constraints:

```python
# Rows between 3 and 10, columns between 2 and 5
df = gr.Dataframe(row_count=5, row_limits=(3, 10), column_count=3, column_limits=(2, 5))
```

**Migration examples:**

- `row_count=(5, "fixed")` → `row_count=5, row_limits=(5, 5)`
- `row_count=(5, "dynamic")` → `row_count=5, row_limits=None`
- `row_count=5` → `row_count=5, row_limits=None` (same behavior)
- `col_count=(3, "fixed")` → `column_count=3, column_limits=(3, 3)`
- `col_count=(3, "dynamic")` → `column_count=3, column_limits=None`
- `col_count=3` → `column_count=3, column_limits=None` (same behavior)



## Python Client Changes