"""The app's side of the process executor.

`Blocks.launch(executor="process")` calls `serve()` in the process that built
the app. It spawns the gateway, then runs every event the gateway forwards
through the same `call_process_api` a normal launch uses, against an `App`
that holds this process's sessions, iterators and gr.State caches.
"""

from __future__ import annotations

import asyncio
import contextlib
import inspect
import os
import pickle
import secrets
import subprocess
import sys
import tempfile
import threading
from types import SimpleNamespace
from typing import TYPE_CHECKING, Any

from gradio.processing import protocol

if TYPE_CHECKING:
    from gradio.blocks import Blocks
    from gradio.routes import App

STARTUP_TIMEOUT = 300


class ForwardingQueue:
    """Stands in for `blocks._queue` here, so gr.Info and gr.Progress reach the
    gateway's queue, which owns the events and their connections."""

    def __init__(self, worker: Worker, original: Any):
        self.worker = worker
        self.original = original
        self.server_app = worker.app

    def __getattr__(self, name: str) -> Any:
        # Settings such as max_size live on the queue the app configured
        return getattr(self.original, name)

    @property
    def active_jobs(self) -> list[list[RunningEvent]]:
        # Read by code an event runs, e.g. ZeroGPU, to learn if its client left
        return [list(self.worker.running.values())]

    def log_message(self, event_id, log, title, level, duration=10, visible=True):
        self.worker.send(
            (
                "log",
                event_id,
                {
                    "log": log,
                    "title": title,
                    "level": level,
                    "duration": duration,
                    "visible": visible,
                },
            )
        )

    def set_progress(self, event_id, iterables):
        if iterables is None:
            return
        units = [
            {
                "index": i.index,
                "length": i.length,
                "unit": i.unit,
                "progress": i.progress,
                "desc": i.desc,
            }
            for i in iterables
        ]
        self.worker.send(("progress", event_id, units))

    def close(self):
        pass


class RunningEvent:
    """An event the gateway's queue is running here. `alive` turns False when
    its client leaves or it is cancelled, as with the queue's own events."""

    def __init__(self, event_id: str, session_hash: str | None):
        self._id = event_id
        self.session_hash = session_hash
        self.alive = True


class AppProcessServer:
    """`blocks.server` in the app's process: its private server, which the
    gateway forwards to (e.g. ZeroGPU reads its port)."""

    def __init__(self, worker: Worker, port: int):
        self.worker = worker
        self.config = SimpleNamespace(port=port)

    def close(self) -> None:
        self.worker.close()


class Worker:
    def __init__(
        self,
        blocks: Blocks,
        gateway_kwargs: dict[str, Any],
        queue_kwargs: dict,
        app: App | None = None,
        launch_kwargs: dict[str, Any] | None = None,
    ):
        from gradio.processing.proxy import GatewayFront
        from gradio.routes import App

        launch_kwargs = launch_kwargs or {}
        self.blocks = blocks
        self.gateway_kwargs = gateway_kwargs
        self.queue_kwargs = queue_kwargs
        # A real Gradio app over this process's blocks, sessions, iterators and
        # gr.State caches, built as a normal launch builds it (onto a Server,
        # if this is one). It runs the app's lifespan and serves the requests
        # the gateway forwards; any other request is sent on to the gateway.
        self.auth_dependency = launch_kwargs.get("auth_dependency")
        self.app = App.create_app(
            blocks,
            app=app,
            auth_dependency=self.auth_dependency,
            app_kwargs=dict(launch_kwargs.get("app_kwargs") or {}),
            strict_cors=launch_kwargs.get("strict_cors", True),
            # The gateway serves MCP clients (see below)
            mcp_server=False,
        )
        mcp_server = launch_kwargs.get("mcp_server")
        if mcp_server is None:
            mcp_server = os.environ.get("GRADIO_MCP_SERVER", "").lower() == "true"
        if mcp_server:
            # The server object a normal launch makes, unmounted: the gateway's
            # MCP server is the one clients reach
            with contextlib.suppress(Exception):
                import gradio.mcp

                blocks.mcp_server_obj = gradio.mcp.GradioMCPServer(blocks)
                blocks.mcp_server = True
        self.http_token = secrets.token_hex(16)
        self.app.add_middleware(
            GatewayFront,  # type: ignore
            token=self.http_token,
            worker=self,
        )
        self.http_server: Any = None
        self.http_port: int | None = None
        self.token = secrets.token_hex(16)
        self.loop: asyncio.AbstractEventLoop | None = None
        self.writer: asyncio.StreamWriter | None = None
        self.tasks: dict[int, asyncio.Task] = {}
        # The session of each running event, for cleaning up after it
        self.event_sessions: dict[str, str | None] = {}
        self.running: dict[str, RunningEvent] = {}
        self.gateway: subprocess.Popen | None = None
        self.ready = threading.Event()
        self.done = threading.Event()
        self.urls: tuple[str, str | None] = ("", None)
        self.server_attributes: dict[str, Any] = {}
        self.failure: str | None = None

    def send(self, message: Any) -> None:
        """Writes a message from any thread (functions run in worker threads)."""
        if self.loop is None or self.writer is None:
            return
        self.send_frame(protocol.encode(message))

    def send_frame(self, frame: bytes) -> None:
        if self.loop is None or self.writer is None:
            return
        try:
            running = asyncio.get_running_loop()
        except RuntimeError:
            running = None
        if running is self.loop:
            self.writer.write(frame)
        else:
            self.loop.call_soon_threadsafe(self.writer.write, frame)

    async def handle(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        from gradio.client_state import app_fingerprint

        if self.writer is not None or await protocol.read(reader) != self.token:
            writer.close()
            return
        self.writer = writer
        hello = await protocol.read(reader)
        if hello["fingerprint"] != app_fingerprint(self.blocks):
            # Ids would mean different things on each side of the boundary
            self.failure = (
                "The gateway rebuilt this app with a different structure, so "
                "executor='process' cannot serve it. Use executor='thread'."
            )
            self.done.set()
            writer.close()
            return
        try:
            while True:
                message = await protocol.read(reader)
                kind = message[0]
                if kind in ("event", "process_api", "auth", "auth_dependency"):
                    _, rid, payload = message
                    run = {
                        "event": self.run_event,
                        "process_api": self.run_process_api,
                        "auth": self.run_auth,
                        "auth_dependency": self.run_auth_dependency,
                    }[kind]
                    self.tasks[rid] = asyncio.create_task(
                        self.respond(rid, run, payload)
                    )
                elif kind == "cancel":
                    task = self.tasks.pop(message[1], None)
                    if task:
                        task.cancel()
                elif kind == "session":
                    self.session_changed(message[1], message[2])
                elif kind == "close_iterator":
                    await self.close_iterator(message[1])
                elif kind == "ready":
                    self.urls = (message[1], message[2])
                    self.server_attributes = message[3]
                    self.ready.set()
        except (asyncio.IncompleteReadError, ConnectionError):
            pass
        finally:
            self.done.set()

    async def respond(self, rid: int, run, payload: dict) -> None:
        try:
            result = await run(payload)
            try:
                frame = protocol.encode(("result", rid, result))
            except Exception:
                # e.g. data models of classes defined inside a function: send
                # what the client would receive, their JSON form
                frame = protocol.encode(("result", rid, protocol.jsonable(result)))
            self.send_frame(frame)
        except asyncio.CancelledError:
            pass
        except BaseException as exc:  # noqa: BLE001 -- user code can raise anything
            self.send(("error", rid, protocol.portable_error(exc)))
        finally:
            self.tasks.pop(rid, None)

    def session_changed(self, session_hash: str, closed: bool) -> None:
        """The gateway, which sees the page, saw a session close or reopen."""
        from gradio import caching

        if not closed:
            self.app.reopen_session(session_hash)
            return
        self.app.mark_session_closed(session_hash)
        for event in self.running.values():
            if event.session_hash == session_hash:
                event.alive = False
        caching.clear_session_caches(session_hash)
        for run in self.blocks.pending_streams.pop(session_hash, {}).values():
            for stream in run.values():
                stream.end_stream()

    async def close_iterator(self, event_id: str) -> None:
        from gradio.utils import safe_aclose_iterator

        iterator = self.app.iterators.pop(event_id, None)
        session_hash = self.event_sessions.pop(event_id, None)
        if iterator is not None:
            # The run ended early (its client left, or it was cancelled):
            # what it kept for streaming is dropped, as the queue does
            self.blocks._drop_run_streams(session_hash, iterator)
            with contextlib.suppress(Exception):
                await safe_aclose_iterator(iterator)

    async def run_event(self, p: dict) -> dict:
        """One event from the queue: exactly what a normal launch runs."""
        from gradio import route_utils
        from gradio.queueing import create_validator_fn

        fn = self.blocks.fns[p["fn_index"]]
        if p.get("validator"):
            fn = create_validator_fn(fn)
        body = p["body"]
        body.client_state = protocol.restore_client_state(p["client_state"], fn)
        if body.event_id is not None:
            self.event_sessions[body.event_id] = body.session_hash
        if not p["continuing"] and body.event_id in self.app.iterators:
            await self.close_iterator(body.event_id)
        running = None
        if body.event_id is not None:
            running = RunningEvent(body.event_id, body.session_hash)
            self.running[body.event_id] = running
        try:
            output = await route_utils.call_process_api(
                app=self.app,
                body=body,
                gr_request=protocol.restore_request(
                    p["request"], self.lifespan_state()
                ),
                fn=fn,
                root_path=p["root_path"],
            )
        except asyncio.CancelledError:
            if running is not None:
                running.alive = False
            raise
        finally:
            if running is not None and self.running.get(body.event_id) is running:
                del self.running[body.event_id]
        output["has_iterator"] = self.app.iterators.get(body.event_id) is not None
        if not output["has_iterator"]:
            # The queue removes a finished event's entry, as it does with threads
            self.app.iterators.pop(body.event_id, None)
            self.event_sessions.pop(body.event_id, None)
        return output

    async def run_auth(self, p: dict) -> bool:
        """`launch(auth=fn)`: the gateway's login route asks here."""
        import anyio

        auth: Any = self.blocks.auth
        if not callable(auth):
            return False
        if inspect.iscoroutinefunction(auth):
            return bool(await auth(p["username"], p["password"]))
        return bool(await anyio.to_thread.run_sync(auth, p["username"], p["password"]))

    async def run_auth_dependency(self, p: dict) -> str | None:
        """`launch(auth_dependency=fn)`, called for a request to the gateway."""
        import anyio

        request = protocol.starlette_request(p, self.lifespan_state())
        fn: Any = self.auth_dependency
        if fn is None:
            return None
        if inspect.iscoroutinefunction(fn):
            return await fn(request)
        user = await anyio.to_thread.run_sync(fn, request)
        if inspect.isawaitable(user):
            user = await user
        return user

    async def run_process_api(self, p: dict) -> dict:
        """A direct `Blocks.process_api` call (e.g. the MCP server's fast path)."""
        from gradio.helpers import EventData
        from gradio.state_holder import SessionState

        session_hash = p["session_hash"]
        state = (
            self.app.state_holder[session_hash]
            if session_hash is not None
            else SessionState(self.blocks)
        )
        event_id = p["event_id"]
        iterator = self.app.iterators.get(event_id) if p["continuing"] else None
        target = (
            state.blocks_config.blocks.get(p["trigger_id"])
            if p["trigger_id"] is not None
            else None
        )
        output = await self.blocks.process_api(
            block_fn=p["fn_index"],
            inputs=p["inputs"],
            state=state,
            request=protocol.restore_request(p["request"], self.lifespan_state()),
            iterator=iterator,
            session_hash=session_hash,
            event_id=event_id,
            event_data=EventData(target, p["event_data"]),
            in_event_listener=p["in_event_listener"],
            simple_format=p["simple_format"],
            explicit_call=p["explicit_call"],
            root_path=p["root_path"],
            oauth_token=p["oauth_token"],
        )
        new_iterator = output.pop("iterator", None)
        if event_id is not None:
            if new_iterator is not None:
                self.app.iterators[event_id] = new_iterator
            else:
                self.app.iterators.pop(event_id, None)
        output["has_iterator"] = new_iterator is not None
        return output

    async def main(self) -> None:
        try:
            await self._main()
        except Exception as err:  # noqa: BLE001 -- reported to the launching thread
            self.failure = f"executor='process' could not start: {err!r}"
        finally:
            self.done.set()
            # The gateway is gone, so a blocked launch() returns
            self.blocks.is_running = False

    def api_info(self) -> dict[int, Any]:
        """The types of gr.api() and Server endpoints' Api blocks. Without the
        module imported there are none, and importing it is not needed."""
        module = sys.modules.get("gradio.components.api_component")
        if module is None:
            return {}
        return {
            block._id: block._api_info
            for block in self.blocks.blocks.values()
            if isinstance(block, module.Api)
        }

    def portable_config(self) -> dict:
        """The config without callables (e.g. a State's delete_callback): the
        gateway never calls them, and they may not pickle."""
        config = dict(self.blocks.config)
        config["components"] = [
            {
                **component,
                "props": {
                    k: v for k, v in component["props"].items() if not callable(v)
                },
            }
            for component in config["components"]
        ]
        return config

    async def _main(self) -> None:
        from gradio import client_state
        from gradio.data_classes import _StaticFiles

        self.loop = asyncio.get_running_loop()
        server = await asyncio.start_server(self.handle, "127.0.0.1", 0)
        http_port = self.serve_http()
        self.http_port = http_port
        # What launch() runs once the server is up, e.g. caching examples. Here
        # it runs before the gateway serves, whose first events would wait on it
        if not self.app.startup_events_triggered:
            await self.blocks.run_extra_startup_events()
            self.app.startup_events_triggered = True
        bootstrap = {
            "config": self.portable_config(),
            "launch_kwargs": self.gateway_kwargs,
            "queue_kwargs": self.queue_kwargs,
            # Endpoints of gr.api() and Server mode describe their types here,
            # which their config does not carry
            "api_info": self.api_info(),
            # Queue settings the config does not carry, which the gateway's
            # queue applies
            "fn_settings": {
                fn_id: {
                    "concurrency_limit": fn.concurrency_limit,
                    "concurrency_id": fn.concurrency_id,
                    "signature": protocol.portable_signature(fn.fn)
                    if fn.fn is not None
                    else None,
                    "metadata": protocol.portable_metadata(fn.fn)
                    if fn.fn is not None
                    else {},
                    "has_validator": fn.validator is not None,
                }
                for fn_id, fn in self.blocks.fns.items()
            },
            "port": server.sockets[0].getsockname()[1],
            "token": self.token,
            "http_port": http_port,
            "http_token": self.http_token,
            "worker_pid": os.getpid(),
            "env": dict(os.environ),
            "cwd": os.getcwd(),
            # Browser-held gr.State tokens are sealed on both sides
            "state_secret": client_state._process_secret,
            # Files the app allowed with gr.set_static_paths(), and the icons
            # its components display, which the gateway's file route serves
            "static_paths": [str(p) for p in _StaticFiles.all_paths],
        }
        fd, path = tempfile.mkstemp(prefix="gradio-gateway-", suffix=".pkl")
        with os.fdopen(fd, "wb") as f:
            pickle.dump(bootstrap, f)
        from gradio.processing import spare

        self.gateway = spare.start_gateway(path)
        async with server:
            while not self.done.is_set():
                if self.gateway.poll() is not None:
                    break
                await asyncio.sleep(0.2)
        self.done.set()

    def lifespan_state(self) -> dict:
        """What the app's lifespan yielded, which requests see as `request.state`."""
        lifespan = getattr(self.http_server, "lifespan", None)
        return dict(getattr(lifespan, "state", None) or {})

    def serve_http(self) -> int:
        """Serves `self.app` on a private loopback port for the gateway."""
        import socket

        import uvicorn

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(("127.0.0.1", 0))
        sock.listen(128)
        self.http_server = uvicorn.Server(
            uvicorn.Config(
                self.app, log_level="warning", access_log=False, lifespan="on"
            )
        )
        self.http_thread = threading.Thread(
            target=asyncio.run,
            args=(self.http_server.serve(sockets=[sock]),),
            daemon=True,
            name="gradio-worker-http",
        )
        self.http_thread.start()
        return sock.getsockname()[1]

    def close(self) -> None:
        if self.http_server is not None:
            # Its lifespan's shutdown (e.g. delete_cache) runs before this returns
            self.http_server.should_exit = True
            self.http_thread.join(timeout=10)
        gateway = self.gateway
        if gateway is not None and gateway.poll() is None:
            gateway.terminate()
            try:
                gateway.wait(timeout=5)
            except subprocess.TimeoutExpired:
                gateway.kill()
        self.done.set()


def serve(
    blocks: Blocks,
    gateway_kwargs: dict[str, Any],
    app: App | None = None,
    launch_kwargs: dict[str, Any] | None = None,
) -> tuple[App, str, str | None]:
    original_queue = blocks._queue
    queue_kwargs = {
        "max_size": original_queue.max_size,
        "default_concurrency_limit": original_queue.default_concurrency_limit,
        "api_open": blocks.api_open,
    }
    worker = Worker(blocks, gateway_kwargs, queue_kwargs, app, launch_kwargs)
    blocks._queue = ForwardingQueue(worker, original_queue)  # type: ignore[assignment]
    blocks._process_worker = worker  # type: ignore[attr-defined]
    blocks.has_launched = True
    threading.Thread(
        target=asyncio.run, args=(worker.main(),), daemon=True, name="gradio-worker"
    ).start()

    deadline = STARTUP_TIMEOUT / 0.1
    while not worker.ready.wait(0.1):
        deadline -= 1
        if worker.done.is_set() or deadline <= 0:
            worker.close()
            blocks._queue = original_queue
            raise RuntimeError(
                worker.failure
                or "The gateway process for executor='process' exited before it "
                "started serving; see its output above."
            )

    local_url, share_url = worker.urls
    blocks.server_app = blocks.app = worker.app
    blocks.local_url = local_url
    blocks.share_url = share_url
    for key, value in worker.server_attributes.items():
        setattr(blocks, key, value)
    blocks.server = AppProcessServer(worker, worker.http_port)  # type: ignore[assignment]
    blocks.is_running = True
    return worker.app, local_url, share_url
