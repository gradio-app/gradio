# ruff: noqa: S101 -- benchmark correctness assertions
"""Sequential HTTP/SSE latency against app.py on localhost:7871."""

import gzip
import json
import statistics
import time
from pathlib import Path
from typing import Any

import numpy as np
import requests

URL = "http://127.0.0.1:7871"
ROOT = Path(__file__).resolve().parent
session = requests.Session()


def call(name, data):
    started = time.perf_counter()
    response = session.post(
        URL + "/gradio_api/call/" + name, json={"data": data}, timeout=30
    )
    response.raise_for_status()
    event_id = response.json()["event_id"]
    event = None
    with session.get(
        URL + "/gradio_api/call/" + name + "/" + event_id, stream=True, timeout=30
    ) as response:
        response.raise_for_status()
        for line in response.iter_lines(chunk_size=1, decode_unicode=True):
            if isinstance(line, bytes):
                line = line.decode("utf-8")
            if line.startswith("event: "):
                event = line[7:]
            elif line.startswith("data: ") and event == "error":
                raise RuntimeError(line)
            elif line.startswith("data: ") and event == "complete":
                return time.perf_counter() - started, json.loads(line[6:])
    raise RuntimeError("No completion event")


report: dict[str, Any] = {
    "method": "Sequential HTTP/SSE localhost, persistent client session, three rounds of 50 per mode; alternating order",
    "cases": [],
}
for name, args, expected in [
    ("greet", ["Gradio"], ["Hello Gradio!"]),
    ("calculator", [144, "multiply", 2.5], [360.0]),
]:
    row: dict[str, Any] = {
        "name": name,
        "samples": {"thread": [], "process": []},
        "first_call_ms": {},
    }
    report["cases"].append(row)
    for mode in ("thread", "process"):
        endpoint = name + ("_thread" if mode == "thread" else "")
        elapsed, value = call(endpoint, args)
        assert value == expected, value
        row["first_call_ms"][mode] = elapsed * 1000
        for _ in range(5):
            call(endpoint, args)
    for round_index in range(3):
        for mode in (
            ["thread", "process"] if round_index % 2 == 0 else ["process", "thread"]
        ):
            endpoint = name + ("_thread" if mode == "thread" else "")
            for _ in range(50):
                elapsed, value = call(endpoint, args)
                assert value == expected
                row["samples"][mode].append(elapsed)
    row["summary"] = {
        mode: {
            "median_ms": statistics.median(values) * 1000,
            "p95_ms": float(np.percentile(values, 95)) * 1000,
        }
        for mode, values in row["samples"].items()
    }
    (ROOT / "results/http.json.gz").write_bytes(
        gzip.compress(json.dumps(report, indent=2).encode(), mtime=0)
    )
    print(name, row["summary"], flush=True)
