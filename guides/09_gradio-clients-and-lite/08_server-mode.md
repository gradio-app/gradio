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

## WebRTC Streams

To stream a webcam or microphone to your model and back with low latency, pass `transport="webrtc"` to `app.api()` and call the endpoint from the page with `client.submit()` of the JavaScript client, passing a `MediaStream`. The `gr.VideoFrame` or `gr.AudioChunk` type hint marks the media among the function's parameters (sent by the page) and its return values (sent back). The function is called with each frame, as in a [`.stream()` event with `transport="webrtc"`](/guides/object-detection-from-webcam-with-webrtc), takes one value per parameter, and returns one value for each type in its return hint. A generator (return hint `Iterator[...]`) with no media parameter only sends media to the page, which then calls `submit()` without a `MediaStream`. A generator that is sent each frame instead, with `value = yield outputs`, keeps its state in local variables for the whole stream. Its return hint `Generator[outputs, inputs, None]` types both; for several inputs, give them as a `NamedTuple`, whose field names become the endpoint's parameter names and which is what the generator is sent:

```python
from collections.abc import Generator
from typing import NamedTuple


class Inputs(NamedTuple):
    frame: gr.VideoFrame
    prompt: str


@app.api(name="track", transport="webrtc")
def track(request: gr.Request) -> Generator[gr.VideoFrame, Inputs, None]:
    model = load_model()  # once, when the stream starts
    inputs = yield
    while True:
        inputs = yield model(inputs.frame, inputs.prompt)
```

A plain `tuple[...]` works too, with parameters named `input_0`, `input_1`, and so on. For full-duplex audio, decorate a handler class from `gradio.streaming` (such as `AsyncStreamHandler`) instead of a function: the hints on its `receive()` and `emit()` mark the media. An `AudioVideoStreamHandler` streams the camera and microphone together, with the same hints on its audio methods. This needs the `webrtc` extra: `pip install "gradio[webrtc]"`.

```python
import numpy as np
from fastapi.responses import HTMLResponse
import gradio as gr

app = gr.Server()

@app.api(name="flip", transport="webrtc", time_limit=60)
def flip(frame: gr.VideoFrame, brightness: float) -> tuple[gr.VideoFrame, float]:
    frame = np.clip(frame[::-1] * brightness, 0, 255).astype(np.uint8)
    return frame, float(frame.mean())

@app.get("/", response_class=HTMLResponse)
async def homepage():
    return """
<video id="out" autoplay playsinline></video>
<input id="brightness" type="range" min="0" max="2" step="0.1" value="1">
<button id="start">Start</button> <button id="stop">Stop</button>
<p id="info"></p>
<script type="module">
  import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";
  const app = await Client.connect(location.origin, { events: ["data", "status"] });
  const slider = document.getElementById("brightness");
  const info = document.getElementById("info");
  let job;
  document.getElementById("start").onclick = async () => {
    const media = await navigator.mediaDevices.getUserMedia({ video: true });
    job = app.submit("/flip", { frame: media, brightness: Number(slider.value) });
    try {
      for await (const msg of job) {
        if (msg.type === "data") {
          const [video, mean] = msg.data;
          if (video instanceof MediaStream) {
            document.getElementById("out").srcObject = video;
          }
          if (mean !== undefined) {
            info.textContent = `Mean brightness: ${mean.toFixed(1)}`;
          }
        } else if (msg.type === "status" && msg.stage === "error") {
          info.textContent = msg.message;
        }
      }
    } finally {
      // The page opened the camera, so the page turns it off
      media.getTracks().forEach((track) => track.stop());
    }
  };
  slider.oninput = () => job?.send_chunk({ data: [null, Number(slider.value)] });
  document.getElementById("stop").onclick = () => job?.close_stream();
</script>
"""

app.launch()
```

A few things to know:

- Each stream waits its turn in the queue like any other call, so `concurrency_limit` (1 by default) is the number of streams that run at once. The `"status"` messages report the place in line while it waits.
- `time_limit` is how long a stream keeps its turn while others wait, counted from its first call. When it runs out, with `on_time_limit="rejoin"` (the default), the stream goes on if nobody is waiting; if someone is, `client.submit()` joins the queue again with the same `MediaStream` and connects again at its new turn, and the job reports the new wait with `"status"` messages instead of completing (a stream that only receives media completes instead, so that it starts again only when the page asks). With `on_time_limit="stop"`, the stream ends at its time limit. The `"streaming"` status carries `time_limit`; to show a countdown like the one Gradio's components show, start it over each time it runs out while the stream goes on.
- What the app tells the visitor while the stream runs (`gr.Info()`, `gr.Warning()`, and on ZeroGPU a note that the stream goes on past its time limit and keeps using their GPU quota) arrives as `"log"` messages, which your page can show as it likes.
- The remote media arrives as a data message with a `MediaStream` in the media output's slot of `msg.data`. In each data message, the outputs it does not update are `undefined`; return `gr.skip()` from the function to leave an output as it is.
- The other parameters are the stream's inputs. They are plain JSON values, since there are no components to process them. Change them while the stream runs with `job.send_chunk({ data: [...] })`, which takes one value per parameter in order (`null` in the media slot keeps the media; another `MediaStream` there switches to it, for example to the other camera, without a new turn in line), or named values as `submit()` takes them, where the parameters left out keep their values (`job.send_chunk({ data: { brightness: 1.5 } })`).
- `job.close_stream()` stops the stream after the outputs emitted until then have arrived, and `job.cancel()` stops it at once. The `MediaStream` stays the page's: the stream does not stop its tracks.
- `stream_every` is the shortest interval between calls of a video function (unset: every frame). A function that takes a `gr.AudioChunk` gets `stream_every` seconds of audio per call (0.5 by default).
- On Hugging Face Spaces, many visitors' browsers reach the app only through a TURN server, so pass `transport=gr.WebRTCOptions(rtc_configuration=...)`, as described in the [WebRTC guide](/guides/object-detection-from-webcam-with-webrtc#deploying-to-hugging-face-spaces). The recommended way there is a function that issues the credentials with each visitor's `gr.OAuthToken`; for signing in, see [Sign in with Hugging Face](#sign-in-with-hugging-face) below. With ZeroGPU, `client.submit()` sends the visitor's ZeroGPU headers with the connection, so the GPU time counts against the visitor's quota.
- The endpoint is in the app's API info like any other. Only the JavaScript client in a browser can stream to it, with a `MediaStream`; other clients (the Python client, curl, MCP) call it once with a file: an image as one frame for a `gr.VideoFrame` parameter, or an audio file as one chunk for a `gr.AudioChunk` parameter, and get the media it returns back as a file. An endpoint whose function is a handler class streams only from a browser, and returns an error to other callers.

`client.submit()` handles the protocol for you, so you only need the following if you write your own client. The client joins the queue like any call of the endpoint, with `null` in the media parameter's slot of the data and `{"webrtc_id": ...}` as the `event_data`, where `webrtc_id` is a random id of its own. Once its turn comes (the event's first data message), it gets the RTCPeerConnection configuration from `/gradio_api/webrtc/rtc_configuration` and sends its offer and ICE candidates to `/gradio_api/webrtc/offer`, both with the `webrtc_id` and the client's session hash. The data messages of the event carry one value per output; an output they do not update holds `{"__type__": "update"}`. The client sends the values of the other inputs (without the media) over the stream's data channel as `{"type": "input", "data": [...]}`: once the channel opens (an empty list if there are none; a stream that only sends media to the page starts only then), whenever they change, and when the server asks for them with a `send_input` message. When the event completes with `"stream_ended": false`, the stream handed its turn over at its time limit: join the queue again with a new `webrtc_id` and connect again at the new turn. The connection may close before that completion arrives, so let the completion decide.

## Sign in with Hugging Face

When the function of an `app.api(transport=...)` endpoint or its `rtc_configuration` function takes the visitor's `gr.OAuthProfile` or `gr.OAuthToken`, the app gets the sign-in routes that a `gr.LoginButton` brings to a `gr.Blocks` app, so the page signs in with a link instead of the button. The app's other `app.api()` functions then get the signed-in visitor's values as well:

```python
import gradio as gr

async def turn_credentials(token: gr.OAuthToken | None) -> dict:
    ...  # issue TURN credentials with the visitor's token

@app.api(
    name="flip",
    transport=gr.WebRTCOptions(rtc_configuration=turn_credentials),
)
def flip(frame: gr.VideoFrame) -> gr.VideoFrame:
    return frame[::-1]

@app.api(name="whoami")
def whoami(profile: gr.OAuthProfile | None) -> str:
    return profile.username if profile else "Not signed in"
```

```html
<a href="/login/huggingface">Sign in with Hugging Face</a> <a href="/logout">Sign out</a>
```

As for a `gr.Blocks` app, add `hf_oauth: true` to the metadata of your Space's `README.md` and install `gradio[oauth]`. Outside of Spaces, signing in uses a mocked profile of the account your machine is logged in to, so the app starts only when your machine is logged in to Hugging Face.

An `app.api()` function without `transport=` that takes a `gr.OAuthToken` does not bring the sign-in routes by itself. Callers of such an endpoint pass their own token with `Client(..., oauth_token=...)`, which needs none of the setup above.

For the full API reference, see the [`Server` documentation](/docs/gradio/server).
