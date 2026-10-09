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


class HandlerFailedError(Exception):
    """A stream handler raised: the user has been told, and the stream ends."""


class StreamNotifier:
    """
    Shows toasts on the page of one stream: the errors of its handler, and
    `gr.Warning` / `gr.Info` / `gr.Success` called from it, which have no queued
    event to go through. Usable from any thread. Messages sent before the data
    channel exists wait for it.
    """

    def __init__(
        self, loop: asyncio.AbstractEventLoop, end_stream: Callable[[], None]
    ) -> None:
        self.loop = loop
        self.end_stream = end_stream
        self.channel: Any = None
        self.pending: list[str] = []
        self.failed = False

    def set_channel(self, channel: Any) -> None:
        """Called on the event loop once the data channel is there."""
        self.channel = channel
        if self._is_open():
            self._flush()
        else:
            channel.on("open", self._flush)

    def _is_open(self) -> bool:
        return getattr(self.channel, "readyState", None) == "open"

    def _flush(self) -> None:
        pending, self.pending = self.pending, []
        for message in pending:
            self._send_now(message)

    def _send_now(self, message: str) -> None:
        if not self._is_open():
            self.pending.append(message)
            return
        try:
            self.channel.send(message)
        except Exception:
            logger.debug("Could not send %s", message, exc_info=True)

    def send(
        self,
        type: Literal["error", "warning", "info", "success"],
        message: str,
        title: str | None = None,
        duration: float | None = 10,
        visible: bool = True,
    ) -> None:
        payload = json.dumps(
            {
                "type": type,
                "message": message,
                "title": title,
                "duration": duration,
                "visible": visible,
            }
        )
        self.loop.call_soon_threadsafe(self._send_now, payload)

    def fail(self, error: BaseException) -> None:
        """
        Reports the handler's error the way a queued event's error is shown
        (the message of a `gr.Error`; others only with `show_error=True`), once,
        and ends the stream.
        """
        if self.failed:
            return
        self.failed = True
        from gradio.context import LocalContext
        from gradio.utils import error_payload

        blocks = LocalContext.blocks.get(None)
        payload = error_payload(error, bool(blocks and blocks.show_error))
        self.send(
            "error",
            cast(str | None, payload["error"]) or "",
            cast(str | None, payload.get("title")) or "Error",
            cast(float | None, payload.get("duration", 10)),
            bool(payload.get("visible", True)),
        )
        # Leaves the message time to go out before the connection closes
        self.loop.call_soon_threadsafe(self.loop.call_later, 0.2, self.end_stream)


def handler_failed(error: BaseException) -> HandlerFailedError:
    """
    Reports an error of the handler of the current stream and returns the
    exception to raise in its place. The errors of a connection's handler end
    its stream, whichever task notices them.
    """
    from gradio.context import LocalContext
    from gradio.exceptions import Error as AppError

    if isinstance(error, HandlerFailedError):
        return error
    if not isinstance(error, AppError) or error.print_exception:
        logger.error(
            "Error in the stream handler",
            exc_info=(type(error), error, error.__traceback__),
        )
    notifier = LocalContext.stream_notifier.get(None)
    if notifier is not None:
        notifier.fail(error)
    return HandlerFailedError(str(error))


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
    """Wraps handler methods so that their errors are reported (see handler_failed)."""

    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except HandlerFailedError:
            raise
        except Exception as e:
            raise handler_failed(e) from e

    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except HandlerFailedError:
            raise
        except Exception as e:
            raise handler_failed(e) from e

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
                raise TypeError(
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
        except HandlerFailedError:
            raise
        except Exception as e:
            # What the handler returned cannot be played
            raise handler_failed(e) from e
