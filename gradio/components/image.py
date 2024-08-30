"""gr.Image() component."""

from __future__ import annotations

import warnings
from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable, Literal, Sequence, cast

import numpy as np
import PIL.Image
from gradio_client import handle_file
from gradio_client.documentation import document
from PIL import ImageOps

from gradio import image_utils, utils
from gradio.components.base import Component, StreamingInput
from gradio.data_classes import FileData
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

    data_model = FileData

    def __init__(
        self,
        value: str | PIL.Image.Image | np.ndarray | Callable | None = None,
        *,
        format: str = "webp",
        height: int | str | None = None,
        width: int | str | None = None,
        image_mode: Literal[
            "1", "L", "P", "RGB", "RGBA", "CMYK", "YCbCr", "LAB", "HSV", "I", "F"
        ]
        | None = "RGB",
        sources: list[Literal["upload", "webcam", "clipboard"]]
        | Literal["upload", "webcam", "clipboard"]
        | None = None,
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
        mirror_webcam: bool = True,
        show_share_button: bool | None = None,
        placeholder: str | None = None,
        show_fullscreen_button: bool = True,
    ):
        """
        Parameters:
            value: A PIL Image, numpy array, path or URL for the default value that Image component is going to take. If callable, the function will be called whenever the app loads to set the initial value of the component.
            format: File format (e.g. "png" or "gif") to save image if it does not already have a valid format (e.g. if the image is being returned to the frontend as a numpy array or PIL Image).  The format should be supported by the PIL library. This parameter has no effect on SVG files.
            height: The height of the displayed image, specified in pixels if a number is passed, or in CSS units if a string is passed.
            width: The width of the displayed image, specified in pixels if a number is passed, or in CSS units if a string is passed.
            image_mode: "RGB" if color, or "L" if black and white. See https://pillow.readthedocs.io/en/stable/handbook/concepts.html for other supported image modes and their meaning. This parameter has no effect on SVG or GIF files. If set to None, the image_mode will be inferred from the image file.
            sources: List of sources for the image. "upload" creates a box where user can drop an image file, "webcam" allows user to take snapshot from their webcam, "clipboard" allows users to paste an image from the clipboard. If None, defaults to ["upload", "webcam", "clipboard"] if streaming is False, otherwise defaults to ["webcam"].
            type: The format the image is converted before being passed into the prediction function. "numpy" converts the image to a numpy array with shape (height, width, 3) and values from 0 to 255, "pil" converts the image to a PIL image object, "filepath" passes a str path to a temporary file containing the image. If the image is SVG, the `type` is ignored and the filepath of the SVG is returned. To support animated GIFs in input, the `type` should be set to "filepath" or "pil".
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            show_download_button: If True, will display button to download image.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to upload and edit an image; if False, can only be used to display images. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            streaming: If True when used in a `live` interface, will automatically stream webcam feed. Only valid is source is 'webcam'.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            mirror_webcam: If True webcam will be mirrored. Default is True.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            placeholder: Custom text for the upload area. Overrides default upload messages when provided. Accepts new lines and `#` to designate a heading.
            show_fullscreen_button: If True, will show a fullscreen icon in the corner of the component that allows user to view the image in fullscreen mode. If False, icon does not appear.
        """
        self.format = format
        self.mirror_webcam = mirror_webcam
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

    def preprocess(
        self, payload: FileData | None
    ) -> np.ndarray | PIL.Image.Image | str | None:
        """
        Parameters:
            payload: image data in the form of a FileData object
        Returns:
            Passes the uploaded image as a `numpy.array`, `PIL.Image` or `str` filepath depending on `type`. For SVGs, the `type` parameter is ignored and the filepath of the SVG is returned.
        """
        if payload is None:
            return payload
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
            return str(file_path)

        im = PIL.Image.open(file_path)
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

    def postprocess(
        self, value: np.ndarray | PIL.Image.Image | str | Path | None
    ) -> FileData | None:
        """
        Parameters:
            value: Expects a `numpy.array`, `PIL.Image`, or `str` or `pathlib.Path` filepath to an image which is displayed.
        Returns:
            Returns the image as a `FileData` object.
        """
        if value is None:
            return None
        if isinstance(value, str) and value.lower().endswith(".svg"):
            return FileData(path=value, orig_name=Path(value).name)
        saved = image_utils.save_image(value, self.GRADIO_CACHE, self.format)
        orig_name = Path(saved).name if Path(saved).exists() else None
        return FileData(path=saved, orig_name=orig_name)

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
