from __future__ import annotations

from typing import Any, Callable, Sequence

from gradio.blocks import Blocks
from gradio.components import Component
from gradio.context import Context, LocalContext
from gradio.events import EventListener, EventListenerMethod
from gradio.layouts import Column


class Renderable(Component):
    def __init__(
        self,
        fn: Callable,
        inputs: list[Component] | Component | None = None,
        triggers: EventListener | Sequence[EventListener] | None = None,
    ):
        if Context.root_block is None:
            raise ValueError("Reactive render must be inside a Blocks context.")

        self.fn = fn
        self.inputs = [inputs] if isinstance(inputs, Component) else inputs
        self.initial_values = (
            [input.value for input in self.inputs] if self.inputs else []
        )
        self.triggers: list[EventListenerMethod] = []
        if isinstance(triggers, EventListener):
            triggers = [triggers]

        super().__init__()

        if triggers:
            self.triggers = [
                EventListenerMethod(
                    getattr(t, "__self__", None) if t.has_trigger else None,
                    t.event_name,
                )
                for t in triggers
            ]
            Context.root_block.set_event_trigger(
                self.triggers, lambda *args: args, inputs, self, show_api=False
            )

    def __call__(self, *args, **kwargs):
        return self.fn(*args, **kwargs)

    def example_inputs(self) -> Any:
        return []

    def api_info(self) -> dict[str, Any]:
        return {}

    def preprocess(self, payload: Any) -> Any:
        return payload

    def postprocess(self, value):
        temp_block = Blocks()
        LocalContext.in_render_block.set(True)
        LocalContext.render_block_context.set(None)
        LocalContext.render_block_id.set(0)
        try:
            if value is None:
                value = self.initial_values
            with temp_block:
                with Column():
                    self.fn(*value)
            return temp_block.get_config_file()
        finally:
            LocalContext.in_render_block.set(False)
            LocalContext.render_root_block.set(None)

    def get_config(self):
        return {"value": self.value}


def render(
    inputs: list[Component] | None = None,
    triggers: list[EventListener] | None = None,
):
    def wrapper_function(fn):
        block = Renderable(fn, inputs, triggers)
        return block

    return wrapper_function
