"""gr.MultimodalTextbox() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal, TypedDict, cast

import gradio_client.utils as client_utils
from gradio_client import handle_file
from gradio_client.documentation import document
from pydantic import Field
from typing_extensions import NotRequired

from gradio.components.base import Component, FormComponent
from gradio.data_classes import FileData, GradioModel
from gradio.events import Events
from gradio.exceptions import Error

if TYPE_CHECKING:
    from gradio.components import Timer


class MultimodalData(GradioModel):
    text: str
    files: list[FileData] = Field(default_factory=list)


class MultimodalPostprocess(TypedDict):
    text: str
    files: NotRequired[list[FileData]]


class MultimodalValue(TypedDict):
    text: NotRequired[str]
    files: NotRequired[list[str]]


@document()
class MultimodalTextbox(FormComponent):
    """
    Creates a textarea for users to enter string input or display string output and also allows for the uploading of multimedia files.

    Demos: chatbot_multimodal
    Guides: creating-a-chatbot
    """

    data_model = MultimodalData

    EVENTS = [
        Events.change,
        Events.input,
        Events.select,
        Events.submit,
        Events.focus,
        Events.blur,
        Events.stop,
    ]

    def __init__(
        self,
        value: str | dict[str, str | list] | Callable | None = None,
        *,
        sources: list[Literal["upload", "microphone"]]
        | Literal["upload", "microphone"]
        | None = None,
        file_types: list[str] | None = None,
        file_count: Literal["single", "multiple", "directory"] = "single",
        lines: int = 1,
        max_lines: int = 20,
        placeholder: str | None = None,
        label: str | None = None,
        info: str | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        autofocus: bool = False,
        autoscroll: bool = True,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        text_align: Literal["left", "right"] | None = None,
        rtl: bool = False,
        submit_btn: str | bool | None = True,
        stop_btn: str | bool | None = False,
        max_plain_text_length: int = 1000,
    ):
        """
        Parameters:
            value: Default value to show in MultimodalTextbox. A string value, or a dictionary of the form {"text": "sample text", "files": [{path: "files/file.jpg", orig_name: "file.jpg", url: "http://image_url.jpg", size: 100}]}. If callable, the function will be called whenever the app loads to set the initial value of the component.
            sources: A list of sources permitted. "upload" creates a button where users can click to upload or drop files, "microphone" creates a microphone input. If None, defaults to ["upload"].
            file_count: if single, allows user to upload one file. If "multiple", user uploads multiple files. If "directory", user uploads all files in selected directory. Return type will be list for each file in case of "multiple" or "directory".
            file_types: List of file extensions or types of files to be uploaded (e.g. ['image', '.json', '.mp4']). "file" allows any file to be uploaded, "image" allows only image files to be uploaded, "audio" allows only audio files to be uploaded, "video" allows only video files to be uploaded, "text" allows only text files to be uploaded.
            lines: minimum number of line rows to provide in textarea.
            max_lines: maximum number of line rows to provide in textarea.
            placeholder: placeholder hint to provide behind textarea.
            label: the label for this component, displayed above the component if `show_label` is `True` and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component corresponds to.
            info: additional component description, appears below the label in smaller font. Supports markdown / HTML syntax.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will be rendered as an editable textbox; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            autofocus: If True, will focus on the textbox when the page loads. Use this carefully, as it can cause usability issues for sighted and non-sighted users.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            text_align: How to align the text in the textbox, can be: "left", "right", or None (default). If None, the alignment is left if `rtl` is False, or right if `rtl` is True. Can only be changed if `type` is "text".
            rtl: If True and `type` is "text", sets the direction of the text to right-to-left (cursor appears on the left of the text). Default is False, which renders cursor on the right.
            autoscroll: If True, will automatically scroll to the bottom of the textbox when the value changes, unless the user scrolls up. If False, will not scroll to the bottom of the textbox when the value changes.
            submit_btn: If False, will not show a submit button. If a string, will use that string as the submit button text.
            stop_btn: If True, will show a stop button (useful for streaming demos). If a string, will use that string as the stop button text.
            max_plain_text_length: Maximum length of plain text in the textbox. If the text exceeds this length, the text will be pasted as a file. Default is 1000.
        """
        valid_sources: list[Literal["upload", "microphone"]] = ["upload", "microphone"]
        if sources is None:
            self.sources = ["upload"]
        elif isinstance(sources, str) and sources in valid_sources:
            self.sources = [sources]
        elif isinstance(sources, list):
            self.sources = sources
        else:
            raise ValueError(
                f"`sources` must be a list consisting of elements in {valid_sources}"
            )
        for source in self.sources:
            if source not in valid_sources:
                raise ValueError(
                    f"`sources` must a list consisting of elements in {valid_sources}"
                )
        self.file_types = file_types
        self.file_count = file_count
        if file_types is not None and not isinstance(file_types, list):
            raise ValueError(
                f"Parameter file_types must be a list. Received {file_types.__class__.__name__}"
            )
        self.lines = lines
        self.max_lines = max(lines, max_lines)
        self.placeholder = placeholder
        self.submit_btn = submit_btn
        self.stop_btn = stop_btn
        self.autofocus = autofocus
        self.autoscroll = autoscroll
        self.max_plain_text_length = max_plain_text_length

        super().__init__(
            label=label,
            info=info,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            value=value,
        )
        self.rtl = rtl
        self.text_align = text_align

    def preprocess(self, payload: MultimodalData | None) -> MultimodalValue | None:
        """
        Parameters:
            payload: the text and list of file(s) entered in the multimodal textbox.
        Returns:
            Passes text value and list of file(s) as a {dict} into the function.
        """
        if payload is None:
            return None
        if self.file_types is not None:
            for f in payload.files:
                if not client_utils.is_valid_file(f.path, self.file_types):
                    raise Error(
                        f"Invalid file type: {f.mime_type}. Please upload a file that is one of these formats: {self.file_types}"
                    )
        return {
            "text": payload.text,
            "files": [f.path for f in payload.files],
        }

    def postprocess(self, value: MultimodalValue | str | None) -> MultimodalData | None:
        """
        Parameters:
            value: Expects a {dict} with "text" and "files", both optional. The files array is a list of file paths or URLs.
        Returns:
            The value to display in the multimodal textbox. Files information as a list of FileData objects.
        """
        if value is None:
            return None
        if not isinstance(value, (dict, str)):
            raise ValueError(
                f"MultimodalTextbox expects a string or a dictionary with optional keys 'text' and 'files'. Received {value.__class__.__name__}"
            )
        if isinstance(value, str):
            return MultimodalData(text=value, files=[])
        text = value.get("text", "")
        if "files" in value and isinstance(value["files"], list):
            files = [
                cast(FileData, file)
                if isinstance(file, FileData | dict)
                else FileData(
                    path=file,
                    orig_name=Path(file).name,
                    mime_type=client_utils.get_mimetype(file),
                )
                for file in value["files"]
            ]
        else:
            files = []
        if not isinstance(text, str):
            raise TypeError(
                f"Expected 'text' to be a string, but got {type(text).__name__}"
            )
        if not isinstance(files, list):
            raise TypeError(
                f"Expected 'files' to be a list, but got {type(files).__name__}"
            )
        return MultimodalData(text=text, files=files)

    def example_payload(self) -> Any:
        return {
            "text": "Describe this image",
            "files": [
                handle_file(
                    "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
                )
            ],
        }

    def example_value(self) -> Any:
        return {
            "text": "Describe this image",
            "files": [
                "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
            ],
        }
