from __future__ import annotations

from typing import Dict, List, Tuple, Optional, Union
from pydantic import BaseModel

QueuePreviewStage = List[Union[Tuple[int, str], Tuple[int, str, str]]]
REQUEST_STATUSES = [
    "success",
    "pending",
    "closed",
    "lost",
    "error",
    "stopped",
    "waiting_connection",
]


class ActivityLog(BaseModel):
    sessions: int = 0
    request_breakdown: Union[Dict[str, int], None]
    avg_duration: float = 0
    requests_per_fn: List[Tuple[Union[int, str], float, Dict[str, int]]] = []
    event_count_per_stage: Tuple[int, int, int, int] = (0, 0, 0, 0)
    queue_preview: Optional[
        List[QueuePreviewStage]
    ] = None

    def __init__(self, dependencies, **kwargs):
        super().__init__(**kwargs)
        if self.request_breakdown is None:
            self.request_breakdown = {status: 0 for status in REQUEST_STATUSES}
        self.requests_per_fn = [
            (dep.get("api_name", i), 0, {status: 0 for status in REQUEST_STATUSES})
            for i, dep in enumerate(dependencies)
        ]

    def new_request(self, fn_index: int):
        self.sessions += 1
        self.request_breakdown["pending"] += 1
        self.requests_per_fn[fn_index][2]["pending"] += 1

    def update_request(self, fn_index: int, old_state: str, new_state: str, avg_duration: float | None):
        self.request_breakdown[old_state] -= 1
        self.request_breakdown[new_state] += 1
        self.requests_per_fn[fn_index][2][old_state] -= 1
        self.requests_per_fn[fn_index][2][new_state] += 1
        if avg_duration is not None:
            self.requests_per_fn[fn_index][1] = avg_duration