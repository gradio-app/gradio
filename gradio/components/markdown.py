"""gr.Markdown() component."""

from __future__ import annotations

import inspect
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events
from gradio.i18n import I18nData

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class Markdown(Component):
    """
    Used to render arbitrary Markdown output. Can also render latex enclosed by dollar signs. As this component does not accept user input,
    it is rarely used as an input component.

    Demos: blocks_hello, blocks_kinematics
    Guides: key-features
    """

    EVENTS = [
        Events.change,
        Events.copy,
    ]

    def __init__(
        self,
        value: str | I18nData | Callable | None = None,
        *,
        label: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        rtl: bool = False,
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        sanitize_html: bool = True,
        line_breaks: bool = False,
        header_links: bool = False,
        height: int | str | None = None,
        max_height: int | str | None = None,
        min_height: int | str | None = None,
        show_copy_button: bool = False,
        container: bool = False,
        padding: bool = False,
    ):
        """
        Parameters:
            value: Value to show in Markdown component. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            label: This parameter has no effect
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: This parameter has no effect.
            rtl: If True, sets the direction of the rendered text to right-to-left. Default is False, which renders text left-to-right.
            latex_delimiters: A list of dicts of the form {"left": open delimiter (str), "right": close delimiter (str), "display": whether to display in newline (bool)} that will be used to render LaTeX expressions. If not provided, `latex_delimiters` is set to `[{ "left": "$$", "right": "$$", "display": True }]`, so only expressions enclosed in $$ delimiters will be rendered as LaTeX, and in a new line. Pass in an empty list to disable LaTeX rendering. For more information, see the [KaTeX documentation](https://katex.org/docs/autorender.html).
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            sanitize_html: If False, will disable HTML sanitization when converted from markdown. This is not recommended, as it can lead to security vulnerabilities.
            line_breaks: If True, will enable Github-flavored Markdown line breaks in chatbot messages. If False (default), single new lines will be ignored.
            header_links: If True, will automatically create anchors for headings, displaying a link icon on hover.
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If markdown content exceeds the height, the component will scroll.
            max_height: The maximum height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If markdown content exceeds the height, the component will scroll. If markdown content is shorter than the height, the component will shrink to fit the content. Will not have any effect if `height` is set and is smaller than `max_height`.
            min_height: The minimum height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If markdown content exceeds the height, the component will expand to fit the content. Will not have any effect if `height` is set and is larger than `min_height`.
            show_copy_button: If True, includes a copy button to copy the text in the Markdown component. Default is False.
            container: If True, the Markdown component will be displayed in a container. Default is False.
            padding: If True, the Markdown component will have a certain padding (set by the `--block-padding` CSS variable) in all directions. Default is False.
        """
        self.rtl = rtl
        if latex_delimiters is None:
            latex_delimiters = [{"left": "$$", "right": "$$", "display": True}]
        self.latex_delimiters = latex_delimiters
        self.sanitize_html = sanitize_html
        self.line_breaks = line_breaks
        self.header_links = header_links
        self.height = height
        self.max_height = max_height
        self.min_height = min_height
        self.show_copy_button = show_copy_button
        self.padding = padding

        super().__init__(
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            value=value,
            container=container,
        )

    def preprocess(self, payload: str | None) -> str | None:
        """
        Parameters:
            payload: the `str` of Markdown corresponding to the displayed value.
        Returns:
            Passes the `str` of Markdown corresponding to the displayed value.
        """
        return payload

    def postprocess(self, value: str | I18nData | None) -> str | dict | None:
        """
        Parameters:
            value: Expects a valid `str` that can be rendered as Markdown.
        Returns:
            The same `str` as the input, but with leading and trailing whitespace removed.
            If an I18nData object is provided, returns it serialized for the frontend to translate.
        """
        if value is None:
            return None

        if isinstance(value, I18nData):
            # preserve the I18nData object for frontend translation
            return str(value)

        unindented_y = inspect.cleandoc(value)
        return unindented_y

    def example_payload(self) -> Any:
        return "# Hello!"

    def example_value(self) -> Any:
        return "# Hello!"

    def api_info(self) -> dict[str, Any]:
        return {"type": "string"}
