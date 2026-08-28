"""gr.AnnotatedImage() component."""

from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING, Any, Literal

import gradio_client.utils as client_utils
import numpy as np
import PIL.Image
from gradio_client import handle_file
from gradio_client.documentation import document

from gradio import processing_utils, utils
from gradio.components.base import Component
from gradio.components.button import Button
from gradio.data_classes import FileData, GradioModel
from gradio.events import Events
from gradio.i18n import I18nData
from gradio.utils import set_default_buttons

if TYPE_CHECKING:
    from gradio.components import Timer

PIL.Image.init()  # fixes https://github.com/gradio-app/gradio/issues/2843


class Annotation(GradioModel):
    image: FileData
    label: str


class AnnotatedImageData(GradioModel):
    image: FileData
    annotations: list[Annotation]

from gradio.events import Dependency

@document()
class AnnotatedImage(Component):
    """
    Creates a component to displays a base image and colored annotations on top of that image. Annotations can take the from of rectangles (e.g. object detection) or masks (e.g. image segmentation).
    As this component does not accept user input, it is rarely used as an input component.

    Demos: image_segmentation
    """

    EVENTS = [Events.change, Events.select]

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
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        buttons: list[Literal["fullscreen"] | Button] | None = None,
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
            every: Continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: Relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: Minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            buttons: A list of buttons to show for the component. Valid options in the list are "fullscreen" or a gr.Button() instance. The "fullscreen" button allows the user to view the image in fullscreen mode. Custom gr.Button() instances will appear in the toolbar with their configured icon and/or label, and clicking them will trigger any .click() events registered on the button. By default, the fullscreen button is shown, and this can hidden by providing an empty list.
        """
        self.format = format
        self.show_legend = show_legend
        self.height = height
        self.width = width
        self.color_map = color_map
        self.buttons = set_default_buttons(buttons, ["fullscreen"])
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
            Passes its value as a `tuple` consisting of:
            - `str` filepath to a base image
            - `list` of annotations.
            -- Each annotation itself is a `tuple` of a mask (as a `str` filepath to image) and a `str` label.
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
            value: Expects a tuple consisting of a base image and list of annotations: a `tuple[Image, list[Annotation]]`.
                - The `Image` itself can be `str` filepath, `numpy.ndarray`, or `PIL.Image`.
                - Each `Annotation` is a `tuple[Mask, str]`.
                -- The `Mask` can be either a `tuple` of 4 `int`'s representing the bounding box coordinates (x1, y1, x2, y2), or 0-1 confidence mask in the form of a `numpy.ndarray` of the same shape as the image.
                -- The second element of the `Annotation` tuple is a `str` label.
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
    from typing import Callable, Literal, Sequence, Any, TYPE_CHECKING
    from gradio.blocks import Block
    if TYPE_CHECKING:
        from gradio.components import Timer
        from gradio.components.base import Component


    def change(self,
        fn: Callable[..., Any] | None = None,
        inputs: Block | Sequence[Block] | set[Block] | None = None,
        outputs: Block | Sequence[Block] | None = None,
        api_name: str | None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        show_progress_on: Component | Sequence[Component] | None = None,
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: Timer | float | None = None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
        js: str | Literal[True] | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        api_visibility: Literal["public", "private", "undocumented"] = "public",
        key: int | str | tuple[int | str, ...] | None = None,
        api_description: str | None | Literal[False] = None,
        validator: Callable[..., Any] | None = None,

        ) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: list of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: list of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: defines how the endpoint appears in the API docs. Can be a string or None. If set to a string, the endpoint will be exposed in the API docs with the given name. If None (default), the name of the function will be used as the API endpoint.
            scroll_to_output: if True, will scroll to output component on completion
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            show_progress_on: Component or list of components to show the progress animation on. If None, will show the progress animation on all of the output components.
            queue: if True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: if True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: if False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: if False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: a list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            trigger_mode: if "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
            js: optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            concurrency_limit: if set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
            concurrency_id: if set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            api_visibility: controls the visibility and accessibility of this endpoint. Can be "public" (shown in API docs and callable by clients), "private" (hidden from API docs and not callable by the Gradio client libraries), or "undocumented" (hidden from API docs but callable by clients and via gr.load). If fn is None, api_visibility will automatically be set to "private".
            key: A unique key for this event listener to be used in @gr.render(). If set, this value identifies an event as identical across re-renders when the key is identical.
            api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
            validator: Optional validation function to run before the main function. If provided, this function will be executed first with queue=False, and only if it completes successfully will the main function be called. The validator receives the same inputs as the main function.

        """
        ...

    def select(self,
        fn: Callable[..., Any] | None = None,
        inputs: Block | Sequence[Block] | set[Block] | None = None,
        outputs: Block | Sequence[Block] | None = None,
        api_name: str | None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        show_progress_on: Component | Sequence[Component] | None = None,
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: Timer | float | None = None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
        js: str | Literal[True] | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        api_visibility: Literal["public", "private", "undocumented"] = "public",
        key: int | str | tuple[int | str, ...] | None = None,
        api_description: str | None | Literal[False] = None,
        validator: Callable[..., Any] | None = None,

        ) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: list of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: list of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: defines how the endpoint appears in the API docs. Can be a string or None. If set to a string, the endpoint will be exposed in the API docs with the given name. If None (default), the name of the function will be used as the API endpoint.
            scroll_to_output: if True, will scroll to output component on completion
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            show_progress_on: Component or list of components to show the progress animation on. If None, will show the progress animation on all of the output components.
            queue: if True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: if True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: if False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: if False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: a list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            trigger_mode: if "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
            js: optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            concurrency_limit: if set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
            concurrency_id: if set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            api_visibility: controls the visibility and accessibility of this endpoint. Can be "public" (shown in API docs and callable by clients), "private" (hidden from API docs and not callable by the Gradio client libraries), or "undocumented" (hidden from API docs but callable by clients and via gr.load). If fn is None, api_visibility will automatically be set to "private".
            key: A unique key for this event listener to be used in @gr.render(). If set, this value identifies an event as identical across re-renders when the key is identical.
            api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
            validator: Optional validation function to run before the main function. If provided, this function will be executed first with queue=False, and only if it completes successfully will the main function be called. The validator receives the same inputs as the main function.

        """
        ...