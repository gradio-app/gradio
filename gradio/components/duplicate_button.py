""" Predefined buttons with bound events that can be included in a gr.Blocks for convenience. """

from __future__ import annotations

from typing import Literal

from gradio_client.documentation import document, set_documentation_group

from gradio.components import Button
from gradio.utils import get_space

set_documentation_group("component")


@document()
class DuplicateButton(Button):
    """
    Button that triggers a Spaces Duplication, when the demo is on Hugging Face Spaces. Does nothing locally.
    Preprocessing: passes the button value as a {str} into the function
    Postprocessing: expects a {str} to be returned from a function, which is set as the label of the button
    """

    is_template = True

    def __init__(
        self,
        *,
        value: str = "Duplicate Space",
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        size: Literal["sm", "lg"] | None = "sm",
        visible: bool = True,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        scale: int | None = 0,
        min_width: int | None = None,
        _activate: bool = True,
        **kwargs,
    ):
        super().__init__(
            value,
            variant=variant,
            size=size,
            visible=visible,
            interactive=interactive,
            elem_id=elem_id,
            elem_classes=elem_classes,
            scale=scale,
            min_width=min_width,
            **kwargs,
        )
        if _activate:
            self.activate()

    def activate(self):
        space_name = get_space()
        if space_name is not None:
            self.click(
                fn=None,
                _js=f"() => {{ window.open(`https://huggingface.co/spaces/{space_name}?duplicate=true`, '_blank') }}",
            )
