from __future__ import annotations

from typing import Iterable, Optional

from pydantic import BaseModel


class GradioModel(BaseModel):
    pass


class FileDict(GradioModel):
    name: Optional[str] = None
    data: Optional[str] = None  # base64 encoded data
    size: Optional[int] = None  # size in bytes
    is_file: Optional[bool] = None
    orig_name: Optional[str] = None  # original filename


class FileData(GradioModel):
    value: FileDict

    @property
    def is_file_path(self):
        return isinstance(self.value, str)

    @property
    def is_none(self):
        return self.value is None

    @property
    def is_dict(self):
        return isinstance(self.value, FileDict)

    @property
    def get_files(self) -> Iterable[FileData] | None:
        return [self]
