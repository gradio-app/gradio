from __future__ import annotations

from gradio import wasm_utils
from gradio.component_meta import create_or_modify_pyi
from gradio.events import EventListener, Events

BLOCKS_EVENTS: list[EventListener | str] = [Events.load]


class BlocksMeta(type):
    def __new__(cls, name, bases, attrs):
        for event in BLOCKS_EVENTS:
            trigger = (
                event
                if isinstance(event, EventListener)
                else EventListener(event_name=event)
            ).copy()
            trigger.set_doc(component=name)
            attrs[event] = trigger.listener
        component_class = super().__new__(cls, name, bases, attrs)
        if not wasm_utils.IS_WASM:
            create_or_modify_pyi(BlocksEvents, "BlocksEvents", BLOCKS_EVENTS)
        return component_class


class BlocksEvents:
    """
    This class is used to hold the events for the Blocks component. It is populated dynamically
    by the BlocksMeta metaclass.
    """

    pass
