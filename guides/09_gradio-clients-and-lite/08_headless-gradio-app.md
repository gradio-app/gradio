# Headless Gradio Apps

Tags: API, MCP, FASTAPI, CLIENT

Gradio gives you a lot out of the box — an API server with queuing and streaming, MCP tool support, ZeroGPU access, and one-click hosting on Hugging Face Spaces. But sometimes you want a **completely custom frontend** instead of the standard Gradio UI. Maybe you're building your own React app, a simple HTML page, or vibe-coding a frontend with an AI assistant.

`gradio.App` lets you do exactly that. It's a FastAPI server with Gradio's API engine built in, so you get all the backend benefits — queue, concurrency control, SSE streaming, MCP, ZeroGPU, Spaces hosting — while writing whatever frontend you want.

## When to use `gradio.App`

Use `gradio.App` instead of `gr.Blocks` when:

- You want a **completely custom UI** (your own HTML, React, Svelte, etc.) powered by Gradio's backend
- You want to **vibe-code** a frontend while keeping Gradio's API, MCP, and ZeroGPU support
- You want **full FastAPI control** (custom GET/POST routes, middleware, dependency injection) alongside Gradio API endpoints
- You're building a service to **host on Spaces** with ZeroGPU but don't need Gradio components

If you're happy with Gradio's built-in UI components, use `gr.Blocks` or `gr.Interface` instead.

## Installation

`gradio.App` is included in the main Gradio package. If you want MCP support, install the extra:

```bash
pip install "gradio[mcp]"
```

## A Minimal Example

Here's the simplest possible headless Gradio app — a single API endpoint with no UI:

```python
from gradio import App

app = App()

@app.api(name="hello")
def hello(name: str) -> str:
    return f"Hello, {name}!"

app.launch()
```

That's it. When you run this script, you get:

- A Gradio API endpoint at `/gradio_api/call/hello` with queuing and SSE streaming
- Auto-generated API docs at `/gradio_api/info`
- A Python and JavaScript client that can call `/hello` by name

You can test it with the Gradio Python client:

```python
from gradio_client import Client

client = Client("http://localhost:7860")
result = client.predict("World", api_name="/hello")
print(result)  # "Hello, World!"
```

## Custom Routes

Since `gradio.App` inherits from FastAPI, you can add any route directly:

```python
from gradio import App
from fastapi.responses import HTMLResponse

app = App()

@app.api(name="hello")
def hello(name: str) -> str:
    return f"Hello, {name}!"

@app.get("/", response_class=HTMLResponse)
async def homepage():
    return "<h1>Welcome to my API</h1>"

@app.get("/health")
async def health():
    return {"status": "ok"}

app.launch()
```

Your custom routes take priority over Gradio's default routes. For example, your `GET /` replaces Gradio's default UI page.

You can also use all standard FastAPI features — `app.add_middleware()`, `app.include_router()`, dependency injection, exception handlers, and so on.

## MCP Tools

To expose your API endpoints as MCP tools, add the `@app.mcp.tool()` decorator and pass `mcp_server=True` to `launch()`:

```python
from gradio import App

app = App()

@app.mcp.tool(name="hello")
@app.api(name="hello")
def hello(name: str) -> str:
    """Greet someone by name."""
    return f"Hello, {name}!"

app.launch(mcp_server=True)
```

The `@app.mcp.tool()` and `@app.api()` decorators are independent — you can have API-only endpoints or MCP-only tools. Stack both when you want a function available through both.

## A Complete Example with the JavaScript Client

This example combines everything: custom HTML served at `/`, Gradio API endpoints with concurrency limits, MCP tools, and a custom REST endpoint — all connected via the Gradio JavaScript client.

$code_headless_app

Run it with:

```bash
python run.py
```

Then open `http://localhost:7860` in your browser. The custom HTML page uses the `@gradio/client` JavaScript library to call the Gradio API endpoints. Meanwhile, the same endpoints are available as MCP tools and through the REST API at `/gradio_api/call/add` and `/gradio_api/call/multiply`.

## Concurrency and Streaming

`app.api()` supports all of the same concurrency and streaming options as `gr.api()`:

```python
@app.api(name="generate", concurrency_limit=2, stream_every=0.5)
async def generate(prompt: str):
    for token in model.generate(prompt):
        yield token
```

Generator functions automatically stream results via SSE, just like in a regular Gradio app. The `concurrency_limit` parameter controls how many concurrent calls to this endpoint are allowed.

## API Reference

### `App()`

Creates a new headless Gradio app. Accepts all [FastAPI constructor parameters](https://fastapi.tiangolo.com/reference/fastapi/) (`title`, `version`, `docs_url`, etc.).

### `@app.api()`

Registers a function as a Gradio API endpoint. Parameters:

| Parameter | Default | Description |
|---|---|---|
| `name` | function name | API endpoint name |
| `description` | docstring | Endpoint description |
| `concurrency_limit` | `"default"` | Max concurrent executions |
| `concurrency_id` | `None` | Group endpoints to share a concurrency limit |
| `queue` | `True` | Whether to queue requests |
| `stream_every` | `0.5` | Seconds between stream chunks (for generators) |

### `@app.mcp.tool()`, `@app.mcp.resource()`, `@app.mcp.prompt()`

MCP metadata decorators. See the [MCP guide](/guides/building-mcp-server-with-gradio) for details.

### `app.launch()`

Starts the server. Accepts all the same keyword arguments as [`Blocks.launch()`](/docs/gradio/blocks#launch), including `share`, `server_name`, `server_port`, `auth`, and `mcp_server`.
