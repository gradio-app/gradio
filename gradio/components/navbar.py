"""gr.Navbar() component."""

from __future__ import annotations

from typing import Any

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events


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
        value: list[tuple[str, str]] | None = None,
        *,
        visible: bool = True,
        main_page_name: str | False = "Home",
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
    ):
        """
        Parameters:
            value: If a list of tuples of (page_name, page_path) are provided, the navbar will display the provided pages, in addition to the main page. Otherwise, the navbar will display the pages defined in the Blocks app using the `Blocks.route` method.
            visible: If True, the navbar will be visible. If False, the navbar will be hidden.
            main_page_name: The title to display in the navbar for the main page of the Gradio. If False, the main page will not be displayed in the navbar.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component.
        """
        self.visible = visible
        self.main_page_name = main_page_name

        super().__init__(
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            visible=visible,
            value=value,
        )

    def preprocess(
        self, payload: list[tuple[str, str]] | None
    ) -> list[tuple[str, str]] | None:
        pass

    def postprocess(
        self, value: list[tuple[str, str]] | None
    ) -> list[tuple[str, str]] | None:
        pass

    def api_info(self) -> dict[str, Any]:
        return {}

    def example_payload(self) -> None:
        pass

    def example_value(self) -> None:
        pass
