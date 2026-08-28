"""gr.HighlightedText() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal, Union

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.components.button import Button
from gradio.data_classes import GradioModel, GradioRootModel
from gradio.events import Events
from gradio.i18n import I18nData
from gradio.utils import set_default_buttons

if TYPE_CHECKING:
    from gradio.components import Timer


class HighlightedToken(GradioModel):
    token: str
    class_or_confidence: Union[str, float, None] = None


class HighlightedTextData(GradioRootModel):
    root: list[HighlightedToken]

from gradio.events import Dependency

@document()
class HighlightedText(Component):
    """
    Displays text that contains spans that are highlighted by category or numerical value.

    Demos: diff_texts
    Guides: named-entity-recognition
    """

    data_model = HighlightedTextData
    EVENTS = [Events.change, Events.select]

    def __init__(
        self,
        value: list[tuple[str, str | float | None]] | dict | Callable | None = None,
        *,
        color_map: dict[str, str]
        | None = None,  # Parameter moved to HighlightedText.style()
        show_legend: bool = False,
        show_inline_category: bool = True,
        combine_adjacent: bool = False,
        adjacent_separator: str = "",
        show_whitespaces: bool = True,
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
        interactive: bool | None = None,
        rtl: bool = False,
        buttons: list[Button] | None = None,
    ):
        """
        Parameters:
            value: Default value to show. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            color_map: A dictionary mapping labels to colors. The colors may be specified as hex codes or by their names. For example: {"person": "red", "location": "#FFEE22"}
            show_legend: whether to show span categories in a separate legend or inline.
            show_inline_category: If False, will not display span category label. Only applies if show_legend=False and interactive=False.
            combine_adjacent: If True, will merge the labels of adjacent tokens belonging to the same category.
            adjacent_separator: Specifies the separator to be used between tokens if combine_adjacent is True.
            show_whitespaces: If False, leading and trailing whitespace of each token will be stripped before display.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            interactive: If True, the component will be editable, and allow user to select spans of text and label them.
            rtl: If True, will display the text in right-to-left direction, and the labels in the legend will also be aligned to the right.
            buttons: A list of gr.Button() instances to show in the top right corner of the component. Custom buttons will appear in the toolbar with their configured icon and/or label, and clicking them will trigger any .click() events registered on the button.
        """
        self.color_map = color_map
        self.show_legend = show_legend
        self.show_inline_category = show_inline_category
        self.combine_adjacent = combine_adjacent
        self.adjacent_separator = adjacent_separator
        self.show_whitespaces = show_whitespaces
        self.rtl = rtl
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
            interactive=interactive,
        )
        self.buttons = set_default_buttons(buttons, None)
        self._value_description = "a list of 2-part tuples, where the first part is a substring of the text and the second part is the category or value of that substring."

    def example_payload(self) -> Any:
        return [
            {"token": "The", "class_or_confidence": None},
            {"token": "quick", "class_or_confidence": "adj"},
        ]

    def example_value(self) -> Any:
        return [("The", None), ("quick", "adj"), ("brown", "adj"), ("fox", "noun")]

    def preprocess(
        self, payload: HighlightedTextData | None
    ) -> list[tuple[str, str | float | None]] | None:
        """
        Parameters:
            payload: An instance of HighlightedTextData
        Returns:
            Passes the value as a list of tuples: `list[tuple]`. Each `tuple` consists of:
            - a `str` substring of the text (so the entire text is included)
            - a `str | float | None` label, which is the category or confidence of that substring.
        """
        if payload is None:
            return None
        return payload.model_dump()  # type: ignore

    def postprocess(
        self, value: list[tuple[str, str | float | None]] | dict | None
    ) -> HighlightedTextData | None:
        """
        Parameters:
            value: Expects either of:
                - a list of (word, category) tuples
                - a dictionary of two keys: "text", and "entities".
                -- "entities" itself is a list of dictionaries, each of which have the keys: "entity" (or "entity_group"), "start", and "end"
        Returns:
            An instance of HighlightedTextData
        """
        if value is None:
            return None
        if isinstance(value, dict):
            try:
                text = value["text"]
                entities = value["entities"]
            except KeyError as ke:
                raise ValueError(
                    "Expected a dictionary with keys 'text' and 'entities' "
                    "for the value of the HighlightedText component."
                ) from ke
            if len(entities) == 0:
                value = [(text, None)]
            else:
                list_format = []
                index = 0
                entities = sorted(entities, key=lambda x: x["start"])
                for entity in entities:
                    list_format.append((text[index : entity["start"]], None))
                    entity_category = entity.get("entity") or entity.get("entity_group")
                    list_format.append(
                        (text[entity["start"] : entity["end"]], entity_category)
                    )
                    index = entity["end"]
                list_format.append((text[index:], None))
                value = list_format
        if self.combine_adjacent:
            output = []
            running_text, running_category = None, None
            for text, category in value:
                if not text:
                    # Drop empty tokens so they neither seed a run nor get a
                    # spurious separator when merged. These are inserted
                    # between entities when a dict value is converted above,
                    # but skipping them for list values is also correct.
                    continue
                if running_text is None:
                    running_text = text
                    running_category = category
                elif category == running_category:
                    running_text += self.adjacent_separator + text
                else:
                    output.append((running_text, running_category))
                    running_text = text
                    running_category = category
            if running_text is not None:
                output.append((running_text, running_category))
            return HighlightedTextData(
                root=[
                    HighlightedToken(
                        token=self._normalize_token(o[0]),
                        class_or_confidence=o[1],
                    )
                    for o in output
                ]
            )
        else:
            return HighlightedTextData(
                root=[
                    HighlightedToken(
                        token=self._normalize_token(o[0]),
                        class_or_confidence=o[1],
                    )
                    for o in value
                ]
            )

    def _normalize_token(self, text: str) -> str:
        """
        Normalize a token before it is sent to the frontend.

        If show_whitespaces is False, trim leading and trailing whitespace so that
        tokens are rendered without surrounding spaces. When show_whitespaces is
        True (the default), preserve the token exactly as provided.
        """
        if self.show_whitespaces:
            return text
        return text.strip()
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