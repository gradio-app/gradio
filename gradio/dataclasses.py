from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel


class PredictBody(BaseModel):
    session_hash: Optional[str]
    data: List[Any]
    fn_index: Optional[int]
    batched: Optional[
        bool
    ] = False  # Whether the data is a batch of samples (i.e. called from the queue if batch=True) or a single sample (i.e. called from the UI)
    request: Optional[
        Union[Dict, List[Dict]]
    ] = None  # dictionary of request headers, query parameters, url, etc. (used to to pass in request for queuing)


class ResetBody(BaseModel):
    session_hash: str
    fn_index: int
