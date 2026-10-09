"""Helpers shared by the gr.WebRTC backend: handler return types, data channel
messages, audio conversions and the audio frame encoder.

This module must import without aiortc or av installed; both are imported
inside the functions that need them.
"""

from __future__ import annotations

import asyncio
import fractions
import functools
import inspect
import json
import logging
import traceback
from collections.abc import Callable
from contextvars import ContextVar
from dataclasses import dataclass
from typing import Any, Literal, Protocol, cast

import numpy as np
from numpy.typing import NDArray

logger = logging.getLogger(__name__)

AUDIO_PTIME = 0.020

WEBRTC_EXTRA_HINT = (
    "The `aiortc` package is required to stream with gr.WebRTC. "
    'Install it with the `webrtc` extra: pip install "gradio[webrtc]"'
)


def require_aiortc() -> None:
    try:
        import aiortc  # noqa: F401
    except ImportError as e:
        raise ImportError(WEBRTC_EXTRA_HINT) from e


class AdditionalOutputs:
    """
    Wraps values that a stream handler wants to send to the extra output
    components listed in `outputs` of `WebRTC.stream()`. Return or yield it
    on its own, or as the second element of a `(media, AdditionalOutputs(...))`
    tuple next to a media frame.
    """

    def __init__(self, *args: Any) -> None:
        self.args = args


class CloseStream:
    """
    Return or yield from a stream handler to end the connection. The message is
    shown to the user as a warning.
    """

    def __init__(self, msg: str = "Stream closed") -> None:
        self.msg = msg


class DataChannel(Protocol):
    def send(self, message: str) -> None: ...


MessageType = Literal[
    "send_input",
    "end_stream",
    "stopword",
    "error",
    "warning",
    "log",
    "update_connection",
]


def create_message(type: MessageType, data: list[Any] | str) -> str:
    return json.dumps({"type": type, "data": data})


@dataclass
class Context:
    webrtc_id: str


current_channel: ContextVar[DataChannel | None] = ContextVar(
    "current_channel", default=None
)
current_context: ContextVar[Context | None] = ContextVar(
    "current_context", default=None
)


def get_current_context() -> Context:
    """
    Returns the context of the connection whose handler is currently running,
    which holds the connection id (`webrtc_id`).
    """
    if not (ctx := current_context.get()):
        raise RuntimeError("No WebRTC connection is active in this context.")
    return ctx


def _send_log(message: str, type: str) -> None:
    async def _send(channel: DataChannel) -> None:
        channel.send(json.dumps({"type": type, "message": message}))

    if channel := current_channel.get():
        try:
            loop = asyncio.get_running_loop()
            asyncio.run_coroutine_threadsafe(_send(channel), loop)
        except RuntimeError:
            asyncio.run(_send(channel))


class WebRTCError(Exception):
    """
    Raise from a stream handler to show an error message in the UI of the user
    whose connection is being handled.
    """

    def __init__(self, message: str) -> None:
        super().__init__(message)
        _send_log(message, "error")


def split_output(
    data: tuple | Any,
) -> tuple[Any, AdditionalOutputs | CloseStream | None]:
    if isinstance(data, AdditionalOutputs | CloseStream):
        return None, data
    if isinstance(data, tuple):
        # A bare (sample_rate, array) or (sample_rate, array, layout) audio frame
        if 2 <= len(data) <= 3 and isinstance(data[1], np.ndarray):
            return data, None
        if len(data) != 2:
            raise ValueError(
                "A handler must return a media frame, or a tuple of a media frame "
                "and an instance of AdditionalOutputs or CloseStream."
            )
        if not isinstance(data[1], AdditionalOutputs | CloseStream):
            raise ValueError(
                "The second element of the returned tuple must be an instance of "
                "AdditionalOutputs or CloseStream."
            )
        return data[0], cast(AdditionalOutputs | CloseStream, data[1])
    return data, None


def audio_to_float32(
    audio: NDArray[np.int16 | np.float32],
) -> NDArray[np.float32]:
    """
    Converts an int16 audio array to float32 in the range [-1.0, 1.0). A float32
    array is returned unchanged.
    """
    if audio.dtype == np.int16:
        return audio.astype(np.float32) / 32768.0
    if audio.dtype == np.float32:
        return cast(NDArray[np.float32], audio)
    raise TypeError(f"Unsupported audio data type: {audio.dtype}")


def audio_to_int16(
    audio: NDArray[np.int16 | np.float32],
) -> NDArray[np.int16]:
    """
    Converts a float32 audio array in the range [-1.0, 1.0] to int16. An int16
    array is returned unchanged.
    """
    if audio.dtype == np.int16:
        return cast(NDArray[np.int16], audio)
    if audio.dtype == np.float32:
        return (audio * 32767.0).astype(np.int16)
    raise TypeError(f"Unsupported audio data type: {audio.dtype}")


async def wait_for_item(queue: asyncio.Queue, timeout: float = 0.1) -> Any:
    """
    Waits for an item from an asyncio.Queue and returns None when the timeout
    is reached, so that `emit()` does not block when nothing is ready.
    """
    try:
        return await asyncio.wait_for(queue.get(), timeout=timeout)
    except (TimeoutError, asyncio.TimeoutError):
        return None


def webrtc_error_handler(func: Callable) -> Callable:
    """Wraps handler methods so that any exception surfaces as a WebRTCError."""

    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            traceback.print_exc()
            if isinstance(e, WebRTCError):
                raise e
            raise WebRTCError(str(e)) from e

    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            traceback.print_exc()
            if isinstance(e, WebRTCError):
                raise e
            raise WebRTCError(str(e)) from e

    return async_wrapper if inspect.iscoroutinefunction(func) else sync_wrapper


async def player_worker_decode(
    next_frame: Callable,
    queue: asyncio.Queue,
    thread_quit: asyncio.Event,
    set_additional_outputs: Callable | None,
    quit_on_none: bool = False,
    sample_rate: int = 48000,
    frame_size: int = int(48000 * AUDIO_PTIME),
):
    """
    Pulls `(sample_rate, array[, layout])` chunks from `next_frame` and puts
    fixed-size `av.AudioFrame`s at `sample_rate` on `queue`, ready to be sent
    over the peer connection.
    """
    import av

    audio_samples = 0
    audio_time_base = fractions.Fraction(1, sample_rate)
    resampler = None
    resampler_key: tuple[str, int] | None = None

    def new_resampler():
        return av.AudioResampler(
            format="s16",
            layout="stereo",
            rate=sample_rate,
            frame_size=frame_size,
        )

    async def put_resampled(frames):
        nonlocal audio_samples
        for processed_frame in frames:
            processed_frame.pts = audio_samples
            processed_frame.time_base = audio_time_base
            audio_samples += processed_frame.samples
            await queue.put(processed_frame)

    while not thread_quit.is_set():
        try:
            frame, outputs = split_output(
                await asyncio.wait_for(next_frame(), timeout=60)
            )
            if isinstance(outputs, AdditionalOutputs) and set_additional_outputs:
                set_additional_outputs(outputs)

            if frame is None:
                if isinstance(outputs, CloseStream):
                    await queue.put(outputs)
                if quit_on_none:
                    await queue.put(None)
                    break
                continue

            if (
                not isinstance(frame, tuple)
                or len(frame) not in (2, 3)
                or not isinstance(frame[1], np.ndarray)
            ):
                raise WebRTCError(
                    "Audio must be returned as a (sample_rate, numpy array) tuple, "
                    "optionally with 'mono' or 'stereo' as a third element."
                )

            if len(frame) == 2:
                in_sample_rate, audio_array = frame
                layout = "mono"
            else:
                in_sample_rate, audio_array, layout = frame

            audio_array = audio_to_float32(audio_array)
            if audio_array.ndim == 1:
                audio_array = audio_array.reshape(1, -1)

            in_frame = av.AudioFrame.from_ndarray(
                audio_array, format="fltp", layout=layout
            )
            in_frame.sample_rate = in_sample_rate

            # av.AudioResampler requires every input frame to share one format,
            # so a handler that changes sample rate or layout mid-stream gets a
            # fresh resampler, after the old one is flushed.
            key = (layout, in_sample_rate)
            if resampler is None or key != resampler_key:
                if resampler is not None:
                    await put_resampled(resampler.resample(None))
                resampler = new_resampler()
                resampler_key = key

            await put_resampled(resampler.resample(in_frame))
            if isinstance(outputs, CloseStream):
                await queue.put(outputs)
        except (TimeoutError, asyncio.TimeoutError):
            logger.warning(
                "Timeout in frame processing cycle after %s seconds - resetting", 60
            )
            continue
        except Exception as e:
            logger.error("Error processing frame: %s\n%s", e, traceback.format_exc())
            if isinstance(e, WebRTCError):
                raise e
            continue
