"""Helpers shared by the WebRTC backend: splitting handler returns, the error
and context plumbing of the tracks, and the audio frame encoder.

This module must import without aiortc or av installed; both are imported
inside the functions that need them.
"""

from __future__ import annotations

import asyncio
import fractions
import functools
import importlib
import inspect
import logging
import threading
from collections.abc import Callable
from contextvars import ContextVar
from dataclasses import dataclass
from typing import Any, cast

import numpy as np
from numpy.typing import NDArray

from gradio.helpers import skip
from gradio.streaming.utils import (
    AdditionalOutputs,
    CloseStream,
    DataChannel,
    audio_to_float32,
)

logger = logging.getLogger(__name__)

AUDIO_PTIME = 0.020
# How long to wait before asking a handler again when it had nothing to send,
# so that an emit() that returns None without awaiting does not spin
EMPTY_EMIT_WAIT = 0.005
SLOW_EMIT_WARNING = 60
GENERATOR_DONE = object()
# A video frame the function left as it was (gr.skip()): the track sends its
# last frame again
SKIPPED_FRAME = object()
# Frames of audio (20 ms each) a receive-mode generator may get ahead of
# playback. Handlers' audio is not bounded: their clear_queue() drops what
# emit() returned so far, and a bound would leave more of it in the handler.
RECEIVE_AUDIO_BUFFER = 50


class _DecoderStoppedError(Exception):
    """The stream stopped while the decoder waited for room in its queue."""


WEBRTC_EXTRA_HINT = (
    'The `aiortc` package is required to stream over WebRTC (transport="webrtc"). '
    'Install it with the `webrtc` extra: pip install "gradio[webrtc]"'
)


def require_webrtc() -> None:
    """Imports the WebRTC connection module, or raises how to install the
    `webrtc` extra (aiortc) it needs, with the original error chained."""
    try:
        importlib.import_module("gradio.webrtc.connection")
    except ImportError as e:
        raise ImportError(WEBRTC_EXTRA_HINT) from e


def has_streams(blocks: Any) -> bool:
    """Whether the app `blocks` serves a WebRTC stream event (a lease). Read
    from the events it serves, so that a Blocks rendered into another app
    (a multipage app's page, gr.TabbedInterface) brings its streams along."""
    return any(fn.lease for fn in blocks.fns.values())


current_channel: ContextVar[DataChannel | None] = ContextVar(
    "current_channel", default=None
)


class HandlerFailedError(Exception):
    """A stream handler raised: the user has been told, and the stream ends."""


class StreamErrors:
    """
    Records the first error of a stream's handler and ends the stream. The
    stream's queue event then fails with it, as an event whose function
    raised, so the page shows it like any event's error. Usable from any
    thread.
    """

    def __init__(
        self,
        loop: asyncio.AbstractEventLoop,
        end_stream: Callable[[], None],
        show_error: bool = False,
    ) -> None:
        self.loop = loop
        self.end_stream = end_stream
        # Taken when the stream starts: the threads that run sync handlers do
        # not have the app in their context
        self.show_error = show_error
        self.failure: dict[str, Any] | None = None
        # fail() can be called from several handler threads at once
        self._lock = threading.Lock()

    def fail(self, error: BaseException) -> None:
        """
        Records the handler's error the way a queued event's error is shown
        (the message of a `gr.Error`; others only with `show_error=True`),
        once, and ends the stream.
        """
        from gradio.utils import error_payload

        payload = error_payload(error, self.show_error)
        with self._lock:
            if self.failure is not None:
                return
            self.failure = payload
        self.loop.call_soon_threadsafe(self.end_stream)


current_errors: ContextVar[StreamErrors | None] = ContextVar(
    "current_errors", default=None
)


@dataclass
class HandlerContext:
    """
    What a stream's handler calls need in their context: the stream's queue
    event and its app, through which `gr.Info` / `gr.Warning` reach the page
    as an event's do, and where the handler's errors go. Captured where the
    stream's tracks are made, and set again where a call runs in a context of
    its own (a worker thread started from elsewhere).
    """

    event_id: str | None
    blocks: Any
    errors: StreamErrors | None

    @classmethod
    def capture(cls) -> HandlerContext:
        from gradio.context import LocalContext

        return cls(
            event_id=LocalContext.event_id.get(None),
            blocks=LocalContext.blocks.get(None),
            errors=current_errors.get(),
        )

    def apply(self) -> None:
        from gradio.context import LocalContext

        LocalContext.event_id.set(self.event_id)
        LocalContext.blocks.set(self.blocks)
        current_errors.set(self.errors)


def handler_failed(error: BaseException) -> HandlerFailedError:
    """
    Reports an error of the handler of the current stream and returns the
    exception to raise in its place. The errors of a connection's handler end
    its stream, whichever task notices them.
    """
    from gradio.exceptions import Error as AppError

    if isinstance(error, HandlerFailedError):
        return error
    if not isinstance(error, AppError) or error.print_exception:
        logger.error(
            "Error in the stream handler",
            exc_info=(type(error), error, error.__traceback__),
        )
    errors = current_errors.get()
    if errors is not None:
        errors.fail(error)
    return HandlerFailedError(str(error))


def check_audio(frame: Any) -> tuple[int, NDArray[np.integer | np.floating]]:
    """
    Checks audio returned by a handler: `(sample_rate, array)` with the array
    in gr.Audio's numpy layout, (samples,) for mono or (samples, 2) for
    stereo, int16, float (e.g. float32, float64) in [-1, 1], or int32, uint16,
    uint8 or int8 as gr.Audio takes them.
    """
    layout_hint = (
        "Audio must be returned as a (sample_rate, numpy array) tuple, with the "
        "array shaped (samples,) for mono or (samples, 2) for stereo, as in "
        "gr.Audio"
    )
    if (
        not isinstance(frame, tuple)
        or len(frame) != 2
        or not isinstance(frame[1], np.ndarray)
    ):
        raise TypeError(f"{layout_hint}.")
    array = frame[1]
    if array.ndim == 2 and array.shape[1] == 1:
        array = array[:, 0]
    if array.ndim not in (1, 2) or (array.ndim == 2 and array.shape[1] != 2):
        raise ValueError(f"{layout_hint}; got an array of shape {array.shape}.")
    return int(frame[0]), array


def split_output(
    data: tuple | Any,
) -> tuple[Any, AdditionalOutputs | CloseStream | None]:
    if isinstance(data, AdditionalOutputs | CloseStream):
        return None, data
    if isinstance(data, tuple):
        # A bare (sample_rate, array) audio frame. A 3-tuple with a layout goes
        # on so that check_audio() rejects it with a clear message
        if 2 <= len(data) <= 3 and isinstance(data[1], np.ndarray):
            return data, None
        # The stream turns a function's values into (media, AdditionalOutputs),
        # so any other tuple is more values than the stream has outputs
        if len(data) != 2 or not isinstance(data[1], AdditionalOutputs | CloseStream):
            raise ValueError(
                f"The stream function returned {len(data)} values where the "
                "stream has one output. Return one value per output."
            )
        return data[0], cast(AdditionalOutputs | CloseStream, data[1])
    return data, None


def _and_call(fn: Any) -> tuple[Any, ...]:
    return (fn, type(fn).__call__) if callable(fn) else (fn,)


def is_skip(value: Any) -> bool:
    """Whether `value` is `gr.skip()`."""
    return isinstance(value, dict) and value == skip()


def is_async(fn: Any) -> bool:
    """Whether `fn` is async, also when it is an object with an async `__call__`."""
    return is_async_generator(fn) or any(
        inspect.iscoroutinefunction(f) for f in _and_call(fn)
    )


def is_async_generator(fn: Any) -> bool:
    """Whether `fn` is an async generator function, or an object whose
    `__call__` is one."""
    return any(inspect.isasyncgenfunction(f) for f in _and_call(fn))


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
    sample_rate: int = 48000,
    frame_size: int = int(48000 * AUDIO_PTIME),
):
    """
    Pulls `(sample_rate, array)` chunks from `next_frame` and puts
    fixed-size `av.AudioFrame`s at `sample_rate` on `queue`, ready to be sent
    over the peer connection. Puts None and returns when `next_frame` gives
    `GENERATOR_DONE`.
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

    # A call that is slow is waited for, not started again: a call in a worker
    # thread cannot be stopped, and a second one would run next to it
    pending: asyncio.Future | None = None
    stopped = asyncio.ensure_future(thread_quit.wait())

    async def put(item: Any) -> None:
        # A bounded queue makes the decoder wait for playback, which a stop
        # must still end
        if not queue.full():
            queue.put_nowait(item)
            return
        putting = asyncio.ensure_future(queue.put(item))
        await asyncio.wait({putting, stopped}, return_when=asyncio.FIRST_COMPLETED)
        if not putting.done():
            putting.cancel()
            raise _DecoderStoppedError

    async def put_resampled(frames):
        nonlocal audio_samples
        for processed_frame in frames:
            processed_frame.pts = audio_samples
            processed_frame.time_base = audio_time_base
            audio_samples += processed_frame.samples
            await put(processed_frame)

    async def end(item: Any) -> None:
        # What the resampler still holds is the end of the audio. The encoder
        # sends whole frames only, so the last one is padded with silence.
        if resampler is not None:
            frames = list(resampler.resample(None))
            if frames and frames[-1].samples < frame_size:
                last = frames[-1].to_ndarray()
                padded = np.zeros((1, frame_size * 2), dtype=last.dtype)
                padded[:, : last.shape[1]] = last
                frames[-1] = av.AudioFrame.from_ndarray(
                    padded, format="s16", layout="stereo"
                )
                frames[-1].sample_rate = sample_rate
            await put_resampled(frames)
        await put(item)

    try:
        while not thread_quit.is_set():
            try:
                if pending is None:
                    pending = asyncio.ensure_future(next_frame())
                await asyncio.wait(
                    {pending, stopped},
                    timeout=SLOW_EMIT_WARNING,
                    return_when=asyncio.FIRST_COMPLETED,
                )
                if not pending.done():
                    if not thread_quit.is_set():
                        logger.warning(
                            "The stream handler has not returned anything for %s "
                            "seconds",
                            SLOW_EMIT_WARNING,
                        )
                    continue
                done, pending = pending, None
                item = done.result()
                if item is GENERATOR_DONE:
                    await end(None)
                    break
                frame, outputs = split_output(item)
                if isinstance(outputs, AdditionalOutputs) and set_additional_outputs:
                    set_additional_outputs(outputs)

                # The handler is not called again after a CloseStream
                if frame is None:
                    if isinstance(outputs, CloseStream):
                        await end(outputs)
                        break
                    await asyncio.sleep(EMPTY_EMIT_WAIT)
                    continue

                in_sample_rate, audio_array = check_audio(frame)
                if audio_array.size == 0:
                    # Nothing to play (e.g. TTS output for an empty sentence)
                    if isinstance(outputs, CloseStream):
                        await end(outputs)
                        break
                    await asyncio.sleep(EMPTY_EMIT_WAIT)
                    continue
                layout = "mono" if audio_array.ndim == 1 else "stereo"
                # Planar float frames take (channels, samples)
                planar = np.ascontiguousarray(
                    audio_to_float32(audio_array).reshape(len(audio_array), -1).T
                )
                in_frame = av.AudioFrame.from_ndarray(
                    planar, format="fltp", layout=layout
                )
                in_frame.sample_rate = in_sample_rate

                # av.AudioResampler takes one input format, so a change of rate
                # or layout gets a new resampler after the old one is flushed
                key = (layout, in_sample_rate)
                if resampler is None or key != resampler_key:
                    if resampler is not None:
                        await put_resampled(resampler.resample(None))
                    resampler = new_resampler()
                    resampler_key = key

                await put_resampled(resampler.resample(in_frame))
                if isinstance(outputs, CloseStream):
                    await end(outputs)
                    break
            except (HandlerFailedError, _DecoderStoppedError):
                raise
            except Exception as e:
                raise handler_failed(e) from e
    except _DecoderStoppedError:
        pass
    finally:
        stopped.cancel()
        if pending is not None:
            pending.cancel()
