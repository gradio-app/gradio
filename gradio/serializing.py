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
    def serialize(self, x: Any, called_directly: bool) -> Any:
        """
        Convert data from human-readable format to serialized format. For SimpleSerializable components, this is a no-op.
        Parameters:
            x: Input to interface
            called_directly: if True, the component is part of an Interface/Blocks was called as a function, otherwise, it is being used via the GUI
        """
        return x

    def deserialize(self, x, save_dir=None, encryption_key=None):
        """
        Convert data from serialized format to human-readable format. For SimpleSerializable components, this is a no-op.
        """
        return x


class FileSerializable(Serializable):
    def deserialize(self, x, save_dir=None, encryption_key=None):
        """
        Convert from serialized representation of a file (base64) to a human-friendly version (string filepath)
        Optionally, save the file to the directory specified by save_dir
        """
        if isinstance(x, dict) and "data" in x:
            file = processing_utils.decode_base64_to_file(x["data"])
        else:
            file = processing_utils.decode_base64_to_file(x)
        return file.name


class JSONSerializable(Serializable):
    def serialize(self, x, save_dir=None, encryption_key=None):
        """
        Convert from serialized representation (json string) to a human-friendly version (string path to file)
        """
        return json.dumps(x)

    def deserialize(self, x, save_dir=None, encryption_key=None):
        """
        Convert from serialized representation (json string) to a human-friendly version (string path to file)
        """
        return json.loads(x)
