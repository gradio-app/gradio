"""gr.Image() component."""

from __future__ import annotations

import warnings
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

import numpy as np
import PIL.Image
from gradio_client import handle_file
from gradio_client.documentation import document

from gradio import image_utils, utils
from gradio.components.base import Component, StreamingInput
from gradio.components.image_editor import WebcamOptions
from gradio.data_classes import Base64ImageData, ImageData
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer

PIL.Image.init()  # fixes https://github.com/gradio-app/gradio/issues/2843


@document()
class Image(StreamingInput, Component):
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

    data_model = ImageData
    image_mode: (
        Literal["1", "L", "P", "RGB", "RGBA", "CMYK", "YCbCr", "LAB", "HSV", "I", "F"]
        | None
    )

    type: Literal["numpy", "pil", "filepath"]

    def __init__(
        self,
        value: str | PIL.Image.Image | np.ndarray | Callable | None = None,
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
        sources: (
            list[Literal["upload", "webcam", "clipboard"]]
            | Literal["upload", "webcam", "clipboard"]
            | None
        ) = None,
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
        streaming: bool = False,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        mirror_webcam: bool | None = None,
        webcam_options: WebcamOptions | None = None,
        show_share_button: bool | None = None,
        placeholder: str | None = None,
        show_fullscreen_button: bool = True,
        webcam_constraints: dict[str, Any] | None = None,
    ):
        """
        Parameters:
            value: A PIL Image, numpy array, path or URL for the default value that Image component is going to take. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            format: File format (e.g. "png" or "gif"). Used to save image if it does not already have a valid format (e.g. if the image is being returned to the frontend as a numpy array or PIL Image). The format should be supported by the PIL library. Applies both when this component is used as an input or output. This parameter has no effect on SVG files.
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed image file or numpy array, but will affect the displayed image.
            width: The width of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed image file or numpy array, but will affect the displayed image.
            image_mode: The pixel format and color depth that the image should be loaded and preprocessed as. "RGB" will load the image as a color image, or "L" as black-and-white. See https://pillow.readthedocs.io/en/stable/handbook/concepts.html for other supported image modes and their meaning. This parameter has no effect on SVG or GIF files. If set to None, the image_mode will be inferred from the image file type (e.g. "RGBA" for a .png image, "RGB" in most other cases).
            sources: List of sources for the image. "upload" creates a box where user can drop an image file, "webcam" allows user to take snapshot from their webcam, "clipboard" allows users to paste an image from the clipboard. If None, defaults to ["upload", "webcam", "clipboard"] if streaming is False, otherwise defaults to ["webcam"].
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
            streaming: If True when used in a `live` interface, will automatically stream webcam feed. Only valid is source is 'webcam'. If the component is an output component, will automatically convert images to base64.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            mirror_webcam: If True webcam will be mirrored. Default is True.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            placeholder: Custom text for the upload area. Overrides default upload messages when provided. Accepts new lines and `#` to designate a heading.
            show_fullscreen_button: If True, will show a fullscreen icon in the corner of the component that allows user to view the image in fullscreen mode. If False, icon does not appear.
            webcam_constraints: A dictionary that allows developers to specify custom media constraints for the webcam stream. This parameter provides flexibility to control the video stream's properties, such as resolution and front or rear camera on mobile devices. See $demo/webcam_constraints
        """
        self.format = format

        self.webcam_options = (
            webcam_options if webcam_options is not None else WebcamOptions()
        )

        if mirror_webcam is not None:
            warnings.warn(
                "The `mirror_webcam` parameter is deprecated. Please use the `webcam_options` parameter with a `gr.WebcamOptions` instance instead."
            )
            self.webcam_options.mirror = mirror_webcam

        if webcam_constraints is not None:
            warnings.warn(
                "The `webcam_constraints` parameter is deprecated. Please use the `webcam_options` parameter with a `gr.WebcamOptions` instance instead."
            )
            self.webcam_options.constraints = webcam_constraints

        valid_types = ["numpy", "pil", "filepath"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        self.height = height
        self.width = width
        self.image_mode = image_mode
        valid_sources = ["upload", "webcam", "clipboard"]
        if sources is None:
            self.sources = (
                ["webcam"] if streaming else ["upload", "webcam", "clipboard"]
            )
        elif isinstance(sources, str):
            self.sources = [sources]  # type: ignore
        else:
            self.sources = sources
        for source in self.sources:  # type: ignore
            if source not in valid_sources:
                raise ValueError(
                    f"`sources` must a list consisting of elements in {valid_sources}"
                )
        self.streaming = streaming
        self.show_download_button = show_download_button
        if streaming and self.sources != ["webcam"]:
            raise ValueError(
                "Image streaming only available if sources is ['webcam']. Streaming not supported with multiple sources."
            )
        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )
        self.show_fullscreen_button = show_fullscreen_button
        self.placeholder = placeholder

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
            "a filepath to an image"
            if self.type == "filepath"
            else (
                "a numpy array representing an image"
                if self.type == "numpy"
                else "a PIL Image"
            )
        )

    def preprocess(
        self, payload: ImageData | None
    ) -> np.ndarray | PIL.Image.Image | str | None:
        """
        Parameters:
            payload: image data in the form of a FileData object
        Returns:
            Passes the uploaded image as a `numpy.array`, `PIL.Image` or `str` filepath depending on `type`.
        """
        return image_utils.preprocess_image(
            payload,
            cache_dir=self.GRADIO_CACHE,
            format=self.format,
            image_mode=self.image_mode,
            type=self.type,
        )

    def postprocess(
        self, value: np.ndarray | PIL.Image.Image | str | Path | None
    ) -> ImageData | Base64ImageData | None:
        """
        Parameters:
            value: Expects a `numpy.array`, `PIL.Image`, or `str` or `pathlib.Path` filepath to an image which is displayed.
        Returns:
            Returns the image as a `FileData` object.
        """
        return image_utils.postprocess_image(
            value,
            cache_dir=self.GRADIO_CACHE,
            format=self.format,
        )

    def api_info_as_output(self) -> dict[str, Any]:
        if self.streaming == "base64":
            schema = Base64ImageData.model_json_schema()
            schema.pop("description", None)
            return schema
        return self.api_info()

    def check_streamable(self):
        if self.streaming and self.sources != ["webcam"]:
            raise ValueError(
                "Image streaming only available if sources is ['webcam']. Streaming not supported with multiple sources."
            )

    def example_payload(self) -> Any:
        return handle_file(
            "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
        )

    def example_value(self) -> Any:
        return "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
