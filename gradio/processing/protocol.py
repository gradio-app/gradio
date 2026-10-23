"""Messages between the app's process and its gateway.

Each message is a pickled tuple behind a 4-byte length. The connection is a
loopback socket that only the gateway this process spawned can use (it must
send the token first), so both ends trust what they unpickle.
"""

from __future__ import annotations

import asyncio
import pickle
import struct
from typing import Any

HEADER = struct.Struct("!I")


def encode(message: Any) -> bytes:
    body = pickle.dumps(message, protocol=pickle.HIGHEST_PROTOCOL)
    return HEADER.pack(len(body)) + body


async def read(reader: asyncio.StreamReader) -> Any:
    (size,) = HEADER.unpack(await reader.readexactly(HEADER.size))
    return pickle.loads(await reader.readexactly(size))


def portable_error(exc: BaseException) -> tuple:
    """An exception crosses as itself when it survives pickling, else as a summary."""
    try:
        data = pickle.dumps(exc)
        pickle.loads(data)
        return ("pickled", data)
    except Exception:
        return ("summary", type(exc).__name__, str(exc))


def restore_error(payload: tuple) -> BaseException:
    if payload[0] == "pickled":
        return pickle.loads(payload[1])
    return RuntimeError(f"{payload[1]}: {payload[2]}")


# Modules every gateway can import, so annotations naming only their types
# can cross. Gradio reads some (gr.Request, gr.OAuthToken, gr.Progress...) to
# tell injected parameters from inputs.
PORTABLE_MODULES = {
    "builtins",
    "typing",
    "typing_extensions",
    "operator",
    "_operator",
    "types",
    "collections",
    "datetime",
    "pathlib",
    "gradio",
    "gradio_client",
    "fastapi",
    "starlette",
    "pydantic",
    "numpy",
    "PIL",
    "pandas",
}


class _PortableUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module.split(".")[0] not in PORTABLE_MODULES:
            raise pickle.UnpicklingError(module)
        return super().find_class(module, name)


def _as_typing(annotation):
    """`X | None` (types.UnionType) does not pickle; typing.Union does."""
    import types
    import typing

    if isinstance(annotation, types.UnionType):
        return typing.Union[annotation.__args__]  # noqa: UP007
    return annotation


def _portable(value) -> bool:
    """Whether `value` pickles to something only PORTABLE_MODULES can load."""
    import io

    try:
        data = pickle.dumps(value, protocol=pickle.HIGHEST_PROTOCOL)
        _PortableUnpickler(io.BytesIO(data)).load()
        return True
    except Exception:
        return False


def portable_signature(fn) -> tuple | None:
    """A function's signature as it can cross to the gateway: annotations only
    when they name types every gateway can import, simple defaults only."""
    import inspect

    try:
        signature = inspect.signature(fn, eval_str=True)
    except Exception:
        try:
            signature = inspect.signature(fn)
        except (TypeError, ValueError):
            return None
    empty = inspect.Parameter.empty
    parameters = []
    for p in signature.parameters.values():
        default = p.default
        if default is not empty and not _portable(default):
            default = None
        annotation = _as_typing(p.annotation)
        annotation = annotation if _portable(annotation) else empty
        parameters.append((p.name, int(p.kind), default, annotation))
    returns = _as_typing(signature.return_annotation)
    return parameters, returns if _portable(returns) else empty


def restore_signature(portable: tuple | None):
    import inspect

    if portable is None:
        return None
    parameters, returns = portable
    return inspect.Signature(
        [
            inspect.Parameter(
                name, inspect._ParameterKind(kind), default=default, annotation=ann
            )
            for name, kind, default, ann in parameters
        ],
        return_annotation=returns,
    )


FORWARDED = "__gradio_forwarded_to_the_app_process__"


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
        }
    )


def portable_metadata(fn) -> dict:
    """What tools such as the MCP server read off an event's function."""
    metadata = {
        name: getattr(fn, name)
        for name in ("__name__", "__qualname__", "__doc__")
        if isinstance(getattr(fn, name, None), str)
    }
    for name in dir(fn):
        if name.startswith("_mcp_") and _portable(getattr(fn, name, None)):
            metadata[name] = getattr(fn, name)
    return metadata


def portable_request(request):
    """A request as it can cross: a gr.Request pickles itself, while a raw
    Starlette request (the MCP server passes one) crosses as a snapshot."""
    from starlette.requests import Request as StarletteRequest

    if isinstance(request, list):
        return [portable_request(r) for r in request]
    if isinstance(request, StarletteRequest):
        return ("starlette", request_snapshot(request))
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
    rebuilt = Request(
        StarletteRequest(scope),
        username=request.username,
        session_hash=request.session_hash,
    )
    return rebuilt


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
