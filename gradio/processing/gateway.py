"""The gateway process of the process executor: HTTP, the queue, SSE and files.

It never imports the app, and it does not rebuild it either. The app's
process sends what the gateway serves as data: its config, its API info and
its theme. The gateway turns the config's dependencies into an event table
for its queue, whose inputs and outputs are only ids (`AppBlock`), and
forwards "run event N" to one of the app's processes, which runs it, with
preprocessing, postprocessing and every component's logic.
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
from types import SimpleNamespace
from typing import TYPE_CHECKING, Any

from starlette.requests import Request

from gradio.processing import protocol

if TYPE_CHECKING:
    from gradio.blocks import BlockFunction, Blocks
    from gradio.data_classes import PredictBodyInternal
    from gradio.routes import App


class Link:
    """The connection to one of the app's processes. It lives on its own event
    loop, so that the server's loop only awaits futures; results arrive as
    soon as they are written whatever the server is doing."""

    def __init__(self, address: dict, pool: Pool, primary: bool):
        self.address = address
        self.pool = pool
        self.primary = primary
        self.ids = itertools.count()
        self.pending: dict[int, asyncio.Future] = {}
        self.writer: asyncio.StreamWriter | None = None
        self.server_loop: asyncio.AbstractEventLoop | None = None
        # Events running there, which the pool balances new sessions by
        self.running = 0
        self.loop = asyncio.new_event_loop()
        threading.Thread(
            target=self.loop.run_forever, daemon=True, name="gradio-gateway-link"
        ).start()

    def connect(self) -> None:
        asyncio.run_coroutine_threadsafe(self._connect(), self.loop).result()

    async def _connect(self) -> None:
        reader, writer = await asyncio.open_connection(
            "127.0.0.1", self.address["port"]
        )
        writer.write(self.address["token"].encode())
        writer.write(protocol.encode({"fingerprint": self.pool.fingerprint}))
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
                    self.server_loop.call_soon_threadsafe(self.pool.deliver, message)
                elif kind == "replica":
                    self.pool.add_replica(message[1])
        except (asyncio.IncompleteReadError, ConnectionError):
            pass
        except Exception:  # noqa: BLE001 -- the gateway cannot go on without it
            import traceback

            traceback.print_exc()
        self.pool.lost(self)

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

    def fail_pending(self, error: BaseException) -> None:
        def fail():
            for future in self.pending.values():
                if not future.done():
                    future.set_exception(error)
            self.pending.clear()

        self.loop.call_soon_threadsafe(fail)


class Pool:
    """The app's processes: the one that launched the app, and its replicas,
    which re-ran its script. A session stays on the process that first served
    it, since its state and generators live there; a new one goes to the
    least busy. Each process runs as many of an event at once as its
    `concurrency_limit` allows."""

    def __init__(self, blocks: Blocks, fingerprint: str):
        from gradio.utils import LRUCache

        self.blocks = blocks
        self.fingerprint = fingerprint
        self.links: list[Link] = []
        self.sessions: LRUCache[str, Link] = LRUCache(100_000)
        self.lock = threading.Lock()
        self.limits: dict[int, int | None] = {}

    @property
    def primary(self) -> Link:
        return self.links[0]

    def add(self, link: Link) -> None:
        link.connect()
        with self.lock:
            self.links.append(link)
        self.scale_limits()

    def add_replica(self, address: dict) -> None:
        threading.Thread(
            target=self.add, args=(Link(address, self, primary=False),), daemon=True
        ).start()

    def lost(self, link: Link) -> None:
        if link.primary:
            shutdown(self.blocks)
        with self.lock:
            if link in self.links:
                self.links.remove(link)
        link.fail_pending(RuntimeError("A replica of the app exited"))
        self.scale_limits()

    def for_session(self, session_hash: str | None) -> Link:
        with self.lock:
            link = self.sessions.get(session_hash) if session_hash else None
            if link is None or link not in self.links:
                link = min(self.links, key=lambda link: link.running)
                if session_hash:
                    self.sessions[session_hash] = link
            return link

    def scale_limits(self) -> None:
        """Lets the queue admit each event's concurrency_limit once per
        process."""
        queue = self.blocks._queue
        if not self.limits:
            for fn in self.blocks.fns.values():
                limit = fn.concurrency_limit
                self.limits[fn._id] = (
                    queue.default_concurrency_limit if limit == "default" else limit
                )
        count = max(len(self.links), 1)
        for fn in self.blocks.fns.values():
            limit = self.limits.get(fn._id)
            fn.concurrency_limit = None if limit is None else limit * count
        for fn in self.blocks.fns.values():
            event_queue = queue.event_queue_per_concurrency_id.get(fn.concurrency_id)
            if event_queue is not None:
                event_queue.concurrency_limit = fn.concurrency_limit

    def session_changed(self, session_hash: str, closed: bool) -> None:
        link = self.sessions.get(session_hash)
        for target in [link] if link in self.links else list(self.links):
            target.send(("session", session_hash, closed))  # type: ignore[union-attr]

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

    def status(self) -> dict:
        return {
            "processes": [
                {"pid": link.address["pid"], "running": link.running}
                for link in self.links
            ],
            "starting": self.blocks._replicas_expected - len(self.links),  # type: ignore[attr-defined]
        }


class RemoteIterator:
    """What the gateway's `app.iterators` holds for a generator that is running
    in one of the app's processes. Closing it (reset, cancel) closes the real
    one."""

    def __init__(self, link: Link, event_id: str | None):
        self.link = link
        self.event_id = event_id

    async def aclose(self) -> None:
        self.link.send(("close_iterator", self.event_id))


async def forward_event(
    pool: Pool,
    app: App,
    body: PredictBodyInternal,
    gr_request: Any,
    fn: BlockFunction,
    root_path: str,
    record_history: bool = True,
) -> dict[str, Any]:
    """`route_utils.call_process_api`, run in the app's process that holds the
    event's session."""
    from gradio import history, route_utils
    from gradio.client_state import get_sealer

    session_state, iterator = route_utils.restore_session_state(app=app, body=body)
    client_state = body.client_state if not body.batched else None
    started_at = history.now_utc_iso()
    link = (
        iterator.link
        if isinstance(iterator, RemoteIterator)
        else pool.for_session(body.session_hash)
    )
    link.running += 1
    try:
        output = await link.call(
            "event",
            {
                # A validator's BlockFunction has no id of its own
                "fn_index": fn.fn._fn_id,  # type: ignore[union-attr]
                "validator": fn.is_validator_function,
                "body": body.model_copy(update={"request": None, "client_state": None}),
                "client_state": protocol.portable_client_state(client_state),
                "continuing": iterator is not None,
                "request": protocol.portable_request(gr_request),
                "root_path": root_path,
            },
        )
    finally:
        link.running -= 1
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


class AppBlock:
    """A block of the app as the gateway knows it: its id and type. The
    component itself, and everything it does, is in the app's process."""

    def __init__(self, config: dict):
        self.app_config = config
        self._id = config["id"]
        self.type = config["type"]
        self.skip_api = config.get("skip_api", False)
        self.key = config.get("key")
        self.page = ""

    def get_block_name(self) -> str:
        return self.type


def make_stub(fn_id: int, generator: bool = False):
    """A function that does nothing, standing in for event `fn_id`'s function
    or validator in the app's process. Its shape (generator or not) is what
    the queue reads."""
    if generator:

        def stub(*_args):
            yield

    else:

        def stub(*_args):
            pass

    stub._fn_id = fn_id  # type: ignore[attr-defined]
    return stub


def event_table(config: dict, fn_settings: dict, blocks: dict) -> dict:
    """The app's events, for the gateway's queue, from its config and the
    settings the config does not carry."""
    from gradio.block_function import BlockFunction

    pages = {
        fn_id: page
        for page, contents in (config.get("page") or {}).items()
        for fn_id in contents.get("dependencies", [])
    }
    fns = {}
    for dep in config["dependencies"]:
        settings = fn_settings[dep["id"]]

        def ids(key):
            return [blocks[i] for i in dep.get(key) or [] if i in blocks]

        fns[dep["id"]] = BlockFunction(
            fn=make_stub(dep["id"], dep["types"]["generator"])
            if dep["backend_fn"]
            else None,
            inputs=ids("inputs"),
            outputs=ids("outputs"),
            preprocess=False,
            postprocess=False,
            inputs_as_dict=False,
            targets=[tuple(t) for t in dep["targets"]],
            _id=dep["id"],
            batch=dep["batch"],
            max_batch_size=dep["max_batch_size"],
            concurrency_limit=settings["concurrency_limit"],
            concurrency_id=settings["concurrency_id"],
            tracks_progress=settings["tracks_progress"],
            api_name=dep["api_name"],
            api_description=dep.get("api_description"),
            js=dep.get("js"),
            show_progress=dep["show_progress"],
            show_progress_on=ids("show_progress_on") or None,
            cancels=dep.get("cancels"),
            collects_event_data=dep["collects_event_data"],
            trigger_after=dep.get("trigger_after"),
            trigger_only_on_success=dep.get("trigger_only_on_success", False),
            trigger_only_on_failure=dep.get("trigger_only_on_failure", False),
            trigger_mode=dep["trigger_mode"],
            queue=dep["queue"],
            scroll_to_output=dep["scroll_to_output"],
            api_visibility=dep["api_visibility"],
            is_cancel_function=dep["types"]["cancel"],
            connection=dep.get("connection", "sse"),
            time_limit=dep.get("time_limit"),
            stream_every=dep.get("stream_every", 0.5),
            event_specific_args=dep.get("event_specific_args"),
            component_prop_inputs=dep.get("component_prop_inputs"),
            page=pages.get(dep["id"], ""),
            validator=make_stub(dep["id"]) if settings["has_validator"] else None,
        )
    return fns


def build(bootstrap: dict) -> Blocks:
    """A Blocks without components: it serves the app's config, API info and
    theme as they are, and queues the app's events."""
    from gradio import client_state, utils
    from gradio.blocks import Blocks
    from gradio.components import State

    client_state._process_secret = bootstrap["state_secret"]
    if bootstrap["static_paths"]:
        utils.set_static_paths(bootstrap["static_paths"])
    config = bootstrap["config"]
    with Blocks() as blocks:
        pass
    app_blocks: dict[int, Any] = {}
    for component in config["components"]:
        props = component["props"]
        if props.get("name") == "state":
            # Real ones, for gr.State kept in the browser, whose values the
            # gateway caches and seals
            state = State(
                storage=props.get("storage", "server"),
                time_to_live=props.get("time_to_live"),
                render=False,
            )
            state._id = component["id"]
            state.app_config = component  # type: ignore[attr-defined]
            app_blocks[component["id"]] = state
        else:
            app_blocks[component["id"]] = AppBlock(component)
    blocks.default_config.blocks = app_blocks
    blocks.default_config.fns = event_table(
        config, bootstrap["fn_settings"], app_blocks
    )
    blocks.default_config.fn_id = max(blocks.fns, default=-1) + 1
    blocks.app_id = config["app_id"]
    blocks._state_fingerprint = bootstrap["fingerprint"]  # type: ignore[attr-defined]
    blocks.delete_cache = bootstrap["delete_cache"]
    blocks._expects_oauth = bootstrap["expects_oauth"]  # type: ignore[attr-defined]
    if config.get("mode"):
        blocks.mode = config["mode"]
    if config.get("pages"):
        blocks.pages = [tuple(page) for page in config["pages"]]

    def get_config_file() -> dict:
        return dict(config)

    api_info = bootstrap["api_info"]

    def get_api_info(all_endpoints: bool = False, page: str | None = None):  # noqa: ARG001
        return api_info[all_endpoints]

    blocks.get_config_file = get_config_file  # type: ignore[method-assign]
    blocks.get_api_info = get_api_info  # type: ignore[method-assign]
    pool = Pool(blocks, bootstrap["fingerprint"])
    blocks._process_pool = pool  # type: ignore[attr-defined]
    blocks._replicas_expected = bootstrap["replicas"]  # type: ignore[attr-defined]
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


# Gradio routes that need the app's code (component server functions, its MCP
# server) or its per-session state (deep links, media streams)
FORWARDED_ROUTES = [
    ("/component_server", ["POST"]),
    ("/component_server/", ["POST"]),
    ("/deep_link", ["GET"]),
    ("/stream/{session_hash}/{run}/{component_id}/{rest:path}", ["GET", "HEAD"]),
    ("/mcp", None),
    ("/mcp/{rest:path}", None),
]


async def logged_in_user(app: App, request: Request) -> str | None:
    """Who `launch(auth=...)` logged in, by the gateway's own login cookie.
    With auth_dependency, the app's process runs it on the request itself."""
    if app.auth is None or app.auth_dependency is not None:
        return None
    token = request.cookies.get(f"access-token-{app.cookie_id}") or (
        request.cookies.get(f"access-token-unsecure-{app.cookie_id}")
    )
    return app.tokens.get(token)


def add_forwarded_routes(app, bootstrap: dict, pool: Pool) -> None:
    from urllib.parse import quote

    from fastapi.routing import APIRoute
    from starlette.routing import WebSocketRoute

    from gradio.processing.proxy import (
        METHODS,
        TOKEN_HEADER,
        USER_HEADER,
        forward,
        relay,
    )
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

    async def processes():
        return pool.status()

    routes: list = [
        APIRoute(
            API_PREFIX + path,
            to_app,
            methods=methods or METHODS,
            include_in_schema=False,
        )
        for path, methods in FORWARDED_ROUTES
    ]
    routes.append(APIRoute(API_PREFIX + "/processes", processes, methods=["GET"]))
    # A Server's own routes come before Gradio's, as they do with threads
    for kind, path, methods in bootstrap["server_routes"]:
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
    # e.g. a route the Server added after it launched
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
    pool: Pool = blocks._process_pool  # type: ignore[attr-defined]
    pool.add(
        Link(
            {
                "port": bootstrap["port"],
                "token": bootstrap["token"],
                "pid": bootstrap["worker_pid"],
            },
            pool,
            primary=True,
        )
    )
    launch_kwargs = dict(bootstrap["launch_kwargs"])
    if launch_kwargs.get("auth") == protocol.FORWARDED:

        async def auth(username: str, password: str) -> bool:
            return await pool.primary.call(
                "auth", {"username": username, "password": password}
            )

        launch_kwargs["auth"] = auth
    if launch_kwargs.get("auth_dependency") == protocol.FORWARDED:

        async def auth_dependency(request) -> str | None:
            result = await pool.primary.call(
                "auth_dependency", protocol.request_snapshot(request)
            )
            for key, value in result["state"].items():
                setattr(request.state, key, value)
            return result["user"]

        launch_kwargs["auth_dependency"] = auth_dependency
    if bootstrap["check_dependencies"]:
        from fastapi import Depends

        from gradio.processing.proxy import TOKEN_HEADER, check_dependencies

        target = f"http://127.0.0.1:{bootstrap['http_port']}"
        token = [(TOKEN_HEADER, bootstrap["http_token"].encode())]

        async def app_dependencies(request: Request) -> None:
            await check_dependencies(request, target, token)

        # Gradio's routes run them, as they do with threads
        app_kwargs = dict(launch_kwargs.get("app_kwargs") or {})
        app_kwargs["dependencies"] = [Depends(app_dependencies)]
        launch_kwargs["app_kwargs"] = app_kwargs
    app, local_url, share_url = blocks.launch(prevent_thread_lock=True, **launch_kwargs)
    # launch() regenerates these from the Blocks, which has no components
    blocks.config = blocks.get_config_file()
    blocks.theme_css = bootstrap["theme_css"]
    if blocks.config.get("i18n_translations"):
        # The /config route reads translations from here
        blocks.i18n_instance = SimpleNamespace(  # type: ignore[assignment]
            translations_dict=blocks.config["i18n_translations"]
        )
    pool.scale_limits()
    add_forwarded_routes(app, bootstrap, pool)
    app.session_listener = pool.session_changed
    pool.primary.send(
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
