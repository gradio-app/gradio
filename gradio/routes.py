"""Implements a FastAPI server to run the gradio interface."""

from __future__ import annotations

import asyncio
import inspect
import io
import mimetypes
import os
import posixpath
import secrets
import traceback
from collections import defaultdict
from copy import deepcopy
from pathlib import Path
from typing import Any, List, Optional, Type

import orjson
import pkg_resources
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from jinja2.exceptions import TemplateNotFound
from pydantic import BaseModel
from starlette.responses import RedirectResponse
from starlette.websockets import WebSocket, WebSocketState

import gradio
from gradio import encryptor
from gradio.event_queue import Estimation, Event, Queue
from gradio.exceptions import Error

mimetypes.init()

STATIC_TEMPLATE_LIB = pkg_resources.resource_filename("gradio", "templates/")
STATIC_PATH_LIB = pkg_resources.resource_filename("gradio", "templates/frontend/static")
BUILD_PATH_LIB = pkg_resources.resource_filename("gradio", "templates/frontend/assets")
VERSION_FILE = pkg_resources.resource_filename("gradio", "version.txt")
with open(VERSION_FILE) as version_file:
    VERSION = version_file.read()


class ORJSONResponse(JSONResponse):
    media_type = "application/json"

    def render(self, content: Any) -> bytes:
        return orjson.dumps(content, option=orjson.OPT_SERIALIZE_NUMPY)


templates = Jinja2Templates(directory=STATIC_TEMPLATE_LIB)


###########
# Data Models
###########


class QueueStatusBody(BaseModel):
    hash: str


class QueuePushBody(BaseModel):
    fn_index: int
    action: str
    session_hash: str
    data: Any


class PredictBody(BaseModel):
    session_hash: Optional[str]
    data: Any
    fn_index: Optional[int]


###########
# Auth
###########


class App(FastAPI):
    """
    FastAPI App Wrapper
    """

    def __init__(self, **kwargs):
        self.tokens = None
        self.auth = None
        self.blocks: Optional[gradio.Blocks] = None
        self.state_holder = {}
        self.iterators = defaultdict(dict)

        super().__init__(**kwargs)

    def configure_app(self, blocks: gradio.Blocks) -> None:
        auth = blocks.auth
        if auth is not None:
            if not callable(auth):
                self.auth = {account[0]: account[1] for account in auth}
            else:
                self.auth = auth
        else:
            self.auth = None

        self.blocks = blocks
        self.cwd = os.getcwd()
        self.favicon_path = blocks.favicon_path
        self.tokens = {}

    @staticmethod
    def create_app(blocks: gradio.Blocks) -> FastAPI:
        app = App(default_response_class=ORJSONResponse)
        app.configure_app(blocks)

        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @app.get("/user")
        @app.get("/user/")
        def get_current_user(request: Request) -> Optional[str]:
            token = request.cookies.get("access-token")
            return app.tokens.get(token)

        @app.get("/login_check")
        @app.get("/login_check/")
        def login_check(user: str = Depends(get_current_user)):
            if app.auth is None or not (user is None):
                return
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
            )

        @app.get("/token")
        @app.get("/token/")
        def get_token(request: Request) -> dict:
            token = request.cookies.get("access-token")
            return {"token": token, "user": app.tokens.get(token)}

        @app.get("/app_id")
        @app.get("/app_id/")
        def app_id(request: Request) -> int:
            return {"app_id": app.blocks.app_id}

        @app.post("/login")
        @app.post("/login/")
        def login(form_data: OAuth2PasswordRequestForm = Depends()):
            username, password = form_data.username, form_data.password
            if (
                not callable(app.auth)
                and username in app.auth
                and app.auth[username] == password
            ) or (callable(app.auth) and app.auth.__call__(username, password)):
                token = secrets.token_urlsafe(16)
                app.tokens[token] = username
                response = RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)
                response.set_cookie(key="access-token", value=token, httponly=True)
                return response
            else:
                raise HTTPException(status_code=400, detail="Incorrect credentials.")

        ###############
        # Main Routes
        ###############

        @app.head("/", response_class=HTMLResponse)
        @app.get("/", response_class=HTMLResponse)
        def main(request: Request, user: str = Depends(get_current_user)):
            mimetypes.add_type("application/javascript", ".js")

            if app.auth is None or not (user is None):
                config = app.blocks.config
            else:
                config = {
                    "auth_required": True,
                    "auth_message": app.blocks.auth_message,
                }

            try:
                template = (
                    "frontend/share.html" if app.blocks.share else "frontend/index.html"
                )
                return templates.TemplateResponse(
                    template, {"request": request, "config": config}
                )
            except TemplateNotFound:
                raise ValueError(
                    "Did you install Gradio from source files? You need to build "
                    "the frontend by running /scripts/build_frontend.sh"
                )

        @app.get("/config/", dependencies=[Depends(login_check)])
        @app.get("/config", dependencies=[Depends(login_check)])
        def get_config():
            return app.blocks.config

        @app.get("/static/{path:path}")
        def static_resource(path: str):
            static_file = safe_join(STATIC_PATH_LIB, path)
            if static_file is not None:
                return FileResponse(static_file)
            raise HTTPException(status_code=404, detail="Static file not found")

        @app.get("/assets/{path:path}")
        def build_resource(path: str):
            build_file = safe_join(BUILD_PATH_LIB, path)
            if build_file is not None:
                return FileResponse(build_file)
            raise HTTPException(status_code=404, detail="Build file not found")

        @app.get("/favicon.ico")
        async def favicon():
            if app.blocks.favicon_path is None:
                return static_resource("img/logo.svg")
            else:
                return FileResponse(app.blocks.favicon_path)

        @app.get("/file={path:path}", dependencies=[Depends(login_check)])
        def file(path: str):
            if (
                app.blocks.encrypt
                and isinstance(app.blocks.examples, str)
                and path.startswith(app.blocks.examples)
            ):
                with open(safe_join(app.cwd, path), "rb") as encrypted_file:
                    encrypted_data = encrypted_file.read()
                file_data = encryptor.decrypt(app.blocks.encryption_key, encrypted_data)
                return FileResponse(
                    io.BytesIO(file_data), attachment_filename=os.path.basename(path)
                )
            elif Path(app.cwd).resolve() in Path(path).resolve().parents or any(
                Path(temp_dir).resolve() in Path(path).resolve().parents
                for temp_dir in app.blocks.temp_dirs
            ):
                return FileResponse(Path(path).resolve())
            else:
                raise ValueError(
                    f"File cannot be fetched: {path}, perhaps because "
                    f"it is not in any of {app.blocks.temp_dirs}"
                )

        @app.get("/file/{path:path}", dependencies=[Depends(login_check)])
        def file_deprecated(path: str):
            return file(path)

        async def run_predict(
            body: PredictBody, username: str = Depends(get_current_user)
        ):
            if hasattr(body, "session_hash"):
                if body.session_hash not in app.state_holder:
                    app.state_holder[body.session_hash] = {
                        _id: deepcopy(getattr(block, "value", None))
                        for _id, block in app.blocks.blocks.items()
                        if getattr(block, "stateful", False)
                    }
                session_state = app.state_holder[body.session_hash]
                iterators = app.iterators[body.session_hash]
            else:
                session_state = {}
                iterator = {}
            raw_input = body.data
            fn_index = body.fn_index
            try:
                output = await app.blocks.process_api(
                    fn_index, raw_input, username, session_state, iterators
                )
                iterator = output.pop("iterator", None)
                if hasattr(body, "session_hash"):
                    app.iterators[body.session_hash][fn_index] = iterator
                if isinstance(output, Error):
                    raise output
            except BaseException as error:
                show_error = app.blocks.show_error or isinstance(error, Error)
                traceback.print_exc()
                return JSONResponse(
                    content={"error": str(error) if show_error else None},
                    status_code=500,
                )
            return output

        @app.post("/api/{api_name}", dependencies=[Depends(login_check)])
        @app.post("/api/{api_name}/", dependencies=[Depends(login_check)])
        async def predict(
            api_name: str, body: PredictBody, username: str = Depends(get_current_user)
        ):
            if body.fn_index is None:
                for i, fn in enumerate(app.blocks.dependencies):
                    if fn["api_name"] == api_name:
                        body.fn_index = i
                        break
                if body.fn_index is None:
                    return JSONResponse(
                        content={
                            "error": f"This app has no endpoint /api/{api_name}/."
                        },
                        status_code=500,
                    )
            return await run_predict(body=body, username=username)

        @app.websocket("/queue/join")
        async def join_queue(websocket: WebSocket):
            await websocket.accept()
            event = Event(websocket)
            rank = app.blocks._queue.push(event)
            if rank is None:
                await app.blocks._queue.send_message(event, {"msg": "queue_full"})
                await event.disconnect()
                return
            estimation = app.blocks._queue.get_estimation()
            await app.blocks._queue.send_estimation(event, estimation, rank)
            while True:
                await asyncio.sleep(60)
                if websocket.application_state == WebSocketState.DISCONNECTED:
                    return

        @app.get(
            "/queue/status",
            dependencies=[Depends(login_check)],
            response_model=Estimation,
        )
        async def get_queue_status():
            return app.blocks._queue.get_estimation()

        @app.get(
            "/startup-events",
            dependencies=[Depends(login_check)],
        )
        async def startup_events():
            from gradio.utils import run_coro_in_background

            if app.blocks.enable_queue:
                gradio.utils.run_coro_in_background(app.blocks._queue.start)
            gradio.utils.run_coro_in_background(app.blocks.create_limiter)

            return True

        return app


########
# Helper functions
########


def safe_join(directory: str, path: str) -> Optional[str]:
    """Safely path to a base directory to avoid escaping the base directory.
    Borrowed from: werkzeug.security.safe_join"""
    _os_alt_seps: List[str] = list(
        sep for sep in [os.path.sep, os.path.altsep] if sep is not None and sep != "/"
    )

    if path != "":
        filename = posixpath.normpath(path)

    if (
        any(sep in filename for sep in _os_alt_seps)
        or os.path.isabs(filename)
        or filename == ".."
        or filename.startswith("../")
    ):
        return None
    return posixpath.join(directory, filename)


def get_types(cls_set: List[Type]):
    docset = []
    types = []
    for cls in cls_set:
        doc = inspect.getdoc(cls)
        doc_lines = doc.split("\n")
        for line in doc_lines:
            if "value (" in line:
                types.append(line.split("value (")[1].split(")")[0])
        docset.append(doc_lines[1].split(":")[-1])
    return docset, types
