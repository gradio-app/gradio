"""gr.HTML() component."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable, Sequence

from gradio_client.documentation import document
from gradio.components.base import Component
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class HTML(Component):
    """
    Creates a component to display arbitrary HTML output. As this component does not accept user input, it is rarely used as an input component.

    Demos: blocks_scroll
    Guides: key-features
    """

    EVENTS = [Events.change]

    def __init__(
        self,
        value: str | Callable | None = None,
        *,
        label: str | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool = False,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        scroll_to_bottom: bool = False,  # Add this parameter
    ):
        """
        Parameters:
            scroll_to_bottom: If True, automatically scroll to the bottom of the HTML content.
        """
        self.scroll_to_bottom = scroll_to_bottom  # Store this flag for scrolling behavior
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
            value=value,
        )

    def example_payload(self) -> Any:
        return "<p>Hello</p>"

    def example_value(self) -> Any:
        return "<p>Hello</p>"

    def preprocess(self, payload: str | None) -> str | None:
        return payload

    def postprocess(self, value: str | None) -> str | None:
        """
        Automatically scroll to the bottom if the scroll_to_bottom flag is set.
        """
        if value:
            scroll_behavior = ''
            if self.scroll_to_bottom:
                scroll_behavior = '''
                <script>
                    var element = document.getElementById('html-content');
                    if (element) {
                        element.scrollTop = element.scrollHeight;
                    }
                </script>
                '''
            return f'''
            <div id="html-content" style="height: 300px; overflow-y: auto;">
                {value}
            </div>
            {scroll_behavior}
            '''
        return value

    def api_info(self) -> dict[str, Any]:
        return {"type": "string"}

