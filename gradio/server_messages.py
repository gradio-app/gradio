from typing import List, Literal, Optional, Union

from gradio_client.utils import ServerMessage
from pydantic import BaseModel


class BaseMessage(BaseModel):
    msg: ServerMessage
    event_id: Optional[str] = None


class ProgressUnit(BaseModel):
    index: Optional[int] = None
    length: Optional[int] = None
    unit: Optional[str] = None
    progress: Optional[float] = None
    desc: Optional[str] = None


class ProgressMessage(BaseMessage):
    msg: Literal[ServerMessage.progress] = ServerMessage.progress  # type: ignore
    progress_data: List[ProgressUnit] = []


class LogMessage(BaseMessage):
    msg: Literal[ServerMessage.log] = ServerMessage.log  # type: ignore
    log: str
    level: Literal["info", "warning"]
    duration: Optional[float] = 10
    visible: bool = True


class EstimationMessage(BaseMessage):
    msg: Literal[ServerMessage.estimation] = ServerMessage.estimation  # type: ignore
    rank: Optional[int] = None
    queue_size: int
    rank_eta: Optional[float] = None


class ProcessStartsMessage(BaseMessage):
    msg: Literal[ServerMessage.process_starts] = ServerMessage.process_starts  # type: ignore
    eta: Optional[float] = None


class ProcessCompletedMessage(BaseMessage):
    msg: Literal[ServerMessage.process_completed] = ServerMessage.process_completed  # type: ignore
    output: dict
    success: bool


class ProcessGeneratingMessage(BaseMessage):
    msg: Literal[ServerMessage.process_generating] = ServerMessage.process_generating  # type: ignore
    output: dict
    success: bool


class HeartbeatMessage(BaseMessage):
    msg: Literal[ServerMessage.heartbeat] = ServerMessage.heartbeat  # type: ignore


class CloseStreamMessage(BaseMessage):
    msg: Literal[ServerMessage.close_stream] = ServerMessage.close_stream  # type: ignore


class UnexpectedErrorMessage(BaseMessage):
    msg: Literal[ServerMessage.unexpected_error] = ServerMessage.unexpected_error  # type: ignore
    message: str
    success: Literal[False] = False


EventMessage = Union[
    ProgressMessage,
    LogMessage,
    EstimationMessage,
    ProcessStartsMessage,
    ProcessCompletedMessage,
    ProcessGeneratingMessage,
    HeartbeatMessage,
    UnexpectedErrorMessage,
    CloseStreamMessage,
]
