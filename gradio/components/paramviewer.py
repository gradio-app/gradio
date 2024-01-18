from __future__ import annotations

from typing import Literal, TypedDict

from gradio.components.base import Component
from gradio.events import Events


class Parameter(TypedDict):
    type: str
    description: str
    default: str


class ParamViewer(Component):
    """
    Displays an interactive table of parameters and their descriptions and default values width syntax highlighting
    """

    EVENTS = [
        Events.change,
        Events.upload,
    ]

    def __init__(
        self,
        value: list[Parameter] | None = None,
        language: Literal["python", "typescript"] = "python",
        linkify: list[str] | None = None,
    ):
        """
        Parameters:
            value: A list of dictionaries with keys "type", "description", and "default" for each parameter.
            language: The language to display the code in. One of "python" or "typescript".
            linkify: A list of strings to linkify. If a string is found in the description, it will be linked to the corresponding url.
        """
        self.value = value
        self.language = language
        self.linkify = linkify
        super().__init__(
            value=value,
        )

    def preprocess(self, payload: list[Parameter]) -> list[Parameter]:
        """
        Parameters:
            payload: A list of dictionaries with keys "type", "description", and "default" for each parameter.
        Returns:
            A list of dictionaries with keys "type", "description", and "default" for each parameter.
        """
        return payload

    def postprocess(self, value: list[Parameter]) -> list[Parameter]:
        """
        Parameters:
            value: A list of dictionaries with keys "type", "description", and "default" for each parameter.
        Returns:
            A list of dictionaries with keys "type", "description", and "default" for each parameter.
        """
        return value

    def example_inputs(self):
        return [{"type": "numpy", "description": "any valid json", "default": "None"}]

    def api_info(self):
        return {"type": {}, "description": "any valid json"}
