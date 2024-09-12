"""Predefined button to sign in with Hugging Face in a Gradio Space."""

from __future__ import annotations

import json
import time
import warnings
from collections.abc import Sequence
from typing import TYPE_CHECKING, Literal

from gradio_client.documentation import document

from gradio.components import Button, Component
from gradio.context import get_blocks_context
from gradio.routes import Request

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class LoginButton(Button):
    """
    Creates a button that redirects the user to Sign with Hugging Face using OAuth.
    """

    is_template = True

    def __init__(
        self,
        value: str = "Sign in with Hugging Face",
        logout_value: str = "Logout ({})",
        *,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        variant: Literal["primary", "secondary", "stop", "huggingface"] = "huggingface",
        size: Literal["sm", "lg"] | None = None,
        icon: str
        | None = "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
        link: str | None = None,
        visible: bool = True,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        scale: int | None = None,
        min_width: int | None = None,
    ):
        """
        Parameters:
            logout_value: The text to display when the user is signed in. The string should contain a placeholder for the username with a call-to-action to logout, e.g. "Logout ({})".
        """
        self.logout_value = logout_value
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
        if get_blocks_context():
            self.activate()
        else:
            warnings.warn(
                "LoginButton created outside of a Blocks context. May not work unless you call its `activate()` method manually."
            )

    def activate(self):
        # Taken from https://cmgdo.com/external-link-in-gradio-button/
        # Taking `self` as input to check if user is logged in
        # ('self' value will be either "Sign in with Hugging Face" or "Signed in as ...")
        _js = _js_handle_redirect.replace(
            "BUTTON_DEFAULT_VALUE", json.dumps(self.value)
        )
        self.click(fn=None, inputs=[self], outputs=None, js=_js)

        self.attach_load_event(self._check_login_status, None)

    def _check_login_status(self, request: Request) -> LoginButton:
        # Each time the page is refreshed or loaded, check if the user is logged in and adapt label
        session = getattr(request, "session", None) or getattr(
            request.request, "session", None
        )

        if session is None or "oauth_info" not in session:
            # Cookie set but user not logged in
            return LoginButton(self.value, interactive=True)

        oauth_info = session["oauth_info"]
        expires_at = oauth_info.get("expires_at")
        if expires_at is not None and expires_at < time.time():
            # User is logged in but token has expired => logout
            session.pop("oauth_info", None)
            return LoginButton(self.value, interactive=True)

        # User is correctly logged in
        username = oauth_info["userinfo"]["preferred_username"]
        return LoginButton(self.logout_value.format(username), interactive=True)


# JS code to redirects to /login/huggingface if user is not logged in.
# If user is logged in, redirect to /logout page. Always happens
# on the same tab.
_js_handle_redirect = """
(buttonValue) => {
    uri = buttonValue === BUTTON_DEFAULT_VALUE ? '/login/huggingface' : '/logout';
    window.parent?.postMessage({ type: "SET_SCROLLING", enabled: true }, "*");
    setTimeout(() => {
        window.location.assign(uri + window.location.search);
    }, 500);
}
"""
