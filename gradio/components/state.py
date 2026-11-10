"""gr.State() component."""

from __future__ import annotations

import math
from collections.abc import Callable
from copy import deepcopy
from typing import Any, Literal

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events


def default_delete_callback(x: Any) -> None:
    pass


@document()
class State(Component):
    EVENTS = [Events.change]
    """
    Special hidden component that stores session state across runs of the demo by the
    same user. Can attach .change listeners that trigger when the state changes.

    By default the value is kept in the user's browser: after each event that changes it,
    the server sends the browser an encrypted copy, which the browser sends back when it is
    needed. This lets the state survive a server restart and work when an app runs on
    several replicas (set the `GRADIO_SECRET_KEY` environment variable to the same value on
    each one). Values must be serializable: JSON types, tuples, sets, bytes, dates, NumPy
    arrays, pandas objects, PIL images, dataclasses, pydantic models, enums and classes
    defined in your app are supported. Set `storage="server"` to keep a value in the
    server's memory instead, e.g. for a model or a database connection.
    Demos: interface_state, blocks_simple_squares, state_cleanup
    Guides: interface-state, state-in-blocks
    """

    allow_string_shortcut = False

    def __init__(
        self,
        value: Any = None,
        render: bool = True,
        *,
        storage: Literal["browser", "server"] | None = None,
        time_to_live: int | float | None = None,
        delete_callback: Callable[[Any], None] | None = None,
    ):
        """
        Parameters:
            value: the initial value (of arbitrary type) of the state. The provided argument is deepcopied. If a callable is provided, the function will be called whenever the app loads to set the initial value of the state.
            render: should always be True, is included for consistency with other components.
            storage: where the value is kept between events. "browser" (the default, unless `delete_callback` is passed) keeps an encrypted copy in the user's browser, with the server's memory used only as a cache, so the state works across server restarts and replicas. The value must be serializable; if it is not, it is kept in the server's memory with a warning. "server" keeps the value in the server's memory for the session, which works for any value but is lost if the user's next request reaches a different server.
            time_to_live: the number of seconds the state should be stored for after it is created or updated. If None, the state will be stored indefinitely. Once it expires, the state is reset to its initial value.
            delete_callback: a function that is called when the state is deleted. The function should take the state value as an argument. Passing it makes `storage` default to "server", since the server cannot tell when a value kept in a browser is no longer needed.
        """
        if storage is None:
            # A delete_callback only makes sense for a value the server holds
            storage = "server" if delete_callback is not None else "browser"
        if storage not in ("browser", "server"):
            raise ValueError(
                f"`storage` must be 'browser' or 'server', not {storage!r}."
            )
        if delete_callback is not None and storage != "server":
            raise ValueError(
                "`delete_callback` cannot be used with `storage='browser'`, since "
                "the server cannot tell when a value kept in the browser is no "
                "longer needed."
            )
        self.storage = storage
        self.time_to_live = self.time_to_live = (
            math.inf if time_to_live is None else time_to_live
        )
        self.delete_callback = delete_callback or default_delete_callback  # noqa: ARG005
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

    def get_config(self):  # type: ignore[override]
        config = super().get_config()
        del config["value"]
        return config

    def breaks_grouping(self) -> bool:
        """State components should not break wrapper grouping chains."""
        return False
