"""Caching decorator for Gradio functions.

Provides @gr.cache, a decorator that caches function results with
content-aware hashing for ML types (numpy arrays, PIL images, DataFrames, etc.).

Supports sync functions, async functions, sync generators, and async generators.
Optionally supports scored partial matching via a custom score_fn, and typed
cache variables via gr.CacheVar for storing intermediate state (e.g., KV caches).
"""

from __future__ import annotations

import functools
import hashlib
import inspect
import threading
import typing
import warnings
from collections import OrderedDict
from collections.abc import Callable
from typing import Any, Generic, TypeVar, overload

T = TypeVar("T")
U = TypeVar("U")

_MISSING = object()


class CacheVar(Generic[T]):
    """A typed cache variable for storing intermediate state across cache hits.

    Declare as a parameter with a type annotation to have the cache decorator
    automatically create, restore, and save it::

        @gr.cache(score_fn=my_scorer)
        def generate(prompt: str, kv: gr.CacheVar[list] | None = None):
            prev_kv = kv.get()          # restored from best-matching entry
            result, new_kv = model(prompt, past=prev_kv)
            kv.set(new_kv)              # saved in this entry for future matches
            return result

    The presence of CacheVar parameters affects partial match behavior:
    when score_fn returns a score between 0 and 1, the function is always
    re-executed (with CacheVars restored) so it can update its state.
    Without CacheVar, the best match's cached output is returned directly.
    """

    def __init__(self) -> None:
        self._value: Any = _MISSING

    @overload
    def get(self) -> T | None: ...

    @overload
    def get(self, default: U) -> T | U: ...

    def get(self, default: U | None = None) -> T | U | None:
        """Get the cached value, or default if no cached value exists."""
        if self._value is _MISSING:
            return default
        return self._value

    def set(self, value: T) -> None:
        """Set the value to be cached for future matches."""
        self._value = value

    def _has_value(self) -> bool:
        return self._value is not _MISSING

    def _get_raw(self) -> Any:
        return self._value


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
            idx_hash = hashlib.sha256(obj.index.to_numpy().tobytes()).hexdigest()
            return f"DF({col_hash},{val_hash},{idx_hash})"
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
        f"Provide a score_fn that handles this type, or preprocess "
        f"your inputs into hashable types before passing them."
    )


class CacheStore:
    """Thread-safe LRU cache store with scored partial matching."""

    def __init__(self, max_size: int = 128):
        self._max_size = max_size
        self._exact: OrderedDict[str, dict] = OrderedDict()
        self._entries: list[dict] = []  # for score_fn iteration
        self._lock = threading.Lock()

    def get_exact(self, key_hash: str) -> dict | None:
        with self._lock:
            if key_hash in self._exact:
                self._exact.move_to_end(key_hash)
                return self._exact[key_hash]
            return None

    def find_best_match(
        self,
        new_kwargs: dict,
        score_fn: Callable,
    ) -> tuple[dict | None, float]:
        """Find the cache entry with the highest match score.

        Args:
            new_kwargs: The current call's kwargs (without CacheVar params).
            score_fn: Scoring function (curr_kwargs, prev_kwargs) -> float in [0, 1].

        Returns:
            (best_entry, best_score) or (None, 0.0) if no match.
        """
        with self._lock:
            entries_snapshot = list(self._entries)

        best_entry = None
        best_score = 0.0

        # Iterate outside the lock — score_fn is user code
        for entry in reversed(entries_snapshot):
            score = score_fn(new_kwargs, entry["full_kwargs"])

            if score > 1.0:
                warnings.warn(
                    f"score_fn returned score {score} > 1.0, clipping to 1.0",
                    stacklevel=2,
                )
                score = 1.0

            if score > best_score:
                best_score = score
                best_entry = entry

            # Early termination: score ~= 1.0 means perfect match
            if best_score >= 1.0:
                break

        if best_score > 0.0 and best_entry is not None:
            # Refresh LRU position for the matched entry
            with self._lock:
                h = best_entry["hash"]
                if h in self._exact:
                    self._exact.move_to_end(h)
            return best_entry, best_score

        return None, 0.0

    def put(
        self,
        key_hash: str,
        full_kwargs: dict,
        final_value: Any,
        cache_vars: dict[str, Any] | None = None,
    ) -> None:
        entry = {
            "full_kwargs": full_kwargs,
            "final_value": final_value,
            "cache_vars": cache_vars or {},
            "hash": key_hash,
        }
        with self._lock:
            if key_hash in self._exact:
                self._exact.move_to_end(key_hash)
                self._exact[key_hash] = entry
                self._entries = [e for e in self._entries if e["hash"] != key_hash]
                self._entries.append(entry)
            else:
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


def _is_cache_var_annotation(annotation: Any) -> bool:
    if annotation is CacheVar or getattr(annotation, "__origin__", None) is CacheVar:
        return True

    origin = typing.get_origin(annotation)
    if origin is None:
        return False

    return any(_is_cache_var_annotation(arg) for arg in typing.get_args(annotation))


def _detect_cache_var_params(func: Callable) -> set[str]:
    """Detect parameters annotated as CacheVar or with CacheVar default."""
    cache_var_names = set()
    sig = inspect.signature(func)
    try:
        hints = typing.get_type_hints(func, include_extras=True)
    except Exception:
        hints = getattr(func, "__annotations__", {})

    for name, param in sig.parameters.items():
        annotation = hints.get(name)
        # Check annotation: CacheVar or CacheVar[T]
        if _is_cache_var_annotation(annotation) or isinstance(param.default, CacheVar):
            cache_var_names.add(name)

    return cache_var_names


def _normalize_kwargs(
    func: Callable,
    args: tuple,
    kwargs: dict,
    cache_var_params: set[str],
) -> tuple[dict, dict]:
    """Normalize args into kwargs, separating regular params from CacheVar params.

    Returns:
        (regular_kwargs, cache_var_kwargs) where cache_var_kwargs maps
        param names to their CacheVar instances (or None if not provided).
    """
    sig = inspect.signature(func)
    bound = sig.bind(*args, **kwargs)
    bound.apply_defaults()
    all_kwargs = dict(bound.arguments)

    regular = {}
    cvar_kwargs = {}
    for k, v in all_kwargs.items():
        if k in cache_var_params:
            cvar_kwargs[k] = v
        else:
            regular[k] = v

    return regular, cvar_kwargs


def cache(
    fn: Callable | None = None,
    *,
    score_fn: Callable | None = None,
    max_size: int = 128,
):
    """Cache decorator for Gradio functions.

    Caches function results using content-aware hashing that works with
    numpy arrays, PIL images, pandas DataFrames, and other Gradio types.

    Works with sync functions, async functions, sync generators, and
    async generators. For generators, caches the final yielded value.

    Parameters:
        fn: The function to cache (allows use as @gr.cache without parentheses).
        score_fn: Optional scoring function for partial matching. Called as
            ``score_fn(curr_kwargs, prev_kwargs) -> float`` in [0, 1].
            0 means no match, 1 means perfect match (early terminates search).
            The entry with the highest score > 0 is selected.

            How partial matches (0 < score < 1) are handled depends on whether
            the function has ``gr.CacheVar`` parameters:

            - **Without CacheVar**: the best match's cached output is returned
              directly (the function is not re-executed). Useful for semantic
              or perceptual similarity caching.
            - **With CacheVar**: the function is re-executed with CacheVars
              restored from the best match, so it can update its state.
              Useful for prefix/KV caching.

            A score of exactly 1.0 always returns the cached output regardless
            of CacheVar presence.
        max_size: Maximum number of cache entries. 0 for unlimited.
            Least-recently-used entries are evicted when full. Default: 128.

    Cache Variables:
        Annotate a parameter with ``gr.CacheVar[T]`` to declare typed
        intermediate state that persists across cache entries. On a partial
        match, the CacheVar is populated with the value from the best-matching
        entry. After execution, whatever was ``.set()`` is saved::

            @gr.cache(score_fn=lambda curr, prev: ...)
            def generate(prompt: str, kv: gr.CacheVar[list] | None = None):
                prev_kv = kv.get()       # None on cold start, restored on match
                result, new_kv = model(prompt, past=prev_kv)
                kv.set(new_kv)           # saved for future matches
                return result

    Examples:
        Basic exact caching::

            @gr.cache
            def classify(image):
                return model.predict(image)

        Semantic similarity (no CacheVar — returns best match directly)::

            @gr.cache(score_fn=lambda curr, prev:
                cosine_sim(embed(curr["image"]), embed(prev["image"])))
            def classify(image):
                return model.predict(image)

        Prefix caching with CacheVar (re-executes with restored state)::

            @gr.cache(score_fn=lambda curr, prev: (
                next((i for i, (a, b) in enumerate(zip(curr["text"], prev["text"]))
                      if a != b), min(len(curr["text"]), len(prev["text"])))
                / len(curr["text"])
            ) if curr["text"] else 0.0)
            def generate(text: str, kv: gr.CacheVar[tuple] | None = None):
                result = model(text, past_key_values=kv.get())
                kv.set(model.past_key_values)
                return result
    """

    def decorator(func: Callable) -> Callable:
        store = CacheStore(max_size)
        cache_var_params = _detect_cache_var_params(func)
        has_cache_vars = bool(cache_var_params)

        def _build_call_kwargs(
            regular_kwargs: dict,
            cache_var_values: dict[str, Any] | None,
        ) -> dict:
            """Build the full kwargs dict for calling func, with CacheVar instances."""
            call_kwargs = dict(regular_kwargs)
            for name in cache_var_params:
                cv = CacheVar()
                if cache_var_values and name in cache_var_values:
                    cv.set(cache_var_values[name])
                call_kwargs[name] = cv
            return call_kwargs

        def _extract_cache_vars(call_kwargs: dict) -> dict[str, Any]:
            """Extract CacheVar values from call kwargs after execution."""
            result = {}
            for name in cache_var_params:
                cv = call_kwargs.get(name)
                if isinstance(cv, CacheVar) and cv._has_value():
                    result[name] = cv._get_raw()
            return result

        def _try_cache(regular_kwargs: dict):
            """Attempt cache lookup.

            Returns:
                (entry, should_skip, key_hash) where should_skip means
                we can return the cached value without running the function.

            Decision logic for should_skip:
                - Exact hash hit: always skip (identical inputs)
                - score_fn returns 1.0: always skip (declared equivalent)
                - score_fn returns (0, 1): skip if NO CacheVar, run if CacheVar
                - score_fn returns 0 / no match: run (cold start)
            """
            key_hash = cache_hash(regular_kwargs)

            # Stage 1: Exact hash match (O(1))
            entry = store.get_exact(key_hash)
            if entry is not None:
                return entry, True, key_hash

            # Stage 2: Scored partial match
            if score_fn is not None:
                best_entry, best_score = store.find_best_match(regular_kwargs, score_fn)
                if best_entry is not None and best_score > 0:
                    if best_score >= 1.0:
                        # Perfect score: always return cached
                        return best_entry, True, key_hash
                    # Partial score: skip function only if no CacheVars
                    return best_entry, not has_cache_vars, key_hash

            return None, False, key_hash

        if inspect.isgeneratorfunction(func):

            @functools.wraps(func)
            def sync_gen_wrapper(*args, **kwargs):
                regular, _ = _normalize_kwargs(func, args, kwargs, cache_var_params)
                entry, should_skip, key_hash = _try_cache(regular)

                if entry is not None and should_skip:
                    yield entry["final_value"]
                    return

                # Partial hit or cold start: execute with CacheVars
                cache_var_values = entry["cache_vars"] if entry is not None else None
                call_kwargs = _build_call_kwargs(regular, cache_var_values)

                final_value = None
                for value in func(**call_kwargs):
                    final_value = value
                    yield value

                if final_value is not None:
                    store.put(
                        key_hash,
                        regular,
                        final_value,
                        _extract_cache_vars(call_kwargs),
                    )

            sync_gen_wrapper.cache = store  # type: ignore
            return sync_gen_wrapper

        elif inspect.isasyncgenfunction(func):

            @functools.wraps(func)
            async def async_gen_wrapper(*args, **kwargs):
                regular, _ = _normalize_kwargs(func, args, kwargs, cache_var_params)
                entry, should_skip, key_hash = _try_cache(regular)

                if entry is not None and should_skip:
                    yield entry["final_value"]
                    return

                cache_var_values = entry["cache_vars"] if entry is not None else None
                call_kwargs = _build_call_kwargs(regular, cache_var_values)

                final_value = None
                async for value in func(**call_kwargs):
                    final_value = value
                    yield value

                if final_value is not None:
                    store.put(
                        key_hash,
                        regular,
                        final_value,
                        _extract_cache_vars(call_kwargs),
                    )

            async_gen_wrapper.cache = store  # type: ignore
            return async_gen_wrapper

        elif inspect.iscoroutinefunction(func):

            @functools.wraps(func)
            async def async_wrapper(*args, **kwargs):
                regular, _ = _normalize_kwargs(func, args, kwargs, cache_var_params)
                entry, should_skip, key_hash = _try_cache(regular)

                if entry is not None and should_skip:
                    return entry["final_value"]

                cache_var_values = entry["cache_vars"] if entry is not None else None
                call_kwargs = _build_call_kwargs(regular, cache_var_values)

                result = await func(**call_kwargs)
                store.put(
                    key_hash,
                    regular,
                    result,
                    _extract_cache_vars(call_kwargs),
                )
                return result

            async_wrapper.cache = store  # type: ignore
            return async_wrapper

        else:

            @functools.wraps(func)
            def sync_wrapper(*args, **kwargs):
                regular, _ = _normalize_kwargs(func, args, kwargs, cache_var_params)
                entry, should_skip, key_hash = _try_cache(regular)

                if entry is not None and should_skip:
                    return entry["final_value"]

                cache_var_values = entry["cache_vars"] if entry is not None else None
                call_kwargs = _build_call_kwargs(regular, cache_var_values)

                result = func(**call_kwargs)
                store.put(
                    key_hash,
                    regular,
                    result,
                    _extract_cache_vars(call_kwargs),
                )
                return result

            sync_wrapper.cache = store  # type: ignore
            return sync_wrapper

    if fn is not None:
        return decorator(fn)
    return decorator
