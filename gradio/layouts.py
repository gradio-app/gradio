from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable, Dict, List, Optional, Tuple

from gradio.blocks import BlockContext

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components import Component


class Row(BlockContext):
    """
    Row is a layout element within Blocks that renders all children horizontally.
    """
    def get_config(self):
        return {"type": "row", **super().get_config()}

    @staticmethod
    def update(
        visible: Optional[bool] = None,
    ):
        return {
            "visible": visible,
            "__type__": "update",
        }

    def style(
        self,
        equal_height: Optional[bool] = None,
        mobile_collapse: Optional[bool] = None,
    ):
        if equal_height is not None:
            self._style["equal_height"] = equal_height
        if mobile_collapse is not None:
            self._style["mobile_collapse"] = mobile_collapse

        return self


class Column(BlockContext):
    """
    Column is a layout element within Blocks that renders all children vertically.
    """
    def __init__(
        self,
        visible: bool = True,
        variant: str = "default",
    ):
        """
        variant: column type, 'default' (no background) or 'panel' (gray background color and rounded corners)
        """
        self.variant = variant
        super().__init__(visible=visible)

    def get_config(self):
        return {
            "type": "column",
            "variant": self.variant,
            **super().get_config(),
        }

    @staticmethod
    def update(
        variant: Optional[str] = None,
        visible: Optional[bool] = None,
    ):
        return {
            "variant": variant,
            "visible": visible,
            "__type__": "update",
        }


class Tabs(BlockContext):
    """
    Tabs is a layout element within Blocks that can contain multiple TabItem's. Each
    TabItem gets rendered as a individual tab. The TabItem's must be nested within the 
    Tabs context.
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
    TabItem is a layout element that must be defined within a Tabs context. The
    components defined within the TabItem will be rendered within a tab.
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


class Group(BlockContext):
    """
    Group is a layout element within Blocks which groups together children so that 
    they do not have any padding or margin between them.
    """
    def get_config(self):
        return {"type": "group", **super().get_config()}

    @staticmethod
    def update(
        visible: Optional[bool] = None,
    ):
        return {
            "visible": visible,
            "__type__": "update",
        }


class Box(BlockContext):
    """
    Box is a a layout element which places children in a box with rounded corners and 
    some padding around them.    
    """
    def get_config(self):
        return {"type": "box", **super().get_config()}

    @staticmethod
    def update(
        visible: Optional[bool] = None,
    ):
        return {
            "visible": visible,
            "__type__": "update",
        }
