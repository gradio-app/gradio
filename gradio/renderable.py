from __future__ import annotations

from typing import Callable, Literal

from gradio.blocks import Block
from gradio.components import Component
from gradio.context import Context, LocalContext
from gradio.events import EventListener, EventListenerMethod
from gradio.layouts import Column, Row


class Renderable:
    def __init__(
        self,
        fn: Callable,
        inputs: list[Component],
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


def render(
    inputs: list[Component] | None = None,
    triggers: list[EventListener] | EventListener | None = None,
    concurrency_limit: int | None | Literal["default"] = None,
    concurrency_id: str | None = None,
    trigger_mode: Literal["once", "multiple", "always_last"] | None = "always_last",
    queue: bool = True,
):
    if Context.root_block is None:
        raise ValueError("Reactive render must be inside a Blocks context.")

    inputs = (
        [inputs] if isinstance(inputs, Component) else [] if inputs is None else inputs
    )
    _triggers: list[tuple[Block | None, str]] = []
    if triggers is None:
        _triggers = [(Context.root_block, "load")]
        for input in inputs:
            if hasattr(input, "change"):
                _triggers.append((input, "change"))
    else:
        triggers = [triggers] if isinstance(triggers, EventListener) else triggers
        _triggers = [
            (getattr(t, "__self__", None) if t.has_trigger else None, t.event_name)
            for t in triggers
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
