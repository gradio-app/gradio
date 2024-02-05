from __future__ import annotations

from gradio_client.documentation import document

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta
from gradio.events import Events


class Tabs(BlockContext, metaclass=ComponentMeta):
    """
    Tabs is a layout element within Blocks that can contain multiple "Tab" Components.
    """

    EVENTS = [Events.change, Events.select]

    def __init__(
        self,
        *,
        selected: int | str | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
    ):
        """
        Parameters:
            selected: The currently selected tab. Must correspond to an id passed to the one of the child TabItems. Defaults to the first TabItem.
            visible: If False, Tabs will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, this layout will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
        """
        BlockContext.__init__(
            self,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
        )
        self.selected = selected


@document()
class Tab(BlockContext, metaclass=ComponentMeta):
    """
    Tab (or its alias TabItem) is a layout element. Components defined within the Tab will be visible when this tab is selected tab.
    Example:
        with gr.Blocks() as demo:
            with gr.Tab("Lion"):
                gr.Image("lion.jpg")
                gr.Button("New Lion")
            with gr.Tab("Tiger"):
                gr.Image("tiger.jpg")
                gr.Button("New Tiger")
    Guides: controlling-layout
    """

    EVENTS = [Events.select]

    def __init__(
        self,
        label: str | None = None,
        visible: bool = True,
        interactive: bool = True,
        *,
        id: int | str | None = None,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
    ):
        """
        Parameters:
            label: The visual label for the tab
            id: An optional identifier for the tab, required if you wish to control the selected tab from a predict function.
            elem_id: An optional string that is assigned as the id of the <div> containing the contents of the Tab layout. The same string followed by "-button" is attached to the Tab button. Can be used for targeting CSS styles.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, this layout will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            visible: If False, Tab will be hidden.
            interactive: If False, Tab will not be clickable.
        """
        BlockContext.__init__(
            self,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
        )
        self.label = label
        self.id = id
        self.visible = visible
        self.interactive = interactive

    def get_expected_parent(self) -> type[Tabs]:
        return Tabs

    def get_block_name(self):
        return "tabitem"


TabItem = Tab
