"""gr.HTML() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.components.button import Button
from gradio.events import all_events
from gradio.i18n import I18nData
from gradio.utils import set_default_buttons

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class HTML(Component):
    """
    Creates a component with arbitrary HTML. Can include CSS and JavaScript to create highly customized and interactive components.
    Example:
        ```python
        import gradio as gr

        with gr.Blocks() as demo:
            basic_html = gr.HTML("<h2>This is a basic HTML component</h2>")

            button_set = gr.HTML(["Option 1", "Option 2", "Option 3"],
                           html_template="{{#each value}}<button class='option-btn'>{{this}}</button>{{/each}}",
                           css_template="button { margin: 5px; padding: 10px; }",
                           js_on_load="element.querySelectorAll('.option-btn').forEach(btn => { btn.addEventListener('click', () => { trigger('click', {option: btn.innerText}); }); });")
            clicked_option = gr.Textbox(label="Clicked Option")
            def on_button_click(evt: gr.EventData):
                return evt.option
            button_set.click(on_button_click, outputs=clicked_option)

        demo.launch()
        ```
    Demos: super_html
    Guides: custom-HTML-components, custom-CSS-and-JS
    """

    EVENTS = all_events

    def __init__(
        self,
        value: Any | Callable | None = None,
        *,
        label: str | I18nData | None = None,
        html_template: str = "${value}",
        css_template: str = "",
        js_on_load: str
        | None = "element.addEventListener('click', function() { trigger('click') });",
        apply_default_css: bool = True,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool = False,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        min_height: int | None = None,
        max_height: int | None = None,
        container: bool = False,
        padding: bool = False,
        autoscroll: bool = False,
        buttons: list[Button] | None = None,
        **props: Any,
    ):
        """
        Parameters:
            value: The HTML content in the ${value} tag in the html_template. For example, if html_template="<p>${value}</p>" and value="Hello, world!", the component will render as `"<p>Hello, world!</p>"`.
            label: The label for this component. Is used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            html_template: A string representing the HTML template for this component as a JS template string and Handlebars template. The `${value}` tag will be replaced with the `value` parameter, and all other tags will be filled in with the values from `props`.
            css_template: A string representing the CSS template for this component as a JS template string and Handlebars template. The CSS will be automatically scoped to this component. The `${value}` tag will be replaced with the `value` parameter, and all other tags will be filled in with the values from `props`.
            js_on_load: A string representing the JavaScript code that will be executed when the component is loaded. The `element` variable refers to the HTML element of this component, and can be used to access children such as `element.querySelector()`. The `trigger` function can be used to trigger events, such as `trigger('click')`. The value and other props can be edited through `props`, e.g. `props.value = "new value"` which will re-render the HTML template.
            apply_default_css: If True, default Gradio CSS styles will be applied to the HTML component.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: If True, the label will be displayed. If False, the label will be hidden.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            min_height: The minimum height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If HTML content exceeds the height, the component will expand to fit the content.
            max_height: The maximum height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If content exceeds the height, the component will scroll.
            container: If True, the HTML component will be displayed in a container. Default is False.
            padding: If True, the HTML component will have a certain padding (set by the `--block-padding` CSS variable) in all directions. Default is False.
            autoscroll: If True, will automatically scroll to the bottom of the component when the content changes, unless the user has scrolled up. If False, will not scroll to the bottom when the content changes.
            buttons: A list of gr.Button() instances to show in the top right corner of the component. Custom buttons will appear in the toolbar with their configured icon and/or label, and clicking them will trigger any .click() events registered on the button.
            props: Additional keyword arguments to pass into the HTML and CSS templates for rendering.
        """
        self.html_template = html_template
        self.css_template = css_template
        self.js_on_load = js_on_load
        self.apply_default_css = apply_default_css
        self.min_height = min_height
        self.max_height = max_height
        self.padding = padding
        self.autoscroll = autoscroll
        self.props = props
        self.component_class_name = self.__class__.__name__

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
        self.buttons = set_default_buttons(buttons, None)

    def example_payload(self) -> Any:
        return "<p>Hello</p>"

    def example_value(self) -> Any:
        return "<p>Hello</p>"

    def preprocess(self, payload: str | None) -> str | None:
        """
        Parameters:
            payload: string corresponding to the HTML
        Returns:
            (Rarely used) passes the HTML as a `str`.
        """
        return payload

    def postprocess(self, value: str | None) -> str | None:
        """
        Parameters:
            value: Expects a `str` consisting of valid HTML.
        Returns:
            Returns the HTML string.
        """
        return value

    def api_info(self) -> dict[str, Any]:
        return {"type": "string"}

    def get_config(self) -> dict[str, Any]:  # type: ignore[override]
        if type(self) is not HTML:
            config = {
                **super().get_config(),
                **super().get_config(HTML),
            }
        else:
            config = super().get_config()
        # For custom HTML components, we use the component_class_name
        # to identify the component in the frontend when reporting errors.
        config["component_class_name"] = self.component_class_name
        return config

    def get_block_name(self):
        return "html"
