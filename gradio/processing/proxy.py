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

from typing import Any

import httpx2
from starlette.requests import Request
from starlette.responses import StreamingResponse

TOKEN_HEADER = b"x-gradio-gateway-token"
# Headers that describe one connection, not the message. Host is kept, so
# that the receiver builds URLs for the address the client used.
SKIPPED_REQUEST_HEADERS = {b"connection", b"keep-alive", b"transfer-encoding"}
SKIPPED_RESPONSE_HEADERS = {b"content-length", b"connection", b"transfer-encoding"}


async def forward(
    request: Request, target: str, extra_headers: list[tuple[bytes, bytes]] = ()
) -> StreamingResponse:
    """Streams `request` to `target` (an origin) and its response back."""
    # A client per request: TestClient may call an app from a new event loop
    # each time, and an AsyncClient belongs to the loop it was made on
    client = httpx2.AsyncClient(timeout=None)
    # The raw path, so that the receiver judges the same path the client sent
    raw_path = request.scope.get("raw_path") or request.url.path.encode()
    if request.url.query:
        raw_path += b"?" + request.url.query.encode()
    url = httpx2.URL(target.rstrip("/")).copy_with(raw_path=raw_path)
    headers = [
        (k, v)
        for k, v in request.headers.raw
        if k.lower() not in SKIPPED_REQUEST_HEADERS and k.lower() != TOKEN_HEADER
    ]
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


class GatewayFront:
    """ASGI middleware for the app in the app's process: requests the gateway
    forwarded (with the token) reach the app's routes, others go to the
    gateway."""

    def __init__(self, app: Any, token: str, worker: Any):
        self.app = app
        self.token = token.encode()
        self.worker = worker

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        if dict(scope["headers"]).get(TOKEN_HEADER) == self.token:
            await self.app(scope, receive, send)
            return
        gateway = self.worker.urls[0]
        if not gateway:
            await self.app(scope, receive, send)
            return
        response = await forward(Request(scope, receive), gateway)
        await response(scope, receive, send)
