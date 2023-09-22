from __future__ import annotations

import warnings

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta
from gradio.deprecation import warn_style_method_deprecation


class Box(BlockContext, metaclass=ComponentMeta):
    """
    DEPRECATED.
    Box is a a layout element which places children in a box with rounded corners and
    some padding around them.
    Example:
        with gr.Box():
            gr.Textbox(label="First")
            gr.Textbox(label="Last")
    """

    EVENTS = []

    def __init__(
        self,
        *,
        visible: bool = True,
        elem_id: str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            visible: If False, box will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        warnings.warn("gr.Box is deprecated. Use gr.Group instead.", DeprecationWarning)
        BlockContext.__init__(self, visible=visible, elem_id=elem_id, **kwargs)

    @staticmethod
    def update(
        visible: bool | None = None,
    ):
        return {
            "visible": visible,
            "__type__": "update",
        }

    def style(self, **kwargs):
        warn_style_method_deprecation()
        return self
