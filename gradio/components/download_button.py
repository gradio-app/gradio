"""gr.UploadButton() component."""

from __future__ import annotations

import tempfile
import warnings
from pathlib import Path
from typing import Any, Callable, Literal, Union

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.data_classes import FileData, ListFiles
from gradio.events import Events
from gradio.utils import NamedString


@document()
class DownloadButton(Component):
    """
    Creates a button, that when clicked, allows a user to download a single file of arbitrary type.

    Demos: upload_and_download
    """

    EVENTS = [Events.click]

    def __init__(
        self,
        label: str = "Download",
        value: str | list[str] | Callable | None = None,
        *,
        every: float | None = None,
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        visible: bool = True,
        size: Literal["sm", "lg"] | None = None,
        icon: str | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
    ):
        """
        Parameters:
            label: Text to display on the button. Defaults to "Upload a File".
            value: File or list of files to upload by default.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            variant: 'primary' for main call-to-action, 'secondary' for a more subdued style, 'stop' for a stop button.
            visible: If False, component will be hidden.
            size: Size of the button. Can be "sm" or "lg".
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: If False, the UploadButton will be in a disabled state.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
        """
        self.data_model = FileData
        self.size = size
        self.label = label
        self.variant = variant
        super().__init__(
            label=label,
            every=every,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            value=value,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
        )
        self.icon = self.move_resource_to_block_cache(icon)

    def _process_single_file(self, f: FileData) -> bytes | NamedString:
        file_name = f.path
        if self.type == "filepath":
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

    def preprocess(self, payload: FileData | None) -> str | None:
        """
        Parameters:
            payload: File information as a FileData object,
        Returns:
            (Rarely used) passes the file as a `str` into the function.
        """
        if payload is None:
            return None
        file_name = payload.path
        file = tempfile.NamedTemporaryFile(delete=False, dir=self.GRADIO_CACHE)
        file.name = file_name
        return file_name

    def postprocess(self, value: str | None) -> FileData | None:
        """
        Parameters:
            value: Expects a `str` filepath, or a `list[str]` of filepaths.
        Returns:
            File information as a FileData object, or a list of FileData objects.
        """
        if value is None:
            return None
        return FileData(
            path=value,
            orig_name=Path(value).name,
        )

    @property
    def skip_api(self):
        return False
