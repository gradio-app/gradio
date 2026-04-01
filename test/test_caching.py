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
            cache_hash(
                object.__new__(type("X", (), {"__hash__": None, "__slots__": ()}))
            )


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
        store.put("c", {}, "rc")
        assert store.get_exact("a") is None
        assert store.get_exact("b") is not None
        assert store.get_exact("c") is not None

    def test_lru_access_refreshes(self):
        store = CacheStore(max_size=2)
        store.put("a", {}, "ra")
        store.put("b", {}, "rb")
        store.get_exact("a")
        store.put("c", {}, "rc")
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
            common = sum(1 for a, b in zip(curr["text"], prev["text"]) if a == b)
            return common / len(curr["text"]) if curr["text"] else 0.0

        entry, score = store.find_best_match({"text": "hello world"}, scorer)
        assert entry is not None
        assert entry["full_kwargs"]["text"] == "hello"

    def test_find_best_match_no_match(self):
        store = CacheStore(max_size=10)
        store.put("a", {"x": 1}, "r1")
        entry, score = store.find_best_match({"x": 2}, lambda curr, prev: 0.0)
        assert entry is None
        assert score == 0.0

    def test_find_best_match_early_termination(self):
        call_count = 0
        store = CacheStore(max_size=10)
        store.put("a", {"x": 1}, "r1")
        store.put("b", {"x": 2}, "r2")
        store.put("c", {"x": 3}, "r3")

        def scorer(curr, prev):
            nonlocal call_count
            call_count += 1
            return 1.0 if prev["x"] == 3 else 0.5

        entry, score = store.find_best_match({"x": 3}, scorer)
        assert entry is not None
        assert score >= 1.0
        assert call_count == 1

    def test_find_best_match_warns_on_score_above_1(self):
        store = CacheStore(max_size=10)
        store.put("a", {"x": 1}, "r1")
        with pytest.warns(match="score .* > 1.0"):
            store.find_best_match({"x": 1}, lambda c, p: 1.5)


# ============================================================
# @cache — basic sync functions
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
# @cache — scored matching WITHOUT CacheVar (returns best match)
# ============================================================


class TestScoredMatchNoCacheVar:
    def test_partial_score_returns_cached_output(self):
        """Without CacheVar, partial match returns cached output directly."""
        call_count = 0

        def similarity(curr, prev):
            # Pretend these are "similar" with score 0.9
            return 0.9 if curr["x"] != prev["x"] else 0.0

        @cache(score_fn=similarity)
        def fn(x):
            nonlocal call_count
            call_count += 1
            return x * 2

        assert fn(10) == 20
        assert call_count == 1

        # Different input, but score_fn returns 0.9 → returns cached output
        assert fn(99) == 20  # returns 20 (from x=10), NOT 198
        assert call_count == 1  # function was NOT re-executed

    def test_score_zero_is_cold_start(self):
        call_count = 0

        @cache(score_fn=lambda c, p: 0.0)
        def fn(x):
            nonlocal call_count
            call_count += 1
            return x

        fn(1)
        fn(2)
        assert call_count == 2

    def test_score_one_returns_cached(self):
        call_count = 0

        @cache(score_fn=lambda c, p: 1.0)
        def fn(x):
            nonlocal call_count
            call_count += 1
            return x * 2

        assert fn(1) == 2
        assert fn(999) == 2  # score 1.0 → returns cached
        assert call_count == 1

    def test_best_match_wins(self):
        """Highest scoring entry's output is returned."""

        def prefix_scorer(curr, prev):
            curr_items = curr["items"]
            prev_items = prev["items"]
            if not curr_items or len(prev_items) >= len(curr_items):
                return 0.0
            common = sum(1 for a, b in zip(curr_items, prev_items) if a == b)
            return common / len(curr_items)

        @cache(score_fn=prefix_scorer)
        def process(items):
            return sum(items)

        process([1, 2, 3])  # cached: sum=6
        process([1, 2])  # cached: sum=3

        # [1, 2, 3, 4, 5] matches [1, 2, 3] at 3/5=0.6 and [1, 2] at 2/5=0.4
        # No CacheVar → returns best match's output directly
        result = process([1, 2, 3, 4, 5])
        assert result == 6  # output from [1, 2, 3] entry

    def test_exact_hash_beats_score_fn(self):
        """Exact hash match should skip score_fn entirely."""
        score_fn_called = False

        def scorer(curr, prev):
            nonlocal score_fn_called
            score_fn_called = True
            return 0.5

        @cache(score_fn=scorer)
        def fn(x):
            return x * 2

        fn(5)
        fn(5)  # exact hit
        assert not score_fn_called


# ============================================================
# @cache — scored matching WITH CacheVar (re-executes function)
# ============================================================


class TestScoredMatchWithCacheVar:
    def test_partial_score_runs_function(self):
        """With CacheVar, partial match re-executes with restored state."""
        call_count = 0

        @cache(score_fn=lambda c, p: 0.5 if p["x"] < c["x"] else 0.0)
        def fn(x: int, accum: CacheVar[int] | None = None):
            nonlocal call_count
            call_count += 1
            prev = accum.get(0)
            result = prev + x
            accum.set(result)
            return result

        assert fn(10) == 10
        assert call_count == 1

        # Partial match (score 0.5): function IS re-executed with accum=10
        assert fn(20) == 30
        assert call_count == 2

    def test_exact_match_skips_even_with_cache_var(self):
        """Score 1.0 or hash hit skips function, even with CacheVar."""
        call_count = 0

        @cache
        def fn(x: int, state: CacheVar[str] | None = None):
            nonlocal call_count
            call_count += 1
            state.set(f"seen_{x}")
            return x

        fn(1)
        fn(1)  # exact hash hit → skipped
        assert call_count == 1

    def test_score_one_skips_with_cache_var(self):
        """score_fn returning 1.0 skips even with CacheVar."""
        call_count = 0

        @cache(score_fn=lambda c, p: 1.0)
        def fn(x: int, state: CacheVar[int] | None = None):
            nonlocal call_count
            call_count += 1
            state.set(x)
            return x * 2

        assert fn(1) == 2
        assert fn(999) == 2  # score 1.0 → returns cached
        assert call_count == 1

    def test_cold_start_cache_var(self):
        @cache
        def fn(x: int, state: CacheVar[list] | None = None):
            prev = state.get()
            assert prev is None
            state.set([x])
            return x

        assert fn(1) == 1

    def test_multiple_cache_vars(self):
        @cache(score_fn=lambda c, p: 0.5 if p["x"] < c["x"] else 0.0)
        def fn(
            x: int,
            counts: CacheVar[int] | None = None,
            history: CacheVar[list] | None = None,
        ):
            c = counts.get(0)
            h = history.get([])
            counts.set(c + 1)
            history.set(h + [x])
            return {"count": c + 1, "history": h + [x]}

        r1 = fn(1)
        assert r1 == {"count": 1, "history": [1]}
        r2 = fn(2)
        assert r2 == {"count": 2, "history": [1, 2]}

    def test_cache_var_not_in_hash_key(self):
        call_count = 0

        @cache
        def fn(x: int, state: CacheVar[str] | None = None):
            nonlocal call_count
            call_count += 1
            state.set(f"seen_{x}")
            return x

        fn(1)
        fn(1)
        assert call_count == 1

    def test_prefix_caching_end_to_end(self):
        """Full prefix caching scenario with CacheVar."""

        def prefix_scorer(curr, prev):
            curr_text = curr["text"]
            prev_text = prev["text"]
            if not curr_text or len(prev_text) >= len(curr_text):
                return 0.0
            match_len = next(
                (i for i, (a, b) in enumerate(zip(curr_text, prev_text)) if a != b),
                min(len(curr_text), len(prev_text)),
            )
            return match_len / len(curr_text)

        call_log = []

        @cache(score_fn=prefix_scorer)
        def generate(text: str, kv_cache: CacheVar[list] | None = None):
            prev_kv = kv_cache.get([])
            call_log.append({"text": text, "reused_kv_len": len(prev_kv)})
            new_kv = prev_kv + list(text[len(prev_kv) :])
            kv_cache.set(new_kv)
            return "".join(new_kv)

        # Cold start
        assert generate("hello") == "hello"
        assert call_log[-1]["reused_kv_len"] == 0

        # Exact hit
        assert generate("hello") == "hello"
        assert len(call_log) == 1

        # Prefix match: reuses KV, re-executes function
        assert generate("hello world") == "hello world"
        assert call_log[-1]["reused_kv_len"] == 5


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
        assert list(count_up(3)) == [6]
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
        assert asyncio.run(run()) == [6]
        assert call_count == 1

    def test_async_generator_detected(self):
        @cache
        async def gen(x):
            yield x

        assert inspect.isasyncgenfunction(gen)

    def test_generator_with_cache_var(self):
        @cache(score_fn=lambda c, p: 0.5 if p["n"] < c["n"] else 0.0)
        def gen(n: int, state: CacheVar[int] | None = None):
            start = state.get(0)
            total = start
            for i in range(1, n + 1):
                total += i
                yield total
            state.set(total)

        assert list(gen(3)) == [1, 3, 6]
        assert list(gen(5)) == [7, 9, 12, 16, 21]


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

    def test_async_with_cache_var(self):
        @cache(score_fn=lambda c, p: 0.5 if p["x"] < c["x"] else 0.0)
        async def fn(x: int, state: CacheVar[int] | None = None):
            prev = state.get(0)
            state.set(prev + x)
            return prev + x

        assert asyncio.run(fn(10)) == 10
        assert asyncio.run(fn(20)) == 30


# ============================================================
# Integration: gr.cache / gr.CacheVar exports
# ============================================================


class TestGradioExport:
    def test_cache_exported(self):
        assert hasattr(gr, "cache")
        assert gr.cache is cache

    def test_cache_var_exported(self):
        assert hasattr(gr, "CacheVar")
        assert gr.CacheVar is CacheVar
