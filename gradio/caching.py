"""Caching utilities for Gradio functions."""

from __future__ import annotations

import copy
import functools
import hashlib
import inspect
import sys
import threading
import weakref
from collections import OrderedDict
from collections.abc import Callable
from contextvars import ContextVar
from typing import Any

import numpy as np
import pandas as pd
from gradio_client.documentation import document
from PIL import Image
from pydantic import BaseModel


def cache_hash(obj: Any) -> str:
    hasher = hashlib.sha256()
    hasher.update(_hash_repr(obj).encode("utf-8"))
    return hasher.hexdigest()


def _hash_repr(obj: Any) -> str:
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
    if isinstance(obj, np.ndarray):
        return (
            f"np({obj.shape},{obj.dtype},{hashlib.sha256(obj.tobytes()).hexdigest()})"
        )
    if isinstance(obj, Image.Image):
        return f"PIL({obj.mode},{obj.size},{hashlib.sha256(obj.tobytes()).hexdigest()})"
    if isinstance(obj, pd.DataFrame):
        col_hash = _hash_repr(list(obj.columns))
        val_hash = hashlib.sha256(
            pd.util.hash_pandas_object(obj, index=False).to_numpy().tobytes()
        ).hexdigest()
        idx_hash = hashlib.sha256(
            pd.util.hash_pandas_object(obj.index).to_numpy().tobytes()
        ).hexdigest()
        return f"DF({col_hash},{val_hash},{idx_hash})"
    if isinstance(obj, BaseModel):
        return _hash_repr(obj.model_dump())
    if isinstance(obj, pd.Series):
        name_hash = _hash_repr(obj.name)
        val_hash = hashlib.sha256(
            pd.util.hash_pandas_object(obj, index=False).to_numpy().tobytes()
        ).hexdigest()
        idx_hash = hashlib.sha256(
            pd.util.hash_pandas_object(obj.index).to_numpy().tobytes()
        ).hexdigest()
        return f"Series({name_hash},{val_hash},{idx_hash})"
    try:
        return repr(hash(obj))
    except TypeError:
        pass
    if hasattr(obj, "__dict__"):
        return _hash_repr(vars(obj))
    raise TypeError(
        f"gr.cache: cannot hash object of type {type(obj).__name__}. "
        f"Preprocess your inputs into hashable types before passing them."
    )


def resolve_generator(fn: Callable) -> tuple[Callable, list | None]:
    """Wrap a generator to capture all yields and return the final value.

    Returns (wrapped_fn, generated_values) or (fn, None) for non-generators.
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


def _estimate_size(obj: Any) -> int:
    if isinstance(obj, np.ndarray):
        return obj.nbytes
    if isinstance(obj, Image.Image):
        return obj.size[0] * obj.size[1] * len(obj.getbands())
    if isinstance(obj, pd.DataFrame):
        return obj.memory_usage(deep=True).sum()
    if isinstance(obj, pd.Series):
        return obj.memory_usage(deep=True)
    if isinstance(obj, (bytes, bytearray)):
        return len(obj)
    if isinstance(obj, str):
        return sys.getsizeof(obj)
    try:
        import torch

        if isinstance(obj, torch.Tensor):
            return obj.nelement() * obj.element_size()
    except ImportError:
        pass
    if isinstance(obj, dict):
        return sum(_estimate_size(v) for v in obj.values())
    if isinstance(obj, (list, tuple)):
        return sum(_estimate_size(v) for v in obj)
    return sys.getsizeof(obj)


def _get_session_hash() -> str | None:
    try:
        from gradio.context import LocalContext

        req = LocalContext.request.get(None)
        if req is not None:
            return req.session_hash
    except Exception:
        pass
    return None


class _CacheStore:
    def __init__(
        self,
        max_size: int = 128,
        max_memory: int | None = None,
        per_session: bool = False,
    ):
        self._max_size = max_size
        self._max_memory = max_memory
        self._per_session = per_session
        self._exact: OrderedDict[str, dict] = OrderedDict()
        self._entry_sizes: dict[str, int] = {}
        self._total_memory: int = 0
        self._lock = threading.Lock()
        if self._per_session:
            _per_session_stores.add(self)

    def _session_prefix(self, session_hash: str | None = None) -> str:
        session = session_hash or _get_session_hash() or "_global"
        return f"{session}:"

    def _session_key(self, key_hash: str) -> str:
        if not self._per_session:
            return key_hash
        return f"{self._session_prefix()}{key_hash}"

    def get(self, key_hash: str) -> dict | None:
        full_key = self._session_key(key_hash)
        with self._lock:
            if full_key in self._exact:
                self._exact.move_to_end(full_key)
                return self._exact[full_key]
            return None

    def put(self, key_hash: str, **entry: Any) -> None:
        full_key = self._session_key(key_hash)
        entry_size = _estimate_size(entry) if self._max_memory else 0
        with self._lock:
            if full_key in self._exact:
                self._total_memory -= self._entry_sizes.get(full_key, 0)
                self._exact.move_to_end(full_key)
                self._exact[full_key] = entry
                self._entry_sizes[full_key] = entry_size
                self._total_memory += entry_size
            else:
                self._exact[full_key] = entry
                self._entry_sizes[full_key] = entry_size
                self._total_memory += entry_size
            self._evict()

    def _evict(self) -> None:
        while self._exact:
            over_count = self._max_size > 0 and len(self._exact) > self._max_size
            over_memory = (
                self._max_memory is not None
                and self._total_memory > self._max_memory
                and len(self._exact) > 1
            )
            if not over_count and not over_memory:
                break
            key, _ = self._exact.popitem(last=False)
            self._total_memory -= self._entry_sizes.pop(key, 0)

    def clear(self) -> None:
        with self._lock:
            self._exact.clear()
            self._entry_sizes.clear()
            self._total_memory = 0

    def clear_session(self, session_hash: str | None = None) -> None:
        if not self._per_session:
            return
        session_prefix = self._session_prefix(session_hash)
        with self._lock:
            keys_to_delete = [
                key for key in self._exact if key.startswith(session_prefix)
            ]
            for key in keys_to_delete:
                self._exact.pop(key, None)
                self._total_memory -= self._entry_sizes.pop(key, 0)

    def keys(self) -> list[Any]:
        with self._lock:
            if not self._per_session:
                return [entry.get("_key") for entry in self._exact.values()]

            session_prefix = self._session_prefix()
            return [
                entry.get("_key")
                for key, entry in self._exact.items()
                if key.startswith(session_prefix)
            ]

    def __len__(self) -> int:
        with self._lock:
            return len(self._exact)


_per_session_stores: weakref.WeakSet[_CacheStore] = weakref.WeakSet()


def _normalize_kwargs(signature: inspect.Signature, args: tuple, kwargs: dict) -> dict:
    bound = signature.bind(*args, **kwargs)
    bound.apply_defaults()
    return dict(bound.arguments)


class CacheMissError(Exception):
    pass


_probe_mode_active: ContextVar[bool] = ContextVar(
    "gradio_probe_cache_active", default=False
)
_manual_cache_used: ContextVar[dict[str, bool] | None] = ContextVar(
    "gradio_manual_cache_used", default=None
)


class ProbeCache:
    """Context manager for probe mode. Wrappers raise CacheMiss instead of
    running the function on a miss. Used by the queue for cache bypass."""

    def __enter__(self):
        self._token = _probe_mode_active.set(True)
        return self

    def __exit__(self, *exc):
        _probe_mode_active.reset(self._token)
        return False


class TrackManualCacheUsage:
    """Context manager for tracking whether gr.Cache.get() had a hit during a call."""

    def __enter__(self):
        self._holder = {"used": False}
        self._token = _manual_cache_used.set(self._holder)
        return self

    def __exit__(self, *exc):
        _manual_cache_used.reset(self._token)
        return False


def mark_manual_cache_hit() -> None:
    holder = _manual_cache_used.get()
    if holder is not None:
        holder["used"] = True


def used_manual_cache() -> bool:
    holder = _manual_cache_used.get()
    return holder["used"] if holder is not None else False


def _make_store(
    max_size: int,
    max_memory: str | int | None,
    per_session: bool,
) -> _CacheStore:
    from gradio.utils import _parse_file_size

    return _CacheStore(
        max_size=max_size,
        max_memory=_parse_file_size(max_memory),
        per_session=per_session,
    )


def clear_session_caches(session_hash: str | None) -> None:
    for store in list(_per_session_stores):
        store.clear_session(session_hash)


def _make_wrapper(
    func: Callable, store: _CacheStore, key: Callable | None = None
) -> Callable:
    signature = inspect.signature(func)

    def _compute_hash(normalized: dict) -> str:
        if key is not None:
            return cache_hash(key(normalized))
        return cache_hash(normalized)

    def _on_miss():
        if _probe_mode_active.get():
            raise CacheMissError()

    if inspect.isgeneratorfunction(func):

        @functools.wraps(func)
        def sync_gen_wrapper(*args, **kwargs):
            normalized = _normalize_kwargs(signature, args, kwargs)
            key_hash = _compute_hash(normalized)
            entry = store.get(key_hash)
            if entry is not None:
                yield from entry["yields"]
                return
            _on_miss()
            all_yields = []
            for value in func(**normalized):
                all_yields.append(copy.deepcopy(value))
                yield value
            store.put(key_hash, yields=all_yields)

        return sync_gen_wrapper

    elif inspect.isasyncgenfunction(func):

        @functools.wraps(func)
        async def async_gen_wrapper(*args, **kwargs):
            normalized = _normalize_kwargs(signature, args, kwargs)
            key_hash = _compute_hash(normalized)
            entry = store.get(key_hash)
            if entry is not None:
                for value in entry["yields"]:
                    yield value
                return
            _on_miss()
            all_yields = []
            async for value in func(**normalized):
                all_yields.append(copy.deepcopy(value))
                yield value
            store.put(key_hash, yields=all_yields)

        return async_gen_wrapper

    elif inspect.iscoroutinefunction(func):

        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            normalized = _normalize_kwargs(signature, args, kwargs)
            key_hash = _compute_hash(normalized)
            entry = store.get(key_hash)
            if entry is not None:
                return entry["value"]
            _on_miss()
            result = await func(**normalized)
            store.put(key_hash, value=result)
            return result

        return async_wrapper

    else:

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            normalized = _normalize_kwargs(signature, args, kwargs)
            key_hash = _compute_hash(normalized)
            entry = store.get(key_hash)
            if entry is not None:
                return entry["value"]
            _on_miss()
            result = func(**normalized)
            store.put(key_hash, value=result)
            return result

        return sync_wrapper


@document()
def cache(
    fn: Callable | None = None,
    *,
    key: Callable | None = None,
    max_size: int = 128,
    max_memory: str | int | None = None,
    per_session: bool = False,
):
    """
    Decorator that auto-caches function results based on content-hashed inputs. Works with sync/async functions and sync/async generators. For generators, all yielded values are cached and replayed on hit. Cache hits bypass the Gradio queue.
    Parameters:
        fn: The function to cache. When used as @gr.cache without parentheses, this is the decorated function. When used as @gr.cache(...), this is None.
        key: Optional function that receives the kwargs dict and returns a hashable cache key, e.g. to only cache based on the prompt, pass in: lambda kw: kw["prompt"]
        max_size: Maximum number of cache entries. Least-recently-used entries are evicted when full. Set to 0 for unlimited. Default: 128.
        max_memory: Maximum total memory usage before eviction. Accepts strings like "512mb", "2gb" or integer bytes. When exceeded, least-recently-used entries are evicted. If None, no memory limit is applied. If both max_size and max_memory are set, the cache will evict entries when either limit is reached.
        per_session: When True, each user session gets an isolated cache namespace, preventing cached results from leaking between users. Per-session entries are cleared when the client session disconnects. The max_size and max_memory limits apply to the sum of all entries across all sessions.
    Example:
        import gradio as gr
        @gr.cache
        def classify(image):
            return model.predict(image)
        @gr.cache(max_size=256, per_session=True)
        def generate(prompt):
            return llm(prompt)
    """
    store = _make_store(max_size, max_memory, per_session)

    def decorator(func: Callable) -> Callable:
        wrapper = _make_wrapper(func, store, key=key)
        wrapper.cache = store  # type: ignore
        return wrapper

    if fn is not None:
        return decorator(fn)
    return decorator


@document("get", "set", "keys", "clear")
class Cache:
    """
    Thread-safe cache with manual get/set control, injected as a function parameter (add as a default parameter value and Gradio will inject it automatically). Supports per-session isolation so cached data doesn't leak between users, content-aware hashing for ML types (numpy, PIL, pandas), and LRU eviction with memory limits.
    Parameters:
        max_size: Maximum number of cache entries. Least-recently-used entries are evicted when full. Set to 0 for unlimited. Default: 128.
        max_memory: Maximum total memory usage before eviction. Accepts strings like "512mb", "2gb" or integer bytes.
        per_session: When True, each user session gets an isolated cache namespace, preventing cached data from leaking between users. Per-session entries are cleared when the client session disconnects. The max_size and max_memory limits still apply to the shared underlying cache store across all sessions. Default: False.
    Example:
        import gradio as gr
        def generate(prompt, c=gr.Cache(per_session=True)):
            hit = c.get(prompt)
            if hit is not None:
                return model(prompt, past=hit["kv"])
            output = model(prompt)
            c.set(prompt, kv=model.past_key_values)
            return output
    """

    def __init__(
        self,
        *,
        max_size: int = 128,
        max_memory: str | int | None = None,
        per_session: bool = False,
    ):
        self._store = _make_store(max_size, max_memory, per_session)

    def get(self, key: Any) -> dict | None:
        """
        Look up a cache entry by key. Returns a dict of stored data, or None on miss. Keys can be any type supported by gr.cache (strings, numbers, numpy arrays, PIL images, etc.).
        Parameters:
            key: The cache key to look up.
        """
        key_hash = cache_hash(key)
        entry = self._store.get(key_hash)
        if entry is None:
            return None
        mark_manual_cache_hit()
        return {k: v for k, v in entry.items() if k != "_key"}

    def set(self, key: Any, **data: Any) -> None:
        """
        Store arbitrary keyword data under a key.
        Parameters:
            key: The cache key.
            data: Arbitrary keyword arguments to store.
        """
        key_hash = cache_hash(key)
        self._store.put(key_hash, _key=key, **data)

    def keys(self) -> list[Any]:
        """
        Return all stored raw keys. Useful for iteration or prefix matching.
        """
        return self._store.keys()

    def clear(self) -> None:
        """
        Clear all entries from the cache.
        """
        self._store.clear()

    def __len__(self) -> int:
        return len(self._store)
