from __future__ import annotations

from typing import Literal

from gradio_client.documentation import document

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta
from gradio.events import Events
from gradio.i18n import I18nData


@document()
class Sidebar(BlockContext, metaclass=ComponentMeta):
    """
    Sidebar is a collapsible panel that renders child components on the left side of the screen within a Blocks layout.
    Example:
        with gr.Blocks() as demo:
            with gr.Sidebar():
                gr.Textbox()
                gr.Button()
    Guides: controlling-layout
    """

    EVENTS = [Events.expand, Events.collapse]

    def __init__(
        self,
        label: str | I18nData | None = None,
        *,
        open: bool = True,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        width: int | str = 320,
        position: Literal["left", "right"] = "left",
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = None,
    ):
        """
        Parameters:
            label: name of the sidebar. Not displayed to the user.
            open: if True, sidebar is open by default.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, this layout will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            width: The width of the sidebar, specified in pixels if a number is passed, or in CSS units if a string is passed.
            position: The position of the sidebar in the layout, either "left" or "right". Defaults to "left".
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
        """
        self.label = label
        self.open = open
        self.width = width
        self.position = position
        BlockContext.__init__(
            self,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
        )
