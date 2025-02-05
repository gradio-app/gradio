from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import TYPE_CHECKING, Literal, TypedDict

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer


class Parameter(TypedDict):
    type: str
    description: str
    default: str | None


@document()
class ParamViewer(Component):
    """
    Displays an interactive table of parameters and their descriptions and default values with syntax highlighting. For each parameter,
    the user should provide a type (e.g. a `str`), a human-readable description, and a default value. As this component does not accept user input,
    it is rarely used as an input component. Internally, this component is used to display the parameters of components in the Custom
    Component Gallery (https://www.gradio.app/custom-components/gallery).
    """

    EVENTS = [
        Events.change,
        Events.upload,
    ]

    def __init__(
        self,
        value: Mapping[str, Parameter] | None = None,
        language: Literal["python", "typescript"] = "python",
        linkify: list[str] | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        render: bool = True,
        key: int | str | None = None,
        header: str | None = "Parameters",
        anchor_links: bool | str = False,
    ):
        """
        Parameters:
            value: A dictionary of dictionaries. The key in the outer dictionary is the parameter name, while the inner dictionary has keys "type", "description", and "default" for each parameter. Markdown links are supported in "description".
            language: The language to display the code in. One of "python" or "typescript".
            linkify: A list of strings to linkify. If any of these strings is found in the description, it will be rendered as a link.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            header: The header to display above the table of parameters, also includes a toggle button that closes/opens all details at once. If None, no header will be displayed.
            anchor_links: If True, creates anchor links for each parameter that can be used to link directly to that parameter. If a string, creates anchor links with the given string as the prefix to prevent conflicts with other ParamViewer components.
        """
        self.value = value or {}
        self.language = language
        self.linkify = linkify
        self.header = header
        self.anchor_links = anchor_links
        super().__init__(
            every=every,
            inputs=inputs,
            value=value,
            render=render,
            key=key,
        )

    def preprocess(self, payload: dict[str, Parameter]) -> dict[str, Parameter]:
        """
        Parameters:
            payload: A `dict[str, dict]`. The key in the outer dictionary is the parameter name, while the inner dictionary has keys "type", "description", and "default" for each parameter.
        Returns:
            (Rarely used) passes value as a `dict[str, dict]`. The key in the outer dictionary is the parameter name, while the inner dictionary has keys "type", "description", and "default" for each parameter.
        """
        return payload

    def postprocess(self, value: dict[str, Parameter]) -> dict[str, Parameter]:
        """
        Parameters:
            value: Expects value as a `dict[str, dict]`. The key in the outer dictionary is the parameter name, while the inner dictionary has keys "type", "description", and "default" for each parameter.
        Returns:
            The same value.
        """
        return value

    def example_payload(self):
        return {
            "array": {
                "type": "numpy",
                "description": "any valid json",
                "default": "None",
            }
        }

    def example_value(self):
        return {
            "array": {
                "type": "numpy",
                "description": "any valid json",
                "default": "None",
            }
        }

    def api_info(self):
        return {"type": {}, "description": "any valid json"}
