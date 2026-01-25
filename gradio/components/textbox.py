"""gr.Textbox() component."""

from __future__ import annotations

import dataclasses
import warnings
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio.components.base import Component, FormComponent
from gradio.components.button import Button
from gradio.events import Events
from gradio.i18n import I18nData
from gradio.utils import set_default_buttons

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
@dataclasses.dataclass
class InputHTMLAttributes:
 
    """
    A dataclass for specifying HTML attributes for the input/textarea element. If any of these attributes are not provided, the browser will use the default value.
    Parameters:
        autocapitalize: Controls automatic capitalization of text as it is entered. Options: "off" or "none" (no caps), "on" (uses the browser's default behavior, usually sentence-level), "sentences" (first letter of sentences), "words" (first letter of each word), or "characters" (all caps).
        autocorrect: Whether to fix spelling errors automatically. Use "on" to enable or "off" to disable.
        spellcheck: Whether the browser should highlight spelling mistakes. Use True to enable or False to disable.
        autocomplete: Provides hints to the browser for predicted input, such as "on", "off", "email", or "current-password".
        tabindex: An integer specifying the order in which the component is focused when the user presses the 'Tab' key.
        enterkeyhint: Sets the label or icon of the "Enter" key on virtual keyboards. Options: "enter", "done", "go", "next", "previous", "search", or "send".
        lang: A language code (e.g., "en", "es") used by the browser to provide correct spellchecking and screen reader support.
        
        Examples:
        Disable autocorrect and spellcheck for code input:
        ```python
        gr.Textbox(
            html_attributes=gr.InputHTMLAttributes(
                autocorrect="off",
                spellcheck=False,
                autocapitalize="off"
            )
        )
        ```
        
        Email input with autocomplete:
        ```python
        gr.Textbox(
            type="email",
            html_attributes=gr.InputHTMLAttributes(
                autocomplete="email",
                enterkeyhint="next"
            )
        )
        ```
        
        Password input:
        ```python
        gr.Textbox(
            type="password",
            html_attributes=gr.InputHTMLAttributes(
                autocomplete="current-password",
                enterkeyhint="done"
            )
        )
        ```
        
        Chat input with send hint:
        ```python
        gr.Textbox(
            html_attributes=gr.InputHTMLAttributes(
                enterkeyhint="send",
                autocapitalize="sentences"
            )
        )
        ```
        
        Arabic text input:
        ```python
        gr.Textbox(
            rtl=True,
            html_attributes=gr.InputHTMLAttributes(
                lang="ar"
            )
        )
        ```
    """

    autocapitalize: (   
        Literal["off", "none", "on", "sentences", "words", "characters"] | None
    ) = None
    autocorrect: Literal["on", "off"] | None = None
    spellcheck: bool | None = None
    autocomplete: str | None = None
    tabindex: int | None = None
    enterkeyhint: (
        Literal["enter", "done", "go", "next", "previous", "search", "send"] | None
    ) = None
    lang: str | None = None


@document()
class Textbox(FormComponent):
    """
        A flexible component for entering or displaying text. 
        - As an input: Provides the typed text as a string (`str`) to the function.
        - As an output: Displays a string (`str`) returned by the function within the textbox.
        
        Supports plain text, masked passwords, and email-optimized formats.

        Demos: hello_world, diff_texts, sentence_builder
        Guides: quickstart
        
        Examples:
        Basic text input:
        ```python
        import gradio as gr
        
        def greet(name):
            return f"Hello {name}!"
        
        gr.Interface(fn=greet, inputs=gr.Textbox(label="Name"), outputs="text").launch()
        ```
        
        Multi-line textarea:
        ```python
        gr.Textbox(
            label="Enter your story",
            lines=5,
            max_lines=10,
            placeholder="Once upon a time..."
        )
        ```
        
        Password input:
        ```python
        gr.Textbox(
            type="password",
            label="Password",
            html_attributes=gr.InputHTMLAttributes(
                autocomplete="current-password"
            )
        )
        ```
        
        Chat interface:
        ```python
        gr.Textbox(
            placeholder="Type your message...",
            submit_btn="Send",
            stop_btn="Stop",
            autoscroll=True
        )
        ```
        
        Code editor (disable autocorrect/spellcheck):
        ```python
        gr.Textbox(
            lines=10,
            max_lines=50,
            label="Python Code",
            html_attributes=gr.InputHTMLAttributes(
                spellcheck=False,
                autocorrect="off",
                autocapitalize="off"
            )
        )
        ```
        
        Search box:
        ```python
        gr.Textbox(
            placeholder="Search...",
            submit_btn="🔍",
            html_attributes=gr.InputHTMLAttributes(
                enterkeyhint="search"
            )
        )
        ```
        """

    EVENTS = [
        Events.change,
        Events.input,
        Events.select,
        Events.submit,
        Events.focus,
        Events.blur,
        Events.stop,
        Events.copy,
    ]

    def __init__(
        self,
        value: str | I18nData | Callable | None = None,
        *,
        type: Literal["text", "password", "email"] = "text",
        lines: int = 1,
        max_lines: int | None = None,
        placeholder: str | I18nData | None = None,
        label: str | I18nData | None = None,
        info: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        autofocus: bool = False,
        autoscroll: bool = True,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        text_align: Literal["left", "right"] | None = None,
        rtl: bool = False,
        buttons: list[Literal["copy"] | Button] | None = None,
        max_length: int | None = None,
        submit_btn: str | bool | None = False,
        stop_btn: str | bool | None = False,
        html_attributes: InputHTMLAttributes | None = None,
    ):
        """
        Parameters:
            # Content & Value
            value: text to show in textbox. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            type: The type of textbox. One of: 'text' (which allows users to enter any text), 'password' (which masks text entered by the user), 'email' (which suggests email input to the browser). For "password" and "email" types, `lines` must be 1 and `max_lines` must be None or 1.
            placeholder: placeholder hint to provide behind textarea.
            
            # Layout & Size
            lines: minimum number of line rows to provide in textarea.
            max_lines: maximum number of line rows to provide in textarea. Must be at least `lines`. If not provided, the maximum number of lines is max(lines, 20) for "text" type, and 1 for "password" and "email" types.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            container: if True, will place the component in a container - providing some extra padding around the border.
            
            # Labels & Info
            label: the label for this component, displayed above the component if `show_label` is `True` and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component corresponds to.
            info: additional component description, appears below the label in smaller font. Supports markdown / HTML syntax.
            show_label: if True, will display the label. If False, the copy button is hidden as well as well as the label.
            
            # Interaction
            interactive: if True, will be rendered as an editable textbox; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            autofocus: If True, will focus on the textbox when the page loads. Use this carefully, as it can cause usability issues for sighted and non-sighted users.
            max_length: maximum number of characters (including newlines) allowed in the textbox. If None, there is no maximum length.
            
            # Buttons
            submit_btn: If False, will not show a submit button. If True, will show a submit button with an icon. If a string, will use that string as the submit button text. When the submit button is shown, the border of the textbox will be removed, which is useful for creating a chat interface.
            stop_btn: If False, will not show a stop button. If True, will show a stop button with an icon. If a string, will use that string as the stop button text. When the stop button is shown, the border of the textbox will be removed, which is useful for creating a chat interface.
            buttons: A list of buttons to show for the component. The only built-in button for this component is "copy", which allows the user to copy the text in the textbox. Custom gr.Button() can also provided, they will appear in the toolbar with their configured icon and/or label, and clicking them will trigger any .click() events registered on the button. Only applies if show_label is True. By default, no buttons are shown.
            
            # Text Formatting
            text_align: How to align the text in the textbox, can be: "left", "right", or None (default). If None, the alignment is left if `rtl` is False, or right if `rtl` is True. Can only be changed if `type` is "text".
            rtl: If True and `type` is "text", sets the direction of the text to right-to-left (cursor appears on the left of the text). Default is False, which renders cursor on the right.
            autoscroll: If True, will automatically scroll to the bottom of the textbox when the value changes, unless the user scrolls up. If False, will not scroll to the bottom of the textbox when the value changes.
            
            # HTML Attributes
            html_attributes: An instance of gr.InputHTMLAttributes, which can be used to set HTML attributes for the input/textarea elements. Example: InputHTMLAttributes(autocorrect="off", spellcheck=False) to disable autocorrect and spellcheck.
            
            # Advanced / Dynamic
            every: continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            
            # Rendering & Styling
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            
            # State Management (gr.render)
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
        """
        if type not in ["text", "password", "email"]:
            raise ValueError('`type` must be one of "text", "password", or "email".')
        if type in ["password", "email"]:
            if lines != 1:
                warnings.warn(
                    "The `lines` parameter must be 1 for `type` of 'password' or 'email'. Setting `lines` to 1."
                )
                lines = 1
            if max_lines not in [None, 1]:
                warnings.warn(
                    "The `max_lines` parameter must be None or 1 for `type` of 'password' or 'email'. Setting `max_lines` to 1."
                )
                max_lines = 1
        self.lines = lines
        self.max_lines = max_lines
        self.placeholder = placeholder
        self.buttons = set_default_buttons(buttons, None)
        self.submit_btn = submit_btn
        self.stop_btn = stop_btn
        self.autofocus = autofocus
        self.autoscroll = autoscroll

        super().__init__(
            label=label,
            info=info,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            value=value,
        )
        self.type = type
        self.rtl = rtl
        self.text_align = text_align
        self.max_length = max_length
        self.html_attributes = html_attributes

    def preprocess(self, payload: str | None) -> str | None:
        """
        Parameters:
            payload: the text entered in the textarea.
        Returns:
            Passes text value as a {str} into the function.
        """
        return None if payload is None else str(payload)

    def postprocess(self, value: str | None) -> str | None:
        """
        Parameters:
            value: Expects a {str} returned from function and sets textarea value to it.
        Returns:
            The value to display in the textarea.
        """
        return None if value is None else str(value)

    def api_info(self) -> dict[str, Any]:
        return {"type": "string"}

    def example_payload(self) -> Any:
        return "Hello!!"

    def example_value(self) -> Any:
        return "Hello!!"
