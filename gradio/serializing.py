from __future__ import annotations

from abc import ABC, abstractclassmethod
import os
from typing import Any, Dict

from gradio import processing_utils


class Serializable(ABC):
    @abstractclassmethod
    def serialize(self, x: Any, called_directly: bool = False):
        """
        Convert data from human-readable format to serialized format for a browser.
        """
        pass

    @abstractclassmethod
    def deserialize(x: Any, save_dir: str | None = None, encryption_key: bytes | None = None):
        """
        Convert data from serialized format for a browser to human-readable format.
        """
        pass


class SimpleSerializable(Serializable):
    def serialize(self, x: Any, load_dir: str, called_directly: bool = False) -> Any:
        """
        Convert data from human-readable format to serialized format. For SimpleSerializable components, this is a no-op.
        Parameters:
            x: Input to interface
            called_directly: if True, the component is part of an Interface/Blocks was called as a function, otherwise, it is being used via the GUI
        """
        return x

    def deserialize(
        self, x: Any, save_dir: str | None = None, encryption_key: bytes | None = None
    ):
        """
        Convert data from serialized format to human-readable format. For SimpleSerializable components, this is a no-op.
        """
        return x


class ImgSerializable(Serializable):
    """Special case for Image components. TODO: make Image components follow the same pattern as other FileSerializable components"""

    def serialize(self, x: str, load_dir: str = "", called_directly: bool = False) -> str:
        """
        Convert from human-friendly version of a file (string filepath) to a seralized representation (base64)
        Optionally, save the file to the directory specified by save_dir
        """
        if x is None or x == "":
            return None
        return processing_utils.encode_url_or_file_to_base64(os.path.join(load_dir, x))

    def deserialize(
        self, x: str, save_dir: str | None = None, encryption_key: bytes | None = None
    ) -> str:
        """
        Convert from serialized representation of a file (base64) to a human-friendly version (string filepath)
        Optionally, save the file to the directory specified by save_dir
        """
        if x is None or x == "":
            return None
        file = processing_utils.decode_base64_to_file(x, dir=save_dir)
        return file.name


class FileSerializable(Serializable):
    def serialize(self, x: str, load_dir: str = "", called_directly: bool = False) -> Any:
        """
        Convert from human-friendly version of a file (string filepath) to a seralized representation (base64)
        """
        if x is None or x == "":
            return None
        return {"name": os.path.join(load_dir, x), "data": None, "is_file": True}

    def deserialize(
        self, x: Dict, save_dir: str | None = None, encryption_key: bytes | None = None
    ):
        """
        Convert from serialized representation of a file (base64) to a human-friendly version (string filepath)
        Optionally, save the file to the directory specified by save_dir
        """
        if x is None:
            return None
        if x.get("is_file", False):
            file = processing_utils.create_tmp_copy_of_file(x["name"], dir=save_dir)
        else:
            file = processing_utils.decode_base64_to_file(x["data"], dir=save_dir)
        return file.name


class JSONSerializable(Serializable):
    def serialize(self, x: str, load_dir: str = "", called_directly: bool = False) -> str:
        """
        Convert from serialized representation (json string) to a human-friendly version (string path to file)
        """
        # Write a temporary json file from a dict
        if x is None or x == "":
            return None       
        return processing_utils.file_to_json(os.path.join(x))

    def deserialize(
        self, x: str | Dict, save_dir: str | None = None, encryption_key: bytes | None = None
    ) -> str:
        """
        Convert from serialized representation (json string) to a human-friendly version (string path to json file)
        """
        if x is None:
            return None
        return processing_utils.dict_or_str_to_json_file(x, dir=save_dir).name
