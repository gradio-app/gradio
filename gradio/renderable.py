from __future__ import annotations

from typing import TYPE_CHECKING, Callable, List, Literal, Sequence, Union, cast

from gradio_client.documentation import document

from gradio.blocks import Block
from gradio.components import Component
from gradio.context import Context, LocalContext
from gradio.events import EventListener, EventListenerMethod
from gradio.layouts import Column, Row

if TYPE_CHECKING:
    from gradio.events import EventListenerCallable


class Renderable:
    def __init__(
        self,
        fn: Callable,
        inputs: Sequence[Component],
        triggers: list[tuple[Block | None, str]],
        concurrency_limit: int | None | Literal["default"],
        concurrency_id: str | None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None,
        queue: bool,
    ):
        if Context.root_block is None:
            raise ValueError("Reactive render must be inside a Blocks context.")

        self._id = len(Context.root_block.renderables)
        Context.root_block.renderables.append(self)
        self.ContainerClass = Row if isinstance(Context.block, Row) else Column
        self.container = self.ContainerClass(show_progress=True)
        self.container_id = self.container._id

        self.fn = fn
        self.inputs = inputs
        self.triggers: list[EventListenerMethod] = []

        self.triggers = [EventListenerMethod(*t) for t in triggers]
        Context.root_block.default_config.set_event_trigger(
            self.triggers,
            self.apply,
            self.inputs,
            self.container,
            show_api=False,
            concurrency_limit=concurrency_limit,
            concurrency_id=concurrency_id,
            renderable=self,
            trigger_mode=trigger_mode,
            postprocess=False,
            queue=queue,
        )

    def apply(self, *args, **kwargs):
        blocks_config = LocalContext.blocks_config.get()
        if blocks_config is None:
            raise ValueError("Reactive render must be inside a LocalContext.")

        fn_ids_to_remove_from_last_render = []
        for _id, fn in blocks_config.fns.items():
            if fn.rendered_in is self:
                fn_ids_to_remove_from_last_render.append(_id)
        for _id in fn_ids_to_remove_from_last_render:
            del blocks_config.fns[_id]

        container_copy = self.ContainerClass(render=False, show_progress=True)
        container_copy._id = self.container_id
        LocalContext.renderable.set(self)

        try:
            with container_copy:
                self.fn(*args, **kwargs)
                blocks_config.blocks[self.container_id] = container_copy
        finally:
            LocalContext.renderable.set(None)


@document()
def render(
    inputs: Sequence[Component] | Component | None = None,
    triggers: Sequence[EventListenerCallable] | EventListenerCallable | None = None,
    *,
    queue: bool = True,
    trigger_mode: Literal["once", "multiple", "always_last"] | None = "always_last",
    concurrency_limit: int | None | Literal["default"] = None,
    concurrency_id: str | None = None,
):
    """
    The render decorator allows Gradio Blocks apps to have dynamic layouts, so that the components and event listeners in your app can change depending on custom logic.
    Attaching a @gr.render decorator to a function will cause the function to be re-run whenever the inputs are changed (or specified triggers are activated). The function contains the components and event listeners that will update based on the inputs.

    The basic usage of @gr.render is as follows:\n
    1. Create a function and attach the @gr.render decorator to it.\n
    2. Add the input components to the `inputs=` argument of @gr.render, and create a corresponding argument in your function for each component.\n
    3. Add all components inside the function that you want to update based on the inputs. Any event listeners that use these components should also be inside this function.\n
    Parameters:
        inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
        triggers: List of triggers to listen to, e.g. [btn.click, number.change]. If None, will listen to changes to any inputs.
        queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
        trigger_mode: If "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
        concurrency_limit: If set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
        concurrency_id: If set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
    Example:
        import gradio as gr

        with gr.Blocks() as demo:
            input_text = gr.Textbox()

            @gr.render(inputs=input_text)
            def show_split(text):
                if len(text) == 0:
                    gr.Markdown("## No Input Provided")
                else:
                    for letter in text:
                        with gr.Row():
                            text = gr.Textbox(letter)
                            btn = gr.Button("Clear")
                            btn.click(lambda: gr.Textbox(value=""), None, text)
    """
    new_triggers = cast(Union[List[EventListener], EventListener, None], triggers)

    if Context.root_block is None:
        raise ValueError("Reactive render must be inside a Blocks context.")

    inputs = (
        [inputs] if isinstance(inputs, Component) else [] if inputs is None else inputs
    )
    _triggers: list[tuple[Block | None, str]] = []
    if new_triggers is None:
        _triggers = [(Context.root_block, "load")]
        for input in inputs:
            if hasattr(input, "change"):
                _triggers.append((input, "change"))
    else:
        new_triggers = (
            [new_triggers] if isinstance(new_triggers, EventListener) else new_triggers
        )
        _triggers = [
            (getattr(t, "__self__", None) if t.has_trigger else None, t.event_name)
            for t in new_triggers
        ]

    def wrapper_function(fn):
        Renderable(
            fn,
            inputs,
            _triggers,
            concurrency_limit,
            concurrency_id,
            trigger_mode,
            queue,
        )
        return fn

    return wrapper_function
