"""Predefined button to sign in with Hugging Face in a Gradio Space."""
from __future__ import annotations

from typing import Literal

from gradio_client.documentation import document, set_documentation_group

from gradio.components import Button
from gradio.routes import Request

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
        # Taking `self` as input to check if user is logged in
        # ('self' value will be either "Sign in with Hugging Face" or "Signed in as ...")
        self.click(fn=None, inputs=[self], outputs=None, _js=_js_open_if_not_logged_in)

        self.attach_load_event(self._check_login_status, None)

    def _check_login_status(self, request: Request) -> None:
        # Each time the page is refreshed or loaded, check if the user is logged in and adapt label
        session = getattr(request, "session", None) or getattr(
            request.request, "session", None
        )
        if session is None or "oauth_profile" not in session:
            return self.update("Sign in with Hugging Face", interactive=True)
        else:
            username = session["oauth_profile"]["preferred_username"]
            return self.update(f"Signed in as {username}", interactive=False)


_js_open_if_not_logged_in = """
(buttonValue) => {
    if (!buttonValue.includes("Signed in")) {
        window.open('/login/huggingface', '_blank');
    }
}
"""
