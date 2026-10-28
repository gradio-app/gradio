"""Messages between the app's process and its gateway.

Each message is JSON, as Gradio sends an event's output to the browser, and
the bytes it holds (sealed gr.State values, files sent by value) follow it as
frames of their own. So nothing the app's process sends is unpickled: the
gateway reads only data, and an error crosses as its type, message and
traceback.

The connection is a loopback socket that only the gateway this process
spawned can use: it sends the token first, as raw bytes that the app's
process checks before it reads anything else.
"""

from __future__ import annotations

import asyncio
import io
import os
import pickle
import struct
import types
from typing import Any

import orjson
from pydantic import BaseModel

HEAD = struct.Struct("!II")
SIZE = struct.Struct("!Q")
BYTES = "__gradio_bytes__"


def encode(message: Any) -> list[bytes]:
    """`message` as JSON, followed by the bytes it holds. A value JSON has no
    type for becomes what the browser would get for it."""
    attachments: list[bytes] = []

    def default(value: Any) -> Any:
        if isinstance(value, (bytes, bytearray, memoryview)):
            attachments.append(bytes(value))
            return {BYTES: len(attachments) - 1}
        if isinstance(value, BaseModel):
            return value.model_dump()
        if isinstance(value, (set, frozenset)):
            return list(value)
        return str(value)

    body = orjson.dumps(message, default=default, option=orjson.OPT_NON_STR_KEYS)
    frames = [HEAD.pack(len(body), len(attachments)), body]
    for attachment in attachments:
        frames += [SIZE.pack(len(attachment)), attachment]
    return frames


def _with_bytes(value: Any, attachments: list[bytes]) -> Any:
    if isinstance(value, dict):
        if len(value) == 1 and BYTES in value:
            return attachments[value[BYTES]]
        return {k: _with_bytes(v, attachments) for k, v in value.items()}
    if isinstance(value, list):
        return [_with_bytes(v, attachments) for v in value]
    return value


async def read(reader: asyncio.StreamReader) -> Any:
    size, count = HEAD.unpack(await reader.readexactly(HEAD.size))
    message = orjson.loads(await reader.readexactly(size))
    if not count:
        return message
    attachments = []
    for _ in range(count):
        (length,) = SIZE.unpack(await reader.readexactly(SIZE.size))
        attachments.append(await reader.readexactly(length))
    return _with_bytes(message, attachments)


def decode(data: bytes) -> Any:
    """A message that `encode` wrote, read from `data`."""
    stream = io.BytesIO(data)
    size, count = HEAD.unpack(stream.read(HEAD.size))
    message = orjson.loads(stream.read(size))
    attachments = []
    for _ in range(count):
        (length,) = SIZE.unpack(stream.read(SIZE.size))
        attachments.append(stream.read(length))
    return _with_bytes(message, attachments) if count else message


def is_json(value: Any) -> bool:
    try:
        orjson.dumps(value)
    except TypeError:
        return False
    return True


class NotPortable(pickle.PicklingError):
    pass


class _AppPickler(pickle.Pickler):
    """Refuses what pickles by a reference into `__main__`."""

    def reducer_override(self, obj):
        if isinstance(obj, (type, types.FunctionType)):
            module = getattr(obj, "__module__", None)
        else:
            module = type(obj).__module__
        if module == "__main__":
            raise NotPortable(f"{obj!r} is defined in __main__")
        return NotImplemented


def dumps(value: Any) -> bytes:
    """`value` pickled so that the gateway can load it, or NotPortable. Only
    the settings the app's process hands the gateway it spawns are pickled."""
    buffer = io.BytesIO()
    _AppPickler(buffer, protocol=pickle.HIGHEST_PROTOCOL).dump(value)
    return buffer.getvalue()


class RemoteTraceback(Exception):  # noqa: N818
    """The traceback of an exception raised in the app's process, set as the
    `__cause__` of the one the gateway raises, as `ProcessPoolExecutor` does."""

    def __init__(self, text: str):
        self.text = text

    def __str__(self) -> str:
        return self.text


class AppProcessError(Exception):
    """An exception the app's process raised, other than a gr.Error: its
    message as it is, and its type and traceback in its `__cause__`."""

    def __init__(self, name: str, message: str):
        super().__init__(message)
        self.name = name


def portable_error(exc: BaseException) -> dict:
    """An exception as data: a gr.Error keeps what the user sees."""
    import traceback

    from gradio.caching import CacheMissError
    from gradio.exceptions import Error

    error: dict[str, Any] = {
        "type": type(exc).__name__,
        "message": str(exc),
        "traceback": "".join(traceback.format_exception(exc)),
        "cache_miss": isinstance(exc, CacheMissError),
        "gradio_error": None,
    }
    if isinstance(exc, Error):
        error["gradio_error"] = {
            "message": exc.message,
            "duration": exc.duration,
            "visible": exc.visible,
            "title": exc.title,
            "print_exception": exc.print_exception,
        }
    return error


def restore_error(error: dict) -> BaseException:
    from gradio.caching import CacheMissError
    from gradio.exceptions import Error

    restored: BaseException
    if error["cache_miss"]:
        restored = CacheMissError()
    elif error["gradio_error"] is not None:
        restored = Error(**error["gradio_error"])
    else:
        restored = AppProcessError(error["type"], error["message"])
    restored.__cause__ = RemoteTraceback(error["traceback"])
    return restored


FILE = "__gradio_file__"


def files_by_value() -> bool:
    """Whether files cross by value (GRADIO_PROCESS_FILES=value), for an app
    process that does not share the gateway's disk, rather than as paths."""
    return os.environ.get("GRADIO_PROCESS_FILES", "path").lower() == "value"


def _is_file_data(value: dict) -> bool:
    return (
        isinstance(value.get("path"), str)
        and (value.get("meta") or {}).get("_type") == "gradio.FileData"
        and not value.get("is_stream")
    )


class FileCopies:
    """The files one side sends the other by value, over one connection: each
    goes once, named by its content, and later mentions of it carry only its
    name."""

    def __init__(self):
        self.sent: set[str] = set()
        self.digests: dict[tuple[str, int, int], str] = {}

    def pack(self, value: Any) -> Any:
        if isinstance(value, BaseModel):
            value = value.model_dump()
        if isinstance(value, list | tuple):
            return [self.pack(v) for v in value]
        if not isinstance(value, dict):
            return value
        if not _is_file_data(value) or not os.path.isfile(value["path"]):
            return {k: self.pack(v) for k, v in value.items()}
        import hashlib

        stat = os.stat(value["path"])
        key = (value["path"], stat.st_size, stat.st_mtime_ns)
        data = None
        digest = self.digests.get(key)
        if digest is None:
            with open(value["path"], "rb") as f:
                data = f.read()
            digest = self.digests[key] = hashlib.sha256(data).hexdigest()
        if digest in self.sent:
            data = None
        elif data is None:
            with open(value["path"], "rb") as f:
                data = f.read()
        self.sent.add(digest)
        return {**value, FILE: {"sha256": digest, "data": data}}


def unpack_files(value: Any, folder: str) -> Any:
    """`value` with each file sent by value written under `folder`, and its
    path (and URL) pointing there."""
    if isinstance(value, list):
        return [unpack_files(v, folder) for v in value]
    if not isinstance(value, dict):
        return value
    if FILE not in value:
        return {k: unpack_files(v, folder) for k, v in value.items()}
    copy = value[FILE]
    sent_path = value["path"]
    target = os.path.join(folder, copy["sha256"], os.path.basename(sent_path))
    if copy["data"] is not None and not os.path.exists(target):
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target + ".part", "wb") as f:
            f.write(copy["data"])
        os.replace(target + ".part", target)
    unpacked = {k: v for k, v in value.items() if k != FILE}
    unpacked["path"] = target
    url = unpacked.get("url")
    if isinstance(url, str):
        from gradio_client.utils import encode_file_path

        for old, new in (
            (encode_file_path(sent_path), encode_file_path(target)),
            (sent_path, target),
        ):
            if old in url:
                unpacked["url"] = url.replace(old, new)
                break
    return unpacked


FORWARDED = "__gradio_forwarded_to_the_app_process__"


def _session(request) -> dict | None:
    """The Starlette session of a request (OAuth keeps its login there)."""
    scope = getattr(request, "scope", None) or {}
    session = scope.get("session")
    return dict(session) if session is not None else None


def request_snapshot(request) -> dict:
    """What a Starlette request carries, for code in the app's process."""
    return {
        "method": request.method,
        "url": str(request.url),
        "headers": [
            (k.decode("latin-1"), v.decode("latin-1")) for k, v in request.headers.raw
        ],
        "client": (request.client.host, request.client.port)
        if request.client
        else None,
        "path_params": dict(request.path_params),
        "session": _session(request),
    }


def starlette_request(snapshot: dict, state: dict | None = None):
    from urllib.parse import urlsplit

    from starlette.requests import Request as StarletteRequest

    url = urlsplit(snapshot["url"])
    return StarletteRequest(
        {
            "type": "http",
            "method": snapshot.get("method", "GET"),
            "scheme": url.scheme or "http",
            "server": (url.hostname or "", url.port or 80),
            "path": url.path or "/",
            "raw_path": (url.path or "/").encode(),
            "root_path": "",
            "query_string": url.query.encode(),
            "headers": [
                (k.lower().encode("latin-1"), v.encode("latin-1"))
                for k, v in snapshot["headers"]
            ],
            "client": snapshot.get("client"),
            "path_params": snapshot.get("path_params") or {},
            "state": dict(state or {}),
            **(
                {"session": snapshot["session"]}
                if snapshot.get("session") is not None
                else {}
            ),
        }
    )


def _json_state(state: Any) -> dict:
    """What was set on a request's `state` that JSON can carry."""
    values = dict(getattr(state, "_state", None) or {})
    return {k: v for k, v in values.items() if isinstance(k, str) and is_json(v)}


def portable_request(request):
    """A request as data: a gr.Request as a snapshot of its Starlette request
    (with its session and `state`), its username and session hash; a raw
    Starlette request (the MCP server passes one) as a snapshot."""
    from starlette.requests import Request as StarletteRequest

    from gradio.route_utils import Request

    if isinstance(request, list):
        return [portable_request(r) for r in request]
    if isinstance(request, StarletteRequest):
        return {"kind": "starlette", **request_snapshot(request)}
    if not isinstance(request, Request):
        return None
    if request.request is not None:
        snapshot = request_snapshot(request.request)
        snapshot["state"] = _json_state(getattr(request.request, "state", None))
    else:
        kwargs = request.kwargs
        client = kwargs.get("client") or {}
        snapshot = {
            "method": "POST",
            "url": str(kwargs.get("url", "")),
            "headers": [
                (str(k), str(v)) for k, v in (kwargs.get("headers") or {}).items()
            ],
            "client": (client.get("host"), client.get("port")),
            "path_params": kwargs.get("path_params") or {},
            "session": kwargs.get("session"),
            "state": {
                k: v
                for k, v in (kwargs.get("request_state") or {}).items()
                if is_json(v)
            },
        }
    return {
        "kind": "gradio",
        "username": request.username,
        "session_hash": request.session_hash,
        **snapshot,
    }


def restore_request(request, lifespan_state: dict | None = None):
    """A request that crossed from the gateway, rebuilt over a Starlette
    request so that headers, cookies, query parameters and `state` behave as
    they do when the function runs in the server's process."""
    from gradio.route_utils import Request

    if isinstance(request, list):
        return [restore_request(r, lifespan_state) for r in request]
    if request is None:
        return None
    state = {**(lifespan_state or {}), **(request.get("state") or {})}
    if request["kind"] == "starlette":
        return starlette_request(request, state)
    return Request(
        starlette_request(request, state),
        username=request["username"],
        session_hash=request["session_hash"],
    )


def describe_routes(app) -> list[tuple]:
    """The routes of a FastAPI app (a Server's own, before Gradio adds its
    routes), in order, as the gateway serves them: it forwards them to the
    app's process, and serves StaticFiles mounts itself."""
    from fastapi.routing import APIRoute, APIWebSocketRoute
    from starlette.routing import Mount, WebSocketRoute
    from starlette.staticfiles import StaticFiles

    routes: list[tuple] = []

    def walk(entries, prefix: str) -> None:
        for entry in entries:
            if hasattr(entry, "effective_candidates"):
                walk(entry.effective_candidates(), entry.include_context.prefix)
                continue
            route = getattr(entry, "original_route", entry)
            path = prefix + route.path
            if isinstance(route, APIRoute):
                routes.append(("http", path, sorted(route.methods)))
            elif isinstance(route, (APIWebSocketRoute, WebSocketRoute)):
                routes.append(("websocket", path, None))
            elif isinstance(route, Mount) and isinstance(route.app, StaticFiles):
                routes.append(("static", path, (route.app, route.name)))
            elif isinstance(route, Mount):
                routes.append(("mount", path, None))

    walk(app.router.routes, "")
    return routes


def portable_client_state(client_state) -> dict | None:
    """The browser-held gr.State values of an event, without the gateway's components."""
    if client_state is None:
        return None
    return {
        "fingerprint": client_state.fingerprint,
        "serialized": client_state.serialized,
        "client_refs": client_state.client_refs,
        "issued_at": client_state.issued_at,
        "username": client_state.username,
        "session_hash": client_state.session_hash,
    }


def restore_client_state(data: dict | None, fn):
    if data is None:
        return None
    from gradio.client_state import ClientState, client_state_components

    def by_id(values: dict) -> dict:
        return {int(k): v for k, v in values.items()}

    client_state = ClientState(
        client_state_components(fn),
        data["fingerprint"],
        by_id(data["serialized"]),
        by_id(data["client_refs"]),
        data["username"],
        data["session_hash"],
    )
    client_state.issued_at = by_id(data["issued_at"])
    return client_state
