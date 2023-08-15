"""Pydantic data models and other dataclasses. This is the only file that uses Optional[]
typing syntax instead of | None syntax to work with pydantic"""
import shutil
from enum import Enum, auto
from typing import Any, Dict, List, Optional, Union

from gradio_client.utils import traverse
from pydantic import BaseModel, RootModel
from typing_extensions import Literal


class PredictBody(BaseModel):
    session_hash: Optional[str] = None
    event_id: Optional[str] = None
    data: List[Any]
    event_data: Optional[Any] = None
    fn_index: Optional[int] = None
    batched: Optional[
        bool
    ] = False  # Whether the data is a batch of samples (i.e. called from the queue if batch=True) or a single sample (i.e. called from the UI)
    request: Optional[
        Union[Dict, List[Dict]]
    ] = None  # dictionary of request headers, query parameters, url, etc. (used to to pass in request for queuing)


class ResetBody(BaseModel):
    session_hash: str
    fn_index: int


class InterfaceTypes(Enum):
    STANDARD = auto()
    INPUT_ONLY = auto()
    OUTPUT_ONLY = auto()
    UNIFIED = auto()


class Estimation(BaseModel):
    msg: Optional[str] = "estimation"
    rank: Optional[int] = None
    queue_size: int
    avg_event_process_time: Optional[float] = None
    avg_event_concurrent_process_time: Optional[float] = None
    rank_eta: Optional[float] = None
    queue_eta: float


class ProgressUnit(BaseModel):
    index: Optional[int] = None
    length: Optional[int] = None
    unit: Optional[str] = None
    progress: Optional[float] = None
    desc: Optional[str] = None


class Progress(BaseModel):
    msg: str = "progress"
    progress_data: List[ProgressUnit] = []


class LogMessage(BaseModel):
    msg: str = "log"
    log: str
    level: Literal["info", "warning"]


class GradioBaseModel:
    def copy_to_dir(self, dir: str) -> "GradioBaseModel":
        assert isinstance(self, (BaseModel, RootModel))
        return self.__class__(
            **traverse(
                self.model_dump(),
                lambda obj: FileData(**obj).copy_to_dir(dir),
                FileData.is_file_data,
            )
        )


class GradioModel(GradioBaseModel, BaseModel):
    pass


class GradioRootModel(GradioBaseModel, RootModel):
    pass


class FileData(GradioModel):
    name: Optional[str] = None
    data: Optional[str] = None  # base64 encoded data
    size: Optional[int] = None  # size in bytes
    is_file: Optional[bool] = None
    orig_name: Optional[str] = None  # original filename

    @property
    def is_none(self):
        return all(
            f is None
            for f in [self.name, self.data, self.size, self.is_file, self.orig_name]
        )

    @classmethod
    def from_path(cls, path: str) -> "FileData":
        return cls(name=path, is_file=True)

    def copy_to_dir(self, dir: str) -> "FileData":
        new_obj = dict(self)
        if self.is_file:
            new_name = shutil.copy(self.name, dir)
            new_obj["name"] = new_name
        return self.__class__(**new_obj)

    @classmethod
    def is_file_data(cls, obj: Any):
        if isinstance(obj, dict):
            try:
                return not FileData(**obj).is_none
            except:
                return False
        return False
