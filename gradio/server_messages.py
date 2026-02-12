from typing import Literal, Union

from gradio_client.utils import ServerMessage
from pydantic import BaseModel


class BaseMessage(BaseModel):
    msg: ServerMessage
    event_id: str | None = None


class ProgressUnit(BaseModel):
    index: int | float | None = None
    length: int | float | None = None
    unit: str | None = None
    progress: float | None = None
    desc: str | None = None


class ProgressMessage(BaseMessage):
    msg: Literal[ServerMessage.progress] = ServerMessage.progress  # type: ignore
    progress_data: list[ProgressUnit] = []


class LogMessage(BaseMessage):
    msg: Literal[ServerMessage.log] = ServerMessage.log  # type: ignore
    log: str
    level: Literal["info", "warning", "success", "error"]
    duration: float | None = 10
    visible: bool = True
    title: str


class EstimationMessage(BaseMessage):
    msg: Literal[ServerMessage.estimation] = ServerMessage.estimation  # type: ignore
    rank: int | None = None
    queue_size: int
    rank_eta: float | None = None


class ProcessStartsMessage(BaseMessage):
    msg: Literal[ServerMessage.process_starts] = ServerMessage.process_starts  # type: ignore
    eta: float | None = None


class ProcessCompletedMessage(BaseMessage):
    msg: Literal[ServerMessage.process_completed] = ServerMessage.process_completed  # type: ignore
    output: dict
    success: bool
    title: str | None = None


class ProcessGeneratingMessage(BaseMessage):
    msg: Literal[ServerMessage.process_generating, ServerMessage.process_streaming] = (  # type: ignore
        ServerMessage.process_generating
    )
    output: dict
    success: bool
    time_limit: float | None = None


class HeartbeatMessage(BaseMessage):
    msg: Literal[ServerMessage.heartbeat] = ServerMessage.heartbeat  # type: ignore


class CloseStreamMessage(BaseMessage):
    msg: Literal[ServerMessage.close_stream] = ServerMessage.close_stream  # type: ignore


class UnexpectedErrorMessage(BaseMessage):
    msg: Literal[ServerMessage.unexpected_error] = ServerMessage.unexpected_error  # type: ignore
    message: str
    session_not_found: bool = False
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
