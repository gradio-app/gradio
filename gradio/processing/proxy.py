"""HTTP between the gateway and the app's process, in both directions.

The app's process keeps a real Gradio app, built over its own blocks and
state, and serves it on a private loopback port. The gateway forwards it the
requests that need that state or the app's code (component server functions,
deep links, media streams, a Server's own routes), marked with a token.
Every other request that reaches that app, such as one from
`TestClient(app)` on the app `launch()` returned, is sent on to the gateway,
which serves it like any client's.
"""

from __future__ import annotations

import asyncio
import contextlib
import hmac
from collections.abc import Sequence
from typing import Any

import httpx2
from starlette.requests import Request
from starlette.responses import StreamingResponse

TOKEN_HEADER = b"x-gradio-gateway-token"
# The user the gateway logged in, trusted only beside the token
USER_HEADER = b"x-gradio-gateway-user"
# Asks the app's process to run only its FastAPI dependencies for a request
CHECK_HEADER = b"x-gradio-gateway-check"
# Only the gateway sets these
GATEWAY_HEADERS = {TOKEN_HEADER, USER_HEADER, CHECK_HEADER}
# Headers that describe one connection, not the message. Host is kept, so
# that the receiver builds URLs for the address the client used.
SKIPPED_REQUEST_HEADERS = {b"connection", b"keep-alive", b"transfer-encoding"}
SKIPPED_RESPONSE_HEADERS = {b"content-length", b"connection", b"transfer-encoding"}
METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]


def _upstream(
    request: Request, target: str
) -> tuple[httpx2.URL, list[tuple[bytes, bytes]]]:
    """The URL at `target` (an origin) for the raw path the client sent, and
    the request's headers to send there."""
    raw_path = request.scope.get("raw_path") or request.url.path.encode()
    if request.url.query:
        raw_path += b"?" + request.url.query.encode()
    headers = [
        (k, v)
        for k, v in request.headers.raw
        if k.lower() not in SKIPPED_REQUEST_HEADERS and k.lower() not in GATEWAY_HEADERS
    ]
    return httpx2.URL(target.rstrip("/")).copy_with(raw_path=raw_path), headers


async def forward(
    request: Request, target: str, extra_headers: Sequence[tuple[bytes, bytes]] = ()
) -> StreamingResponse:
    """Streams `request` to `target` (an origin) and its response back."""
    # A client per request: TestClient may call an app from a new event loop
    # each time, and an AsyncClient belongs to the loop it was made on
    client = httpx2.AsyncClient(timeout=None)
    url, headers = _upstream(request, target)
    upstream = client.build_request(
        request.method,
        url,
        headers=[*headers, *extra_headers],
        content=request.stream(),
    )
    try:
        response = await client.send(upstream, stream=True)
    except BaseException:
        await client.aclose()
        raise

    async def body():
        try:
            async for chunk in response.aiter_raw():
                yield chunk
        finally:
            await response.aclose()
            await client.aclose()

    forwarded = StreamingResponse(body(), status_code=response.status_code)
    forwarded.raw_headers = [
        (k, v)
        for k, v in response.headers.raw
        if k.lower() not in SKIPPED_RESPONSE_HEADERS
    ]
    return forwarded


async def relay(
    websocket: Any, target: str, extra_headers: Sequence[tuple[bytes, bytes]] = ()
) -> None:
    """Relays a websocket to the same path at `target` (a ws:// origin)."""
    try:
        from websockets.asyncio.client import connect  # type: ignore
    except ImportError:
        await websocket.close(code=1011)
        return
    from websockets.exceptions import ConnectionClosed  # type: ignore

    raw_path = (websocket.scope.get("raw_path") or b"").decode("latin-1") or (
        websocket.url.path
    )
    query = websocket.url.query
    url = target.rstrip("/") + raw_path + (f"?{query}" if query else "")
    headers = [
        (k.decode("latin-1"), v.decode("latin-1"))
        for k, v in websocket.headers.raw
        if k.lower() not in GATEWAY_HEADERS
        and k.lower() not in SKIPPED_REQUEST_HEADERS
        and not k.lower().startswith(b"sec-websocket-")
        and k.lower() not in (b"host", b"upgrade")
    ] + [(k.decode("latin-1"), v.decode("latin-1")) for k, v in extra_headers]
    subprotocols = websocket.scope.get("subprotocols") or None
    try:
        upstream = await connect(
            url, additional_headers=headers, subprotocols=subprotocols
        )
    except Exception:
        await websocket.close(code=1011)
        return
    await websocket.accept(subprotocol=upstream.subprotocol)

    async def to_upstream():
        while True:
            message = await websocket.receive()
            if message["type"] == "websocket.disconnect":
                await upstream.close()
                return
            if message.get("text") is not None:
                await upstream.send(message["text"])
            elif message.get("bytes") is not None:
                await upstream.send(message["bytes"])

    async def to_client():
        with contextlib.suppress(ConnectionClosed):
            async for message in upstream:
                if isinstance(message, str):
                    await websocket.send_text(message)
                else:
                    await websocket.send_bytes(message)
        with contextlib.suppress(Exception):
            await websocket.close(code=upstream.close_code or 1000)

    tasks = [asyncio.ensure_future(to_upstream()), asyncio.ensure_future(to_client())]
    try:
        await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    finally:
        for task in tasks:
            task.cancel()
        await upstream.close()


def dependency_checker(app: Any) -> Any:
    """An app that runs only `app`'s own FastAPI dependencies (such as
    `gr.Server(dependencies=...)`) for any request, and answers 204 if they
    pass. The gateway asks it before serving Gradio's routes, which run these
    dependencies when the server runs in the app's process."""
    from fastapi import FastAPI, Response

    checker = FastAPI(
        dependencies=list(app.router.dependencies),
        openapi_url=None,
        docs_url=None,
        redoc_url=None,
    )
    checker.dependency_overrides = app.dependency_overrides

    def passed():
        return Response(status_code=204)

    checker.add_api_route("/{path:path}", passed, methods=METHODS)
    return checker


async def check_dependencies(
    request: Request, target: str, extra_headers: Sequence[tuple[bytes, bytes]]
) -> None:
    """Runs the app's FastAPI dependencies for `request` in the app's process
    (see `dependency_checker`), raising as they did if they refuse it."""
    from fastapi import HTTPException

    url, headers = _upstream(request, target)
    # Without the body, which the dependencies do not read
    headers = [(k, v) for k, v in headers if k.lower() != b"content-length"]
    async with httpx2.AsyncClient(timeout=None) as client:
        response = await client.request(
            request.method,
            url,
            headers=[*headers, *extra_headers, (CHECK_HEADER, b"1")],
        )
    if response.is_success:
        return
    try:
        detail = response.json().get("detail")
    except Exception:
        detail = response.text
    raise HTTPException(
        status_code=response.status_code,
        detail=detail,
        headers={
            k: v
            for k, v in response.headers.items()
            if k.lower() not in ("content-length", "content-type", "connection")
        }
        or None,
    )


class GatewayFront:
    """ASGI middleware for the app in the app's process: requests the gateway
    forwarded (with the token) reach the app's routes, others go to the
    gateway."""

    def __init__(self, app: Any, token: str, worker: Any):
        self.app = app
        self.token = token.encode()
        self.worker = worker

    async def __call__(self, scope, receive, send):
        from urllib.parse import unquote

        from gradio.route_utils import GATEWAY_USER_SCOPE_KEY

        if scope["type"] not in ("http", "websocket"):
            await self.app(scope, receive, send)
            return
        headers = dict(scope["headers"])
        if hmac.compare_digest(headers.get(TOKEN_HEADER, b""), self.token):
            scope.pop(GATEWAY_USER_SCOPE_KEY, None)
            if (user := headers.get(USER_HEADER)) is not None:
                scope[GATEWAY_USER_SCOPE_KEY] = unquote(user.decode("latin-1"))
            if CHECK_HEADER in headers and self.worker.checker is not None:
                await self.worker.checker(scope, receive, send)
                return
            await self.app(scope, receive, send)
            return
        if scope["type"] == "websocket":
            await send({"type": "websocket.close", "code": 1008})
            return
        gateway = self.worker.urls[0]
        if not gateway:
            await self.app(scope, receive, send)
            return
        response = await forward(Request(scope, receive), gateway)
        await response(scope, receive, send)
