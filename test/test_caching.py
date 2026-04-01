"""Tests for gr.cache decorator."""

import asyncio
import inspect

import numpy as np
import pytest

import gradio as gr
from gradio.caching import CacheStore, CacheVar, cache, cache_hash


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

    def test_unhashable_raises(self):
        with pytest.raises(TypeError, match="gr.cache: cannot hash"):
            cache_hash(object.__new__(type("X", (), {"__hash__": None, "__slots__": ()})))


# ============================================================
# CacheVar tests
# ============================================================


class TestCacheVar:
    def test_default_is_none(self):
        cv = CacheVar()
        assert cv.get() is None

    def test_default_value(self):
        cv = CacheVar()
        assert cv.get("fallback") == "fallback"

    def test_set_and_get(self):
        cv = CacheVar()
        cv.set(42)
        assert cv.get() == 42

    def test_has_value(self):
        cv = CacheVar()
        assert not cv._has_value()
        cv.set("x")
        assert cv._has_value()


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
        store.put("c", {}, "rc")  # should evict "b"
        assert store.get_exact("a") is not None
        assert store.get_exact("b") is None

    def test_clear(self):
        store = CacheStore(max_size=10)
        store.put("a", {}, "ra")
        store.clear()
        assert len(store) == 0

    def test_cache_vars_stored(self):
        store = CacheStore(max_size=10)
        store.put("key1", {"x": 1}, "result", {"kv": [1, 2, 3]})
        entry = store.get_exact("key1")
        assert entry["cache_vars"] == {"kv": [1, 2, 3]}

    def test_find_best_match_returns_highest_score(self):
        store = CacheStore(max_size=10)
        store.put("a", {"text": "he"}, "r1")
        store.put("b", {"text": "hello"}, "r2")
        store.put("c", {"text": "hel"}, "r3")

        def scorer(curr, prev):
            # Score = fraction of curr matched by prev
            common = sum(
                1 for a, b in zip(curr["text"], prev["text"]) if a == b
            )
            return common / len(curr["text"]) if curr["text"] else 0.0

        entry, score = store.find_best_match({"text": "hello world"}, scorer)
        assert entry is not None
        # "hello" (5 chars match) should beat "hel" (3) and "he" (2)
        assert entry["full_kwargs"]["text"] == "hello"

    def test_find_best_match_no_match(self):
        store = CacheStore(max_size=10)
        store.put("a", {"x": 1}, "r1")
        entry, score = store.find_best_match(
            {"x": 2}, lambda curr, prev: 0.0
        )
        assert entry is None
        assert score == 0.0

    def test_find_best_match_early_termination(self):
        """Score of 1.0 should stop searching."""
        call_count = 0

        store = CacheStore(max_size=10)
        store.put("a", {"x": 1}, "r1")
        store.put("b", {"x": 2}, "r2")
        store.put("c", {"x": 3}, "r3")  # most recent, searched first

        def scorer(curr, prev):
            nonlocal call_count
            call_count += 1
            return 1.0 if prev["x"] == 3 else 0.5

        entry, score = store.find_best_match({"x": 3}, scorer)
        assert entry is not None
        assert score >= 1.0
        assert call_count == 1  # stopped after first (most recent) entry

    def test_find_best_match_warns_on_score_above_1(self):
        store = CacheStore(max_size=10)
        store.put("a", {"x": 1}, "r1")
        with pytest.warns(match="score .* > 1.0"):
            store.find_best_match({"x": 1}, lambda c, p: 1.5)


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
        assert call_count == 1
        assert result2 == result1

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
# @cache decorator — scored match_fn
# ============================================================


class TestCacheScoredMatch:
    def test_scored_match_finds_best(self):
        """match_fn returns a score; best match wins."""
        call_log = []

        def prefix_scorer(curr, prev):
            """Score = fraction of curr that prev covers as a prefix."""
            curr_items = curr["items"]
            prev_items = prev["items"]
            if not curr_items or len(prev_items) >= len(curr_items):
                return 0.0  # not a proper prefix
            common = sum(
                1 for a, b in zip(curr_items, prev_items) if a == b
            )
            return common / len(curr_items)

        @cache(match_fn=prefix_scorer)
        def process(items):
            call_log.append(list(items))
            return sum(items)

        # Cold start
        assert process([1, 2, 3]) == 6
        assert len(call_log) == 1

        # Exact match (hash hit)
        assert process([1, 2, 3]) == 6
        assert len(call_log) == 1

        # Add another entry
        assert process([1, 2]) == 3
        assert len(call_log) == 2

        # [1, 2, 3, 4, 5]: should match [1, 2, 3] with score 3/5=0.6
        # and [1, 2] with score 2/5=0.4 — best is [1, 2, 3]
        result = process([1, 2, 3, 4, 5])
        assert len(call_log) == 3  # had to execute (partial match)
        assert result == 15

    def test_exact_match_beats_partial(self):
        """Exact hash match should be preferred over scored match."""
        match_fn_called = False

        def scorer(curr, prev):
            nonlocal match_fn_called
            match_fn_called = True
            return 0.5

        @cache(match_fn=scorer)
        def fn(x):
            return x * 2

        fn(5)
        fn(5)  # exact hit — match_fn should NOT be called
        assert not match_fn_called

    def test_score_zero_is_no_match(self):
        call_count = 0

        @cache(match_fn=lambda c, p: 0.0)
        def fn(x):
            nonlocal call_count
            call_count += 1
            return x

        fn(1)
        fn(2)
        assert call_count == 2  # no matches, both cold starts

    def test_score_one_is_exact(self):
        """Score of 1.0 should be treated as exact match (yields cached value)."""
        call_count = 0

        @cache(match_fn=lambda c, p: 1.0)
        def fn(x):
            nonlocal call_count
            call_count += 1
            return x * 2

        assert fn(1) == 2
        # Different input but match_fn returns 1.0 → treated as exact
        assert fn(999) == 2
        assert call_count == 1


# ============================================================
# @cache decorator — CacheVar
# ============================================================


class TestCacheVarIntegration:
    def test_cache_var_cold_start(self):
        """CacheVar.get() returns None on cold start."""

        @cache
        def fn(x: int, state: CacheVar[list] = None):
            prev = state.get()
            assert prev is None  # cold start
            state.set([x])
            return x

        assert fn(1) == 1

    def test_cache_var_restored_on_partial_match(self):
        """CacheVar is restored from best matching entry."""

        @cache(match_fn=lambda curr, prev: 0.5 if prev["x"] < curr["x"] else 0.0)
        def fn(x: int, accum: CacheVar[int] = None):
            prev = accum.get(0)
            result = prev + x
            accum.set(result)
            return result

        assert fn(10) == 10  # cold start, accum=0+10=10
        # Partial match: accum restored to 10, result = 10 + 20 = 30
        assert fn(20) == 30

    def test_cache_var_not_in_hash_key(self):
        """CacheVar params should not affect the cache key."""
        call_count = 0

        @cache
        def fn(x: int, state: CacheVar[str] = None):
            nonlocal call_count
            call_count += 1
            state.set(f"seen_{x}")
            return x

        fn(1)
        fn(1)  # same x → exact hit, even though CacheVar would differ
        assert call_count == 1

    def test_multiple_cache_vars(self):
        """Multiple CacheVars are independently tracked."""

        @cache(match_fn=lambda curr, prev: 0.5 if prev["x"] < curr["x"] else 0.0)
        def fn(
            x: int,
            counts: CacheVar[int] = None,
            history: CacheVar[list] = None,
        ):
            c = counts.get(0)
            h = history.get([])
            counts.set(c + 1)
            history.set(h + [x])
            return {"count": c + 1, "history": h + [x]}

        r1 = fn(1)
        assert r1 == {"count": 1, "history": [1]}

        r2 = fn(2)  # partial match, restores count=1 and history=[1]
        assert r2 == {"count": 2, "history": [1, 2]}

    def test_cache_var_with_generator(self):
        """CacheVar works with generator functions."""

        @cache(match_fn=lambda c, p: 0.5 if p["n"] < c["n"] else 0.0)
        def gen(n: int, state: CacheVar[int] = None):
            start = state.get(0)
            total = start
            for i in range(1, n + 1):
                total += i
                yield total
            state.set(total)

        r1 = list(gen(3))  # 1, 3, 6
        assert r1 == [1, 3, 6]

        r2 = list(gen(5))  # partial match, start=6, yields 7, 9, 12, 16, 21
        assert r2 == [7, 9, 12, 16, 21]

    def test_prefix_caching_pattern(self):
        """End-to-end prefix caching: simulate KV cache reuse."""

        def prefix_scorer(curr, prev):
            curr_text = curr["text"]
            prev_text = prev["text"]
            if not curr_text:
                return 0.0
            # Count matching characters from start
            match_len = next(
                (
                    i
                    for i, (a, b) in enumerate(zip(curr_text, prev_text))
                    if a != b
                ),
                min(len(curr_text), len(prev_text)),
            )
            return match_len / len(curr_text)

        call_log = []

        @cache(match_fn=prefix_scorer)
        def generate(text: str, kv_cache: CacheVar[list] = None):
            prev_kv = kv_cache.get([])
            call_log.append(
                {"text": text, "reused_kv_len": len(prev_kv)}
            )
            # Simulate building KV cache token by token
            new_kv = prev_kv + list(text[len(prev_kv) :])
            kv_cache.set(new_kv)
            return "".join(new_kv)

        # First call: cold start, builds full KV
        assert generate("hello") == "hello"
        assert call_log[-1]["reused_kv_len"] == 0

        # Same input: exact hit, no execution
        assert generate("hello") == "hello"
        assert len(call_log) == 1

        # Extended input: partial match, reuses KV from "hello"
        assert generate("hello world") == "hello world"
        assert call_log[-1]["reused_kv_len"] == 5  # reused 5 chars of KV


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

        assert inspect.iscoroutinefunction(fn)

    def test_async_with_cache_var(self):
        @cache(match_fn=lambda c, p: 0.5 if p["x"] < c["x"] else 0.0)
        async def fn(x: int, state: CacheVar[int] = None):
            prev = state.get(0)
            state.set(prev + x)
            return prev + x

        assert asyncio.run(fn(10)) == 10
        assert asyncio.run(fn(20)) == 30  # partial: 10 + 20


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

        results1 = list(count_up(3))
        assert results1 == [1, 3, 6]
        assert call_count == 1

        results2 = list(count_up(3))
        assert results2 == [6]
        assert call_count == 1

    def test_generator_is_detected(self):
        @cache
        def gen(x):
            yield x

        assert inspect.isgeneratorfunction(gen)


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
# Integration: works as gr.cache / gr.CacheVar
# ============================================================


class TestGradioExport:
    def test_cache_exported(self):
        assert hasattr(gr, "cache")
        assert gr.cache is cache

    def test_cache_var_exported(self):
        assert hasattr(gr, "CacheVar")
        assert gr.CacheVar is CacheVar
