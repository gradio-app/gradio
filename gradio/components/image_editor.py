r"""gr.ImageEditor() component."""

from __future__ import annotations

import dataclasses
import warnings
from collections.abc import Iterable, Sequence
from io import BytesIO
from pathlib import Path
from typing import (
    TYPE_CHECKING,
    Any,
    Literal,
    Optional,
    Union,
    cast,
)

import numpy as np
import PIL.Image
from gradio_client import handle_file
from gradio_client.documentation import document
from typing_extensions import TypedDict

from gradio import image_utils, utils
from gradio.components.base import Component, server
from gradio.data_classes import FileData, GradioModel
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer

ImageType = Union[np.ndarray, PIL.Image.Image, str]


class EditorValue(TypedDict):
    background: Optional[ImageType]
    layers: list[ImageType]
    composite: Optional[ImageType]


class EditorExampleValue(TypedDict):
    background: Optional[str]
    layers: Optional[list[Union[str, None]]]
    composite: Optional[str]


class EditorData(GradioModel):
    background: Optional[FileData] = None
    layers: list[FileData] = []
    composite: Optional[FileData] = None
    id: Optional[str] = None


class EditorDataBlobs(GradioModel):
    background: Optional[bytes]
    layers: list[Union[bytes, None]]
    composite: Optional[bytes]


class BlobData(TypedDict):
    type: str
    index: Optional[int]
    file: bytes
    id: str


class AcceptBlobs(GradioModel):
    data: BlobData
    files: list[tuple[str, bytes]]


@document()
@dataclasses.dataclass
class Eraser:
    """
    A dataclass for specifying options for the eraser tool in the ImageEditor component. An instance of this class can be passed to the `eraser` parameter of `gr.ImageEditor`.
    Parameters:
        default_size: The default radius, in pixels, of the eraser tool. Defaults to "auto" in which case the radius is automatically determined based on the size of the image (generally 1/50th of smaller dimension).
    """

    default_size: int | Literal["auto"] = "auto"


@document()
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

    colors: list[str | tuple[str, float]] | str | tuple[str, float] | None = None
    default_color: str | tuple[str, float] | None = None
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
@dataclasses.dataclass
class LayerOptions:
    """
    A dataclass for specifying options for the layer tool in the ImageEditor component. An instance of this class can be passed to the `layers` parameter of `gr.ImageEditor`.
    Parameters:
        allow_additional_layers: If True, users can add additional layers to the image. If False, the add layer button will not be shown.
        layers: A list of layers to make available to the user when using the layer tool. One layer must be provided, if the length of the list is 0 then a layer will be generated automatically.
    """

    allow_additional_layers: bool = True
    layers: list[str] | None = None
    disabled: bool = False

    def __post_init__(self):
        if self.layers is None or len(self.layers) == 0:
            self.layers = ["Layer 1"]


@document()
@dataclasses.dataclass
class WebcamOptions:
    """
    A dataclass for specifying options for the webcam tool in the ImageEditor component. An instance of this class can be passed to the `webcam_options` parameter of `gr.ImageEditor`.
    Parameters:
        mirror: If True, the webcam will be mirrored.
        constraints: A dictionary of constraints for the webcam.
    """

    mirror: bool = True
    constraints: dict[str, Any] | None = None


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
        Events.input,
        Events.select,
        Events.upload,
        Events.apply,
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
        sources: (
            Iterable[Literal["upload", "webcam", "clipboard"]]
            | Literal["upload", "webcam", "clipboard"]
            | None
        ) = (
            "upload",
            "webcam",
            "clipboard",
        ),
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
        placeholder: str | None = None,
        mirror_webcam: bool | None = None,
        show_share_button: bool | None = None,
        _selectable: bool = False,
        crop_size: tuple[int | float, int | float] | str | None = None,
        transforms: Iterable[Literal["crop", "resize"]] | None = ("crop", "resize"),
        eraser: Eraser | None | Literal[False] = None,
        brush: Brush | None | Literal[False] = None,
        format: str = "webp",
        layers: bool | LayerOptions = True,
        canvas_size: tuple[int, int] = (800, 800),
        fixed_canvas: bool = False,
        show_fullscreen_button: bool = True,
        webcam_options: WebcamOptions | None = None,
    ):
        """
        Parameters:
            value: Optional initial image(s) to populate the image editor. Should be a dictionary with keys: `background`, `layers`, and `composite`. The values corresponding to `background` and `composite` should be images or None, while `layers` should be a list of images. Images can be of type PIL.Image, np.array, or str filepath/URL. Or, the value can be a callable, in which case the function will be called whenever the app loads to set the initial value of the component.
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed image files or numpy arrays, but will affect the displayed images. Beware of conflicting values with the canvas_size paramter. If the canvas_size is larger than the height, the editing canvas will not fit in the component.
            width: The width of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed image files or numpy arrays, but will affect the displayed images. Beware of conflicting values with the canvas_size paramter. If the canvas_size is larger than the height, the editing canvas will not fit in the component.
            image_mode: "RGB" if color, or "L" if black and white. See https://pillow.readthedocs.io/en/stable/handbook/concepts.html for other supported image modes and their meaning.
            sources: List of sources that can be used to set the background image. "upload" creates a box where user can drop an image file, "webcam" allows user to take snapshot from their webcam, "clipboard" allows users to paste an image from the clipboard.
            type: The format the images are converted to before being passed into the prediction function. "numpy" converts the images to numpy arrays with shape (height, width, 3) and values from 0 to 255, "pil" converts the images to PIL image objects, "filepath" passes images as str filepaths to temporary copies of the images.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
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
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            placeholder: Custom text for the upload area. Overrides default upload messages when provided. Accepts new lines and `#` to designate a heading.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            crop_size: Deprecated. Used to set the `canvas_size` parameter.
            transforms: The transforms tools to make available to users. "crop" allows the user to crop the image.
            eraser: The options for the eraser tool in the image editor. Should be an instance of the `gr.Eraser` class, or None to use the default settings. Can also be False to hide the eraser tool. [See `gr.Eraser` docs](#eraser).
            brush: The options for the brush tool in the image editor. Should be an instance of the `gr.Brush` class, or None to use the default settings. Can also be False to hide the brush tool, which will also hide the eraser tool. [See `gr.Brush` docs](#brush).
            format: Format to save image if it does not already have a valid format (e.g. if the image is being returned to the frontend as a numpy array or PIL Image).  The format should be supported by the PIL library. This parameter has no effect on SVG files.
            layers: The options for the layer tool in the image editor. Can be a boolean     or an instance of the `gr.LayerOptions` class. If True, will allow users to add layers to the image. If False, the layers option will be hidden. If an instance of `gr.LayerOptions`, it will be used to configure the layer tool. [See `gr.LayerOptions` docs](#layer-options).
            canvas_size: The initial size of the canvas in pixels. The first value is the width and the second value is the height. If `fixed_canvas` is `True`, uploaded images will be rescaled to fit the canvas size while preserving the aspect ratio. Otherwise, the canvas size will change to match the size of an uploaded image.
            fixed_canvas: If True, the canvas size will not change based on the size of the background image and the image will be rescaled to fit (while preserving the aspect ratio) and placed in the center of the canvas.
            show_fullscreen_button: If True, will display button to view image in fullscreen mode.
            webcam_options: The options for the webcam tool in the image editor. Can be an instance of the `gr.WebcamOptions` class, or None to use the default settings. [See `gr.WebcamOptions` docs](#webcam-options).
        """
        self._selectable = _selectable

        self.webcam_options = (
            webcam_options if webcam_options is not None else WebcamOptions()
        )

        if mirror_webcam is not None:
            warnings.warn(
                "The `mirror_webcam` parameter is deprecated. Please use the `webcam_options` parameter with a `gr.WebcamOptions` instance instead."
            )
            self.webcam_options.mirror = mirror_webcam

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
            sources = [sources]
        if sources is not None:
            for source in sources:
                if source not in valid_sources:
                    raise ValueError(
                        f"`sources` must be a list consisting of elements in {valid_sources}"
                    )
            self.sources = sources
        else:
            self.sources = []

        self.show_download_button = show_download_button

        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )

        if crop_size is not None and canvas_size is None:
            warnings.warn(
                "`crop_size` parameter is deprecated. Please use `canvas_size` instead."
            )
            if isinstance(crop_size, str):
                # convert ratio to tuple
                proportion = [
                    int(crop_size.split(":")[0]),
                    int(crop_size.split(":")[1]),
                ]
                ratio = proportion[0] / proportion[1]
                canvas_size = (
                    (int(800 * ratio), 800) if ratio > 1 else (800, int(800 / ratio))
                )
            else:
                canvas_size = (int(crop_size[0]), int(crop_size[1]))

        self.transforms = transforms
        self.eraser = Eraser() if eraser is None else eraser
        self.brush = Brush() if brush is None else brush
        self.blob_storage: dict[str, EditorDataBlobs] = {}
        self.format = format
        self.layers = (
            LayerOptions()
            if layers is True
            else LayerOptions(disabled=True)
            if layers is False
            else layers
        )
        self.canvas_size = canvas_size
        self.fixed_canvas = fixed_canvas
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
        self._value_description = f"a dictionary with structure {{'background': image, 'layers': list of images, 'composite': image}} where each image is {'a filepath' if self.type == 'filepath' else 'a numpy array' if self.type == 'numpy' else 'a PIL Image object'}."

    def convert_and_format_image(
        self,
        file: FileData | None | bytes,
    ) -> np.ndarray | PIL.Image.Image | str | None:
        if file is None:
            return None
        im = (
            PIL.Image.open(file.path)
            if isinstance(file, FileData)
            else PIL.Image.open(BytesIO(file))
        )
        if isinstance(file, (bytes, bytearray, memoryview)):
            name = "image"
            suffix = self.format
        elif file.orig_name:
            p = Path(file.orig_name)
            name = p.stem
            suffix = p.suffix.replace(".", "")
            if suffix in ["jpg", "jpeg"]:
                suffix = "jpeg"
        else:
            name = "image"
            suffix = self.format
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            im = im.convert(self.image_mode)
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
        _payload = payload

        if payload is not None and payload.id is not None:
            cached = self.blob_storage.get(payload.id)
            _payload = (
                EditorDataBlobs(
                    background=cached.background,
                    layers=cached.layers,
                    composite=cached.composite,
                )
                if cached
                else None
            )

        elif _payload is None:
            return _payload
        else:
            _payload = payload

        bg = None
        layers = None
        composite = None

        if _payload is not None:
            bg = self.convert_and_format_image(_payload.background)
            layers = (
                [self.convert_and_format_image(layer) for layer in _payload.layers]
                if _payload.layers
                else None
            )
            composite = self.convert_and_format_image(_payload.composite)

        if payload is not None and payload.id is not None:
            self.blob_storage.pop(payload.id)

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
                        format=self.format,
                    )
                )
                for layer in value["layers"]
            ]
            if value["layers"]
            else []
        )

        return EditorData(
            background=(
                FileData(
                    path=image_utils.save_image(
                        value["background"], self.GRADIO_CACHE, format=self.format
                    )
                )
                if value["background"] is not None
                else None
            ),
            layers=layers,
            composite=(
                FileData(
                    path=image_utils.save_image(
                        cast(
                            Union[np.ndarray, PIL.Image.Image, str], value["composite"]
                        ),
                        self.GRADIO_CACHE,
                        format=self.format,
                    )
                )
                if value["composite"] is not None
                else None
            ),
        )

    def example_payload(self) -> Any:
        return {
            "background": handle_file(
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

    @server
    def accept_blobs(self, data: AcceptBlobs):
        """
        Accepts a dictionary of image blobs, where the keys are 'background', 'layers', and 'composite', and the values are binary file-like objects.
        """

        type = data.data["type"]
        index = (
            int(data.data["index"])
            if data.data["index"] and data.data["index"] != "null"
            else None
        )
        file = data.files[0][1]
        id = data.data["id"]

        current = self.blob_storage.get(
            id, EditorDataBlobs(background=None, layers=[], composite=None)
        )

        if type == "layer" and index is not None:
            if index >= len(current.layers):
                current.layers.extend([None] * (index + 1 - len(current.layers)))
            current.layers[index] = file
        elif type == "background":
            current.background = file
        elif type == "composite":
            current.composite = file

        self.blob_storage[id] = current
