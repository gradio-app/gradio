"""gr.Markdown() component."""

from __future__ import annotations

import inspect
import warnings
from typing import Any, Callable, Literal

from gradio_client.documentation import document, set_documentation_group

from gradio.components.base import Component, _Keywords
from gradio.events import Events

set_documentation_group("component")

from gradio.events import Dependency

@document()
class Markdown(Component):
    """
    Used to render arbitrary Markdown output. Can also render latex enclosed by dollar signs.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a valid {str} that can be rendered as Markdown.

    Demos: blocks_hello, blocks_kinematics
    Guides: key-features
    """

    EVENTS = [Events.change]

    def __init__(
        self,
        value: str | Callable = "",
        *,
        rtl: bool = False,
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        sanitize_html: bool = True,
        **kwargs,
    ):
        """
        Parameters:
            value: Value to show in Markdown component. If callable, the function will be called whenever the app loads to set the initial value of the component.
            rtl: If True, sets the direction of the rendered text to right-to-left. Default is False, which renders text left-to-right.
            latex_delimiters: A list of dicts of the form {"left": open delimiter (str), "right": close delimiter (str), "display": whether to display in newline (bool)} that will be used to render LaTeX expressions. If not provided, `latex_delimiters` is set to `[{ "left": "$", "right": "$", "display": False }]`, so only expressions enclosed in $ delimiters will be rendered as LaTeX, and in the same line. Pass in an empty list to disable LaTeX rendering. For more information, see the [KaTeX documentation](https://katex.org/docs/autorender.html).
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            sanitize_html: If False, will disable HTML sanitization when converted from markdown. This is not recommended, as it can lead to security vulnerabilities.
        """
        self.rtl = rtl
        self.latex_delimiters = latex_delimiters
        self.sanitize_html = sanitize_html

        super().__init__(
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )

    def postprocess(self, y: str | None) -> str | None:
        """
        Parameters:
            y: markdown representation
        Returns:
            HTML rendering of markdown
        """
        if y is None:
            return None
        unindented_y = inspect.cleandoc(y)
        return unindented_y

    @staticmethod
    def update(
        value: Any | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        visible: bool | None = None,
        rtl: bool | None = None,
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        sanitize_html: bool | None = None,
    ):
        warnings.warn(
            "Using the update method is deprecated. Simply return a new object instead, e.g. `return gr.Markdown(...)` instead of `return gr.Markdown.update(...)`."
        )
        updated_config = {
            "visible": visible,
            "value": value,
            "rtl": rtl,
            "latex_delimiters": latex_delimiters,
            "sanitize_html": sanitize_html,
            "__type__": "update",
        }
        return updated_config

    def as_example(self, input_data: str | None) -> str:
        postprocessed = self.postprocess(input_data)
        return postprocessed if postprocessed else ""

    def preprocess(self, x: Any) -> Any:
        return x

    def example_inputs(self) -> Any:
        return "# Hello!"

    def api_info(self) -> dict[str, Any]:
        return {"type": "string"}

    
    def change(self,
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