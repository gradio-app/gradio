from __future__ import annotations

import contextvars
import os
import time
from collections import deque
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from typing import Any

PROFILING_ENABLED = os.environ.get("GRADIO_PROFILING", "").strip() in ("1", "true")


@dataclass
class RequestTrace:
    event_id: str | None = None
    fn_name: str | None = None
    session_hash: str | None = None
    timestamp: float = field(default_factory=time.time)

    queue_wait_ms: float = 0.0
    preprocess_ms: float = 0.0
    fn_call_ms: float = 0.0
    postprocess_ms: float = 0.0
    streaming_diff_ms: float = 0.0
    total_ms: float = 0.0
    n_iterations: int = 0

    def set_phase(self, name: str, duration_ms: float):
        attr = f"{name}_ms"
        if hasattr(self, attr):
            # Accumulate across generator iterations
            setattr(self, attr, getattr(self, attr) + duration_ms)
        if name == "total":
            self.n_iterations += 1

    def to_dict(self) -> dict[str, Any]:
        return {
            "event_id": self.event_id,
            "fn_name": self.fn_name,
            "session_hash": self.session_hash,
            "timestamp": self.timestamp,
            "queue_wait_ms": self.queue_wait_ms,
            "preprocess_ms": self.preprocess_ms,
            "fn_call_ms": self.fn_call_ms,
            "postprocess_ms": self.postprocess_ms,
            "streaming_diff_ms": self.streaming_diff_ms,
            "total_ms": self.total_ms,
            "n_iterations": self.n_iterations,
        }


_current_trace: contextvars.ContextVar[RequestTrace | None] = contextvars.ContextVar(
    "_current_trace", default=None
)


def get_current_trace() -> RequestTrace | None:
    return _current_trace.get()


def set_current_trace(trace: RequestTrace) -> contextvars.Token:
    return _current_trace.set(trace)


@asynccontextmanager
async def trace_phase(name: str):
    """Async context manager that records timing for a named phase into the current trace."""
    trace = _current_trace.get()
    if trace is None:
        yield
        return
    start = time.monotonic()
    try:
        yield
    finally:
        duration_ms = (time.monotonic() - start) * 1000
        trace.set_phase(name, duration_ms)


class TraceCollector:
    def __init__(self, maxlen: int = 100_000):
        self._traces: deque[RequestTrace] = deque(maxlen=maxlen)

    def add(self, trace: RequestTrace):
        self._traces.append(trace)

    def get_all(self, last_n: int | None = None) -> list[dict[str, Any]]:
        traces = list(self._traces)
        if last_n is not None:
            traces = traces[-last_n:]
        return [t.to_dict() for t in traces]

    def get_summary(self) -> dict[str, Any]:
        if not self._traces:
            return {"count": 0, "phases": {}}

        import numpy as np

        phases = [
            "queue_wait",
            "preprocess",
            "fn_call",
            "postprocess",
            "streaming_diff",
            "total",
        ]
        result: dict[str, Any] = {"count": len(self._traces), "phases": {}}
        for phase in phases:
            values = [getattr(t, f"{phase}_ms") for t in self._traces]
            arr = np.array(values)
            result["phases"][phase] = {
                "p50": float(np.percentile(arr, 50)),
                "p90": float(np.percentile(arr, 90)),
                "p95": float(np.percentile(arr, 95)),
                "p99": float(np.percentile(arr, 99)),
                "mean": float(np.mean(arr)),
                "min": float(np.min(arr)),
                "max": float(np.max(arr)),
            }
        return result

    def clear(self):
        self._traces.clear()


# Global collector instance
collector = TraceCollector()


if not PROFILING_ENABLED:
    # Replace with no-ops for zero overhead

    @asynccontextmanager
    async def trace_phase(name: str):  # noqa: ARG001
        yield
