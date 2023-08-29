from __future__ import annotations

from abc import ABCMeta
from functools import wraps

from gradio.data_classes import GradioModel, GradioRootModel
from gradio.events import EventListener
from gradio.exceptions import ComponentDefinitionError


def serializes(f):
    @wraps(f)
    def serialize(*args, **kwds):
        output = f(*args, **kwds)
        if isinstance(output, (GradioRootModel, GradioModel)):
            output = output.model_dump()
        return output

    return serialize


class ComponentMeta(ABCMeta):
    def __new__(cls, name, bases, attrs):
        # if 'EVENTS' not in attrs:
        #     raise ComponentDefinitionError(f"Component {name} must define an EVENTS list. "
        #                                    "If no events are supported, set it to an empty list.")
        if "EVENTS" not in attrs:
            found = False
            for base in bases:
                if hasattr(base, "EVENTS"):
                    found = True
                    break
            if not found:
                raise AttributeError(
                    f"{name} or its base classes must define an EVENTS list. "
                    "If no events are supported, set it to an empty list."
                )
        events = attrs.get("EVENTS", [])
        if not all(isinstance(e, (str, EventListener)) for e in events):
            raise ComponentDefinitionError(
                f"All events for {name} must either be an string or an instance "
                "of EventListener."
            )
        for event in events:
            trigger = (
                EventListener(event_name=event) if isinstance(event, str) else event
            )
            attrs[event] = trigger.listener
        if "postprocess" in attrs:
            attrs["postprocess"] = serializes(attrs["postprocess"])

        return super().__new__(cls, name, bases, attrs)
