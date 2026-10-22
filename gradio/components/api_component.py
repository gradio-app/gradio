"""gr.Api() component."""

from __future__ import annotations

from typing import Any

from gradio.components.base import Component


class Api(Component):
    """
    A generic component that holds any value. Used for generating APIs with no actual frontend component.
    """

    EVENTS = []

    def __init__(
        self,
        value: Any = None,
        _api_info: dict[str, str] | None = None,
        label: str = "API",
    ):
        """
        Parameters:
            value: default value.
        """
        self._api_info = _api_info or {}
        super().__init__(value=value, label=label)

    def preprocess(self, payload: Any) -> Any:
        return payload

    def postprocess(self, value: Any) -> Any:
        return value

    def api_info(self) -> dict[str, str]:  # type: ignore[override]
        return self._api_info

    def example_payload(self) -> Any:
        return self.value if self.value is not None else "..."

    def example_value(self) -> Any:
        return self.value if self.value is not None else "..."

    # def get_block_name(self) -> str:
    #     return "state"  # so that it does not render in the frontend, just like state
