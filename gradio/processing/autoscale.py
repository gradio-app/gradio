"""Memory-aware autoscaling of the app's processes, run by the gateway.

With `launch(executor="process", replicas="auto")` the app starts as one
process. When events keep waiting while it is busy, and the memory one more
copy of the app needs (its observed peak plus a margin) is free, the gateway
asks the app's process to start a replica. The replica is kept only if it
improves sustained throughput, and is retired when idle or when memory runs
low. Real events are never replayed to calibrate.

Each process may run `concurrency_limit` events of an endpoint at a time, so
the gateway's queue admits that many times the number of processes.
"""

from __future__ import annotations

import statistics
import threading
import time
from typing import TYPE_CHECKING, Any

from gradio.processing.memory import Memory, admission

if TYPE_CHECKING:
    from gradio.blocks import Blocks
    from gradio.processing.gateway import Link, Pool

POLICY_VERSION = "gateway-1"


class Autoscaler:
    def __init__(
        self,
        pool: Pool,
        blocks: Blocks,
        enabled: bool,
        max_replicas: int = 2,
        min_samples: int = 3,
        backlog_seconds: float = 0.5,
        idle_seconds: float = 60,
        cooldown_seconds: float = 60,
    ):
        import os

        self.pool = pool
        self.blocks = blocks
        self.enabled = enabled
        self.max_replicas = max_replicas
        self.min_samples = min_samples
        self.backlog_seconds = float(
            os.environ.get("GRADIO_AUTOSCALE_BACKLOG_SECONDS", backlog_seconds)
        )
        self.idle_seconds = float(
            os.environ.get("GRADIO_AUTOSCALE_IDLE_SECONDS", idle_seconds)
        )
        self.cooldown_seconds = float(
            os.environ.get("GRADIO_AUTOSCALE_COOLDOWN_SECONDS", cooldown_seconds)
        )
        self.memory = Memory()
        self.lock = threading.RLock()
        self.primary = pool.links[0]
        self.primary.on_message = self.on_message
        self.base_limits: dict[str, int | None] = {}
        self.samples: list[float] = []
        self.events: list[dict] = []
        self.peaks: dict[int, dict[str, int]] = {}
        self.snapshot: dict[str, Any] = {}
        self.starting = False
        self.backlog_since: float | None = None
        self.cooldown_until = 0.0
        self.last_activity = time.monotonic()
        self.trial: dict[str, Any] | None = None
        pool.on_finish = self.on_finish
        for link in pool.links:
            link.on_close = self.on_link_closed

    # -- observations -----------------------------------------------------
    def record(self, reason: str, **extra) -> None:
        if self.events and self.events[-1]["reason"] == reason:
            return
        self.events.append({"time": time.time(), "reason": reason, **extra})
        self.events = self.events[-100:]

    def waiting(self) -> int:
        queues = self.blocks._queue.event_queue_per_concurrency_id.values()
        return sum(len(q.queue) for q in queues)

    def scale_queue(self) -> None:
        """Lets the queue run `concurrency_limit` events per serving process."""
        count = max(1, len(self.pool.serving()))
        for cid, queue in self.blocks._queue.event_queue_per_concurrency_id.items():
            base = self.base_limits.setdefault(cid, queue.concurrency_limit)
            if base is not None:
                queue.concurrency_limit = base * count

    def on_finish(self, link: Link, seconds: float) -> None:
        with self.lock:
            self.last_activity = time.monotonic()
            if (
                len(self.pool.serving()) == 1
                and not self.starting
                and self.pool.completed.get(link, 0) > 1
            ):
                # The first event of a process includes warmup
                self.samples = [*self.samples, seconds][-20:]
            trial = self.trial
            if trial is None or trial["start"] is None:
                return
            trial["durations"].append(seconds)
            if len(trial["durations"]) < 6 or not trial["continuous"]:
                return
            throughput = len(trial["durations"]) / (time.monotonic() - trial["start"])
            baseline = 1 / trial["baseline"]
            latency = statistics.median(trial["durations"])
            self.record(
                "Replica performance observed",
                throughput=throughput,
                baseline_throughput=baseline,
                median_seconds=latency,
            )
            if throughput < baseline * 1.1 or latency > trial["baseline"] * 2.5:
                self.retire(
                    self.pool.serving()[-1],
                    "Extra replica did not improve sustained throughput/latency",
                )
            else:
                self.record("Extra replica retained: throughput improved")
                self.trial = None

    def on_message(self, message: tuple) -> None:
        from gradio.processing.gateway import Link

        kind = message[0]
        if kind == "replica_ready":
            link = Link(message[1], self.blocks, primary=False)
            link.on_close = self.on_link_closed
            try:
                link.connect()
            except Exception as err:  # noqa: BLE001 -- treat as a failed start
                self.primary.send(("retire_replica", message[1]["pid"]))
                self.on_message(("replica_failed", str(err)))
                return
            with self.lock:
                self.pool.add(link)
                self.scale_queue()
                self.starting = False
                self.trial = {
                    "start": None,
                    "durations": [],
                    "baseline": statistics.median(self.samples),
                    "continuous": False,
                }
                self.record("Replica ready", pid=message[1]["pid"])
        elif kind == "replica_failed":
            with self.lock:
                self.starting = False
                self.cooldown_until = time.monotonic() + self.cooldown_seconds
                self.record("Replica initialization failed", error=message[1])

    def on_link_closed(self, link: Link) -> None:
        with self.lock:
            if link in self.pool.links:
                self.record("Replica exited", pid=link.endpoint["pid"])
            self.pool.remove(link)
            self.scale_queue()
            self.trial = None

    def retire(self, link: Link, reason: str) -> None:
        if link.primary:
            return
        self.trial = None
        self.cooldown_until = time.monotonic() + self.cooldown_seconds
        self.record(reason)

        def drained():
            with self.lock:
                self.pool.remove(link)
                self.scale_queue()
            self.primary.send(("retire_replica", link.endpoint["pid"]))

        self.pool.drain(link, drained)
        with self.lock:
            self.scale_queue()

    # -- the control loop -------------------------------------------------
    def tick(self) -> None:
        with self.lock:
            self.scale_queue()
            if not self.enabled:
                return
            links = list(self.pool.links)
            snap = self.memory.sample([link.endpoint["pid"] for link in links])
            self.snapshot = snap
            for link in links:
                pid = link.endpoint["pid"]
                usage = snap["processes"].get(pid, {})
                peak = self.peaks.setdefault(pid, {"ram": 0, "gpu": 0})
                peak["ram"] = max(peak["ram"], usage.get("ram", 0))
                peak["gpu"] = max(peak["gpu"], usage.get("gpu", 0))
            now = time.monotonic()
            serving = self.pool.serving()
            waiting = self.waiting()
            busy = bool(serving) and all(self.pool.active.get(link) for link in serving)
            self.backlog_since = (
                (self.backlog_since or now) if waiting and busy else None
            )
            if (
                len(serving) < self.max_replicas
                and not self.starting
                and not self.pool.draining
                and len(self.samples) >= self.min_samples
                and self.backlog_since is not None
                and now - self.backlog_since >= self.backlog_seconds
                and now >= self.cooldown_until
            ):
                peak = self.peaks.get(self.primary.endpoint["pid"], {})
                allowed, reason = admission(
                    snap, peak.get("ram", 0), peak.get("gpu", 0)
                )
                self.record(reason)
                if allowed:
                    self.starting = True
                    self.record("Initializing replica", replicas=len(serving) + 1)
                    self.primary.send(("spawn_replica",))
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
                    waiting
                    and busy
                    and all(self.pool.completed.get(link, 0) > 0 for link in serving)
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
                and not any(self.pool.active.get(link) for link in serving)
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

    # -- reporting --------------------------------------------------------
    def status(self) -> dict[str, Any]:
        with self.lock:
            return {
                "policy_version": POLICY_VERSION,
                "autoscale": self.enabled,
                "max_replicas": self.max_replicas,
                "starting": self.starting,
                "waiting": self.waiting(),
                "baseline_seconds": statistics.median(self.samples)
                if self.samples
                else None,
                "memory": self.snapshot,
                "events": list(self.events),
                "workers": [
                    {
                        "pid": link.endpoint["pid"],
                        "primary": link.primary,
                        "retiring": link in self.pool.draining,
                        "active": len(self.pool.active.get(link, ())),
                        "completed": self.pool.completed.get(link, 0),
                        "peak_ram": self.peaks.get(link.endpoint["pid"], {}).get(
                            "ram", 0
                        ),
                        "peak_gpu": self.peaks.get(link.endpoint["pid"], {}).get(
                            "gpu", 0
                        ),
                    }
                    for link in self.pool.links
                ],
            }

    def add_status_route(self, app) -> None:
        """GET /gradio_api/processes: the app's processes and scaling decisions."""
        from fastapi.routing import APIRoute

        from gradio.route_utils import API_PREFIX

        app.router.routes.insert(
            0, APIRoute(f"{API_PREFIX}/processes", self.status, methods=["GET"])
        )
