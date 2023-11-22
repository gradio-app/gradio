"""Implements a FastAPI server to run the gradio interface. Note that some types in this
module use the Optional/Union notation so that they work correctly with pydantic."""

from __future__ import annotations

import asyncio
import sys

if sys.version_info >= (3, 9):
    from importlib.resources import files
else:
    from importlib_resources import files
import inspect
import json
import mimetypes
import os
import posixpath
import secrets
import shutil
import tempfile
import threading
import time
import traceback
from pathlib import Path
from queue import Empty as EmptyQueue
from typing import TYPE_CHECKING, Any, AsyncIterator, Dict, List, Optional, Type

import fastapi
import httpx
import markupsafe
import orjson
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import (
    FileResponse,
    HTMLResponse,
    JSONResponse,
    PlainTextResponse,
)
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from gradio_client import utils as client_utils
from gradio_client.documentation import document, set_documentation_group
from jinja2.exceptions import TemplateNotFound
from multipart.multipart import parse_options_header
from starlette.background import BackgroundTask
from starlette.responses import RedirectResponse, StreamingResponse

import gradio
import gradio.ranged_response as ranged_response
from gradio import route_utils, utils, wasm_utils
from gradio.context import Context
from gradio.data_classes import ComponentServerBody, PredictBody, ResetBody
from gradio.exceptions import Error
from gradio.helpers import CACHED_FOLDER
from gradio.oauth import attach_oauth
from gradio.queueing import Estimation, Event
from gradio.route_utils import (  # noqa: F401
    FileUploadProgress,
    GradioMultiPartParser,
    GradioUploadFile,
    MultiPartException,
    Request,
)
from gradio.state_holder import StateHolder
from gradio.utils import (
    cancel_tasks,
    get_package_version,
    run_coro_in_background,
    set_task_name,
)

if TYPE_CHECKING:
    from gradio.blocks import Block


mimetypes.init()

STATIC_TEMPLATE_LIB = files("gradio").joinpath("templates").as_posix()  # type: ignore
STATIC_PATH_LIB = files("gradio").joinpath("templates", "frontend", "static").as_posix()  # type: ignore
BUILD_PATH_LIB = files("gradio").joinpath("templates", "frontend", "assets").as_posix()  # type: ignore
VERSION = get_package_version()


class ORJSONResponse(JSONResponse):
    media_type = "application/json"

    @staticmethod
    def _render(content: Any) -> bytes:
        return orjson.dumps(
            content,
            option=orjson.OPT_SERIALIZE_NUMPY | orjson.OPT_PASSTHROUGH_DATETIME,
            default=str,
        )

    def render(self, content: Any) -> bytes:
        return ORJSONResponse._render(content)

    @staticmethod
    def _render_str(content: Any) -> str:
        return ORJSONResponse._render(content).decode("utf-8")


def toorjson(value):
    return markupsafe.Markup(
        ORJSONResponse._render_str(value)
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
        .replace("&", "\\u0026")
        .replace("'", "\\u0027")
    )


templates = Jinja2Templates(directory=STATIC_TEMPLATE_LIB)
templates.env.filters["toorjson"] = toorjson

client = httpx.AsyncClient()


def move_uploaded_files_to_cache(files: list[str], destinations: list[str]) -> None:
    for file, dest in zip(files, destinations):
        shutil.move(file, dest)


file_upload_statuses = FileUploadProgress()


class App(FastAPI):
    """
    FastAPI App Wrapper
    """

    def __init__(self, **kwargs):
        self.tokens = {}
        self.auth = None
        self.blocks: gradio.Blocks | None = None
        self.state_holder = StateHolder()
        self.iterators: dict[str, AsyncIterator] = {}
        self.iterators_to_reset: set[str] = set()
        self.lock = utils.safe_get_lock()
        self.cookie_id = secrets.token_urlsafe(32)
        self.queue_token = secrets.token_urlsafe(32)
        self.startup_events_triggered = False
        self.uploaded_file_dir = os.environ.get("GRADIO_TEMP_DIR") or str(
            (Path(tempfile.gettempdir()) / "gradio").resolve()
        )
        self.change_event: None | threading.Event = None
        self._asyncio_tasks: list[asyncio.Task] = []
        # Allow user to manually set `docs_url` and `redoc_url`
        # when instantiating an App; when they're not set, disable docs and redoc.
        kwargs.setdefault("docs_url", None)
        kwargs.setdefault("redoc_url", None)
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
        self.root_path = blocks.root_path
        self.state_holder.set_blocks(blocks)

    def get_blocks(self) -> gradio.Blocks:
        if self.blocks is None:
            raise ValueError("No Blocks has been configured for this app.")
        return self.blocks

    def build_proxy_request(self, url_path):
        url = httpx.URL(url_path)
        assert self.blocks
        # Don't proxy a URL unless it's a URL specifically loaded by the user using
        # gr.load() to prevent SSRF or harvesting of HF tokens by malicious Spaces.
        is_safe_url = any(
            url.host == httpx.URL(root).host for root in self.blocks.proxy_urls
        )
        if not is_safe_url:
            raise PermissionError("This URL cannot be proxied.")
        is_hf_url = url.host.endswith(".hf.space")
        headers = {}
        if Context.hf_token is not None and is_hf_url:
            headers["Authorization"] = f"Bearer {Context.hf_token}"
        rp_req = client.build_request("GET", url, headers=headers)
        return rp_req

    def _cancel_asyncio_tasks(self):
        for task in self._asyncio_tasks:
            task.cancel()
        self._asyncio_tasks = []

    @staticmethod
    def create_app(
        blocks: gradio.Blocks, app_kwargs: Dict[str, Any] | None = None
    ) -> App:
        app_kwargs = app_kwargs or {}
        app_kwargs.setdefault("default_response_class", ORJSONResponse)
        app = App(**app_kwargs)
        app.configure_app(blocks)

        if not wasm_utils.IS_WASM:
            app.add_middleware(
                CORSMiddleware,
                allow_origins=["*"],
                allow_methods=["*"],
                allow_headers=["*"],
            )

        @app.get("/user")
        @app.get("/user/")
        def get_current_user(request: fastapi.Request) -> Optional[str]:
            token = request.cookies.get(
                f"access-token-{app.cookie_id}"
            ) or request.cookies.get(f"access-token-unsecure-{app.cookie_id}")
            return app.tokens.get(token)

        @app.get("/login_check")
        @app.get("/login_check/")
        def login_check(user: str = Depends(get_current_user)):
            if app.auth is None or user is not None:
                return
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
            )

        @app.get("/token")
        @app.get("/token/")
        def get_token(request: fastapi.Request) -> dict:
            token = request.cookies.get(f"access-token-{app.cookie_id}")
            return {"token": token, "user": app.tokens.get(token)}

        @app.get("/app_id")
        @app.get("/app_id/")
        def app_id(request: fastapi.Request) -> dict:
            return {"app_id": app.get_blocks().app_id}

        @app.get("/dev/reload", dependencies=[Depends(login_check)])
        async def notify_changes(
            request: fastapi.Request,
        ):
            async def reload_checker(request: fastapi.Request):
                heartbeat_rate = 15
                check_rate = 0.05
                last_heartbeat = time.perf_counter()

                while True:
                    if await request.is_disconnected():
                        return

                    if app.change_event and app.change_event.is_set():
                        app.change_event.clear()
                        yield """data: CHANGE\n\n"""

                    await asyncio.sleep(check_rate)
                    if time.perf_counter() - last_heartbeat > heartbeat_rate:
                        yield """data: HEARTBEAT\n\n"""
                        last_heartbeat = time.time()

            return StreamingResponse(
                reload_checker(request),
                media_type="text/event-stream",
            )

        @app.post("/login")
        @app.post("/login/")
        def login(form_data: OAuth2PasswordRequestForm = Depends()):
            username, password = form_data.username.strip(), form_data.password
            if app.auth is None:
                return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)
            if (
                not callable(app.auth)
                and username in app.auth
                and app.auth[username] == password
            ) or (callable(app.auth) and app.auth.__call__(username, password)):
                token = secrets.token_urlsafe(16)
                app.tokens[token] = username
                response = JSONResponse(content={"success": True})
                response.set_cookie(
                    key=f"access-token-{app.cookie_id}",
                    value=token,
                    httponly=True,
                    samesite="none",
                    secure=True,
                )
                response.set_cookie(
                    key=f"access-token-unsecure-{app.cookie_id}",
                    value=token,
                    httponly=True,
                )
                return response
            else:
                raise HTTPException(status_code=400, detail="Incorrect credentials.")

        ###############
        # OAuth Routes
        ###############

        # Define OAuth routes if the app expects it (i.e. a LoginButton is defined).
        # It allows users to "Sign in with HuggingFace".
        if app.blocks is not None and app.blocks.expects_oauth:
            attach_oauth(app)

        ###############
        # Main Routes
        ###############

        @app.head("/", response_class=HTMLResponse)
        @app.get("/", response_class=HTMLResponse)
        def main(request: fastapi.Request, user: str = Depends(get_current_user)):
            mimetypes.add_type("application/javascript", ".js")
            blocks = app.get_blocks()
            root_path = (
                request.scope.get("root_path")
                or request.headers.get("X-Direct-Url")
                or ""
            )
            if app.auth is None or user is not None:
                config = app.get_blocks().config
                config["root"] = route_utils.strip_url(root_path)
            else:
                config = {
                    "auth_required": True,
                    "auth_message": blocks.auth_message,
                    "space_id": app.get_blocks().space_id,
                    "root": route_utils.strip_url(root_path),
                }

            try:
                template = (
                    "frontend/share.html" if blocks.share else "frontend/index.html"
                )
                return templates.TemplateResponse(
                    template,
                    {"request": request, "config": config},
                )
            except TemplateNotFound as err:
                if blocks.share:
                    raise ValueError(
                        "Did you install Gradio from source files? Share mode only "
                        "works when Gradio is installed through the pip package."
                    ) from err
                else:
                    raise ValueError(
                        "Did you install Gradio from source files? You need to build "
                        "the frontend by running /scripts/build_frontend.sh"
                    ) from err

        @app.get("/info/", dependencies=[Depends(login_check)])
        @app.get("/info", dependencies=[Depends(login_check)])
        def api_info(serialize: bool = True):
            # config = app.get_blocks().get_api_info()
            return app.get_blocks().get_api_info()  # type: ignore

        @app.get("/config/", dependencies=[Depends(login_check)])
        @app.get("/config", dependencies=[Depends(login_check)])
        def get_config(request: fastapi.Request):
            root_path = (
                request.scope.get("root_path")
                or request.headers.get("X-Direct-Url")
                or ""
            )
            config = app.get_blocks().config
            config["root"] = route_utils.strip_url(root_path)
            return config

        @app.get("/static/{path:path}")
        def static_resource(path: str):
            static_file = safe_join(STATIC_PATH_LIB, path)
            return FileResponse(static_file)

        @app.get("/custom_component/{id}/{type}/{file_name}")
        def custom_component_path(id: str, type: str, file_name: str):
            config = app.get_blocks().config
            components = config["components"]
            location = next(
                (item for item in components if item["component_class_id"] == id), None
            )

            if location is None:
                raise HTTPException(status_code=404, detail="Component not found.")

            component_instance = app.get_blocks().get_component(location["id"])

            module_name = component_instance.__class__.__module__
            module_path = sys.modules[module_name].__file__

            if module_path is None or component_instance is None:
                raise HTTPException(status_code=404, detail="Component not found.")

            return FileResponse(
                safe_join(
                    str(Path(module_path).parent),
                    f"{component_instance.__class__.TEMPLATE_DIR}/{type}/{file_name}",
                )
            )

        @app.get("/assets/{path:path}")
        def build_resource(path: str):
            build_file = safe_join(BUILD_PATH_LIB, path)
            return FileResponse(build_file)

        @app.get("/favicon.ico")
        async def favicon():
            blocks = app.get_blocks()
            if blocks.favicon_path is None:
                return static_resource("img/logo.svg")
            else:
                return FileResponse(blocks.favicon_path)

        @app.head("/proxy={url_path:path}", dependencies=[Depends(login_check)])
        @app.get("/proxy={url_path:path}", dependencies=[Depends(login_check)])
        async def reverse_proxy(url_path: str):
            # Adapted from: https://github.com/tiangolo/fastapi/issues/1788
            try:
                rp_req = app.build_proxy_request(url_path)
            except PermissionError as err:
                raise HTTPException(status_code=400, detail=str(err)) from err
            rp_resp = await client.send(rp_req, stream=True)
            return StreamingResponse(
                rp_resp.aiter_raw(),
                status_code=rp_resp.status_code,
                headers=rp_resp.headers,  # type: ignore
                background=BackgroundTask(rp_resp.aclose),
            )

        @app.head("/file={path_or_url:path}", dependencies=[Depends(login_check)])
        @app.get("/file={path_or_url:path}", dependencies=[Depends(login_check)])
        async def file(path_or_url: str, request: fastapi.Request):
            blocks = app.get_blocks()
            if utils.validate_url(path_or_url):
                return RedirectResponse(
                    url=path_or_url, status_code=status.HTTP_302_FOUND
                )
            abs_path = utils.abspath(path_or_url)

            in_blocklist = any(
                utils.is_in_or_equal(abs_path, blocked_path)
                for blocked_path in blocks.blocked_paths
            )
            is_dir = abs_path.is_dir()

            if in_blocklist or is_dir:
                raise HTTPException(403, f"File not allowed: {path_or_url}.")

            created_by_app = str(abs_path) in set().union(*blocks.temp_file_sets)
            in_allowlist = any(
                utils.is_in_or_equal(abs_path, allowed_path)
                for allowed_path in blocks.allowed_paths
            )
            was_uploaded = utils.is_in_or_equal(abs_path, app.uploaded_file_dir)
            is_cached_example = utils.is_in_or_equal(
                abs_path, utils.abspath(CACHED_FOLDER)
            )

            if not (
                created_by_app or in_allowlist or was_uploaded or is_cached_example
            ):
                raise HTTPException(403, f"File not allowed: {path_or_url}.")

            if not abs_path.exists():
                raise HTTPException(404, f"File not found: {path_or_url}.")

            range_val = request.headers.get("Range", "").strip()
            if range_val.startswith("bytes=") and "-" in range_val:
                range_val = range_val[6:]
                start, end = range_val.split("-")
                if start.isnumeric() and end.isnumeric():
                    start = int(start)
                    end = int(end)
                    response = ranged_response.RangedFileResponse(
                        abs_path,
                        ranged_response.OpenRange(start, end),
                        dict(request.headers),
                        stat_result=os.stat(abs_path),
                    )
                    return response

            return FileResponse(abs_path, headers={"Accept-Ranges": "bytes"})

        @app.get(
            "/stream/{session_hash}/{run}/{component_id}",
            dependencies=[Depends(login_check)],
        )
        async def stream(
            session_hash: str, run: int, component_id: int, request: fastapi.Request
        ):
            stream: list = (
                app.get_blocks()
                .pending_streams[session_hash]
                .get(run, {})
                .get(component_id, None)
            )
            if stream is None:
                raise HTTPException(404, "Stream not found.")

            def stream_wrapper():
                check_stream_rate = 0.01
                max_wait_time = 120  # maximum wait between yields - assume generator thread has crashed otherwise.
                wait_time = 0
                while True:
                    if len(stream) == 0:
                        if wait_time > max_wait_time:
                            return
                        wait_time += check_stream_rate
                        time.sleep(check_stream_rate)
                        continue
                    wait_time = 0
                    next_stream = stream.pop(0)
                    if next_stream is None:
                        return
                    yield next_stream

            return StreamingResponse(stream_wrapper())

        @app.get("/file/{path:path}", dependencies=[Depends(login_check)])
        async def file_deprecated(path: str, request: fastapi.Request):
            return await file(path, request)

        @app.post("/reset/")
        @app.post("/reset")
        async def reset_iterator(body: ResetBody):
            if body.event_id not in app.iterators:
                return {"success": False}
            async with app.lock:
                del app.iterators[body.event_id]
                app.iterators_to_reset.add(body.event_id)
                await app.get_blocks()._queue.clean_event(body.event_id)
            return {"success": True}

        # had to use '/run' endpoint for Colab compatibility, '/api' supported for backwards compatibility
        @app.post("/run/{api_name}", dependencies=[Depends(login_check)])
        @app.post("/run/{api_name}/", dependencies=[Depends(login_check)])
        @app.post("/api/{api_name}", dependencies=[Depends(login_check)])
        @app.post("/api/{api_name}/", dependencies=[Depends(login_check)])
        async def predict(
            api_name: str,
            body: PredictBody,
            request: fastapi.Request,
            username: str = Depends(get_current_user),
        ):
            fn_index_inferred = route_utils.infer_fn_index(
                app=app, api_name=api_name, body=body
            )

            if not app.get_blocks().api_open and app.get_blocks().queue_enabled_for_fn(
                fn_index_inferred
            ):
                raise HTTPException(
                    detail="This API endpoint does not accept direct HTTP POST requests. Please join the queue to use this API.",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            gr_request = route_utils.compile_gr_request(
                app,
                body,
                fn_index_inferred=fn_index_inferred,
                username=username,
                request=request,
            )

            try:
                output = await route_utils.call_process_api(
                    app=app,
                    body=body,
                    gr_request=gr_request,
                    fn_index_inferred=fn_index_inferred,
                )
            except BaseException as error:
                show_error = app.get_blocks().show_error or isinstance(error, Error)
                traceback.print_exc()
                return JSONResponse(
                    content={"error": str(error) if show_error else None},
                    status_code=500,
                )
            return output

        @app.get("/queue/join", dependencies=[Depends(login_check)])
        async def queue_join(
            fn_index: int,
            session_hash: str,
            request: fastapi.Request,
            username: str = Depends(get_current_user),
            data: Optional[str] = None,
        ):
            blocks = app.get_blocks()
            if blocks._queue.server_app is None:
                blocks._queue.set_server_app(app)

            event = Event(session_hash, fn_index, request, username)
            if data is not None:
                input_data = json.loads(data)
                event.data = PredictBody(
                    session_hash=session_hash,
                    fn_index=fn_index,
                    data=input_data,
                    request=request,
                )

            # Continuous events are not put in the queue so that they do not
            # occupy the queue's resource as they are expected to run forever
            if blocks.dependencies[event.fn_index].get("every", 0):
                await cancel_tasks({f"{event.session_hash}_{event.fn_index}"})
                await blocks._queue.reset_iterators(event._id)
                blocks._queue.continuous_tasks.append(event)
                task = run_coro_in_background(
                    blocks._queue.process_events, [event], False
                )
                set_task_name(task, event.session_hash, event.fn_index, batch=False)
                app._asyncio_tasks.append(task)
            else:
                rank = blocks._queue.push(event)
                if rank is None:
                    event.send_message("queue_full", final=True)
                else:
                    estimation = blocks._queue.get_estimation()
                    await blocks._queue.send_estimation(event, estimation, rank)

            async def sse_stream(request: fastapi.Request):
                try:
                    last_heartbeat = time.perf_counter()
                    while True:
                        if await request.is_disconnected():
                            await blocks._queue.clean_event(event)
                        if not event.alive:
                            return

                        heartbeat_rate = 15
                        check_rate = 0.05
                        message = None
                        try:
                            message = event.message_queue.get_nowait()
                            if message is None:  # end of stream marker
                                return
                        except EmptyQueue:
                            await asyncio.sleep(check_rate)
                            if time.perf_counter() - last_heartbeat > heartbeat_rate:
                                message = {"msg": "heartbeat"}
                                # Need to reset last_heartbeat with perf_counter
                                # otherwise only a single hearbeat msg will be sent
                                # and then the stream will retry leading to infinite queue 😬
                                last_heartbeat = time.perf_counter()

                        if message:
                            yield f"data: {json.dumps(message)}\n\n"
                except asyncio.CancelledError as e:
                    await blocks._queue.clean_event(event)
                    raise e

            return StreamingResponse(
                sse_stream(request),
                media_type="text/event-stream",
            )

        @app.post("/queue/data", dependencies=[Depends(login_check)])
        async def queue_data(
            body: PredictBody,
            request: fastapi.Request,
            username: str = Depends(get_current_user),
        ):
            blocks = app.get_blocks()
            blocks._queue.attach_data(body)

        @app.post("/component_server", dependencies=[Depends(login_check)])
        @app.post("/component_server/", dependencies=[Depends(login_check)])
        def component_server(body: ComponentServerBody):
            state = app.state_holder[body.session_hash]
            component_id = body.component_id
            block: Block
            if component_id in state:
                block = state[component_id]
            else:
                block = app.get_blocks().blocks[component_id]
            fn = getattr(block, body.fn_name)
            return fn(body.data)

        @app.get(
            "/queue/status",
            dependencies=[Depends(login_check)],
            response_model=Estimation,
        )
        async def get_queue_status():
            return app.get_blocks()._queue.get_estimation()

        @app.get("/upload_progress")
        def get_upload_progress(upload_id: str, request: fastapi.Request):
            async def sse_stream(request: fastapi.Request):
                last_heartbeat = time.perf_counter()
                is_done = False
                while True:
                    if await request.is_disconnected():
                        file_upload_statuses.stop_tracking(upload_id)
                        return
                    if is_done:
                        file_upload_statuses.stop_tracking(upload_id)
                        return

                    heartbeat_rate = 15
                    check_rate = 0.05
                    message = None
                    try:
                        if update := file_upload_statuses.status(upload_id).popleft():
                            if update.is_done:
                                message = {"msg": "done"}
                                is_done = True
                            else:
                                message = {
                                    "msg": "update",
                                    "orig_name": update.filename,
                                    "chunk_size": update.chunk_size,
                                }
                        else:
                            await asyncio.sleep(check_rate)
                            if time.perf_counter() - last_heartbeat > heartbeat_rate:
                                message = {"msg": "heartbeat"}
                                last_heartbeat = time.perf_counter()
                        if message:
                            yield f"data: {json.dumps(message)}\n\n"
                    except IndexError:
                        if not file_upload_statuses.is_tracked(upload_id):
                            return
                        # pop from empty queue
                        continue

            return StreamingResponse(
                sse_stream(request),
                media_type="text/event-stream",
            )

        @app.post("/upload", dependencies=[Depends(login_check)])
        async def upload_file(
            request: fastapi.Request,
            bg_tasks: BackgroundTasks,
            upload_id: Optional[str] = None,
        ):
            content_type_header = request.headers.get("Content-Type")
            content_type: bytes
            content_type, _ = parse_options_header(content_type_header)
            if content_type != b"multipart/form-data":
                raise HTTPException(status_code=400, detail="Invalid content type.")

            try:
                if upload_id:
                    file_upload_statuses.track(upload_id)
                multipart_parser = GradioMultiPartParser(
                    request.headers,
                    request.stream(),
                    max_files=1000,
                    max_fields=1000,
                    upload_id=upload_id if upload_id else None,
                    upload_progress=file_upload_statuses if upload_id else None,
                )
                form = await multipart_parser.parse()
            except MultiPartException as exc:
                raise HTTPException(status_code=400, detail=exc.message) from exc

            output_files = []
            files_to_copy = []
            locations: list[str] = []
            for temp_file in form.getlist("files"):
                assert isinstance(temp_file, GradioUploadFile)
                if temp_file.filename:
                    file_name = Path(temp_file.filename).name
                    name = client_utils.strip_invalid_filename_characters(file_name)
                else:
                    name = f"tmp{secrets.token_hex(5)}"
                directory = Path(app.uploaded_file_dir) / temp_file.sha.hexdigest()
                directory.mkdir(exist_ok=True, parents=True)
                dest = (directory / name).resolve()
                temp_file.file.close()
                # we need to move the temp file to the cache directory
                # but that's possibly blocking and we're in an async function
                # so we try to rename (this is what shutil.move tries first)
                # which should be super fast.
                # if that fails, we move in the background.
                try:
                    os.rename(temp_file.file.name, dest)
                except OSError:
                    files_to_copy.append(temp_file.file.name)
                    locations.append(temp_file.file.name)
                output_files.append(dest)
            if files_to_copy:
                bg_tasks.add_task(
                    move_uploaded_files_to_cache, files_to_copy, locations
                )
            return output_files

        @app.on_event("startup")
        @app.get("/startup-events")
        async def startup_events():
            if not app.startup_events_triggered:
                app.get_blocks().startup_events()
                app.startup_events_triggered = True
                return True
            return False

        @app.get("/theme.css", response_class=PlainTextResponse)
        def theme_css():
            return PlainTextResponse(app.get_blocks().theme_css, media_type="text/css")

        @app.get("/robots.txt", response_class=PlainTextResponse)
        def robots_txt():
            if app.get_blocks().share:
                return "User-agent: *\nDisallow: /"
            else:
                return "User-agent: *\nDisallow: "

        return app


########
# Helper functions
########


def safe_join(directory: str, path: str) -> str:
    """Safely path to a base directory to avoid escaping the base directory.
    Borrowed from: werkzeug.security.safe_join"""
    _os_alt_seps: List[str] = [
        sep for sep in [os.path.sep, os.path.altsep] if sep is not None and sep != "/"
    ]

    if path == "":
        raise HTTPException(400)

    filename = posixpath.normpath(path)
    fullpath = os.path.join(directory, filename)
    if (
        any(sep in filename for sep in _os_alt_seps)
        or os.path.isabs(filename)
        or filename == ".."
        or filename.startswith("../")
        or os.path.isdir(fullpath)
    ):
        raise HTTPException(403)

    if not os.path.exists(fullpath):
        raise HTTPException(404, "File not found")

    return fullpath


def get_types(cls_set: List[Type]):
    docset = []
    types = []
    for cls in cls_set:
        doc = inspect.getdoc(cls) or ""
        doc_lines = doc.split("\n")
        for line in doc_lines:
            if "value (" in line:
                types.append(line.split("value (")[1].split(")")[0])
        docset.append(doc_lines[1].split(":")[-1])
    return docset, types


set_documentation_group("routes")


@document()
def mount_gradio_app(
    app: fastapi.FastAPI,
    blocks: gradio.Blocks,
    path: str,
    app_kwargs: dict[str, Any] | None = None,
) -> fastapi.FastAPI:
    """Mount a gradio.Blocks to an existing FastAPI application.

    Parameters:
        app: The parent FastAPI application.
        blocks: The blocks object we want to mount to the parent app.
        path: The path at which the gradio application will be mounted.
        app_kwargs: Additional keyword arguments to pass to the underlying FastAPI app as a dictionary of parameter keys and argument values. For example, `{"docs_url": "/docs"}`
    Example:
        from fastapi import FastAPI
        import gradio as gr
        app = FastAPI()
        @app.get("/")
        def read_main():
            return {"message": "This is your main app"}
        io = gr.Interface(lambda x: "Hello, " + x + "!", "textbox", "textbox")
        app = gr.mount_gradio_app(app, io, path="/gradio")
        # Then run `uvicorn run:app` from the terminal and navigate to http://localhost:8000/gradio.
    """
    blocks.dev_mode = False
    blocks.config = blocks.get_config_file()
    blocks.validate_queue_settings()
    gradio_app = App.create_app(blocks, app_kwargs=app_kwargs)

    @app.on_event("startup")
    async def start_queue():
        gradio_app.get_blocks().startup_events()

    app.mount(path, gradio_app)
    return app
