from __future__ import annotations

from gradio_client.documentation import document

from gradio.blocks import BlockContext  # noqa: F401
from gradio.component_meta import ComponentMeta

class Pages(BlockContext, metaclass=ComponentMeta):
    """
    Creates a set of pages in a multi-page Gradio app.
    """
    EVENTS = []

    def __init__(
        self,
        *,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        visible: bool = True,
        render: bool = True,
    ):
        BlockContext.__init__(
            self,
            elem_id=elem_id,
            elem_classes=elem_classes,
            visible=visible,
            render=render,
        )

    def get_config(self):
        config = super().get_config()
        config["pages"] = [(child.title, child.route) for child in self.children]
        return config

@document()
class Page(BlockContext, metaclass=ComponentMeta):
    """
    Page creates a new page in a multi-page Gradio app.
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
        route: str | None = None,
        *,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        visible: bool = True,
        render: bool = True,
    ):
        """
        Parameters:
            title: The title of the page, shown in the browser tab and navigation.
            route: The URL route for this page (e.g. "/" for home, "/about" for about page).
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM.
        """
        self.title = title
        route = route if route is not None else title.lower().replace(" ", "-")
        self.route = route.strip("/")
        BlockContext.__init__(
            self,
            elem_id=elem_id,
            elem_classes=elem_classes,
            visible=visible,
            render=render,
        )

    def get_expected_parent(self) -> type[Pages]:
        return Pages
    