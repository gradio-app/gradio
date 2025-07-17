"""Predefined buttons with bound events that can be included in a gr.Blocks for convenience."""

from __future__ import annotations

import copy
import json
from collections.abc import Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio.components import Button, Component
from gradio.context import get_blocks_context
from gradio.data_classes import GradioModel, GradioRootModel
from gradio.utils import resolve_singleton

if TYPE_CHECKING:
    from gradio.components import Timer


@document("add")
class ClearButton(Button):
    """
    Button that clears the value of a component or a list of components when clicked. It is instantiated with the list of components to clear.
    Preprocessing: passes the button value as a {str} into the function
    Postprocessing: expects a {str} to be returned from a function, which is set as the label of the button
    """

    is_template = True

    def __init__(
        self,
        components: None | Sequence[Component] | Component = None,
        *,
        value: str = "Clear",
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        size: Literal["sm", "md", "lg"] = "lg",
        icon: str | Path | None = None,
        link: str | None = None,
        visible: bool = True,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        scale: int | None = None,
        min_width: int | None = None,
        api_name: str | None | Literal["False"] = None,
        show_api: bool = False,
    ):
        super().__init__(
            value,
            every=every,
            inputs=inputs,
            variant=variant,
            size=size,
            icon=icon,
            link=link,
            visible=visible,
            interactive=interactive,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            scale=scale,
            min_width=min_width,
        )
        self.api_name = api_name
        self.show_api = show_api

        if get_blocks_context():
            self.add(components)

    def add(self, components: None | Component | Sequence[Component]) -> ClearButton:
        """
        Adds a component or list of components to the list of components that will be cleared when the button is clicked.
        """
        from gradio.components import State  # Avoid circular import

        if not components:
            # This needs to be here because when the ClearButton is created in an gr.Interface, we don't
            # want to create dependencies for it before we have created the dependencies for the submit function.
            # We generally assume that the submit function dependency is the first thing created in an gr.Interface.
            return self

        if isinstance(components, Component):
            components = [components]
        none_values = []
        state_components = []
        initial_states = []
        for component in components:
            if isinstance(component, State):
                state_components.append(component)
                initial_states.append(copy.deepcopy(component.value))
            none = component.postprocess(None)
            if isinstance(none, (GradioModel, GradioRootModel)):
                none = none.model_dump()
            none_values.append(none)
        clear_values = json.dumps(none_values)
        self.click(
            None,
            [],
            components,
            js=f"() => {clear_values}",
            api_name=self.api_name,
            show_api=self.show_api,
        )
        if state_components:
            self.click(
                lambda: copy.deepcopy(resolve_singleton(initial_states)),
                None,
                state_components,
                api_name=self.api_name,
                show_api=self.show_api,
            )
        return self

    def preprocess(self, payload: str | None) -> str | None:
        """
        Parameters:
            payload: string corresponding to the button label
        Returns:
            (Rarely used) the `str` corresponding to the button label when the button is clicked
        """
        return payload

    def postprocess(self, value: str | None) -> str | None:
        """
        Parameters:
            value: string corresponding to the button label
        Returns:
            Expects a `str` value that is set as the button label
        """
        return value

    def example_payload(self) -> Any:
        return "Clear"

    def example_value(self) -> Any:
        return "Clear"
