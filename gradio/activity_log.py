from __future__ import annotations

import threading
from collections import deque
from typing import TYPE_CHECKING, Dict, Literal, Optional, Union

from pydantic import BaseModel

if TYPE_CHECKING:
    from gradio.queueing import Queue

PREVIEW_SIZE = 10

StatusType = Literal[
    "pending", "running", "success", "error", "closed", "lost", "stopped"
]


class Task(BaseModel):
    fn: str
    idx: Union[int, str]
    status: Optional[StatusType]


RequestBreakdown = Dict[StatusType, int]


class FunctionStats(BaseModel):
    fn: Union[str, int]
    duration: float
    request_breakdown: collections.Counter


class Activity(BaseModel):
    sessions: int = 0
    request_breakdown: Union[RequestBreakdown, None]
    requests_per_fn: list[FunctionStats] = []
    event_count_per_stage: list[int] = [0, 0, 0, 0]
    queue_preview: Optional[list[list[Task]]] = None
    active_workers: int = 0

class ActivityLog:
    def __init__(self, dependencies: list[dict], queue: Queue | None, **kwargs):
        self.activity = Activity(active_workers=queue.max_thread_count if queue else 0)
        self.activity.request_breakdown = collections.Counter()
        self.fn_names = [dep.get("api_name") or i for i, dep in enumerate(dependencies)]
        self.activity.requests_per_fn = [
            FunctionStats(fn=fn_name, duration=0, request_breakdown=collections.Counter())
            for fn_name in self.fn_names
        ]

        self.activity.queue_preview = [[], [], [], []]
        self.queue = queue
        self.completed_tasks = deque(maxlen=PREVIEW_SIZE)
        self.lock = threading.Lock()

    def _request_update(self, fn_index: int, status: StatusType, diff: int):
        with self.lock:
            self.activity.request_breakdown[status] += diff
            self.activity.requests_per_fn[fn_index].request_breakdown[status] += diff

    def new_session(self):
        with self.lock:
            self.activity.sessions += 1

    def update_request(
        self,
        fn_index: int = 0,
        old_state: str | None = None,
        new_state: str | None = None,
        avg_duration: float | None = None,
    ):
        if old_state is not None:
            self._request_update(fn_index, old_state, -1)
        if new_state is not None:
            self._request_update(fn_index, new_state, 1)
        if avg_duration is not None:
            self.activity.requests_per_fn[fn_index].duration = avg_duration
        if self.queue:
            queued = []
            self.activity.event_count_per_stage[0] = len(self.queue.event_queue)
            for i, evt in enumerate(self.queue.event_queue):
                if i >= PREVIEW_SIZE:
                    break
                task = Task(fn=self.fn_names[evt.fn_index], idx=evt.idx)
                queued.append(task)
            self.activity.queue_preview[0] = queued
            pending = []
            self.activity.event_count_per_stage[1] = sum(
                0 if job is None else 1 for job in self.queue.active_jobs
            )
            for evts in self.queue.active_jobs:
                if len(pending) >= PREVIEW_SIZE:
                    break
                if evts is None or len(evts) == 0:
                    continue
                task = Task(
                    fn=self.fn_names[evts[0].fn_index],
                    idx=(
                        evts[0].idx
                        if len(evts) == 1
                        else "|".join(str(evt.idx) for evt in evts)
                    ),
                )
                pending.append(task)
            self.activity.queue_preview[1] = pending

    def complete_request(self, fn_index: int, idx: int, status: str):
        self.update_request()  # update previous stages first
        fn = self.fn_names[fn_index]
        task = Task(fn=fn, idx=idx, status=status)
        self.completed_tasks.append(task)
        self.activity.queue_preview[2] = list(self.completed_tasks)[::-1]
        with self.lock:
            self.activity.event_count_per_stage[2] += 1
