"""aiortc media tracks that connect one gr.WebRTC connection to its handler.

Incoming tracks are wrapped so that every frame reaches the handler, and the
same objects act as outgoing tracks that the peer connection pulls frames from.
"""

from __future__ import annotations

import asyncio
import fractions
import functools
import inspect
import logging
import math
import threading
import time
import weakref
from collections.abc import Callable, Generator, Iterator
from typing import Any, Literal, cast

import anyio
import numpy as np
import numpy.typing as npt
from aiortc import AudioStreamTrack, MediaStreamTrack, VideoStreamTrack
from aiortc.contrib.media import AudioFrame, VideoFrame
from aiortc.mediastreams import VIDEO_CLOCK_RATE, VIDEO_TIME_BASE, MediaStreamError

from gradio import processing_utils
from gradio.context import LocalContext
from gradio.webrtc.handlers import (
    AsyncAudioVideoStreamHandler,
    AsyncHandler,
    AsyncVideoStreamHandler,
    AudioEmitType,
    StreamHandlerBase,
    StreamHandlerImpl,
    VideoEventHandler,
    VideoStreamHandler,
    VideoTrackHandler,
)
from gradio.webrtc.utils import (
    EMPTY_EMIT_WAIT,
    GENERATOR_DONE,
    RECEIVE_AUDIO_BUFFER,
    AdditionalOutputs,
    CloseStream,
    Context,
    DataChannel,
    HandlerFailedError,
    create_message,
    current_channel,
    current_context,
    handler_failed,
    player_worker_decode,
    send_to_page,
    split_output,
)

logger = logging.getLogger(__name__)

# Put on a track's queue when it stops, so that a recv() waiting on the queue
# ends instead of waiting forever
_STOPPED = object()


def rgb_frame(array: Any) -> VideoFrame:
    """A video frame from an RGB array of any dtype, scaled to uint8 as gr.Image does."""
    return VideoFrame.from_ndarray(
        processing_utils._convert(array, np.uint8, force_copy=False), format="rgb24"
    )


def _spawn(coroutine: Any) -> asyncio.Task:
    """Starts a background task of a track, whose errors are logged when it ends."""
    task = asyncio.create_task(coroutine)
    task.add_done_callback(_log_task_error)
    return task


def _log_task_error(task: asyncio.Task) -> None:
    # A handler's errors were reported where they happened (handler_failed)
    if task.cancelled():
        return
    error = task.exception()
    if error is not None and not isinstance(
        error, HandlerFailedError | MediaStreamError
    ):
        logger.error("Error in a stream task", exc_info=error)


_thread_limiters: weakref.WeakKeyDictionary[
    asyncio.AbstractEventLoop, anyio.CapacityLimiter
] = weakref.WeakKeyDictionary()


async def run_in_thread(fn: Callable, *args: Any) -> Any:
    """
    Runs a sync handler call in a worker thread, in the caller's context (the
    visitor's request, the stream's notifier). Its threads are counted apart
    from the default limiter, whose `max_threads` tokens Gradio's sync event
    listeners share, so that busy streams do not hold those up.
    """
    loop = asyncio.get_running_loop()
    limiter = _thread_limiters.get(loop)
    if limiter is None:
        limiter = _thread_limiters[loop] = anyio.CapacityLimiter(math.inf)
    return await anyio.to_thread.run_sync(fn, *args, limiter=limiter)


async def wait_unless_stopped(event: asyncio.Event, stopped: asyncio.Event) -> None:
    """
    Waits for `event`. Raises MediaStreamError, which ends a track, once
    `stopped` is set, for example when a stream ends before its data channel
    opened.
    """
    if not event.is_set() and not stopped.is_set():
        waits = [asyncio.ensure_future(e.wait()) for e in (event, stopped)]
        try:
            await asyncio.wait(waits, return_when=asyncio.FIRST_COMPLETED)
        finally:
            for wait in waits:
                wait.cancel()
    if stopped.is_set():
        raise MediaStreamError


def audio_frame_to_array(frame: AudioFrame) -> npt.NDArray[np.int16]:
    """
    The samples of a packed s16 frame in gr.Audio's numpy layout: (samples,)
    for mono, (samples, channels) otherwise.
    """
    channels = len(frame.layout.channels)
    # Packed frames hold the channels interleaved in one row
    array = cast(npt.NDArray[np.int16], frame.to_ndarray()).reshape(-1, channels)
    return array[:, 0] if channels == 1 else array


class VideoCallback(VideoStreamTrack):
    """
    Video track for the "send" and "send-receive" modes: feeds each frame from
    the client to the handler and, in "send-receive", returns what the handler
    produced as the outgoing frame.
    """

    kind = "video"

    def __init__(
        self,
        track: MediaStreamTrack,
        event_handler: VideoEventHandler,
        context: Context,
        channel: DataChannel | None = None,
        set_additional_outputs: Callable | None = None,
        mode: Literal["send-receive", "send"] = "send-receive",
        fps: int = 30,
        skip_frames: bool = True,
        mirror: bool = False,
    ) -> None:
        super().__init__()
        self.track = track
        self.mirror = mirror
        self.event_handler = event_handler
        self.latest_args: list[Any] | None = None
        self.channel = channel
        self.set_additional_outputs = set_additional_outputs
        self.thread_quit = asyncio.Event()
        self.mode = mode
        self.channel_set = asyncio.Event()
        self.has_started = False
        self.fps = fps
        self.frame_ptime = 1.0 / fps
        self.skip_frames = skip_frames
        self.frame_queue: asyncio.Queue[Any] = asyncio.Queue()
        self.context = context
        self._clock_start: float | None = None
        self._clock_timestamp: int | None = None
        self._next_slot = 0.0

    def _newest(self, frame: Any) -> Any:
        """With skip_frames, the newest frame that has arrived instead of `frame`."""
        if self.skip_frames:
            while not self.frame_queue.empty():
                frame = self.frame_queue.get_nowait()
        return frame

    def set_channel(self, channel: DataChannel):
        self.channel = channel
        current_channel.set(channel)
        current_context.set(self.context)
        self.channel_set.set()

    def set_args(self, args: list[Any]):
        self.latest_args = list(args)

    # Frames are RGB arrays, like the numpy values of gr.Image and gr.Video
    def array_to_frame(self, array: Any) -> VideoFrame:
        return rgb_frame(array)

    def frame_to_array(self, frame: VideoFrame) -> npt.NDArray[np.uint8]:
        array = cast(npt.NDArray[np.uint8], frame.to_ndarray(format="rgb24"))
        if self.mirror:
            # What the mirrored preview showed, as in gr.Image captures;
            # contiguous so that handlers can draw on it in place
            array = np.ascontiguousarray(array[:, ::-1])
        return array

    async def process_frames(self):
        while not self.thread_quit.is_set():
            try:
                await self.recv()
            except TimeoutError:
                continue
            except MediaStreamError:
                return
            except HandlerFailedError:
                self.stop()
                return

    async def start(self):
        """Runs the handler on every frame in mode="send", where nothing pulls the frames."""
        await self.process_frames()

    def stop(self):
        super().stop()
        logger.debug("video callback stop")
        self.thread_quit.set()
        self.frame_queue.put_nowait(_STOPPED)

    async def wait_for_channel(self):
        current_context.set(self.context)
        await wait_unless_stopped(self.channel_set, self.thread_quit)
        if current_channel.get() != self.channel:
            current_channel.set(self.channel)

    async def accept_input(self):
        self.has_started = True
        while not self.thread_quit.is_set():
            try:
                frame = cast(VideoFrame, await self.track.recv())
                if self.thread_quit.is_set():
                    # Whatever is queued now ends with the stop marker
                    return
                if self.skip_frames:
                    # Only the newest frame would be used; a busy handler must
                    # not keep every older one in memory meanwhile
                    while not self.frame_queue.empty():
                        self.frame_queue.get_nowait()
                self.frame_queue.put_nowait(frame)
            except MediaStreamError:
                self.stop()
                return

    def accept_input_in_background(self):
        if not self.has_started:
            self.accept_input_task = _spawn(self.accept_input())

    async def recv(self):
        self.accept_input_in_background()
        try:
            frame = self._newest(await self.frame_queue.get())
            # The handler runs on at most `fps` frames a second
            wait = self._next_slot - time.monotonic()
            if frame is not _STOPPED and wait > 0:
                await asyncio.sleep(wait)
                frame = self._newest(frame)
            if frame is _STOPPED:
                raise MediaStreamError
            self._next_slot = max(time.monotonic(), self._next_slot) + self.frame_ptime
            await self.wait_for_channel()
            frame_array = self.frame_to_array(frame)
            if self.latest_args is None:
                # The values of the extra inputs have not arrived yet.
                if not self.mirror:
                    return frame
                unprocessed = self.array_to_frame(frame_array)
                unprocessed.pts = frame.pts
                unprocessed.time_base = frame.time_base
                return unprocessed

            # Run the handler in a worker thread: it is usually a model call,
            # and on the event loop it would stall every other connection and
            # the app's HTTP routes for as long as it runs.
            array, outputs = split_output(
                await run_in_thread(self.event_handler, frame_array, *self.latest_args)
            )
            if isinstance(outputs, CloseStream):
                send_to_page(self.channel, create_message("end_stream", outputs.msg))
                self.stop()
                raise MediaStreamError
            if isinstance(outputs, AdditionalOutputs) and self.set_additional_outputs:
                self.set_additional_outputs(outputs)
            if array is None and self.mode == "send":
                return
            if array is None:
                # Only AdditionalOutputs (or nothing): the frame goes back as it
                # came in, as before the extra inputs arrive
                array = frame_array

            new_frame = self.array_to_frame(array)
            if frame:
                new_frame.pts = frame.pts
                new_frame.time_base = frame.time_base
            else:
                pts, time_base = await self.next_timestamp()
                new_frame.pts = pts
                new_frame.time_base = time_base
            return new_frame
        except (HandlerFailedError, MediaStreamError):
            # MediaStreamError is how a track tells aiortc that it has ended
            raise
        except Exception as e:
            # e.g. what the handler returned is not a video frame
            raise handler_failed(e) from e

    async def next_timestamp(self) -> tuple[int, fractions.Fraction]:
        if self.readyState != "live":
            raise MediaStreamError

        if self._clock_start is None or self._clock_timestamp is None:
            self._clock_start = time.time()
            self._clock_timestamp = 0
        else:
            self._clock_timestamp += int(self.frame_ptime * VIDEO_CLOCK_RATE)
            wait = (
                self._clock_start
                + (self._clock_timestamp / VIDEO_CLOCK_RATE)
                - time.time()
            )
            if wait > 0:
                await asyncio.sleep(wait)
        return self._clock_timestamp, VIDEO_TIME_BASE


class HandlerVideoTrack(VideoCallback):
    """
    Video track of a handler class: of an audio-video connection, or of a
    video-only one with a `VideoStreamHandler`. Incoming frames go to the
    handler's `video_receive()`; outgoing frames come from `video_emit()`.
    """

    @property
    def handler(self) -> VideoTrackHandler:
        return cast(VideoTrackHandler, self.event_handler)

    def set_channel(self, channel: DataChannel):
        super().set_channel(channel)
        # Without an audio track, nothing else gives the handler its channel
        self.handler.set_channel(channel)

    def set_args(self, args: list[Any]):
        super().set_args(args)
        self.handler.set_args(args)

    async def process_frames(self):
        # Frames that arrive while video_receive() runs wait in frame_queue,
        # and only the newest of them is passed on, as with skip_frames
        self.accept_input_task = _spawn(self.accept_input())
        while not self.thread_quit.is_set():
            try:
                # Also sets the context that get_current_context() reads
                await self.wait_for_channel()
                frame = self._newest(await self.frame_queue.get())
                if frame is _STOPPED:
                    raise MediaStreamError
                frame_array = self.frame_to_array(frame)
                handler = self.handler
                if isinstance(
                    handler, AsyncAudioVideoStreamHandler | AsyncVideoStreamHandler
                ):
                    await handler.video_receive(frame_array)
                else:
                    await run_in_thread(handler.video_receive, frame_array)
            except (MediaStreamError, HandlerFailedError):
                self.stop()

    async def start_up(self):
        """Runs `start_up()` of a video-only handler; for audio-video, the audio track does."""
        handler = self.handler
        try:
            await self.wait_for_channel()
            if isinstance(handler, AsyncVideoStreamHandler):
                # Checked before the call: a plain def would run on the loop
                if not inspect.iscoroutinefunction(handler.start_up):
                    raise handler_failed(
                        TypeError(
                            "In AsyncVideoStreamHandler, start_up must be a "
                            "coroutine (async def)"
                        )
                    )
                await handler.start_up()
            elif isinstance(handler, VideoStreamHandler):
                await run_in_thread(handler.start_up)
        except (HandlerFailedError, MediaStreamError):
            self.stop()

    async def start(self):
        if not self.has_started:
            self.has_started = True
            self.process_task = _spawn(self.process_frames())
            self.start_up_task = _spawn(self.start_up())

    async def recv(self):
        await self.start()
        try:
            await self.wait_for_channel()
            handler = self.handler
            while True:
                if isinstance(
                    handler, AsyncAudioVideoStreamHandler | AsyncVideoStreamHandler
                ):
                    outputs = await handler.video_emit()
                else:
                    outputs = await run_in_thread(handler.video_emit)

                array, outputs = split_output(outputs)
                if (
                    isinstance(outputs, AdditionalOutputs)
                    and self.set_additional_outputs
                ):
                    self.set_additional_outputs(outputs)
                if isinstance(outputs, CloseStream):
                    send_to_page(
                        self.channel, create_message("end_stream", outputs.msg)
                    )
                    self.stop()
                    raise MediaStreamError
                if array is not None:
                    break
                # No frame yet (e.g. the model is still starting up): ask again
                # a frame later, while the page keeps showing the last one
                await asyncio.sleep(self.frame_ptime)
                if self.thread_quit.is_set():
                    raise MediaStreamError

            new_frame = self.array_to_frame(array)
            pts, time_base = await self.next_timestamp()
            new_frame.pts = pts
            new_frame.time_base = time_base
            return new_frame
        except (HandlerFailedError, MediaStreamError):
            # MediaStreamError is how a track tells aiortc that it has ended
            raise
        except Exception as e:
            raise handler_failed(e) from e


class AudioCallback(AudioStreamTrack):
    """
    Audio track for the "send" and "send-receive" modes: resamples incoming
    frames for the handler's `receive()` and streams what `emit()` produces
    back to the client.
    """

    kind = "audio"

    def __init__(
        self,
        track: MediaStreamTrack,
        event_handler: StreamHandlerBase,
        context: Context,
        channel: DataChannel | None = None,
        set_additional_outputs: Callable | None = None,
    ) -> None:
        super().__init__()
        self.track = track
        self.event_handler = cast(StreamHandlerImpl, event_handler)
        self.event_handler._clear_queue = self.clear_queue
        self.current_timestamp = 0
        self.queue: asyncio.Queue = asyncio.Queue()
        self.thread_quit = asyncio.Event()
        self._clock_start: float | None = None
        self.has_started = False
        self.last_timestamp = 0.0
        self.channel = channel
        self.set_additional_outputs = set_additional_outputs
        self.context = context
        # Set again in each sync emit(), on the worker thread that runs it
        self.notifier = LocalContext.stream_notifier.get(None)

    def clear_queue(self):
        while not self.queue.empty():
            self.queue.get_nowait()
        self._clock_start = None

    async def wait_for_channel(self):
        current_context.set(self.context)
        await wait_unless_stopped(self.event_handler.channel_set, self.thread_quit)
        if current_channel.get() != self.event_handler.channel:
            current_channel.set(self.event_handler.channel)

    def set_channel(self, channel: DataChannel):
        self.channel = channel
        self.event_handler.set_channel(channel)

    def set_args(self, args: list[Any]):
        self.event_handler.set_args(list(args))

    def event_handler_receive(self, frame: tuple[int, np.ndarray]) -> None:
        current_channel.set(self.event_handler.channel)
        return cast(Callable, self.event_handler.receive)(frame)

    def event_handler_emit(self) -> AudioEmitType:
        current_channel.set(self.event_handler.channel)
        current_context.set(self.context)
        LocalContext.stream_notifier.set(self.notifier)
        return cast(Callable, self.event_handler.emit)()

    async def process_input_frames(self) -> None:
        while not self.thread_quit.is_set():
            try:
                frame = cast(AudioFrame, await self.track.recv())
                for resampled in self.event_handler.resample(frame):
                    numpy_array = audio_frame_to_array(resampled)
                    if isinstance(self.event_handler, AsyncHandler):
                        await self.event_handler.receive(
                            (resampled.sample_rate, numpy_array)
                        )
                    else:
                        await run_in_thread(
                            self.event_handler_receive,
                            (resampled.sample_rate, numpy_array),
                        )
            except MediaStreamError:
                logger.debug("MediaStreamError in process_input_frames")
                break
            except HandlerFailedError:
                self.stop()
                break

    async def start(self):
        if not self.has_started:
            await self.wait_for_channel()
            if isinstance(self.event_handler, AsyncHandler):
                callable = self.event_handler.emit
                # Checked before the call: a plain def would run on the loop
                if not inspect.iscoroutinefunction(self.event_handler.start_up):
                    raise handler_failed(
                        TypeError(
                            "In AsyncStreamHandler, start_up must be a coroutine "
                            "(async def)"
                        )
                    )
                start_up = self.event_handler.start_up()
            else:
                callable = functools.partial(run_in_thread, self.event_handler_emit)
                start_up = run_in_thread(self.event_handler.start_up)
            self.process_input_task = _spawn(self.process_input_frames())
            self.start_up_task = _spawn(start_up)
            self.decode_task = _spawn(
                player_worker_decode(
                    callable,
                    self.queue,
                    self.thread_quit,
                    self.set_additional_outputs,
                    self.event_handler.output_sample_rate,
                    self.event_handler.output_frame_size,
                )
            )
            self.has_started = True

    async def recv(self):
        try:
            if self.readyState != "live":
                raise MediaStreamError

            await self.wait_for_channel()
            await self.start()

            frame = await self.queue.get()
            if frame is _STOPPED:
                raise MediaStreamError
            if isinstance(frame, CloseStream):
                send_to_page(self.channel, create_message("end_stream", frame.msg))
                self.stop()
                raise MediaStreamError

            data_time = frame.time

            if time.time() - self.last_timestamp > 10 * (
                self.event_handler.output_frame_size
                / self.event_handler.output_sample_rate
            ):
                self._clock_start = None

            # control playback rate
            if self._clock_start is None:
                self._clock_start = time.time() - data_time
            else:
                wait = self._clock_start + data_time - time.time()
                await asyncio.sleep(wait)
            self.last_timestamp = time.time()
            return frame
        except (HandlerFailedError, MediaStreamError):
            # MediaStreamError is how a track tells its reader (aiortc, or
            # _drain) that it has ended
            raise
        except Exception as e:
            raise handler_failed(e) from e

    def stop(self):
        logger.debug("audio callback stop")
        self.thread_quit.set()
        self.queue.put_nowait(_STOPPED)
        super().stop()


class HandlerGenerator:
    """
    The generator of a receive-mode handler, which its track advances in
    worker threads. Closing it when the stream ends runs its own clean-up (a
    finally block, a with statement) then, rather than whenever it is
    collected.
    """

    def __init__(self) -> None:
        self.generator: Generator[Any, None, Any] | None = None
        self.closed = False
        # Held while the generator runs, which closing it has to wait for
        self.lock = threading.Lock()

    def next(self, start: Callable[[], Any]) -> Any:
        # StopIteration cannot cross into the awaiting task, so the end of the
        # generator is reported with a sentinel instead
        with self.lock:
            if self.closed:
                return GENERATOR_DONE
            if self.generator is None:
                self.generator = start()
            if self.generator is None:
                return GENERATOR_DONE
            if not isinstance(self.generator, Iterator):
                raise TypeError(
                    'In mode="receive", `fn` must be a generator that yields '
                    "the frames to send, but it returned a "
                    f"{type(self.generator).__name__}."
                )
            try:
                return next(self.generator)
            except StopIteration:
                return GENERATOR_DONE

    def close(self) -> None:
        self.closed = True
        with self.lock:
            if self.generator is None:
                return
            try:
                self.generator.close()
            except Exception:
                logger.exception("Stream handler clean-up failed")


class ServerToClientVideo(VideoStreamTrack):
    """Video track for the "receive" mode: frames come from a generator handler."""

    kind = "video"

    def __init__(
        self,
        event_handler: Callable,
        context: Context,
        channel: DataChannel | None = None,
        set_additional_outputs: Callable | None = None,
        fps: int = 30,
    ) -> None:
        super().__init__()
        self.event_handler = event_handler
        self.args_set = asyncio.Event()
        self.latest_args: list[Any] = []
        self.generator = HandlerGenerator()
        self.channel = channel
        self.set_additional_outputs = set_additional_outputs
        self.fps = fps
        self.frame_ptime = 1.0 / fps
        self.context = context
        self._clock_start: float | None = None
        self._clock_timestamp: int | None = None

    def array_to_frame(self, array: Any) -> VideoFrame:
        return rgb_frame(array)

    def set_channel(self, channel: DataChannel):
        self.channel = channel

    def set_args(self, args: list[Any]):
        self.latest_args = list(args)
        self.args_set.set()

    async def next_timestamp(self) -> tuple[int, fractions.Fraction]:
        if self.readyState != "live":
            raise MediaStreamError

        if self._clock_start is None or self._clock_timestamp is None:
            self._clock_start = time.time()
            self._clock_timestamp = 0
        else:
            self._clock_timestamp += int(self.frame_ptime * VIDEO_CLOCK_RATE)
            wait = (
                self._clock_start
                + (self._clock_timestamp / VIDEO_CLOCK_RATE)
                - time.time()
            )
            if wait > 0:
                await asyncio.sleep(wait)
        return self._clock_timestamp, VIDEO_TIME_BASE

    def _next_item(self) -> Any:
        return self.generator.next(lambda: self.event_handler(*self.latest_args))

    async def close_generator(self) -> None:
        """Closes the handler's generator, once the track has stopped."""
        current_channel.set(self.channel)
        current_context.set(self.context)
        await run_in_thread(self.generator.close)

    async def recv(self):
        try:
            pts, time_base = await self.next_timestamp()
            await self.args_set.wait()
            current_channel.set(self.channel)
            current_context.set(self.context)
            while True:
                # The generator does the handler's work, so advance it in a
                # worker thread to keep the event loop free.
                item = await run_in_thread(self._next_item)
                if item is GENERATOR_DONE:
                    self.stop()
                    raise MediaStreamError
                next_array, outputs = split_output(item)
                if isinstance(outputs, CloseStream):
                    send_to_page(
                        self.channel, create_message("end_stream", outputs.msg)
                    )
                    self.stop()
                    raise MediaStreamError
                if (
                    isinstance(outputs, AdditionalOutputs)
                    and self.set_additional_outputs
                ):
                    self.set_additional_outputs(outputs)
                # A yield without a frame (None, or AdditionalOutputs alone)
                # leaves this frame to the next one
                if next_array is not None:
                    break
                await asyncio.sleep(EMPTY_EMIT_WAIT)

            next_frame = self.array_to_frame(next_array)
            next_frame.pts = pts
            next_frame.time_base = time_base
            return next_frame
        except (HandlerFailedError, MediaStreamError):
            # MediaStreamError is how a track tells aiortc that it has ended
            raise
        except Exception as e:
            raise handler_failed(e) from e


class ServerToClientAudio(AudioStreamTrack):
    """Audio track for the "receive" mode: frames come from a generator handler."""

    kind = "audio"

    def __init__(
        self,
        event_handler: Callable,
        context: Context,
        channel: DataChannel | None = None,
        set_additional_outputs: Callable | None = None,
    ) -> None:
        self.generator = HandlerGenerator()
        self.event_handler = event_handler
        self.current_timestamp = 0
        self.latest_args: list[Any] = []
        self.args_set = asyncio.Event()
        # The generator waits for playback instead of running far ahead of it
        self.queue: asyncio.Queue = asyncio.Queue(maxsize=RECEIVE_AUDIO_BUFFER)
        self.thread_quit = asyncio.Event()
        self.channel = channel
        self.set_additional_outputs = set_additional_outputs
        self.has_started = False
        self._clock_start: float | None = None
        self.context = context
        # Set again in each next(), on the worker thread that runs it
        self.notifier = LocalContext.stream_notifier.get(None)
        super().__init__()

    def clear_queue(self):
        while not self.queue.empty():
            self.queue.get_nowait()
        self._clock_start = None

    def set_channel(self, channel: DataChannel):
        self.channel = channel

    def set_args(self, args: list[Any]):
        self.latest_args = list(args)
        self.args_set.set()

    async def next_in_thread(self) -> Any:
        # The inputs are awaited here rather than in the thread: a wait that
        # never ends (the client left before sending them) then holds no
        # thread, and the decoder cancels it when the stream stops
        await self.args_set.wait()
        return await run_in_thread(self.next)

    def next(self) -> Any:
        current_context.set(self.context)
        LocalContext.stream_notifier.set(self.notifier)
        current_channel.set(self.channel)
        return self.generator.next(lambda: self.event_handler(*self.latest_args))

    async def close_generator(self) -> None:
        """Closes the handler's generator, once the track has stopped."""
        current_context.set(self.context)
        LocalContext.stream_notifier.set(self.notifier)
        current_channel.set(self.channel)
        await run_in_thread(self.generator.close)

    async def start(self):
        if not self.has_started:
            self.decode_task = _spawn(
                player_worker_decode(
                    self.next_in_thread,
                    self.queue,
                    self.thread_quit,
                    self.set_additional_outputs,
                )
            )
            self.has_started = True

    async def recv(self):
        try:
            if self.readyState != "live":
                raise MediaStreamError

            await self.start()
            data = await self.queue.get()
            if isinstance(data, CloseStream):
                send_to_page(self.channel, create_message("end_stream", data.msg))
                self.stop()
                raise MediaStreamError
            if data is None or data is _STOPPED:
                self.stop()
                raise MediaStreamError

            data_time = data.time

            # control playback rate
            if data_time is not None:
                if self._clock_start is None:
                    self._clock_start = time.time() - data_time
                else:
                    wait = self._clock_start + data_time - time.time()
                    await asyncio.sleep(wait)

            return data
        except (HandlerFailedError, MediaStreamError):
            # MediaStreamError is how a track tells aiortc that it has ended
            raise
        except Exception as e:
            raise handler_failed(e) from e

    def stop(self):
        logger.debug("audio-to-client stop callback")
        self.thread_quit.set()
        # The queue is bounded; what it holds will not be played anyway
        self.clear_queue()
        self.queue.put_nowait(_STOPPED)
        super().stop()


Track = (
    VideoCallback
    | HandlerVideoTrack
    | AudioCallback
    | ServerToClientAudio
    | ServerToClientVideo
)
