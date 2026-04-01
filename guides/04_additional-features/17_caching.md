# Caching Function Results

ML inference is often expensive — image classification, text generation, and audio synthesis can each take seconds or more. If a user submits the same inputs twice, there's no reason to re-run the model. Gradio provides a `@gr.cache` decorator that caches function results with content-aware hashing, so identical inputs return instantly.

Unlike Python's built-in `functools.lru_cache`, `@gr.cache` works with the types you actually use in Gradio: numpy arrays, PIL images, pandas DataFrames, and other unhashable objects. It also handles generators (streaming), async functions, and advanced patterns like prefix caching and semantic similarity matching.

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

You can configure the cache size:

```python
# Limit cache to 64 entries (LRU eviction)
@gr.cache(max_size=64)
def generate(prompt):
    return model(prompt)
```

Every cached function exposes its cache store via `fn.cache`, so you can inspect or clear it:

```python
generate.cache.clear()
print(len(generate.cache))  # number of cached entries
```

## Level 2: Scored Matching with `score_fn`

Basic caching only helps with **exact** input matches. But in many ML applications, inputs are *similar* across calls. The `score_fn` parameter lets you define a scoring function that finds the **best** partial match in the cache.

A `score_fn` takes two arguments — the current call's kwargs and a previously cached entry's kwargs — and returns a float between 0 and 1:

- **0** means no match (cold start — function runs from scratch)
- **1** means perfect match (early terminates the search, returns cached output)
- Values in between represent partial matches; the highest score wins

**How partial matches (scores between 0 and 1) behave depends on whether the function has `gr.CacheVar` parameters** (covered in Level 3):

- **Without `CacheVar`**: the best match's cached output is returned directly — the function is NOT re-executed. This is ideal for semantic or perceptual similarity caching, where "close enough" inputs should return the same result.
- **With `CacheVar`**: the function IS re-executed, with CacheVars restored from the best match. This is needed for stateful patterns like prefix/KV caching where the function must process the new inputs using prior state.

### Similarity caching (without `CacheVar`)

This is useful when similar inputs should return the same cached result:

```python
def image_similarity(curr, prev):
    """Score using cosine similarity of image embeddings."""
    sim = cosine_similarity(embed(curr["image"]), embed(prev["image"]))
    return sim if sim > 0.9 else 0.0  # ignore weak matches

@gr.cache(score_fn=image_similarity)
def classify(image):
    return model.predict(image)
```

With this setup, if a user uploads an image that's 95% similar to a previously classified one, the cached result is returned instantly without re-running the model. The `score_fn` controls the threshold — return 0 for anything you don't consider a valid match.

Here's a simpler example with text similarity:

```python
def text_similarity(curr, prev):
    curr_words = set(curr["prompt"].lower().split())
    prev_words = set(prev["prompt"].lower().split())
    if not curr_words:
        return 0.0
    overlap = len(curr_words & prev_words) / len(curr_words | prev_words)
    return overlap if overlap > 0.5 else 0.0

@gr.cache(score_fn=text_similarity)
def summarize(prompt):
    time.sleep(5)  # expensive summarization
    return model.summarize(prompt)

# "the quick brown fox" and "the quick brown dog" share enough words
# that the second call returns the cached summary instantly.
```

The scoring approach is general. You can use it for:

- **Perceptual similarity**: score = cosine similarity of CLIP embeddings
- **Text overlap**: score = Jaccard similarity of word sets
- **Fuzzy matching**: score = edit distance ratio

Note that when a `score_fn` is provided, exact hash matches are still checked first in O(1) time. The scored search only runs on a hash miss.

## Level 3: Stateful Caching with `gr.CacheVar`

Scored matching without `CacheVar` returns cached output directly — but what if the function needs to **run** using prior state? That's what `gr.CacheVar` is for.

`gr.CacheVar[T]` is a typed cache variable — inspired by Python's `contextvars.ContextVar`. Declare it as a parameter in your function, and the decorator will automatically:

1. Create a fresh `CacheVar` instance for each call
2. On a partial match, **restore** the value from the best-matching cache entry
3. After execution, **save** whatever was `.set()` into the new cache entry

Because `CacheVar` signals that the function has state it needs to update, partial matches (scores between 0 and 1) always **re-execute the function** rather than returning cached output.

```python
def prefix_scorer(curr, prev):
    """Score by chat history prefix overlap."""
    curr_hist, prev_hist = curr["history"], prev["history"]
    if not curr_hist or len(prev_hist) >= len(curr_hist):
        return 0.0
    match_len = sum(1 for c, p in zip(curr_hist, prev_hist) if c == p)
    return match_len / len(curr_hist)

@gr.cache(score_fn=prefix_scorer)
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

@gr.cache(score_fn=kv_scorer)
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

### Multiple CacheVars

You can use multiple `CacheVar` parameters in a single function, and they are tracked independently:

```python
@gr.cache(score_fn=my_scorer)
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

## Summary

| Level | Parameters | Partial match behavior | Use case |
|-------|-----------|----------------------|----------|
| 1 | `@gr.cache` | N/A (exact match only) | Basic memoization |
| 2 | `score_fn` (no `CacheVar`) | Returns best match's output | Similarity / fuzzy caching |
| 3 | `score_fn` + `CacheVar` | Re-executes with restored state | Prefix / KV caching |
