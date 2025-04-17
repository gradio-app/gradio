"""gr.ImageSlider() component."""

from __future__ import annotations

import warnings
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal, cast
from urllib.parse import quote

import numpy as np
import PIL.Image
from gradio_client import handle_file
from gradio_client.documentation import document
from PIL import ImageOps

from gradio import image_utils
from gradio.components.base import Component
from gradio.data_classes import GradioRootModel, ImageData
from gradio.events import Events
from gradio.exceptions import Error


class SliderData(GradioRootModel):
    root: tuple[ImageData | None, ImageData | None] | None


image_tuple = tuple[str | PIL.Image.Image | np.ndarray | None]


if TYPE_CHECKING:
    from gradio.components import Timer

PIL.Image.init()  # fixes https://github.com/gradio-app/gradio/issues/2843


@document()
class ImageSlider(Component):
    """
    Creates an image component that can be used to upload images (as an input) or display images (as an output).

    Demos: sepia_filter, fake_diffusion
    Guides: image-classification-in-pytorch, image-classification-in-tensorflow, image-classification-with-vision-transformers, create-your-own-friends-with-a-gan
    """

    EVENTS = [
        Events.clear,
        Events.change,
        Events.stream,
        Events.select,
        Events.upload,
        Events.input,
    ]

    data_model = SliderData

    def __init__(
        self,
        value: image_tuple | Callable | None = None,
        *,
        format: str = "webp",
        height: int | str | None = None,
        width: int | str | None = None,
        image_mode: (
            Literal[
                "1", "L", "P", "RGB", "RGBA", "CMYK", "YCbCr", "LAB", "HSV", "I", "F"
            ]
            | None
        ) = "RGB",
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        show_download_button: bool = True,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        show_fullscreen_button: bool = True,
        position: float = 0.5,
        slider_color: str = "#000000",
    ):
        """
        Parameters:
            value: A PIL Image, numpy array, path or URL for the default value that Image component is going to take. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            format: File format (e.g. "png" or "gif"). Used to save image if it does not already have a valid format (e.g. if the image is being returned to the frontend as a numpy array or PIL Image). The format should be supported by the PIL library. Applies both when this component is used as an input or output. This parameter has no effect on SVG files.
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed image file or numpy array, but will affect the displayed image.
            width: The width of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed image file or numpy array, but will affect the displayed image.
            image_mode: The pixel format and color depth that the image should be loaded and preprocessed as. "RGB" will load the image as a color image, or "L" as black-and-white. See https://pillow.readthedocs.io/en/stable/handbook/concepts.html for other supported image modes and their meaning. This parameter has no effect on SVG or GIF files. If set to None, the image_mode will be inferred from the image file type (e.g. "RGBA" for a .png image, "RGB" in most other cases).
            type: The format the image is converted before being passed into the prediction function. "numpy" converts the image to a numpy array with shape (height, width, 3) and values from 0 to 255, "pil" converts the image to a PIL image object, "filepath" passes a str path to a temporary file containing the image. To support animated GIFs in input, the `type` should be set to "filepath" or "pil". To support SVGs, the `type` should be set to "filepath".
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            show_download_button: If True, will display button to download image. Only applies if interactive is False (e.g. if the component is used as an output).
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to upload and edit an image; if False, can only be used to display images. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            show_fullscreen_button: If True, will show a fullscreen icon in the corner of the component that allows user to view the image in fullscreen mode. If False, icon does not appear.
            position: The position of the slider, between 0 and 1.
            slider_color: The color of the slider.
        """
        self.format = format
        self.position = position
        self.slider_color = slider_color

        valid_types = ["numpy", "pil", "filepath"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        self.height = height
        self.width = width
        self.image_mode = image_mode
        self.show_download_button = show_download_button
        self.show_fullscreen_button = show_fullscreen_button

        super().__init__(
            label=label,
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
        self._value_description = (
            "a tuple of filepaths to images"
            if self.type == "filepath"
            else (
                "a tuple of numpy arrays representing images"
                if self.type == "numpy"
                else "a tuple of PIL Images"
            )
        )

    def preprocess_image(
        self, payload: ImageData | None
    ) -> np.ndarray | PIL.Image.Image | str | None:
        if payload is None:
            return payload
        if payload.url and payload.url.startswith("data:"):
            if self.type == "pil":
                return image_utils.decode_base64_to_image(payload.url)
            elif self.type == "numpy":
                return image_utils.decode_base64_to_image_array(payload.url)
            elif self.type == "filepath":
                return image_utils.decode_base64_to_file(
                    payload.url, self.GRADIO_CACHE, self.format
                )
        if payload.path is None:
            raise ValueError("Image path is None.")
        file_path = Path(payload.path)
        if payload.orig_name:
            p = Path(payload.orig_name)
            name = p.stem
            suffix = p.suffix.replace(".", "")
            if suffix in ["jpg", "jpeg"]:
                suffix = "jpeg"
        else:
            name = "image"
            suffix = "webp"

        if suffix.lower() == "svg":
            if self.type == "filepath":
                return str(file_path)
            raise Error("SVG files are not supported as input images for this app.")

        im = PIL.Image.open(file_path)
        if self.type == "filepath" and (self.image_mode in [None, im.mode]):
            return str(file_path)

        exif = im.getexif()
        # 274 is the code for image rotation and 1 means "correct orientation"
        if exif.get(274, 1) != 1 and hasattr(ImageOps, "exif_transpose"):
            try:
                im = ImageOps.exif_transpose(im)
            except Exception:
                warnings.warn(
                    f"Failed to transpose image {file_path} based on EXIF data."
                )
        if suffix.lower() != "gif" and im is not None:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                if self.image_mode is not None:
                    im = im.convert(self.image_mode)
        return image_utils.format_image(
            im,
            cast(Literal["numpy", "pil", "filepath"], self.type),
            self.GRADIO_CACHE,
            name=name,
            format=suffix,
        )

    def preprocess(
        self, payload: SliderData | None
    ) -> np.ndarray | PIL.Image.Image | str | None:
        """
        Parameters:
            payload: image data in the form of a FileData object
        Returns:
            Passes the uploaded image as a `numpy.array`, `PIL.Image` or `str` filepath depending on `type`.
        """
        if payload is None:
            return None
        if payload.root is None:
            raise ValueError("Payload is None.")
        return self.preprocess_image(payload.root[0]), self.preprocess_image(
            payload.root[1]
        )

    def postprocess_image(
        self, value: np.ndarray | PIL.Image.Image | str | Path | None
    ) -> ImageData | None:
        """
        Parameters:
            value: Expects a `numpy.array`, `PIL.Image`, or `str` or `pathlib.Path` filepath to an image which is displayed.
        Returns:
            Returns the image as a `FileData` object.
        """
        if value is None:
            return None
        if isinstance(value, str) and value.lower().endswith(".svg"):
            svg_content = image_utils.extract_svg_content(value)
            return ImageData(
                orig_name=Path(value).name,
                url=f"data:image/svg+xml,{quote(svg_content)}",
            )

        saved = image_utils.save_image(value, self.GRADIO_CACHE, self.format)
        orig_name = Path(saved).name if Path(saved).exists() else None
        return ImageData(path=saved, orig_name=orig_name)

    def postprocess(
        self,
        value: tuple[
            np.ndarray | PIL.Image.Image | str | Path | None,
            np.ndarray | PIL.Image.Image | str | Path | None,
        ]
        | None,
    ) -> tuple[ImageData, ImageData] | None:
        """
        Parameters:
            value: Expects a `numpy.array`, `PIL.Image`, or `str` or `pathlib.Path` filepath to an image which is displayed.
        Returns:
            Returns the image as a `FileData` object.
        """
        if value is None:
            return None
        return SliderData(
            root=(self.postprocess_image(value[0]), self.postprocess_image(value[1]))
        )

    def api_info_as_output(self) -> dict[str, Any]:
        return self.api_info()

    def example_payload(self) -> Any:
        return handle_file(
            "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
        )

    def example_value(self) -> Any:
        return "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
