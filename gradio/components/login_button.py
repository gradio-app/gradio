"""Predefined button to sign in with Hugging Face in a Gradio Space."""
from __future__ import annotations

from typing import Literal

from gradio_client.documentation import document, set_documentation_group

from gradio.components import Button

set_documentation_group("component")


@document()
class LoginButton(Button):
    """
    Button that redirects the user to Sign in Hugging Face with from a Space using OAuth.
    Preprocessing: passes the button value as a {str} into the function
    Postprocessing: expects a {str} to be returned from a function, which is set as the label of the button
    """

    is_template = True

    def __init__(
        self,
        *,
        value: str = "Sign in with Hugging Face",
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        size: Literal["sm", "lg"] | None = None,
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
        # Taken from https://cmgdo.com/external-link-in-gradio-button/
        # TODO: Check how it'll work in Space's iframe
        self.click(
            fn=None, _js=f"() => {{window.location.assign('/login/huggingface');}}"
        )

        # URL = "http://localhost:5173"
        # url = f"{URL}/login/huggingface"
        # self.click(fn=None, _js=f"() => {{window.location.assign('{url}');}}")
