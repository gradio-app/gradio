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
import inspect
import itertools
import os
import pickle
import signal
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

HEARTBEAT_SECONDS = 5
UNRESPONSIVE_SECONDS = 30


class Link:
    """The connection to one of the app's processes. It lives on its own event
    loop, so that the server's loop only awaits futures; results arrive as
    soon as they are written whatever the server is doing."""

    def __init__(self, address: dict, pool: Pool, primary: bool):
        from gradio.utils import LRUCache

        self.address = address
        self.pool = pool
        self.primary = primary
        self.sessions: LRUCache[str, bool] = LRUCache(pool.session_capacity)
        self.last_heard = time.monotonic()
        self.ids = itertools.count()
        self.pending: dict[int, asyncio.Future] = {}
        self.writer: asyncio.StreamWriter | None = None
        self.server_loop: asyncio.AbstractEventLoop | None = None
        self.running = 0
        self.slots: dict[str, asyncio.Semaphore] = {}
        self.held: dict[str, asyncio.Semaphore] = {}
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
        writer.writelines(protocol.encode({"fingerprint": self.pool.fingerprint}))
        self.writer = writer
        self.files = protocol.FileCopies()
        self.loop.create_task(self.read_loop(reader))
        self.loop.create_task(self.heartbeat())

    async def heartbeat(self) -> None:
        """Pings the app's process, whose loop answers, so that a process whose
        loop is stuck stops getting new sessions."""
        while self.writer is not None and not self.writer.is_closing():
            self.writer.writelines(protocol.encode(("ping",)))
            await asyncio.sleep(HEARTBEAT_SECONDS)

    @property
    def responsive(self) -> bool:
        return time.monotonic() - self.last_heard < UNRESPONSIVE_SECONDS

    async def read_loop(self, reader: asyncio.StreamReader) -> None:
        try:
            while True:
                message = await protocol.read(reader)
                self.last_heard = time.monotonic()
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
                    self.server_loop.call_soon_threadsafe(self.pool.deliver, message)
                elif kind == "replica":
                    self.pool.add_replica(message[1])
                elif kind == "replica_failed":
                    self.pool.expected -= 1
                elif kind == "reload":
                    self.pool.reload(*message[1:])
        except (asyncio.IncompleteReadError, ConnectionError):
            pass
        except Exception:  # noqa: BLE001 -- the gateway cannot go on without it
            import traceback

            traceback.print_exc()
        self.pool.lost(self)

    def send(self, message: Any) -> None:
        if self.writer is not None:
            self.loop.call_soon_threadsafe(
                self.writer.writelines, protocol.encode(message)
            )

    async def _call(self, kind: str, payload: dict) -> Any:
        if self.writer is None:
            raise RuntimeError("The gateway is not connected to the app's process")
        rid = next(self.ids)
        future = self.loop.create_future()
        self.pending[rid] = future
        self.writer.writelines(protocol.encode((kind, rid, payload)))
        try:
            return await future
        except asyncio.CancelledError:
            self.pending.pop(rid, None)
            self.writer.writelines(protocol.encode(("cancel", rid)))
            raise

    async def call(self, kind: str, payload: dict) -> Any:
        """Awaited on the server's loop; cancelling it cancels the call there."""
        self.server_loop = asyncio.get_running_loop()
        future = asyncio.run_coroutine_threadsafe(self._call(kind, payload), self.loop)
        return await asyncio.wrap_future(future)

    def slot(self, concurrency_id: str, limit: int) -> asyncio.Semaphore:
        """What lets an event of `concurrency_id` run in this process, which
        runs `limit` of them at once, as with threads."""
        if concurrency_id not in self.slots:
            self.slots[concurrency_id] = asyncio.Semaphore(limit)
        return self.slots[concurrency_id]

    def release(self, event_id: str | None) -> None:
        slot = self.held.pop(event_id, None) if event_id is not None else None
        if slot is not None:
            slot.release()

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

    def __init__(self, blocks: Blocks, fingerprint: str, session_capacity: int):
        self.blocks = blocks
        self.fingerprint = fingerprint
        self.session_capacity = session_capacity
        self.links: list[Link] = []
        self.lock = threading.Lock()
        self.limits: dict[int, int | None] = {}
        self.group_limits: dict[str, int] = {}
        self.expected = 1

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

    def _holder(self, session_hash: str | None) -> Link | None:
        """The process that holds `session_hash`. Each process keeps as many
        sessions as its state holder does, so a session is forgotten here when
        its process has let go of its state."""
        if not session_hash:
            return None
        for link in self.links:
            if session_hash in link.sessions:
                link.sessions[session_hash] = True
                return link
        return None

    def holding(self, session_hash: str | None) -> Link:
        """The process that holds `session_hash`, or else the primary."""
        with self.lock:
            return self._holder(session_hash) or self.primary

    def for_session(self, session_hash: str | None) -> Link:
        with self.lock:
            link = self._holder(session_hash)
            if link is None:
                candidates = [link for link in self.links if link.responsive]
                link = min(
                    candidates or self.links,
                    key=lambda link: link.running + len(link.held),
                )
                if session_hash:
                    link.sessions[session_hash] = True
            return link

    def add_rendered(self, blocks_config, render: dict, fn_settings: dict) -> None:
        """A gr.render ran in the app's process: its blocks and events replace
        those of its last run in the session's event table, as with threads."""
        render_id = render["render_id"]
        queue = self.blocks._queue
        for component in render["components"]:
            blocks_config.blocks[component["id"]] = app_block(component)
        for fn_id, fn in list(blocks_config.fns.items()):
            if getattr(fn, "rendered_in_id", None) == render_id:
                del blocks_config.fns[fn_id]
        count = max(len(self.links), 1)
        for fn_id, fn in event_table(render, fn_settings, blocks_config.blocks).items():
            fn.rendered_in_id = render_id  # type: ignore[attr-defined]
            limit = fn.concurrency_limit
            limit = queue.default_concurrency_limit if limit == "default" else limit
            if limit is not None:
                current = self.group_limits.get(fn.concurrency_id)
                self.group_limits[fn.concurrency_id] = (
                    limit if current is None else min(current, limit)
                )
            fn.concurrency_limit = None if limit is None else limit * count
            blocks_config.fns[fn_id] = fn

    def process_limit(self, fn: BlockFunction) -> int | None:
        """How many events of `fn`'s concurrency group one process runs at
        once: the smallest limit of the events in it, as with threads."""
        return self.group_limits.get(fn.concurrency_id)

    def scale_limits(self) -> None:
        """Lets the queue admit each event's concurrency_limit once per
        process."""
        queue = self.blocks._queue
        if not self.limits:
            for fn in self.blocks.fns.values():
                limit = fn.concurrency_limit
                limit = queue.default_concurrency_limit if limit == "default" else limit
                self.limits[fn._id] = limit
                if limit is not None:
                    current = self.group_limits.get(fn.concurrency_id)
                    self.group_limits[fn.concurrency_id] = (
                        limit if current is None else min(current, limit)
                    )
        count = max(len(self.links), 1)
        for fn in self.blocks.fns.values():
            limit = self.limits.get(fn._id)
            fn.concurrency_limit = None if limit is None else limit * count
        for concurrency_id, event_queue in queue.event_queue_per_concurrency_id.items():
            limit = self.group_limits.get(concurrency_id)
            event_queue.concurrency_limit = None if limit is None else limit * count

    def session_changed(self, session_hash: str, closed: bool) -> None:
        with self.lock:
            link = self._holder(session_hash)
            targets = [link] if link is not None else list(self.links)
        for target in targets:
            target.send(("session", session_hash, closed))

    def reload(
        self, description: dict | None, change_type: str, error: str | None
    ) -> None:
        """The app's script was reloaded (`gradio app.py`, or a Space's Dev
        Mode): serves its new config and events, and tells pages to reload."""
        import copy

        from gradio.utils import reassign_pending_event_fns

        if description is not None:
            if protocol.files_by_value():
                from gradio.utils import get_upload_folder

                description = protocol.unpack_files(description, get_upload_folder())
            configure(self.blocks, description)
            reassign_pending_event_fns(self.blocks)
            self.fingerprint = description["fingerprint"]
            self.limits.clear()
            self.group_limits.clear()
            self.scale_limits()
            app = self.blocks.app
            for session in app.state_holder.session_data.values():
                session.blocks_config = copy.copy(self.blocks.default_config)
        self.blocks.app.reload_error_message = error
        self.blocks.app.change_type = change_type  # type: ignore[assignment]
        self.blocks.app.change_count += 1

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
                {
                    "pid": link.address["pid"],
                    "running": link.running,
                    "responsive": link.responsive,
                }
                for link in self.links
            ],
            "starting": max(self.expected - len(self.links), 0),
        }


class RemoteIterator:
    """What the gateway's `app.iterators` holds for a generator that is running
    in one of the app's processes. Closing it (reset, cancel) closes the real
    one."""

    def __init__(self, link: Link, event_id: str | None):
        self.link = link
        self.event_id = event_id

    async def aclose(self) -> None:
        self.link.release(self.event_id)
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
    from gradio import caching, history, route_utils
    from gradio.client_state import get_sealer

    session_state, iterator = route_utils.restore_session_state(app=app, body=body)
    client_state = body.client_state if not body.batched else None
    started_at = history.now_utc_iso()
    link = (
        iterator.link
        if isinstance(iterator, RemoteIterator)
        else pool.for_session(body.session_hash)
    )
    probing = caching._probe_mode_active.get()
    limit = (
        pool.process_limit(fn)
        if fn.queue and not fn.is_validator_function and not probing
        else None
    )
    streaming = fn.connection == "stream"
    slot = None
    link.running += 1
    try:
        if limit is not None and (iterator is None or streaming):
            candidate = link.slot(fn.concurrency_id, limit)
            await candidate.acquire()
            slot = candidate
        sent_body = body.model_dump(exclude={"request", "client_state"})
        if protocol.files_by_value():
            sent_body["data"] = link.files.pack(sent_body["data"])
        output = await link.call(
            "event",
            {
                "fn_index": fn.fn._fn_id,  # type: ignore[union-attr]
                "validator": fn.is_validator_function,
                "body": sent_body,
                "client_state": protocol.portable_client_state(client_state),
                "continuing": iterator is not None,
                "request": protocol.portable_request(gr_request),
                "root_path": root_path,
                "probe_cache": probing,
            },
        )
    except BaseException:
        if slot is not None:
            slot.release()
        elif iterator is not None:
            link.release(body.event_id)
        raise
    finally:
        link.running -= 1
    if protocol.files_by_value():
        from gradio.utils import get_upload_folder

        output = protocol.unpack_files(output, get_upload_folder())
    has_iterator = output.pop("has_iterator")
    render_settings = output.pop("render_fn_settings", None)
    if render_settings is not None and output.get("render_config"):
        pool.add_rendered(
            session_state.blocks_config, output["render_config"], render_settings
        )
    if slot is not None:
        if has_iterator and not streaming and body.event_id is not None:
            link.held[body.event_id] = slot
        else:
            slot.release()
    elif not has_iterator:
        link.release(body.event_id)
    if body.event_id is not None:
        app.iterators[body.event_id] = (  # type: ignore[assignment]
            RemoteIterator(link, body.event_id) if has_iterator else None
        )
    if client_state is not None and output.get("state"):
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


def make_stub(fn_id: int, generator: bool = False, cached: bool = False):
    """A function that does nothing, standing in for event `fn_id`'s function
    or validator in the app's process. Its shape (generator or not, cached or
    not) is what the queue reads."""
    if generator:

        def stub(*_args):
            yield

    else:

        def stub(*_args):
            pass

    stub._fn_id = fn_id  # type: ignore[attr-defined]
    if cached:
        stub.cache = None  # type: ignore[attr-defined]
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
    fn_settings = {int(fn_id): settings for fn_id, settings in fn_settings.items()}
    fns = {}
    for dep in config["dependencies"]:
        settings = fn_settings[dep["id"]]

        def ids(key):
            return [blocks[i] for i in dep.get(key) or [] if i in blocks]

        if settings["gateway_fn"] is not None:
            fn = pickle.loads(settings["gateway_fn"])
            fn._runs_in_gateway = True  # type: ignore[attr-defined]
        elif dep["backend_fn"]:
            fn = make_stub(dep["id"], dep["types"]["generator"], settings["cached"])
        else:
            fn = None
        fns[dep["id"]] = BlockFunction(
            fn=fn,
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
            input_parameter_names=settings["parameter_names"],
        )
    return fns


def app_block(component: dict) -> Any:
    """What stands in the gateway for a block of the app's config: an id and
    a type, or a gr.State or gr.api component, whose logic the gateway runs."""
    from gradio.components import State
    from gradio.components.api_component import Api

    props = component["props"]
    if props.get("name") == "state":
        block: Any = State(
            storage=props.get("storage", "server"),
            time_to_live=props.get("time_to_live"),
            render=False,
        )
    elif component["type"] == "api":
        block = Api(
            props.get("value"), props.get("_api_info") or {}, props.get("label")
        )
    else:
        return AppBlock(component)
    block._id = component["id"]
    block.app_config = component  # type: ignore[attr-defined]
    return block


def configure(blocks: Blocks, description: dict) -> None:
    """Sets what the gateway serves and queues from the app's description:
    its config, API info, theme and events."""
    config = description["config"]
    app_blocks = {
        component["id"]: app_block(component) for component in config["components"]
    }
    blocks.default_config.blocks = app_blocks
    blocks.default_config.fns = event_table(
        config, description["fn_settings"], app_blocks
    )
    blocks.default_config.fn_id = max(blocks.fns, default=-1) + 1
    blocks.app_id = config["app_id"]
    blocks._state_fingerprint = description["fingerprint"]  # type: ignore[attr-defined]
    if config.get("mode"):
        blocks.mode = config["mode"]
    if config.get("pages"):
        blocks.pages = [tuple(page) for page in config["pages"]]

    def get_config_file() -> dict:
        return dict(config)

    api_info = {
        (page, all_endpoints): info
        for page, all_endpoints, info in description["api_info"]
    }

    def get_api_info(all_endpoints: bool = False, page: str | None = None):
        return (
            api_info.get((page, bool(all_endpoints)))
            or api_info[(None, bool(all_endpoints))]
        )

    blocks.get_config_file = get_config_file  # type: ignore[method-assign]
    blocks.get_api_info = get_api_info  # type: ignore[method-assign]
    serve_as_is(blocks, description)


def serve_as_is(blocks: Blocks, description: dict) -> None:
    """The config, theme and translations the gateway serves, which `launch()`
    computes for an ordinary app, so they are set again after it."""
    blocks.config = blocks.get_config_file()
    blocks.theme_css = description["theme_css"]
    if blocks.config.get("i18n_translations"):
        blocks.i18n_instance = SimpleNamespace(  # type: ignore[assignment]
            translations_dict=blocks.config["i18n_translations"]
        )


def build(bootstrap: dict) -> Blocks:
    """A Blocks without components: it serves the app's config, API info and
    theme as they are, and queues the app's events."""
    from gradio import client_state, utils
    from gradio.blocks import Blocks
    from gradio.context import Context

    client_state._process_secret = bootstrap["state_secret"]
    Context.token = bootstrap["hf_token"]
    if bootstrap["static_paths"]:
        utils.set_static_paths(bootstrap["static_paths"])
    with Blocks() as blocks:
        pass
    configure(blocks, bootstrap)
    blocks.delete_cache = bootstrap["delete_cache"]
    blocks.proxy_urls = set(bootstrap["proxy_urls"])
    blocks._expects_oauth = bootstrap["expects_oauth"]  # type: ignore[attr-defined]
    pool = Pool(blocks, bootstrap["fingerprint"], bootstrap["session_capacity"])
    pool.expected = bootstrap["replicas"]
    blocks._process_pool = pool  # type: ignore[attr-defined]
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
    static_workers = getattr(blocks, "_static_worker_pool", None)
    if static_workers is not None:
        with contextlib.suppress(Exception):
            static_workers.shutdown()
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


FORWARDED_ROUTES = [
    ("/custom_component/{id}/{environment}/{type}/{file_name}", ["GET"]),
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


def explain_lifespan_state(endpoint):
    """`endpoint`, a route that runs in the gateway, which points to
    process='app' if it reads what the app's lifespan set on `request.state`,
    since the lifespan runs in the app's process."""
    import functools

    def explained(err: AttributeError) -> AttributeError:
        if "'State' object has no attribute" not in str(err):
            return err
        return AttributeError(
            f"{err}. This route runs in the gateway process (the default for "
            "GET routes with executor='process'), where the app's lifespan does "
            "not run. Pass process='app' to run it in the app's process."
        )

    if inspect.iscoroutinefunction(endpoint):

        @functools.wraps(endpoint)
        async def run_async(*args, **kwargs):
            try:
                return await endpoint(*args, **kwargs)
            except AttributeError as err:
                raise explained(err) from err

        return run_async

    @functools.wraps(endpoint)
    def run(*args, **kwargs):
        try:
            return endpoint(*args, **kwargs)
        except AttributeError as err:
            raise explained(err) from err

    return run


async def session_of(request: Request) -> str | None:
    """The session a forwarded request is for, so that it reaches the process
    that holds it."""
    import json

    session_hash = request.path_params.get("session_hash") or request.query_params.get(
        "session_hash"
    )
    if session_hash is None and request.headers.get("content-type", "").startswith(
        "application/json"
    ):
        with contextlib.suppress(ValueError, AttributeError):
            session_hash = json.loads(await request.body()).get("session_hash")
    return session_hash if isinstance(session_hash, str) else None


def add_forwarded_routes(app, bootstrap: dict, pool: Pool) -> None:
    from urllib.parse import quote

    from fastapi import Depends, HTTPException
    from fastapi.routing import APIRoute
    from starlette.routing import Mount, WebSocketRoute

    from gradio.processing.proxy import (
        METHODS,
        TOKEN_HEADER,
        USER_HEADER,
        forward,
        relay,
    )
    from gradio.route_utils import API_PREFIX

    port = bootstrap["http_port"]
    token = [(TOKEN_HEADER, bootstrap["http_token"].encode())]

    async def send(request: Request, link: Link):
        headers = [(TOKEN_HEADER, link.address["http_token"].encode())]
        user = await logged_in_user(app, request)
        if user is not None:
            headers.append((USER_HEADER, quote(user).encode()))
        return await forward(
            request, f"http://127.0.0.1:{link.address['http_port']}", headers
        )

    async def to_app(request: Request):
        return await send(request, pool.primary)

    async def to_session(request: Request):
        return await send(request, pool.holding(await session_of(request)))

    async def websocket_to_app(websocket):
        await relay(websocket, f"ws://127.0.0.1:{port}", token)

    async def processes():
        return pool.status()

    async def login_check(request: Request) -> None:
        if app.auth is None and app.auth_dependency is None:
            return
        if app.auth_dependency is not None:
            user = app.auth_dependency(request)
            if inspect.isawaitable(user):
                user = await user
        else:
            user = await logged_in_user(app, request)
        if user is None:
            raise HTTPException(status_code=401, detail="Not authenticated")

    routes: list = [
        APIRoute(
            API_PREFIX + path,
            to_session,
            methods=methods or METHODS,
            include_in_schema=False,
        )
        for path, methods in FORWARDED_ROUTES
    ]
    routes.append(
        APIRoute(
            API_PREFIX + "/processes",
            processes,
            methods=["GET"],
            dependencies=[Depends(login_check)],
        )
    )
    for kind, path, data in bootstrap["server_routes"]:
        if kind == "http":
            routes.append(APIRoute(path, to_app, methods=data, include_in_schema=False))
        elif kind == "gateway":
            endpoint, kwargs = pickle.loads(data)
            kwargs = dict(kwargs)
            routes.append(
                APIRoute(
                    path,
                    explain_lifespan_state(endpoint),
                    dependencies=[
                        *app.router.dependencies,
                        *(kwargs.pop("dependencies", None) or []),
                    ],
                    dependency_overrides_provider=app,
                    **kwargs,
                )
            )
        elif kind == "static":
            static_files, name = data
            routes.append(Mount(path, app=static_files, name=name))
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
    description = protocol.decode(bootstrap.pop("description"))
    if protocol.files_by_value():
        from gradio.utils import get_upload_folder

        description = protocol.unpack_files(description, get_upload_folder())
    bootstrap.update(description)
    adopt_environment(bootstrap["env"], bootstrap["cwd"])
    blocks = build(bootstrap)
    signal.signal(signal.SIGTERM, lambda *_: shutdown(blocks))
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
                "http_port": bootstrap["http_port"],
                "http_token": bootstrap["http_token"],
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
    if bootstrap["middleware"] is not None:
        launch_kwargs["app_kwargs"] = {
            **(launch_kwargs.get("app_kwargs") or {}),
            "middleware": pickle.loads(bootstrap["middleware"]),
        }
    if bootstrap["check_dependencies"]:
        from fastapi import Depends

        from gradio.processing.proxy import TOKEN_HEADER, check_dependencies

        target = f"http://127.0.0.1:{bootstrap['http_port']}"
        token = [(TOKEN_HEADER, bootstrap["http_token"].encode())]

        async def app_dependencies(request: Request) -> None:
            await check_dependencies(request, target, token)

        app_kwargs = dict(launch_kwargs.get("app_kwargs") or {})
        app_kwargs["dependencies"] = [Depends(app_dependencies)]
        launch_kwargs["app_kwargs"] = app_kwargs
    app, local_url, share_url = blocks.launch(prevent_thread_lock=True, **launch_kwargs)
    serve_as_is(blocks, bootstrap)
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
    shutdown(blocks)


if __name__ == "__main__":
    if sys.argv[1] == "--zygote":
        from gradio.processing.spare import run_zygote

        run_zygote(int(sys.argv[2]))
    else:
        main(sys.argv[1])
