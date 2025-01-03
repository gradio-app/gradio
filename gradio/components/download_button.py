"""gr.DownloadButton() component."""

from __future__ import annotations

import tempfile
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Literal

from gradio_client import handle_file
from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.data_classes import FileData
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer


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
        value: str | Path | Callable | None = None,
        *,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        visible: bool = True,
        size: Literal["sm", "md", "lg"] = "lg",
        icon: str | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
    ):
        """
        Parameters:
            label: Text to display on the button. Defaults to "Download".
            value: A str or pathlib.Path filepath or URL to download, or a Callable that returns a str or pathlib.Path filepath or URL to download.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            variant: 'primary' for main call-to-action, 'secondary' for a more subdued style, 'stop' for a stop button.
            visible: If False, component will be hidden.
            size: size of the button. Can be "sm", "md", or "lg".
            icon: URL or path to the icon file to display within the button. If None, no icon will be displayed.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: If False, the UploadButton will be in a disabled state.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
        """
        self.data_model = FileData
        self.size = size
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
            value=value,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
        )
        self.icon = self.serve_static_file(icon)

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

    def postprocess(self, value: str | Path | None) -> FileData | None:
        """
        Parameters:
            value: Expects a `str` or `pathlib.Path` filepath
        Returns:
            File information as a FileData object
        """
        if value is None:
            return None
        return FileData(path=str(value), orig_name=Path(value).name)

    def example_payload(self) -> dict:
        return handle_file(
            "https://github.com/gradio-app/gradio/raw/main/test/test_files/sample_file.pdf"
        )

    def example_value(self) -> str:
        return "https://github.com/gradio-app/gradio/raw/main/test/test_files/sample_file.pdf"

    @property
    def skip_api(self):
        return False
