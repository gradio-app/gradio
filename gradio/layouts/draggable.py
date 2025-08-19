from __future__ import annotations

from typing import Literal

from gradio_client.documentation import document

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta


@document()
class Draggable(BlockContext, metaclass=ComponentMeta):
    """
    Draggable is a layout element within Blocks that renders children with drag and drop functionality.
    Children can be reordered by dragging them around and snapping them into place.
    The layout direction (horizontal/vertical) is inherited from the parent layout.
    
    Example:
        with gr.Blocks() as demo:
            with gr.Draggable():
                gr.Textbox(label="Item 1")
                gr.Textbox(label="Item 2")
                gr.Textbox(label="Item 3")
        demo.launch()
    Guides: controlling-layout
    """

    EVENTS = []

    def __init__(
        self,
        *,
        variant: Literal["default", "panel", "compact"] = "default",
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        height: int | str | None = None,
        max_height: int | str | None = None,
        min_height: int | str | None = None,
        show_progress: bool = False,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = None,
    ):
        """
        Parameters:
            variant: container type, 'default' (no background), 'panel' (gray background color and rounded corners), or 'compact' (rounded corners and no internal gap).
            visible: If False, draggable container will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, this layout will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            height: The height of the container, specified in pixels if a number is passed, or in CSS units if a string is passed. If content exceeds the height, the container will scroll vertically. If not set, the container will expand to fit the content.
            max_height: The maximum height of the container, specified in pixels if a number is passed, or in CSS units if a string is passed. If content exceeds the height, the container will scroll vertically. If content is shorter than the height, the container will shrink to fit the content. Will not have any effect if `height` is set and is smaller than `max_height`.
            min_height: The minimum height of the container, specified in pixels if a number is passed, or in CSS units if a string is passed. If content exceeds the height, the container will expand to fit the content. Will not have any effect if `height` is set and is larger than `min_height`.
            show_progress: If True, shows progress animation when being updated.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
        """
        self.variant = variant
        if variant == "compact":
            self.allow_expected_parents = False
        self.show_progress = show_progress
        self.height = height
        self.max_height = max_height
        self.min_height = min_height

        BlockContext.__init__(
            self,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
        )

    @staticmethod
    def update(
        visible: bool | None = None,
    ):
        return {
            "visible": visible,
            "__type__": "update",
        }