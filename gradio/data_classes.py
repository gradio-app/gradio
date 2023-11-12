"""Pydantic data models and other dataclasses. This is the only file that uses Optional[]
typing syntax instead of | None syntax to work with pydantic"""
from __future__ import annotations

import pathlib
import secrets
import shutil
from abc import ABC, abstractmethod
from enum import Enum, auto
from typing import Any, List, Optional, Union

from fastapi import Request
from gradio_client.utils import traverse
from pydantic import BaseModel, RootModel, ValidationError
from typing_extensions import Literal


class PredictBody(BaseModel):
    class Config:
        arbitrary_types_allowed = True

    session_hash: Optional[str] = None
    event_id: Optional[str] = None
    data: List[Any]
    event_data: Optional[Any] = None
    fn_index: Optional[int] = None
    trigger_id: Optional[int] = None
    batched: Optional[
        bool
    ] = False  # Whether the data is a batch of samples (i.e. called from the queue if batch=True) or a single sample (i.e. called from the UI)
    request: Optional[
        Request
    ] = None  # dictionary of request headers, query parameters, url, etc. (used to to pass in request for queuing)


class ResetBody(BaseModel):
    event_id: str


class ComponentServerBody(BaseModel):
    session_hash: str
    component_id: int
    fn_name: str
    data: Any


class InterfaceTypes(Enum):
    STANDARD = auto()
    INPUT_ONLY = auto()
    OUTPUT_ONLY = auto()
    UNIFIED = auto()


class Estimation(BaseModel):
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
    progress_data: List[ProgressUnit] = []


class LogMessage(BaseModel):
    log: str
    level: Literal["info", "warning"]


class GradioBaseModel(ABC):
    def copy_to_dir(self, dir: str | pathlib.Path) -> GradioDataModel:
        assert isinstance(self, (BaseModel, RootModel))
        if isinstance(dir, str):
            dir = pathlib.Path(dir)

        # TODO: Making sure path is unique should be done in caller
        def unique_copy(obj: dict):
            data = FileData(**obj)
            return data._copy_to_dir(
                str(pathlib.Path(dir / secrets.token_hex(10)))
            ).model_dump()

        return self.__class__.from_json(
            x=traverse(
                self.model_dump(),
                unique_copy,
                FileData.is_file_data,
            )
        )

    @classmethod
    @abstractmethod
    def from_json(cls, x) -> GradioDataModel:
        pass


class GradioModel(GradioBaseModel, BaseModel):
    @classmethod
    def from_json(cls, x) -> GradioModel:
        return cls(**x)


class GradioRootModel(GradioBaseModel, RootModel):
    @classmethod
    def from_json(cls, x) -> GradioRootModel:
        return cls(root=x)


GradioDataModel = Union[GradioModel, GradioRootModel]


class FileData(GradioModel):
    path: str  # server filepath
    url: Optional[str] = None  # normalised server url
    size: Optional[int] = None  # size in bytes
    orig_name: Optional[str] = None  # original filename
    mime_type: Optional[str] = None

    @property
    def is_none(self):
        return all(
            f is None
            for f in [
                self.path,
                self.url,
                self.size,
                self.orig_name,
                self.mime_type,
            ]
        )

    @classmethod
    def from_path(cls, path: str) -> FileData:
        return cls(path=path)

    def _copy_to_dir(self, dir: str) -> FileData:
        pathlib.Path(dir).mkdir(exist_ok=True)
        new_obj = dict(self)

        assert self.path
        new_name = shutil.copy(self.path, dir)
        new_obj["path"] = new_name
        return self.__class__(**new_obj)

    @classmethod
    def is_file_data(cls, obj: Any):
        if isinstance(obj, dict):
            try:
                return not FileData(**obj).is_none
            except (TypeError, ValidationError):
                return False
        return False
