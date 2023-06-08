""" Predefined buttons with bound events that can be included in a gr.Blocks for convenience. """

from typing_extensions import Literal

import json
from gradio_client.documentation import document, set_documentation_group

from gradio.components import Button, Component

set_documentation_group("buttons")


class ClearButton(Button):
    """
    Button that clears the value of a component or a list of components when clicked.
    """

    def __init__(
        self,
        components: list[Component] | Component,
        *,
        value: str = "Clear",
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        size: Literal["sm", "lg"] | None = None,
        visible: bool = True,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        **kwargs,
    ):
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
        if isinstance(components, Component):
            components = [components]
        clear_js = json.dumps(
            [getattr(component, "cleared_value", None) for component in components]
        )
        self.click(None, [], components, _js=f"() => {clear_js}")
