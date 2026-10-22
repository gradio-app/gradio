# Persistent process executor (experimental)

This extracts process execution from the autoscaling PoC. It has **one lazy,
persistent process per `Server.queue()` endpoint**, with no telemetry, replica
admission, autoscaling, or added dependencies. Existing `Blocks` callbacks and
`Server.api()` execution are unchanged.

```python
import gradio as gr

app = gr.App()  # alias of gr.Server

@app.resource()
def model():
    return load_model()

@app.queue(executor="process", workers=1)
def predict(prompt: str):
    yield from model().generate(prompt)

if __name__ == "__main__":
    app.launch()
```

A worker starts on its endpoint's first request. It imports the application,
initializes the registered synchronous resource factories once, and serially
serves that endpoint's requests. It does **not** start a new process or reload
resources on each request. Different endpoints have independent processes and
independent resource copies. All registered factories initialize in each worker;
resource dependency groups are not implemented yet.

The child uses a fresh Python interpreter rather than forking an initialized GPU
runtime. Authenticated local IPC carries pickleable inputs/results. Synchronous,
async, generator and async-generator functions are supported; streamed output
crosses a bounded asynchronous bridge. Cancellation terminates the affected
worker; a later request initializes a replacement. Failed jobs are never replayed.
Workers close with the server lifespan or parent interpreter exit.

## Constraints

- Define exactly one App/Server in an importable application file. Decorated
  functions must be defined in that file. Notebook/local closures and selecting
  an app factory are not supported in this PoC.
- Top-level application code executes again in workers. Place model loading in
  `resource()` and other startup side effects behind appropriate guards.
- Python objects are serialized, not shared. Large arrays incur copying costs;
  parent globals/session state, request objects, UI progress/context helpers and
  model instances cannot be assumed to carry across the process boundary.
- Resource factories are synchronous. Async calls currently use a fresh event
  loop per request, so cached clients tied to a prior loop are unsupported.
- No batching or worker autoscaling. `workers=1` is the only accepted count;
  `concurrency_limit=1` is the default. `None` still serializes work inside the
  endpoint's single child. There are no memory admission checks in this layer.
- This is opt-in through the new decorator, not a change to existing app defaults.

## Benchmarks

The adapters in `app.py` execute the unchanged callback definitions/imports from
five repository demos, without constructing their original UIs:

- `hello_world`: tiny string concatenation.
- `calculator`: tiny arithmetic.
- `sepia_filter`: 256×256 and 1024×1024 uint8 input images; float64 array outputs.
- `reverse_audio`: 10 seconds of mono 48 kHz float32 audio. The baseline returns
  a cheap NumPy view, while the process path must serialize the audio array.
- `chatinterface_streaming_echo`: eight output chunks, preserving the demo's
  own 50 ms sleep per chunk.

Run from the repository root with this checkout and its matching Python client
on `PYTHONPATH`:

```bash
export PYTHONPATH="$PWD:$PWD/client/python"
python demo/process_executor/benchmark.py
# In another terminal, then run the HTTP benchmark:
python demo/process_executor/app.py
python demo/process_executor/benchmark_http.py
python demo/process_executor/plot_results.py
```

The callback benchmark compares AnyIO thread dispatch (the ordinary synchronous
callback execution path) with the process executor. It checks output equality,
uses five warmups and three measured rounds with alternating execution order,
and records raw per-call samples, source hashes and worker PIDs. Startup is
recorded separately. Streaming records both total time and first-chunk time.

The HTTP benchmark compares process and ordinary `Server.api()` endpoints on the
same local server, using the hello-world and calculator callbacks. It records
three rounds of 50 requests per mode through the actual HTTP/SSE queue. This is
separate from callback timing; full image/audio upload and preprocessing are not
benchmarked. No test suite or second benchmark runs concurrently with the final
recorded measurements.

See [RESULTS.md](RESULTS.md) and [results/](results/) for the measured tradeoffs.
