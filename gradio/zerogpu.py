from __future__ import annotations

import os
from contextlib import contextmanager
from typing import TYPE_CHECKING

import fastapi

from gradio import utils
from gradio.context import LocalContext, MultiprocessWorkerContextualizer
from gradio.exceptions import Error
from gradio.helpers import log_message
from gradio.route_utils import Request

if TYPE_CHECKING:
    from spaces.zero import ZeroGPUErrorResponse, ZeroGPULog

    from gradio.blocks import Blocks


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
        if (worker := blocks._process_worker) is not None:
            event = worker.running.get(event_id)
            return event is not None and not event.alive
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

    app.add_middleware(ZeroGPUMiddleware)  # ty: ignore[invalid-argument-type]


@contextmanager
def maybe_setup_zerogpu_context(
    blocks: Blocks, request: Request | fastapi.Request | None
):
    if not utils.is_zero_gpu_space():
        yield
        return

    try:
        from spaces.zero import context
    except ImportError:
        yield
        return

    with context.set_context_var(
        context.ZeroGPUContext(
            exception_mapper=exception_mapper,
            log_emitter=log_emitter,
            worker_contextualizer=MultiprocessWorkerContextualizer,
            disconnect_detector=disconnect_detector,
            server_port=_get_server_port(blocks, request),
            headers=dict(request.headers) if request is not None else {},
        )
    ):
        yield


def _get_server_port(blocks: Blocks, req: Request | fastapi.Request | None):
    if (worker := blocks._process_worker) is not None:
        return worker.http_port
    http_request = req.request if isinstance(req, Request) else req
    if http_request is not None and (server := http_request.scope.get("server")):
        return server[1]
    return getattr(blocks, "server_port", None)
