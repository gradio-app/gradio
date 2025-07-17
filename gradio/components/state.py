"""gr.State() component."""

from __future__ import annotations

import math
from collections.abc import Callable
from copy import deepcopy
from typing import Any

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events


@document()
class State(Component):
    EVENTS = [Events.change]
    """
    Special hidden component that stores session state across runs of the demo by the
    same user. Can attach .change listeners that trigger when the state changes.
    Demos: interface_state, blocks_simple_squares, state_cleanup
    Guides: real-time-speech-recognition
    """

    allow_string_shortcut = False

    def __init__(
        self,
        value: Any = None,
        render: bool = True,
        *,
        time_to_live: int | float | None = None,
        delete_callback: Callable[[Any], None] | None = None,
    ):
        """
        Parameters:
            value: the initial value (of arbitrary type) of the state. The provided argument is deepcopied. If a callable is provided, the function will be called whenever the app loads to set the initial value of the state.
            render: should always be True, is included for consistency with other components.
            time_to_live: the number of seconds the state should be stored for after it is created or updated. If None, the state will be stored indefinitely. Gradio automatically deletes state variables after a user closes the browser tab or refreshes the page, so this is useful for clearing state for potentially long running sessions.
            delete_callback: a function that is called when the state is deleted. The function should take the state value as an argument.
        """
        self.time_to_live = self.time_to_live = (
            math.inf if time_to_live is None else time_to_live
        )
        self.delete_callback = delete_callback or (lambda a: None)  # noqa: ARG005
        try:
            value = deepcopy(value)
        except TypeError as err:
            raise TypeError(
                f"The initial value of `gr.State` must be able to be deepcopied. The initial value of type {type(value)} cannot be deepcopied."
            ) from err
        super().__init__(value=value, render=render)
        self.value = value

    @property
    def stateful(self) -> bool:
        return True

    def preprocess(self, payload: Any) -> Any:
        """
        Parameters:
            payload: Value
        Returns:
            Passes a value of arbitrary type through.
        """
        return payload

    def postprocess(self, value: Any) -> Any:
        """
        Parameters:
            value: Expects a value of arbitrary type, as long as it can be deepcopied.
        Returns:
            Passes a value of arbitrary type through.
        """
        return value

    def api_info(self) -> dict[str, Any]:
        return {"type": {}, "description": "any valid json"}

    def example_payload(self) -> Any:
        return None

    def example_value(self) -> Any:
        return None

    @property
    def skip_api(self):
        return True

    def get_config(self):
        config = super().get_config()
        del config["value"]
        return config

    def breaks_grouping(self) -> bool:
        """State components should not break wrapper grouping chains."""
        return False
