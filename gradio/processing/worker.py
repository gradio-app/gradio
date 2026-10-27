"""The app's side of the process executor.

`Blocks.launch(executor="process")` calls `serve()` in the process that built
the app. It spawns the gateway, then runs every event the gateway forwards
through the same `call_process_api` a normal launch uses, against an `App`
that holds this process's sessions, iterators and gr.State caches.
"""

from __future__ import annotations

import asyncio
import contextlib
import hmac
import inspect
import json
import os
import secrets
import signal
import subprocess
import sys
import tempfile
import threading
import time
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
        return getattr(self.original, name)

    @property
    def active_jobs(self) -> list[list[RunningEvent]]:
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
        replica_fd: int | None = None,
    ):
        from gradio.processing.proxy import GatewayFront, dependency_checker
        from gradio.routes import App

        launch_kwargs = launch_kwargs or {}
        self.blocks = blocks
        self.gateway_kwargs = gateway_kwargs
        self.queue_kwargs = queue_kwargs
        self.auth_dependency: Any = launch_kwargs.get("auth_dependency")
        self.server_routes = protocol.describe_routes(app) if app is not None else []
        self.app = App.create_app(
            blocks,
            app=app,
            auth_dependency=self.auth_dependency,
            app_kwargs=dict(launch_kwargs.get("app_kwargs") or {}),
            strict_cors=launch_kwargs.get("strict_cors", True),
            mcp_server=launch_kwargs.get("mcp_server"),
        )
        self.checker = (
            dependency_checker(self.app) if self.app.router.dependencies else None
        )
        self.http_token = secrets.token_hex(16)
        self.app.add_middleware(
            GatewayFront,  # type: ignore
            token=self.http_token,
            worker=self,
        )
        self.http_server: Any = None
        self.http_task: asyncio.Task | None = None
        self.http_port: int | None = None
        self.token = secrets.token_hex(16)
        self.loop: asyncio.AbstractEventLoop | None = None
        self.writer: asyncio.StreamWriter | None = None
        self.tasks: dict[int, asyncio.Task] = {}
        self.closing: set[asyncio.Task] = set()
        self.event_sessions: dict[str, str | None] = {}
        self.running: dict[str, RunningEvent] = {}
        self.gateway: subprocess.Popen | None = None
        self.ready = threading.Event()
        self.gateway_started = threading.Event()
        self.done = threading.Event()
        self.finished = threading.Event()
        self.http_done = threading.Event()
        self.urls: tuple[str, str | None] = ("", None)
        self.server_attributes: dict[str, Any] = {}
        self.failure: str | None = None
        self.replica_fd = replica_fd
        self.replicas = max(int(os.environ.get("GRADIO_PROCESS_REPLICAS", "1")), 1)
        self.replica_processes: list[subprocess.Popen] = []
        self.replica_addresses: list[dict] = []
        self.shutting_down = False

    def send(self, message: Any) -> None:
        """Writes a message from any thread (functions run in worker threads)."""
        if self.loop is None or self.writer is None:
            return
        frame = protocol.encode(message)
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

        try:
            token = await asyncio.wait_for(reader.readexactly(len(self.token)), 10)
        except (TimeoutError, asyncio.IncompleteReadError, ConnectionError):
            token = b""
        if self.writer is not None or not hmac.compare_digest(
            token, self.token.encode()
        ):
            writer.close()
            return
        self.writer = writer
        hello = await protocol.read(reader)
        if hello["fingerprint"] != app_fingerprint(self.blocks):
            self.failure = (
                "The gateway serves an app with a different structure (another "
                "replica's script?), so executor='process' cannot serve it. Use "
                "executor='thread'."
            )
            self.done.set()
            writer.close()
            return
        for address in list(self.replica_addresses):
            self.send(("replica", address))
        try:
            while True:
                message = await protocol.read(reader)
                kind = message[0]
                if kind in ("event", "auth", "auth_dependency"):
                    _, rid, payload = message
                    run = {
                        "event": self.run_event,
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
                    task = asyncio.create_task(self.close_iterator(message[1]))
                    self.closing.add(task)
                    task.add_done_callback(self.closing.discard)
                elif kind == "ready":
                    self.urls = (message[1], message[2])
                    self.server_attributes = message[3]
                    self.ready.set()
        except (asyncio.IncompleteReadError, ConnectionError):
            pass
        finally:
            writer.close()
            self.done.set()

    async def respond(self, rid: int, run, payload: dict) -> None:
        try:
            result = await run(payload)
            try:
                data = protocol.dumps(result)
            except Exception:
                data = protocol.dumps(protocol.jsonable(result))
            del result
            self.send(("result", rid, data))
            if self.writer is not None:
                with contextlib.suppress(ConnectionError):
                    await self.writer.drain()
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
            self.blocks._drop_run_streams(session_hash, iterator)
            with contextlib.suppress(Exception):
                await safe_aclose_iterator(iterator)

    async def run_event(self, p: dict) -> dict:
        """One event from the queue: exactly what a normal launch runs."""
        from gradio import caching, route_utils
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
            with caching.ProbeCache() if p["probe_cache"] else contextlib.nullcontext():
                output = await route_utils.call_process_api(
                    app=self.app,
                    body=body,
                    gr_request=protocol.restore_request(
                        p["request"], self.lifespan_state()
                    ),
                    fn=fn,
                    root_path=p["root_path"],
                    record_history=False,
                )
        except asyncio.CancelledError:
            if running is not None:
                running.alive = False
            raise
        finally:
            if running is not None and self.running.get(body.event_id) is running:
                del self.running[body.event_id]
            if self.app.iterators.get(body.event_id) is None:
                self.app.iterators.pop(body.event_id, None)
                self.event_sessions.pop(body.event_id, None)
        output["has_iterator"] = self.app.iterators.get(body.event_id) is not None
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

    async def run_auth_dependency(self, p: dict) -> dict:
        """`launch(auth_dependency=fn)`, called for a request to the gateway.
        It returns the user, and what `fn` set on `request.state`, which the
        gateway sets on its request for the event it serves."""
        import anyio

        lifespan_state = self.lifespan_state()
        request = protocol.starlette_request(p, lifespan_state)
        fn = self.auth_dependency
        if inspect.iscoroutinefunction(fn):
            user = await fn(request)
        else:
            user = await anyio.to_thread.run_sync(fn, request)
            if inspect.isawaitable(user):
                user = await user
        state = {}
        for key, value in getattr(request.state, "_state", {}).items():
            if key in lifespan_state and lifespan_state[key] is value:
                continue
            with contextlib.suppress(Exception):
                protocol.dumps(value)
                state[key] = value
        return {"user": user, "state": state}

    async def main(self) -> None:
        try:
            await self._main()
        except Exception as err:  # noqa: BLE001 -- reported to the launching thread
            self.failure = f"executor='process' could not start: {err!r}"
        finally:
            self.done.set()
            self.blocks.is_running = False
            self.finished.set()

    def api_info(self) -> dict[tuple[str | None, bool], Any]:
        """The API info the gateway serves, by page and `all_endpoints`."""
        pages = [None, *(self.blocks.config.get("page") or {})]
        return {
            (page, all_endpoints): self.blocks.get_api_info(
                all_endpoints=all_endpoints, page=page
            )
            for page in pages
            for all_endpoints in (False, True)
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
        from gradio.client_state import app_fingerprint
        from gradio.context import Context
        from gradio.data_classes import _StaticFiles

        self.loop = asyncio.get_running_loop()
        server = await asyncio.start_server(self.handle, "127.0.0.1", 0)
        http_port = await self.serve_http()
        self.http_port = http_port
        self.blocks.create_limiter()
        if not self.app.startup_events_triggered:
            await self.blocks.run_extra_startup_events()
            self.app.startup_events_triggered = True
        address = {
            "port": server.sockets[0].getsockname()[1],
            "token": self.token,
            "pid": os.getpid(),
            "http_port": http_port,
            "http_token": self.http_token,
        }
        if self.replica_fd is not None:
            os.write(self.replica_fd, (json.dumps(address) + "\n").encode())
            os.close(self.replica_fd)
            try:
                await asyncio.to_thread(self.done.wait)
            finally:
                await self.stop_server(server)
            return
        bootstrap = {
            "config": self.portable_config(),
            "launch_kwargs": self.gateway_kwargs,
            "queue_kwargs": self.queue_kwargs,
            "api_info": self.api_info(),
            "fn_settings": {
                fn_id: {
                    "concurrency_limit": fn.concurrency_limit,
                    "concurrency_id": fn.concurrency_id,
                    "tracks_progress": fn.tracks_progress,
                    "has_validator": fn.validator is not None,
                    "cached": hasattr(fn.fn, "cache"),
                    "parameter_names": list(fn.input_parameter_names)
                    or (list(inspect.signature(fn.fn).parameters) if fn.fn else []),
                }
                for fn_id, fn in self.blocks.fns.items()
            },
            "fingerprint": app_fingerprint(self.blocks),
            "theme_css": self.blocks.theme_css,
            "replicas": self.replicas,
            "port": server.sockets[0].getsockname()[1],
            "token": self.token,
            "http_port": http_port,
            "http_token": self.http_token,
            "worker_pid": os.getpid(),
            "env": dict(os.environ),
            "cwd": os.getcwd(),
            "state_secret": client_state._process_secret,
            "static_paths": [str(p) for p in _StaticFiles.all_paths],
            "server_routes": self.server_routes,
            "delete_cache": self.blocks.delete_cache,
            "proxy_urls": sorted(self.blocks.proxy_urls),
            "expects_oauth": self.blocks.expects_oauth,
            "check_dependencies": self.checker is not None,
            "hf_token": Context.token,
        }
        try:
            data = protocol.dumps(bootstrap)
        except protocol.NotPortable as err:
            raise RuntimeError(
                f"The app uses something the gateway process cannot load ({err}). "
                "Define it in a module the app imports instead of in its script, "
                "or use executor='thread'."
            ) from None
        fd, path = tempfile.mkstemp(prefix="gradio-gateway-", suffix=".pkl")
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        from gradio.processing import spare

        self.gateway = spare.start_gateway(path)
        self.gateway_started.set()
        for _ in range(self.replicas - 1):
            self.start_replica()
        try:
            while not self.done.is_set():
                if self.gateway.poll() is not None:
                    break
                await asyncio.sleep(0.2)
        finally:
            await self.stop_server(server)
            with contextlib.suppress(subprocess.TimeoutExpired):
                await asyncio.to_thread(self.gateway.wait, 5)
        self.done.set()

    async def stop_server(self, server: asyncio.Server) -> None:
        server.close()
        with contextlib.suppress(asyncio.TimeoutError):
            await asyncio.wait_for(server.wait_closed(), 5)
        await self.stop_http()

    async def stop_http(self) -> None:
        self.http_server.should_exit = True
        if self.http_task is not None:
            with contextlib.suppress(Exception):
                await asyncio.wait_for(self.http_task, 10)

    def start_replica(self) -> None:
        """Runs the app's script again, as a replica that serves sessions the
        gateway sends it. It reports its address on a pipe, which is passed on
        to the gateway."""
        script = sys.argv[0] if sys.argv else ""
        if not script.endswith(".py") or not os.path.exists(script):
            print("Replicas need the app to be run as a script (python app.py).")
            return
        from gradio import client_state

        read, write = os.pipe()
        process = subprocess.Popen(
            [sys.executable, *sys.argv],
            env={
                **os.environ,
                "GRADIO_PROCESS_REPLICA_FD": str(write),
                "GRADIO_PROCESS_STATE_SECRET": client_state._process_secret.hex(),
            },
            pass_fds=[write],
        )
        self.replica_processes.append(process)
        os.close(write)

        def report():
            address = None
            with os.fdopen(read) as lines:
                for line in lines:
                    address = json.loads(line)
                    self.replica_addresses.append(address)
                    self.send(("replica", address))
            process.wait()
            if address is not None:
                self.replica_addresses.remove(address)
            if self.shutting_down:
                return
            if address is not None:
                print(
                    f"A replica of the app (pid {process.pid}) exited; restarting it."
                )
                self.start_replica()
            else:
                self.send(("replica_failed",))

        threading.Thread(target=report, daemon=True).start()

    def lifespan_state(self) -> dict:
        """What the app's lifespan yielded, which requests see as `request.state`."""
        lifespan = getattr(self.http_server, "lifespan", None)
        return dict(getattr(lifespan, "state", None) or {})

    async def serve_http(self) -> int:
        """Serves `self.app` on a private loopback port for the gateway, on the
        loop that runs the events, as one loop serves both with threads. It
        returns once the app's lifespan has started."""
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
        task = self.http_task = asyncio.create_task(
            self.http_server.serve(sockets=[sock])
        )
        task.add_done_callback(lambda _: self.http_done.set())
        while not self.http_server.started:
            if task.done():
                task.result()
                raise RuntimeError("The app's server stopped while starting")
            await asyncio.sleep(0.01)
        return sock.getsockname()[1]

    def close(self) -> None:
        self.shutting_down = True
        if self.http_server is not None:
            self.http_server.should_exit = True
            if threading.current_thread().name != "gradio-worker":
                self.http_done.wait(timeout=10)
        for replica in self.replica_processes:
            if replica.poll() is None:
                replica.terminate()
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
        "status_update_rate": "auto"
        if original_queue.live_updates
        else original_queue.update_intervals,
    }
    worker = Worker(blocks, gateway_kwargs, queue_kwargs, app, launch_kwargs)
    blocks._queue = ForwardingQueue(worker, original_queue)  # type: ignore[assignment]
    blocks._process_worker = worker  # type: ignore[attr-defined]
    blocks.has_launched = True
    threading.Thread(
        target=asyncio.run, args=(worker.main(),), daemon=True, name="gradio-worker"
    ).start()

    deadline = None
    while not worker.ready.wait(0.1):
        failure = None
        if worker.done.is_set():
            failure = worker.failure or (
                "The gateway process for executor='process' exited before it "
                "started serving; see its output above."
            )
        elif worker.gateway_started.is_set():
            deadline = deadline or time.monotonic() + STARTUP_TIMEOUT
            if time.monotonic() > deadline:
                failure = (
                    "The gateway process for executor='process' did not start "
                    f"serving within {STARTUP_TIMEOUT}s; see its output above."
                )
        if failure is not None:
            worker.close()
            blocks._queue = original_queue
            blocks._process_worker = None  # type: ignore[attr-defined]
            raise RuntimeError(failure)

    local_url, share_url = worker.urls
    blocks.server_app = blocks.app = worker.app
    blocks.local_url = local_url
    blocks.share_url = share_url
    for key, value in worker.server_attributes.items():
        setattr(blocks, key, value)
    blocks.server = AppProcessServer(worker, worker.http_port)  # type: ignore[assignment]
    blocks.is_running = True
    return worker.app, local_url, share_url


def serve_replica(blocks: Blocks, app: App | None, launch_kwargs: dict[str, Any]):
    """A replica: the app's script run again by the app's process
    (`Worker.start_replica`). It serves the sessions the gateway sends it,
    and exits with the gateway, before the rest of the script runs."""
    from gradio import client_state

    client_state._process_secret = bytes.fromhex(
        os.environ["GRADIO_PROCESS_STATE_SECRET"]
    )
    worker = Worker(
        blocks,
        {},
        {},
        app,
        launch_kwargs,
        replica_fd=int(os.environ["GRADIO_PROCESS_REPLICA_FD"]),
    )
    blocks._queue = ForwardingQueue(worker, blocks._queue)  # type: ignore[assignment]
    blocks._process_worker = worker  # type: ignore[attr-defined]
    threading.Thread(
        target=asyncio.run, args=(worker.main(),), daemon=True, name="gradio-worker"
    ).start()
    signal.signal(signal.SIGTERM, lambda *_: worker.done.set())
    try:
        worker.finished.wait()
    except KeyboardInterrupt:
        worker.done.set()
        worker.finished.wait(15)
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(0)
