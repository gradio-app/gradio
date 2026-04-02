"""Tests for gr.cache decorator and caching utilities."""

import asyncio
import inspect

import numpy as np
import pytest

import gradio as gr
from gradio.caching import CacheStore, cache, cache_hash, resolve_generator


# ============================================================
# cache_hash tests
# ============================================================


class TestCacheHash:
    def test_primitives(self):
        assert cache_hash(1) == cache_hash(1)
        assert cache_hash("hello") == cache_hash("hello")
        assert cache_hash(1) != cache_hash(2)
        assert cache_hash(True) != cache_hash(1)

    def test_none(self):
        assert cache_hash(None) == cache_hash(None)

    def test_bytes(self):
        assert cache_hash(b"hello") == cache_hash(b"hello")
        assert cache_hash(b"hello") != cache_hash(b"world")

    def test_list_and_tuple(self):
        assert cache_hash([1, 2, 3]) == cache_hash([1, 2, 3])
        assert cache_hash([1, 2, 3]) != cache_hash([1, 2, 4])
        assert cache_hash([1, 2]) != cache_hash((1, 2))

    def test_dict(self):
        assert cache_hash({"a": 1, "b": 2}) == cache_hash({"b": 2, "a": 1})
        assert cache_hash({"a": 1}) != cache_hash({"a": 2})

    def test_nested(self):
        obj1 = {"a": [1, {"b": 2}], "c": (3, 4)}
        obj2 = {"c": (3, 4), "a": [1, {"b": 2}]}
        assert cache_hash(obj1) == cache_hash(obj2)

    def test_numpy_array(self):
        a = np.array([1.0, 2.0, 3.0])
        b = np.array([1.0, 2.0, 3.0])
        c = np.array([1.0, 2.0, 4.0])
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(a) != cache_hash(c)

    def test_numpy_different_shapes(self):
        assert cache_hash(np.zeros((2, 3))) != cache_hash(np.zeros((3, 2)))

    def test_numpy_different_dtypes(self):
        assert cache_hash(np.array([1], dtype=np.float32)) != cache_hash(
            np.array([1], dtype=np.float64)
        )

    def test_set(self):
        assert cache_hash({1, 2, 3}) == cache_hash({3, 2, 1})

    def test_pydantic_model(self):
        from pydantic import BaseModel

        class MyModel(BaseModel):
            name: str
            value: int

        assert cache_hash(MyModel(name="a", value=1)) == cache_hash(
            MyModel(name="a", value=1)
        )
        assert cache_hash(MyModel(name="a", value=1)) != cache_hash(
            MyModel(name="a", value=2)
        )

    def test_pandas_dataframe(self):
        import pandas as pd

        a = pd.DataFrame({"x": [1, 2], "y": [3, 4]})
        b = pd.DataFrame({"x": [1, 2], "y": [3, 4]})
        c = pd.DataFrame({"x": [1, 2], "y": [3, 5]})
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(a) != cache_hash(c)

    def test_pandas_series(self):
        import pandas as pd

        assert cache_hash(pd.Series([1, 2])) == cache_hash(pd.Series([1, 2]))
        assert cache_hash(pd.Series([1, 2])) != cache_hash(pd.Series([1, 3]))

    def test_pil_image(self):
        from PIL import Image

        a = Image.new("RGB", (10, 10), color=(255, 0, 0))
        b = Image.new("RGB", (10, 10), color=(255, 0, 0))
        c = Image.new("RGB", (10, 10), color=(0, 255, 0))
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(a) != cache_hash(c)

    def test_dataclass_like_object(self):
        class Point:
            __hash__ = None

            def __init__(self, x, y):
                self.x = x
                self.y = y

        assert cache_hash(Point(1, 2)) == cache_hash(Point(1, 2))
        assert cache_hash(Point(1, 2)) != cache_hash(Point(1, 3))

    def test_unhashable_raises(self):
        with pytest.raises(TypeError, match="gr.cache: cannot hash"):
            cache_hash(
                object.__new__(
                    type("X", (), {"__hash__": None, "__slots__": ()})
                )
            )


# ============================================================
# resolve_generator tests
# ============================================================


class TestResolveGenerator:
    def test_sync_generator(self):
        def gen(n):
            for i in range(n):
                yield i

        wrapped, values = resolve_generator(gen)
        assert values is not None
        result = wrapped(4)
        assert result == 3
        assert values == [0, 1, 2, 3]

    def test_async_generator(self):
        async def gen(n):
            for i in range(n):
                yield i

        wrapped, values = resolve_generator(gen)
        assert values is not None
        result = asyncio.run(wrapped(4))
        assert result == 3
        assert values == [0, 1, 2, 3]

    def test_regular_function_unchanged(self):
        def fn(x):
            return x * 2

        wrapped, values = resolve_generator(fn)
        assert wrapped is fn
        assert values is None

    def test_async_function_unchanged(self):
        async def fn(x):
            return x * 2

        wrapped, values = resolve_generator(fn)
        assert wrapped is fn
        assert values is None

    def test_clears_between_calls(self):
        def gen(n):
            for i in range(n):
                yield i

        wrapped, values = resolve_generator(gen)
        wrapped(3)
        assert values == [0, 1, 2]
        wrapped(2)
        assert values == [0, 1]  # cleared and repopulated


# ============================================================
# CacheStore tests
# ============================================================


class TestCacheStore:
    def test_put_and_get(self):
        store = CacheStore(max_size=10)
        store.put("k", value="result")
        assert store.get("k") == {"value": "result"}

    def test_miss(self):
        store = CacheStore(max_size=10)
        assert store.get("nonexistent") is None

    def test_lru_eviction(self):
        store = CacheStore(max_size=2)
        store.put("a", value=1)
        store.put("b", value=2)
        store.put("c", value=3)  # evicts "a"
        assert store.get("a") is None
        assert store.get("b") is not None
        assert store.get("c") is not None

    def test_lru_access_refreshes(self):
        store = CacheStore(max_size=2)
        store.put("a", value=1)
        store.put("b", value=2)
        store.get("a")  # refresh "a"
        store.put("c", value=3)  # evicts "b"
        assert store.get("a") is not None
        assert store.get("b") is None

    def test_clear(self):
        store = CacheStore(max_size=10)
        store.put("a", value=1)
        store.clear()
        assert len(store) == 0

    def test_generator_yields_stored(self):
        store = CacheStore(max_size=10)
        store.put("k", yields=[1, 2, 3])
        assert store.get("k") == {"yields": [1, 2, 3]}


# ============================================================
# @cache — sync functions
# ============================================================


class TestCacheSync:
    def test_basic_caching(self):
        call_count = 0

        @cache
        def add(x, y):
            nonlocal call_count
            call_count += 1
            return x + y

        assert add(1, 2) == 3
        assert add(1, 2) == 3
        assert call_count == 1

    def test_different_args(self):
        call_count = 0

        @cache
        def add(x, y):
            nonlocal call_count
            call_count += 1
            return x + y

        assert add(1, 2) == 3
        assert add(3, 4) == 7
        assert call_count == 2

    def test_with_parens(self):
        @cache()
        def add(x, y):
            return x + y

        assert add(1, 2) == 3
        assert add(1, 2) == 3

    def test_with_max_size(self):
        @cache(max_size=2)
        def add(x, y):
            return x + y

        add(1, 2)
        add(3, 4)
        add(5, 6)
        assert len(add.cache) == 2

    def test_kwargs_normalization(self):
        call_count = 0

        @cache
        def add(x, y=10):
            nonlocal call_count
            call_count += 1
            return x + y

        assert add(1) == 11
        assert add(1, y=10) == 11
        assert add(1, 10) == 11
        assert call_count == 1

    def test_numpy_input(self):
        call_count = 0

        @cache
        def process(arr):
            nonlocal call_count
            call_count += 1
            return arr.sum()

        a = np.array([1.0, 2.0, 3.0])
        b = np.array([1.0, 2.0, 3.0])
        assert process(a) == 6.0
        assert process(b) == 6.0
        assert call_count == 1

    def test_cache_attribute(self):
        @cache
        def fn(x):
            return x

        assert hasattr(fn, "cache")
        assert isinstance(fn.cache, CacheStore)


# ============================================================
# @cache — async functions
# ============================================================


class TestCacheAsync:
    def test_basic_async(self):
        call_count = 0

        @cache
        async def add(x, y):
            nonlocal call_count
            call_count += 1
            return x + y

        assert asyncio.run(add(1, 2)) == 3
        assert asyncio.run(add(1, 2)) == 3
        assert call_count == 1

    def test_async_is_coroutine(self):
        @cache
        async def fn(x):
            return x

        assert inspect.iscoroutinefunction(fn)


# ============================================================
# @cache — generators
# ============================================================


class TestCacheGenerators:
    def test_sync_generator(self):
        call_count = 0

        @cache
        def count_up(n):
            nonlocal call_count
            call_count += 1
            total = 0
            for i in range(1, n + 1):
                total += i
                yield total

        assert list(count_up(3)) == [1, 3, 6]
        assert call_count == 1
        assert list(count_up(3)) == [1, 3, 6]  # replays all yields
        assert call_count == 1

    def test_sync_generator_detected(self):
        @cache
        def gen(x):
            yield x

        assert inspect.isgeneratorfunction(gen)

    def test_async_generator(self):
        call_count = 0

        @cache
        async def count_up(n):
            nonlocal call_count
            call_count += 1
            total = 0
            for i in range(1, n + 1):
                total += i
                yield total

        async def run():
            return [v async for v in count_up(3)]

        assert asyncio.run(run()) == [1, 3, 6]
        assert call_count == 1
        assert asyncio.run(run()) == [1, 3, 6]  # replays all yields
        assert call_count == 1

    def test_async_generator_detected(self):
        @cache
        async def gen(x):
            yield x

        assert inspect.isasyncgenfunction(gen)


# ============================================================
# Integration
# ============================================================


class TestGradioExport:
    def test_cache_exported(self):
        assert hasattr(gr, "cache")
        assert gr.cache is cache
