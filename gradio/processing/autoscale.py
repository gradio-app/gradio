"""Memory-aware autoscaling of the app's processes, run by the gateway.

With `launch(replicas="auto")` the app starts as one process. When events keep
waiting while every process is busy, and the memory one more copy of the app
needs (its observed peak plus a margin) is free, the gateway asks the app's
process to start a replica. The replica is kept only if it improves sustained
throughput, and is retired when idle or when memory runs low. Real events are
never replayed to calibrate.
"""

from __future__ import annotations

import os
import statistics
import threading
import time
from typing import TYPE_CHECKING, Any

from gradio.processing.memory import Memory, admission

if TYPE_CHECKING:
    from gradio.blocks import Blocks
    from gradio.processing.gateway import Link, Pool


def _setting(name: str, default: float) -> float:
    return float(os.environ.get(f"GRADIO_AUTOSCALE_{name}", default))


class Autoscaler:
    def __init__(self, pool: Pool, blocks: Blocks):
        self.pool = pool
        self.blocks = blocks
        self.max_replicas = int(_setting("MAX_REPLICAS", 4))
        self.min_samples = 3
        self.backlog_seconds = _setting("BACKLOG_SECONDS", 0.5)
        self.idle_seconds = _setting("IDLE_SECONDS", 60)
        self.cooldown_seconds = _setting("COOLDOWN_SECONDS", 60)
        self.memory = Memory()
        self.lock = threading.RLock()
        self.samples: list[float] = []
        self.events: list[dict] = []
        self.peaks: dict[int, dict[str, int]] = {}
        self.snapshot: dict[str, Any] = {}
        self.starting = False
        self.backlog_since: float | None = None
        self.cooldown_until = 0.0
        self.last_activity = time.monotonic()
        self.trial: dict[str, Any] | None = None
        self.throughputs: dict[int, float] = {}
        pool.autoscaler = self

    def record(self, reason: str, **extra) -> None:
        if self.events and self.events[-1]["reason"] == reason:
            return
        self.events.append({"time": time.time(), "reason": reason, **extra})
        self.events = self.events[-100:]

    def waiting(self) -> int:
        queues = self.blocks._queue.event_queue_per_concurrency_id.values()
        return sum(len(q.queue) for q in queues)

    def finished(self, link: Link, seconds: float) -> None:
        """An event ran on `link` from its first step to its last."""
        with self.lock:
            self.last_activity = time.monotonic()
            if (
                len(self.pool.serving()) == 1
                and not self.starting
                and link.completed > 1
            ):
                # A process's first event includes its warmup
                self.samples = [*self.samples, seconds][-20:]
            trial = self.trial
            if trial is None or trial["start"] is None:
                return
            trial["durations"].append(seconds)
            if len(trial["durations"]) < 6 or not trial["continuous"]:
                return
            throughput = len(trial["durations"]) / (time.monotonic() - trial["start"])
            count = len(self.pool.serving())
            before = self.throughputs.get(count - 1, (count - 1) / trial["baseline"])
            latency = statistics.median(trial["durations"])
            self.record(
                "Replica performance observed",
                processes=count,
                throughput=throughput,
                throughput_before=before,
                median_seconds=latency,
            )
            if throughput < before * 1.1 or latency > trial["baseline"] * 2.5:
                self.retire(
                    self.pool.serving()[-1],
                    "Extra replica did not improve sustained throughput/latency",
                )
            else:
                self.record("Extra replica retained: throughput improved")
                self.throughputs[count] = throughput
                self.trial = None

    def replica_added(self, link: Link) -> None:
        with self.lock:
            self.starting = False
            self.trial = {
                "start": None,
                "durations": [],
                "baseline": statistics.median(self.samples),
                "continuous": False,
            }
            self.record("Replica ready", pid=link.address["pid"])

    def replica_failed(self) -> None:
        with self.lock:
            self.starting = False
            self.cooldown_until = time.monotonic() + self.cooldown_seconds
            self.record("Replica failed to start")

    def replica_lost(self, link: Link) -> None:
        with self.lock:
            self.pool.expected = max(self.pool.expected - 1, 1)
            if not link.draining:
                self.record("Replica exited", pid=link.address["pid"])
            self.trial = None

    def retire(self, link: Link, reason: str) -> None:
        if link.primary:
            return
        self.trial = None
        self.cooldown_until = time.monotonic() + self.cooldown_seconds
        self.record(reason, pid=link.address["pid"])
        pool = self.pool

        def drained():
            pool.remove(link)
            pool.primary.send(("retire_replica", link.address["pid"]))

        pool.drain(link, drained)

    def tick(self) -> None:
        with self.lock:
            links = list(self.pool.links)
            snap = self.memory.sample([link.address["pid"] for link in links])
            self.snapshot = snap
            for link in links:
                pid = link.address["pid"]
                usage = snap["processes"].get(pid, {})
                peak = self.peaks.setdefault(pid, {"ram": 0, "gpu": 0})
                peak["ram"] = max(peak["ram"], usage.get("ram", 0))
                peak["gpu"] = max(peak["gpu"], usage.get("gpu", 0))
            now = time.monotonic()
            serving = self.pool.serving()
            waiting = self.waiting()
            busy = bool(serving) and all(link.active for link in serving)
            self.backlog_since = (
                (self.backlog_since or now) if waiting and busy else None
            )
            if (
                len(serving) < self.max_replicas
                and not self.starting
                and self.trial is None
                and len(serving) == len(links)
                and len(self.samples) >= self.min_samples
                and self.backlog_since is not None
                and now - self.backlog_since >= self.backlog_seconds
                and now >= self.cooldown_until
            ):
                peak = self.peaks.get(self.pool.primary.address["pid"], {})
                allowed, reason = admission(
                    snap, peak.get("ram", 0), peak.get("gpu", 0)
                )
                self.record(reason)
                if allowed:
                    self.starting = True
                    self.pool.expected += 1
                    self.record("Initializing replica", replicas=len(serving) + 1)
                    self.pool.primary.send(("spawn_replica",))
            replicas = [link for link in serving if not link.primary]
            if replicas and not self.starting:
                ram_pressure = snap["available"] < max(1024**3, snap["total"] * 0.15)
                gpu_pressure = snap.get("gpu_available", float("inf")) < max(
                    1024**3, snap.get("gpu_total", 0) * 0.15
                )
                if ram_pressure or gpu_pressure:
                    self.retire(
                        replicas[-1], "Memory reserve depleted; draining extra replica"
                    )
                    return
            trial = self.trial
            if trial is not None:
                continuous = (
                    waiting and busy and all(link.completed > 0 for link in serving)
                )
                if continuous and not trial["continuous"]:
                    trial.update(start=now, durations=[], continuous=True)
                elif not waiting and not busy:
                    trial["continuous"] = False
            if (
                replicas
                and not self.starting
                and now - self.last_activity > self.idle_seconds
                and not waiting
                and not any(link.active for link in serving)
            ):
                self.retire(replicas[-1], "Idle replica retired")

    def run(self) -> None:
        while True:
            try:
                self.tick()
            except Exception as err:  # noqa: BLE001 -- keep serving without scaling
                self.record(
                    "Telemetry failed; expansion disabled for this sample",
                    error=str(err),
                )
            time.sleep(0.25)

    def start(self) -> None:
        threading.Thread(target=self.run, daemon=True, name="gradio-autoscaler").start()

    def status(self) -> dict[str, Any]:
        with self.lock:
            return {
                "max_replicas": self.max_replicas,
                "waiting": self.waiting(),
                "baseline_seconds": statistics.median(self.samples)
                if self.samples
                else None,
                "memory": self.snapshot,
                "peaks": self.peaks,
                "events": list(self.events),
            }
