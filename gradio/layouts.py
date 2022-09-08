from __future__ import annotations

import warnings
from typing import TYPE_CHECKING, Any, Callable, Dict, List, Optional, Tuple

from gradio.blocks import BlockContext
from gradio.documentation import document, set_documentation_group

set_documentation_group("layout")

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components import Component


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
    Guides: controlling_layout
    """

    def __init__(self, *, elem_id: Optional[str] = None, **kwargs):
        """
        Parameters:
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        super().__init__(elem_id=elem_id)

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
        """
        Styles the Row.
        Parameters:
            equal_height: If True, makes every child element have equal height
            mobile_collapse: DEPRECATED.
        """
        if equal_height is not None:
            self._style["equal_height"] = equal_height
        if mobile_collapse is not None:
            warnings.warn("mobile_collapse is no longer supported.", DeprecationWarning)
        return self


@document()
class Column(BlockContext):
    """
    Column is a layout element within Blocks that renders all children vertically. The widths of columns can be set through the `scale` and `min_width` parameters.
    Example:
        with gradio.Blocks() as demo:
            with gradio.Row():
                with gradio.Column(scale=1):
                    text1 = gr.Textbox()
                    text2 = gr.Textbox()
                with gradio.Column(scale=4):
                    btn1 = gr.Button("Button 1")
                    btn2 = gr.Button("Button 2")
    Guides: controlling_layout
    """

    def __init__(
        self,
        *,
        scale: int = 1,
        min_width: int = 320,
        visible: bool = True,
        variant: str = "default",
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            scale: relative width compared to adjacent Columns. For example, if Column A has scale=2, and Column B has scale=1, A will be twice as wide as B.
            min_width: minimum pixel width of Column, will wrap if not sufficient screen space to satisfy this value.
            visible: If False, column will be hidden.
            variant: column type, 'default' (no background) or 'panel' (gray background color and rounded corners)
        """
        self.scale = scale
        self.min_width = min_width
        self.variant = variant
        super().__init__(visible=visible, elem_id=elem_id)

    def get_config(self):
        return {
            "type": "column",
            "variant": self.variant,
            "scale": self.scale,
            "min_width": self.min_width,
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
    Tabs is a layout element within Blocks that can contain multiple "Tab" Components.
    """

    def __init__(
        self,
        selected: Optional[int | str] = None,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
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
    expected_parent = Tabs

    def __init__(
        self,
        label: str,
        id: Optional[int | str] = None,
        **kwargs,
    ):
        """
        Parameters:
            label: The visual label for the tab
            id: An optional identifier for the tab, required if you wish to control the selected tab from a predict function.
        """
        super().__init__(**kwargs)
        self.label = label
        self.id = id

    def get_config(self):
        return {
            "label": self.label,
            "id": self.id,
            **super().get_config(),
        }

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
class Tab(TabItem):
    """
    Tab is a layout element. Components defined within the Tab will be visible when this tab is selected tab.
    Example:
        with gradio.Blocks() as demo:
            with gradio.Tab("Lion"):
                gr.Image("lion.jpg")
                gr.Button("New Lion")
            with gradio.Tab("Tiger"):
                gr.Image("tiger.jpg")
                gr.Button("New Tiger")
    Guides: controlling_layout
    """

    pass


Tab = TabItem  # noqa: F811


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


class Form(BlockContext):
    def get_config(self):
        return {"type": "form", **super().get_config()}


@document()
class Accordion(BlockContext):
    """
    Accordion is a layout element which can be toggled to show/hide the contained content.
    Example:
        with gradio.Accordion("See Details"):
            gr.Markdown("lorem ipsum")
    """

    def __init__(
        self, label, *, open: bool = True, elem_id: Optional[str] = None, **kwargs
    ):
        """
        Parameters:
            label: name of accordion section.
            open: if True, accordion is open by default.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.label = label
        self.open = open
        super().__init__(elem_id=elem_id, **kwargs)

    def get_config(self):
        return {
            "type": "accordion",
            "open": self.open,
            "label": self.label,
            **super().get_config(),
        }

    @staticmethod
    def update(
        open: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        return {
            "visible": visible,
            "open": open,
            "__type__": "update",
        }
