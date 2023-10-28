from gradio.component_meta import create_or_modify_pyi
from gradio.events import EventListener, Events

BLOCKS_EVENTS: list[EventListener | str] = [Events.load]


class BlocksMeta(type):
    def __new__(cls, name, bases, attrs):
        new_events = []
        for event in BLOCKS_EVENTS:
            trigger = (
                event
                if isinstance(event, EventListener)
                else EventListener(event_name=event)
            ).copy()
            new_events.append(trigger)
            trigger.set_doc(component=name)
            attrs[event] = trigger.listener
        component_class = super().__new__(cls, name, bases, attrs)
        create_or_modify_pyi(BlocksEvents, "BlocksEvents", BLOCKS_EVENTS)
        return component_class


class BlocksEvents:
    pass
