""" Predefined buttons with bound events that can be included in a gr.Blocks for convenience. """

from __future__ import annotations

import json
from typing import Any, Literal

from gradio_client.documentation import document, set_documentation_group

from gradio.components import Button, Component
from gradio.data_classes import GradioModel, GradioRootModel

set_documentation_group("component")


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
        components: None | list[Component] | Component = None,
        *,
        value: str = "Clear",
        every: float | None = None,
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        size: Literal["sm", "lg"] | None = None,
        icon: str | None = None,
        link: str | None = None,
        visible: bool = True,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        scale: int | None = None,
        min_width: int | None = None,
    ):
        super().__init__(
            value,
            every=every,
            variant=variant,
            size=size,
            icon=icon,
            link=link,
            visible=visible,
            interactive=interactive,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            scale=scale,
            min_width=min_width,
        )
        self.add(components)

    def add(self, components: None | Component | list[Component]) -> ClearButton:
        """
        Adds a component or list of components to the list of components that will be cleared when the button is clicked.
        """
        if not components:
            # This needs to be here because when the ClearButton is created in an gr.Interface, we don't
            # want to create dependencies for it before we have created the dependencies for the submit function.
            # We generally assume that the submit function dependency is the first thing created in an gr.Interface.
            return self

        if isinstance(components, Component):
            components = [components]
        none_values = []
        for component in components:
            none = component.postprocess(None)
            if isinstance(none, (GradioModel, GradioRootModel)):
                none = none.model_dump()
            none_values.append(none)
        clear_values = json.dumps(none_values)
        self.click(None, [], components, js=f"() => {clear_values}")
        return self

    def postprocess(self, value: str | None) -> str | None:
        return value

    def preprocess(self, payload: str | None) -> str | None:
        return payload

    def example_inputs(self) -> Any:
        return None
