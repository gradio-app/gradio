from typing import List, Literal, Optional, Union

from gradio_client.utils import ServerMessage

# In the data_classes.py file, the BaseModel class is patched
# so that it can be used in both Pyodide and non-Pyodide environments.
# So we import it from the data_classes.py file
# instead of the original Pydantic BaseModel class.
from gradio.data_classes import BaseModel


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
    msg: Literal[ServerMessage.progress] = ServerMessage.progress
    progress_data: List[ProgressUnit] = []


class LogMessage(BaseMessage):
    msg: Literal[ServerMessage.log] = ServerMessage.log
    log: str
    level: Literal["info", "warning"]


class EstimationMessage(BaseMessage):
    msg: Literal[ServerMessage.estimation] = ServerMessage.estimation
    rank: Optional[int] = None
    queue_size: int
    rank_eta: Optional[float] = None


class ProcessStartsMessage(BaseMessage):
    msg: Literal[ServerMessage.process_starts] = ServerMessage.process_starts
    eta: Optional[float] = None


class ProcessCompletedMessage(BaseMessage):
    msg: Literal[ServerMessage.process_completed] = ServerMessage.process_completed
    output: dict
    success: bool


class ProcessGeneratingMessage(BaseMessage):
    msg: Literal[ServerMessage.process_generating] = ServerMessage.process_generating
    output: dict
    success: bool


class HeartbeatMessage(BaseModel):
    msg: Literal[ServerMessage.heartbeat] = ServerMessage.heartbeat


class CloseStreamMessage(BaseModel):
    msg: Literal[ServerMessage.close_stream] = ServerMessage.close_stream


class UnexpectedErrorMessage(BaseModel):
    msg: Literal[ServerMessage.unexpected_error] = ServerMessage.unexpected_error
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
