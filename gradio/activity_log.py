from __future__ import annotations

from typing import Dict, List, Tuple, Optional, Union, Literal
from pydantic import BaseModel
import threading

StatusType = Literal[
    "pending", "running", "success", "error", "closed", "lost", "stopped"
]

class Task(BaseModel):
    fn: str
    idx: float
    status: Optional[StatusType]


RequestBreakdown = Dict[StatusType, int]


class FunctionStats(BaseModel):
    fn: Union[str, int]
    duration: float
    request_breakdown: RequestBreakdown

lock = threading.Lock()
PREVIEW_SIZE = 10

class ActivityLog(BaseModel):
    sessions: int = 0
    request_breakdown: Union[Dict[StatusType, int], None]
    avg_duration: float = 0
    requests_per_fn: List[FunctionStats] = []
    event_count_per_stage: Tuple[int, int, int, int] = (0, 0, 0, 0)
    queue_preview: Optional[List[List[Task]]] = None

    def __init__(self, dependencies, **kwargs):
        super().__init__(**kwargs)
        if self.request_breakdown is None:
            self.request_breakdown = {}

        self.requests_per_fn = [
            FunctionStats(fn=dep.get("api_name") or i, duration=0, request_breakdown={})
            for i, dep in enumerate(dependencies)
        ]

        self.queue_preview = [[], [], [], []]

    def _request_update(self, fn_index: int, status: StatusType, diff: int):
        with lock:
            self.request_breakdown[status] = (
                self.request_breakdown.get(status, 0) + diff
            )
            self.requests_per_fn[fn_index].request_breakdown[status] = (
                self.requests_per_fn[fn_index].request_breakdown.get(status, 0) + diff
            )

    def new_session(self):
        with lock:
            self.sessions += 1

    def update_request(
        self,
        fn_index: int,
        old_state: str | None = None,
        new_state: str | None = None,
        avg_duration: float | None = None,
    ):
        if old_state is not None:
            self._request_update(fn_index, old_state, -1)
        if new_state is not None:
            self._request_update(fn_index, new_state, 1)
        if avg_duration is not None:
            self.requests_per_fn[fn_index].duration = avg_duration

    def update_queue(self, fn: str, idx: int, new_queue: int | None, old_queue: int | None = None, ):
        with lock:
            if old_queue is not None:
                self.queue_preview[old_queue].remove(task)
            if new_queue is not None:
                self.queue_preview[new_queue].append(task)
