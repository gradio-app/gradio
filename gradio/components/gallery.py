"""gr.Gallery() component."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Callable, Literal

import numpy as np
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import GallerySerializable
from PIL import Image as _Image  # using _ to minimize namespace pollution

from gradio import utils
from gradio.components.base import IOComponent, _Keywords
from gradio.deprecation import warn_deprecation, warn_style_method_deprecation
from gradio.events import (
    EventListenerMethod,
    Selectable,
)

set_documentation_group("component")


@document()
class Gallery(IOComponent, GallerySerializable, Selectable):
    """
    Used to display a list of images as a gallery that can be scrolled through.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a list of images in any format, {List[numpy.array | PIL.Image | str | pathlib.Path]}, or a {List} of (image, {str} caption) tuples and displays them.

    Demos: fake_gan
    """

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
            columns: Represents the number of images that should be shown in one row, for each of the six standard screen sizes (<576px, <768px, <992px, <1200px, <1400px, >1400px). if fewer that 6 are given then the last will be used for all subsequent breakpoints
            rows: Represents the number of rows in the image grid, for each of the six standard screen sizes (<576px, <768px, <992px, <1200px, <1400px, >1400px). if fewer that 6 are given then the last will be used for all subsequent breakpoints
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
        self.select: EventListenerMethod
        """
        Event listener for when the user selects image within Gallery.
        Uses event data gradio.SelectData to carry `value` referring to caption of selected image, and `index` to refer to index.
        See EventData documentation on how to use this event data.
        """
        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )
        IOComponent.__init__(
            self,
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

    def get_config(self):
        return {
            "value": self.value,
            "grid_cols": self.grid_cols,
            "grid_rows": self.grid_rows,
            "height": self.height,
            "preview": self.preview,
            "object_fit": self.object_fit,
            "allow_preview": self.allow_preview,
            "show_share_button": self.show_share_button,
            "show_download_button": self.show_download_button,
            **IOComponent.get_config(self),
        }

    def postprocess(
        self,
        y: list[np.ndarray | _Image.Image | str]
        | list[tuple[np.ndarray | _Image.Image | str, str]]
        | None,
    ) -> list[str]:
        """
        Parameters:
            y: list of images, or list of (image, caption) tuples
        Returns:
            list of string file paths to images in temp directory
        """
        if y is None:
            return []
        output = []
        for img in y:
            caption = None
            if isinstance(img, (tuple, list)):
                img, caption = img
            if isinstance(img, np.ndarray):
                file = self.img_array_to_temp_file(img, dir=self.DEFAULT_TEMP_DIR)
                file_path = str(utils.abspath(file))
                self.temp_files.add(file_path)
            elif isinstance(img, _Image.Image):
                file = self.pil_to_temp_file(img, dir=self.DEFAULT_TEMP_DIR)
                file_path = str(utils.abspath(file))
                self.temp_files.add(file_path)
            elif isinstance(img, (str, Path)):
                if utils.validate_url(img):
                    file_path = img
                else:
                    file_path = self.make_temp_copy_if_needed(img)
            else:
                raise ValueError(f"Cannot process type as image: {type(img)}")

            if caption is not None:
                output.append(
                    [{"name": file_path, "data": None, "is_file": True}, caption]
                )
            else:
                output.append({"name": file_path, "data": None, "is_file": True})

        return output

    def style(
        self,
        *,
        grid: int | tuple | None = None,
        columns: int | tuple | None = None,
        rows: int | tuple | None = None,
        height: str | None = None,
        container: bool | None = None,
        preview: bool | None = None,
        object_fit: str | None = None,
        **kwargs,
    ):
        """
        This method is deprecated. Please set these arguments in the constructor instead.
        """
        warn_style_method_deprecation()
        if grid is not None:
            warn_deprecation(
                "The 'grid' parameter will be deprecated. Please use 'columns' in the constructor instead.",
            )
            self.grid_cols = grid
        if columns is not None:
            self.grid_cols = columns
        if rows is not None:
            self.grid_rows = rows
        if height is not None:
            self.height = height
        if preview is not None:
            self.preview = preview
        if object_fit is not None:
            self.object_fit = object_fit
        if container is not None:
            self.container = container
        return self
