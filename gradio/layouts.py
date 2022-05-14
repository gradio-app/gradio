from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable, Dict, List, Optional, Tuple

from gradio.blocks import BlockContext

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components import Component



class Row(BlockContext):
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

    def style(self, equal_height: Optional[bool] = None):
        if equal_height is not None:
            self._style["equal_height"] = equal_height
        return self


class Column(BlockContext):
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
