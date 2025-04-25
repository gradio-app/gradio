"""gr.ImageSlider() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

import numpy as np
import PIL.Image
from gradio_client import handle_file
from gradio_client.documentation import document

from gradio import image_utils
from gradio.components.base import Component
from gradio.data_classes import GradioRootModel, ImageData
from gradio.events import Events


class SliderData(GradioRootModel):
    root: tuple[ImageData | None, ImageData | None] | None


image_tuple = tuple[
    str | PIL.Image.Image | np.ndarray | None, str | PIL.Image.Image | np.ndarray | None
]


if TYPE_CHECKING:
    from gradio.components import Timer

PIL.Image.init()  # fixes https://github.com/gradio-app/gradio/issues/2843


@document()
class ImageSlider(Component):
    """
    Creates an image component that can be used to upload images (as an input) or display images (as an output).

    Demos: imageslider
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
    image_mode: (
        Literal["1", "L", "P", "RGB", "RGBA", "CMYK", "YCbCr", "LAB", "HSV", "I", "F"]
        | None
    )
    type: Literal["numpy", "pil", "filepath"]

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
        slider_position: float = 50,
        max_height: int = 500,
    ):
        """
        Parameters:
            value: A tuple of PIL Image, numpy array, path or URL for the default value that ImageSlider component is going to take, this pair of images should be of equal size. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            format: File format (e.g. "png" or "gif"). Used to save image if it does not already have a valid format (e.g. if the image is being returned to the frontend as a numpy array or PIL Image). The format should be supported by the PIL library. Applies both when this component is used as an input or output. This parameter has no effect on SVG files.
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed tuple of image file or numpy array, but will affect the displayed image.
            width: The width of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed tuple of image file or numpy array, but will affect the displayed image.
            image_mode: The pixel format and color depth that the image should be loaded and preprocessed as. "RGB" will load the image as a color image, or "L" as black-and-white. See https://pillow.readthedocs.io/en/stable/handbook/concepts.html for other supported image modes and their meaning. This parameter has no effect on SVG or GIF files. If set to None, the image_mode will be inferred from the image file types (e.g. "RGBA" for a .png image, "RGB" in most other cases).
            type: The format the images are converted to before being passed into the prediction function. "numpy" converts the images to numpy arrays with shape (height, width, 3) and values from 0 to 255, "pil" converts the images to PIL image objects, "filepath" passes str paths to temporary files containing the images. To support animated GIFs in input, the `type` should be set to "filepath" or "pil". To support SVGs, the `type` should be set to "filepath".
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
            slider_position: The position of the slider as a percentage of the width of the image, between 0 and 100.
            max_height: The maximum height of the image.
        """
        self.format = format
        self.slider_position = slider_position
        self.max_height = max_height
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

    def preprocess(self, payload: SliderData | None) -> image_tuple | None:
        """
        Parameters:
            payload: image data in the form of a SliderData object
        Returns:
            Passes the uploaded image as a tuple of `numpy.array`, `PIL.Image` or `str` filepath depending on `type`.
        """
        if payload is None:
            return None
        if payload.root is None:
            raise ValueError("Payload is None.")
        return (
            image_utils.preprocess_image(
                payload.root[0],
                cache_dir=self.GRADIO_CACHE,
                format=self.format,
                image_mode=self.image_mode,
                type=self.type,
            ),
            image_utils.preprocess_image(
                payload.root[1],
                cache_dir=self.GRADIO_CACHE,
                format=self.format,
                image_mode=self.image_mode,
                type=self.type,
            ),
        )

    def postprocess(
        self,
        value: tuple[
            np.ndarray | PIL.Image.Image | str | Path | None,
            np.ndarray | PIL.Image.Image | str | Path | None,
        ]
        | None,
    ) -> SliderData | None:
        """
        Parameters:
            value: Expects a tuple of `numpy.array`, `PIL.Image`, or `str` or `pathlib.Path` filepath to an image which is displayed.
        Returns:
            Returns the image as a `SliderData` object.
        """
        if value is None:
            return None
        return SliderData(
            root=(
                image_utils.postprocess_image(
                    value[0], cache_dir=self.GRADIO_CACHE, format=self.format
                ),
                image_utils.postprocess_image(
                    value[1], cache_dir=self.GRADIO_CACHE, format=self.format
                ),
            )
        )

    def api_info_as_output(self) -> dict[str, Any]:
        return self.api_info()

    def example_payload(self) -> Any:
        return (
            handle_file(
                "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
            ),
            handle_file(
                "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
            ),
        )

    def example_value(self) -> Any:
        return (
            "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
            "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
        )
