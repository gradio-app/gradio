"""gr.AnnotatedImage() component."""

from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING, Any

import gradio_client.utils as client_utils
import numpy as np
import PIL.Image
from gradio_client import handle_file
from gradio_client.documentation import document

from gradio import processing_utils, utils
from gradio.components.base import Component
from gradio.data_classes import FileData, GradioModel
from gradio.events import Events
from gradio.i18n import I18nData

if TYPE_CHECKING:
    from gradio.components import Timer

PIL.Image.init()  # fixes https://github.com/gradio-app/gradio/issues/2843


class Annotation(GradioModel):
    image: FileData
    label: str


class AnnotatedImageData(GradioModel):
    image: FileData
    annotations: list[Annotation]


@document()
class AnnotatedImage(Component):
    """
    Creates a component to displays a base image and colored annotations on top of that image. Annotations can take the from of rectangles (e.g. object detection) or masks (e.g. image segmentation).
    As this component does not accept user input, it is rarely used as an input component.

    Demos: image_segmentation
    """

    EVENTS = [Events.select]

    data_model = AnnotatedImageData

    def __init__(
        self,
        value: (
            tuple[
                np.ndarray | PIL.Image.Image | str,
                list[tuple[np.ndarray | tuple[int, int, int, int], str]],
            ]
            | None
        ) = None,
        *,
        format: str = "webp",
        show_legend: bool = True,
        height: int | str | None = None,
        width: int | str | None = None,
        color_map: dict[str, str] | None = None,
        label: str | I18nData | None = None,
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
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        show_fullscreen_button: bool = True,
    ):
        """
        Parameters:
            value: Tuple of base image and list of (annotation, label) pairs.
            format: Format used to save images before it is returned to the front end, such as 'jpeg' or 'png'. This parameter only takes effect when the base image is returned from the prediction function as a numpy array or a PIL Image. The format should be supported by the PIL library.
            show_legend: If True, will show a legend of the annotations.
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed image file or numpy array, but will affect the displayed image.
            width: The width of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed image file or numpy array, but will affect the displayed image.
            color_map: A dictionary mapping labels to colors. The colors must be specified as hex codes.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: Relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: Minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            show_fullscreen_button: If True, will show a button to allow the image to be viewed in fullscreen mode.
        """
        self.format = format
        self.show_legend = show_legend
        self.height = height
        self.width = width
        self.color_map = color_map
        self.show_fullscreen_button = show_fullscreen_button
        self._value_description = "a tuple of type [image: str, annotations: list[tuple[mask: str, label: str]]] where 'image' is the path to the base image and 'annotations' is a list of tuples where each tuple has a 'mask' image filepath and a corresponding label."
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
            preserved_by_key=preserved_by_key,
            value=value,
        )

    def preprocess(
        self, payload: AnnotatedImageData | None
    ) -> tuple[str, list[tuple[str, str]]] | None:
        """
        Parameters:
            payload: Dict of base image and list of annotations.
        Returns:
            Passes its value as a `tuple` consisting of a `str` filepath to a base image and `list` of annotations. Each annotation itself is `tuple` of a mask (as a `str` filepath to image) and a `str` label.
        """
        if payload is None:
            return None
        base_img = payload.image.path
        annotations = [(a.image.path, a.label) for a in payload.annotations]
        return (base_img, annotations)

    def postprocess(
        self,
        value: (
            tuple[
                np.ndarray | PIL.Image.Image | str,
                Sequence[tuple[np.ndarray | tuple[int, int, int, int], str]],
            ]
            | None
        ),
    ) -> AnnotatedImageData | None:
        """
        Parameters:
            value: Expects a a tuple of a base image and list of annotations: a `tuple[Image, list[Annotation]]`. The `Image` itself can be `str` filepath, `numpy.ndarray`, or `PIL.Image`. Each `Annotation` is a `tuple[Mask, str]`. The `Mask` can be either a `tuple` of 4 `int`'s representing the bounding box coordinates (x1, y1, x2, y2), or 0-1 confidence mask in the form of a `numpy.ndarray` of the same shape as the image, while the second element of the `Annotation` tuple is a `str` label.
        Returns:
            Tuple of base image file and list of annotations, with each annotation a two-part tuple where the first element image path of the mask, and the second element is the label.
        """
        if value is None:
            return None
        base_img = value[0]
        if isinstance(base_img, str):
            if client_utils.is_http_url_like(base_img):
                base_img = processing_utils.save_url_to_cache(
                    base_img, cache_dir=self.GRADIO_CACHE
                )
            base_img_path = base_img
            base_img = np.array(PIL.Image.open(base_img))
        elif isinstance(base_img, np.ndarray):
            base_file = processing_utils.save_img_array_to_cache(
                base_img, cache_dir=self.GRADIO_CACHE, format=self.format
            )
            base_img_path = str(utils.abspath(base_file))
        elif isinstance(base_img, PIL.Image.Image):
            base_file = processing_utils.save_pil_to_cache(
                base_img, cache_dir=self.GRADIO_CACHE, format=self.format
            )
            base_img_path = str(utils.abspath(base_file))
            base_img = np.array(base_img)
        else:
            raise ValueError(
                "AnnotatedImage only accepts filepaths, PIL images or numpy arrays for the base image."
            )

        sections = []
        color_map = self.color_map or {}

        def hex_to_rgb(value):
            value = value.lstrip("#")
            lv = len(value)
            return [int(value[i : i + lv // 3], 16) for i in range(0, lv, lv // 3)]

        for mask, label in value[1]:
            mask_array = np.zeros((base_img.shape[0], base_img.shape[1]))
            if isinstance(mask, np.ndarray):
                mask_array = mask
            else:
                x1, y1, x2, y2 = mask
                border_width = 3
                mask_array[y1:y2, x1:x2] = 0.5
                mask_array[y1:y2, x1 : x1 + border_width] = 1
                mask_array[y1:y2, x2 - border_width : x2] = 1
                mask_array[y1 : y1 + border_width, x1:x2] = 1
                mask_array[y2 - border_width : y2, x1:x2] = 1

            if label in color_map:
                rgb_color = hex_to_rgb(color_map[label])
            else:
                rgb_color = [255, 0, 0]
            colored_mask = np.zeros((base_img.shape[0], base_img.shape[1], 4))
            solid_mask = np.copy(mask_array)
            solid_mask[solid_mask > 0] = 1

            colored_mask[:, :, 0] = rgb_color[0] * solid_mask
            colored_mask[:, :, 1] = rgb_color[1] * solid_mask
            colored_mask[:, :, 2] = rgb_color[2] * solid_mask
            colored_mask[:, :, 3] = mask_array * 255

            colored_mask_img = PIL.Image.fromarray((colored_mask).astype(np.uint8))

            # RGBA does not support transparency
            mask_file = processing_utils.save_pil_to_cache(
                colored_mask_img, cache_dir=self.GRADIO_CACHE, format="png"
            )
            mask_file_path = str(utils.abspath(mask_file))
            sections.append(
                Annotation(image=FileData(path=mask_file_path), label=label)
            )

        return AnnotatedImageData(
            image=FileData(path=base_img_path),
            annotations=sections,
        )

    def example_payload(self) -> Any:
        return {
            "image": handle_file(
                "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
            ),
            "annotations": [],
        }

    def example_value(self) -> Any:
        return (
            "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
            [([0, 0, 100, 100], "bus")],
        )
