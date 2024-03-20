from __future__ import annotations

import hashlib
import os
import typing
import urllib.parse
import warnings
from dataclasses import dataclass, field

import fastapi
from fastapi.responses import RedirectResponse
from huggingface_hub import HfFolder, whoami

from .utils import get_space

OAUTH_CLIENT_ID = os.environ.get("OAUTH_CLIENT_ID")
OAUTH_CLIENT_SECRET = os.environ.get("OAUTH_CLIENT_SECRET")
OAUTH_SCOPES = os.environ.get("OAUTH_SCOPES")
OPENID_PROVIDER_URL = os.environ.get("OPENID_PROVIDER_URL")


def attach_oauth(app: fastapi.FastAPI):
    try:
        from starlette.middleware.sessions import SessionMiddleware
    except ImportError as e:
        raise ImportError(
            "Cannot initialize OAuth to due a missing library. Please run `pip install gradio[oauth]` or add "
            "`gradio[oauth]` to your requirements.txt file in order to install the required dependencies."
        ) from e

    # Add `/login/huggingface`, `/login/callback` and `/logout` routes to enable OAuth in the Gradio app.
    # If the app is running in a Space, OAuth is enabled normally. Otherwise, we mock the "real" routes to make the
    # user log in with a fake user profile - without any calls to hf.co.
    if get_space() is not None:
        _add_oauth_routes(app)
    else:
        _add_mocked_oauth_routes(app)

    # Session Middleware requires a secret key to sign the cookies. Let's use a hash
    # of the OAuth secret key to make it unique to the Space + updated in case OAuth
    # config gets updated.
    session_secret = (OAUTH_CLIENT_SECRET or "") + "-v2"
    # ^ if we change the session cookie format in the future, we can bump the version of the session secret to make
    #   sure cookies are invalidated. Otherwise some users with an old cookie format might get a HTTP 500 error.
    app.add_middleware(
        SessionMiddleware,
        secret_key=hashlib.sha256(session_secret.encode()).hexdigest(),
        same_site="none",
        https_only=True,
    )


def _add_oauth_routes(app: fastapi.FastAPI) -> None:
    """Add OAuth routes to the FastAPI app (login, callback handler and logout)."""
    try:
        from authlib.integrations.starlette_client import OAuth
    except ImportError as e:
        raise ImportError(
            "Cannot initialize OAuth to due a missing library. Please run `pip install gradio[oauth]` or add "
            "`gradio[oauth]` to your requirements.txt file in order to install the required dependencies."
        ) from e

    # Check environment variables
    msg = (
        "OAuth is required but {} environment variable is not set. Make sure you've enabled OAuth in your Space by"
        " setting `hf_oauth: true` in the Space metadata."
    )
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
        # Define target (where to redirect after login)
        redirect_uri = _generate_redirect_uri(request)
        return await oauth.huggingface.authorize_redirect(request, redirect_uri)  # type: ignore

    @app.get("/login/callback")
    async def oauth_redirect_callback(request: fastapi.Request) -> RedirectResponse:
        """Endpoint that handles the OAuth callback."""
        oauth_info = await oauth.huggingface.authorize_access_token(request)  # type: ignore
        request.session["oauth_info"] = oauth_info
        return _redirect_to_target(request)

    @app.get("/logout")
    async def oauth_logout(request: fastapi.Request) -> RedirectResponse:
        """Endpoint that logs out the user (e.g. delete cookie session)."""
        request.session.pop("oauth_info", None)
        return _redirect_to_target(request)


def _add_mocked_oauth_routes(app: fastapi.FastAPI) -> None:
    """Add fake oauth routes if Gradio is run locally and OAuth is enabled.

    Clicking on a gr.LoginButton will have the same behavior as in a Space (i.e. gets redirected in a new tab) but
    instead of authenticating with HF, a mocked user profile is added to the session.
    """
    warnings.warn(
        "Gradio does not support OAuth features outside of a Space environment. To help"
        " you debug your app locally, the login and logout buttons are mocked with your"
        " profile. To make it work, your machine must be logged in to Huggingface."
    )
    mocked_oauth_info = _get_mocked_oauth_info()

    # Define OAuth routes
    @app.get("/login/huggingface")
    async def oauth_login(request: fastapi.Request):  # noqa: ARG001
        """Fake endpoint that redirects to HF OAuth page."""
        # Define target (where to redirect after login)
        redirect_uri = _generate_redirect_uri(request)
        return RedirectResponse(
            "/login/callback?" + urllib.parse.urlencode({"_target_url": redirect_uri})
        )

    @app.get("/login/callback")
    async def oauth_redirect_callback(request: fastapi.Request) -> RedirectResponse:
        """Endpoint that handles the OAuth callback."""
        request.session["oauth_info"] = mocked_oauth_info
        return _redirect_to_target(request)

    @app.get("/logout")
    async def oauth_logout(request: fastapi.Request) -> RedirectResponse:
        """Endpoint that logs out the user (e.g. delete cookie session)."""
        request.session.pop("oauth_info", None)
        logout_url = str(request.url).replace("/logout", "/")  # preserve query params
        return RedirectResponse(url=logout_url)


def _generate_redirect_uri(request: fastapi.Request) -> str:
    if "_target_url" in request.query_params:
        # if `_target_url` already in query params => respect it
        target = request.query_params["_target_url"]
    else:
        # otherwise => keep query params
        target = "/?" + urllib.parse.urlencode(request.query_params)

    redirect_uri = request.url_for("oauth_redirect_callback").include_query_params(
        _target_url=target
    )
    redirect_uri_as_str = str(redirect_uri)
    if redirect_uri.netloc.endswith(".hf.space"):
        # In Space, FastAPI redirect as http but we want https
        redirect_uri_as_str = redirect_uri_as_str.replace("http://", "https://")
    return redirect_uri_as_str


def _redirect_to_target(
    request: fastapi.Request, default_target: str = "/"
) -> RedirectResponse:
    target = request.query_params.get("_target_url", default_target)
    return RedirectResponse(target)


@dataclass
class OAuthProfile(typing.Dict):  # inherit from Dict for backward compatibility
    """
    A Gradio OAuthProfile object that can be used to inject the profile of a user in a
    function. If a function expects `OAuthProfile` or `Optional[OAuthProfile]` as input,
    the value will be injected from the FastAPI session if the user is logged in. If the
    user is not logged in and the function expects `OAuthProfile`, an error will be
    raised.

    Attributes:
        name (str): The name of the user (e.g. 'Abubakar Abid').
        username (str): The username of the user (e.g. 'abidlabs')
        profile (str): The profile URL of the user (e.g. 'https://huggingface.co/abidlabs').
        picture (str): The profile picture URL of the user.

    Example:
        import gradio as gr
        from typing import Optional


        def hello(profile: Optional[gr.OAuthProfile]) -> str:
            if profile is None:
                return "I don't know you."
            return f"Hello {profile.name}"


        with gr.Blocks() as demo:
            gr.LoginButton()
            gr.Markdown().attach_load_event(hello, None)
    """

    name: str = field(init=False)
    username: str = field(init=False)
    profile: str = field(init=False)
    picture: str = field(init=False)

    def __init__(self, data: dict):  # hack to make OAuthProfile backward compatible
        self.update(data)
        self.name = self["name"]
        self.username = self["preferred_username"]
        self.profile = self["profile"]
        self.picture = self["picture"]


@dataclass
class OAuthToken:
    """
    A Gradio OAuthToken object that can be used to inject the access token of a user in a
    function. If a function expects `OAuthToken` or `Optional[OAuthToken]` as input,
    the value will be injected from the FastAPI session if the user is logged in. If the
    user is not logged in and the function expects `OAuthToken`, an error will be
    raised.

    Attributes:
        token (str): The access token of the user.
        scope (str): The scope of the access token.
        expires_at (int): The expiration timestamp of the access token.

    Example:
        import gradio as gr
        from typing import Optional
        from huggingface_hub import whoami


        def list_organizations(oauth_token: Optional[gr.OAuthToken]) -> str:
            if oauth_token is None:
                return "Please log in to list organizations."
            org_names = [org["name"] for org in whoami(oauth_token.token)["orgs"]]
            return f"You belong to {', '.join(org_names)}."


        with gr.Blocks() as demo:
            gr.LoginButton()
            gr.Markdown().attach_load_event(list_organizations, None)
    """

    token: str
    scope: str
    expires_at: int


def _get_mocked_oauth_info() -> typing.Dict:
    token = HfFolder.get_token()
    if token is None:
        raise ValueError(
            "Your machine must be logged in to HF to debug a Gradio app locally. Please"
            " run `huggingface-cli login` or set `HF_TOKEN` as environment variable "
            "with one of your access token. You can generate a new token in your "
            "settings page (https://huggingface.co/settings/tokens)."
        )

    user = whoami()
    if user["type"] != "user":
        raise ValueError(
            "Your machine is not logged in with a personal account. Please use a "
            "personal access token. You can generate a new token in your settings page"
            " (https://huggingface.co/settings/tokens)."
        )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 3600,
        "id_token": "AAAAAAAAAAAAAAAAAAAAAAAAAA",
        "scope": "openid profile",
        "expires_at": 1691676444,
        "userinfo": {
            "sub": "11111111111111111111111",
            "name": user["fullname"],
            "preferred_username": user["name"],
            "profile": f"https://huggingface.co/{user['name']}",
            "picture": user["avatarUrl"],
            "website": "",
            "aud": "00000000-0000-0000-0000-000000000000",
            "auth_time": 1691672844,
            "nonce": "aaaaaaaaaaaaaaaaaaa",
            "iat": 1691672844,
            "exp": 1691676444,
            "iss": "https://huggingface.co",
        },
    }
