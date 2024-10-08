from __future__ import annotations

from typing import TYPE_CHECKING

from gradio.blocks import BlockContext, Blocks
from gradio.component_meta import ComponentMeta
from gradio.layouts.column import Column
from gradio.layouts.row import Row

if TYPE_CHECKING:
    from gradio.blocks import Block


class Form(BlockContext, metaclass=ComponentMeta):
    EVENTS = []

    def __init__(
        self,
        *,
        scale: int = 0,
        min_width: int = 0,
        render: bool = True,
    ):
        """
        Parameters:
            scale: relative width compared to adjacent Columns. For example, if Column A has scale=2, and Column B has scale=1, A will be twice as wide as B.
            min_width: minimum pixel width of Column, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in a column narrower than min_width, the min_width parameter will be respected first.
            render: If False, this layout will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
        """
        self.scale = scale
        self.min_width = min_width
        BlockContext.__init__(
            self,
            render=render,
        )

    def add_child(self, child: Block):
        if isinstance(self.parent, Row):
            scale = getattr(child, "scale", None)
            self.scale += 1 if scale is None else scale
            self.min_width += getattr(child, "min_width", 0) or 0
        elif (
            isinstance(self.parent, Column)
            and isinstance(self.parent.parent, Row)
            and self.parent.parent.equal_height
        ):
            scale = getattr(child, "scale", None)
            self.scale += 1 if scale is None else scale
        elif isinstance(self.parent, Blocks) and self.parent.fill_height:
            scale = getattr(child, "scale", None)
            self.scale += 0 if scale is None else scale
        BlockContext.add_child(self, child)
