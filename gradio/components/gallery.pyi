"""gr.Gallery() component."""

from __future__ import annotations

import warnings
from pathlib import Path
from typing import Any, Callable, List, Literal, Optional

import numpy as np
from gradio_client.documentation import document, set_documentation_group
from PIL import Image as _Image  # using _ to minimize namespace pollution

from gradio import utils
from gradio.components.base import Component, _Keywords
from gradio.data_classes import FileData, GradioModel, GradioRootModel
from gradio.events import Events

set_documentation_group("component")


class GalleryImage(GradioModel):
    image: FileData
    caption: Optional[str] = None


class GalleryData(GradioRootModel):
    root: List[GalleryImage]

from gradio.events import Dependency

@document()
class Gallery(Component):
    """
    Used to display a list of images as a gallery that can be scrolled through.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a list of images in any format, {List[numpy.array | PIL.Image | str | pathlib.Path]}, or a {List} of (image, {str} caption) tuples and displays them.

    Demos: fake_gan
    """

    EVENTS = [Events.select]

    data_model = GalleryData

    def __init__(
        self,
        value: list[np.ndarray | _Image.Image | str | Path | tuple]
        | Callable
        | None = None,
        *,
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        columns: int | tuple | None = 2,
        rows: int | tuple | None = None,
        height: int | float | None = None,
        preview: bool | None = None,
        object_fit: Literal["contain", "cover", "fill", "none", "scale-down"]
        | None = None,
        allow_preview: bool = True,
        show_share_button: bool | None = None,
        show_download_button: bool | None = True,
        **kwargs,
    ):
        """
        Parameters:
            value: List of images to display in the gallery by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            columns: Represents the number of images that should be shown in one row, for each of the six standard screen sizes (<576px, <768px, <992px, <1200px, <1400px, >1400px). If fewer than 6 are given then the last will be used for all subsequent breakpoints
            rows: Represents the number of rows in the image grid, for each of the six standard screen sizes (<576px, <768px, <992px, <1200px, <1400px, >1400px). If fewer than 6 are given then the last will be used for all subsequent breakpoints
            height: The height of the gallery component, in pixels. If more images are displayed than can fit in the height, a scrollbar will appear.
            preview: If True, will display the Gallery in preview mode, which shows all of the images as thumbnails and allows the user to click on them to view them in full size.
            object_fit: CSS object-fit property for the thumbnail images in the gallery. Can be "contain", "cover", "fill", "none", or "scale-down".
            allow_preview: If True, images in the gallery will be enlarged when they are clicked. Default is True.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            show_download_button: If True, will show a download button in the corner of the selected image. If False, the icon does not appear. Default is True.

        """
        self.grid_cols = columns
        self.grid_rows = rows
        self.height = height
        self.preview = preview
        self.object_fit = object_fit
        self.allow_preview = allow_preview
        self.show_download_button = (
            (utils.get_space() is not None)
            if show_download_button is None
            else show_download_button
        )
        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )
        super().__init__(
            label=label,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )

    @staticmethod
    def update(
        value: Any | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        visible: bool | None = None,
        columns: int | tuple | None = None,
        rows: int | tuple | None = None,
        height: int | float | None = None,
        preview: bool | None = None,
        object_fit: Literal["contain", "cover", "fill", "none", "scale-down"]
        | None = None,
        allow_preview: bool | None = None,
        show_share_button: bool | None = None,
        show_download_button: bool | None = None,
    ):
        warnings.warn(
            "Using the update method is deprecated. Simply return a new object instead, e.g. `return gr.Gallery(...)` instead of `return gr.Gallery.update(...)`."
        )
        updated_config = {
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "visible": visible,
            "value": value,
            "grid_cols": columns,
            "grid_rows": rows,
            "height": height,
            "preview": preview,
            "object_fit": object_fit,
            "allow_preview": allow_preview,
            "show_share_button": show_share_button,
            "show_download_button": show_download_button,
            "__type__": "update",
        }
        return updated_config

    def postprocess(
        self,
        y: list[np.ndarray | _Image.Image | str]
        | list[tuple[np.ndarray | _Image.Image | str, str]]
        | None,
    ) -> GalleryData:
        """
        Parameters:
            y: list of images, or list of (image, caption) tuples
        Returns:
            list of string file paths to images in temp directory
        """
        if y is None:
            return GalleryData(root=[])
        output = []
        for img in y:
            caption = None
            if isinstance(img, (tuple, list)):
                img, caption = img
            if isinstance(img, np.ndarray):
                file = processing_utils.save_img_array_to_cache(
                    img, cache_dir=self.GRADIO_CACHE
                )
                file_path = str(utils.abspath(file))
            elif isinstance(img, _Image.Image):
                file = processing_utils.save_pil_to_cache(
                    img, cache_dir=self.GRADIO_CACHE
                )
                file_path = str(utils.abspath(file))
            elif isinstance(img, (str, Path)):
                file_path = str(img)
            else:
                raise ValueError(f"Cannot process type as image: {type(img)}")

            entry = GalleryImage(
                image=FileData(name=file_path, is_file=True), caption=caption
            )
            output.append(entry)
        return GalleryData(root=output)

    def preprocess(self, x: Any) -> Any:
        return x

    def example_inputs(self) -> Any:
        return [
            "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
        ]

    
    def select(self,
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