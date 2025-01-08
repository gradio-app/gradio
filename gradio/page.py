from __future__ import annotations

from gradio_client.documentation import document

from gradio.blocks import BlockContext  # noqa: F401
from gradio.component_meta import ComponentMeta


@document()
class Page(BlockContext, metaclass=ComponentMeta):
    """
    Page is a layout element that creates a new page in a multi-page Gradio app.
    Example:
        with gr.Blocks() as demo:
            with gr.Page("Home", route="/"):
                gr.Markdown("Welcome to the home page!")
            with gr.Page("About", route="/about"):
                gr.Markdown("This is the about page.")
    """
    EVENTS = []

    def __init__(
        self,
        title: str,
        *,
        route: str = "/",
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
    ):
        """
        Parameters:
            title: The title of the page, shown in the browser tab and navigation.
            route: The URL route for this page (e.g. "/" for home, "/about" for about page).
            visible: If False, page will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM.
            render: If False, this layout will not be rendered in the Blocks context.
        """
        BlockContext.__init__(
            self,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
        )
        self.title = title
        self.route = route
