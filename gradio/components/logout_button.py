"""Predefined button to sign out from Hugging Face in a Gradio Space."""

from __future__ import annotations

import warnings
from typing import TYPE_CHECKING, Literal, Sequence

from gradio_client.documentation import document

from gradio.components import Button, Component

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class LogoutButton(Button):
    """
    Creates a Button to log out a user from a Space using OAuth.

    Note: `LogoutButton` component is deprecated. Please use `gr.LoginButton` instead
          which handles both the login and logout processes.
    """

    is_template = True

    def __init__(
        self,
        value: str = "Logout",
        *,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
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
        render: bool = True,
        key: int | str | None = None,
        scale: int | None = 0,
        min_width: int | None = None,
    ):
        warnings.warn(
            "The `gr.LogoutButton` component is deprecated. Please use `gr.LoginButton` instead which handles both the login and logout processes."
        )
        super().__init__(
            value,
            every=every,
            inputs=inputs,
            variant=variant,
            size=size,
            icon=icon,
            link=link,
            visible=visible,
            interactive=interactive,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            scale=scale,
            min_width=min_width,
        )
