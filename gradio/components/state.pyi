"""gr.State() component."""

from __future__ import annotations

import math
from collections.abc import Callable
from copy import deepcopy
from typing import Any

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events


def default_delete_callback(x: Any) -> None:
    pass

from gradio.events import Dependency

@document()
class State(Component):
    EVENTS = [Events.change]
    """
    Special hidden component that stores session state across runs of the demo by the
    same user. Can attach .change listeners that trigger when the state changes.
    Demos: interface_state, blocks_simple_squares, state_cleanup
    Guides: interface-state, state-in-blocks
    """

    allow_string_shortcut = False

    def __init__(
        self,
        value: Any = None,
        render: bool = True,
        *,
        time_to_live: int | float | None = None,
        delete_callback: Callable[[Any], None] | None = None,
    ):
        """
        Parameters:
            value: the initial value (of arbitrary type) of the state. The provided argument is deepcopied. If a callable is provided, the function will be called whenever the app loads to set the initial value of the state.
            render: should always be True, is included for consistency with other components.
            time_to_live: the number of seconds the state should be stored for after it is created or updated. If None, the state will be stored indefinitely. Gradio automatically deletes state variables after a user closes the browser tab or refreshes the page, so this is useful for clearing state for potentially long running sessions.
            delete_callback: a function that is called when the state is deleted. The function should take the state value as an argument.
        """
        self.time_to_live = self.time_to_live = (
            math.inf if time_to_live is None else time_to_live
        )
        self.delete_callback = delete_callback or default_delete_callback  # noqa: ARG005
        try:
            value = deepcopy(value)
        except TypeError as err:
            raise TypeError(
                f"The initial value of `gr.State` must be able to be deepcopied. The initial value of type {type(value)} cannot be deepcopied."
            ) from err
        super().__init__(value=value, render=render)
        self.value = value

    @property
    def stateful(self) -> bool:
        return True

    def preprocess(self, payload: Any) -> Any:
        """
        Parameters:
            payload: Value
        Returns:
            Passes a value of arbitrary type through.
        """
        return payload

    def postprocess(self, value: Any) -> Any:
        """
        Parameters:
            value: Expects a value of arbitrary type, as long as it can be deepcopied.
        Returns:
            Passes a value of arbitrary type through.
        """
        return value

    def api_info(self) -> dict[str, Any]:
        return {"type": {}, "description": "any valid json"}

    def example_payload(self) -> Any:
        return None

    def example_value(self) -> Any:
        return None

    @property
    def skip_api(self):
        return True

    def get_config(self):  # type: ignore[override]
        config = super().get_config()
        del config["value"]
        return config

    def breaks_grouping(self) -> bool:
        """State components should not break wrapper grouping chains."""
        return False
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