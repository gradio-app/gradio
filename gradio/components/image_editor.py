r"""gr.ImageEditor() component."""

from __future__ import annotations

import dataclasses
import warnings
from pathlib import Path
from typing import Any, Iterable, List, Literal, Optional, TypedDict, Union, cast

import numpy as np
import PIL.Image
from gradio_client import file
from gradio_client.documentation import document

from gradio import image_utils, utils
from gradio.components.base import Component
from gradio.data_classes import FileData, GradioModel
from gradio.events import Events

ImageType = Union[np.ndarray, PIL.Image.Image, str]


class EditorValue(TypedDict):
    background: Optional[ImageType]
    layers: list[ImageType]
    composite: Optional[ImageType]


class EditorExampleValue(TypedDict):
    background: Optional[str]
    layers: Optional[list[str | None]]
    composite: Optional[str]


class EditorData(GradioModel):
    background: Optional[FileData] = None
    layers: List[FileData] = []
    composite: Optional[FileData] = None


@dataclasses.dataclass
class Eraser:
    """
    A dataclass for specifying options for the eraser tool in the ImageEditor component. An instance of this class can be passed to the `eraser` parameter of `gr.ImageEditor`.
    Parameters:
        default_size: The default radius, in pixels, of the eraser tool. Defaults to "auto" in which case the radius is automatically determined based on the size of the image (generally 1/50th of smaller dimension).
    """

    default_size: int | Literal["auto"] = "auto"


@dataclasses.dataclass
class Brush(Eraser):
    """
    A dataclass for specifying options for the brush tool in the ImageEditor component. An instance of this class can be passed to the `brush` parameter of `gr.ImageEditor`.
    Parameters:
        default_size: The default radius, in pixels, of the brush tool. Defaults to "auto" in which case the radius is automatically determined based on the size of the image (generally 1/50th of smaller dimension).
        colors: A list of colors to make available to the user when using the brush. Defaults to a list of 5 colors.
        default_color: The default color of the brush. Defaults to the first color in the `colors` list.
        color_mode: If set to "fixed", user can only select from among the colors in `colors`. If "defaults", the colors in `colors` are provided as a default palette, but the user can also select any color using a color picker.
    """

    colors: Union[
        list[str],
        str,
        None,
    ] = None
    default_color: Union[str, Literal["auto"]] = "auto"
    color_mode: Literal["fixed", "defaults"] = "defaults"

    def __post_init__(self):
        if self.colors is None:
            self.colors = [
                "rgb(204, 50, 50)",
                "rgb(173, 204, 50)",
                "rgb(50, 204, 112)",
                "rgb(50, 112, 204)",
                "rgb(173, 50, 204)",
            ]
        if self.default_color is None:
            self.default_color = (
                self.colors[0] if isinstance(self.colors, list) else self.colors
            )


@document()
class ImageEditor(Component):
    """
    Creates an image component that, as an input, can be used to upload and edit images using simple editing tools such
    as brushes, strokes, cropping, and layers. Or, as an output, this component can be used to display images.

    Demos: image_editor
    """

    EVENTS = [
        Events.clear,
        Events.change,
        Events.select,
        Events.upload,
    ]
    data_model = EditorData

    def __init__(
        self,
        value: EditorValue | ImageType | None = None,
        *,
        height: int | str | None = None,
        width: int | str | None = None,
        image_mode: Literal[
            "1", "L", "P", "RGB", "RGBA", "CMYK", "YCbCr", "LAB", "HSV", "I", "F"
        ] = "RGBA",
        sources: Iterable[Literal["upload", "webcam", "clipboard"]] = (
            "upload",
            "webcam",
            "clipboard",
        ),
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
        render: bool = True,
        mirror_webcam: bool = True,
        show_share_button: bool | None = None,
        _selectable: bool = False,
        crop_size: tuple[int | float, int | float] | str | None = None,
        transforms: Iterable[Literal["crop"]] = ("crop",),
        eraser: Eraser | None | Literal[False] = None,
        brush: Brush | None | Literal[False] = None,
    ):
        """
        Parameters:
            value: Optional initial image(s) to populate the image editor. Should be a dictionary with keys: `background`, `layers`, and `composite`. The values corresponding to `background` and `composite` should be images or None, while `layers` should be a list of images. Images can be of type PIL.Image, np.array, or str filepath/URL. Or, the value can be a callable, in which case the function will be called whenever the app loads to set the initial value of the component.
            height: The height of the displayed images, specified in pixels if a number is passed, or in CSS units if a string is passed.
            width: The width of the displayed images, specified in pixels if a number is passed, or in CSS units if a string is passed.
            image_mode: "RGB" if color, or "L" if black and white. See https://pillow.readthedocs.io/en/stable/handbook/concepts.html for other supported image modes and their meaning.
            sources: List of sources that can be used to set the background image. "upload" creates a box where user can drop an image file, "webcam" allows user to take snapshot from their webcam, "clipboard" allows users to paste an image from the clipboard.
            type: The format the images are converted to before being passed into the prediction function. "numpy" converts the images to numpy arrays with shape (height, width, 3) and values from 0 to 255, "pil" converts the images to PIL image objects, "filepath" passes images as str filepaths to temporary copies of the images.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            show_download_button: If True, will display button to download image.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to upload and edit an image; if False, can only be used to display images. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            mirror_webcam: If True webcam will be mirrored. Default is True.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            crop_size: The size of the crop box in pixels. If a tuple, the first value is the width and the second value is the height. If a string, the value must be a ratio in the form `width:height` (e.g. "16:9").
            transforms: The transforms tools to make available to users. "crop" allows the user to crop the image.
            eraser: The options for the eraser tool in the image editor. Should be an instance of the `gr.Eraser` class, or None to use the default settings. Can also be False to hide the eraser tool.
            brush: The options for the brush tool in the image editor. Should be an instance of the `gr.Brush` class, or None to use the default settings. Can also be False to hide the brush tool, which will also hide the eraser tool.
        """
        self._selectable = _selectable
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
        if isinstance(sources, str):
            sources = [sources]  # type: ignore
        for source in sources:
            if source not in valid_sources:
                raise ValueError(
                    f"`sources` must be a list consisting of elements in {valid_sources}"
                )
        self.sources = sources

        self.show_download_button = show_download_button

        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )

        self.crop_size = crop_size
        self.transforms = transforms
        self.eraser = Eraser() if eraser is None else eraser
        self.brush = Brush() if brush is None else brush

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
            render=render,
            value=value,
        )

    def convert_and_format_image(
        self,
        file: FileData | None,
    ) -> np.ndarray | PIL.Image.Image | str | None:
        if file is None:
            return None
        im = PIL.Image.open(file.path)
        if file.orig_name:
            p = Path(file.orig_name)
            name = p.stem
            suffix = p.suffix.replace(".", "")
            if suffix in ["jpg", "jpeg"]:
                suffix = "jpeg"
        else:
            name = "image"
            suffix = "png"
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            im = im.convert(self.image_mode)
        if self.crop_size and not isinstance(self.crop_size, str):
            im = image_utils.crop_scale(
                im, int(self.crop_size[0]), int(self.crop_size[1])
            )
        return image_utils.format_image(
            im,
            cast(Literal["numpy", "pil", "filepath"], self.type),
            self.GRADIO_CACHE,
            format=suffix,
            name=name,
        )

    def preprocess(self, payload: EditorData | None) -> EditorValue | None:
        """
        Parameters:
            payload: An instance of `EditorData` consisting of the background image, layers, and composite image.
        Returns:
            Passes the uploaded images as an instance of EditorValue, which is just a `dict` with keys: 'background', 'layers', and 'composite'. The values corresponding to 'background' and 'composite' are images, while 'layers' is a `list` of images. The images are of type `PIL.Image`, `np.array`, or `str` filepath, depending on the `type` parameter.
        """
        if payload is None:
            return payload

        bg = self.convert_and_format_image(payload.background)
        layers = (
            [self.convert_and_format_image(layer) for layer in payload.layers]
            if payload.layers
            else None
        )
        composite = self.convert_and_format_image(payload.composite)
        return {
            "background": bg,
            "layers": [x for x in layers if x is not None] if layers else [],
            "composite": composite,
        }

    def postprocess(self, value: EditorValue | ImageType | None) -> EditorData | None:
        """
        Parameters:
            value: Expects a EditorValue, which is just a dictionary with keys: 'background', 'layers', and 'composite'. The values corresponding to 'background' and 'composite' should be images or None, while `layers` should be a list of images. Images can be of type `PIL.Image`, `np.array`, or `str` filepath/URL. Or, the value can be simply a single image (`ImageType`), in which case it will be used as the background.
        Returns:
            An instance of `EditorData` consisting of the background image, layers, and composite image.
        """
        if value is None:
            return None
        elif isinstance(value, dict):
            pass
        elif isinstance(value, (np.ndarray, PIL.Image.Image, str)):
            value = {"background": value, "layers": [], "composite": value}
        else:
            raise ValueError(
                "The value to `gr.ImageEditor` must be a dictionary of images or a single image."
            )

        layers = (
            [
                FileData(
                    path=image_utils.save_image(
                        cast(Union[np.ndarray, PIL.Image.Image, str], layer),
                        self.GRADIO_CACHE,
                        format="png",
                    )
                )
                for layer in value["layers"]
            ]
            if value["layers"]
            else []
        )

        return EditorData(
            background=FileData(
                path=image_utils.save_image(value["background"], self.GRADIO_CACHE)
            )
            if value["background"] is not None
            else None,
            layers=layers,
            composite=FileData(
                path=image_utils.save_image(
                    cast(Union[np.ndarray, PIL.Image.Image, str], value["composite"]),
                    self.GRADIO_CACHE,
                )
            )
            if value["composite"] is not None
            else None,
        )

    def example_payload(self) -> Any:
        return {
            "background": file(
                "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
            ),
            "layers": [],
            "composite": None,
        }

    def example_value(self) -> Any:
        return {
            "background": "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
            "layers": [],
            "composite": None,
        }
