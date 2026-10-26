"""Messages between the app's process and its gateway.

Each message is a pickled tuple behind a 4-byte length. The connection is a
loopback socket that only the gateway this process spawned can use: it sends
the token first, as raw bytes that the app's process checks before it
unpickles anything, so both ends trust what they unpickle.

The results and errors the app's process sends are pickled on their own, so
that one the gateway cannot load fails its call, not the connection. They are
pickled without classes or functions defined in `__main__` (the app's script),
which pickle by reference and which the gateway, running another script,
cannot find.
"""

from __future__ import annotations

import asyncio
import io
import pickle
import struct
import types
from typing import Any

HEADER = struct.Struct("!I")


def encode(message: Any) -> bytes:
    body = pickle.dumps(message, protocol=pickle.HIGHEST_PROTOCOL)
    return HEADER.pack(len(body)) + body


async def read(reader: asyncio.StreamReader) -> Any:
    (size,) = HEADER.unpack(await reader.readexactly(HEADER.size))
    return pickle.loads(await reader.readexactly(size))


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
    """`value` pickled so that the gateway can load it, or NotPortable."""
    buffer = io.BytesIO()
    _AppPickler(buffer, protocol=pickle.HIGHEST_PROTOCOL).dump(value)
    return buffer.getvalue()


def portable_error(exc: BaseException) -> tuple:
    """An exception crosses as itself when it can, else as a summary."""
    summary = (type(exc).__name__, str(exc))
    try:
        return ("pickled", dumps(exc), *summary)
    except Exception:
        return ("summary", None, *summary)


def restore_error(payload: tuple) -> BaseException:
    kind, data, name, message = payload
    if kind == "pickled":
        try:
            return pickle.loads(data)
        except Exception:
            pass
    return RuntimeError(f"{name}: {message}")


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


def portable_request(request):
    """A request as it can cross: a gr.Request pickles itself, with its session,
    while a raw Starlette request (the MCP server passes one) crosses as a
    snapshot."""
    from starlette.requests import Request as StarletteRequest

    from gradio.route_utils import Request

    if isinstance(request, list):
        return [portable_request(r) for r in request]
    if isinstance(request, StarletteRequest):
        return ("starlette", request_snapshot(request))
    if isinstance(request, Request) and request.request is not None:
        session = _session(request.request)
        if session is not None:
            request.kwargs["session"] = session
    return request


def restore_request(request, lifespan_state: dict | None = None):
    """A gr.Request that crossed from the gateway, rebuilt over a Starlette
    request so that headers, cookies, query parameters and `state` behave as
    they do when the function runs in the server's process."""
    from urllib.parse import urlsplit

    from starlette.requests import Request as StarletteRequest

    from gradio.route_utils import Request

    if isinstance(request, list):
        return [restore_request(r, lifespan_state) for r in request]
    if isinstance(request, tuple) and request[:1] == ("starlette",):
        return starlette_request(request[1], lifespan_state)
    if not isinstance(request, Request) or request.request is not None:
        return request
    kwargs = request.kwargs
    session = kwargs.pop("session", None)
    url = urlsplit(str(kwargs.get("url", "")))
    client = kwargs.get("client") or {}
    state = dict(lifespan_state or {})
    request_state = getattr(request.__dict__.get("state"), "_state", None)
    state.update(request_state or {})
    scope = {
        "type": "http",
        "method": "POST",
        "scheme": url.scheme or "http",
        "server": (url.hostname or "", url.port or 80),
        "path": url.path or "/",
        "raw_path": (url.path or "/").encode(),
        "root_path": "",
        "query_string": url.query.encode(),
        "headers": [
            (str(k).lower().encode("latin-1"), str(v).encode("latin-1"))
            for k, v in (kwargs.get("headers") or {}).items()
        ],
        "client": (client.get("host"), client.get("port")),
        "path_params": kwargs.get("path_params") or {},
        "state": state,
    }
    if session is not None:
        scope["session"] = session
    return Request(
        StarletteRequest(scope),
        username=request.username,
        session_hash=request.session_hash,
    )


def describe_routes(app) -> list[tuple[str, str, list[str]]]:
    """The routes of a FastAPI app (a Server's own, before Gradio adds its
    routes), as the gateway forwards them."""
    from fastapi.routing import APIRoute, APIWebSocketRoute
    from starlette.routing import Mount, WebSocketRoute

    routes = []
    for route in app.router.routes:
        if isinstance(route, APIRoute):
            routes.append(("http", route.path, sorted(route.methods)))
        elif isinstance(route, (APIWebSocketRoute, WebSocketRoute)):
            routes.append(("websocket", route.path, []))
        elif isinstance(route, Mount):
            routes.append(("mount", route.path, []))
    return routes


def jsonable(output: dict) -> dict:
    """An event's output with its data as the client receives it, JSON types."""
    from pydantic_core import to_jsonable_python

    return {**output, "data": to_jsonable_python(output.get("data"), fallback=str)}


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

    client_state = ClientState(
        client_state_components(fn),
        data["fingerprint"],
        data["serialized"],
        data["client_refs"],
        data["username"],
        data["session_hash"],
    )
    client_state.issued_at = data["issued_at"]
    return client_state
