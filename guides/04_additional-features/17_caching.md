# Caching Function Results

ML inference is often expensive — image classification, text generation, and audio synthesis can each take seconds or more. If a user submits the same inputs twice, there's no reason to re-run the model. Gradio provides a `@gr.cache` decorator that caches function results with content-aware hashing, so identical inputs return instantly.

Unlike Python's built-in `functools.lru_cache`, `@gr.cache` works with the types you actually use in Gradio: numpy arrays, PIL images, pandas DataFrames, and other unhashable objects. It also handles generators (streaming) and async functions.

## Basic Usage

Add `@gr.cache` to any function to cache its results. The decorator hashes inputs by their content — two different numpy arrays with the same pixel values will produce a cache hit.

```python
import gradio as gr
import time

@gr.cache
def classify(image):
    time.sleep(3)  # simulate expensive inference
    return model.predict(image)

demo = gr.Interface(fn=classify, inputs="image", outputs="label")
demo.launch()
```

The first call takes 3 seconds. The second call with the same image is instant.

## Generators

For generator functions, `@gr.cache` captures and caches **all yielded values**. On a cache hit, it replays the full sequence of yields — this is important for streaming media (audio/video chunks) where each yield is a piece of the output, not the full result:

```python
@gr.cache
def stream_response(prompt):
    response = ""
    for token in model.generate(prompt):
        response += token
        yield response
    # all yields are cached — next call replays the full streaming sequence
```

## Async Functions

Async functions and async generators work identically:

```python
@gr.cache
async def transcribe(audio):
    return await model.transcribe(audio)
```

## Configuration

You can configure the maximum number of cache entries. When the limit is reached, the least-recently-used entry is evicted:

```python
@gr.cache(max_size=64)
def generate(prompt):
    return model(prompt)
```

The default `max_size` is 128.

Every cached function exposes its cache store via `fn.cache`, so you can inspect or clear it programmatically:

```python
generate.cache.clear()
print(len(generate.cache))  # number of cached entries
```

## Supported Input Types

`@gr.cache` uses content-aware hashing, so it works with all common Gradio input types out of the box:

- **Primitives**: strings, numbers, booleans
- **Collections**: lists, tuples, dicts, sets
- **NumPy arrays**: hashed by shape, dtype, and content
- **PIL Images**: hashed by mode, size, and pixel data
- **Pandas DataFrames/Series**: hashed by columns, index, and values
- **Pydantic models**: hashed via `model_dump()`
- **File paths**: hashed as strings (not file content)
- **Any hashable object**: falls back to `hash()`

## When to Use Caching

`@gr.cache` is most useful for **deterministic** functions — where the same input always produces the same output:

- Image classification
- Audio transcription
- Embedding computation
- Structured data extraction
- Any pure computation

It is less useful for **non-deterministic** functions like text generation or image generation, where users typically expect different outputs for the same input on each run.

## Manual Caching with `gr.cache()`

For more control over what gets cached and when, use `gr.cache()` as an injectable parameter (like `gr.Progress`). Gradio injects the same `cache` object on every call, giving you manual `get`/`set` control:

```python
def my_function(prompt, c=gr.cache()):
    hit = c.get(prompt)
    if hit is not None:
        return hit["result"]
    result = expensive_computation(prompt)
    c.set(prompt, result=result)
    return result
```

You decide what to cache — it doesn't have to be the function's output. For example, you can cache intermediate state like transformer KV caches:

```python
def generate(prompt, c=gr.cache()):
    # Find the longest cached prefix
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

The API:

- `c.get(key)` — returns a dict of stored data, or `None` on miss
- `c.set(key, **data)` — stores arbitrary keyword data under a key
- `c.keys()` — returns all stored keys (for iteration/prefix matching)
- `c.clear()` — clears all entries

Keys can be any type that `@gr.cache` supports (strings, numbers, numpy arrays, etc.). Configure `max_size` via `gr.cache(max_size=256)`.

Note that `gr.cache` is the same object used in both modes — as a decorator it auto-caches, as a parameter it's injected for manual control.
