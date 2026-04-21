from __future__ import annotations

import warnings
from functools import wraps
from typing import TYPE_CHECKING, Any, Callable

from typing_extensions import TypedDict

from gradio.context import Context, LocalContext
from gradio.utils import is_zero_gpu_space

try:
    import spaces  # type: ignore
except Exception:
    spaces = None

if TYPE_CHECKING:
    from fastapi import FastAPI


QueueCustomEvent = tuple[str, tuple[Any, ...], dict[str, Any]]
QueueTransport = Callable[[QueueCustomEvent], None]

class ZeroGPUWorkerArg(TypedDict):
    event_id: str | None
    in_event_listener: bool
    progress: Any | None


def maybe_rpc(fn):
    method_name = fn.__name__

    @wraps(fn)
    def wrapper(self, *args, **kwargs):
        transport = LocalContext.queue_transport.get(None)
        if transport is not None:
            transport((method_name, args, kwargs))
            return None
        return fn(self, *args, **kwargs)

    return wrapper
def worker_init(send_event: QueueTransport, worker_arg: ZeroGPUWorkerArg) -> None:
    LocalContext.event_id.set(worker_arg['event_id'])
    LocalContext.in_event_listener.set(worker_arg['in_event_listener'])
    LocalContext.progress.set(worker_arg['progress'])
    LocalContext.queue_transport.set(send_event)


def worker_init_arg() -> ZeroGPUWorkerArg:
    return {
        'event_id': LocalContext.event_id.get(None),
        'in_event_listener': LocalContext.in_event_listener.get(False),
        'progress': LocalContext.progress.get(None),
    }


def get_queue():
    blocks = LocalContext.blocks.get(None)
    if blocks is None:
        blocks = Context.root_block
    if blocks is None:
        return None
    return getattr(blocks, "_queue", None)


def handle_event(event: QueueCustomEvent) -> None:
    method_name, args, kwargs = event
    queue = get_queue()
    if queue is None:
        warnings.warn("ZeroGPU: Cannot get Gradio app Queue instance")
        return
    method = getattr(queue, method_name, None)
    if not callable(method):
        warnings.warn(f"ZeroGPU: Gradio Queue {method_name} is not callable")
        return
    method(*args, **kwargs)


def install_middleware(app: "FastAPI") -> bool:
    if not is_zero_gpu_space() or spaces is None:
        return False
    middleware_cls = getattr(spaces, "ZeroGPUMiddleware", None)
    if middleware_cls is None:
        return False

    from gradio.exceptions import Error
    from gradio.helpers import log_message

    app.add_middleware(
        middleware_cls,
        error_cls=Error,
        logging_handler=log_message,
        worker_init=worker_init,
        worker_init_arg=worker_init_arg,
        handle_event=handle_event,
    )
    return True
