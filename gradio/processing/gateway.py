"""The gateway process of the process executor: HTTP, the queue, SSE and files.

It never imports the app. It rebuilds the UI from the app's config, keeping
every id, and forwards each event to the app's process, which runs it.
"""

from __future__ import annotations

import asyncio
import itertools
import os
import pickle
import sys
import threading
import time
import warnings
from typing import TYPE_CHECKING, Any

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
        writer.write(protocol.encode(self.bootstrap["token"]))
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
                        future.set_result(message[2])
                    else:
                        future.set_exception(protocol.restore_error(message[2]))
                elif kind in ("log", "progress") and self.server_loop is not None:
                    # The queue's events belong to the server's loop
                    self.server_loop.call_soon_threadsafe(self.deliver, message)
        except (asyncio.IncompleteReadError, ConnectionError):
            pass
        # The app's process exited, or refused this gateway
        os._exit(0)

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
) -> dict[str, Any]:
    """`route_utils.call_process_api`, run in the app's process."""
    from gradio import history, route_utils
    from gradio.client_state import get_sealer

    _, iterator = route_utils.restore_session_state(app=app, body=body)
    client_state = body.client_state if not body.batched else None
    started_at = history.now_utc_iso()
    output = await link.call(
        "event",
        {
            "fn_index": fn.fn._process_fn_index,  # type: ignore[union-attr]
            "body": body.model_copy(update={"request": None, "client_state": None}),
            "client_state": protocol.portable_client_state(client_state),
            "continuing": iterator is not None,
            "request": gr_request,
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
    route_utils._record_run_history(
        app,
        fn=fn,
        gr_request=gr_request,
        inputs=body.data,
        outputs=output.get("data"),
        started_at=started_at,
        is_final=not output.get("is_generating"),
    )
    return output


def make_proxy(dependency: dict):
    """Stands in for a function that lives in the app's process. Its shape
    (generator or not) is what the config reports to clients."""
    if not dependency.get("backend_fn"):
        return None
    if (dependency.get("types") or {}).get("generator"):

        def proxy(*_args):
            yield

    else:

        def proxy(*_args):
            pass

    proxy._process_fn_index = dependency["id"]  # type: ignore[attr-defined]
    return proxy


def build(bootstrap: dict) -> Blocks:
    from gradio import client_state
    from gradio.blocks import Blocks
    from gradio.components import api_component  # noqa: F401 -- registers Api

    client_state._process_secret = bootstrap["state_secret"]
    config = bootstrap["config"]
    for component in config["components"]:
        props = component["props"]
        # The config carries State's default delete_callback, which
        # from_config cannot pass back alongside storage="browser"
        if props.get("name") == "state":
            props.pop("delete_callback", None)
        if props.get("name") == "api":
            props["_api_info"] = bootstrap["api_info"].get(component["id"])
    fns = [make_proxy(dependency) for dependency in config["dependencies"]]
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        blocks = Blocks.from_config(config, fns, "http://127.0.0.1", preserve_ids=True)
    # from_config is made for apps on other servers; these files are local
    for block in blocks.blocks.values():
        if hasattr(block, "proxy_url"):
            block.proxy_url = None
    blocks.proxy_urls = set()
    for fn_id, settings in bootstrap["fn_settings"].items():
        if fn_id in blocks.fns:
            for key, value in settings.items():
                setattr(blocks.fns[fn_id], key, value)
    if config.get("mode"):
        blocks.mode = config["mode"]
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
                "request": request,
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


def watch_app_process(pid: int) -> None:
    while True:
        try:
            os.kill(pid, 0)
        except ProcessLookupError:
            os._exit(0)
        time.sleep(1)


def main(path: str) -> None:
    with open(path, "rb") as f:
        bootstrap = pickle.load(f)
    os.unlink(path)
    threading.Thread(
        target=watch_app_process, args=(bootstrap["worker_pid"],), daemon=True
    ).start()
    blocks = build(bootstrap)
    blocks.queue(**bootstrap["queue_kwargs"])
    link: Link = blocks._process_link  # type: ignore[attr-defined]
    link.connect()
    _, local_url, share_url = blocks.launch(
        prevent_thread_lock=True, **bootstrap["launch_kwargs"]
    )
    link.send(("ready", local_url, share_url))
    blocks.block_thread()


if __name__ == "__main__":
    main(sys.argv[1])
