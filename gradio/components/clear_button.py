""" Predefined buttons with bound events that can be included in a gr.Blocks for convenience. """

from __future__ import annotations

import json
from typing import Literal

from gradio_client.documentation import document, set_documentation_group
from gradio.blocks import Default, get
from gradio.components import Button, Component

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
        components: None | list[Component] | Component | Default = Default(None),
        *,
        value: str | None | Default = Default("Clear"),
        variant: Literal["primary", "secondary", "stop"] | Default = Default("secondary"),
        size: Literal["sm", "lg"] | Default = Default(None),
        visible: bool | Default = Default(True),
        interactive: bool | None | Default = Default(True),
        elem_id: str | None | Default = Default(None),
        elem_classes: list[str] | str | None | Default = Default(None),
        scale: int | None | Default = Default(None),
        min_width: int | Default = Default(160),
        **kwargs,
    ):
        components = get(components)
        super().__init__(
            value,
            variant=variant,
            size=size,
            visible=visible,
            interactive=interactive,
            elem_id=elem_id,
            elem_classes=elem_classes,
            scale=scale,
            min_width=min_width,
            **kwargs,
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
        clear_values = json.dumps(
            [component.postprocess(None) for component in components]
        )
        self.click(None, [], components, _js=f"() => {clear_values}")
        return self
