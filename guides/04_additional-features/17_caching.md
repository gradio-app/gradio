# Caching Function Results

ML inference is often expensive — image classification, text generation, and audio synthesis can each take seconds or more. If a user submits the same inputs twice, there's no reason to re-run the model. Gradio provides two caching mechanisms: `@gr.cache` for automatic exact-match caching, and `gr.Cache()` for manual cache control inside your functions.

## `@gr.cache` — Automatic Caching

Add `@gr.cache` to any function to automatically cache its results. The decorator hashes inputs by their content — two different numpy arrays with the same pixel values will produce a cache hit. Cache hits bypass the Gradio queue entirely.

```python
import gradio as gr

@gr.cache
def classify(image):
    return model.predict(image)
```

### Generators

For generator functions, `@gr.cache` caches **all yielded values** and replays them on a hit. This is important for streaming media (audio/video chunks) where each yield is a piece of the output:

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
- **`per_session`** — when `True`, each user session gets an isolated cache. Prevents one user's cached results from being served to another.


Access the cache programmatically via `fn.cache`:

```python
generate.cache.clear()
print(len(generate.cache))
```

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

### Why use `gr.Cache()` over a plain dict?

- **Thread-safe** — built-in locking for concurrent requests
- **LRU eviction** + **memory limits** — bounded memory usage (`max_size`, `max_memory`)
- **Per-session isolation** — `gr.Cache(per_session=True)` partitions the cache by user session, preventing data leakage between users

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

### API

- `c.get(key)` — returns a dict of stored data, or `None` on miss
- `c.set(key, **data)` — stores arbitrary keyword data under a key
- `c.keys()` — returns all stored keys (for iteration/prefix matching)
- `c.clear()` — clears all entries

`gr.Cache()` accepts the same `max_size`, `max_memory`, and `per_session` parameters as `@gr.cache`.

## When to Use Caching

`@gr.cache` is most useful for **deterministic** functions where the same input always produces the same output: image classification, audio transcription, embedding computation, structured data extraction.

It is less useful for **non-deterministic** functions like text generation or image generation, where users expect different outputs for the same input. For those, `gr.Cache()` with manual control may be more appropriate — you can cache intermediate state (like KV caches) without caching the output itself.
