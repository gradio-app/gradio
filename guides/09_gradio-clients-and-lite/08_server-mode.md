# Server mode

Tags: API, MCP, FASTAPI, SERVER

In this post, we will demonstrate how to build a completely custom frontend for your Gradio application, while still utilizing Gradio's backend, which means you still get an API server with queuing and streaming, MCP tool support, ZeroGPU support, and hosting on Hugging Face Spaces.

To do this, you use **Server mode**: instantiate `gradio.Server` directly. The `gradio.Server` class is a FastAPI server with Gradio's API engine built in, so you get all the backend benefits with complete flexibility on what kind of frontend (e.g. a React app, a simple HTML page, or any vibe-coded frontend), if any, you'd like to launch alongside the backend server.

## When to use `gradio.Server`

Use `gradio.Server` instead of `gr.Blocks` when any of the following apply:

- You want a **completely custom (potentially vibe-coded) UI** (your own HTML, React, Svelte, etc.) powered by Gradio's backend
- You want **full FastAPI control** (custom GET/POST routes, middleware, dependency injection) alongside Gradio API endpoints
- You're building a service to **host on Spaces** with or without ZeroGPU but don't need Gradio components

If you're happy with Gradio's built-in UI components, use `gr.Blocks`, `gr.ChatInterface`, or `gr.Interface` instead.

## Installation

`gradio.Server` is included in the main Gradio package. If you want MCP support, install the extra:

```bash
pip install "gradio[mcp]"
```

## A Minimal Example

Here's the simplest possible Server mode app — a single API endpoint with no UI:

```python
from gradio import Server

app = Server()

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

## Serving Your Frontend

The recommended way to add a frontend is to keep it in plain files (an `index.html`, or the build output of a React, Svelte or Vue app) and mount the folder at `/` with FastAPI's `StaticFiles`:

```python
from fastapi.staticfiles import StaticFiles
from gradio import Server

app = Server()

@app.api(name="hello")
def hello(name: str) -> str:
    return f"Hello, {name}!"

app.mount("/", StaticFiles(directory="static", html=True))

app.launch()
```

```html
<!-- static/index.html -->
<!doctype html>
<html>
  <body>
    <input id="name" value="World" />
    <button id="go">Greet</button>
    <p id="out"></p>
    <script type="module">
      import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

      const client = await Client.connect(location.origin);
      document.getElementById("go").onclick = async () => {
        const result = await client.predict("/hello", {
          name: document.getElementById("name").value,
        });
        document.getElementById("out").textContent = result.data[0];
      };
    </script>
  </body>
</html>
```

Open `http://localhost:7860` and you get your page, which calls the `hello` endpoint through [the Gradio JavaScript client](/guides/getting-started-with-the-js-client).

### Why static files?

By default (outside of notebooks), a Gradio app runs in two processes:

- The **app process** runs your script: it loads your models and runs the functions you register with `@app.api()`.
- The **gateway process** listens on the port. It serves static files, queues requests and streams results back, and never imports your script.

Files mounted with `StaticFiles` are served by the gateway, so your page keeps loading in a few milliseconds while your model is busy, even when the model uses all of a CPU core. A route written as a Python function (`@app.get("/")`) runs in the app process, next to your model, and has to wait its turn when a function is running.

So prefer static files for everything the browser loads (HTML, JavaScript, CSS, images), and use `@app.api()` for everything that computes.

### Reserved paths

Gradio keeps the paths that its API needs: `/gradio_api`, `/config`, `/login`, `/logout` and `/monitoring`. Static files mounted at `/` are served for every other path, including the paths of Gradio's own page (such as `/assets` or `/favicon.ico`), which your frontend replaces. If your folder contains a file or folder with one of the reserved names (for example `static/config`), `launch()` raises an error that asks you to rename it.

You can also mount static files under any other path, for example `app.mount("/site", StaticFiles(directory="static", html=True))`.

Only static files can be mounted at `/`. Any other app mounted there (for example a FastAPI sub-application) would receive every request, including the ones for Gradio's API, so `launch()` raises an error. Mount such an app at its own path instead, such as `app.mount("/admin", admin_app)`.

### Authentication

If you pass `auth=` to `launch()`, Gradio protects its API: `/config` and the `/gradio_api` routes return `401` until the user has logged in. Your static files are not protected, so the page itself loads without logging in. Gradio's built-in login form is part of its own page at `/`, which your frontend replaces, so a custom frontend needs its own login flow.

The simplest one is to ask for a username and password in your page and pass them to the JavaScript client, which logs in for you:

```js
const client = await Client.connect(location.origin, {
	auth: [username, password]
});
```

Alternatively, send them yourself as form fields named `username` and `password` in a `POST` request to `/login`. Gradio sets a session cookie, and later requests from the page are authenticated.

Don't put anything private in the static folder, since those files are served to everyone.

## Custom Routes

Since `gradio.Server` inherits from FastAPI, you can add any route directly:

```python
from gradio import Server

app = Server()

@app.api(name="hello")
def hello(name: str) -> str:
    return f"Hello, {name}!"

@app.get("/health")
async def health():
    return {"status": "ok"}

app.launch()
```

Your custom routes take priority over Gradio's default routes. For example, a `GET /` route replaces Gradio's default UI page.

Routes that you define on the app run in the app process, alongside your `@app.api()` functions. This is fine for light routes, but a page served this way is slow to load while a function is running. Serve pages as static files instead, as shown above.

If a route needs Python and must stay responsive while your functions run, put it in a separate module and pass that module to the gateway process:

```python
# web.py: imported by the gateway, so keep models out of it
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "ok"}
```

```python
# app.py
app = Server(gateway="web:router")
```

You can also use all standard FastAPI features, such as `app.include_router()`, dependency injection and exception handlers. Middleware is the exception: because the gateway serves Gradio's routes, define it in a `middleware` list in a `gateway` module instead of calling `app.add_middleware()`.

## MCP Tools

To expose your API endpoints as MCP tools, add the `@app.mcp.tool()` decorator and pass `mcp_server=True` to `launch()`:

```python
from gradio import Server

app = Server()

@app.mcp.tool(name="hello")
@app.api(name="hello")
def hello(name: str) -> str:
    """Greet someone by name."""
    return f"Hello, {name}!"

app.launch(mcp_server=True)
```

The `@app.mcp.tool()` and `@app.api()` decorators are independent — you can have API-only endpoints or MCP-only tools. Stack both when you want a function available through both.

## A Complete Example with the JavaScript Client

This example combines everything: a custom HTML page served from static files at `/`, Gradio API endpoints, and MCP tools, with the page and the endpoints connected via [the Gradio JavaScript client](/guides/getting-started-with-the-js-client).

$code_server_app

The page is `static/index.html`, next to `run.py`:

```html
<!DOCTYPE html>
<html>
<head><title>Calculator</title>
<style>
  * { margin: 0; box-sizing: border-box; font-family: 'Courier New', monospace; }
  body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1a1a2e; color: #fff;}
  .calc { background: #16213e; padding: 2rem; border-radius: 1rem; box-shadow: 0 8px 32px rgba(0,0,0,.4); width: 320px; }
  #out { background: #0f3460; color: #0f0; font-size: 2rem; text-align: right; padding: .75rem 1rem; border-radius: .5rem; min-height: 3rem; margin-bottom: 1rem; }
  .row { display: flex; gap: .5rem; margin-bottom: .5rem; }
  input { flex: 1; min-width: 0; padding: .6rem; font-size: 1.2rem; border: none; border-radius: .5rem; background: #e2e2e2; text-align: center; }
  button { flex: 1; padding: .6rem; font-size: 1rem; border: none; border-radius: .5rem; cursor: pointer; font-weight: bold; color: #fff; }
  .add { background: #e94560; } .mul { background: #533483; }
  button:hover { opacity: .85; }
</style></head>
<body>
  <div class="calc">
    <div id="out">0</div>
    Operands
    <div class="row"><input id="a" type="number" value="3"><input id="b" type="number" value="5"></div>
    Operation
    <div class="row"><button class="add" onclick="run('add')">+</button><button class="mul" onclick="run('multiply')">&times;</button></div>
  </div>
  <script type="module">
    import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";
    const app = await Client.connect(location.origin);
    window.run = async (ep) => {
      const a = parseInt(document.getElementById("a").value), b = parseInt(document.getElementById("b").value);
      document.getElementById("out").textContent = (await app.predict("/" + ep, { a, b })).data;
    };
  </script>
</body>
</html>
```

Run it with:

```bash
python run.py
```

Then open `http://localhost:7860` in your browser. The custom HTML page uses the `@gradio/client` JavaScript library to call the Gradio API endpoints. Meanwhile, the same endpoints are available as MCP tools and through the REST API at `/gradio_api/call/add` and `/gradio_api/call/multiply`.

Note: if your `Server` app uses ZeroGPU, you _must_ call Gradio API endpoints through `@gradio/client` from the browser. The JavaScript client forwards the Hugging Face iframe auth headers needed for ZeroGPU quota handling.

## Resuming Queued Work

Server-mode endpoints use the same resumable queue as `Blocks` apps. For a custom browser frontend, connect with `resume_sessions: true` and call `resume_jobs()` when the page loads. This restores any active submissions saved in the browser session instead of starting them again:

```js
const app = await Client.connect(location.origin, {
	resume_sessions: true,
	events: ["status", "data"]
});

for (const job of app.resume_jobs()) {
	for await (const message of job) {
		console.log(message);
	}
	// Otherwise the finished job is resumed again on the next page load
	await job.acknowledge();
}
```

Python services can persist the event ID, function index, and session hash, then recreate the job with `Client.resume_jobs()`:

```python
client = Client("http://localhost:7860", resume_sessions=True)
job = client.submit("hello", api_name="/generate")
saved_job = {"event_id": job.wait_for_id(), "fn_index": job.fn_index}
saved_session = client.session_hash

client = Client("http://localhost:7860")
job = client.resume_jobs([saved_job], session_hash=saved_session)[0]
```

When storing the values separately, preserve the original client's `session_hash` and pass that value to the new client. Resumed generator endpoints replay their buffered chunks in order before continuing with live output.

## Concurrency and Streaming

`app.api()` supports all of the same concurrency and streaming options as `gr.api()`:

```python
@app.api(name="generate", concurrency_limit=2, stream_every=0.5)
async def generate(prompt: str):
    for token in model.generate(prompt):
        yield token
```

Generator functions automatically stream results via SSE, just like in a regular Gradio app. The `concurrency_limit` parameter controls how many concurrent calls to this endpoint are allowed. By default, this is set to 1, since many ML workloads that run on GPU can only support a single user at a time. However, you can increase this, or set to `None` to use FastAPI defaults, if you are e.g. calling an external API.

For the full API reference, see the [`Server` documentation](/docs/gradio/server).
