"""Caching decorator for Gradio functions.

Provides @gr.cache, a decorator that caches function results with
content-aware hashing for ML types (numpy arrays, PIL images, DataFrames, etc.).

Supports sync functions, async functions, sync generators, and async generators.
Optionally supports partial/prefix matching via a custom match_fn.
"""

from __future__ import annotations

import functools
import hashlib
import inspect
import threading
from collections import OrderedDict
from typing import Any, Callable


def cache_hash(obj: Any) -> str:
    """Compute a content-aware hash for objects commonly used in Gradio.

    Handles: primitives, bytes, dicts, lists, tuples, sets, numpy arrays,
    PIL Images, pandas DataFrames, and any Hashable object.

    Raises TypeError for unhashable objects that we don't recognize,
    rather than falling back to id() (which would make cache hits impossible).
    """
    hasher = hashlib.sha256()
    hasher.update(_hash_repr(obj).encode("utf-8"))
    return hasher.hexdigest()


def _hash_repr(obj: Any) -> str:
    """Return a deterministic string representation for hashing."""
    if obj is None:
        return "None"
    if isinstance(obj, (bool, int, float, str)):
        return repr(obj)
    if isinstance(obj, bytes):
        return hashlib.sha256(obj).hexdigest()
    if isinstance(obj, (list, tuple)):
        inner = ",".join(_hash_repr(x) for x in obj)
        tag = "L" if isinstance(obj, list) else "T"
        return f"{tag}[{inner}]"
    if isinstance(obj, dict):
        pairs = sorted(
            ((repr(k), _hash_repr(v)) for k, v in obj.items()),
            key=lambda x: x[0],
        )
        inner = ",".join(f"{k}:{v}" for k, v in pairs)
        return f"D{{{inner}}}"
    if isinstance(obj, set):
        items = sorted(_hash_repr(x) for x in obj)
        return f"S{{{','.join(items)}}}"

    # numpy array
    try:
        import numpy as np

        if isinstance(obj, np.ndarray):
            return f"np({obj.shape},{obj.dtype},{hashlib.sha256(obj.tobytes()).hexdigest()})"
    except ImportError:
        pass

    # PIL Image
    try:
        from PIL import Image

        if isinstance(obj, Image.Image):
            return f"PIL({obj.mode},{obj.size},{hashlib.sha256(obj.tobytes()).hexdigest()})"
    except ImportError:
        pass

    # pandas DataFrame
    try:
        import pandas as pd

        if isinstance(obj, pd.DataFrame):
            col_hash = _hash_repr(list(obj.columns))
            val_hash = hashlib.sha256(obj.values.tobytes()).hexdigest()
            return f"DF({col_hash},{val_hash})"
    except ImportError:
        pass

    # Pydantic BaseModel (used by PlotData, GradioModel, etc.)
    try:
        from pydantic import BaseModel

        if isinstance(obj, BaseModel):
            return _hash_repr(obj.model_dump())
    except ImportError:
        pass

    # pandas Series
    try:
        import pandas as pd

        if isinstance(obj, pd.Series):
            name_hash = _hash_repr(obj.name)
            val_hash = hashlib.sha256(obj.values.tobytes()).hexdigest()
            return f"Series({name_hash},{val_hash})"
    except ImportError:
        pass

    # Generic hashable
    try:
        return repr(hash(obj))
    except TypeError:
        pass

    # Last resort: try model_dump / __dict__ for dataclass-like objects
    if hasattr(obj, "__dict__"):
        return _hash_repr(vars(obj))

    raise TypeError(
        f"gr.cache: cannot hash object of type {type(obj).__name__}. "
        f"Use the `key` parameter to provide a custom cache key function."
    )


class CacheStore:
    """Thread-safe LRU cache store with optional partial matching."""

    def __init__(self, max_size: int = 128):
        self._max_size = max_size
        self._exact: OrderedDict[str, dict] = OrderedDict()
        self._entries: list[dict] = []  # for match_fn iteration
        self._lock = threading.Lock()

    def get_exact(self, key_hash: str) -> dict | None:
        with self._lock:
            if key_hash in self._exact:
                self._exact.move_to_end(key_hash)
                return self._exact[key_hash]
            return None

    def find_partial(
        self,
        new_kwargs: dict,
        match_fn: Callable,
    ) -> dict | None:
        """Iterate entries to find a partial match via match_fn.

        Returns modified kwargs from match_fn, or None.
        """
        with self._lock:
            entries_snapshot = list(self._entries)

        # Iterate outside the lock — match_fn is user code
        for entry in reversed(entries_snapshot):
            result = match_fn(
                entry["full_kwargs"], new_kwargs, entry["final_value"]
            )
            if result is not None:
                return result
        return None

    def put(self, key_hash: str, full_kwargs: dict, final_value: Any) -> None:
        entry = {
            "full_kwargs": full_kwargs,
            "final_value": final_value,
            "hash": key_hash,
        }
        with self._lock:
            if key_hash in self._exact:
                # Update existing entry
                self._exact.move_to_end(key_hash)
                self._exact[key_hash] = entry
                # Update in _entries list too
                self._entries = [
                    e for e in self._entries if e["hash"] != key_hash
                ]
                self._entries.append(entry)
            else:
                # Evict if at capacity
                if self._max_size > 0 and len(self._exact) >= self._max_size:
                    _, evicted = self._exact.popitem(last=False)
                    self._entries = [
                        e for e in self._entries if e["hash"] != evicted["hash"]
                    ]
                self._exact[key_hash] = entry
                self._entries.append(entry)

    def clear(self) -> None:
        with self._lock:
            self._exact.clear()
            self._entries.clear()

    def __len__(self) -> int:
        with self._lock:
            return len(self._exact)


def _normalize_kwargs(func: Callable, args: tuple, kwargs: dict) -> dict:
    """Normalize positional + keyword args into a single kwargs dict."""
    sig = inspect.signature(func)
    bound = sig.bind(*args, **kwargs)
    bound.apply_defaults()
    return dict(bound.arguments)


def cache(
    fn: Callable | None = None,
    *,
    match_fn: Callable | None = None,
    max_size: int = 128,
    key: Callable | None = None,
):
    """Cache decorator for Gradio functions.

    Caches function results using content-aware hashing that works with
    numpy arrays, PIL images, pandas DataFrames, and other Gradio types.

    Works with sync functions, async functions, sync generators, and
    async generators. For generators, caches the final yielded value.

    Parameters:
        fn: The function to cache (allows use as @gr.cache without parentheses).
        match_fn: Optional function for partial/prefix matching. Called as
            match_fn(cached_kwargs, new_kwargs, cached_result) -> dict | None.
            If it returns a dict, that dict is used as kwargs to execute the
            function (allowing injection of cached state). If None, no match.
        max_size: Maximum number of cache entries. 0 for unlimited.
            Least-recently-used entries are evicted when full. Default: 128.
        key: Optional function that takes the normalized kwargs dict and returns
            a hashable cache key. Overrides default content-aware hashing.
            Useful for ignoring certain inputs (e.g., temperature, seed).

    Examples:
        Basic usage::

            @gr.cache
            def classify(image):
                return model.predict(image)

        With configuration::

            @gr.cache(max_size=256)
            def generate(prompt, temperature=0.7):
                return llm(prompt, temperature)

        Ignore certain inputs::

            @gr.cache(key=lambda kw: kw["prompt"])
            def generate(prompt, temperature=0.7, seed=42):
                return llm(prompt, temperature, seed)

        Prefix caching with match_fn::

            def prefix_match(cached_kw, new_kw, cached_result):
                old_hist = cached_kw["history"]
                new_hist = new_kw["history"]
                if (len(new_hist) > len(old_hist)
                        and new_hist[:len(old_hist)] == old_hist):
                    return {**new_kw, "previous_response": cached_result}
                return None

            @gr.cache(match_fn=prefix_match)
            def respond(history, previous_response=None):
                if previous_response:
                    return call_llm(history, context=previous_response)
                return call_llm(history)
    """

    def decorator(func: Callable) -> Callable:
        store = CacheStore(max_size)

        def _compute_hash(normalized_kwargs: dict) -> str:
            if key is not None:
                return cache_hash(key(normalized_kwargs))
            return cache_hash(normalized_kwargs)

        if inspect.isgeneratorfunction(func):

            @functools.wraps(func)
            def sync_gen_wrapper(*args, **kwargs):
                normalized = _normalize_kwargs(func, args, kwargs)
                key_hash = _compute_hash(normalized)

                # Stage 1: Exact match
                entry = store.get_exact(key_hash)
                if entry is not None:
                    yield entry["final_value"]
                    return

                # Stage 2: Partial match
                kwargs_to_execute = normalized
                if match_fn is not None:
                    partial_result = store.find_partial(normalized, match_fn)
                    if partial_result is not None:
                        kwargs_to_execute = partial_result

                # Stage 3: Execute
                final_value = None
                for value in func(**kwargs_to_execute):
                    final_value = value
                    yield value

                if final_value is not None:
                    store.put(key_hash, normalized, final_value)

            sync_gen_wrapper.cache = store  # type: ignore
            return sync_gen_wrapper

        elif inspect.isasyncgenfunction(func):

            @functools.wraps(func)
            async def async_gen_wrapper(*args, **kwargs):
                normalized = _normalize_kwargs(func, args, kwargs)
                key_hash = _compute_hash(normalized)

                # Stage 1: Exact match
                entry = store.get_exact(key_hash)
                if entry is not None:
                    yield entry["final_value"]
                    return

                # Stage 2: Partial match
                kwargs_to_execute = normalized
                if match_fn is not None:
                    partial_result = store.find_partial(normalized, match_fn)
                    if partial_result is not None:
                        kwargs_to_execute = partial_result

                # Stage 3: Execute
                final_value = None
                async for value in func(**kwargs_to_execute):
                    final_value = value
                    yield value

                if final_value is not None:
                    store.put(key_hash, normalized, final_value)

            async_gen_wrapper.cache = store  # type: ignore
            return async_gen_wrapper

        elif inspect.iscoroutinefunction(func):

            @functools.wraps(func)
            async def async_wrapper(*args, **kwargs):
                normalized = _normalize_kwargs(func, args, kwargs)
                key_hash = _compute_hash(normalized)

                # Stage 1: Exact match
                entry = store.get_exact(key_hash)
                if entry is not None:
                    return entry["final_value"]

                # Stage 2: Partial match
                kwargs_to_execute = normalized
                if match_fn is not None:
                    partial_result = store.find_partial(normalized, match_fn)
                    if partial_result is not None:
                        kwargs_to_execute = partial_result

                # Stage 3: Execute
                result = await func(**kwargs_to_execute)
                store.put(key_hash, normalized, result)
                return result

            async_wrapper.cache = store  # type: ignore
            return async_wrapper

        else:

            @functools.wraps(func)
            def sync_wrapper(*args, **kwargs):
                normalized = _normalize_kwargs(func, args, kwargs)
                key_hash = _compute_hash(normalized)

                # Stage 1: Exact match
                entry = store.get_exact(key_hash)
                if entry is not None:
                    return entry["final_value"]

                # Stage 2: Partial match
                kwargs_to_execute = normalized
                if match_fn is not None:
                    partial_result = store.find_partial(normalized, match_fn)
                    if partial_result is not None:
                        kwargs_to_execute = partial_result

                # Stage 3: Execute
                result = func(**kwargs_to_execute)
                store.put(key_hash, normalized, result)
                return result

            sync_wrapper.cache = store  # type: ignore
            return sync_wrapper

    if fn is not None:
        return decorator(fn)
    return decorator
