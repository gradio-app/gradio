"""Predefined button to sign in with Hugging Face in a Gradio Space."""
from __future__ import annotations

import warnings
from typing import Literal

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
        value: str = "Sign in with Hugging Face",
        signed_in_value: str = "Signed in as {}",
        *,
        every: float | None = None,
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        size: Literal["sm", "lg"] | None = None,
        icon: str
        | None = "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
        link: str | None = None,
        visible: bool = True,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        scale: int | None = 0,
        min_width: int | None = None,
    ):
        """
        Parameters:
            signed_in_value: The text to display when the user is signed in. The string should contain a placeholder for the username, e.g. "Signed in as {}".
        """
        if signed_in_value is None:
            signed_in_value = "Signed in as {}"
        self.signed_in_value = signed_in_value
        super().__init__(
            value,
            every=every,
            variant=variant,
            size=size,
            icon=icon,
            link=link,
            visible=visible,
            interactive=interactive,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            scale=scale,
            min_width=min_width,
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
        self.click(fn=None, inputs=[self], outputs=None, js=_js_open_if_not_logged_in)

        self.attach_load_event(self._check_login_status, None)

    def _check_login_status(self, request: Request) -> LoginButton:
        # Each time the page is refreshed or loaded, check if the user is logged in and adapt label
        session = getattr(request, "session", None) or getattr(
            request.request, "session", None
        )
        if session is None or "oauth_info" not in session:
            return LoginButton(value=self.value, interactive=True)
        else:
            username = session["oauth_info"]["userinfo"]["preferred_username"]
            signed_in_text = self.signed_in_value.format(username)
            return LoginButton(signed_in_text, interactive=False)


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
