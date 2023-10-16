from __future__ import annotations

from typing import Literal

from gradio_client.documentation import document, set_documentation_group

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta
from gradio.deprecation import warn_style_method_deprecation

set_documentation_group("layout")


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
        equal_height: bool = True,
        **kwargs,
    ):
        """
        Parameters:
            variant: row type, 'default' (no background), 'panel' (gray background color and rounded corners), or 'compact' (rounded corners and no internal gap).
            visible: If False, row will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM. Can be used for targeting CSS styles.
            equal_height: If True, makes every child element have equal height
        """
        self.variant = variant
        self.equal_height = equal_height
        if variant == "compact":
            self.allow_expected_parents = False
        BlockContext.__init__(
            self, visible=visible, elem_id=elem_id, elem_classes=elem_classes, **kwargs
        )

    @staticmethod
    def update(
        visible: bool | None = None,
    ):
        return {
            "visible": visible,
            "__type__": "update",
        }

    def style(
        self,
        *,
        equal_height: bool | None = None,
        **kwargs,
    ):
        """
        Styles the Row.
        Parameters:
            equal_height: If True, makes every child element have equal height
        """
        warn_style_method_deprecation()
        if equal_height is not None:
            self.equal_height = equal_height
        return self
