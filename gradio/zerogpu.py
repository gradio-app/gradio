from __future__ import annotations

from typing import TYPE_CHECKING

import fastapi

from gradio import utils
from gradio.context import LocalContext, MultiprocessWorkerContextualizer
from gradio.exceptions import Error
from gradio.helpers import log_message

if TYPE_CHECKING:
    from spaces.zero import ZeroGPUErrorResponse, ZeroGPULog


def exception_mapper(err: ZeroGPUErrorResponse, exc: Exception | None):
    if isinstance(exc, Error):
        exc.print_exception = False
        return exc
    detail = err["detail"]
    return Error(
        title=detail["title"],
        message=detail["message"],
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
    if not utils.is_zero_gpu_space():
        return

    try:
        from spaces.zero import ZeroGPUMiddleware
    except ImportError:
        return

    app.add_middleware(
        ZeroGPUMiddleware,  # ty: ignore[invalid-argument-type]
        exception_mapper=exception_mapper,
        log_emitter=log_emitter,
        worker_contextualizer=MultiprocessWorkerContextualizer,
        disconnect_detector=disconnect_detector,
    )
