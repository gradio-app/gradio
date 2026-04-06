# Caching Function Results

ML inference is often expensive: image editing, video classification, or audio transcription can each take seconds, minutes, or longer. If a user submits the same inputs twice, there's no reason to re-run the model. Gradio provides two caching mechanisms: `@gr.cache` for automatic exact-match caching, and `gr.Cache()` for manual cache control inside your functions.

## `@gr.cache` — Automatic Caching

Add `@gr.cache` to any function to automatically cache its results. The decorator hashes inputs by their content — two different numpy arrays with the same pixel values will produce a cache hit. Cache hits bypass the Gradio queue entirely.

```python
import gradio as gr

@gr.cache
def classify(image):
    return model.predict(image)
```

### Generators

For generator functions, `@gr.cache` caches **all yielded values** and replays them on a hit. This is particularly important for streaming media (`gr.Audio` or `gr.Video` with `streaming=True`) where each yield is a chunk of the output:

```python
@gr.cache
def stream_response(prompt):
    response = ""
    for token in model.generate(prompt):
        response += token
        yield response
```

### Async

Async functions and async generators work identically:

```python
@gr.cache
async def transcribe(audio):
    return await model.transcribe(audio)
```

### Parameters

The behavior of `@gr.cache()` can be customized with a few parameters, most notably the `key`:

```python
@gr.cache(
    key=lambda kw: kw["prompt"],  # only cache based on prompt, ignore temperature
    max_size=256,                  # max entries (LRU eviction), default 128
    max_memory="512mb",            # max memory before eviction
    per_session=True,              # isolate cache per user session
)
def generate(prompt, temperature=0.7):
    return llm(prompt, temperature=temperature)
```

- **`key`** — function that takes the kwargs dict and returns what to hash. Useful for ignoring parameters like temperature or seed.
- **`max_size`** — maximum number of entries. LRU eviction when full. Default 128. Set to 0 for unlimited.
- **`max_memory`** — maximum memory usage. Accepts strings like `"512mb"`, `"2gb"` or raw bytes. LRU eviction when exceeded.
- **`per_session`** — when `True`, each user session gets an isolated cache namespace. Prevents one user's cached results from being served to another, clears that session's entries when the client disconnects, and still applies `max_size` and `max_memory` to the shared cache store across all sessions.


Access the cache programmatically via `fn.cache`:

```python
generate.cache.clear()
print(len(generate.cache))
```

When a queued event is served from `@gr.cache`, Gradio shows a small `from cache` timing badge in the UI which appears temporarily in the relevant output components.

## `gr.Cache()` — Manual Cache Control

For full control over what gets cached and when, use `gr.Cache()` as an injectable parameter (like `gr.Progress`). Gradio injects the same instance on every call, giving you a thread-safe `get`/`set` interface:

```python
def my_function(prompt, c=gr.Cache()):
    hit = c.get(prompt)
    if hit is not None:
        return hit["result"]
    result = expensive_computation(prompt)
    c.set(prompt, result=result)
    return result
```

If a queued function gets a successful hit from `c.get(...)`, Gradio also shows a timing badge in the UI. This badge says `used cache` instead of `from cache`, because the request still ran, but part of its work was reused from `gr.Cache()`.

A minimal example is available in the [`gr.Cache()` manual cache demo](https://github.com/gradio-app/gradio/blob/main/demo/cache_manual_demo/run.py).

### Why use `gr.Cache()` over a plain dict?

- **Thread-safe** — built-in locking for concurrent requests
- **LRU eviction** + **memory limits** — bounded memory usage (`max_size`, `max_memory`)
- **Per-session isolation** — `gr.Cache(per_session=True)` partitions the cache by user session, prevents data leakage between users, clears that session's entries when the client disconnects, and still applies `max_size` and `max_memory` across the combined cache entries of all sessions

- **Content-aware keys** — numpy arrays, PIL images, DataFrames all work as cache keys

### KV Cache Example

You can cache arbitrary intermediate state, not just function outputs. Here's how to cache transformer KV states for prefix reuse:

```python
def generate(prompt, c=gr.Cache(per_session=True)):
    best_key = None
    best_len = 0
    for cached_key in c.keys():
        if prompt.startswith(cached_key) and len(cached_key) > best_len:
            best_key = cached_key
            best_len = len(cached_key)

    if best_key:
        past_kv = c.get(best_key)["kv"]
        output = model.generate(prompt, past_key_values=past_kv)
    else:
        output = model.generate(prompt)

    c.set(prompt, kv=model.past_key_values)
    return output.text
```

For a full runnable version, see the [`gr.Cache()` KV cache demo](https://github.com/gradio-app/gradio/blob/main/demo/cache_kv_demo/run.py).


## When to Use Caching

`@gr.cache` is most useful for **deterministic** functions where the same input always produces the same output: image classification, audio transcription, embedding computation, structured data extraction.

It is less useful for **non-deterministic** functions like text generation or image generation, where users expect different outputs for the same input. For those, `gr.Cache()` with manual control may be more appropriate as you can cache intermediate state (like KV caches) without caching the output completely.


## Next Steps

Take a look at these complete examples and then build your own Gradio app with caching!

- [`@gr.cache()` function types demo](https://github.com/gradio-app/gradio/blob/main/demo/cache_demo/run.py) - sync, async, generator, and async generator caching
- [`gr.Cache()` manual cache demo](https://github.com/gradio-app/gradio/blob/main/demo/cache_manual_demo/run.py) - normalized manual cache keys with explicit `get` / `set`
- [`gr.Cache()` KV cache demo](https://github.com/gradio-app/gradio/blob/main/demo/cache_kv_demo/run.py) - transformer prefix reuse with cached KV state
