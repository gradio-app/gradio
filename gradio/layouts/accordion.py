from __future__ import annotations

from typing import TYPE_CHECKING

from gradio_client.documentation import document

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta

if TYPE_CHECKING:
    pass


@document()
class Accordion(BlockContext, metaclass=ComponentMeta):
    """
    Accordion is a layout element which can be toggled to show/hide the contained content.
    Example:
        with gr.Accordion("See Details"):
            gr.Markdown("lorem ipsum")
    """

    EVENTS = []

    def __init__(
        self,
        label: str | None = None,
        *,
        open: bool = True,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
    ):
        """
        Parameters:
            label: name of accordion section.
            open: if True, accordion is open by default.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, this layout will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
        """
        self.label = label
        self.open = open
        BlockContext.__init__(
            self,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
        )
