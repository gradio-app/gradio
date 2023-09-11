"""Predefined button to sign in with Hugging Face in a Gradio Space."""
from __future__ import annotations

import warnings
from typing import Any, Literal

from gradio_client.documentation import document, set_documentation_group

from gradio.components import Button
from gradio.context import Context
from gradio.routes import Request

set_documentation_group("component")


@document()
class LoginButton(Button):
    """
    Button that redirects the user to Sign with Hugging Face using OAuth.
    """

    is_template = True

    def __init__(
        self,
        *,
        value: str = "Sign in with Hugging Face",
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        size: Literal["sm", "lg"] | None = None,
        icon: str
        | None = "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
        link: str | None = None,
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
        if Context.root_block is not None:
            self.activate()
        else:
            warnings.warn(
                "LoginButton created outside of a Blocks context. May not work unless you call its `activate()` method manually."
            )

    def activate(self):
        # Taken from https://cmgdo.com/external-link-in-gradio-button/
        # Taking `self` as input to check if user is logged in
        # ('self' value will be either "Sign in with Hugging Face" or "Signed in as ...")
        self.click(fn=None, inputs=[self], outputs=None, _js=_js_open_if_not_logged_in)

        self.attach_load_event(self._check_login_status, None)

    def _check_login_status(self, request: Request) -> dict[str, Any]:
        # Each time the page is refreshed or loaded, check if the user is logged in and adapt label
        session = getattr(request, "session", None) or getattr(
            request.request, "session", None
        )
        if session is None or "oauth_profile" not in session:
            return self.update("Sign in with Hugging Face", interactive=True)
        else:
            username = session["oauth_profile"]["preferred_username"]
            return self.update(f"Signed in as {username}", interactive=False)


# JS code to redirects to /login/huggingface if user is not logged in.
# If the app is opened in an iframe, open the login page in a new tab.
# Otherwise, redirects locally. Taken from https://stackoverflow.com/a/61596084.
_js_open_if_not_logged_in = """
(buttonValue) => {
    if (!buttonValue.includes("Signed in")) {
        if ( window !== window.parent ) {
            window.open('/login/huggingface', '_blank');
        } else {
            window.location.assign('/login/huggingface');
        }
    }
}
"""
