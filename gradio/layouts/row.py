from __future__ import annotations

from typing import Literal

from gradio_client.documentation import document

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta


@document()
class Row(BlockContext, metaclass=ComponentMeta):
    """
    Row is a layout element within Blocks that renders all children horizontally.
    Example:
        with gr.Blocks() as demo:
            with gr.Row():
                gr.Image("lion.jpg", scale=2)
                gr.Image("tiger.jpg", scale=1)
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
        equal_height: bool = False,
        show_progress: bool = False,
    ):
        """
        Parameters:
            variant: row type, 'default' (no background), 'panel' (gray background color and rounded corners), or 'compact' (rounded corners and no internal gap).
            visible: If False, row will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, this layout will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            height: The height of the row, specified in pixels if a number is passed, or in CSS units if a string is passed. If content exceeds the height, the row will scroll vertically. If not set, the row will expand to fit the content.
            max_height: The maximum height of the row, specified in pixels if a number is passed, or in CSS units if a string is passed. If content exceeds the height, the row will scroll vertically. If content is shorter than the height, the row will shrink to fit the content. Will not have any effect if `height` is set and is smaller than `max_height`.
            min_height: The minimum height of the row, specified in pixels if a number is passed, or in CSS units if a string is passed. If content exceeds the height, the row will expand to fit the content. Will not have any effect if `height` is set and is larger than `min_height`.
            equal_height: If True, makes every child element have equal height
            show_progress: If True, shows progress animation when being updated.
        """
        self.variant = variant
        self.equal_height = equal_height
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
        )

    @staticmethod
    def update(
        visible: bool | None = None,
    ):
        return {
            "visible": visible,
            "__type__": "update",
        }
