from __future__ import annotations

import os
from collections.abc import Awaitable, Callable
from typing import TYPE_CHECKING, TypeVar, cast

import fastapi

from gradio import utils
from gradio.context import LocalContext, MultiprocessWorkerContextualizer
from gradio.exceptions import Error
from gradio.helpers import log_message

if TYPE_CHECKING:
    from spaces.zero import ZeroGPUErrorResponse, ZeroGPULog

    from gradio.route_utils import Request

T = TypeVar("T")


def exception_mapper(err: ZeroGPUErrorResponse, exc: Exception | None):
    if isinstance(exc, Error):
        exc.print_exception = False
        return exc
    detail = err["detail"]
    return Error(
        title=detail["title"],
        message=detail["message"],
        print_exception=False,
    )


def log_emitter(log: ZeroGPULog):
    log_message(
        title=log["title"],
        message=log["message"],
        level=log["level"],
    )


def disconnect_detector():
    blocks = LocalContext.blocks.get(None)
    event_id = LocalContext.event_id.get(None)
    if blocks is not None and event_id is not None:
        jobs = blocks._queue.active_jobs
        for event in [evt for job in jobs if job is not None for evt in job]:
            if event._id == event_id:
                return not event.alive
    return False


def maybe_setup_zerogpu_middleware(app: fastapi.FastAPI):
    if not utils.is_zero_gpu_space() or os.environ.get("GRADIO_PROCESS_GATEWAY"):
        return

    try:
        from spaces.zero import ZeroGPUMiddleware
    except ImportError:
        return

    if any(m.cls is ZeroGPUMiddleware for m in app.user_middleware):
        return

    app.add_middleware(
        ZeroGPUMiddleware,  # ty: ignore[invalid-argument-type]
        exception_mapper=exception_mapper,
        log_emitter=log_emitter,
        worker_contextualizer=MultiprocessWorkerContextualizer,
        disconnect_detector=disconnect_detector,
    )


async def run_with_zerogpu_middleware(
    func: Callable[[], Awaitable[T]],
    request: Request | list[Request] | None,
    server_port: int | None,
) -> T:
    """Restore middleware context for an event received over the process executor's IPC."""
    if not utils.is_zero_gpu_space():
        return await func()
    try:
        from spaces.zero import ZeroGPUMiddleware
    except ImportError:
        return await func()

    result: T | None = None

    async def app(_scope, _receive, send):
        nonlocal result
        result = await func()
        await send({"type": "http.response.start", "status": 204, "headers": []})
        await send({"type": "http.response.body", "body": b""})

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(_message):
        pass

    if isinstance(request, list):
        request = request[0] if request else None
    scope = dict(request.request.scope) if request and request.request else {}
    scope.update(type="http", server=("127.0.0.1", server_port))
    middleware = ZeroGPUMiddleware(
        app,
        exception_mapper=exception_mapper,
        log_emitter=log_emitter,
        worker_contextualizer=MultiprocessWorkerContextualizer,
        disconnect_detector=disconnect_detector,
    )
    await middleware(scope, receive, send)
    return cast(T, result)
