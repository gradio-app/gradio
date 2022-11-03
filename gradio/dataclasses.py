from typing import Any, List, Optional

from pydantic import BaseModel


class PredictBody(BaseModel):
    session_hash: Optional[str]
    data: List[Any]
    fn_index: Optional[int]
    batched: Optional[
        bool
    ] = False  # Whether the data is a batch of samples (i.e. called from the queue if batch=True) or a single sample (i.e. called from the UI)


class ResetBody(BaseModel):
    session_hash: str
    fn_index: int
