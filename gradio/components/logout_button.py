"""Predefined button to sign out from Hugging Face in a Gradio Space."""
from __future__ import annotations

from typing import Literal

from gradio_client.documentation import document, set_documentation_group

from gradio.components import Button

set_documentation_group("component")


@document()
class LogoutButton(Button):
    """
    Button to log out a user from a Space.
    """

    is_template = True

    def __init__(
        self,
        *,
        value: str = "Logout",
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        size: Literal["sm", "lg"] | None = None,
        icon: str
        | None = "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
        # Link to logout page (which will delete the session cookie and redirect to landing page).
        link: str | None = "/logout",
        visible: bool = True,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        scale: int | None = 0,
        min_width: int | None = None,
        **kwargs,
    ):
        super().__init__(
            value,
            variant=variant,
            size=size,
            icon=icon,
            link=link,
            visible=visible,
            interactive=interactive,
            elem_id=elem_id,
            elem_classes=elem_classes,
            scale=scale,
            min_width=min_width,
            **kwargs,
        )
