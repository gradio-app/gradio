from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable, Dict, List, Optional, Tuple

from gradio.blocks import BlockContext

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components import Component


class Row(BlockContext):
    """
    A layout element within Blocks that renders all children horizontally.
    """

    def get_config(self):
        return {"type": "row", **super().get_config()}

    @staticmethod
    def update(
        css: Optional[Dict] = None,
        visible: Optional[bool] = None,
    ):
        return {
            "css": css,
            "visible": visible,
            "__type__": "update",
        }


class Column(BlockContext):
    """
    A layout element within Blocks that renders all children vertically.
    """

    def __init__(
        self,
        visible: bool = True,
        css: Optional[Dict[str, str]] = None,
        variant: str = "default",
    ):
        """
        css: Css rules to apply to block.
        variant: column type, 'default' (no background) or 'panel' (gray background color and rounded corners)
        """
        self.variant = variant
        super().__init__(visible=visible, css=css)

    def get_config(self):
        return {
            "type": "column",
            "variant": self.variant,
            **super().get_config(),
        }

    @staticmethod
    def update(
        variant: Optional[str] = None,
        css: Optional[Dict] = None,
        visible: Optional[bool] = None,
    ):
        return {
            "variant": variant,
            "css": css,
            "visible": visible,
            "__type__": "update",
        }


class Tabs(BlockContext):
    """
    Tabs are a layout element within Blocks that contain multiple TabItem()'s which get
    rendered as tabs. The TabItem()'s must be nested within the Tabs() context.
    """

    def change(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("change", fn, inputs, outputs)


class TabItem(BlockContext):
    """
    A layout element that creates a tab within the parent Tabs() context. All children
    are rendered within the tab vertically by default.
    """

    def __init__(self, label, **kwargs):
        super().__init__(**kwargs)
        self.label = label

    def get_config(self):
        return {"label": self.label, **super().get_config()}

    def select(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("select", fn, inputs, outputs)
