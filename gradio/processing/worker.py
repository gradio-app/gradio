"""The app's side of the process executor.

`Blocks.launch(executor="process")` calls `serve()` in the process that built
the app. It spawns the gateway, then runs every event the gateway forwards
through the same `call_process_api` a normal launch uses, against an `App`
that holds this process's sessions, iterators and gr.State caches.
"""

from __future__ import annotations

import asyncio
import contextlib
import os
import pickle
import secrets
import subprocess
import sys
import tempfile
import threading
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


class Worker:
    def __init__(
        self,
        blocks: Blocks,
        gateway_kwargs: dict[str, Any],
        queue_kwargs: dict,
        app: App | None = None,
    ):
        from gradio.routes import App

        self.blocks = blocks
        self.gateway_kwargs = gateway_kwargs
        self.queue_kwargs = queue_kwargs
        # Holds this process's sessions, iterators and gr.State caches. It
        # serves no routes: a Server passes itself so `server.blocks` works.
        self.app = app if app is not None else App()
        self.app.configure_app(blocks)
        self.token = secrets.token_hex(16)
        self.loop: asyncio.AbstractEventLoop | None = None
        self.writer: asyncio.StreamWriter | None = None
        self.tasks: dict[int, asyncio.Task] = {}
        self.gateway: subprocess.Popen | None = None
        self.ready = threading.Event()
        self.done = threading.Event()
        self.urls: tuple[str, str | None] = ("", None)
        self.failure: str | None = None

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
                if kind in ("event", "process_api"):
                    _, rid, payload = message
                    run = self.run_event if kind == "event" else self.run_process_api
                    self.tasks[rid] = asyncio.create_task(
                        self.respond(rid, run, payload)
                    )
                elif kind == "cancel":
                    task = self.tasks.pop(message[1], None)
                    if task:
                        task.cancel()
                elif kind == "close_iterator":
                    await self.close_iterator(message[1])
                elif kind == "ready":
                    self.urls = (message[1], message[2])
                    self.ready.set()
        except (asyncio.IncompleteReadError, ConnectionError):
            pass
        finally:
            self.done.set()

    async def respond(self, rid: int, run, payload: dict) -> None:
        try:
            self.send(("result", rid, await run(payload)))
        except asyncio.CancelledError:
            pass
        except BaseException as exc:  # noqa: BLE001 -- user code can raise anything
            self.send(("error", rid, protocol.portable_error(exc)))
        finally:
            self.tasks.pop(rid, None)

    async def close_iterator(self, event_id: str) -> None:
        from gradio.utils import safe_aclose_iterator

        iterator = self.app.iterators.pop(event_id, None)
        if iterator is not None:
            with contextlib.suppress(Exception):
                await safe_aclose_iterator(iterator)

    async def run_event(self, p: dict) -> dict:
        """One event from the queue: exactly what a normal launch runs."""
        from gradio import route_utils

        fn = self.blocks.fns[p["fn_index"]]
        body = p["body"]
        body.client_state = protocol.restore_client_state(p["client_state"], fn)
        if not p["continuing"] and body.event_id in self.app.iterators:
            await self.close_iterator(body.event_id)
        output = await route_utils.call_process_api(
            app=self.app,
            body=body,
            gr_request=p["request"],
            fn=fn,
            root_path=p["root_path"],
        )
        output["has_iterator"] = self.app.iterators.get(body.event_id) is not None
        return output

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
            request=p["request"],
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
        from gradio import client_state
        from gradio.components.api_component import Api

        self.loop = asyncio.get_running_loop()
        server = await asyncio.start_server(self.handle, "127.0.0.1", 0)
        bootstrap = {
            "config": self.blocks.config,
            "launch_kwargs": self.gateway_kwargs,
            "queue_kwargs": self.queue_kwargs,
            # Endpoints of gr.api() and Server mode describe their types here,
            # which their config does not carry
            "api_info": {
                block._id: block._api_info
                for block in self.blocks.blocks.values()
                if isinstance(block, Api)
            },
            "port": server.sockets[0].getsockname()[1],
            "token": self.token,
            "worker_pid": os.getpid(),
            # Browser-held gr.State tokens are sealed on both sides
            "state_secret": client_state._process_secret,
        }
        fd, path = tempfile.mkstemp(prefix="gradio-gateway-", suffix=".pkl")
        with os.fdopen(fd, "wb") as f:
            pickle.dump(bootstrap, f)
        env = {**os.environ, "GRADIO_PROCESS_GATEWAY": "1"}
        self.gateway = subprocess.Popen(
            [sys.executable, "-m", "gradio.processing.gateway", path], env=env
        )
        async with server:
            while not self.done.is_set():
                if self.gateway.poll() is not None:
                    break
                await asyncio.sleep(0.2)
        self.done.set()

    def close(self) -> None:
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
    prevent_thread_lock: bool,
    app: App | None = None,
) -> tuple[App, str, str | None]:
    original_queue = blocks._queue
    queue_kwargs = {
        "max_size": original_queue.max_size,
        "default_concurrency_limit": original_queue.default_concurrency_limit,
    }
    worker = Worker(blocks, gateway_kwargs, queue_kwargs, app)
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
    blocks.server_app = worker.app
    blocks.local_url = local_url
    blocks.share_url = share_url
    blocks.is_running = True
    if not prevent_thread_lock:
        try:
            while not worker.done.wait(0.1):
                pass
        except KeyboardInterrupt:
            print("Keyboard interruption in main thread... closing server.")
        finally:
            blocks.close()
    return worker.app, local_url, share_url
