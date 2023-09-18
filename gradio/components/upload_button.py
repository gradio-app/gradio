"""gr.UploadButton() component."""

from __future__ import annotations

import tempfile
import warnings
from typing import Any, Callable, Literal

from gradio_client import utils as client_utils
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import FileSerializable

from gradio import utils
from gradio.components.base import Component, IOComponent, _Keywords
from gradio.deprecation import warn_deprecation, warn_style_method_deprecation
from gradio.events import Clickable, Uploadable

set_documentation_group("component")


@document()
class UploadButton(Clickable, Uploadable, IOComponent, FileSerializable):
    """
    Used to create an upload button, when clicked allows a user to upload files that satisfy the specified file type or generic files (if file_type not set).
    Preprocessing: passes the uploaded file as a {file-object} or {List[file-object]} depending on `file_count` (or a {bytes}/{List{bytes}} depending on `type`)
    Postprocessing: expects function to return a {str} path to a file, or {List[str]} consisting of paths to files.
    Examples-format: a {str} path to a local file that populates the component.
    Demos: upload_button
    """

    def __init__(
        self,
        label: str = "Upload a File",
        value: str | list[str] | Callable | None = None,
        *,
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        visible: bool = True,
        size: Literal["sm", "lg"] | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        type: Literal["file", "bytes"] = "file",
        file_count: Literal["single", "multiple", "directory"] = "single",
        file_types: list[str] | None = None,
        **kwargs,
    ):
        """
        Parameters:
            label: Text to display on the button. Defaults to "Upload a File".
            value: File or list of files to upload by default.
            variant: 'primary' for main call-to-action, 'secondary' for a more subdued style, 'stop' for a stop button.
            visible: If False, component will be hidden.
            size: Size of the button. Can be "sm" or "lg".
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: If False, the UploadButton will be in a disabled state.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            type: Type of value to be returned by component. "file" returns a temporary file object with the same base name as the uploaded file, whose full path can be retrieved by file_obj.name, "binary" returns an bytes object.
            file_count: if single, allows user to upload one file. If "multiple", user uploads multiple files. If "directory", user uploads all files in selected directory. Return type will be list for each file in case of "multiple" or "directory".
            file_types: List of type of files to be uploaded. "file" allows any file to be uploaded, "image" allows only image files to be uploaded, "audio" allows only audio files to be uploaded, "video" allows only video files to be uploaded, "text" allows only text files to be uploaded.
        """
        self.type = type
        self.file_count = file_count
        if file_count == "directory" and file_types is not None:
            warnings.warn(
                "The `file_types` parameter is ignored when `file_count` is 'directory'."
            )
        if file_types is not None and not isinstance(file_types, list):
            raise ValueError(
                f"Parameter file_types must be a list. Received {file_types.__class__.__name__}"
            )
        self.size = size
        self.file_types = file_types
        self.label = label
        self.variant = variant
        IOComponent.__init__(
            self,
            label=label,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            **kwargs,
        )

    def get_config(self):
        return {
            "label": self.label,
            "value": self.value,
            "size": self.size,
            "file_count": self.file_count,
            "file_types": self.file_types,
            "scale": self.scale,
            "min_width": self.min_width,
            "variant": self.variant,
            "interactive": self.interactive,
            **Component.get_config(self),
        }

    @staticmethod
    def update(
        value: str
        | list[str]
        | Literal[_Keywords.NO_VALUE]
        | None = _Keywords.NO_VALUE,
        label: str | None = None,
        size: Literal["sm", "lg"] | None = None,
        variant: Literal["primary", "secondary", "stop"] | None = None,
        interactive: bool | None = None,
        visible: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
    ):
        return {
            "variant": variant,
            "interactive": interactive,
            "size": size,
            "visible": visible,
            "value": value,
            "scale": scale,
            "min_width": min_width,
            "label": label,
            "__type__": "update",
        }

    def preprocess(
        self, x: list[dict[str, Any]] | None
    ) -> (
        bytes
        | tempfile._TemporaryFileWrapper
        | list[bytes | tempfile._TemporaryFileWrapper]
        | None
    ):
        """
        Parameters:
            x: List of JSON objects with filename as 'name' property and base64 data as 'data' property
        Returns:
            File objects in requested format
        """
        if x is None:
            return None

        def process_single_file(f) -> bytes | tempfile._TemporaryFileWrapper:
            file_name, data, is_file = (
                f["name"],
                f["data"],
                f.get("is_file", False),
            )
            if self.type == "file":
                if is_file:
                    path = self.make_temp_copy_if_needed(file_name)
                else:
                    data, _ = client_utils.decode_base64_to_binary(data)
                    path = self.file_bytes_to_file(data, file_name=file_name)
                    path = str(utils.abspath(path))
                    self.temp_files.add(path)
                file = tempfile.NamedTemporaryFile(
                    delete=False, dir=self.DEFAULT_TEMP_DIR
                )
                file.name = path
                file.orig_name = file_name  # type: ignore
                return file
            elif self.type == "bytes":
                if is_file:
                    with open(file_name, "rb") as file_data:
                        return file_data.read()
                return client_utils.decode_base64_to_binary(data)[0]
            else:
                raise ValueError(
                    "Unknown type: "
                    + str(self.type)
                    + ". Please choose from: 'file', 'bytes'."
                )

        if self.file_count == "single":
            if isinstance(x, list):
                return process_single_file(x[0])
            else:
                return process_single_file(x)
        else:
            if isinstance(x, list):
                return [process_single_file(f) for f in x]
            else:
                return process_single_file(x)

    def style(
        self,
        *,
        full_width: bool | None = None,
        size: Literal["sm", "lg"] | None = None,
        **kwargs,
    ):
        """
        This method is deprecated. Please set these arguments in the constructor instead.
        """
        warn_style_method_deprecation()
        if full_width is not None:
            warn_deprecation(
                "Use `scale` in place of full_width in the constructor. "
                "scale=1 will make the button expand, whereas 0 will not."
            )
            self.scale = 1 if full_width else None
        if size is not None:
            self.size = size
        return self
