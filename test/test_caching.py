"""Tests for gr.cache decorator."""

import asyncio
import inspect

import numpy as np
import pytest

import gradio as gr
from gradio.caching import CacheStore, cache, cache_hash


# ============================================================
# cache_hash tests
# ============================================================


class TestCacheHash:
    def test_primitives(self):
        assert cache_hash(1) == cache_hash(1)
        assert cache_hash("hello") == cache_hash("hello")
        assert cache_hash(1) != cache_hash(2)
        assert cache_hash(True) != cache_hash(1)  # bool vs int

    def test_none(self):
        assert cache_hash(None) == cache_hash(None)

    def test_bytes(self):
        assert cache_hash(b"hello") == cache_hash(b"hello")
        assert cache_hash(b"hello") != cache_hash(b"world")

    def test_list_and_tuple(self):
        assert cache_hash([1, 2, 3]) == cache_hash([1, 2, 3])
        assert cache_hash([1, 2, 3]) != cache_hash([1, 2, 4])
        # Lists and tuples should hash differently
        assert cache_hash([1, 2]) != cache_hash((1, 2))

    def test_dict(self):
        # Order shouldn't matter
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
        a = np.zeros((2, 3))
        b = np.zeros((3, 2))
        assert cache_hash(a) != cache_hash(b)

    def test_numpy_different_dtypes(self):
        a = np.array([1, 2], dtype=np.float32)
        b = np.array([1, 2], dtype=np.float64)
        assert cache_hash(a) != cache_hash(b)

    def test_set(self):
        assert cache_hash({1, 2, 3}) == cache_hash({3, 2, 1})

    def test_pydantic_model(self):
        from pydantic import BaseModel

        class MyModel(BaseModel):
            name: str
            value: int

        a = MyModel(name="test", value=42)
        b = MyModel(name="test", value=42)
        c = MyModel(name="test", value=99)
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(a) != cache_hash(c)

    def test_pandas_series(self):
        import pandas as pd

        a = pd.Series([1, 2, 3], name="col")
        b = pd.Series([1, 2, 3], name="col")
        c = pd.Series([1, 2, 4], name="col")
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(a) != cache_hash(c)

    def test_dataclass_like_object(self):
        class Point:
            __hash__ = None

            def __init__(self, x, y):
                self.x = x
                self.y = y

        a = Point(1, 2)
        b = Point(1, 2)
        c = Point(1, 3)
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(a) != cache_hash(c)

    def test_pil_image(self):
        from PIL import Image

        a = Image.new("RGB", (10, 10), color=(255, 0, 0))
        b = Image.new("RGB", (10, 10), color=(255, 0, 0))
        c = Image.new("RGB", (10, 10), color=(0, 255, 0))
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(a) != cache_hash(c)

    def test_pandas_dataframe(self):
        import pandas as pd

        a = pd.DataFrame({"x": [1, 2], "y": [3, 4]})
        b = pd.DataFrame({"x": [1, 2], "y": [3, 4]})
        c = pd.DataFrame({"x": [1, 2], "y": [3, 5]})
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(a) != cache_hash(c)


# ============================================================
# CacheStore tests
# ============================================================


class TestCacheStore:
    def test_put_and_get(self):
        store = CacheStore(max_size=10)
        store.put("key1", {"x": 1}, "result1")
        entry = store.get_exact("key1")
        assert entry is not None
        assert entry["final_value"] == "result1"

    def test_miss(self):
        store = CacheStore(max_size=10)
        assert store.get_exact("nonexistent") is None

    def test_lru_eviction(self):
        store = CacheStore(max_size=2)
        store.put("a", {}, "ra")
        store.put("b", {}, "rb")
        store.put("c", {}, "rc")  # should evict "a"
        assert store.get_exact("a") is None
        assert store.get_exact("b") is not None
        assert store.get_exact("c") is not None

    def test_lru_access_refreshes(self):
        store = CacheStore(max_size=2)
        store.put("a", {}, "ra")
        store.put("b", {}, "rb")
        store.get_exact("a")  # refresh "a"
        store.put("c", {}, "rc")  # should evict "b" (least recent)
        assert store.get_exact("a") is not None
        assert store.get_exact("b") is None

    def test_clear(self):
        store = CacheStore(max_size=10)
        store.put("a", {}, "ra")
        store.clear()
        assert len(store) == 0

    def test_find_partial(self):
        store = CacheStore(max_size=10)
        store.put("a", {"x": [1, 2]}, "result_12")

        def match(cached_kw, new_kw, cached_result):
            if new_kw["x"][: len(cached_kw["x"])] == cached_kw["x"]:
                return {**new_kw, "prev": cached_result}
            return None

        result = store.find_partial({"x": [1, 2, 3]}, match)
        assert result == {"x": [1, 2, 3], "prev": "result_12"}

    def test_find_partial_no_match(self):
        store = CacheStore(max_size=10)
        store.put("a", {"x": [1, 2]}, "result")
        result = store.find_partial(
            {"x": [3, 4]}, lambda c, n, r: None
        )
        assert result is None


# ============================================================
# @cache decorator — sync functions
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
        assert call_count == 1  # second call was cached

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
        add(5, 6)  # evicts (1, 2)
        assert len(add.cache) == 2

    def test_with_key(self):
        call_count = 0

        @cache(key=lambda kw: kw["prompt"])
        def generate(prompt, temperature=0.7):
            nonlocal call_count
            call_count += 1
            return f"{prompt}_{temperature}"

        result1 = generate("hello", temperature=0.5)
        result2 = generate("hello", temperature=0.9)
        assert call_count == 1  # temperature ignored in key
        assert result2 == result1  # returns cached result

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
        assert call_count == 1  # all equivalent

    def test_numpy_input(self):
        call_count = 0

        @cache
        def process(arr):
            nonlocal call_count
            call_count += 1
            return arr.sum()

        a = np.array([1.0, 2.0, 3.0])
        b = np.array([1.0, 2.0, 3.0])  # same content, different object
        assert process(a) == 6.0
        assert process(b) == 6.0
        assert call_count == 1

    def test_cache_attribute(self):
        @cache
        def fn(x):
            return x

        assert hasattr(fn, "cache")
        assert isinstance(fn.cache, CacheStore)

    def test_match_fn(self):
        call_count = 0

        def prefix_match(cached_kw, new_kw, cached_result):
            old = cached_kw["items"]
            new = new_kw["items"]
            if len(new) > len(old) and new[: len(old)] == old:
                return {**new_kw, "start_from": cached_result}
            return None

        @cache(match_fn=prefix_match)
        def accumulate(items, start_from=0):
            nonlocal call_count
            call_count += 1
            return start_from + sum(items)

        assert accumulate([1, 2, 3]) == 6
        assert call_count == 1

        # Same input — exact cache hit
        assert accumulate([1, 2, 3]) == 6
        assert call_count == 1

        # Extended input — partial match injects start_from=6
        result = accumulate([1, 2, 3, 4, 5])
        assert call_count == 2
        # start_from=6 (cached) + sum([1,2,3,4,5])=15 = 21
        assert result == 21


# ============================================================
# @cache decorator — async functions
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

        assert asyncio.iscoroutinefunction(fn)


# ============================================================
# @cache decorator — sync generators
# ============================================================


class TestCacheSyncGen:
    def test_basic_generator(self):
        call_count = 0

        @cache
        def count_up(n):
            nonlocal call_count
            call_count += 1
            total = 0
            for i in range(1, n + 1):
                total += i
                yield total

        # First call: streams values
        results1 = list(count_up(3))
        assert results1 == [1, 3, 6]
        assert call_count == 1

        # Second call: yields only final value
        results2 = list(count_up(3))
        assert results2 == [6]  # only final cached value
        assert call_count == 1

    def test_generator_is_detected(self):
        @cache
        def gen(x):
            yield x

        assert inspect.isgeneratorfunction(gen)

    def test_generator_with_match_fn(self):
        call_count = 0

        def match(cached_kw, new_kw, cached_result):
            if new_kw["n"] > cached_kw["n"]:
                return {**new_kw, "start": cached_result}
            return None

        @cache(match_fn=match)
        def running_sum(n, start=0):
            nonlocal call_count
            call_count += 1
            total = start
            for i in range(1, n + 1):
                total += i
                yield total

        list(running_sum(3))  # yields 1, 3, 6
        assert call_count == 1

        # Partial match: start=6, then adds 1+2+3+4 = 10 → total 16
        results = list(running_sum(4))
        assert call_count == 2
        assert results[-1] == 16  # 6 + 1+2+3+4 = 16


# ============================================================
# @cache decorator — async generators
# ============================================================


class TestCacheAsyncGen:
    def test_basic_async_gen(self):
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
            results = []
            async for v in count_up(3):
                results.append(v)
            return results

        r1 = asyncio.run(run())
        assert r1 == [1, 3, 6]
        assert call_count == 1

        r2 = asyncio.run(run())
        assert r2 == [6]
        assert call_count == 1

    def test_async_gen_is_detected(self):
        @cache
        async def gen(x):
            yield x

        assert inspect.isasyncgenfunction(gen)


# ============================================================
# Integration: works as gr.cache
# ============================================================


class TestGradioExport:
    def test_exported(self):
        assert hasattr(gr, "cache")
        assert gr.cache is cache
