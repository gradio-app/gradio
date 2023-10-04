from __future__ import annotations

from typing import Literal

from gradio_client.documentation import document, set_documentation_group

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta
from gradio.deprecation import warn_deprecation

set_documentation_group("layout")

from gradio.events import Dependency

@document()
class Column(BlockContext, metaclass=ComponentMeta):
    """
    Column is a layout element within Blocks that renders all children vertically. The widths of columns can be set through the `scale` and `min_width` parameters.
    If a certain scale results in a column narrower than min_width, the min_width parameter will win.
    Example:
        with gr.Blocks() as demo:
            with gr.Row():
                with gr.Column(scale=1):
                    text1 = gr.Textbox()
                    text2 = gr.Textbox()
                with gr.Column(scale=4):
                    btn1 = gr.Button("Button 1")
                    btn2 = gr.Button("Button 2")
    Guides: controlling-layout
    """

    EVENTS = ["baz"]

    def __init__(
        self,
        *,
        scale: int = 1,
        min_width: int = 320,
        variant: Literal["default", "panel", "compact"] = "default",
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            scale: relative width compared to adjacent Columns. For example, if Column A has scale=2, and Column B has scale=1, A will be twice as wide as B.
            min_width: minimum pixel width of Column, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in a column narrower than min_width, the min_width parameter will be respected first.
            variant: column type, 'default' (no background), 'panel' (gray background color and rounded corners), or 'compact' (rounded corners and no internal gap).
            visible: If False, column will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        if scale != round(scale):
            warn_deprecation(
                f"'scale' value should be an integer. Using {scale} will cause issues."
            )

        self.scale = scale
        self.min_width = min_width
        self.variant = variant
        if variant == "compact":
            self.allow_expected_parents = False
        BlockContext.__init__(
            self, visible=visible, elem_id=elem_id, elem_classes=elem_classes, **kwargs
        )

    @staticmethod
    def update(
        variant: str | None = None,
        visible: bool | None = None,
    ):
        return {
            "variant": variant,
            "visible": visible,
            "__type__": "update",
        }

    
    def baz(self,
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