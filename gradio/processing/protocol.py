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
