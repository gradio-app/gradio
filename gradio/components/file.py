"""gr.File() component"""

from __future__ import annotations

import tempfile
import warnings
from pathlib import Path
from typing import Any, Callable, Literal

from gradio_client import utils as client_utils
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import FileSerializable

from gradio import utils
from gradio.components.base import IOComponent, _Keywords
from gradio.deprecation import warn_deprecation
from gradio.events import (
    Changeable,
    Clearable,
    EventListenerMethod,
    Selectable,
    Uploadable,
)

set_documentation_group("component")


@document()
class File(
    Changeable,
    Selectable,
    Clearable,
    Uploadable,
    IOComponent,
    FileSerializable,
):
    """
    Creates a file component that allows uploading generic file (when used as an input) and or displaying generic files (output).
    Preprocessing: passes the uploaded file as a {tempfile._TemporaryFileWrapper} or {List[tempfile._TemporaryFileWrapper]} depending on `file_count` (or a {bytes}/{List{bytes}} depending on `type`)
    Postprocessing: expects function to return a {str} path to a file, or {List[str]} consisting of paths to files.
    Examples-format: a {str} path to a local file that populates the component.
    Demos: zip_to_json, zip_files
    """

    def __init__(
        self,
        value: str | list[str] | Callable | None = None,
        *,
        file_count: Literal["single", "multiple", "directory"] = "single",
        file_types: list[str] | None = None,
        type: Literal["file", "binary"] = "file",
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        height: int | float | None = None,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default file to display, given as str file path. If callable, the function will be called whenever the app loads to set the initial value of the component.
            file_count: if single, allows user to upload one file. If "multiple", user uploads multiple files. If "directory", user uploads all files in selected directory. Return type will be list for each file in case of "multiple" or "directory".
            file_types: List of file extensions or types of files to be uploaded (e.g. ['image', '.json', '.mp4']). "file" allows any file to be uploaded, "image" allows only image files to be uploaded, "audio" allows only audio files to be uploaded, "video" allows only video files to be uploaded, "text" allows only text files to be uploaded.
            type: Type of value to be returned by component. "file" returns a temporary file object with the same base name as the uploaded file, whose full path can be retrieved by file_obj.name, "binary" returns an bytes object.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            height: The maximum height of the file component, in pixels. If more files are uploaded than can fit in the height, a scrollbar will appear.
            interactive: if True, will allow users to upload a file; if False, can only be used to display files. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.file_count = file_count
        self.file_types = file_types
        if file_types is not None and not isinstance(file_types, list):
            raise ValueError(
                f"Parameter file_types must be a list. Received {file_types.__class__.__name__}"
            )
        valid_types = [
            "file",
            "binary",
            "bytes",
        ]  # "bytes" is included for backwards compatibility
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        if type == "bytes":
            warn_deprecation(
                "The `bytes` type is deprecated and may not work as expected. Please use `binary` instead."
            )
        if file_count == "directory" and file_types is not None:
            warnings.warn(
                "The `file_types` parameter is ignored when `file_count` is 'directory'."
            )
        self.type = type
        self.height = height
        self.select: EventListenerMethod
        """
        Event listener for when the user selects file from list.
        Uses event data gradio.SelectData to carry `value` referring to name of selected file, and `index` to refer to index.
        See EventData documentation on how to use this event data.
        """
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "file_count": self.file_count,
            "file_types": self.file_types,
            "value": self.value,
            "selectable": self.selectable,
            "height": self.height,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Any | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        height: int | float | None = None,
        interactive: bool | None = None,
        visible: bool | None = None,
    ):
        return {
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "height": height,
            "interactive": interactive,
            "visible": visible,
            "value": value,
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

                # Creation of tempfiles here
                file = tempfile.NamedTemporaryFile(
                    delete=False, dir=self.DEFAULT_TEMP_DIR
                )
                file.name = path
                file.orig_name = file_name  # type: ignore
                return file
            elif (
                self.type == "binary" or self.type == "bytes"
            ):  # "bytes" is included for backwards compatibility
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

    def postprocess(
        self, y: str | list[str] | None
    ) -> dict[str, Any] | list[dict[str, Any]] | None:
        """
        Parameters:
            y: file path
        Returns:
            JSON object with key 'name' for filename, 'data' for base64 url, and 'size' for filesize in bytes
        """
        if y is None:
            return None
        if isinstance(y, list):
            return [
                {
                    "orig_name": Path(file).name,
                    "name": self.make_temp_copy_if_needed(file),
                    "size": Path(file).stat().st_size,
                    "data": None,
                    "is_file": True,
                }
                for file in y
            ]
        else:
            d = {
                "orig_name": Path(y).name,
                "name": self.make_temp_copy_if_needed(y),
                "size": Path(y).stat().st_size,
                "data": None,
                "is_file": True,
            }
            return d

    def as_example(self, input_data: str | list | None) -> str:
        if input_data is None:
            return ""
        elif isinstance(input_data, list):
            return ", ".join([Path(file).name for file in input_data])
        else:
            return Path(input_data).name

    def api_info(self) -> dict[str, dict | bool]:
        if self.file_count == "single":
            return self._single_file_api_info()
        else:
            return self._multiple_file_api_info()

    def serialized_info(self):
        if self.file_count == "single":
            return self._single_file_serialized_info()
        else:
            return self._multiple_file_serialized_info()

    def example_inputs(self) -> dict[str, Any]:
        if self.file_count == "single":
            return self._single_file_example_inputs()
        else:
            return self._multiple_file_example_inputs()
