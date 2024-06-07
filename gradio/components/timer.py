"""gr.Timer() component."""

from __future__ import annotations

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events


@document()
class Timer(Component):
    """
    Create a timer that ticks at regular intervals when active.
    """

    EVENTS = [
        Events.tick,
    ]

    def __init__(
        self,
        value: float = 1,
        *,
        render: bool = True,
        active: bool = True,
    ):
        """
        Parameters:
            value (float): Interval in seconds between each tick.
            active (bool): Whether the timer is active.
        """
        self.active = active
        super().__init__(value=value, render=render)

    def preprocess(self, payload: float | None) -> str | None:
        return payload

    def postprocess(self, payload: float | None) -> str | None:
        return payload

    def api_info(self) -> dict:
        return {"type": "string"}

    def example_payload(self):
        return 1

    def example_value(self):
        return 1
