"""gr.Button() component."""

from __future__ import annotations

import warnings
from typing import Any, Callable, Literal

from gradio_client.documentation import document, set_documentation_group

from gradio.components.base import Component, _Keywords
from gradio.deprecation import warn_deprecation, warn_style_method_deprecation
from gradio.events import Events

set_documentation_group("component")

from gradio.events import Dependency

@document()
class Button(Component):
    """
    Used to create a button, that can be assigned arbitrary click() events. The label (value) of the button can be used as an input or set via the output of a function.

    Preprocessing: passes the button value as a {str} into the function
    Postprocessing: expects a {str} to be returned from a function, which is set as the label of the button
    Demos: blocks_inputs, blocks_kinematics
    """

    EVENTS = [Events.click]

    def __init__(
        self,
        value: str | Callable = "Run",
        *,
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        size: Literal["sm", "lg"] | None = None,
        icon: str | None = None,
        link: str | None = None,
        visible: bool = True,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default text for the button to display. If callable, the function will be called whenever the app loads to set the initial value of the component.
            variant: 'primary' for main call-to-action, 'secondary' for a more subdued style, 'stop' for a stop button.
            size: Size of the button. Can be "sm" or "lg".
            icon: URL or path to the icon file to display within the button. If None, no icon will be displayed. Must be within the working directory of the Gradio app or an external URL.
            link: URL to open when the button is clicked. If None, no link will be used.
            visible: If False, component will be hidden.
            interactive: If False, the Button will be in a disabled state.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
        """
        super().__init__(
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            interactive=interactive,
            scale=scale,
            min_width=min_width,
            **kwargs,
        )
        if variant == "plain":
            warn_deprecation("'plain' variant deprecated, using 'secondary' instead.")
            variant = "secondary"
        self.variant = variant
        self.size = size
        self.icon = icon
        self.link = link

    @property
    def skip_api(self):
        return True

    @staticmethod
    def update(
        value: str | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        variant: Literal["primary", "secondary", "stop"] | None = None,
        size: Literal["sm", "lg"] | None = None,
        icon: str | None = None,
        link: str | None = None,
        visible: bool | None = None,
        interactive: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
    ):
        warnings.warn(
            "Using the update method is deprecated. Simply return a new object instead, e.g. `return gr.Button(...)` instead of `return gr.Button.update(...)`."
        )
        return {
            "variant": variant,
            "size": size,
            "visible": visible,
            "value": value,
            "icon": icon,
            "link": link,
            "interactive": interactive,
            "scale": scale,
            "min_width": min_width,
            "__type__": "update",
        }

    def style(
        self,
        *,
        full_width: bool | None = None,
        size: Literal["sm", "lg"] | None = None,
        **kwargs,
    ):
        """
        This method is deprecated. Please set these arguments in the constructor instead.
        """
        warn_style_method_deprecation()
        if full_width is not None:
            warn_deprecation(
                "Use `scale` in place of full_width in the constructor. "
                "scale=1 will make the button expand, whereas 0 will not."
            )
            self.scale = 1 if full_width else None
        if size is not None:
            self.size = size
        return self

    def preprocess(self, x: Any) -> Any:
        return x

    def postprocess(self, y):
        return y

    def example_inputs(self) -> Any:
        return None

    
    def click(self,
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