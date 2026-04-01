# Caching Function Results

ML inference is often expensive — image classification, text generation, and audio synthesis can each take seconds or more. If a user submits the same inputs twice, there's no reason to re-run the model. Gradio provides a `@gr.cache` decorator that caches function results with content-aware hashing, so identical inputs return instantly.

Unlike Python's built-in `functools.lru_cache`, `@gr.cache` works with the types you actually use in Gradio: numpy arrays, PIL images, pandas DataFrames, and other unhashable objects. It also handles generators (streaming), async functions, and advanced patterns like prefix caching.

There are three levels of caching you can use, depending on your needs.

## Level 1: Basic Caching

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

### Generators

For generator functions, `@gr.cache` captures and caches the **final yielded value**. On a cache hit, it yields that final value once instead of re-running the generator:

```python
@gr.cache
def stream_response(prompt):
    response = ""
    for token in model.generate(prompt):
        response += token
        yield response
    # final yield is cached — next call with same prompt returns it instantly
```

### Async functions

Async functions and async generators work identically:

```python
@gr.cache
async def transcribe(audio):
    return await model.transcribe(audio)
```

### Configuration

You can configure the cache size and provide a custom key function:

```python
# Limit cache to 64 entries (LRU eviction)
@gr.cache(max_size=64)
def generate(prompt):
    return model(prompt)

# Only cache based on certain inputs (ignore temperature and seed)
@gr.cache(key=lambda kw: kw["prompt"])
def generate(prompt, temperature=0.7, seed=42):
    return model(prompt, temperature=temperature, seed=seed)
```

The `key` parameter receives the normalized kwargs dict and returns a hashable cache key. This is useful when some inputs (like random seeds or sampling parameters) shouldn't affect cache lookup.

Every cached function exposes its cache store via `fn.cache`, so you can inspect or clear it:

```python
generate.cache.clear()
print(len(generate.cache))  # number of cached entries
```

## Level 2: Scored Matching with `match_fn`

Basic caching only helps with **exact** input matches. But in many ML applications, inputs are *similar* across calls — for example, a chatbot where each message appends to the conversation history. The `match_fn` parameter lets you define a scoring function that finds the **best** partial match in the cache.

A `match_fn` takes two arguments — the current call's kwargs and a previous cached entry's kwargs — and returns a float between 0 and 1:

- **0** means no match
- **1** means perfect match (early terminates the search)
- Values in between represent partial matches; the highest score wins

```python
def prefix_scorer(curr, prev):
    """Score = fraction of current history covered by cached prefix."""
    curr_hist = curr["history"]
    prev_hist = prev["history"]
    if not curr_hist or len(prev_hist) >= len(curr_hist):
        return 0.0
    match_len = 0
    for c, p in zip(curr_hist, prev_hist):
        if c == p:
            match_len += 1
        else:
            break
    return match_len / len(curr_hist)

@gr.cache(match_fn=prefix_scorer)
def respond(history):
    # On a partial match, this function still runs — but see Level 3
    # for how to actually *use* the cached state
    return call_llm(history)
```

The scoring approach is general. You can use it for:

- **Prefix matching**: score = length of matching prefix / total length
- **Similarity search**: score = cosine similarity of embeddings (clipped to [0, 1])
- **Fuzzy matching**: score = edit distance ratio

Note that when a `match_fn` is provided, exact hash matches (score = 1.0) are still checked first in O(1) time. The scored search only runs on a hash miss.

## Level 3: Stateful Caching with `gr.CacheVar`

Scored matching tells you *which* cached entry is closest, but how do you actually use the cached intermediate state? That's what `gr.CacheVar` is for.

`gr.CacheVar[T]` is a typed cache variable — like `contextvars.ContextVar` but for cache entries. Declare it as a parameter in your function, and the decorator will automatically:

1. Create a fresh `CacheVar` instance for each call
2. On a partial match, **restore** the value from the best-matching cache entry
3. After execution, **save** whatever was `.set()` into the new cache entry

```python
@gr.cache(match_fn=prefix_scorer)
def respond(history, context: gr.CacheVar[str] = None):
    prev_context = context.get("")  # "" on cold start, restored on match

    response = call_llm(history, previous_context=prev_context)
    context.set(response)  # saved for future matches

    return response
```

### KV Cache Reuse

The most powerful application of `gr.CacheVar` is reusing transformer KV caches. When a user extends a prompt, the key-value states from the prefix can be restored instead of recomputed:

```python
def kv_scorer(curr, prev):
    """Score by character-level prefix overlap."""
    curr_text, prev_text = curr["prompt"], prev["prompt"]
    if not curr_text or len(prev_text) >= len(curr_text):
        return 0.0
    match_len = next(
        (i for i, (a, b) in enumerate(zip(curr_text, prev_text)) if a != b),
        min(len(curr_text), len(prev_text)),
    )
    return match_len / len(curr_text)

@gr.cache(match_fn=kv_scorer)
def generate(prompt: str, kv_cache: gr.CacheVar[tuple] = None):
    past_key_values = kv_cache.get()  # None on cold start

    output = model.generate(
        prompt,
        past_key_values=past_key_values,
    )

    kv_cache.set(model.past_key_values)  # save for prefix reuse
    return output.text
```

With this setup:

1. `generate("The quick brown")` — cold start, computes all KV states from scratch
2. `generate("The quick brown")` — exact hash hit, returns cached result instantly
3. `generate("The quick brown fox jumps")` — prefix match (score ~0.6), restores KV cache from step 1, only computes KV states for " fox jumps"

You can use multiple `CacheVar` parameters in a single function, and they are tracked independently:

```python
@gr.cache(match_fn=my_scorer)
def process(
    data,
    embeddings: gr.CacheVar[np.ndarray] = None,
    metadata: gr.CacheVar[dict] = None,
):
    prev_emb = embeddings.get()
    prev_meta = metadata.get({})
    # ... use and update both ...
    embeddings.set(new_emb)
    metadata.set(new_meta)
```

`CacheVar` parameters are automatically excluded from the cache key — only your regular inputs determine cache lookup.
