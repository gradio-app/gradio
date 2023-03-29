from __future__ import annotations

import json
import os
import uuid
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, List

from gradio_client import utils


class Serializable(ABC):
    @abstractmethod
    def get_input_type() -> str:
        """
        Get the type of input this component accepts (for documentation generation).
        """
        pass

    @abstractmethod
    def get_output_type() -> str:
        """
        Get the type of input this component accepts (for documentation generation).
        """
        pass

    def serialize(self, x: Any, load_dir: str | Path = ""):
        """
        Convert data from human-readable format to serialized format for a browser.
        """
        return x

    def deserialize(
        self,
        x: Any,
        save_dir: str | Path | None = None,
        root_url: str | None = None,
        hf_token: str | None = None,
    ):
        """
        Convert data from serialized format for a browser to human-readable format.
        """
        return x


class SimpleSerializable(Serializable):
    """General class that does not perform any serialization or deserialization."""

    def get_input_type(self) -> str:
        return "Any"

    def get_output_type(self) -> str:
        return "Any"


class StringSerializable(Serializable):
    """Expects a string as input/output but performs no serialization."""

    def get_input_type(self) -> str:
        return "str (value)"

    def get_output_type(self) -> str:
        return "str (value)"


class ListStringSerializable(Serializable):
    """Expects a list of strings as input/output but performs no serialization."""

    def get_input_type(self) -> str:
        return "List[str] (values)"

    def get_output_type(self) -> str:
        return "List[str] (values)"


class DropdownSerializable(Serializable):
    """Expects a string or list of strings as input/output but performs no serialization."""

    def get_input_type(self) -> str:
        return "str | List[str] (value[s])"

    def get_output_type(self) -> str:
        return "str | List[str] (value[s])"


class BooleanSerializable(Serializable):
    """Expects a boolean as input/output but performs no serialization."""

    def get_input_type(self) -> str:
        return "bool (value)"

    def get_output_type(self) -> str:
        return "bool (value)"


class NumberSerializable(Serializable):
    """Expects a number (int/float) as input/output but performs no serialization."""

    def get_input_type(self) -> str:
        return "int | float (value)"

    def get_output_type(self) -> str:
        return "int | float (value)"


class ImgSerializable(Serializable):
    """Expects a base64 string as input/output which is ."""

    def get_input_type(self) -> str:
        return "str (filepath or URL)"

    def get_output_type(self) -> str:
        return "str (filepath or URL)"

    def serialize(
        self,
        x: str | None,
        load_dir: str | Path = "",
    ) -> str | None:
        """
        Convert from human-friendly version of a file (string filepath) to a seralized
        representation (base64).
        Parameters:
            x: String path to file to serialize
            load_dir: Path to directory containing x
        """
        if x is None or x == "":
            return None
        is_url = utils.is_valid_url(x)
        path = x if is_url else Path(load_dir) / x
        return utils.encode_url_or_file_to_base64(path)

    def deserialize(
        self,
        x: str | None,
        save_dir: str | Path | None = None,
        root_url: str | None = None,
        hf_token: str | None = None,
    ) -> str | None:
        """
        Convert from serialized representation of a file (base64) to a human-friendly
        version (string filepath). Optionally, save the file to the directory specified by save_dir
        Parameters:
            x: Base64 representation of image to deserialize into a string filepath
            save_dir: Path to directory to save the deserialized image to
            root_url: Ignored
            hf_token: Ignored
        """
        if x is None or x == "":
            return None
        file = utils.decode_base64_to_file(x, dir=save_dir)
        return file.name


class FileSerializable(Serializable):
    def get_input_type(self) -> str:
        return "str (filepath or URL)"

    def get_output_type(self) -> str:
        return "str (filepath or URL)"

    def serialize(
        self,
        x: str | None,
        load_dir: str | Path = "",
    ) -> Dict | None:
        """
        Convert from human-friendly version of a file (string filepath) to a
        seralized representation (base64)
        Parameters:
            x: String path to file to serialize
            load_dir: Path to directory containing x
        """
        if x is None or x == "":
            return None
        filename = str(Path(load_dir) / x)
        return {
            "name": filename,
            "data": utils.encode_url_or_file_to_base64(filename),
            "orig_name": Path(filename).name,
            "is_file": False,
        }

    def deserialize(
        self,
        x: str | Dict | None,
        save_dir: Path | str | None = None,
        root_url: str | None = None,
        hf_token: str | None = None,
    ) -> str | None:
        """
        Convert from serialized representation of a file (base64) to a human-friendly
        version (string filepath). Optionally, save the file to the directory specified by `save_dir`
        Parameters:
            x: Base64 representation of file to deserialize into a string filepath
            save_dir: Path to directory to save the deserialized file to
            root_url: If this component is loaded from an external Space, this is the URL of the Space
            hf_token: If this component is loaded from an external private Space, this is the access token for the Space
        """
        if x is None:
            return None
        if isinstance(save_dir, Path):
            save_dir = str(save_dir)
        if isinstance(x, str):
            file_name = utils.decode_base64_to_file(x, dir=save_dir).name
        elif isinstance(x, dict):
            if x.get("is_file", False):
                if root_url is not None:
                    file_name = utils.download_tmp_copy_of_file(
                        root_url + "file=" + x["name"],
                        hf_token=hf_token,
                        dir=save_dir,
                    ).name
                else:
                    file_name = utils.create_tmp_copy_of_file(
                        x["name"], dir=save_dir
                    ).name
            else:
                file_name = utils.decode_base64_to_file(x["data"], dir=save_dir).name
        else:
            raise ValueError(
                f"A FileSerializable component can only deserialize a string or a dict, not a: {type(x)}"
            )
        return file_name


class JSONSerializable(Serializable):
    def get_input_type(self) -> str:
        return "str (filepath)"

    def get_output_type(self) -> str:
        return "str (filepath)"

    def serialize(
        self,
        x: str | None,
        load_dir: str | Path = "",
    ) -> Dict | None:
        """
        Convert from a a human-friendly version (string path to json file) to a
        serialized representation (json string)
        Parameters:
            x: String path to json file to read to get json string
            load_dir: Path to directory containing x
        """
        if x is None or x == "":
            return None
        return utils.file_to_json(Path(load_dir) / x)

    def deserialize(
        self,
        x: str | Dict,
        save_dir: str | Path | None = None,
        root_url: str | None = None,
        hf_token: str | None = None,
    ) -> str | None:
        """
        Convert from serialized representation (json string) to a human-friendly
        version (string path to json file).  Optionally, save the file to the directory specified by `save_dir`
        Parameters:
            x: Json string
            save_dir: Path to save the deserialized json file to
            root_url: Ignored
            hf_token: Ignored
        """
        if x is None:
            return None
        return utils.dict_or_str_to_json_file(x, dir=save_dir).name


class GallerySerializable(Serializable):
    def get_input_type(self) -> str:
        return "str (directory path)"

    def get_output_type(self) -> str:
        return "str (directory path)"

    def serialize(
        self, x: str | None, load_dir: str | Path = ""
    ) -> List[List[str]] | None:
        if x is None or x == "":
            return None
        files = []
        captions_file = Path(x) / "captions.json"
        with captions_file.open("r") as captions_json:
            captions = json.load(captions_json)
        for file_name, caption in captions.items():
            img = FileSerializable().serialize(file_name)
            files.append([img, caption])
        return files

    def deserialize(
        self,
        x: Any,
        save_dir: str = "",
        root_url: str | None = None,
        hf_token: str | None = None,
    ) -> None | str:
        if x is None:
            return None
        gallery_path = Path(save_dir) / str(uuid.uuid4())
        gallery_path.mkdir(exist_ok=True, parents=True)
        captions = {}
        for img_data in x:
            if isinstance(img_data, list) or isinstance(img_data, tuple):
                img_data, caption = img_data
            else:
                caption = None
            name = FileSerializable().deserialize(
                img_data, gallery_path, root_url=root_url, hf_token=hf_token
            )
            captions[name] = caption
            captions_file = gallery_path / "captions.json"
            with captions_file.open("w") as captions_json:
                json.dump(captions, captions_json)
        return os.path.abspath(gallery_path)


SERIALIZER_MAPPING = {cls.__name__: cls for cls in Serializable.__subclasses__()}

COMPONENT_MAPPING = {
    "textbox": StringSerializable,
    "number": NumberSerializable,
    "slider": NumberSerializable,
    "checkbox": BooleanSerializable,
    "checkboxgroup": ListStringSerializable,
    "radio": BooleanSerializable,
    "dropdown": DropdownSerializable,
    "image": ImgSerializable,
    "video": FileSerializable,
    "audio": FileSerializable,
    "file": FileSerializable,
    "dataframe": JSONSerializable,
    "timeseries": JSONSerializable,
    "state": SimpleSerializable,
    "button": StringSerializable,
    "uploadbutton": FileSerializable,
    "colorpicker": StringSerializable,
    "label": JSONSerializable,
    "highlightedtext": JSONSerializable,
    "json": JSONSerializable,
    "html": StringSerializable,
    "gallery": GallerySerializable,
    "chatbot": JSONSerializable,
    "model3d": FileSerializable,
    "plot": JSONSerializable,
    "markdown": StringSerializable,
    "dataset": StringSerializable,
    "code": StringSerializable,
}
