"""gr.Markdown() component."""

from __future__ import annotations

import inspect
from typing import Any, Callable, Literal

from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import StringSerializable

from gradio import utils
from gradio.blocks import default, DEFAULT, DefaultType
from gradio.components.base import Component, IOComponent
from gradio.events import (
    Changeable,
)

set_documentation_group("component")


@document()
class Markdown(IOComponent, Changeable, StringSerializable):
    """
    Used to render arbitrary Markdown output. Can also render latex enclosed by dollar signs.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a valid {str} that can be rendered as Markdown.

    Demos: blocks_hello, blocks_kinematics
    Guides: key-features
    """

    def __init__(
        self,
        value: str | Callable | None | DefaultType = DEFAULT,
        *,
        visible: bool | None = None,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        rtl: bool | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Value to show in Markdown component. If callable, the function will be called whenever the app loads to set the initial value of the component.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            rtl: If True, sets the direction of the rendered text to right-to-left. Default is False, which renders text left-to-right.
        """
        value = default(value, "")
        visible = default(visible, True)
        self.rtl = default(rtl, False)

        self.md = utils.get_markdown_parser()
        self.rtl = rtl
        IOComponent.__init__(
            self,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )

    def postprocess(self, y: str | None) -> str | None:
        """
        Parameters:
            y: markdown representation
        Returns:
            HTML rendering of markdown
        """
        if y is None:
            return None
        unindented_y = inspect.cleandoc(y)
        return self.md.render(unindented_y)

    def as_example(self, input_data: str | None) -> str:
        postprocessed = self.postprocess(input_data)
        return postprocessed if postprocessed else ""
