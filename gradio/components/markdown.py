"""gr.Markdown() component."""

from __future__ import annotations

import inspect
from typing import Any, Callable

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events


@document()
class Markdown(Component):
    """
    Used to render arbitrary Markdown output. Can also render latex enclosed by dollar signs. As this component does not accept user input,
    it is rarely used as an input component.

    Demos: blocks_hello, blocks_kinematics
    Guides: key-features
    """

    EVENTS = [Events.change]

    def __init__(
        self,
        value: str | Callable | None = None,
        *,
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        rtl: bool = False,
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        sanitize_html: bool = True,
        line_breaks: bool = False,
        header_links: bool = False,
    ):
        """
        Parameters:
            value: Value to show in Markdown component. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: The label for this component. Is used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: This parameter has no effect.
            rtl: If True, sets the direction of the rendered text to right-to-left. Default is False, which renders text left-to-right.
            latex_delimiters: A list of dicts of the form {"left": open delimiter (str), "right": close delimiter (str), "display": whether to display in newline (bool)} that will be used to render LaTeX expressions. If not provided, `latex_delimiters` is set to `[{ "left": "$$", "right": "$$", "display": True }]`, so only expressions enclosed in $$ delimiters will be rendered as LaTeX, and in a new line. Pass in an empty list to disable LaTeX rendering. For more information, see the [KaTeX documentation](https://katex.org/docs/autorender.html).
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            sanitize_html: If False, will disable HTML sanitization when converted from markdown. This is not recommended, as it can lead to security vulnerabilities.
            line_breaks: If True, will enable Github-flavored Markdown line breaks in chatbot messages. If False (default), single new lines will be ignored.
            header_links: If True, will automatically create anchors for headings, displaying a link icon on hover.
        """
        self.rtl = rtl
        if latex_delimiters is None:
            latex_delimiters = [{"left": "$$", "right": "$$", "display": True}]
        self.latex_delimiters = latex_delimiters
        self.sanitize_html = sanitize_html
        self.line_breaks = line_breaks
        self.header_links = header_links

        super().__init__(
            label=label,
            every=every,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            value=value,
        )

    def preprocess(self, payload: str | None) -> str | None:
        """
        Parameters:
            payload: the `str` of Markdown corresponding to the displayed value.
        Returns:
            Passes the `str` of Markdown corresponding to the displayed value.
        """
        return payload

    def postprocess(self, value: str | None) -> str | None:
        """
        Parameters:
            value: Expects a valid `str` that can be rendered as Markdown.
        Returns:
            The same `str` as the input, but with leading and trailing whitespace removed.
        """
        if value is None:
            return None
        unindented_y = inspect.cleandoc(value)
        return unindented_y

    def example_payload(self) -> Any:
        return "# Hello!"

    def example_value(self) -> Any:
        return "# Hello!"

    def api_info(self) -> dict[str, Any]:
        return {"type": "string"}
