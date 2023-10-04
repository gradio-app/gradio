"""gr.UploadButton() component."""

from __future__ import annotations

import tempfile
import warnings
from typing import Any, Callable, List, Literal

from gradio_client import utils as client_utils
from gradio_client.documentation import document, set_documentation_group

from gradio import utils
from gradio.components.base import Component, _Keywords
from gradio.data_classes import FileData, GradioRootModel
from gradio.deprecation import warn_deprecation, warn_style_method_deprecation
from gradio.events import Events

set_documentation_group("component")


class ListFiles(GradioRootModel):
    root: List[FileData]

from gradio.events import Dependency

@document()
class UploadButton(Component):
    """
    Used to create an upload button, when clicked allows a user to upload files that satisfy the specified file type or generic files (if file_type not set).
    Preprocessing: passes the uploaded file as a {file-object} or {List[file-object]} depending on `file_count` (or a {bytes}/{List{bytes}} depending on `type`)
    Postprocessing: expects function to return a {str} path to a file, or {List[str]} consisting of paths to files.
    Examples-format: a {str} path to a local file that populates the component.
    Demos: upload_button
    """

    EVENTS = [Events.click, Events.upload]

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
        super().__init__(
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

    def api_info(self) -> dict[str, list[str]]:
        if self.file_count == "single":
            return FileData.model_json_schema()
        else:
            return ListFiles.model_json_schema()

    def example_inputs(self) -> Any:
        if self.file_count == "single":
            return "https://github.com/gradio-app/gradio/raw/main/test/test_files/sample_file.pdf"
        else:
            return [
                "https://github.com/gradio-app/gradio/raw/main/test/test_files/sample_file.pdf"
            ]

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
        warnings.warn(
            "Using the update method is deprecated. Simply return a new object instead, e.g. `return gr.UploadButton(...)` instead of `return gr.UploadButton.update(...)`."
        )
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

        if self.file_count == "single":
            if isinstance(x, list):
                return File._process_single_file(
                    x[0], type=self.type, cache_dir=self.GRADIO_CACHE  # type: ignore
                )
            else:
                return File._process_single_file(
                    x, type=self.type, cache_dir=self.GRADIO_CACHE  # type: ignore
                )
        else:
            if isinstance(x, list):
                return [
                    File._process_single_file(
                        f, type=self.type, cache_dir=self.GRADIO_CACHE  # type: ignore
                    )
                    for f in x
                ]
            else:
                return File._process_single_file(
                    x, type=self.type, cache_dir=self.GRADIO_CACHE  # type: ignore
                )

    def postprocess(self, y):
        return super().postprocess(y)

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

    @property
    def skip_api(self):
        return False

    
    def click(self,
        fn: Callable | None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        outputs: Component | Sequence[Component] | None = None,
        api_name: str | None | Literal[False] = None,
        status_tracker: None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: float | None = None,
        _js: str | None = None,) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: Defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, the endpoint will be exposed in the api docs as an unnamed endpoint, although this behavior will be changed in Gradio 4.0. If set to a string, the endpoint will be exposed in the api docs with the given name.
            status_tracker: Deprecated and has no effect.
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: Run this event 'every' number of seconds while the client connection is open. Interpreted in seconds. Queue must be enabled.
        """
        ...
    
    def upload(self,
        fn: Callable | None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        outputs: Component | Sequence[Component] | None = None,
        api_name: str | None | Literal[False] = None,
        status_tracker: None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: float | None = None,
        _js: str | None = None,) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: Defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, the endpoint will be exposed in the api docs as an unnamed endpoint, although this behavior will be changed in Gradio 4.0. If set to a string, the endpoint will be exposed in the api docs with the given name.
            status_tracker: Deprecated and has no effect.
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: Run this event 'every' number of seconds while the client connection is open. Interpreted in seconds. Queue must be enabled.
        """
        ...