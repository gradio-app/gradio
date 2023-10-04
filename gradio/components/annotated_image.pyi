"""gr.AnnotatedImage() component."""

from __future__ import annotations

import warnings
from typing import Any, List, Literal

import numpy as np
from gradio_client.documentation import document, set_documentation_group
from PIL import Image as _Image  # using _ to minimize namespace pollution

from gradio import utils
from gradio.components.base import Component, _Keywords
from gradio.data_classes import FileData, GradioModel
from gradio.events import Events

set_documentation_group("component")

_Image.init()  # fixes https://github.com/gradio-app/gradio/issues/2843


class Annotation(GradioModel):
    image: FileData
    label: str


class AnnotatedImageData(GradioModel):
    image: FileData
    annotations: List[Annotation]

from gradio.events import Dependency

@document()
class AnnotatedImage(Component):
    """
    Displays a base image and colored subsections on top of that image. Subsections can take the from of rectangles (e.g. object detection) or masks (e.g. image segmentation).
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {Tuple[numpy.ndarray | PIL.Image | str, List[Tuple[numpy.ndarray | Tuple[int, int, int, int], str]]]} consisting of a base image and a list of subsections, that are either (x1, y1, x2, y2) tuples identifying object boundaries, or 0-1 confidence masks of the same shape as the image. A label is provided for each subsection.

    Demos: image_segmentation
    """

    EVENTS = [Events.select]

    data_model = AnnotatedImageData

    def __init__(
        self,
        value: tuple[
            np.ndarray | _Image.Image | str,
            list[tuple[np.ndarray | tuple[int, int, int, int], str]],
        ]
        | None = None,
        *,
        show_legend: bool = True,
        height: int | None = None,
        width: int | None = None,
        color_map: dict[str, str] | None = None,
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Tuple of base image and list of (subsection, label) pairs.
            show_legend: If True, will show a legend of the subsections.
            height: Height of the displayed image.
            width: Width of the displayed image.
            color_map: A dictionary mapping labels to colors. The colors must be specified as hex codes.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.show_legend = show_legend
        self.height = height
        self.width = width
        self.color_map = color_map
        super().__init__(
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
        value: tuple[
            np.ndarray | _Image.Image | str,
            list[tuple[np.ndarray | tuple[int, int, int, int], str]],
        ]
        | Literal[_Keywords.NO_VALUE] = _Keywords.NO_VALUE,
        show_legend: bool | None = None,
        height: int | None = None,
        width: int | None = None,
        color_map: dict[str, str] | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        visible: bool | None = None,
    ):
        warnings.warn(
            "Using the update method is deprecated. Simply return a new object instead, e.g. `return gr.AnnotatedImage(...)` instead of `return gr.AnnotatedImage.update(...)`."
        )
        updated_config = {
            "show_legend": show_legend,
            "height": height,
            "width": width,
            "color_map": color_map,
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def postprocess(
        self,
        y: tuple[
            np.ndarray | _Image.Image | str,
            list[tuple[np.ndarray | tuple[int, int, int, int], str]],
        ],
    ) -> AnnotatedImageData | None:
        """
        Parameters:
            y: Tuple of base image and list of subsections, with each subsection a two-part tuple where the first element is a 4 element bounding box or a 0-1 confidence mask, and the second element is the label.
        Returns:
            Tuple of base image file and list of subsections, with each subsection a two-part tuple where the first element image path of the mask, and the second element is the label.
        """
        if y is None:
            return None
        base_img = y[0]
        if isinstance(base_img, str):
            base_img_path = base_img
            base_img = np.array(_Image.open(base_img))
        elif isinstance(base_img, np.ndarray):
            base_file = processing_utils.save_img_array_to_cache(
                base_img, cache_dir=self.GRADIO_CACHE
            )
            base_img_path = str(utils.abspath(base_file))
        elif isinstance(base_img, _Image.Image):
            base_file = processing_utils.save_pil_to_cache(
                base_img, cache_dir=self.GRADIO_CACHE
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

        for mask, label in y[1]:
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

            colored_mask_img = _Image.fromarray((colored_mask).astype(np.uint8))

            mask_file = processing_utils.save_pil_to_cache(
                colored_mask_img, cache_dir=self.GRADIO_CACHE
            )
            mask_file_path = str(utils.abspath(mask_file))
            sections.append(
                Annotation(
                    image=FileData(name=mask_file_path, is_file=True), label=label
                )
            )

        return AnnotatedImageData(
            image=FileData(name=base_img_path, data=None, is_file=True),
            annotations=sections,
        )

    def example_inputs(self) -> Any:
        return {}

    def preprocess(self, x: Any) -> Any:
        return x

    
    def select(self,
        fn: Callable | None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        outputs: Component | Sequence[Component] | None = None,
        api_name: str | None | Literal[False] = None,
        status_tracker: None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: float | None = None,
        _js: str | None = None,) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: Defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, the endpoint will be exposed in the api docs as an unnamed endpoint, although this behavior will be changed in Gradio 4.0. If set to a string, the endpoint will be exposed in the api docs with the given name.
            status_tracker: Deprecated and has no effect.
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: Run this event 'every' number of seconds while the client connection is open. Interpreted in seconds. Queue must be enabled.
        """
        ...