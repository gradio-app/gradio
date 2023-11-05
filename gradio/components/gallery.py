"""gr.Gallery() component."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Callable, List, Literal, Optional

import numpy as np
from gradio_client.documentation import document, set_documentation_group
from gradio_client.utils import is_http_url_like
from PIL import Image as _Image  # using _ to minimize namespace pollution

from gradio import processing_utils, utils
from gradio.components.base import Component
from gradio.data_classes import FileData, GradioModel, GradioRootModel
from gradio.events import Events

set_documentation_group("component")


class GalleryImage(GradioModel):
    image: FileData
    caption: Optional[str] = None


class GalleryData(GradioRootModel):
    root: List[GalleryImage]


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
        render: bool = True,
        columns: int | tuple | None = 2,
        rows: int | tuple | None = None,
        height: int | float | None = None,
        allow_preview: bool = True,
        preview: bool | None = None,
        selected_index: int | None = None,
        object_fit: Literal["contain", "cover", "fill", "none", "scale-down"]
        | None = None,
        show_share_button: bool | None = None,
        show_download_button: bool | None = True,
    ):
        """
        Parameters:
            value: List of images to display in the gallery by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            columns: Represents the number of images that should be shown in one row, for each of the six standard screen sizes (<576px, <768px, <992px, <1200px, <1400px, >1400px). If fewer than 6 are given then the last will be used for all subsequent breakpoints
            rows: Represents the number of rows in the image grid, for each of the six standard screen sizes (<576px, <768px, <992px, <1200px, <1400px, >1400px). If fewer than 6 are given then the last will be used for all subsequent breakpoints
            height: The height of the gallery component, in pixels. If more images are displayed than can fit in the height, a scrollbar will appear.
            allow_preview: If True, images in the gallery will be enlarged when they are clicked. Default is True.
            preview: If True, Gallery will start in preview mode, which shows all of the images as thumbnails and allows the user to click on them to view them in full size. Only works if allow_preview is True.
            selected_index: The index of the image that should be initially selected. If None, no image will be selected at start. If provided, will set Gallery to preview mode unless allow_preview is set to False.
            object_fit: CSS object-fit property for the thumbnail images in the gallery. Can be "contain", "cover", "fill", "none", or "scale-down".
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            show_download_button: If True, will show a download button in the corner of the selected image. If False, the icon does not appear. Default is True.
        """
        self.columns = columns
        self.rows = rows
        self.height = height
        self.preview = preview
        self.object_fit = object_fit
        self.allow_preview = allow_preview
        self.show_download_button = (
            (utils.get_space() is not None)
            if show_download_button is None
            else show_download_button
        )
        self.selected_index = selected_index

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
            render=render,
            value=value,
        )

    def postprocess(
        self,
        value: list[np.ndarray | _Image.Image | str]
        | list[tuple[np.ndarray | _Image.Image | str, str]]
        | None,
    ) -> GalleryData:
        """
        Parameters:
            value: list of images, or list of (image, caption) tuples
        Returns:
            list of string file paths to images in temp directory
        """
        if value is None:
            return GalleryData(root=[])
        output = []
        for img in value:
            url = None
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
            elif isinstance(img, str):
                file_path = img
                url = img if is_http_url_like(img) else None
            elif isinstance(img, Path):
                file_path = str(img)
            else:
                raise ValueError(f"Cannot process type as image: {type(img)}")
            entry = GalleryImage(
                image=FileData(path=file_path, url=url), caption=caption
            )
            output.append(entry)
        return GalleryData(root=output)

    def preprocess(self, payload: GalleryData | None) -> GalleryData | None:
        if payload is None or not payload.root:
            return None
        return payload

    def example_inputs(self) -> Any:
        return [
            "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
        ]
