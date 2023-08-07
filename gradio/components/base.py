"""Contains all of the components that can be used with Gradio Interface / Blocks.
Along with the docs for each component, you can find the names of example demos that use
each component. These demos are located in the `demo` directory."""

from __future__ import annotations

import hashlib
import os
import secrets
import shutil
import tempfile
import urllib.request
from enum import Enum
from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable

import aiofiles
import numpy as np
import requests
from fastapi import UploadFile
from gradio_client import utils as client_utils
from gradio_client.documentation import set_documentation_group
from gradio_client.serializing import (
    Serializable,
)
from PIL import Image as _Image  # using _ to minimize namespace pollution

from gradio import processing_utils, utils
from gradio.blocks import Block, BlockContext
from gradio.deprecation import warn_deprecation, warn_style_method_deprecation
from gradio.events import (
    EventListener,
)
from gradio.layouts import Column, Form, Row

if TYPE_CHECKING:
    from typing import TypedDict

    class DataframeData(TypedDict):
        headers: list[str]
        data: list[list[str | int | bool]]


set_documentation_group("component")
_Image.init()  # fixes https://github.com/gradio-app/gradio/issues/2843


class _Keywords(Enum):
    NO_VALUE = "NO_VALUE"  # Used as a sentinel to determine if nothing is provided as a argument for `value` in `Component.update()`
    FINISHED_ITERATING = "FINISHED_ITERATING"  # Used to skip processing of a component's value (needed for generators + state)


class Component(Block, Serializable):
    """
    A base class for defining the methods that all gradio components should have.
    """

    def __init__(self, *args, **kwargs):
        Block.__init__(self, *args, **kwargs)
        EventListener.__init__(self)

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return f"{self.get_block_name()}"

    def get_config(self):
        """
        :return: a dictionary with context variables for the javascript file associated with the context
        """
        return {
            "name": self.get_block_name(),
            "custom_component": not self.__module__.startswith("gradio.components"),
            **super().get_config(),
        }

    def preprocess(self, x: Any) -> Any:
        """
        Any preprocessing needed to be performed on function input.
        """
        return x

    def postprocess(self, y):
        """
        Any postprocessing needed to be performed on function output.
        """
        return y

    def style(self, *args, **kwargs):
        """
        This method is deprecated. Please set these arguments in the Components constructor instead.
        """
        warn_style_method_deprecation()
        put_deprecated_params_in_box = False
        if "rounded" in kwargs:
            warn_deprecation(
                "'rounded' styling is no longer supported. To round adjacent components together, place them in a Column(variant='box')."
            )
            if isinstance(kwargs["rounded"], (list, tuple)):
                put_deprecated_params_in_box = True
            kwargs.pop("rounded")
        if "margin" in kwargs:
            warn_deprecation(
                "'margin' styling is no longer supported. To place adjacent components together without margin, place them in a Column(variant='box')."
            )
            if isinstance(kwargs["margin"], (list, tuple)):
                put_deprecated_params_in_box = True
            kwargs.pop("margin")
        if "border" in kwargs:
            warn_deprecation(
                "'border' styling is no longer supported. To place adjacent components in a shared border, place them in a Column(variant='box')."
            )
            kwargs.pop("border")
        for key in kwargs:
            warn_deprecation(f"Unknown style parameter: {key}")
        if (
            put_deprecated_params_in_box
            and isinstance(self.parent, (Row, Column))
            and self.parent.variant == "default"
        ):
            self.parent.variant = "compact"
        return self


class IOComponent(Component):
    """
    A base class for defining methods that all input/output components should have.
    """

    def __init__(
        self,
        *,
        value: Any = None,
        label: str | None = None,
        info: str | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int | None = None,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        load_fn: Callable | None = None,
        every: float | None = None,
        **kwargs,
    ):
        self.temp_files: set[str] = set()
        self.DEFAULT_TEMP_DIR = os.environ.get("GRADIO_TEMP_DIR") or str(
            Path(tempfile.gettempdir()) / "gradio"
        )

        Component.__init__(
            self, elem_id=elem_id, elem_classes=elem_classes, visible=visible, **kwargs
        )

        self.label = label
        self.info = info
        if not container:
            if show_label:
                warn_deprecation("show_label has no effect when container is False.")
            show_label = False
        if show_label is None:
            show_label = True
        self.show_label = show_label
        self.container = container
        if scale is not None and scale != round(scale):
            warn_deprecation(
                f"'scale' value should be an integer. Using {scale} will cause issues."
            )
        self.scale = scale
        self.min_width = min_width
        self.interactive = interactive

        # load_event is set in the Blocks.attach_load_events method
        self.load_event: None | dict[str, Any] = None
        self.load_event_to_attach = None
        load_fn, initial_value = self.get_load_fn_and_initial_value(value)
        self.value = (
            initial_value
            if self._skip_init_processing
            else self.postprocess(initial_value)
        )
        if callable(load_fn):
            self.attach_load_event(load_fn, every)

    @staticmethod
    def hash_file(file_path: str | Path, chunk_num_blocks: int = 128) -> str:
        sha1 = hashlib.sha1()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(chunk_num_blocks * sha1.block_size), b""):
                sha1.update(chunk)
        return sha1.hexdigest()

    @staticmethod
    def hash_url(url: str, chunk_num_blocks: int = 128) -> str:
        sha1 = hashlib.sha1()
        remote = urllib.request.urlopen(url)
        max_file_size = 100 * 1024 * 1024  # 100MB
        total_read = 0
        while True:
            data = remote.read(chunk_num_blocks * sha1.block_size)
            total_read += chunk_num_blocks * sha1.block_size
            if not data or total_read > max_file_size:
                break
            sha1.update(data)
        return sha1.hexdigest()

    @staticmethod
    def hash_bytes(bytes: bytes):
        sha1 = hashlib.sha1()
        sha1.update(bytes)
        return sha1.hexdigest()

    @staticmethod
    def hash_base64(base64_encoding: str, chunk_num_blocks: int = 128) -> str:
        sha1 = hashlib.sha1()
        for i in range(0, len(base64_encoding), chunk_num_blocks * sha1.block_size):
            data = base64_encoding[i : i + chunk_num_blocks * sha1.block_size]
            sha1.update(data.encode("utf-8"))
        return sha1.hexdigest()

    def make_temp_copy_if_needed(self, file_path: str | Path) -> str:
        """Returns a temporary file path for a copy of the given file path if it does
        not already exist. Otherwise returns the path to the existing temp file."""
        temp_dir = self.hash_file(file_path)
        temp_dir = Path(self.DEFAULT_TEMP_DIR) / temp_dir
        temp_dir.mkdir(exist_ok=True, parents=True)

        name = client_utils.strip_invalid_filename_characters(Path(file_path).name)
        full_temp_file_path = str(utils.abspath(temp_dir / name))

        if not Path(full_temp_file_path).exists():
            shutil.copy2(file_path, full_temp_file_path)

        self.temp_files.add(full_temp_file_path)
        return full_temp_file_path

    async def save_uploaded_file(self, file: UploadFile, upload_dir: str) -> str:
        temp_dir = secrets.token_hex(
            20
        )  # Since the full file is being uploaded anyways, there is no benefit to hashing the file.
        temp_dir = Path(upload_dir) / temp_dir
        temp_dir.mkdir(exist_ok=True, parents=True)

        if file.filename:
            file_name = Path(file.filename).name
            name = client_utils.strip_invalid_filename_characters(file_name)
        else:
            name = f"tmp{secrets.token_hex(5)}"

        full_temp_file_path = str(utils.abspath(temp_dir / name))

        async with aiofiles.open(full_temp_file_path, "wb") as output_file:
            while True:
                content = await file.read(100 * 1024 * 1024)
                if not content:
                    break
                await output_file.write(content)

        return full_temp_file_path

    def download_temp_copy_if_needed(self, url: str) -> str:
        """Downloads a file and makes a temporary file path for a copy if does not already
        exist. Otherwise returns the path to the existing temp file."""
        temp_dir = self.hash_url(url)
        temp_dir = Path(self.DEFAULT_TEMP_DIR) / temp_dir
        temp_dir.mkdir(exist_ok=True, parents=True)

        name = client_utils.strip_invalid_filename_characters(Path(url).name)
        full_temp_file_path = str(utils.abspath(temp_dir / name))

        if not Path(full_temp_file_path).exists():
            with requests.get(url, stream=True) as r, open(
                full_temp_file_path, "wb"
            ) as f:
                shutil.copyfileobj(r.raw, f)

        self.temp_files.add(full_temp_file_path)
        return full_temp_file_path

    def base64_to_temp_file_if_needed(
        self, base64_encoding: str, file_name: str | None = None
    ) -> str:
        """Converts a base64 encoding to a file and returns the path to the file if
        the file doesn't already exist. Otherwise returns the path to the existing file.
        """
        temp_dir = self.hash_base64(base64_encoding)
        temp_dir = Path(self.DEFAULT_TEMP_DIR) / temp_dir
        temp_dir.mkdir(exist_ok=True, parents=True)

        guess_extension = client_utils.get_extension(base64_encoding)
        if file_name:
            file_name = client_utils.strip_invalid_filename_characters(file_name)
        elif guess_extension:
            file_name = f"file.{guess_extension}"
        else:
            file_name = "file"

        full_temp_file_path = str(utils.abspath(temp_dir / file_name))  # type: ignore

        if not Path(full_temp_file_path).exists():
            data, _ = client_utils.decode_base64_to_binary(base64_encoding)
            with open(full_temp_file_path, "wb") as fb:
                fb.write(data)

        self.temp_files.add(full_temp_file_path)
        return full_temp_file_path

    def pil_to_temp_file(self, img: _Image.Image, dir: str, format="png") -> str:
        bytes_data = processing_utils.encode_pil_to_bytes(img, format)
        temp_dir = Path(dir) / self.hash_bytes(bytes_data)
        temp_dir.mkdir(exist_ok=True, parents=True)
        filename = str(temp_dir / f"image.{format}")
        img.save(filename, pnginfo=processing_utils.get_pil_metadata(img))
        return filename

    def img_array_to_temp_file(self, arr: np.ndarray, dir: str) -> str:
        pil_image = _Image.fromarray(
            processing_utils._convert(arr, np.uint8, force_copy=False)
        )
        return self.pil_to_temp_file(pil_image, dir, format="png")

    def audio_to_temp_file(
        self, data: np.ndarray, sample_rate: int, dir: str, format: str
    ):
        temp_dir = Path(dir) / self.hash_bytes(data.tobytes())
        temp_dir.mkdir(exist_ok=True, parents=True)
        filename = str(temp_dir / f"audio.{format}")
        processing_utils.audio_to_file(sample_rate, data, filename, format=format)
        return filename

    def file_bytes_to_file(self, data: bytes, dir: str, file_name: str):
        path = Path(dir) / self.hash_bytes(data)
        path.mkdir(exist_ok=True, parents=True)
        path = path / Path(file_name).name
        path.write_bytes(data)
        return path

    def get_config(self):
        config = {
            "label": self.label,
            "show_label": self.show_label,
            "container": self.container,
            "scale": self.scale,
            "min_width": self.min_width,
            "interactive": self.interactive,
            **super().get_config(),
        }
        if self.info:
            config["info"] = self.info
        return config

    @staticmethod
    def get_load_fn_and_initial_value(value):
        if callable(value):
            initial_value = value()
            load_fn = value
        else:
            initial_value = value
            load_fn = None
        return load_fn, initial_value

    def attach_load_event(self, callable: Callable, every: float | None):
        """Add a load event that runs `callable`, optionally every `every` seconds."""
        self.load_event_to_attach = (callable, every)

    def as_example(self, input_data):
        """Return the input data in a way that can be displayed by the examples dataset component in the front-end."""
        return input_data


class FormComponent:
    def get_expected_parent(self) -> type[Form] | None:
        if getattr(self, "container", None) is False:
            return None
        return Form


def component(cls_name: str) -> Component:
    obj = utils.component_or_layout_class(cls_name)()
    if isinstance(obj, BlockContext):
        raise ValueError(f"Invalid component: {obj.__class__}")
    return obj


def get_component_instance(comp: str | dict | Component, render=True) -> Component:
    if isinstance(comp, str):
        component_obj = component(comp)
        if not (render):
            component_obj.unrender()
        return component_obj
    elif isinstance(comp, dict):
        name = comp.pop("name")
        component_cls = utils.component_or_layout_class(name)
        component_obj = component_cls(**comp)
        if isinstance(component_obj, BlockContext):
            raise ValueError(f"Invalid component: {name}")
        if not (render):
            component_obj.unrender()
        return component_obj
    elif isinstance(comp, Component):
        return comp
    else:
        raise ValueError(
            f"Component must provided as a `str` or `dict` or `Component` but is {comp}"
        )
