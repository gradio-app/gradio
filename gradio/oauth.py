from __future__ import annotations

import hashlib
import os
import typing

import fastapi
from authlib.integrations.starlette_client import OAuth
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware

OAUTH_CLIENT_ID = os.environ.get("OAUTH_CLIENT_ID")
OAUTH_CLIENT_SECRET = os.environ.get("OAUTH_CLIENT_SECRET")
OAUTH_SCOPES = os.environ.get("OAUTH_SCOPES")
OPENID_PROVIDER_URL = os.environ.get("OPENID_PROVIDER_URL")


def attach_oauth(app: fastapi.FastAPI):
    for key, value in {
        "OAUTH_CLIENT_ID": OAUTH_CLIENT_ID,
        "OAUTH_CLIENT_SECRET": OAUTH_CLIENT_SECRET,
        "OAUTH_SCOPES": OAUTH_SCOPES,
        "OPENID_PROVIDER_URL": OPENID_PROVIDER_URL,
    }.items():
        if value is None:
            raise ValueError(
                f"OAuth is required but {key} environment variable is not set. Make sure you've enabled OAuth in your Space."
            )

    oauth = OAuth()
    oauth.register(
        name="huggingface",
        client_id=OAUTH_CLIENT_ID,
        client_secret=OAUTH_CLIENT_SECRET,
        client_kwargs={"scope": OAUTH_SCOPES},
        server_metadata_url=OPENID_PROVIDER_URL + "/.well-known/openid-configuration",
    )

    @app.get("/login/huggingface")
    async def oauth_login(request: fastapi.Request):
        redirect_uri = str(request.url_for("oauth_redirect_callback"))
        if ".hf.space" in redirect_uri:
            # In Space, FastAPI redirect as http but we want https
            redirect_uri = redirect_uri.replace("http://", "https://")
        return await oauth.huggingface.authorize_redirect(request, redirect_uri)

    @app.get("/login/callback")
    async def oauth_redirect_callback(request: fastapi.Request) -> RedirectResponse:
        token = await oauth.huggingface.authorize_access_token(request)
        request.session["oauth_profile"] = token["userinfo"]
        request.session["oauth_token"] = token
        return RedirectResponse("/")

    @app.get("/logout")
    async def oauth_logout(request: fastapi.Request) -> RedirectResponse:
        request.session.pop("oauth_profile", None)
        request.session.pop("oauth_token", None)
        return RedirectResponse("/")

    # Session Middleware requires a secret key to sign the cookies. Let's use a hash
    # of the OAuth secret key to make it unique to the Space + updated in case OAuth
    # config gets updated.
    app.add_middleware(
        SessionMiddleware,
        secret_key=hashlib.sha256(OAUTH_CLIENT_SECRET.encode()).hexdigest(),
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
