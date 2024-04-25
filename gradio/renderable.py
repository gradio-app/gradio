from __future__ import annotations

from typing import Callable, Literal, Sequence

from gradio.components import Component
from gradio.context import Context, LocalContext
from gradio.events import EventListener, EventListenerMethod
from gradio.layouts import Column


class Renderable:
    def __init__(
        self,
        fn: Callable,
        inputs: list[Component] | Component | None = None,
        triggers: EventListener | Sequence[EventListener] | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
    ):
        if Context.root_block is None:
            raise ValueError("Reactive render must be inside a Blocks context.")

        self._id = len(Context.root_block.renderables)
        Context.root_block.renderables.append(self)
        self.column = Column()
        self.column_id = Column()._id

        self.fn = fn
        self.inputs = [inputs] if isinstance(inputs, Component) else inputs
        self.triggers: list[EventListenerMethod] = []
        if isinstance(triggers, EventListener):
            triggers = [triggers]

        if triggers:
            self.triggers = [
                EventListenerMethod(
                    getattr(t, "__self__", None) if t.has_trigger else None,
                    t.event_name,
                )
                for t in triggers
            ]
            Context.root_block.set_event_trigger(
                self.triggers,
                self.apply,
                self.inputs,
                None,
                show_api=False,
                concurrency_limit=concurrency_limit,
                concurrency_id=concurrency_id,
                renderable=self,
            )

    def apply(self, *args, **kwargs):
        column_copy = Column(render=False)
        column_copy._id = self.column_id
        LocalContext.is_render.set(True)
        LocalContext.render_block.set(column_copy)
        try:
            self.fn(*args, **kwargs)
            blocks_config = LocalContext.blocks_config.get()
            if blocks_config is None:
                raise ValueError("Reactive render must be inside a LocalContext.")
            blocks_config.blocks[self.column_id] = column_copy
        finally:
            LocalContext.is_render.set(False)
            LocalContext.render_block.set(None)


def render(
    inputs: list[Component] | None = None,
    triggers: list[EventListener] | None = None,
    concurrency_limit: int | None | Literal["default"] = None,
    concurrency_id: str | None = None,
):
    def wrapper_function(fn):
        Renderable(fn, inputs, triggers, concurrency_limit, concurrency_id)
        return fn

    return wrapper_function
