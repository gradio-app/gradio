from __future__ import annotations

import json
import os
import uuid
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, List, Tuple

from gradio_client import utils
from gradio_client.data_classes import FileData


class Serializable(ABC):
    @abstractmethod
    def input_api_info(self) -> Tuple[str, str]:
        """
        Get the type of input that should be provided via API, and a human-readable description of the input as a tuple (for documentation generation).
        """
        pass

    @abstractmethod
    def output_api_info(self) -> Tuple[str, str]:
        """
        Get the type of output that should be returned via API, and a human-readable description of the output as a tuple (for documentation generation).
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

    def input_api_info(self) -> Tuple[str, str]:
        return "Any", ""

    def output_api_info(self) -> Tuple[str, str]:
        return "Any", ""


class StringSerializable(Serializable):
    """Expects a string as input/output but performs no serialization."""

    def input_api_info(self) -> Tuple[str, str]:
        return "str", "value"

    def output_api_info(self) -> Tuple[str, str]:
        return "str", "value"


class ListStringSerializable(Serializable):
    """Expects a list of strings as input/output but performs no serialization."""

    def input_api_info(self) -> Tuple[str, str]:
        return "List[str]", "values"

    def output_api_info(self) -> Tuple[str, str]:
        return "List[str]", "values"


class BooleanSerializable(Serializable):
    """Expects a boolean as input/output but performs no serialization."""

    def input_api_info(self) -> Tuple[str, str]:
        return "bool", "value"

    def output_api_info(self) -> Tuple[str, str]:
        return "bool", "value"


class NumberSerializable(Serializable):
    """Expects a number (int/float) as input/output but performs no serialization."""

    def input_api_info(self) -> Tuple[str, str]:
        return "int | float", "value"

    def output_api_info(self) -> Tuple[str, str]:
        return "int | float", "value"


class ImgSerializable(Serializable):
    """Expects a base64 string as input/output which is ."""

    def input_api_info(self) -> Tuple[str, str]:
        return "str", "filepath or URL"

    def output_api_info(self) -> Tuple[str, str]:
        return "str", "filepath or URL"

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
    def input_api_info(self) -> Tuple[str, str]:
        return "str", "filepath or URL"

    def output_api_info(self) -> Tuple[str, str]:
        return "str", "filepath or URL"

    def _serialize_single(
        self, x: str | FileData | None, load_dir: str | Path = ""
    ) -> FileData | None:
        if x is None or isinstance(x, dict):
            return x
        if utils.is_valid_url(x):
            filename = x
            size = None
        else:
            filename = str(Path(load_dir) / x)
            size = Path(filename).stat().st_size
        return {
            "name": filename,
            "data": utils.encode_url_or_file_to_base64(filename),
            "orig_name": Path(filename).name,
            "is_file": False,
            "size": size,
        }

    def _deserialize_single(
        self,
        x: str | FileData | None,
        save_dir: str | None = None,
        root_url: str | None = None,
        hf_token: str | None = None,
    ) -> str | None:
        if x is None:
            return None
        if isinstance(x, str):
            file_name = utils.decode_base64_to_file(x, dir=save_dir).name
        elif isinstance(x, dict):
            if x.get("is_file", False):
                filepath = x.get("name")
                assert filepath is not None, f"The 'name' field is missing in {x}"
                if root_url is not None:
                    file_name = utils.download_tmp_copy_of_file(
                        root_url + "file=" + filepath,
                        hf_token=hf_token,
                        dir=save_dir,
                    ).name
                else:
                    file_name = utils.create_tmp_copy_of_file(
                        filepath, dir=save_dir
                    ).name
            else:
                file_name = utils.decode_base64_to_file(x["data"], dir=save_dir).name
        else:
            raise ValueError(
                f"A FileSerializable component can only deserialize a string or a dict, not a {type(x)}: {x}"
            )
        return file_name

    def serialize(
        self,
        x: str | FileData | None | List[str | FileData | None],
        load_dir: str | Path = "",
    ) -> FileData | None | List[FileData | None]:
        """
        Convert from human-friendly version of a file (string filepath) to a
        seralized representation (base64)
        Parameters:
            x: String path to file to serialize
            load_dir: Path to directory containing x
        """
        if x is None or x == "":
            return None
        if isinstance(x, list):
            return [self._serialize_single(f, load_dir=load_dir) for f in x]
        else:
            return self._serialize_single(x, load_dir=load_dir)

    def deserialize(
        self,
        x: str | FileData | None | List[str | FileData | None],
        save_dir: Path | str | None = None,
        root_url: str | None = None,
        hf_token: str | None = None,
    ) -> str | None | List[str | None]:
        """
        Convert from serialized representation of a file (base64) to a human-friendly
        version (string filepath). Optionally, save the file to the directory specified by `save_dir`
        Parameters:
            x: Base64 representation of file to deserialize into a string filepath
            save_dir: Path to directory to save the deserialized file to
            root_url: If this component is loaded from an external Space, this is the URL of the Space.
            hf_token: If this component is loaded from an external private Space, this is the access token for the Space
        """
        if x is None:
            return None
        if isinstance(save_dir, Path):
            save_dir = str(save_dir)
        if isinstance(x, list):
            return [
                self._deserialize_single(
                    f, save_dir=save_dir, root_url=root_url, hf_token=hf_token
                )
                for f in x
            ]
        else:
            return self._deserialize_single(
                x, save_dir=save_dir, root_url=root_url, hf_token=hf_token
            )


class VideoSerializable(FileSerializable):
    def input_api_info(self) -> Tuple[str, str]:
        return "str", "Filepath or URL to a video file"

    def output_api_info(self) -> Tuple[str, str]:
        return (
            "str | Tuple[str, str]",
            "Filepath or URL to a video file, or a tuple of (video file, subtitle file)",
        )

    def serialize(
        self, x: str | None, load_dir: str | Path = ""
    ) -> Tuple[FileData | None, None]:
        return (super().serialize(x, load_dir), None)  # type: ignore

    def deserialize(
        self,
        x: Tuple[FileData | None, FileData | None] | None,
        save_dir: Path | str | None = None,
        root_url: str | None = None,
        hf_token: str | None = None,
    ) -> str | Tuple[str | None, str | None] | None:
        """
        Convert from serialized representation of a file (base64) to a human-friendly
        version (string filepath). Optionally, save the file to the directory specified by `save_dir`
        """
        if isinstance(x, tuple):
            assert len(x) == 2, f"Expected tuple of length 2. Received: {x}"
            x_as_list = [x[0], x[1]]
        else:
            raise ValueError(f"Expected tuple of length 2. Received: {x}")
        deserialized_file = super().deserialize(x_as_list, save_dir, root_url, hf_token)
        if isinstance(deserialized_file, list):
            return deserialized_file[0]  # ignore subtitles


class JSONSerializable(Serializable):
    def input_api_info(self) -> Tuple[str, str]:
        return "str", "filepath to json file"

    def output_api_info(self) -> Tuple[str, str]:
        return "str", "filepath to json file"

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
    def input_api_info(self) -> Tuple[str, str]:
        return "str", "path to directory with images and captions.json"

    def output_api_info(self) -> Tuple[str, str]:
        return "str", "path to directory with images and captions.json"

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
SERIALIZER_MAPPING["Serializable"] = SimpleSerializable
SERIALIZER_MAPPING["File"] = FileSerializable
SERIALIZER_MAPPING["UploadButton"] = FileSerializable

COMPONENT_MAPPING: Dict[str, type] = {
    "textbox": StringSerializable,
    "number": NumberSerializable,
    "slider": NumberSerializable,
    "checkbox": BooleanSerializable,
    "checkboxgroup": ListStringSerializable,
    "radio": StringSerializable,
    "dropdown": SimpleSerializable,
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
