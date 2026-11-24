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
- [Workflows](https://www.gradio.app/guides/workflows)
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

**Workflow**: builds a visual, node-based pipeline from Hugging Face Spaces,
models, datasets, and Python functions. `gr.Workflow` is a standalone app, so
do not create it inside a `gr.Blocks` context.

```python
import gradio as gr

def clean(text: str) -> str:
    return text.strip().lower()

def tag(text: str) -> str:
    return f"[processed] {text}"

gr.Workflow(
    bind={"clean": clean, "tag": tag},
    edges=[("clean", "tag")],
).launch()
```

## Custom HTML Components

If a task requires significant customization of an existing component or a component that doesn't exist in Gradio, you can create one with `gr.HTML`. It supports `html_template` (with `${}` JS expressions and `{{}}` Handlebars syntax), `css_template` for scoped styles, and `js_on_load` for interactivity — where `props.value` updates the component value and `trigger('event_name')` fires Gradio events. For reuse, subclass `gr.HTML` and define `api_info()` for API/MCP support. 

See the [full guide](https://www.gradio.app/guides/custom-HTML-components) as well as example in `references/examples.md`

## Server Mode

Use `gr.Server` instead of gr.Blocks when the users requests any of the following:
- Completely custom UI (your own HTML, React, Svelte, etc.) powered by Gradio's backend.
- Full control of FastAPI server (custom GET/POST routes, middleware, dependency injection) alongside Gradio API endpoints

Register the functions that compute with `@app.api()`, and serve the frontend as static files mounted at `/`:

```python
from fastapi.staticfiles import StaticFiles
import gradio as gr

app = gr.Server()

@app.api(name="hello")
def hello(name: str) -> str:
    return f"Hello, {name}!"

app.mount("/", StaticFiles(directory="static", html=True))  # static/index.html is the page

app.launch()
```

In `static/index.html`, call the endpoint with the JavaScript client:

```html
<script type="module">
  import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";
  const client = await Client.connect(location.origin);
  const result = await client.predict("/hello", { name: "World" });
  console.log(result.data[0]);
</script>
```

Always prefer this pattern for the frontend (HTML, JS, CSS, images, or the build output of a React/Svelte/Vue app) over returning HTML from a Python route such as `@app.get("/")`. A Gradio app runs in two processes: static files are served by the gateway process, so the page loads instantly while the model is busy, whereas a Python route runs in the same process as the model and waits for it. Rules:
- Don't put files or folders named `gradio_api`, `config`, `login`, `logout` or `monitoring` at the top of the static folder: Gradio serves its API at those paths, and `launch()` raises an error.
- Use `@app.get()`/`@app.post()` only for light routes. If a Python route must stay responsive while functions run, define it on a FastAPI `APIRouter` in a separate module and pass it as `gr.Server(gateway="web:router")`.
- Don't call `app.add_middleware()`; define a `middleware` list in the `gateway` module instead.

See the [full guide](https://www.gradio.app/guides/server-mode).

If the user's use case can be handled by Gradio's built-in components or customizable HTML components, prefer not to use `gr.Server`.
