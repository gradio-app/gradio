"""gr.Gallery() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import (
    TYPE_CHECKING,
    Any,
    Literal,
    Optional,
    Union,
)
from urllib.parse import urlparse

import numpy as np
import PIL.Image
from gradio_client import handle_file
from gradio_client import utils as client_utils
from gradio_client.documentation import document
from gradio_client.utils import is_http_url_like

from gradio import processing_utils, utils, wasm_utils
from gradio.components.base import Component
from gradio.data_classes import FileData, GradioModel, GradioRootModel
from gradio.events import Events
from gradio.exceptions import Error

if TYPE_CHECKING:
    from gradio.components import Timer

GalleryMediaType = Union[np.ndarray, PIL.Image.Image, Path, str]
CaptionedGalleryMediaType = tuple[GalleryMediaType, str]


class GalleryImage(GradioModel):
    image: FileData
    caption: Optional[str] = None


class GalleryVideo(GradioModel):
    video: FileData
    caption: Optional[str] = None


class GalleryData(GradioRootModel):
    root: list[Union[GalleryImage, GalleryVideo]]


@document()
class Gallery(Component):
    """
    Creates a gallery component that allows displaying a grid of images or videos, and optionally captions. If used as an input, the user can upload images or videos to the gallery.
    If used as an output, the user can click on individual images or videos to view them at a higher resolution.

    Demos: fake_gan
    """

    EVENTS = [Events.select, Events.upload, Events.change]

    data_model = GalleryData

    def __init__(
        self,
        value: (
            Sequence[np.ndarray | PIL.Image.Image | str | Path | tuple]
            | Callable
            | None
        ) = None,
        *,
        format: str = "webp",
        file_types: list[str] | None = None,
        label: str | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        columns: int | list[int] | tuple[int, ...] | None = 2,
        rows: int | list[int] | None = None,
        height: int | float | str | None = None,
        allow_preview: bool = True,
        preview: bool | None = None,
        selected_index: int | None = None,
        object_fit: (
            Literal["contain", "cover", "fill", "none", "scale-down"] | None
        ) = None,
        show_share_button: bool | None = None,
        show_download_button: bool | None = True,
        interactive: bool | None = None,
        type: Literal["numpy", "pil", "filepath"] = "filepath",
        show_fullscreen_button: bool = True,
    ):
        """
        Parameters:
            value: List of images or videos to display in the gallery by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            format: Format to save images before they are returned to the frontend, such as 'jpeg' or 'png'. This parameter only applies to images that are returned from the prediction function as numpy arrays or PIL Images. The format should be supported by the PIL library.
            file_types: List of file extensions or types of files to be uploaded (e.g. ['image', '.mp4']), when this is used as an input component. "image" allows only image files to be uploaded, "video" allows only video files to be uploaded, ".mp4" allows only mp4 files to be uploaded, etc. If None, any image and video files types are allowed.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            columns: Represents the number of images that should be shown in one row, for each of the six standard screen sizes (<576px, <768px, <992px, <1200px, <1400px, >1400px). If fewer than 6 are given then the last will be used for all subsequent breakpoints
            rows: Represents the number of rows in the image grid, for each of the six standard screen sizes (<576px, <768px, <992px, <1200px, <1400px, >1400px). If fewer than 6 are given then the last will be used for all subsequent breakpoints
            height: The height of the gallery component, specified in pixels if a number is passed, or in CSS units if a string is passed. If more images are displayed than can fit in the height, a scrollbar will appear.
            allow_preview: If True, images in the gallery will be enlarged when they are clicked. Default is True.
            preview: If True, Gallery will start in preview mode, which shows all of the images as thumbnails and allows the user to click on them to view them in full size. Only works if allow_preview is True.
            selected_index: The index of the image that should be initially selected. If None, no image will be selected at start. If provided, will set Gallery to preview mode unless allow_preview is set to False.
            object_fit: CSS object-fit property for the thumbnail images in the gallery. Can be "contain", "cover", "fill", "none", or "scale-down".
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            show_download_button: If True, will show a download button in the corner of the selected image. If False, the icon does not appear. Default is True.
            interactive: If True, the gallery will be interactive, allowing the user to upload images. If False, the gallery will be static. Default is True.
            type: The format the image is converted to before being passed into the prediction function. "numpy" converts the image to a numpy array with shape (height, width, 3) and values from 0 to 255, "pil" converts the image to a PIL image object, "filepath" passes a str path to a temporary file containing the image. If the image is SVG, the `type` is ignored and the filepath of the SVG is returned.
            show_fullscreen_button: If True, will show a fullscreen icon in the corner of the component that allows user to view the gallery in fullscreen mode. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
        """
        self.format = format
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
        self.type = type
        self.show_fullscreen_button = show_fullscreen_button
        self.file_types = file_types

        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )
        super().__init__(
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            value=value,
            interactive=interactive,
        )

    def preprocess(
        self, payload: GalleryData | None
    ) -> (
        list[tuple[str, str | None]]
        | list[tuple[PIL.Image.Image, str | None]]
        | list[tuple[np.ndarray, str | None]]
        | None
    ):
        """
        Parameters:
            payload: a list of images or videos, or list of (media, caption) tuples
        Returns:
            Passes the list of images or videos as a list of (media, caption) tuples, or a list of (media, None) tuples if no captions are provided (which is usually the case). Images can be a `str` file path, a `numpy` array, or a `PIL.Image` object depending on `type`.  Videos are always `str` file path.
        """
        if payload is None or not payload.root:
            return None
        data = []
        for gallery_element in payload.root:
            if isinstance(gallery_element, GalleryVideo):
                file_path = gallery_element.video.path
            else:
                file_path = gallery_element.image.path
            if self.file_types and not client_utils.is_valid_file(
                file_path, self.file_types
            ):
                raise Error(
                    f"Invalid file type. Please upload a file that is one of these formats: {self.file_types}"
                )
            else:
                media = (
                    gallery_element.video.path
                    if (type(gallery_element) is GalleryVideo)
                    else self.convert_to_type(gallery_element.image.path, self.type)  # type: ignore
                )
                data.append((media, gallery_element.caption))
        return data

    def postprocess(
        self,
        value: list[GalleryMediaType | CaptionedGalleryMediaType] | None,
    ) -> GalleryData:
        """
        Parameters:
            value: Expects the function to return a `list` of images or videos, or `list` of (media, `str` caption) tuples. Each image can be a `str` file path, a `numpy` array, or a `PIL.Image` object. Each video can be a `str` file path.
        Returns:
            a list of images or videos, or list of (media, caption) tuples
        """
        if value is None:
            return GalleryData(root=[])
        output = []

        def _save(img):
            url = None
            caption = None
            orig_name = None
            mime_type = None
            if isinstance(img, (tuple, list)):
                img, caption = img
            if isinstance(img, np.ndarray):
                file = processing_utils.save_img_array_to_cache(
                    img, cache_dir=self.GRADIO_CACHE, format=self.format
                )
                file_path = str(utils.abspath(file))
            elif isinstance(img, PIL.Image.Image):
                file = processing_utils.save_pil_to_cache(
                    img, cache_dir=self.GRADIO_CACHE, format=self.format
                )
                file_path = str(utils.abspath(file))
            elif isinstance(img, str):
                file_path = img
                mime_type = client_utils.get_mimetype(file_path)
                if is_http_url_like(img):
                    url = img
                    orig_name = Path(urlparse(img).path).name
                else:
                    url = None
                    orig_name = Path(img).name
            elif isinstance(img, Path):
                file_path = str(img)
                orig_name = img.name
                mime_type = client_utils.get_mimetype(file_path)
            else:
                raise ValueError(f"Cannot process type as image: {type(img)}")
            if mime_type is not None and "video" in mime_type:
                return GalleryVideo(
                    video=FileData(
                        path=file_path,
                        url=url,
                        orig_name=orig_name,
                        mime_type=mime_type,
                    ),
                    caption=caption,
                )
            else:
                return GalleryImage(
                    image=FileData(
                        path=file_path,
                        url=url,
                        orig_name=orig_name,
                        mime_type=mime_type,
                    ),
                    caption=caption,
                )

        if wasm_utils.IS_WASM:
            for img in value:
                output.append(_save(img))
        else:
            with ThreadPoolExecutor() as executor:
                for o in executor.map(_save, value):
                    output.append(o)
        return GalleryData(root=output)

    @staticmethod
    def convert_to_type(img: str, type: Literal["filepath", "numpy", "pil"]):
        if type == "filepath":
            return img
        else:
            converted_image = PIL.Image.open(img)
            if type == "numpy":
                converted_image = np.array(converted_image)
            return converted_image

    def example_payload(self) -> Any:
        return [
            {
                "image": handle_file(
                    "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
                )
            },
        ]

    def example_value(self) -> Any:
        return [
            "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
        ]
