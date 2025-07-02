"""gr.Timer() component."""

from __future__ import annotations

from typing import TYPE_CHECKING

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events

if TYPE_CHECKING:
    pass


@document()
class Timer(Component):
    """
    Special component that ticks at regular intervals when active. It is not visible, and only used to trigger events at a regular interval through the `tick` event listener.
    """

    EVENTS = [
        Events.tick,
    ]

    def __init__(
        self,
        value: float = 1,
        *,
        active: bool = True,
        render: bool = True,
    ):
        """
        Parameters:
            value: Interval in seconds between each tick.
            active: Whether the timer is active.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
        """
        self.active = active
        super().__init__(value=value, render=render)

    def preprocess(self, payload: float | None) -> float | None:
        """
        Parameters:
            payload: The interval of the timer as a float or None.
        Returns:
            The interval of the timer as a float.
        """
        return payload

    def postprocess(self, value: float | None) -> float | None:
        """
        Parameters:
            value: The interval of the timer as a float or None.
        Returns:
            The interval of the timer as a float.
        """
        return value

    def api_info(self) -> dict:
        return {"type": "number"}

    def example_payload(self):
        return 1

    def example_value(self):
        return 1

    def breaks_grouping(self) -> bool:
        """Timer components should not break wrapper grouping chains."""
        return False
