"""Pydantic data models and other dataclasses. This is the only file that uses Optional[]
typing syntax instead of | None syntax to work with pydantic"""

from __future__ import annotations

import pathlib
import secrets
import shutil
from abc import ABC, abstractmethod
from enum import Enum, auto
from typing import (
    Any,
    Iterator,
    List,
    Literal,
    NewType,
    Optional,
    Tuple,
    TypedDict,
    Union,
)

from fastapi import Request
from gradio_client.documentation import document
from gradio_client.utils import traverse
from pydantic import (
    BaseModel,
    GetCoreSchemaHandler,
    GetJsonSchemaHandler,
    RootModel,
    ValidationError,
)
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing_extensions import Annotated, NotRequired

try:
    from pydantic import JsonValue
except ImportError:
    JsonValue = Any

DeveloperPath = NewType("DeveloperPath", str)
UserProvidedPath = NewType("UserProvidedPath", str)


class CancelBody(BaseModel):
    session_hash: str
    fn_index: int
    event_id: str


class SimplePredictBody(BaseModel):
    data: List[Any]
    session_hash: Optional[str] = None


class _StarletteRequestPydanticAnnotation:
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: GetCoreSchemaHandler,
    ) -> core_schema.CoreSchema:
        def validate_request(value: Any) -> Request:
            if isinstance(value, Request):
                return value
            raise ValueError("Input must be a Starlette Request object")

        return core_schema.no_info_plain_validator_function(validate_request)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, _core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        return {"type": "object", "title": "StarletteRequest"}


PydanticStarletteRequest = Annotated[Request, _StarletteRequestPydanticAnnotation]


class PredictBody(BaseModel):
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
            },
            "required": ["data"],
        }


class PredictBodyInternal(PredictBody):
    "Separate class to avoid exposing PydanticStarletteRequest in the API validation"

    request: Optional[PydanticStarletteRequest] = (
        None  # dictionary of request headers, query parameters, url, etc. (used to to pass in request for queuing)
    )


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


@document()
class FileData(GradioModel):
    """
    The FileData class is a subclass of the GradioModel class that represents a file object within a Gradio interface. It is used to store file data and metadata when a file is uploaded.

    Attributes:
        path: The server file path where the file is stored.
        url: The normalized server URL pointing to the file.
        size: The size of the file in bytes.
        orig_name: The original filename before upload.
        mime_type: The MIME type of the file.
        is_stream: Indicates whether the file is a stream.
        meta: Additional metadata used internally (should not be changed).
    """

    path: str  # server filepath
    url: Optional[str] = None  # normalised server url
    size: Optional[int] = None  # size in bytes
    orig_name: Optional[str] = None  # original filename
    mime_type: Optional[str] = None
    is_stream: bool = False
    meta: dict = {"_type": "gradio.FileData"}

    @property
    def is_none(self) -> bool:
        """
        Checks if the FileData object is empty, i.e., all attributes are None.

        Returns:
            bool: True if all attributes (except 'is_stream' and 'meta') are None, False otherwise.
        """
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
        """
        Creates a FileData object from a given file path.

        Args:
            path: The file path.

        Returns:
            FileData: An instance of FileData representing the file at the specified path.
        """
        return cls(path=path)

    def _copy_to_dir(self, dir: str) -> FileData:
        """
        Copies the file to a specified directory and returns a new FileData object representing the copied file.

        Args:
            dir: The destination directory.

        Returns:
            FileData: A new FileData object representing the copied file.

        Raises:
            ValueError: If the source file path is not set.
        """
        pathlib.Path(dir).mkdir(exist_ok=True)
        new_obj = dict(self)

        if not self.path:
            raise ValueError("Source file path is not set")
        new_name = shutil.copy(self.path, dir)
        new_obj["path"] = new_name
        return self.__class__(**new_obj)

    @classmethod
    def is_file_data(cls, obj: Any) -> bool:
        """
        Checks if an object is a valid FileData instance.

        Args:
            obj: The object to check.

        Returns:
            bool: True if the object is a valid FileData instance, False otherwise.
        """
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

    def __iter__(self) -> Iterator[FileData]:  # type: ignore[override]
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
    fill_width: bool
    theme_hash: str
    layout: NotRequired[Layout]
    dependencies: NotRequired[list[dict[str, Any]]]
    root: NotRequired[str | None]
    username: NotRequired[str | None]
