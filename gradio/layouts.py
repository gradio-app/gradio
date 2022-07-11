from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable, Dict, List, Optional, Tuple

from gradio.blocks import BlockContext
from gradio.documentation import document, set_documentation_group

set_documentation_group("layout")

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components import Component

valid_colors = [
    "red",
    "green",
    "blue",
    "yellow",
    "purple",
    "teal",
    "orange",
    "cyan",
    "lime",
    "pink",
    "black",
    "grey",
    "gray",
]


@document()
class Row(BlockContext):
    """
    Row is a layout element within Blocks that renders all children horizontally.
    Example:
        with gradio.Blocks() as demo:
            with gradio.Row():
                gr.Image("lion.jpg")
                gr.Image("tiger.jpg")
        demo.launch()
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
        mobile_collapse: Optional[bool] = True,
    ):
        if equal_height is not None:
            self._style["equal_height"] = equal_height
        if mobile_collapse is not None:
            self._style["mobile_collapse"] = mobile_collapse

        return self


@document()
class Column(BlockContext):
    """
    Column is a layout element within Blocks that renders all children vertically.
    Example:
        with gradio.Blocks() as demo:
            with gradio.Row():
                with gradio.Column():
                    text1 = gr.Textbox()
                    text2 = gr.Textbox()
                with gradio.Column():
                    btn1 = gr.Button("Button 1")
                    btn2 = gr.Button("Button 2")
    """

    def __init__(
        self,
        visible: bool = True,
        variant: str = "default",
    ):
        """
        Parameters:
            visible: TODO: @abidlabs
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


@document()
class Tabs(BlockContext):
    """
    Tabs is a layout element within Blocks that can contain multiple TabItem's. Each
    TabItem gets rendered as a individual tab. The TabItem's must be nested within the
    Tabs context.
    Example:
        with gradio.Blocks() as demo:
            with gradio.Tabs():
                with gradio.TabItem("Lion"):
                    gr.Image("lion.jpg")
                    gr.Button("New Lion")
                with gradio.TabItem("Tiger"):
                    gr.Image("tiger.jpg")
                    gr.Button("New Tiger")
    """

    def __init__(self, selected: Optional[int | str] = None, **kwargs):
        """
        Parameters:
            selected: The currently selected tab. Must correspond to an id passed to the one of the child TabItems. Defaults to the first TabItem.
        """
        super().__init__(**kwargs)
        self.selected = selected

    def get_config(self):
        return {"selected": self.selected, **super().get_config()}

    def update(
        selected: Optional[int | str] = None,
    ):
        return {
            "selected": selected,
            "__type__": "update",
        }

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

    def __init__(self, label: str, id: Optional[int | str] = None, **kwargs):
        """
        Parameters:
            label: The visual label for the tab
            id: An optional identifier for the tab, required if you wish to control the selected tab from a predict function.
        """
        super().__init__(**kwargs)
        self.label = label
        self.id = id

    def get_config(self):
        return {"label": self.label, "id": self.id, **super().get_config()}

    def select(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("select", fn, inputs, outputs)


@document()
class Group(BlockContext):
    """
    Group is a layout element within Blocks which groups together children so that
    they do not have any padding or margin between them.
    Example:
        with gradio.Group():
            gr.Textbox(label="First")
            gr.Textbox(label="Last")
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

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        margin: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
    ):

        if rounded is not None:
            self._style["rounded"] = rounded
        if margin is not None:
            self._style["margin"] = margin

        return self


@document()
class Box(BlockContext):
    """
    Box is a a layout element which places children in a box with rounded corners and
    some padding around them.
    Example:
        with gradio.Box():
            gr.Textbox(label="First")
            gr.Textbox(label="Last")
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

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        margin: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        border: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
    ):
        if rounded is not None:
            self._style["rounded"] = rounded
        if margin is not None:
            self._style["margin"] = margin
        if border is not None:
            self._style["border"] = border
        return self
