---
name: gradio
description: Build Gradio web UIs and demos in Python. Use when creating, modifying, debugging, or answering questions about Gradio and its capabilties, components, event listeners, or layouts.
---

# Gradio

Gradio is a Python library for building interactive web UIs and ML demos. This skill covers the core API, patterns, and examples.

## References
- `references/examples.md` -  Illustrative examples showcasing the core Gradio API.
- `references/api-signatures.md` - API signatures of commonly used components.
- `references/event-listeners.md` - API signatures of events supported by each component.

## Guides

Detailed guides on specific topics (read these when relevant):

- [Quickstart](https://www.gradio.app/guides/quickstart)
- [The Interface Class](https://www.gradio.app/guides/the-interface-class)
- [Blocks and Event Listeners](https://www.gradio.app/guides/blocks-and-event-listeners)
- [Controlling Layout](https://www.gradio.app/guides/controlling-layout)
- [More Blocks Features](https://www.gradio.app/guides/more-blocks-features)
- [Custom CSS and JS](https://www.gradio.app/guides/custom-CSS-and-JS)
- [Streaming Outputs](https://www.gradio.app/guides/streaming-outputs)
- [Streaming Inputs](https://www.gradio.app/guides/streaming-inputs)
- [Sharing Your App](https://www.gradio.app/guides/sharing-your-app)
- [Custom HTML Components](https://www.gradio.app/guides/custom-HTML-components)
- [Getting Started with the Python Client](https://www.gradio.app/guides/getting-started-with-the-python-client)
- [Getting Started with the JS Client](https://www.gradio.app/guides/getting-started-with-the-js-client)

## Core Patterns

**Interface** (high-level): wraps a function with input/output components.

```python
import gradio as gr

def greet(name):
    return f"Hello {name}!"

gr.Interface(fn=greet, inputs="text", outputs="text").launch()
```

**Blocks** (low-level): flexible layout with explicit event wiring.

```python
import gradio as gr

with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Greeting")
    btn = gr.Button("Greet")
    btn.click(fn=lambda n: f"Hello {n}!", inputs=name, outputs=output)

demo.launch()
```

**ChatInterface**: high-level wrapper for chatbot UIs.

```python
import gradio as gr

def respond(message, history):
    return f"You said: {message}"

gr.ChatInterface(fn=respond).launch()
```

## Custom HTML Components

If a task requires significant customization of an existing component or a component that doesn't exist in Gradio, you can create one with `gr.HTML`. It supports `html_template` (with `${}` JS expressions and `{{}}` Handlebars syntax), `css_template` for scoped styles, and `js_on_load` for interactivity — where `props.value` updates the component value and `trigger('event_name')` fires Gradio events. For reuse, subclass `gr.HTML` and define `api_info()` for API/MCP support. 

See the [full guide](https://www.gradio.app/guides/custom-HTML-components) as well as example in `references/examples.md`

## Server Mode

Use `gr.Server` instead of gr.Blocks when the users requests any of the following:
- Completely custom UI (your own HTML, React, Svelte, etc.) powered by Gradio's backend.
- Full control of FastAPI server (custom GET/POST routes, middleware, dependency injection) alongside Gradio API endpoints

See the [full guide](https://www.gradio.app/guides/server-mode) and example in `references/examples.md`.

If the user's use case can be handled by Gradio's built-in components or customizable HTML components, prefer not to use `gr.Server`.
