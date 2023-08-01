"""gr.Interpretation() component"""

from __future__ import annotations

from typing import Any, Literal

from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import SimpleSerializable

from gradio.blocks import default
from gradio.components.base import Component, _Keywords

set_documentation_group("component")


@document()
class Interpretation(Component, SimpleSerializable):
    """
    Used to create an interpretation widget for a component.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {dict} with keys "original" and "interpretation".

    Guides: custom-interpretations-with-blocks
    """

    def __init__(
        self,
        component: Component,
        *,
        visible: bool | None = None,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            component: Which component to show in the interpretation widget.
            visible: Whether or not the interpretation is visible.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        visible = default(visible, True)

        Component.__init__(
            self, visible=visible, elem_id=elem_id, elem_classes=elem_classes, **kwargs
        )
        self.component = component

