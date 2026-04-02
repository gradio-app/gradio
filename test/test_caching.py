import asyncio
import inspect

import numpy as np
import pandas as pd
import pytest
from PIL import Image

from gradio.caching import cache, cache_hash, resolve_generator


class TestCacheHash:
    def test_primitives(self):
        assert cache_hash(1) == cache_hash(1)
        assert cache_hash("hello") == cache_hash("hello")
        assert cache_hash(1) != cache_hash(2)

    def test_collections(self):
        assert cache_hash([1, 2, 3]) == cache_hash([1, 2, 3])
        assert cache_hash({"a": 1, "b": 2}) == cache_hash({"b": 2, "a": 1})
        assert cache_hash([1, 2]) != cache_hash((1, 2))

    def test_numpy_array(self):
        a = np.array([1.0, 2.0, 3.0])
        b = np.array([1.0, 2.0, 3.0])
        c = np.array([1.0, 2.0, 4.0])
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(a) != cache_hash(c)
        assert cache_hash(np.zeros((2, 3))) != cache_hash(np.zeros((3, 2)))

    def test_pil_image(self):
        a = Image.new("RGB", (10, 10), color=(255, 0, 0))
        b = Image.new("RGB", (10, 10), color=(255, 0, 0))
        c = Image.new("RGB", (10, 10), color=(0, 255, 0))
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(a) != cache_hash(c)

    def test_pandas(self):
        a = pd.DataFrame({"x": [1, 2], "y": [3, 4]})
        b = pd.DataFrame({"x": [1, 2], "y": [3, 4]})
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(pd.Series([1, 2])) == cache_hash(pd.Series([1, 2]))

    def test_unhashable_raises(self):
        with pytest.raises(TypeError, match="gr.cache"):
            cache_hash(
                object.__new__(type("X", (), {"__hash__": None, "__slots__": ()}))
            )


class TestResolveGenerator:
    def test_sync_generator(self):
        def gen(n):
            for i in range(n):
                yield i

        wrapped, values = resolve_generator(gen)
        result = wrapped(4)
        assert result == 3
        assert values == [0, 1, 2, 3]

    def test_async_generator(self):
        async def gen(n):
            for i in range(n):
                yield i

        wrapped, values = resolve_generator(gen)
        result = asyncio.run(wrapped(4))
        assert result == 3
        assert values == [0, 1, 2, 3]

    def test_regular_function_unchanged(self):
        def fn(x):
            return x * 2

        wrapped, values = resolve_generator(fn)
        assert wrapped is fn
        assert values is None


class TestCacheDecorator:
    def test_sync_function(self):
        call_count = 0

        @cache
        def add(x, y):
            nonlocal call_count
            call_count += 1
            return x + y

        assert add(1, 2) == 3
        assert add(1, 2) == 3
        assert call_count == 1
        assert add(3, 4) == 7
        assert call_count == 2

    def test_async_function(self):
        call_count = 0

        @cache
        async def add(x, y):
            nonlocal call_count
            call_count += 1
            return x + y

        assert asyncio.run(add(1, 2)) == 3
        assert asyncio.run(add(1, 2)) == 3
        assert call_count == 1

    def test_sync_generator_replays_all_yields(self):
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
        assert list(count_up(3)) == [1, 3, 6]
        assert call_count == 1

    def test_async_generator_replays_all_yields(self):
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
        assert asyncio.run(run()) == [1, 3, 6]
        assert call_count == 1

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

        assert process(np.array([1.0, 2.0])) == 3.0
        assert process(np.array([1.0, 2.0])) == 3.0
        assert call_count == 1

    def test_max_size(self):
        @cache(max_size=2)
        def fn(x):
            return x

        fn(1)
        fn(2)
        fn(3)
        assert len(fn.cache) == 2

    def test_preserves_function_type(self):
        @cache
        def gen(x):
            yield x

        @cache
        async def agen(x):
            yield x

        @cache
        async def afn(x):
            return x

        assert inspect.isgeneratorfunction(gen)
        assert inspect.isasyncgenfunction(agen)
        assert inspect.iscoroutinefunction(afn)

    def test_sync_generator_mutable_yields(self):
        @cache
        def streamer(n):
            result = []
            for i in range(1, n + 1):
                result.append(i)
                yield result

        list(streamer(3))
        cached_run = list(streamer(3))
        assert cached_run == [[1], [1, 2], [1, 2, 3]]

    def test_with_parens(self):
        @cache()
        def fn(x):
            return x * 2

        assert fn(5) == 10
        assert fn(5) == 10

    def test_clear(self):
        @cache
        def fn(x):
            return x

        fn(1)
        assert len(fn.cache) == 1
        fn.cache.clear()
        assert len(fn.cache) == 0


class TestCacheManual:
    def test_get_set(self):
        c = cache()
        assert c.get("k") is None
        c.set("k", value=42)
        assert c.get("k") == {"value": 42}

    def test_multiple_fields(self):
        c = cache()
        c.set("k", output="hello", kv=[1, 2, 3])
        assert c.get("k") == {"output": "hello", "kv": [1, 2, 3]}

    def test_keys(self):
        c = cache()
        c.set("a", v=1)
        c.set("b", v=2)
        assert sorted(c.keys()) == ["a", "b"]

    def test_prefix_matching_pattern(self):
        c = cache()
        c.set("hello", kv=[1, 2, 3, 4, 5])
        c.set("hello world", kv=list(range(11)))

        prompt = "hello world foo"
        best_key = None
        best_len = 0
        for cached_key in c.keys():
            if prompt.startswith(cached_key) and len(cached_key) > best_len:
                best_key = cached_key
                best_len = len(cached_key)

        assert best_key == "hello world"
        assert c.get(best_key)["kv"] == list(range(11))

    def test_eviction_by_count(self):
        c = cache(max_size=2)
        c.set("a", v=1)
        c.set("b", v=2)
        c.set("c", v=3)
        assert len(c) == 2
        assert c.get("a") is None

    def test_eviction_by_memory(self):
        c = cache(max_size=0, max_memory="1kb")
        c.set("a", data=np.zeros(100, dtype=np.float64))  # 800 bytes
        assert len(c) == 1
        c.set("b", data=np.zeros(100, dtype=np.float64))  # 800 more → over 1kb
        assert len(c) == 1  # evicted "a" to stay under 1kb
        assert c.get("a") is None
        assert c.get("b") is not None

    def test_max_memory_string_parsing(self):
        c = cache(max_memory="512mb")
        assert c._store._max_memory == 512 * 1024 * 1024

    def test_injection_pattern(self):
        """Simulates how Gradio would inject gr.cache() as a parameter."""
        c = cache()

        def my_fn(x, my_cache=c):
            hit = my_cache.get(x)
            if hit is not None:
                return hit["result"]
            result = x * 2
            my_cache.set(x, result=result)
            return result

        assert my_fn(5) == 10
        assert my_fn(5) == 10  # from cache
        assert len(c) == 1
