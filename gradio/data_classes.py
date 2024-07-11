"""Pydantic data models and other dataclasses. This is the only file that uses Optional[]
typing syntax instead of | None syntax to work with pydantic"""

from __future__ import annotations

import pathlib
import secrets
import shutil
from abc import ABC, abstractmethod
from enum import Enum, auto
from typing import TYPE_CHECKING, Any, List, Literal, Optional, Tuple, TypedDict, Union

from fastapi import Request
from gradio_client.utils import traverse
from typing_extensions import NotRequired

from . import wasm_utils

if not wasm_utils.IS_WASM or TYPE_CHECKING:
    from pydantic import BaseModel, RootModel, ValidationError

    try:
        from pydantic import JsonValue
    except ImportError:
        JsonValue = Any
else:
    # XXX: Currently Pyodide V2 is not available on Pyodide,
    # so we install V1 for the Wasm version.
    from typing import Generic, TypeVar

    from pydantic import BaseModel as BaseModelV1
    from pydantic import ValidationError, schema_of

    JsonValue = Any

    # Map V2 method calls to V1 implementations.
    # Ref: https://docs.pydantic.dev/latest/migration/#changes-to-pydanticbasemodel
    class BaseModelMeta(type(BaseModelV1)):
        def __new__(cls, name, bases, dct):
            # Override `dct` to dynamically create a `Config` class based on `model_config`.
            if "model_config" in dct:
                config_class = type("Config", (), {})
                for key, value in dct["model_config"].items():
                    setattr(config_class, key, value)
                dct["Config"] = config_class
                del dct["model_config"]

            model_class = super().__new__(cls, name, bases, dct)
            return model_class

    class BaseModel(BaseModelV1, metaclass=BaseModelMeta):
        pass

    BaseModel.model_dump = BaseModel.dict  # type: ignore
    BaseModel.model_json_schema = BaseModel.schema  # type: ignore

    # RootModel is not available in V1, so we create a dummy class.
    PydanticUndefined = object()
    RootModelRootType = TypeVar("RootModelRootType")

    class RootModel(BaseModel, Generic[RootModelRootType]):
        root: RootModelRootType

        def __init__(self, root: RootModelRootType = PydanticUndefined, **data):
            if data:
                if root is not PydanticUndefined:
                    raise ValueError(
                        '"RootModel.__init__" accepts either a single positional argument or arbitrary keyword arguments'
                    )
                root = data  # type: ignore
            # XXX: No runtime validation is executed.
            super().__init__(root=root)  # type: ignore

        def dict(self, **kwargs):
            return super().dict(**kwargs)["root"]

        @classmethod
        def schema(cls, **_kwargs):
            # XXX: kwargs are ignored.
            return schema_of(cls.__fields__["root"].type_)  # type: ignore

    RootModel.model_dump = RootModel.dict  # type: ignore
    RootModel.model_json_schema = RootModel.schema  # type: ignore


class CancelBody(BaseModel):
    session_hash: str
    fn_index: int
    event_id: str


class SimplePredictBody(BaseModel):
    data: List[Any]
    session_hash: Optional[str] = None


class PredictBody(BaseModel):
    model_config = {"arbitrary_types_allowed": True}

    session_hash: Optional[str] = None
    event_id: Optional[str] = None
    data: List[Any]
    event_data: Optional[Any] = None
    fn_index: Optional[int] = None
    trigger_id: Optional[int] = None
    simple_format: bool = False
    batched: Optional[bool] = (
        False  # Whether the data is a batch of samples (i.e. called from the queue if batch=True) or a single sample (i.e. called from the UI)
    )
    request: Optional[Request] = (
        None  # dictionary of request headers, query parameters, url, etc. (used to to pass in request for queuing)
    )

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {
            "title": "PredictBody",
            "type": "object",
            "properties": {
                "session_hash": {"type": "string"},
                "event_id": {"type": "string"},
                "data": {"type": "array", "items": {"type": "object"}},
                "event_data": {"type": "object"},
                "fn_index": {"type": "integer"},
                "trigger_id": {"type": "integer"},
                "simple_format": {"type": "boolean"},
                "batched": {"type": "boolean"},
                "request": {"type": "object"},
            },
            "required": ["data"],
        }


class ResetBody(BaseModel):
    event_id: str


class ComponentServerJSONBody(BaseModel):
    session_hash: str
    component_id: int
    fn_name: str
    data: Any


class DataWithFiles(BaseModel):
    data: Any
    files: List[Tuple[str, bytes]]


class ComponentServerBlobBody(BaseModel):
    session_hash: str
    component_id: int
    fn_name: str
    data: DataWithFiles


class InterfaceTypes(Enum):
    STANDARD = auto()
    INPUT_ONLY = auto()
    OUTPUT_ONLY = auto()
    UNIFIED = auto()


class GradioBaseModel(ABC):
    def copy_to_dir(self, dir: str | pathlib.Path) -> GradioDataModel:
        if not isinstance(self, (BaseModel, RootModel)):
            raise TypeError("must be used in a Pydantic model")
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


class JsonData(RootModel):
    """JSON data returned from a component that should not be modified further."""

    root: JsonValue


class GradioModel(GradioBaseModel, BaseModel):
    @classmethod
    def from_json(cls, x) -> GradioModel:
        return cls(**x)


class GradioRootModel(GradioBaseModel, RootModel):
    @classmethod
    def from_json(cls, x) -> GradioRootModel:
        return cls(root=x)


GradioDataModel = Union[GradioModel, GradioRootModel]


class FileDataDict(TypedDict):
    path: str  # server filepath
    url: Optional[str]  # normalised server url
    size: Optional[int]  # size in bytes
    orig_name: Optional[str]  # original filename
    mime_type: Optional[str]
    is_stream: bool
    meta: dict


class FileData(GradioModel):
    path: str  # server filepath
    url: Optional[str] = None  # normalised server url
    size: Optional[int] = None  # size in bytes
    orig_name: Optional[str] = None  # original filename
    mime_type: Optional[str] = None
    is_stream: bool = False
    meta: dict = {"_type": "gradio.FileData"}

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

        if not self.path:
            raise ValueError("Source file path is not set")
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


class ListFiles(GradioRootModel):
    root: List[FileData]

    def __getitem__(self, index):
        return self.root[index]

    def __iter__(self):
        return iter(self.root)


class _StaticFiles:
    """
    Class to hold all static files for an app
    """

    all_paths = []

    def __init__(self, paths: list[str | pathlib.Path]) -> None:
        self.paths = paths
        self.all_paths = [pathlib.Path(p).resolve() for p in paths]

    @classmethod
    def clear(cls):
        cls.all_paths = []


class BodyCSS(TypedDict):
    body_background_fill: str
    body_text_color: str
    body_background_fill_dark: str
    body_text_color_dark: str


class Layout(TypedDict):
    id: int
    children: list[int | Layout]


class BlocksConfigDict(TypedDict):
    version: str
    mode: str
    app_id: int
    dev_mode: bool
    analytics_enabled: bool
    components: list[dict[str, Any]]
    css: str | None
    connect_heartbeat: bool
    js: str | None
    head: str | None
    title: str
    space_id: str | None
    enable_queue: bool
    show_error: bool
    show_api: bool
    is_colab: bool
    max_file_size: int | None
    stylesheets: list[str]
    theme: str | None
    protocol: Literal["ws", "sse", "sse_v1", "sse_v2", "sse_v2.1", "sse_v3"]
    body_css: BodyCSS
    fill_height: bool
    theme_hash: str
    layout: NotRequired[Layout]
    dependencies: NotRequired[list[dict[str, Any]]]
    root: NotRequired[str | None]
    username: NotRequired[str | None]
