from typing import Any, List, Optional

from pydantic import BaseModel


class PredictBody(BaseModel):
    session_hash: Optional[str]
    data: List[Any]
    fn_index: Optional[int]
    batched: Optional[bool] = False


class ResetBody(BaseModel):
    session_hash: str
    fn_index: int
