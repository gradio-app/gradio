"""gr.Radio() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio.components.base import Component, FormComponent
from gradio.components.button import Button
from gradio.events import Events
from gradio.exceptions import Error
from gradio.i18n import I18nData
from gradio.utils import set_default_buttons

if TYPE_CHECKING:
    from gradio.components import Timer

from gradio.events import Dependency

@document()
class Radio(FormComponent):
    """
    Creates a set of (string or numeric type) radio buttons of which only one can be selected.

    Demos: sentence_builder, blocks_essay
    """

    EVENTS = [Events.select, Events.change, Events.input]

    def __init__(
        self,
        choices: Sequence[str | int | float | tuple[str | I18nData, str | int | float]]
        | None = None,
        *,
        value: str | int | float | Callable | None = None,
        type: Literal["value", "index"] = "value",
        label: str | I18nData | None = None,
        info: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        rtl: bool = False,
        buttons: list[Button] | None = None,
    ):
        """
        Parameters:
            choices: A list of string or numeric options to select from. An option can also be a tuple of the form (name, value), where name is the displayed name of the radio button and value is the value to be passed to the function, or returned by the function.
            value: The option selected by default. If None, no option is selected by default. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            type: Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
            label: the label for this component, displayed above the component if `show_label` is `True` and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component corresponds to.
            info: additional component description, appears below the label in smaller font. Supports markdown / HTML syntax.
            every: Continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: Relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: Minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: If True, choices in this radio group will be selectable; if False, selection will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            rtl: If True, the radio buttons will be displayed in right-to-left order. Default is False.
            buttons: A list of gr.Button() instances to show in the top right corner of the component. Custom buttons will appear in the toolbar with their configured icon and/or label, and clicking them will trigger any .click() events registered on the button.
        """
        self.choices = (
            # Although we expect choices to be a list of tuples, it can be a list of tuples if the Gradio app
            # is loaded with gr.load() since Python tuples are converted to lists in JSON.
            [tuple(c) if isinstance(c, (tuple, list)) else (str(c), c) for c in choices]
            if choices
            else []
        )
        valid_types = ["value", "index"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        self.rtl = rtl
        super().__init__(
            label=label,
            info=info,
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
            preserved_by_key=preserved_by_key,
            value=value,
        )
        self.buttons = set_default_buttons(buttons, None)
        self._value_description = (
            f"one of {[c[1] if isinstance(c, tuple) else c for c in self.choices]}"
        )

    def example_payload(self) -> Any:
        return self.choices[0][1] if self.choices else None

    def example_value(self) -> Any:
        return self.choices[0][1] if self.choices else None

    def preprocess(self, payload: str | int | float | None) -> str | int | float | None:
        """
        Parameters:
            payload: Selected choice in the radio group
        Returns:
            Passes the value of the selected radio button as a `str | int | float`, or its index as an `int` into the function, depending on `type`.
        """
        if payload is None:
            return None

        choice_values = [value for _, value in self.choices]
        if payload not in choice_values:
            raise Error(
                f"Value: {payload!r} (type: {type(payload)}) is not in the list of choices: {choice_values}"
            )

        if self.type == "value":
            return payload
        elif self.type == "index":
            return choice_values.index(payload)
        else:
            raise ValueError(
                f"Unknown type: {self.type}. Please choose from: 'value', 'index'."
            )

    def postprocess(self, value: str | int | float | None) -> str | int | float | None:
        """
        Parameters:
            value: Expects a `str | int | float` corresponding to the value of the radio button to be selected
        Returns:
            The same value
        """
        return value

    def api_info(self) -> dict[str, Any]:
        return {
            "enum": [c[1] for c in self.choices],
            "title": "Radio",
            "type": "string",
        }
    from typing import Callable, Literal, Sequence, Any, TYPE_CHECKING
    from gradio.blocks import Block
    if TYPE_CHECKING:
        from gradio.components import Timer
        from gradio.components.base import Component


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

    def input(self,
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