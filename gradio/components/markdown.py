"""gr.Markdown() component."""

from __future__ import annotations

import inspect
from typing import Any, Callable

from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import StringSerializable
from typing_extensions import Literal

from gradio import utils
from gradio.components.base import Component, IOComponent, _Keywords
from gradio.events import (
    Changeable,
    Inputable,
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
        value: str | Callable = "",
        *,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Value to show in Markdown component. If callable, the function will be called whenever the app loads to set the initial value of the component.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.md = utils.get_markdown_parser()
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

    def get_config(self):
        return {
            "value": self.value,
            **Component.get_config(self),
        }

    @staticmethod
    def update(
        value: Any | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        visible: bool | None = None,
    ):
        updated_config = {
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def as_example(self, input_data: str | None) -> str:
        postprocessed = self.postprocess(input_data)
        return postprocessed if postprocessed else ""


@document("languages")
class Code(Changeable, Inputable, IOComponent, StringSerializable):
    """
    Creates a Code editor for entering, editing or viewing code.
    Preprocessing: passes a {str} of code into the function.
    Postprocessing: expects the function to return a {str} of code or a single-elment {tuple}: (string filepath,)
    """

    languages = [
        "python",
        "markdown",
        "json",
        "html",
        "css",
        "javascript",
        "typescript",
        "yaml",
        "dockerfile",
        "shell",
        "r",
        None,
    ]

    def __init__(
        self,
        value: str | tuple[str] | None = None,
        language: str | None = None,
        *,
        lines: int = 5,
        label: str | None = None,
        interactive: bool | None = None,
        show_label: bool = True,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default value to show in the code editor. If callable, the function will be called whenever the app loads to set the initial value of the component.
            language: The language to display the code as. Supported languages listed in `gr.Code.languages`.
            label: component name in interface.
            interactive: Whether user should be able to enter code or only view it.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        assert language in Code.languages, f"Language {language} not supported."
        self.language = language
        self.lines = lines
        IOComponent.__init__(
            self,
            label=label,
            interactive=interactive,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "value": self.value,
            "language": self.language,
            "lines": self.lines,
            **IOComponent.get_config(self),
        }

    def postprocess(self, y):
        if y is None:
            return None
        elif isinstance(y, tuple):
            with open(y[0]) as file_data:
                return file_data.read()
        else:
            return y.strip()

    @staticmethod
    def update(
        value: str
        | tuple[str]
        | None
        | Literal[_Keywords.NO_VALUE] = _Keywords.NO_VALUE,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        visible: bool | None = None,
        language: str | None = None,
        interactive: bool | None = None,
    ):
        return {
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "visible": visible,
            "value": value,
            "language": language,
            "interactive": interactive,
            "__type__": "update",
        }
