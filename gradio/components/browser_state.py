"""gr.BrowserState() component."""

from __future__ import annotations

import secrets
import string
from typing import Any

from gradio_client.documentation import document

from gradio.components.base import Component


@document()
class BrowserState(Component):
    """
    Special component that stores state in the browser's localStorage in an encrypted format.
    """

    def __init__(
        self,
        default_value: Any = None,
        *,
        storage_key: str | None = None,
        secret: str | None = None,
        render: bool = True,
    ):
        """
        Parameters:
            default_value: the default value that will be used if no value is found in localStorage. Should be a json-serializable value.
            storage_key: the key to use in localStorage. If None, a random key will be generated.
            secret: the secret key to use for encryption. If None, a random key will be generated (recommended).
            render: should always be True, is included for consistency with other components.
        """
        self.default_value = default_value
        self.secret = secret or "".join(
            secrets.choice(string.ascii_letters + string.digits) for _ in range(16)
        )
        self.storage_key = storage_key or "".join(
            secrets.choice(string.ascii_letters + string.digits) for _ in range(16)
        )
        super().__init__(render=render)

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
