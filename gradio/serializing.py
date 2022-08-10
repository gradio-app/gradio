from __future__ import annotations

import json
from abc import ABC, abstractclassmethod
from typing import Any

from gradio import processing_utils


class Serializable(ABC):
    @abstractclassmethod
    def serialize():
        """
        Convert data from human-readable format to serialized format.
        """
        pass

    @abstractclassmethod
    def deserialize():
        """
        Convert data from serialized format to human-readable format.
        """
        pass


class SimpleSerializable(Serializable):
    def serialize(self, x: Any, called_directly: bool = False) -> Any:
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

    def serialize(self, x: Any, called_directly: bool = False) -> Any:
        """
        Convert from human-friendly version of a file (string filepath) to a seralized representation (base64)
        Optionally, save the file to the directory specified by save_dir
        """
        data = processing_utils.encode_url_or_file_to_base64(x)

    def deserialize(
        self, x: Any, save_dir: str | None = None, encryption_key: bytes | None = None
    ):
        """
        Convert from serialized representation of a file (base64) to a human-friendly version (string filepath)
        Optionally, save the file to the directory specified by save_dir
        """
        file = processing_utils.decode_base64_to_file(x, dir=save_dir)
        return file.name


class FileSerializable(Serializable):
    def serialize(self, x: Any, called_directly: bool = False) -> Any:
        """
        Convert from human-friendly version of a file (string filepath) to a seralized representation (base64)
        Optionally, save the file to the directory specified by save_dir
        """
        data = processing_utils.encode_url_or_file_to_base64(x)
        return {"name": x, "data": data, "is_file": False}

    def deserialize(
        self, x: Any, save_dir: str | None = None, encryption_key: bytes | None = None
    ):
        """
        Convert from serialized representation of a file (base64) to a human-friendly version (string filepath)
        Optionally, save the file to the directory specified by save_dir
        """
        if x.get("is_file", False):
            file = processing_utils.create_tmp_copy_of_file(x["name"], dir=save_dir)
        else:
            file = processing_utils.decode_base64_to_file(x["data"], dir=save_dir)
        return file.name


class JSONSerializable(Serializable):
    def serialize(self, x: Any, called_directly: bool = False) -> Any:
        """
        Convert from serialized representation (json string) to a human-friendly version (string path to file)
        """
        # Write a temporary json file from a dict
        
        return processing_utils.json_file_to_str(x)

    def deserialize(
        self, x: Any, save_dir: str | None = None, encryption_key: bytes | None = None
    ):
        print(x)
        """
        Convert from serialized representation (json string) to a human-friendly version (string path to json file)
        """
        return processing_utils.dict_or_str_to_json_file(x, dir=save_dir)
