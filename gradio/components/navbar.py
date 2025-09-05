"""gr.Navbar() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events
from gradio.i18n import I18nData

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class Navbar(Component):
    """
    Creates a navigation bar component for multipage Gradio apps. The navbar allows customization
    of visibility and the home page title. Only one Navbar component can exist per Blocks app.

    The Navbar component is designed to control the appearance of the navigation bar in multipage
    applications. When present in a Blocks app, its properties override the default navbar behavior.

    Example:
        ```python
        import gradio as gr

        with gr.Blocks() as demo:
            navbar = gr.Navbar(visible=True, home_page_title="My App")
            gr.Textbox(label="Main page content")

        with demo.route("About"):
            gr.Markdown("This is the about page")

        demo.launch()
        ```
    """

    EVENTS = [Events.change]

    def __init__(
        self,
        *,
        visible: bool = True,
        home_page_title: str = "Home",
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
    ):
        """
        Parameters:
            visible: If True, the navbar will be visible. If False, the navbar will be hidden.
            home_page_title: The title to display for the home page in the navbar.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component.
        """
        self.visible = visible
        self.home_page_title = home_page_title

        super().__init__(
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            value={"visible": visible, "home_page_title": home_page_title},
        )

    def example_payload(self) -> Any:
        return {"visible": True, "home_page_title": "Home"}

    def example_value(self) -> Any:
        return {"visible": True, "home_page_title": "Home"}

    def preprocess(self, payload: dict | None) -> dict | None:
        """
        Parameters:
            payload: Dictionary containing navbar configuration
        Returns:
            The same dictionary (no preprocessing needed for navbar config)
        """
        return payload

    def postprocess(self, value: dict | None) -> dict | None:
        """
        Parameters:
            value: Dictionary containing navbar configuration with visible and home_page_title keys
        Returns:
            Returns the navbar configuration dictionary.
        """
        if value is None:
            return {"visible": True, "home_page_title": "Home"}
        return value

    def api_info(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "visible": {"type": "boolean"},
                "home_page_title": {"type": "string"},
            },
        }
