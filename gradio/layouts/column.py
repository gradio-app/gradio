from __future__ import annotations

from typing import Literal

from gradio_client.documentation import document, set_documentation_group

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta
from gradio.deprecation import warn_deprecation

set_documentation_group("layout")


@document()
class Column(BlockContext, metaclass=ComponentMeta):
    """
    Column is a layout element within Blocks that renders all children vertically. The widths of columns can be set through the `scale` and `min_width` parameters.
    If a certain scale results in a column narrower than min_width, the min_width parameter will win.
    Example:
        with gr.Blocks() as demo:
            with gr.Row():
                with gr.Column(scale=1):
                    text1 = gr.Textbox()
                    text2 = gr.Textbox()
                with gr.Column(scale=4):
                    btn1 = gr.Button("Button 1")
                    btn2 = gr.Button("Button 2")
    Guides: controlling-layout
    """

    EVENTS = ["baz"]

    def __init__(
        self,
        *,
        scale: int = 1,
        min_width: int = 320,
        variant: Literal["default", "panel", "compact"] = "default",
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            scale: relative width compared to adjacent Columns. For example, if Column A has scale=2, and Column B has scale=1, A will be twice as wide as B.
            min_width: minimum pixel width of Column, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in a column narrower than min_width, the min_width parameter will be respected first.
            variant: column type, 'default' (no background), 'panel' (gray background color and rounded corners), or 'compact' (rounded corners and no internal gap).
            visible: If False, column will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        if scale != round(scale):
            warn_deprecation(
                f"'scale' value should be an integer. Using {scale} will cause issues."
            )

        self.scale = scale
        self.min_width = min_width
        self.variant = variant
        if variant == "compact":
            self.allow_expected_parents = False
        BlockContext.__init__(
            self, visible=visible, elem_id=elem_id, elem_classes=elem_classes, **kwargs
        )

    @staticmethod
    def update(
        variant: str | None = None,
        visible: bool | None = None,
    ):
        return {
            "variant": variant,
            "visible": visible,
            "__type__": "update",
        }
