"""gr.Image() component."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Literal, Union

import numpy as np
from gradio_client import utils as client_utils
from PIL import Image as _Image  # using _ to minimize namespace pollution

from gradio import processing_utils, utils
from gradio.components.base import Component
from gradio.data_classes import FileData, GradioRootModel
from gradio.events import Events

_Image.init()  # fixes https://github.com/gradio-app/gradio/issues/2843


class SliderData(GradioRootModel):
    root: Union[tuple[FileData | None, FileData | None], None]


image_variants = _Image.Image | np.ndarray | str | Path | FileData | None
image_tuple = (
    tuple[str, str]
    | tuple[_Image.Image, _Image.Image]
    | tuple[np.ndarray, np.ndarray]
    | None
)


class ImageSlider(Component):
    """
    Creates an image slider component that can be used to compare two images
    Preprocessing: passes the uploaded image as a tuple of {numpy.array}, {PIL.Image} or {str} filepath depending on `type`.
    Postprocessing: expects a tuple of {numpy.array}, {PIL.Image} or {str} or {pathlib.Path} filepath to an image and displays the image.
    Examples-format: a {str} local filepath or URL to an image.
    """

    template_path = "./slider/templates"

    EVENTS = [
        Events.change,
        Events.upload,
    ]

    data_model = SliderData

    def __init__(
        self,
        value: image_tuple = None,
        position: int = 0.5,
        upload_count: int = 1,
        *,
        height: int | None = None,
        width: int | None = None,
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        show_download_button: bool = True,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        show_share_button: bool | None = None,
        slider_color: str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: A PIL Image, numpy array, path or URL for the default value that Image component is going to take. If callable, the function will be called whenever the app loads to set the initial value of the component.
            position: The position of the slider, between 0 and 1.
            upload_count: The number of images that can be uploaded to the component. 1 or 2.
            height: Height of the displayed image in pixels.
            width: Width of the displayed image in pixels.
            type: The format the image is converted to before being passed into the prediction function. "numpy" converts the image to a numpy array with shape (height, width, 3) and values from 0 to 255, "pil" converts the image to a PIL image object, "filepath" passes a str path to a temporary file containing the image.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            show_download_button: If True, will display button to download image.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to upload and edit an image; if False, can only be used to display images. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            slider_color: The color of the slider separator.
        """

        valid_types = ["numpy", "pil", "filepath"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        self.height = height
        self.width = width
        self.show_download_button = show_download_button
        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )
        self.position = position
        self.upload_count = upload_count
        self.slider_color = slider_color

        super().__init__(
            label=label,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )

    def _format_image(self, im: _Image.Image | None) -> image_variants:
        """Helper method to format an image based on self.type"""
        if im is None:
            return im
        fmt = im.format
        if self.type == "pil":
            return im
        elif self.type == "numpy":
            return np.array(im)
        elif self.type == "filepath":
            path = self.pil_to_temp_file(
                im, dir=self.DEFAULT_TEMP_DIR, format=fmt or "png"
            )
            self.temp_files.add(path)
            return path
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'numpy', 'pil', 'filepath'."
            )

    def _preprocess_image(self, x: str | FileData | None):
        if x is None:
            return x
        elif isinstance(x, str):
            im = processing_utils.decode_base64_to_image(x)
        else:
            im = _Image.open(x.path)

        return self._format_image(im)

    def preprocess(self, x: SliderData) -> image_tuple:
        """
        Parameters:
            x: SliderData object containing images as numpy arrays, PIL Images, string/Path filepaths, or string urls.
        Returns:
            tuple of images in the requested format.
        """
        if x is None:
            return x

        return self._preprocess_image(x.root[0]), self._preprocess_image(x.root[1])

    def _postprocess_image(self, y: image_variants):
        if isinstance(y, np.ndarray):
            path = processing_utils.save_img_array_to_cache(
                y, cache_dir=self.GRADIO_CACHE
            )
        elif isinstance(y, _Image.Image):
            path = processing_utils.save_pil_to_cache(y, cache_dir=self.GRADIO_CACHE)
        elif isinstance(y, (str, Path)):
            path = y if isinstance(y, str) else str(utils.abspath(y))
        else:
            raise ValueError("Cannot process this value as an Image")

        return path

    def postprocess(
        self,
        y: image_tuple,
    ) -> tuple[FileData | str | None, FileData | str | None] | None:
        """
        Parameters:
            y: image as a numpy array, PIL Image, string/Path filepath, or string URL
        Returns:
            base64 url data
        """
        if y is None:
            return None

        return SliderData(
            root=(
                FileData(path=self._postprocess_image(y[0])),
                FileData(path=self._postprocess_image(y[1])),
            )
        )

    def as_example(self, input_data: tuple[str | Path | None] | None) -> str:
        if input_data is None:
            return None
        input_data = (str(input_data[0]), str(input_data[1]))
        # If an externally hosted image or a URL, don't convert to absolute path
        if self.proxy_url or client_utils.is_http_url_like(input_data[0]):
            return input_data
        return (str(utils.abspath(input_data[0])), str(utils.abspath(input_data[1])))

    def example_inputs(self) -> Any:
        return "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
