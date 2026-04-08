"""gr.UploadButton() component."""

from __future__ import annotations

import tempfile
import warnings
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

import gradio_client.utils as client_utils
from gradio_client import handle_file
from gradio_client.documentation import document

from gradio import processing_utils
from gradio.components.base import Component
from gradio.data_classes import FileData, ListFiles
from gradio.events import Events
from gradio.exceptions import Error
from gradio.i18n import I18nData
from gradio.utils import NamedString

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class UploadButton(Component):
    """
    Creates a button that opens the file picker when clicked, allowing users to upload a single file, multiple files, or an entire directory, optionally filtered by file type.

    Demos: upload_and_download, upload_button
    """

    EVENTS = [Events.click, Events.upload]

    def __init__(
        self,
        label: str = "Upload a File",
        value: str | I18nData | list[str] | Callable | None = None,
        *,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        visible: bool | Literal["hidden"] = True,
        size: Literal["sm", "md", "lg"] = "lg",
        icon: str | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        type: Literal["filepath", "binary"] = "filepath",
        file_count: Literal["single", "multiple", "directory"] = "single",
        file_types: list[str] | None = None,
    ):
        """
        Parameters:
            label: Text to display on the button. Defaults to "Upload a File".
            value: A default file path, URL, list of file paths/URLs, or a callable that returns one of those values.
            every: Continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            variant: Sets the button style. Use 'primary' for main call-to-action buttons, 'secondary' for a more subdued style, or 'stop' for a stop button.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM.
            size: Size of the button. Can be "sm", "md", or "lg".
            icon: URL or path to an icon file to display inside the button. If None, no icon is shown.
            scale: Relative size compared to adjacent components. For example, if components A and B are in a Row, and A has scale=2 while B has scale=1, A will be twice as wide as B. Scale applies in Rows, and to top-level components in Blocks where `fill_height=True`.
            min_width: Minimum pixel width. If a certain scale value results in this component being narrower than `min_width`, `min_width` will be respected first.
            interactive: If False, the UploadButton will be disabled.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: In a gr.render, components with the same key across re-renders are treated as the same component, not a new component. Properties set in `preserved_by_key` are not reset across a re-render.
            preserved_by_key: A list of constructor parameters that should be preserved when this component is re-rendered inside `gr.render()` with the same key.
            type: Type of value returned by the component. `"filepath"` returns a temporary file path, while `"binary"` returns the uploaded file contents as bytes.
            file_count: Controls how many files the user can upload. Use `"single"` for one file, `"multiple"` for several files, or `"directory"` to upload all files from a selected folder.
            file_types: Optional list of accepted file categories or extensions. For example, `"image"`, `"audio"`, `"video"`, `"text"`, or extensions such as `.pdf`.
        """
        valid_types = [
            "filepath",
            "binary",
        ]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
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
        if self.file_count in ["multiple", "directory"]:
            self.data_model = ListFiles
        else:
            self.data_model = FileData
        self.size = size
        self.file_types = file_types
        self.label = label
        self.variant = variant
        super().__init__(
            label=label,
            every=every,
            inputs=inputs,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            value=value,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
        )
        self.icon = self.serve_static_file(icon)

    def api_info(self) -> dict[str, list[str]]:
        if self.file_count == "single":
            return FileData.model_json_schema()
        else:
            return ListFiles.model_json_schema()

    def example_payload(self) -> Any:
        if self.file_count == "single":
            return handle_file(
                "https://github.com/gradio-app/gradio/raw/main/test/test_files/sample_file.pdf"
            )
        else:
            return [
                handle_file(
                    "https://github.com/gradio-app/gradio/raw/main/test/test_files/sample_file.pdf"
                )
            ]

    def example_value(self) -> Any:
        if self.file_count == "single":
            return "https://github.com/gradio-app/gradio/raw/main/test/test_files/sample_file.pdf"
        else:
            return [
                "https://github.com/gradio-app/gradio/raw/main/test/test_files/sample_file.pdf"
            ]

    def _process_single_file(self, f: FileData) -> bytes | NamedString:
        file_name = f.path
        if self.type == "filepath":
            if self.file_types and not client_utils.is_valid_file(
                file_name, self.file_types
            ):
                raise Error(
                    f"Invalid file type. Please upload a file that is one of these formats: {self.file_types}"
                )
            file = tempfile.NamedTemporaryFile(delete=False, dir=self.GRADIO_CACHE)
            file.name = file_name
            return NamedString(file_name)
        elif self.type == "binary":
            with open(file_name, "rb") as file_data:
                return file_data.read()
        else:
            raise ValueError(
                "Unknown type: "
                + str(type)
                + ". Please choose from: 'filepath', 'binary'."
            )

    def preprocess(
        self, payload: ListFiles | FileData | None
    ) -> bytes | str | list[bytes] | list[str] | None:
        """
        Parameters:
            payload: File information as a FileData object, or a list of FileData objects.
        Returns:
            Passes the file as a `str` or `bytes` object, or a list of `str` or list of `bytes` objects, depending on `type` and `file_count`.
        """
        if payload is None:
            return None
        if self.file_count == "single":
            if isinstance(payload, ListFiles):
                return self._process_single_file(payload[0])
            return self._process_single_file(payload)

        if isinstance(payload, ListFiles):
            return [self._process_single_file(f) for f in payload]  # type: ignore
        return [self._process_single_file(payload)]  # type: ignore

    def _download_files(self, value: str | list[str]) -> str | list[str]:
        downloaded_files = []
        if isinstance(value, list):
            for file in value:
                if client_utils.is_http_url_like(file):
                    downloaded_file = processing_utils.save_url_to_cache(
                        file, self.GRADIO_CACHE
                    )
                    downloaded_files.append(downloaded_file)
                else:
                    downloaded_files.append(file)
            return downloaded_files
        if client_utils.is_http_url_like(value):
            downloaded_file = processing_utils.save_url_to_cache(
                str(value), self.GRADIO_CACHE
            )
            return downloaded_file
        else:
            return value

    def postprocess(self, value: str | list[str] | None) -> ListFiles | FileData | None:
        """
        Parameters:
            value: Expects a `str` filepath or URL, or a `list[str]` of filepaths/URLs.
        Returns:
            File information as a FileData object, or a list of FileData objects.
        """
        if value is None:
            return None
        value = self._download_files(value)
        if isinstance(value, list):
            return ListFiles(
                root=[
                    FileData(
                        path=file,
                        orig_name=Path(file).name,
                        size=Path(file).stat().st_size,
                    )
                    for file in value
                ]
            )
        else:
            return FileData(
                path=value,
                orig_name=Path(value).name,
                size=Path(value).stat().st_size,
            )

    @property
    def skip_api(self):
        return False
