from __future__ import annotations

from gradio_client.documentation import document

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta
from gradio.events import Events


@document()
class Sidebar(BlockContext, metaclass=ComponentMeta):
    """
    Sidebar is a layout element within Blocks that renders all children in a panel on the left side of the screen that can be expanded or collapsed.
    Example:
        with gr.Blocks() as demo:
            with gr.Sidebar():
                gr.Textbox()
                gr.Button()
    """
    EVENTS = [Events.expand, Events.collapse]

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
            label: name of the sidebar.
            open: if True, sidebar is open by default.
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
