from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable, Dict, List, Optional, Tuple

from gradio.blocks import BlockContext

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components import Component


class Row(BlockContext):
    """
    A layout element within Blocks that renders all children horizontally.
    """
    def __init__(self, visible: bool = True, css: Optional[Dict[str, str]] = None):
        """
        css: Css rules to apply to block.
        """
        super().__init__(visible, css)

    def get_template_context(self):
        return {"type": "row", **super().get_template_context()}


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
        super().__init__(visible, css)

    def get_template_context(self):
        return {
            "type": "column",
            "variant": self.variant,
            **super().get_template_context(),
        }


class Tabs(BlockContext):
    """
    A layout element within Blocks that can contain multiple TabItem()'s which get
    rendered as tabs. The TabItem()'s must be nested within the Tabs() context.
    """    
    
    def __init__(self, visible: bool = True, css: Optional[Dict[str, str]] = None):
        """
        css: css rules to apply to block.
        """
        super().__init__(visible, css)

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
    A layout element that creates a tab within the parent Tab() context. All children
    are rendered within the tab vertically by default.
    """    
    
    def __init__(
        self, label, visible: bool = True, css: Optional[Dict[str, str]] = None
    ):
        """
        css: Css rules to apply to block.
        """
        super().__init__(visible, css)
        self.label = label

    def get_template_context(self):
        return {"label": self.label, **super().get_template_context()}

    def select(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("select", fn, inputs, outputs)
