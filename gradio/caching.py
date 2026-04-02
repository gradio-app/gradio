"""Caching utilities for Gradio.

Provides:
- @gr.cache: a decorator that caches function results with content-aware
  hashing for ML types (numpy arrays, PIL images, DataFrames, etc.).
  Supports sync/async functions and sync/async generators.
- Generator utilities shared with example caching in helpers.py.
"""

from __future__ import annotations

import functools
import hashlib
import inspect
import threading
from collections import OrderedDict
from collections.abc import AsyncIterator, Callable, Iterator
from typing import Any


# ============================================================
# Content-aware hashing
# ============================================================


def cache_hash(obj: Any) -> str:
    """Compute a content-aware hash for objects commonly used in Gradio.

    Handles: primitives, bytes, dicts, lists, tuples, sets, numpy arrays,
    PIL Images, pandas DataFrames/Series, Pydantic models, and any Hashable.

    Raises TypeError for objects that can't be deterministically hashed.
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
            idx_hash = hashlib.sha256(obj.index.to_numpy().tobytes()).hexdigest()
            return f"DF({col_hash},{val_hash},{idx_hash})"
    except ImportError:
        pass

    # Pydantic BaseModel
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
            idx_hash = hashlib.sha256(obj.index.to_numpy().tobytes()).hexdigest()
            return f"Series({name_hash},{val_hash},{idx_hash})"
    except ImportError:
        pass

    # Generic hashable
    try:
        return repr(hash(obj))
    except TypeError:
        pass

    # Last resort: try __dict__ for dataclass-like objects
    if hasattr(obj, "__dict__"):
        return _hash_repr(vars(obj))

    raise TypeError(
        f"gr.cache: cannot hash object of type {type(obj).__name__}. "
        f"Preprocess your inputs into hashable types before passing them."
    )


# ============================================================
# Generator utilities (shared with helpers.py example caching)
# ============================================================


def resolve_generator(
    fn: Callable,
) -> tuple[Callable, list | None]:
    """Wrap a generator function to capture yields and return the final value.

    If ``fn`` is a sync/async generator, returns a wrapped version that:
    - Iterates the generator to exhaustion
    - Appends every yielded value to ``generated_values``
    - Returns only the final yielded value

    If ``fn`` is a regular (non-generator) function, returns it unchanged.

    Returns:
        (wrapped_fn, generated_values) where generated_values is a list
        that will be populated with all yields (or None for non-generators).
    """
    if inspect.isgeneratorfunction(fn):
        generated_values: list = []

        def wrapper(*args, **kwargs):
            x = None
            generated_values.clear()
            for x in fn(*args, **kwargs):  # noqa: B007
                generated_values.append(x)
            return x

        return wrapper, generated_values

    elif inspect.isasyncgenfunction(fn):
        generated_values = []

        async def wrapper(*args, **kwargs):
            x = None
            generated_values.clear()
            async for x in fn(*args, **kwargs):  # noqa: B007
                generated_values.append(x)
            return x

        return wrapper, generated_values

    return fn, None


# ============================================================
# Cache store
# ============================================================


class CacheStore:
    """Thread-safe LRU cache store."""

    def __init__(self, max_size: int = 128):
        self._max_size = max_size
        self._exact: OrderedDict[str, dict] = OrderedDict()
        self._lock = threading.Lock()

    def get(self, key_hash: str) -> dict | None:
        """Get cached entry by hash key. Returns None on miss.

        Returns a dict with "value" (for regular functions) or
        "yields" (list of all yielded values, for generators).
        """
        with self._lock:
            if key_hash in self._exact:
                self._exact.move_to_end(key_hash)
                return self._exact[key_hash]
            return None

    def put(self, key_hash: str, **entry: Any) -> None:
        """Store a cache entry. Evicts LRU entry if at capacity.

        For regular functions: ``store.put(key, value=result)``
        For generators: ``store.put(key, yields=[v1, v2, ...])``
        """
        with self._lock:
            if key_hash in self._exact:
                self._exact.move_to_end(key_hash)
                self._exact[key_hash] = entry
            else:
                if self._max_size > 0 and len(self._exact) >= self._max_size:
                    self._exact.popitem(last=False)
                self._exact[key_hash] = entry

    def clear(self) -> None:
        with self._lock:
            self._exact.clear()

    def __len__(self) -> int:
        with self._lock:
            return len(self._exact)


# ============================================================
# @gr.cache decorator
# ============================================================


def _normalize_kwargs(func: Callable, args: tuple, kwargs: dict) -> dict:
    """Normalize positional + keyword args into a single kwargs dict."""
    sig = inspect.signature(func)
    bound = sig.bind(*args, **kwargs)
    bound.apply_defaults()
    return dict(bound.arguments)


def cache(
    fn: Callable | None = None,
    *,
    max_size: int = 128,
):
    """Cache decorator for Gradio functions.

    Caches function results using content-aware hashing that works with
    numpy arrays, PIL images, pandas DataFrames, and other Gradio types.

    Works with sync functions, async functions, sync generators, and
    async generators. For generators, caches the final yielded value.

    Parameters:
        fn: The function to cache (allows use as @gr.cache without parentheses).
        max_size: Maximum number of cache entries. 0 for unlimited.
            Least-recently-used entries are evicted when full. Default: 128.

    Examples:
        Basic usage::

            @gr.cache
            def classify(image):
                return model.predict(image)

        With configuration::

            @gr.cache(max_size=256)
            def generate(prompt):
                return llm(prompt)

        Generator (caches final yield)::

            @gr.cache
            def stream_response(prompt):
                response = ""
                for token in model.generate(prompt):
                    response += token
                    yield response
    """

    def decorator(func: Callable) -> Callable:
        store = CacheStore(max_size)

        if inspect.isgeneratorfunction(func):

            @functools.wraps(func)
            def sync_gen_wrapper(*args, **kwargs):
                normalized = _normalize_kwargs(func, args, kwargs)
                key_hash = cache_hash(normalized)

                entry = store.get(key_hash)
                if entry is not None:
                    yield from entry["yields"]
                    return

                all_yields = []
                for value in func(**normalized):
                    all_yields.append(value)
                    yield value

                if all_yields:
                    store.put(key_hash, yields=all_yields)

            sync_gen_wrapper.cache = store  # type: ignore
            return sync_gen_wrapper

        elif inspect.isasyncgenfunction(func):

            @functools.wraps(func)
            async def async_gen_wrapper(*args, **kwargs):
                normalized = _normalize_kwargs(func, args, kwargs)
                key_hash = cache_hash(normalized)

                entry = store.get(key_hash)
                if entry is not None:
                    for value in entry["yields"]:
                        yield value
                    return

                all_yields = []
                async for value in func(**normalized):
                    all_yields.append(value)
                    yield value

                if all_yields:
                    store.put(key_hash, yields=all_yields)

            async_gen_wrapper.cache = store  # type: ignore
            return async_gen_wrapper

        elif inspect.iscoroutinefunction(func):

            @functools.wraps(func)
            async def async_wrapper(*args, **kwargs):
                normalized = _normalize_kwargs(func, args, kwargs)
                key_hash = cache_hash(normalized)

                entry = store.get(key_hash)
                if entry is not None:
                    return entry["value"]

                result = await func(**normalized)
                store.put(key_hash, value=result)
                return result

            async_wrapper.cache = store  # type: ignore
            return async_wrapper

        else:

            @functools.wraps(func)
            def sync_wrapper(*args, **kwargs):
                normalized = _normalize_kwargs(func, args, kwargs)
                key_hash = cache_hash(normalized)

                entry = store.get(key_hash)
                if entry is not None:
                    return entry["value"]

                result = func(**normalized)
                store.put(key_hash, value=result)
                return result

            sync_wrapper.cache = store  # type: ignore
            return sync_wrapper

    if fn is not None:
        return decorator(fn)
    return decorator
