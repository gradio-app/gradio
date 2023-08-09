from __future__ import annotations

import hashlib
import os
import typing

import fastapi
from fastapi.responses import RedirectResponse

OAUTH_CLIENT_ID = os.environ.get("OAUTH_CLIENT_ID")
OAUTH_CLIENT_SECRET = os.environ.get("OAUTH_CLIENT_SECRET")
OAUTH_SCOPES = os.environ.get("OAUTH_SCOPES")
OPENID_PROVIDER_URL = os.environ.get("OPENID_PROVIDER_URL")


def attach_oauth(app: fastapi.FastAPI):
    try:
        from authlib.integrations.starlette_client import OAuth
        from starlette.middleware.sessions import SessionMiddleware
    except ImportError as e:
        raise ImportError(
            "Cannot initialize OAuth to due a missing library. Please run `pip install gradio[oauth]` to install the required dependencies."
        ) from e

    # Check environment variables
    msg = "OAuth is required but {} environment variable is not set. Make sure you've enabled OAuth in your Space by setting `hf_oauth: true` in the Space metadata."
    if OAUTH_CLIENT_ID is None:
        raise ValueError(msg.format("OAUTH_CLIENT_ID"))
    if OAUTH_CLIENT_SECRET is None:
        raise ValueError(msg.format("OAUTH_CLIENT_SECRET"))
    if OAUTH_SCOPES is None:
        raise ValueError(msg.format("OAUTH_SCOPES"))
    if OPENID_PROVIDER_URL is None:
        raise ValueError(msg.format("OPENID_PROVIDER_URL"))

    # Register OAuth server
    oauth = OAuth()
    oauth.register(
        name="huggingface",
        client_id=OAUTH_CLIENT_ID,
        client_secret=OAUTH_CLIENT_SECRET,
        client_kwargs={"scope": OAUTH_SCOPES},
        server_metadata_url=OPENID_PROVIDER_URL + "/.well-known/openid-configuration",
    )

    # Define OAuth routes
    @app.get("/login/huggingface")
    async def oauth_login(request: fastapi.Request):
        """Endpoint that redirects to HF OAuth page."""
        redirect_uri = str(request.url_for("oauth_redirect_callback"))
        if ".hf.space" in redirect_uri:
            # In Space, FastAPI redirect as http but we want https
            redirect_uri = redirect_uri.replace("http://", "https://")
        return await oauth.huggingface.authorize_redirect(request, redirect_uri)

    @app.get("/login/callback")
    async def oauth_redirect_callback(request: fastapi.Request) -> RedirectResponse:
        """Endpoint that handles the OAuth callback."""
        token = await oauth.huggingface.authorize_access_token(request)
        request.session["oauth_profile"] = token["userinfo"]
        request.session["oauth_token"] = token
        return RedirectResponse("/")

    @app.get("/logout")
    async def oauth_logout(request: fastapi.Request) -> RedirectResponse:
        """Endpoint that logs out the user (e.g. delete cookie session)."""
        request.session.pop("oauth_profile", None)
        request.session.pop("oauth_token", None)
        return RedirectResponse("/")

    # Session Middleware requires a secret key to sign the cookies. Let's use a hash
    # of the OAuth secret key to make it unique to the Space + updated in case OAuth
    # config gets updated.
    app.add_middleware(
        SessionMiddleware,
        secret_key=hashlib.sha256(OAUTH_CLIENT_SECRET.encode()).hexdigest(),
        same_site="none",
        https_only=True,
    )


class OAuthProfile(typing.Dict):
    """
    A Gradio OAuthProfile object that can be used to inject the profile of a user in a
    function. If a function expects `OAuthProfile` or `Optional[OAuthProfile]` as input,
    the value will be injected from the FastAPI session if the user is logged in. If the
    user is not logged in and the function expects `OAuthProfile`, an error will be
    raised.

    Example:
        import gradio as gr
        from typing import Optional


        def hello(profile: Optional[gr.OAuthProfile]) -> str:
            if profile is None:
                return "I don't know you."
            return f"Hello {profile.name}"


        with gr.Blocks() as demo:
            gr.LoginButton()
            gr.LogoutButton()
            gr.Markdown().attach_load_event(hello, None)
    """
