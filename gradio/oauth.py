import hashlib
import os

import fastapi
from authlib.integrations.starlette_client import OAuth
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware

OAUTH_CLIENT_ID = os.environ.get("OAUTH_CLIENT_ID")
OAUTH_CLIENT_SECRET = os.environ.get("OAUTH_CLIENT_SECRET")
OAUTH_SCOPES = os.environ.get("OAUTH_SCOPES")
OPENID_PROVIDER_URL = os.environ.get("OPENID_PROVIDER_URL")


def attach_oauth(app: fastapi.FastAPI):
    # TODO: adding oauth routes to the app must be optional (use a parameter demo.launch(auth=True) ?)
    for value in (
        OAUTH_CLIENT_ID,
        OAUTH_CLIENT_SECRET,
        OAUTH_SCOPES,
        OPENID_PROVIDER_URL,
    ):
        if value is None:
            raise ValueError("Missing environment variable")

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
