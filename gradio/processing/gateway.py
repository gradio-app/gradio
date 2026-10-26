"""The gateway process of the process executor: HTTP, the queue, SSE and files.

It never imports the app. It rebuilds the UI from the app's config, keeping
every id, and forwards each event to the app's process, which runs it.
"""

from __future__ import annotations

import asyncio
import contextlib
import itertools
import os
import pickle
import sys
import threading
import time
import warnings
from typing import TYPE_CHECKING, Any

from starlette.requests import Request

from gradio.processing import protocol

if TYPE_CHECKING:
    from gradio.blocks import BlockFunction, Blocks
    from gradio.data_classes import PredictBodyInternal
    from gradio.routes import App


class Link:
    """The connection to the app's process. It lives on its own event loop, so
    that the server's loop only awaits futures; results arrive as soon as they
    are written whatever the server is doing."""

    def __init__(self, bootstrap: dict, blocks: Blocks):
        self.bootstrap = bootstrap
        self.blocks = blocks
        self.ids = itertools.count()
        self.pending: dict[int, asyncio.Future] = {}
        self.writer: asyncio.StreamWriter | None = None
        self.server_loop: asyncio.AbstractEventLoop | None = None
        self.loop = asyncio.new_event_loop()
        threading.Thread(
            target=self.loop.run_forever, daemon=True, name="gradio-gateway-link"
        ).start()

    def connect(self) -> None:
        asyncio.run_coroutine_threadsafe(self._connect(), self.loop).result()

    async def _connect(self) -> None:
        from gradio.client_state import app_fingerprint

        reader, writer = await asyncio.open_connection(
            "127.0.0.1", self.bootstrap["port"]
        )
        writer.write(self.bootstrap["token"].encode())
        writer.write(protocol.encode({"fingerprint": app_fingerprint(self.blocks)}))
        self.writer = writer
        self.loop.create_task(self.read_loop(reader))

    async def read_loop(self, reader: asyncio.StreamReader) -> None:
        try:
            while True:
                message = await protocol.read(reader)
                kind = message[0]
                if kind in ("result", "error"):
                    future = self.pending.pop(message[1], None)
                    if future is None or future.done():
                        continue
                    if kind == "result":
                        try:
                            future.set_result(pickle.loads(message[2]))
                        except Exception as err:  # noqa: BLE001
                            future.set_exception(
                                RuntimeError(
                                    "The gateway could not load what the app's "
                                    f"process returned: {err!r}"
                                )
                            )
                    else:
                        future.set_exception(protocol.restore_error(message[2]))
                elif kind in ("log", "progress") and self.server_loop is not None:
                    # The queue's events belong to the server's loop
                    self.server_loop.call_soon_threadsafe(self.deliver, message)
        except (asyncio.IncompleteReadError, ConnectionError):
            pass
        except Exception:  # noqa: BLE001 -- the gateway cannot go on without it
            import traceback

            traceback.print_exc()
        # The app's process exited, or refused this gateway
        shutdown(self.blocks)

    def deliver(self, message: tuple) -> None:
        from gradio.server_messages import ProgressMessage, ProgressUnit

        kind, event_id, data = message
        queue = self.blocks._queue
        if kind == "log":
            queue.log_message(event_id=event_id, **data)
            return
        for job in queue.active_jobs:
            for event in job or []:
                if event._id == event_id:
                    event.progress = ProgressMessage(
                        progress_data=[ProgressUnit(**unit) for unit in data]
                    )
                    event.progress_pending = True

    def send(self, message: Any) -> None:
        if self.writer is not None:
            self.loop.call_soon_threadsafe(self.writer.write, protocol.encode(message))

    async def _call(self, kind: str, payload: dict) -> Any:
        if self.writer is None:
            raise RuntimeError("The gateway is not connected to the app's process")
        rid = next(self.ids)
        future = self.loop.create_future()
        self.pending[rid] = future
        self.writer.write(protocol.encode((kind, rid, payload)))
        try:
            return await future
        except asyncio.CancelledError:
            self.pending.pop(rid, None)
            self.writer.write(protocol.encode(("cancel", rid)))
            raise

    async def call(self, kind: str, payload: dict) -> Any:
        """Awaited on the server's loop; cancelling it cancels the call there."""
        self.server_loop = asyncio.get_running_loop()
        future = asyncio.run_coroutine_threadsafe(self._call(kind, payload), self.loop)
        return await asyncio.wrap_future(future)


class RemoteIterator:
    """What the gateway's `app.iterators` holds for a generator that is running
    in the app's process. Closing it (reset, cancel) closes the real one."""

    def __init__(self, link: Link, event_id: str | None):
        self.link = link
        self.event_id = event_id

    async def aclose(self) -> None:
        self.link.send(("close_iterator", self.event_id))


async def forward_event(
    link: Link,
    app: App,
    body: PredictBodyInternal,
    gr_request: Any,
    fn: BlockFunction,
    root_path: str,
    record_history: bool = True,
) -> dict[str, Any]:
    """`route_utils.call_process_api`, run in the app's process."""
    from gradio import history, route_utils
    from gradio.client_state import get_sealer

    session_state, iterator = route_utils.restore_session_state(app=app, body=body)
    client_state = body.client_state if not body.batched else None
    started_at = history.now_utc_iso()
    output = await link.call(
        "event",
        {
            "fn_index": fn.fn._process_fn_index,  # type: ignore[union-attr]
            # The queue's check of the inputs, before the event itself
            "validator": fn.is_validator_function,
            "body": body.model_copy(update={"request": None, "client_state": None}),
            "client_state": protocol.portable_client_state(client_state),
            "continuing": iterator is not None,
            "request": protocol.portable_request(gr_request),
            "root_path": root_path,
        },
    )
    has_iterator = output.pop("has_iterator")
    if body.event_id is not None:
        app.iterators[body.event_id] = (  # type: ignore[assignment]
            RemoteIterator(link, body.event_id) if has_iterator else None
        )
    if client_state is not None and output.get("state"):
        # Cache the values the app's process issued, so that the browser can
        # send their references next time instead of the values themselves
        sealer = get_sealer()
        for key, update in output["state"].items():
            if not update:
                continue
            serialized, issued_at = sealer.open(
                client_state.scope(int(key)), update["token"]
            )
            app.state_cache.put(update["ref"], serialized, issued_at)
            if body.session_hash is not None:
                app.latest_state[f"{body.session_hash}:{key}"] = (
                    update["ref"],
                    issued_at,
                )
    route_utils.record_run_history(
        app,
        fn=fn,
        gr_request=gr_request,
        inputs=body.data,
        outputs=output.get("data"),
        started_at=started_at,
        fns=session_state.blocks_config.fns,
        trigger_id=body.trigger_id,
        is_final=record_history and not output.get("is_generating"),
        batched=bool(body.batched and fn.batch),
        batch_trigger_ids=body.batch_trigger_ids,
    )
    return output


def make_proxy(dependency: dict, signature=None, metadata: dict | None = None):
    """Stands in for a function that lives in the app's process. Its shape
    (generator or not) is what the config reports to clients, and its
    signature is the real one's, which API docs and clients read."""
    if not dependency.get("backend_fn"):
        return None
    if (dependency.get("types") or {}).get("generator"):

        def proxy(*_args):
            yield

    else:

        def proxy(*_args):
            pass

    proxy._process_fn_index = dependency["id"]  # type: ignore[attr-defined]
    if signature is not None:
        proxy.__signature__ = signature  # type: ignore[attr-defined]
        # get_type_hints() reads these, e.g. to find a gr.OAuthToken parameter
        proxy.__annotations__ = {
            p.name: p.annotation
            for p in signature.parameters.values()
            if p.annotation is not p.empty
        }
    for name, value in (metadata or {}).items():
        setattr(proxy, name, value)
    return proxy


def make_validator_proxy(fn_id: int):
    """Stands in for the validator of event `fn_id`, which lives in the app's
    process."""

    def validator(*_args):
        pass

    validator._process_fn_index = fn_id  # type: ignore[attr-defined]
    return validator


def make_server_fn_proxy(name: str):
    """Stands in for a component's server function, which lives in the app's
    process: the config lists it by name."""

    def server_fn(*_args):
        pass

    server_fn.__name__ = name
    return server_fn


STAND_INS: list[type] = []


def make_stand_in(info: dict[str, str]) -> type:
    """A class with the name, class id and props of a component class the app
    defines, built on the Gradio class it extends (see
    `protocol.foreign_component_classes`)."""
    import importlib

    base = getattr(importlib.import_module(info["base_module"]), info["base"])
    class_id = info["class_id"]

    def get_component_class_id(cls) -> str:  # noqa: ARG001
        return class_id

    def get_config(self, *args, **kwargs):
        config = base.get_config(self, *args, **kwargs)
        # The app's own props, which the Gradio class may not know
        return {**config, **getattr(self, "_app_props", {})}

    from unittest import mock

    from gradio import component_meta

    # It has no source to write a .pyi file for
    with mock.patch.object(component_meta, "create_or_modify_pyi", lambda *_: None):
        stand_in = type(
            info["name"],
            (base,),
            {
                "__module__": __name__,
                "EVENTS": [*base.EVENTS, *info.get("events", [])],
                "get_component_class_id": classmethod(get_component_class_id),
                "get_config": get_config,
            },
        )
    # Gradio finds component classes through __subclasses__(), which does not
    # keep them alive
    STAND_INS.append(stand_in)
    return stand_in


def build(bootstrap: dict) -> Blocks:
    from gradio import client_state, utils
    from gradio.blocks import Blocks
    from gradio.components import api_component  # noqa: F401 -- registers Api

    client_state._process_secret = bootstrap["state_secret"]
    if bootstrap["static_paths"]:
        utils.set_static_paths(bootstrap["static_paths"])
    config = bootstrap["config"]
    stand_ins = bootstrap.get("component_classes") or {}
    for info in stand_ins.values():
        make_stand_in(info)
    app_props = {}
    server_fns = {}
    for component in config["components"]:
        props = component["props"]
        if props.get("server_fns"):
            server_fns[component["id"]] = props["server_fns"]
        if props.get("name") in stand_ins:
            app_props[component["id"]] = {
                k: v for k, v in props.items() if k not in ("value", "name")
            }
        # The config carries State's default delete_callback, which
        # from_config cannot pass back alongside storage="browser"
        if props.get("name") == "state":
            props.pop("delete_callback", None)
        if props.get("name") == "api":
            props["_api_info"] = bootstrap["api_info"].get(component["id"])
    settings = bootstrap["fn_settings"]
    fns = [
        make_proxy(
            dependency,
            protocol.restore_signature(
                settings.get(dependency["id"], {}).get("signature")
            ),
            settings.get(dependency["id"], {}).get("metadata"),
        )
        for dependency in config["dependencies"]
    ]
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        # No proxy URL: the app's files are local, served by the gateway
        blocks = Blocks.from_config(config, fns, None, preserve_ids=True)
    for block_id, props in app_props.items():
        if block_id in blocks.blocks:
            blocks.blocks[block_id]._app_props = props  # type: ignore[attr-defined]
    for block_id, names in server_fns.items():
        # e.g. gr.HTML(server_functions=...), which run in the app's process:
        # the component_server route is forwarded there
        block = blocks.blocks.get(block_id)
        known = {fn.__name__ for fn in getattr(block, "server_fns", [])}
        for name in names:
            if block is not None and name not in known:
                block.server_fns.append(make_server_fn_proxy(name))  # type: ignore[attr-defined]
    for fn_id, settings in bootstrap["fn_settings"].items():
        if fn_id in blocks.fns:
            for key, value in settings.items():
                if key not in ("signature", "metadata", "has_validator"):
                    setattr(blocks.fns[fn_id], key, value)
            if settings.get("has_validator"):
                # The queue runs the validator first; the app's process runs
                # the real one (see Worker.run_event)
                blocks.fns[fn_id].validator = make_validator_proxy(fn_id)
    # Multipage apps: which page each block and event belongs to
    if config.get("pages"):
        blocks.pages = [tuple(page) for page in config["pages"]]
        for page, contents in (config.get("page") or {}).items():
            for block_id in contents.get("components", []):
                if block_id in blocks.blocks:
                    blocks.blocks[block_id].page = page
            for fn_id in contents.get("dependencies", []):
                if fn_id in blocks.fns:
                    blocks.fns[fn_id].page = page
    if config.get("mode"):
        blocks.mode = config["mode"]
    blocks.delete_cache = bootstrap.get("delete_cache")
    blocks._expects_oauth = bootstrap.get("expects_oauth", False)  # type: ignore[attr-defined]
    for key in ("css", "js", "head", "title", "fill_height", "fill_width"):
        if config.get(key) is not None and hasattr(blocks, key):
            setattr(blocks, key, config[key])

    link = Link(bootstrap, blocks)

    async def process_api(
        block_fn,
        inputs,
        state=None,  # noqa: ARG001 -- the app's process holds the session
        request=None,
        iterator=None,
        session_hash=None,
        event_id=None,
        event_data=None,
        in_event_listener=True,
        simple_format=False,
        explicit_call=False,
        root_path=None,
        oauth_token=None,
    ):
        if isinstance(block_fn, int):
            block_fn = blocks.fns[block_fn]
        output = await link.call(
            "process_api",
            {
                "fn_index": block_fn.fn._process_fn_index,  # type: ignore[union-attr]
                "inputs": inputs,
                "session_hash": session_hash,
                "event_id": event_id,
                "continuing": iterator is not None,
                "trigger_id": getattr(getattr(event_data, "target", None), "_id", None),
                "event_data": getattr(event_data, "_data", None),
                "request": protocol.portable_request(request),
                "in_event_listener": in_event_listener,
                "simple_format": simple_format,
                "explicit_call": explicit_call,
                "root_path": root_path,
                "oauth_token": oauth_token,
            },
        )
        has_iterator = output.pop("has_iterator")
        output["iterator"] = RemoteIterator(link, event_id) if has_iterator else None
        return output

    blocks.process_api = process_api  # type: ignore[method-assign]
    blocks._process_link = link  # type: ignore[attr-defined]
    return blocks


def shutdown(blocks: Blocks) -> None:
    """Exits, stopping what the gateway started (the Node server of SSR, share
    tunnels) as a SIGTERM to a normal launch does."""
    from gradio.node_server import stop_node_process
    from gradio.tunneling import CURRENT_TUNNELS

    node_process = getattr(blocks, "node_process", None)
    if node_process is not None:
        with contextlib.suppress(Exception):
            stop_node_process(node_process)
    for tunnel in list(CURRENT_TUNNELS):
        with contextlib.suppress(Exception):
            tunnel.kill()
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(0)


def watch_app_process(pid: int, blocks: Blocks) -> None:
    while True:
        try:
            os.kill(pid, 0)
        except ProcessLookupError:
            shutdown(blocks)
        time.sleep(1)


# Routes that need the app's process: its code (component server functions,
# a Server's own routes) or its per-session state (deep links, media streams)
FORWARDED_ROUTES = [
    ("/component_server", ["POST"]),
    ("/component_server/", ["POST"]),
    ("/deep_link", ["GET"]),
    ("/stream/{session_hash}/{run}/{component_id}/{rest:path}", ["GET", "HEAD"]),
]
METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]


async def logged_in_user(app: App, request: Request) -> str | None:
    """Who `launch(auth=...)` logged in, by the gateway's own login cookie."""
    if app.auth is None or app.auth_dependency is not None:
        # With auth_dependency, the app's process asks the app's own function
        return None
    token = request.cookies.get(f"access-token-{app.cookie_id}") or (
        request.cookies.get(f"access-token-unsecure-{app.cookie_id}")
    )
    return app.tokens.get(token)


def add_forwarded_routes(app, bootstrap: dict) -> None:
    from urllib.parse import quote

    from fastapi.routing import APIRoute
    from starlette.routing import WebSocketRoute

    from gradio.processing.proxy import TOKEN_HEADER, USER_HEADER, forward, relay
    from gradio.route_utils import API_PREFIX

    port = bootstrap["http_port"]
    target = f"http://127.0.0.1:{port}"
    token = [(TOKEN_HEADER, bootstrap["http_token"].encode())]

    async def to_app(request: Request):
        headers = list(token)
        user = await logged_in_user(app, request)
        if user is not None:
            headers.append((USER_HEADER, quote(user).encode()))
        return await forward(request, target, headers)

    async def websocket_to_app(websocket):
        await relay(websocket, f"ws://127.0.0.1:{port}", token)

    routes: list = [
        APIRoute(API_PREFIX + path, to_app, methods=methods, include_in_schema=False)
        for path, methods in FORWARDED_ROUTES
    ]
    # A Server's own routes come before Gradio's, as they do with threads
    for kind, path, methods in bootstrap.get("server_routes", []):
        if kind == "http":
            routes.append(
                APIRoute(path, to_app, methods=methods, include_in_schema=False)
            )
        elif kind == "websocket":
            routes.append(WebSocketRoute(path, websocket_to_app))
        else:
            routes.append(
                APIRoute(
                    path.rstrip("/") + "/{rest:path}",
                    to_app,
                    methods=METHODS,
                    include_in_schema=False,
                )
            )
    app.router.routes[:0] = routes
    # Anything else the gateway does not serve may be a route the Server added
    # after it launched
    app.router.routes.append(
        APIRoute("/{path:path}", to_app, methods=METHODS, include_in_schema=False)
    )
    app.router.routes.append(WebSocketRoute("/{path:path}", websocket_to_app))


def adopt_environment(env: dict[str, str], cwd: str) -> None:
    """Takes the app's environment and working directory, and recomputes the
    settings that Gradio's modules read from the environment at import time
    (a forked gateway imported them earlier, for another app)."""
    import tempfile
    from pathlib import Path

    os.environ.clear()
    os.environ.update(env)
    os.environ["GRADIO_PROCESS_GATEWAY"] = "1"
    # The app's process reports its launch; the gateway's would count it twice
    os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"
    os.chdir(cwd)
    temp_dir = os.environ.get("GRADIO_TEMP_DIR") or str(
        Path(tempfile.gettempdir()) / "gradio"
    )
    for name in ("route_utils", "mcp", "screen_recording_utils"):
        module = sys.modules.get(f"gradio.{name}")
        if module is not None:
            module.DEFAULT_TEMP_DIR = temp_dir  # type: ignore[attr-defined]
    port = int(os.getenv("GRADIO_SERVER_PORT", "7860"))
    server_name = os.getenv("GRADIO_SERVER_NAME", "127.0.0.1")
    if (module := sys.modules.get("gradio.http_server")) is not None:
        module.INITIAL_PORT_VALUE = port  # type: ignore[attr-defined]
        module.TRY_NUM_PORTS = int(os.getenv("GRADIO_NUM_PORTS", "100"))  # type: ignore[attr-defined]
        module.LOCALHOST_NAME = server_name  # type: ignore[attr-defined]
    if (module := sys.modules.get("gradio.node_server")) is not None:
        module.INITIAL_PORT_VALUE = port  # type: ignore[attr-defined]
        module.TRY_NUM_PORTS = int(os.getenv("GRADIO_NODE_NUM_PORTS", "100"))  # type: ignore[attr-defined]
        module.LOCALHOST_NAME = os.getenv("GRADIO_NODE_SERVER_NAME", server_name)  # type: ignore[attr-defined]


def main(path: str) -> None:
    try:
        with open(path, "rb") as f:
            bootstrap = pickle.load(f)
    finally:
        os.unlink(path)
    adopt_environment(bootstrap["env"], bootstrap["cwd"])
    blocks = build(bootstrap)
    threading.Thread(
        target=watch_app_process,
        args=(bootstrap["worker_pid"], blocks),
        daemon=True,
    ).start()
    blocks.queue(**bootstrap["queue_kwargs"])
    link: Link = blocks._process_link  # type: ignore[attr-defined]
    link.connect()
    launch_kwargs = dict(bootstrap["launch_kwargs"])
    if (
        isinstance(theme := launch_kwargs.get("theme"), dict)
        and protocol.THEME in theme
    ):
        from gradio.themes import Base

        launch_kwargs["theme"] = Base.from_dict(theme[protocol.THEME])
    if launch_kwargs.get("auth") == protocol.FORWARDED:

        async def auth(username: str, password: str) -> bool:
            return await link.call("auth", {"username": username, "password": password})

        launch_kwargs["auth"] = auth
    if launch_kwargs.get("auth_dependency") == protocol.FORWARDED:

        async def auth_dependency(request) -> str | None:
            return await link.call(
                "auth_dependency", protocol.request_snapshot(request)
            )

        launch_kwargs["auth_dependency"] = auth_dependency
    app, local_url, share_url = blocks.launch(prevent_thread_lock=True, **launch_kwargs)
    add_forwarded_routes(app, bootstrap)
    app.session_listener = lambda session_hash, closed: link.send(
        ("session", session_hash, closed)
    )
    link.send(
        (
            "ready",
            local_url,
            share_url,
            {
                key: getattr(blocks, key, None)
                for key in (
                    "server_name",
                    "server_port",
                    "protocol",
                    "local_api_url",
                    "share_api_url",
                    "ssr_mode",
                    "share",
                )
            },
        )
    )
    blocks.block_thread()


if __name__ == "__main__":
    if sys.argv[1] == "--zygote":
        from gradio.processing.spare import run_zygote

        run_zygote(int(sys.argv[2]))
    else:
        main(sys.argv[1])
