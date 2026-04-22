import asyncio
from contextlib import contextmanager

import numpy as np
import pandas as pd
import pytest
from PIL import Image

from gradio.caching import (
    Cache,
    CacheMissError,
    ProbeCache,
    TrackManualCacheUsage,
    cache,
    cache_hash,
    clear_session_caches,
    resolve_generator,
    used_manual_cache,
)
from gradio.context import LocalContext
from gradio.route_utils import Request


@contextmanager
def session_context(session_hash: str):
    token = LocalContext.request.set(Request(session_hash=session_hash))
    try:
        yield
    finally:
        LocalContext.request.reset(token)


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

    def test_pil_image(self):
        a = Image.new("RGB", (10, 10), color=(255, 0, 0))
        b = Image.new("RGB", (10, 10), color=(255, 0, 0))
        c = Image.new("RGB", (10, 10), color=(0, 255, 0))
        assert cache_hash(a) == cache_hash(b)
        assert cache_hash(a) != cache_hash(c)

    def test_pandas_object_columns(self):
        a = pd.DataFrame({"x": ["a", "b"], "y": ["c", "d"]})
        b = pd.DataFrame({"x": ["a", "b"], "y": ["c", "d"]})
        assert cache_hash(a) == cache_hash(b)

    def test_pandas_series_object_values(self):
        a = pd.Series(["a", "b"], name="letters")
        b = pd.Series(["a", "b"], name="letters")
        assert cache_hash(a) == cache_hash(b)

    def test_unhashable_raises(self):
        with pytest.raises(TypeError, match="gr.cache"):
            cache_hash(
                object.__new__(type("X", (), {"__hash__": None, "__slots__": ()}))
            )


class TestResolveGenerator:
    def test_sync_generator(self):
        def gen(n):
            yield from range(n)

        wrapped, values = resolve_generator(gen)
        assert wrapped(4) == 3
        assert values == [0, 1, 2, 3]


class TestCacheDecorator:
    def test_probe_cache_raises_on_sync_miss_in_worker_thread(self):
        call_count = 0

        @cache
        def add(x, y):
            nonlocal call_count
            call_count += 1
            return x + y

        async def run():
            with ProbeCache():
                await asyncio.to_thread(add, 1, 2)

        with pytest.raises(CacheMissError):
            asyncio.run(run())
        assert call_count == 0

    def test_probe_cache_raises_on_async_miss(self):
        call_count = 0

        @cache
        async def add(x, y):
            nonlocal call_count
            call_count += 1
            return x + y

        async def run():
            with ProbeCache():
                await add(1, 2)

        with pytest.raises(CacheMissError):
            asyncio.run(run())
        assert call_count == 0

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

    def test_sync_generator_caches_zero_yield_result(self):
        call_count = 0

        @cache
        def empty_stream(flag):
            nonlocal call_count
            call_count += 1
            if flag:
                yield "value"

        assert list(empty_stream(False)) == []
        assert list(empty_stream(False)) == []
        assert call_count == 1

    def test_async_generator_caches_zero_yield_result(self):
        call_count = 0

        @cache
        async def empty_stream(flag):
            nonlocal call_count
            call_count += 1
            if flag:
                yield "value"

        async def run():
            return [v async for v in empty_stream(False)]

        assert asyncio.run(run()) == []
        assert asyncio.run(run()) == []
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
        assert call_count == 1

    def test_key_parameter(self):
        call_count = 0

        @cache(key=lambda kw: kw["prompt"])
        def generate(prompt, temperature=0.7):
            nonlocal call_count
            call_count += 1
            return f"{prompt}_{temperature}"

        r1 = generate("hello", temperature=0.5)
        r2 = generate("hello", temperature=0.9)
        assert call_count == 1
        assert r2 == r1

    def test_max_size(self):
        @cache(max_size=2)
        def fn(x):
            return x

        fn(1)
        fn(2)
        fn(3)
        assert len(fn.cache) == 2

    def test_mutable_yields_deepcopied(self):
        @cache
        def streamer(n):
            result = []
            for i in range(1, n + 1):
                result.append(i)
                yield result

        list(streamer(3))
        assert list(streamer(3)) == [[1], [1, 2], [1, 2, 3]]

    def test_runtime_wrapper_reuses_cache(self):
        call_count = 0

        def add(x, y=0):
            nonlocal call_count
            call_count += 1
            return x + y

        assert cache(add)(1, y=2) == 3
        assert cache(add)(1, y=2) == 3
        assert call_count == 1

    def test_runtime_wrapper_with_key_parameter(self):
        call_count = 0
        cache_key = lambda kw: kw["prompt"]

        def generate(prompt, temperature=0.7):
            nonlocal call_count
            call_count += 1
            return f"{prompt}_{temperature}"

        cached_generate = cache(generate, key=cache_key)
        r1 = cached_generate("hello", temperature=0.5)
        r2 = cache(generate, key=cache_key)("hello", temperature=0.9)

        assert r1 == r2
        assert call_count == 1

    def test_runtime_wrapper_tracks_manual_cache_usage(self):
        call_count = 0

        def add(x):
            nonlocal call_count
            call_count += 1
            return x + 1

        cached_add = cache(add)
        assert cached_add(1) == 2

        with TrackManualCacheUsage():
            assert used_manual_cache() is False
            assert cache(add)(1) == 2
            assert used_manual_cache() is True

        assert call_count == 1

    def test_runtime_wrapper_non_callable_raises(self):
        with pytest.raises(TypeError, match="expected a callable"):
            cache(123)

        def add(x):
            return x + 1

        with pytest.raises(TypeError, match="Use gr.cache\\(fn\\)\\(\\*args\\)"):
            cache(add(1))


class TestCacheManual:
    def test_get_set(self):
        c = Cache()
        assert c.get("k") is None
        c.set("k", value=42)
        assert c.get("k") == {"value": 42}

    def test_prefix_matching_pattern(self):
        c = Cache()
        c.set("hello", kv=[1, 2, 3, 4, 5])
        c.set("hello world", kv=list(range(11)))

        prompt = "hello world foo"
        best_key = None
        best_len = 0
        for cached_key in c.keys():  # noqa: SIM118
            if prompt.startswith(cached_key) and len(cached_key) > best_len:
                best_key = cached_key
                best_len = len(cached_key)

        assert best_key == "hello world"
        result = c.get(best_key)
        assert result is not None
        assert result["kv"] == list(range(11))

    def test_eviction_by_count(self):
        c = Cache(max_size=2)
        c.set("a", v=1)
        c.set("b", v=2)
        c.set("c", v=3)
        assert len(c) == 2
        assert c.get("a") is None

    def test_eviction_by_memory(self):
        c = Cache(max_size=0, max_memory="1kb")
        c.set("a", data=np.zeros(100, dtype=np.float64))
        assert len(c) == 1
        c.set("b", data=np.zeros(100, dtype=np.float64))
        assert len(c) == 1
        assert c.get("a") is None

    def test_manual_cache_hit_tracking(self):
        c = Cache()
        c.set("k", value=42)

        with TrackManualCacheUsage():
            assert used_manual_cache() is False
            assert c.get("missing") is None
            assert used_manual_cache() is False
            assert c.get("k") == {"value": 42}
            assert used_manual_cache() is True

    def test_clear_session_caches_evicts_closed_session_only(self):
        manual_cache = Cache(per_session=True)
        global_cache = Cache()
        call_count = 0

        @cache(per_session=True)
        def decorated(value):
            nonlocal call_count
            call_count += 1
            return value * 2

        with session_context("session-1"):
            manual_cache.set("k", value=1)
            global_cache.set("shared", value=100)
            assert decorated(3) == 6

        with session_context("session-2"):
            manual_cache.set("k", value=2)
            assert decorated(3) == 6

        assert call_count == 2

        clear_session_caches("session-1")

        with session_context("session-1"):
            assert manual_cache.get("k") is None
            assert decorated(3) == 6

        with session_context("session-2"):
            assert manual_cache.get("k") == {"value": 2}
            assert decorated(3) == 6

        assert global_cache.get("shared") == {"value": 100}
        assert call_count == 3
