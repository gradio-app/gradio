"""gr.LocalState() component."""

from __future__ import annotations

import secrets
import string
from typing import Any

from gradio_client.documentation import document

from gradio.components.base import Component


@document()
class LocalState(Component):
    """
    Special component that stores state in the browser's localStorage in an encrypted format.
    """

    def __init__(
        self,
        value: Any = None,
        *,
        key: str | None = None,
        render: bool = True,
    ):
        """
        Parameters:
            value: the initial value (of arbitrary type) of the state.
            key: the key to use in localStorage. If None, a random key will be generated.
            render: should always be True, is included for consistency with other components.
        """
        self._secret = "".join(
            secrets.choice(string.ascii_letters + string.digits) for _ in range(32)
        )
        self.key = key or "".join(
            secrets.choice(string.ascii_letters + string.digits) for _ in range(16)
        )
        super().__init__(value=value, render=render)

    def preprocess(self, payload: Any) -> Any:
        """
        Parameters:
            payload: Value from local storage
        Returns:
            Passes value through unchanged
        """
        return payload

    def postprocess(self, value: Any) -> Any:
        """
        Parameters:
            value: Value to store in local storage
        Returns:
            Passes value through unchanged
        """
        return value

    def api_info(self) -> dict[str, Any]:
        return {"type": {}, "description": "any json-serializable value"}

    def example_payload(self) -> Any:
        return "test"

    def example_value(self) -> Any:
        return "test"
