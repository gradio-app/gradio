from __future__ import annotations

from abc import ABC, abstractmethod
import os
from pathlib import Path
import json
from typing import Any, Dict, List
import uuid

from gradio_client import utils


class Serializable(ABC):
    @abstractmethod
    def serialize(self):
        """
        Convert data from human-readable format to serialized format for a browser.
        """
        pass

    @abstractmethod
    def deserialize(self):
        """
        Convert data from serialized format for a browser to human-readable format.
        """
        pass


class SimpleSerializable(Serializable):
    def serialize(self, x: Any, load_dir: str | Path = "") -> Any:
        """
        Convert data from human-readable format to serialized format. For SimpleSerializable components, this is a no-op.
        Parameters:
            x: Input data to serialize
            load_dir: Ignored
        """
        return x

    def deserialize(
        self,
        x: Any,
        save_dir: str | Path | None = None,
        root_url: str | None = None,
        access_token: str | None = None,
    ):
        """
        Convert data from serialized format to human-readable format. For SimpleSerializable components, this is a no-op.
        Parameters:
            x: Input data to deserialize
            save_dir: Ignored
            root_url: Ignored
            access_token: Ignored
        """
        return x


class ImgSerializable(Serializable):
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
        access_token: str | None = None,
    ) -> str | None:
        """
        Convert from serialized representation of a file (base64) to a human-friendly
        version (string filepath). Optionally, save the file to the directory specified by save_dir
        Parameters:
            x: Base64 representation of image to deserialize into a string filepath
            save_dir: Path to directory to save the deserialized image to
            root_url: Ignored
            access_token: Ignored
        """
        if x is None or x == "":
            return None
        file = utils.decode_base64_to_file(x, dir=save_dir)
        return file.name


class FileSerializable(Serializable):
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
        access_token: str | None = None,
    ) -> str | None:
        """
        Convert from serialized representation of a file (base64) to a human-friendly
        version (string filepath). Optionally, save the file to the directory specified by `save_dir`
        Parameters:
            x: Base64 representation of file to deserialize into a string filepath
            save_dir: Path to directory to save the deserialized file to
            root_url: If this component is loaded from an external Space, this is the URL of the Space
            access_token: If this component is loaded from an external private Space, this is the access token for the Space
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
                        access_token=access_token,
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
                f"A FileSerializable component cannot only deserialize a string or a dict, not a: {type(x)}"
            )
        return file_name


class JSONSerializable(Serializable):
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
        access_token: str | None = None,
    ) -> str | None:
        """
        Convert from serialized representation (json string) to a human-friendly
        version (string path to json file).  Optionally, save the file to the directory specified by `save_dir`
        Parameters:
            x: Json string
            save_dir: Path to save the deserialized json file to
            root_url: Ignored
            access_token: Ignored
        """
        if x is None:
            return None
        return utils.dict_or_str_to_json_file(x, dir=save_dir).name


class GallerySerializable(Serializable):
    def serialize(
        self, 
        x: str | None,
        load_dir: str | Path = ""
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
        access_token: str | None = None,
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
                img_data, gallery_path, root_url=root_url, access_token=access_token
            )
            captions[name] = caption
            captions_file = gallery_path / "captions.json"
            with captions_file.open("w") as captions_json:
                json.dump(captions, captions_json)
        return os.path.abspath(gallery_path)


SERIALIZER_MAPPING = {cls.__name__: cls for cls in Serializable.__subclasses__()}

COMPONENT_MAPPING = {
    "textbox": SimpleSerializable,
    "number": SimpleSerializable,
    "slider": SimpleSerializable,
    "checkbox": SimpleSerializable,
    "checkboxgroup": SimpleSerializable,
    "radio": SimpleSerializable,
    "dropdown": SimpleSerializable,
    "image": ImgSerializable,
    "video": FileSerializable,
    "audio": FileSerializable,
    "file": FileSerializable,
    "dataframe": JSONSerializable,
    "timeseries": JSONSerializable,
    "state": SimpleSerializable,
    "button": SimpleSerializable,
    "uploadbutton": FileSerializable,
    "colorpicker": SimpleSerializable,
    "label": JSONSerializable,
    "highlightedtext": JSONSerializable,
    "json": JSONSerializable,
    "html": SimpleSerializable,
    "gallery": GallerySerializable,  # TODO: Make this a proper Serializable class
    "chatbot": JSONSerializable,
    "model3d": FileSerializable,
    "plot": JSONSerializable,
    "markdown": SimpleSerializable,
    "dataset": SimpleSerializable,
    "code": SimpleSerializable,
}
