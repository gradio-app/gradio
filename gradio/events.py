"""Contains all of the events that can be triggered in a gr.Blocks() app, with the exception
of the on-page-load event, which is defined in gr.Blocks().load()."""

from __future__ import annotations

import dataclasses
import string
from functools import partial, wraps
from typing import TYPE_CHECKING, Any, Callable, Literal, Sequence

from gradio_client.documentation import document
from jinja2 import Template

if TYPE_CHECKING:
    from gradio.blocks import Block, Component

from gradio.context import Context
from gradio.utils import get_cancel_function


def set_cancel_events(
    triggers: Sequence[EventListenerMethod],
    cancels: None | dict[str, Any] | list[dict[str, Any]],
):
    if cancels:
        if not isinstance(cancels, list):
            cancels = [cancels]
        cancel_fn, fn_indices_to_cancel = get_cancel_function(cancels)

        if Context.root_block is None:
            raise AttributeError("Cannot cancel outside of a gradio.Blocks context.")

        Context.root_block.set_event_trigger(
            triggers,
            cancel_fn,
            inputs=None,
            outputs=None,
            queue=False,
            preprocess=False,
            api_name=False,
            cancels=fn_indices_to_cancel,
        )


class Dependency(dict):
    def __init__(self, trigger, key_vals, dep_index, fn):
        super().__init__(key_vals)
        self.fn = fn
        self.then = partial(
            EventListener(
                "then",
                trigger_after=dep_index,
                trigger_only_on_success=False,
                has_trigger=False,
            ).listener,
            trigger,
        )
        """
        Triggered after directly preceding event is completed, regardless of success or failure.
        """
        self.success = partial(
            EventListener(
                "success",
                trigger_after=dep_index,
                trigger_only_on_success=True,
                has_trigger=False,
            ).listener,
            trigger,
        )
        """
        Triggered after directly preceding event is completed, if it was successful.
        """

    def __call__(self, *args, **kwargs):
        return self.fn(*args, **kwargs)


@document()
class EventData:
    """
    When a subclass of EventData is added as a type hint to an argument of an event listener method, this object will be passed as that argument.
    It contains information about the event that triggered the listener, such the target object, and other data related to the specific event that are attributes of the subclass.

    Example:
        table = gr.Dataframe([[1, 2, 3], [4, 5, 6]])
        gallery = gr.Gallery([("cat.jpg", "Cat"), ("dog.jpg", "Dog")])
        textbox = gr.Textbox("Hello World!")

        statement = gr.Textbox()

        def on_select(evt: gr.SelectData):  # SelectData is a subclass of EventData
            return f"You selected {evt.value} at {evt.index} from {evt.target}"

        table.select(on_select, None, statement)
        gallery.select(on_select, None, statement)
        textbox.select(on_select, None, statement)
    Demos: gallery_selections, tictactoe
    """

    def __init__(self, target: Block | None, _data: Any):
        """
        Parameters:
            target: The target object that triggered the event. Can be used to distinguish if multiple components are bound to the same listener.
        """
        self.target = target
        self._data = _data


class SelectData(EventData):
    def __init__(self, target: Block | None, data: Any):
        super().__init__(target, data)
        self.index: int | tuple[int, int] = data["index"]
        """
        The index of the selected item. Is a tuple if the component is two dimensional or selection is a range.
        """
        self.value: Any = data["value"]
        """
        The value of the selected item.
        """
        self.selected: bool = data.get("_selected", True)
        """
        True if the item was selected, False if deselected.
        """


@dataclasses.dataclass
class EventListenerMethod:
    block: Block | None
    event_name: str


class EventListener(str):
    def __new__(cls, event_name, *args, **kwargs):
        return super().__new__(cls, event_name)

    def __init__(
        self,
        event_name: str,
        has_trigger: bool = True,
        config_data: Callable[..., dict[str, Any]] = lambda: {},
        show_progress: Literal["full", "minimal", "hidden"] | None = None,
        callback: Callable | None = None,
        trigger_after: int | None = None,
        trigger_only_on_success: bool = False,
        doc: str = "",
    ):
        super().__init__()
        self.has_trigger = has_trigger
        self.config_data = config_data
        self.event_name = event_name
        self.show_progress = show_progress
        self.trigger_after = trigger_after
        self.trigger_only_on_success = trigger_only_on_success
        self.callback = callback
        self.doc = doc
        self.listener = self._setup(
            event_name,
            has_trigger,
            show_progress,
            callback,
            trigger_after,
            trigger_only_on_success,
        )
        if doc and self.listener.__doc__:
            self.listener.__doc__ = doc + self.listener.__doc__

    def set_doc(self, component: str):
        if self.listener.__doc__:
            doc = Template(self.listener.__doc__).render(component=component)
            self.listener.__doc__ = doc

    def copy(self):
        return EventListener(
            self.event_name,
            self.has_trigger,
            self.config_data,
            self.show_progress,  # type: ignore
            self.callback,
            self.trigger_after,
            self.trigger_only_on_success,
            self.doc,
        )

    @staticmethod
    def _setup(
        _event_name: str,
        _has_trigger: bool,
        _show_progress: Literal["full", "minimal", "hidden"] | None,
        _callback: Callable | None,
        _trigger_after: int | None,
        _trigger_only_on_success: bool,
    ):
        def event_trigger(
            block: Block | None,
            fn: Callable | None | Literal["decorator"] = "decorator",
            inputs: Component | list[Component] | set[Component] | None = None,
            outputs: Component | list[Component] | None = None,
            api_name: str | None | Literal[False] = None,
            scroll_to_output: bool = False,
            show_progress: Literal["full", "minimal", "hidden"] = "full",
            queue: bool | None = None,
            batch: bool = False,
            max_batch_size: int = 4,
            preprocess: bool = True,
            postprocess: bool = True,
            cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
            every: float | None = None,
            trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
            js: str | None = None,
            concurrency_limit: int | None | Literal["default"] = "default",
            concurrency_id: str | None = None,
        ) -> Dependency:
            """
            Parameters:
                fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
                inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
                outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
                api_name: defines how the endpoint appears in the API docs. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given name. If None (default), the name of the function will be used as the API endpoint. If False, the endpoint will not be exposed in the API docs and downstream apps (including those that `gr.load` this app) will not be able to use this event.
                scroll_to_output: If True, will scroll to output component on completion
                show_progress: If True, will show progress animation while pending
                queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
                batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
                max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
                preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
                postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
                cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
                every: Run this event 'every' number of seconds while the client connection is open. Interpreted in seconds. Queue must be enabled.
                trigger_mode: If "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` event) would allow a second submission after the pending event is complete.
                js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
                concurrency_limit: If set, this this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
                concurrency_id: If set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            """

            if fn == "decorator":

                def wrapper(func):
                    event_trigger(
                        block,
                        func,
                        inputs,
                        outputs,
                        api_name,
                        scroll_to_output,
                        show_progress,
                        queue,
                        batch,
                        max_batch_size,
                        preprocess,
                        postprocess,
                        cancels,
                        every,
                        trigger_mode,
                        js,
                        concurrency_limit,
                        concurrency_id,
                    )

                    @wraps(func)
                    def inner(*args, **kwargs):
                        return func(*args, **kwargs)

                    return inner

                return Dependency(None, {}, None, wrapper)

            from gradio.components.base import StreamingInput

            if isinstance(block, StreamingInput) and "stream" in block.events:
                block.check_streamable()  # type: ignore
            if isinstance(show_progress, bool):
                show_progress = "full" if show_progress else "hidden"

            if api_name is None:
                if fn is not None:
                    if not hasattr(fn, "__name__"):
                        if hasattr(fn, "__class__") and hasattr(
                            fn.__class__, "__name__"
                        ):
                            name = fn.__class__.__name__
                        else:
                            name = "unnamed"
                    else:
                        name = fn.__name__
                    api_name = "".join(
                        [
                            s
                            for s in name
                            if s not in set(string.punctuation) - {"-", "_"}
                        ]
                    )
                else:
                    # Don't document _js only events
                    api_name = False

            if Context.root_block is None:
                raise AttributeError(
                    f"Cannot call {_event_name} outside of a gradio.Blocks context."
                )

            dep, dep_index = Context.root_block.set_event_trigger(
                [EventListenerMethod(block if _has_trigger else None, _event_name)],
                fn,
                inputs,
                outputs,
                preprocess=preprocess,
                postprocess=postprocess,
                scroll_to_output=scroll_to_output,
                show_progress=show_progress
                if show_progress is not None
                else _show_progress,
                api_name=api_name,
                js=js,
                concurrency_limit=concurrency_limit,
                concurrency_id=concurrency_id,
                queue=queue,
                batch=batch,
                max_batch_size=max_batch_size,
                every=every,
                trigger_after=_trigger_after,
                trigger_only_on_success=_trigger_only_on_success,
                trigger_mode=trigger_mode,
            )
            set_cancel_events(
                [EventListenerMethod(block if _has_trigger else None, _event_name)],
                cancels,
            )
            if _callback:
                _callback(block)
            return Dependency(block, dep, dep_index, fn)

        event_trigger.event_name = _event_name
        event_trigger.has_trigger = _has_trigger
        return event_trigger


# TODO: Fix type
def on(
    triggers: Sequence[Any] | Any | None = None,
    fn: Callable | None | Literal["decorator"] = "decorator",
    inputs: Component | list[Component] | set[Component] | None = None,
    outputs: Component | list[Component] | None = None,
    *,
    api_name: str | None | Literal[False] = None,
    scroll_to_output: bool = False,
    show_progress: Literal["full", "minimal", "hidden"] = "full",
    queue: bool | None = None,
    batch: bool = False,
    max_batch_size: int = 4,
    preprocess: bool = True,
    postprocess: bool = True,
    cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
    every: float | None = None,
    js: str | None = None,
    concurrency_limit: int | None | Literal["default"] = "default",
    concurrency_id: str | None = None,
) -> Dependency:
    """
    Parameters:
        triggers: List of triggers to listen to, e.g. [btn.click, number.change]. If None, will listen to changes to any inputs.
        fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
        inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
        outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
        api_name: Defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, the endpoint will be exposed in the api docs as an unnamed endpoint, although this behavior will be changed in Gradio 4.0. If set to a string, the endpoint will be exposed in the api docs with the given name.
        scroll_to_output: If True, will scroll to output component on completion
        show_progress: If True, will show progress animation while pending
        queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
        batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
        max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
        preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
        postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
        every: Run this event 'every' number of seconds while the client connection is open. Interpreted in seconds. Queue must be enabled.
        js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs', return should be a list of values for output components.
        concurrency_limit: If set, this this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
        concurrency_id: If set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
    """
    from gradio.components.base import Component

    if isinstance(triggers, EventListener):
        triggers = [triggers]
    if isinstance(inputs, Component):
        inputs = [inputs]

    if fn == "decorator":

        def wrapper(func):
            on(
                triggers,
                fn=func,
                inputs=inputs,
                outputs=outputs,
                api_name=api_name,
                scroll_to_output=scroll_to_output,
                show_progress=show_progress,
                queue=queue,
                batch=batch,
                max_batch_size=max_batch_size,
                preprocess=preprocess,
                postprocess=postprocess,
                cancels=cancels,
                every=every,
                js=js,
                concurrency_limit=concurrency_limit,
                concurrency_id=concurrency_id,
            )

            @wraps(func)
            def inner(*args, **kwargs):
                return func(*args, **kwargs)

            return inner

        return Dependency(None, {}, None, wrapper)

    if Context.root_block is None:
        raise Exception("Cannot call on() outside of a gradio.Blocks context.")
    if triggers is None:
        triggers = [EventListenerMethod(input, "change") for input in inputs] if inputs is not None else []  # type: ignore
    else:
        triggers = [EventListenerMethod(t.__self__ if t.has_trigger else None, t.event_name) for t in triggers]  # type: ignore
    dep, dep_index = Context.root_block.set_event_trigger(
        triggers,
        fn,
        inputs,
        outputs,
        preprocess=preprocess,
        postprocess=postprocess,
        scroll_to_output=scroll_to_output,
        show_progress=show_progress,
        api_name=api_name,
        js=js,
        concurrency_limit=concurrency_limit,
        concurrency_id=concurrency_id,
        queue=queue,
        batch=batch,
        max_batch_size=max_batch_size,
        every=every,
    )
    set_cancel_events(triggers, cancels)
    return Dependency(None, dep, dep_index, fn)


class Events:
    change = EventListener(
        "change",
        doc="Triggered when the value of the {{ component }} changes either because of user input (e.g. a user types in a textbox) OR because of a function update (e.g. an image receives a value from the output of an event trigger). See `.input()` for a listener that is only triggered by user input.",
    )
    input = EventListener(
        "input",
        doc="This listener is triggered when the user changes the value of the {{ component }}.",
    )
    click = EventListener("click", doc="Triggered when the {{ component }} is clicked.")
    submit = EventListener(
        "submit",
        doc="This listener is triggered when the user presses the Enter key while the {{ component }} is focused.",
    )
    edit = EventListener(
        "edit",
        doc="This listener is triggered when the user edits the {{ component }} (e.g. image) using the built-in editor.",
    )
    clear = EventListener(
        "clear",
        doc="This listener is triggered when the user clears the {{ component }} using the X button for the component.",
    )
    play = EventListener(
        "play",
        doc="This listener is triggered when the user plays the media in the {{ component }}.",
    )
    pause = EventListener(
        "pause",
        doc="This listener is triggered when the media in the {{ component }} stops for any reason.",
    )
    stop = EventListener(
        "stop",
        doc="This listener is triggered when the user reaches the end of the media playing in the {{ component }}.",
    )
    end = EventListener(
        "end",
        doc="This listener is triggered when the user reaches the end of the media playing in the {{ component }}.",
    )
    start_recording = EventListener(
        "start_recording",
        doc="This listener is triggered when the user starts recording with the {{ component }}.",
    )
    pause_recording = EventListener(
        "pause_recording",
        doc="This listener is triggered when the user pauses recording with the {{ component }}.",
    )
    stop_recording = EventListener(
        "stop_recording",
        doc="This listener is triggered when the user stops recording with the {{ component }}.",
    )
    focus = EventListener(
        "focus", doc="This listener is triggered when the {{ component }} is focused."
    )
    blur = EventListener(
        "blur",
        doc="This listener is triggered when the {{ component }} is unfocused/blurred.",
    )
    upload = EventListener(
        "upload",
        doc="This listener is triggered when the user uploads a file into the {{ component }}.",
    )
    release = EventListener(
        "release",
        doc="This listener is triggered when the user releases the mouse on this {{ component }}.",
    )
    select = EventListener(
        "select",
        callback=lambda block: setattr(block, "_selectable", True),
        doc="Event listener for when the user selects or deselects the {{ component }}. Uses event data gradio.SelectData to carry `value` referring to the label of the {{ component }}, and `selected` to refer to state of the {{ component }}. See EventData documentation on how to use this event data",
    )
    stream = EventListener(
        "stream",
        show_progress="hidden",
        config_data=lambda: {"streamable": False},
        callback=lambda block: setattr(block, "streaming", True),
        doc="This listener is triggered when the user streams the {{ component }}.",
    )
    like = EventListener(
        "like",
        config_data=lambda: {"likeable": False},
        callback=lambda block: setattr(block, "likeable", True),
        doc="This listener is triggered when the user likes/dislikes from within the {{ component }}. This event has EventData of type gradio.LikeData that carries information, accessible through LikeData.index and LikeData.value. See EventData documentation on how to use this event data.",
    )
    load = EventListener(
        "load",
        doc="This listener is triggered when the {{ component }} initially loads in the browser.",
    )


class LikeData(EventData):
    def __init__(self, target: Block | None, data: Any):
        super().__init__(target, data)
        self.index: int | tuple[int, int] = data["index"]
        """
        The index of the liked/disliked item. Is a tuple if the component is two dimensional.
        """
        self.value: Any = data["value"]
        """
        The value of the liked/disliked item.
        """
        self.liked: bool = data.get("liked", True)
        """
        True if the item was liked, False if disliked.
        """
