"""Helpers for stream functions and handler classes that do not depend on how
the media travels: return values, messages to the page, the running stream's
context and audio conversions.
"""

from __future__ import annotations

import asyncio
import json
import logging
import warnings
from contextvars import ContextVar
from dataclasses import dataclass
from typing import Any, Literal, Protocol, cast

import numpy as np
from numpy.typing import NDArray

logger = logging.getLogger(__name__)


class AdditionalOutputs:
    """
    The values of a stream's outputs besides the media, which
    `gradio.webrtc.transport.transport_event` builds from the function's one
    value per output. Internal: stream functions return one value per output.
    """

    def __init__(self, *args: Any) -> None:
        self.args = args


class CloseStream:
    """
    Return or yield from a stream handler to end the stream. The message is
    shown to the user as a warning.
    """

    def __init__(self, msg: str = "Stream closed") -> None:
        self.msg = msg


class DataChannel(Protocol):
    def send(self, message: str) -> None: ...


def send_to_page(channel: DataChannel | None, message: str) -> None:
    """
    Sends a message to the page over the stream's channel, unless the channel
    is not open: the page may have closed the stream first, which is no error.
    """
    if channel is None:
        return
    try:
        channel.send(message)
    except Exception:
        logger.debug("Could not send %s", message, exc_info=True)


MessageType = Literal["send_input", "end_stream"]


def create_message(type: MessageType, data: list[Any] | str) -> str:
    return json.dumps({"type": type, "data": data})


@dataclass
class Context:
    stream_id: str


class StreamInputs:
    """
    The latest values of the extra inputs of a stream, which all its tracks
    and its handler read. `values` is None until they first arrive.
    """

    def __init__(self) -> None:
        self.values: list[Any] | None = None
        self.arrived = asyncio.Event()

    @property
    def latest(self) -> list[Any]:
        return self.values if self.values is not None else []

    def set(self, values: list[Any]) -> None:
        self.values = list(values)
        self.arrived.set()


current_context: ContextVar[Context | None] = ContextVar(
    "current_context", default=None
)


def get_current_context() -> Context:
    """
    Returns the context of the stream whose handler is currently running,
    which holds the stream's id (`stream_id`).
    """
    if not (ctx := current_context.get()):
        raise RuntimeError("No stream is active in this context.")
    return ctx


_SCALED_INTEGER_TYPES = (np.int32, np.uint16, np.uint8, np.int8)


def _scaled_integer_to_int16(audio: np.ndarray) -> NDArray[np.int16]:
    from gradio.processing_utils import convert_to_16_bit_audio

    with warnings.catch_warnings():
        # Accepted as is in a stream, not worth a warning per chunk
        warnings.simplefilter("ignore")
        return convert_to_16_bit_audio(audio)


def audio_to_float32(
    audio: NDArray[np.integer | np.floating],
) -> NDArray[np.float32]:
    """
    Converts an int16 audio array to float32 in the range [-1.0, 1.0). A float
    array (in [-1.0, 1.0]) is returned as float32. int32, uint16, uint8 and
    int8 arrays are first scaled to int16 as `gr.Audio` does.
    """
    if audio.dtype == np.int16:
        return audio.astype(np.float32) / 32768.0
    if np.issubdtype(audio.dtype, np.floating):
        return audio.astype(np.float32, copy=False)
    if audio.dtype in _SCALED_INTEGER_TYPES:
        return _scaled_integer_to_int16(audio).astype(np.float32) / 32768.0
    raise TypeError(f"Unsupported audio data type: {audio.dtype}")


def audio_to_int16(
    audio: NDArray[np.integer | np.floating],
) -> NDArray[np.int16]:
    """
    Converts a float audio array in the range [-1.0, 1.0] to int16. Unlike
    `gr.Audio`, a float array is not scaled to its own peak, which would give
    every chunk of a stream the same loudness. An int16 array is returned
    unchanged, and int32, uint16, uint8 and int8 arrays are scaled as
    `gr.Audio` does.
    """
    if audio.dtype == np.int16:
        return cast(NDArray[np.int16], audio)
    if np.issubdtype(audio.dtype, np.floating):
        # Values just past full scale would otherwise wrap around to the
        # opposite sign, and NaN has no int16 value
        clipped = np.clip(np.nan_to_num(audio.astype(np.float32)), -1.0, 1.0)
        return (clipped * 32767.0).astype(np.int16)
    if audio.dtype in _SCALED_INTEGER_TYPES:
        return _scaled_integer_to_int16(audio)
    raise TypeError(f"Unsupported audio data type: {audio.dtype}")


async def wait_for_item(queue: asyncio.Queue, timeout: float = 0.1) -> Any:
    """
    Waits for an item from an asyncio.Queue and returns None when the timeout
    is reached, so that `emit()` does not block when nothing is ready.
    """
    try:
        return await asyncio.wait_for(queue.get(), timeout=timeout)
    except TimeoutError:
        return None
