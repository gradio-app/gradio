import json
from typing import Any, Callable, Dict

import fsspec.asyn
from websockets.legacy.protocol import WebSocketCommonProtocol

API_URL = "{}/api/predict/"
WS_URL = "{}/queue/join"


class TooManyRequestsError(Exception):
    """Raised when the API returns a 429 status code."""

    pass


class QueueError(Exception):
    """Raised when the queue is full or there is an issue adding a job to the queue."""

    pass


async def get_pred_from_ws(
    websocket: WebSocketCommonProtocol, data: str, hash_data: str
) -> Dict[str, Any]:
    completed = False
    resp = {}
    while not completed:
        msg = await websocket.recv()
        resp = json.loads(msg)
        if resp["msg"] == "queue_full":
            raise QueueError("Queue is full! Please try again.")
        if resp["msg"] == "send_hash":
            await websocket.send(hash_data)
        elif resp["msg"] == "send_data":
            await websocket.send(data)
        completed = resp["msg"] == "process_completed"
    return resp["output"]


def synchronize_async(func: Callable, *args, **kwargs) -> Any:
    """
    Runs async functions in sync scopes.

    Can be used in any scope. See run_coro_in_background for more details.

    Example:
        if inspect.iscoroutinefunction(block_fn.fn):
            predictions = utils.synchronize_async(block_fn.fn, *processed_input)

    Args:
        func:
        *args:
        **kwargs:
    """
    return fsspec.asyn.sync(fsspec.asyn.get_loop(), func, *args, **kwargs)
