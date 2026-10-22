# ruff: noqa: S101 -- benchmark correctness assertions
"""Compare unchanged demo callbacks at the executor boundary, then HTTP/SSE.

Run from the repository root:
  python demo/process_executor/benchmark.py
No user model metadata, sleeps added for benchmarking, or autoscaling involved.
"""

import asyncio
import gzip
import hashlib
import json
import os
import platform
import statistics
import time
from pathlib import Path
from typing import Any

import anyio
import numpy as np

from demo.process_executor.app import DEMOS, app

ROOT = Path(__file__).resolve().parent


def percentile(values, percent):
    return float(np.percentile(values, percent))


def summary(values):
    return {
        "median_ms": statistics.median(values) * 1000,
        "p95_ms": percentile(values, 95) * 1000,
        "min_ms": min(values) * 1000,
        "max_ms": max(values) * 1000,
    }


def equal(a, b):
    if isinstance(a, np.ndarray):
        np.testing.assert_allclose(a, b)
    elif isinstance(a, (list, tuple)):
        assert len(a) == len(b)
        for left, right in zip(a, b):
            equal(left, right)
    else:
        assert a == b


async def main():
    # Deterministic payloads; compare actual returned values, not only timings.
    rng = np.random.default_rng(1234)
    cases = [
        ("hello_world", 0, ("Gradio",), 500),
        ("calculator", 1, (144.0, "multiply", 2.5), 500),
        (
            "sepia_filter · 256×256",
            2,
            (rng.integers(0, 256, (256, 256, 3), dtype=np.uint8),),
            100,
        ),
        (
            "sepia_filter · 1024×1024",
            2,
            (rng.integers(0, 256, (1024, 1024, 3), dtype=np.uint8),),
            60,
        ),
        (
            "reverse_audio · 10 seconds",
            3,
            ((48000, rng.normal(size=480000).astype(np.float32)),),
            100,
        ),
        ("streaming_echo · 8 chunks", 4, ("abcdefgh", []), 15),
    ]
    report: dict[str, Any] = {
        "environment": {
            "python": platform.python_version(),
            "platform": platform.platform(),
            "machine": platform.machine(),
            "numpy": np.__version__,
            "parent_pid": os.getpid(),
        },
        "method": "Sequential requests, three rounds, alternating executor order; no HTTP or component preprocessing",
        "sources": {},
        "cases": [],
    }
    for folder in DEMOS.values():
        path = ROOT.parent / folder / "run.py"
        report["sources"][str(path.relative_to(ROOT.parents[1]))] = hashlib.sha256(
            path.read_bytes()
        ).hexdigest()
    warmed = set()
    try:
        for label, index, args, repetitions in cases:
            fn = app._process_functions[index]
            pool = app._process_pools[index]
            stream = index == 4

            async def thread_call():
                start = time.perf_counter()
                if stream:
                    iterator = await anyio.to_thread.run_sync(lambda: iter(fn(*args)))
                    outputs = []
                    first = None
                    sentinel = object()
                    while True:
                        item = await anyio.to_thread.run_sync(
                            lambda: next(iterator, sentinel)
                        )
                        if item is sentinel:
                            break
                        if first is None:
                            first = time.perf_counter() - start
                        outputs.append(item)
                    return outputs, first
                return await anyio.to_thread.run_sync(lambda: fn(*args)), None

            async def process_call():
                start = time.perf_counter()
                outputs = []
                first = None
                async for item in pool.events_stream(index, args, {}):
                    if first is None:
                        first = time.perf_counter() - start
                    outputs.append(item)
                return outputs if stream else outputs[-1], first if stream else None

            row: dict[str, Any] = {
                "name": label,
                "repetitions_per_round": repetitions,
                "rounds": 3,
                "samples": {"thread": [], "process": []},
                "first_chunk": {"thread": [], "process": []},
            }
            report["cases"].append(row)
            start = time.perf_counter()
            expected, _ = await thread_call()
            row["first_thread_ms"] = (time.perf_counter() - start) * 1000
            if index not in warmed:
                start = time.perf_counter()
                actual, _ = await process_call()
                row["cold_process_ms"] = (time.perf_counter() - start) * 1000
                warmed.add(index)
                equal(expected, actual)
            for _ in range(5):
                actual, _ = await process_call()
                equal(expected, actual)
                await thread_call()
            for round_index in range(3):
                order = (
                    ["thread", "process"]
                    if round_index % 2 == 0
                    else ["process", "thread"]
                )
                for mode in order:
                    call = thread_call if mode == "thread" else process_call
                    for _ in range(repetitions):
                        started = time.perf_counter()
                        actual, first = await call()
                        elapsed = time.perf_counter() - started
                        row["samples"][mode].append(elapsed)
                        if first is not None:
                            row["first_chunk"][mode].append(first)
                        equal(expected, actual)
            row["summary"] = {
                mode: summary(samples) for mode, samples in row["samples"].items()
            }
            if stream:
                row["first_chunk_summary"] = {
                    mode: summary(samples)
                    for mode, samples in row["first_chunk"].items()
                }
            row["worker"] = pool.status()["workers"][0]
            assert row["worker"]["pid"] != os.getpid()
            assert row["worker"]["resource_initializations"] == [1]
            print(label, json.dumps(row["summary"]), flush=True)
            (ROOT / "results/callbacks.json.gz").write_bytes(
                gzip.compress(json.dumps(report, indent=2).encode(), mtime=0)
            )
    finally:
        for pool in app._process_pools.values():
            pool.close()


if __name__ == "__main__":
    asyncio.run(main())
