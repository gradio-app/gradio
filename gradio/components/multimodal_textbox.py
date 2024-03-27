"""gr.MultimodalTextbox() component."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Callable, List, Literal, TypedDict

import gradio_client.utils as client_utils
from gradio_client.documentation import document
from pydantic import Field
from typing_extensions import NotRequired

from gradio.components.base import FormComponent
from gradio.data_classes import FileData, GradioModel
from gradio.events import Events


class MultimodalData(GradioModel):
    text: str
    files: List[FileData] = Field(default_factory=list)


class MultimodalPostprocess(TypedDict):
    text: str
    files: List[FileData]


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
    ]

    def __init__(
        self,
        value: dict[str, str | list] | Callable | None = None,
        *,
        file_types: list[str] | None = None,
        lines: int = 1,
        max_lines: int = 20,
        placeholder: str | None = None,
        label: str | None = None,
        info: str | None = None,
        every: float | None = None,
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
        text_align: Literal["left", "right"] | None = None,
        rtl: bool = False,
        submit_btn: str | Literal[False] | None = None,
    ):
        """
        Parameters:
            value: Default value to show in MultimodalTextbox. A dictionary of the form {"text": "sample text", "files": [{path: "files/file.jpg", orig_name: "file.jpg", url: "http://image_url.jpg", size: 100}]}. If callable, the function will be called whenever the app loads to set the initial value of the component.
            file_types: List of file extensions or types of files to be uploaded (e.g. ['image', '.json', '.mp4']). "file" allows any file to be uploaded, "image" allows only image files to be uploaded, "audio" allows only audio files to be uploaded, "video" allows only video files to be uploaded, "text" allows only text files to be uploaded.
            lines: minimum number of line rows to provide in textarea.
            max_lines: maximum number of line rows to provide in textarea.
            placeholder: placeholder hint to provide behind textarea.
            label: The label for this component. Appears above the component and is also used as the header if there is a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            info: additional component description.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
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
            text_align: How to align the text in the textbox, can be: "left", "right", or None (default). If None, the alignment is left if `rtl` is False, or right if `rtl` is True. Can only be changed if `type` is "text".
            rtl: If True and `type` is "text", sets the direction of the text to right-to-left (cursor appears on the left of the text). Default is False, which renders cursor on the right.
            autoscroll: If True, will automatically scroll to the bottom of the textbox when the value changes, unless the user scrolls up. If False, will not scroll to the bottom of the textbox when the value changes.
            submit_btn: If False, will not show a submit button. If a string, will use that string as the submit button text. Only applies if `interactive` is True.
        """
        self.file_types = file_types
        if value is None:
            value = {"text": "", "files": []}
        if file_types is not None and not isinstance(file_types, list):
            raise ValueError(
                f"Parameter file_types must be a list. Received {file_types.__class__.__name__}"
            )
        self.lines = lines
        self.max_lines = max(lines, max_lines)
        self.placeholder = placeholder
        self.submit_btn = submit_btn
        self.autofocus = autofocus
        self.autoscroll = autoscroll

        super().__init__(
            label=label,
            info=info,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
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
        return {
            "text": payload.text,
            "files": [f.path for f in payload.files],
        }

    def postprocess(self, value: MultimodalValue | None) -> MultimodalData:
        """
        Parameters:
            value: Expects a {dict} with "text" and "files", both optional. The files array is a list of file paths or URLs.
        Returns:
            The value to display in the multimodal textbox. Files information as a list of FileData objects.
        """
        if value is None:
            return MultimodalData(text="", files=[])
        if not isinstance(value, dict):
            raise ValueError(
                f"MultimodalTextbox expects a dictionary with optional keys 'text' and 'files'. Received {value.__class__.__name__}"
            )
        text = value.get("text", "")
        if "files" in value and isinstance(value["files"], list):
            files = [
                file
                if isinstance(file, FileData)
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

    def example_inputs(self) -> Any:
        return {"text": "sample text", "files": []}
