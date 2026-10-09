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
import threading
import time
import traceback
from collections.abc import Callable, Generator
from typing import Any, Literal, cast

import anyio
import numpy as np
import numpy.typing as npt
from aiortc import AudioStreamTrack, MediaStreamTrack, VideoStreamTrack
from aiortc.contrib.media import AudioFrame, VideoFrame
from aiortc.mediastreams import VIDEO_CLOCK_RATE, VIDEO_TIME_BASE, MediaStreamError

from gradio.webrtc.handlers import (
    AsyncHandler,
    AudioEmitType,
    AudioVideoStreamHandlerImpl,
    StreamHandlerBase,
    StreamHandlerImpl,
    VideoEventHandler,
)
from gradio.webrtc.utils import (
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
    split_output,
)

logger = logging.getLogger(__name__)

_GENERATOR_DONE = object()


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
        self.frame_queue: asyncio.Queue[VideoFrame] = asyncio.Queue()
        self.context = context
        self._clock_start: float | None = None
        self._clock_timestamp: int | None = None

    def set_channel(self, channel: DataChannel):
        self.channel = channel
        current_channel.set(channel)
        current_context.set(self.context)
        self.channel_set.set()

    def set_args(self, args: list[Any]):
        self.latest_args = list(args)

    def array_to_frame(self, array: Any) -> VideoFrame:
        return VideoFrame.from_ndarray(array, format="bgr24")

    def frame_to_array(self, frame: VideoFrame) -> npt.NDArray[np.uint8]:
        array = cast(npt.NDArray[np.uint8], frame.to_ndarray(format="bgr24"))
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

    async def start(self):
        asyncio.create_task(self.process_frames())

    def stop(self):
        super().stop()
        logger.debug("video callback stop")
        self.thread_quit.set()

    async def wait_for_channel(self):
        current_context.set(self.context)
        if not self.channel_set.is_set():
            await self.channel_set.wait()
        if current_channel.get() != self.channel:
            current_channel.set(self.channel)

    async def accept_input(self):
        self.has_started = True
        while not self.thread_quit.is_set():
            try:
                frame = cast(VideoFrame, await self.track.recv())
                self.frame_queue.put_nowait(frame)
            except MediaStreamError:
                self.stop()
                return

    def accept_input_in_background(self):
        if not self.has_started:
            asyncio.create_task(self.accept_input())

    async def recv(self):
        self.accept_input_in_background()
        try:
            frame = await self.frame_queue.get()
            if self.skip_frames:
                while not self.frame_queue.empty():
                    frame = self.frame_queue.get_nowait()
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
                await anyio.to_thread.run_sync(
                    self.event_handler, frame_array, *self.latest_args
                )
            )
            if isinstance(outputs, CloseStream):
                cast(DataChannel, self.channel).send(
                    create_message("end_stream", outputs.msg)
                )
                self.stop()
                return None
            if isinstance(outputs, AdditionalOutputs) and self.set_additional_outputs:
                self.set_additional_outputs(outputs)
            if array is None and self.mode == "send":
                return

            new_frame = self.array_to_frame(array)
            if frame:
                new_frame.pts = frame.pts
                new_frame.time_base = frame.time_base
            else:
                pts, time_base = await self.next_timestamp()
                new_frame.pts = pts
                new_frame.time_base = time_base
            return new_frame
        except HandlerFailedError:
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
    Video track of an audio-video connection. Incoming frames go to the
    handler's `video_receive()`; outgoing frames come from `video_emit()`.
    """

    async def process_frames(self):
        while not self.thread_quit.is_set():
            try:
                await self.channel_set.wait()
                frame = cast(VideoFrame, await self.track.recv())
                frame_array = self.frame_to_array(frame)
                handler = cast(AudioVideoStreamHandlerImpl, self.event_handler)
                if inspect.iscoroutinefunction(handler.video_receive):
                    await handler.video_receive(frame_array)
                else:
                    await anyio.to_thread.run_sync(handler.video_receive, frame_array)
            except (MediaStreamError, HandlerFailedError):
                self.stop()

    async def start(self):
        if not self.has_started:
            asyncio.create_task(self.process_frames())
            self.has_started = True

    async def recv(self):
        await self.start()
        try:
            handler = cast(AudioVideoStreamHandlerImpl, self.event_handler)
            if inspect.iscoroutinefunction(handler.video_emit):
                outputs = await handler.video_emit()
            else:
                outputs = await anyio.to_thread.run_sync(handler.video_emit)

            array, outputs = split_output(outputs)
            if isinstance(outputs, AdditionalOutputs) and self.set_additional_outputs:
                self.set_additional_outputs(outputs)
            if isinstance(outputs, CloseStream):
                cast(DataChannel, self.channel).send(
                    create_message("end_stream", outputs.msg)
                )
                self.stop()
                return
            if array is None and self.mode == "send":
                return

            new_frame = self.array_to_frame(array)
            pts, time_base = await self.next_timestamp()
            new_frame.pts = pts
            new_frame.time_base = time_base
            return new_frame
        except HandlerFailedError:
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

    def clear_queue(self):
        while not self.queue.empty():
            self.queue.get_nowait()
        self._clock_start = None

    async def wait_for_channel(self):
        current_context.set(self.context)
        if not self.event_handler.channel_set.is_set():
            await self.event_handler.channel_set.wait()
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
        return cast(Callable, self.event_handler.emit)()

    async def process_input_frames(self) -> None:
        while not self.thread_quit.is_set():
            try:
                frame = cast(AudioFrame, await self.track.recv())
                for resampled in self.event_handler.resample(frame):
                    numpy_array = cast(npt.NDArray[np.int16], resampled.to_ndarray())
                    if isinstance(self.event_handler, AsyncHandler):
                        await self.event_handler.receive(
                            (resampled.sample_rate, numpy_array)
                        )
                    else:
                        await anyio.to_thread.run_sync(
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
            loop = asyncio.get_running_loop()
            await self.wait_for_channel()
            if isinstance(self.event_handler, AsyncHandler):
                callable = self.event_handler.emit
                start_up = self.event_handler.start_up()
                if not inspect.isawaitable(start_up):
                    raise handler_failed(
                        TypeError(
                            "In AsyncStreamHandler, start_up must be a coroutine "
                            "(async def)"
                        )
                    )
            else:
                callable = functools.partial(
                    loop.run_in_executor, None, self.event_handler_emit
                )
                start_up = anyio.to_thread.run_sync(self.event_handler.start_up)
            self.process_input_task = asyncio.create_task(self.process_input_frames())
            self.start_up_task = asyncio.create_task(start_up)
            self.decode_task = asyncio.create_task(
                player_worker_decode(
                    callable,
                    self.queue,
                    self.thread_quit,
                    self.set_additional_outputs,
                    False,
                    self.event_handler.output_sample_rate,
                    self.event_handler.output_frame_size,
                )
            )
            self.has_started = True

    async def recv(self):
        try:
            if self.readyState != "live":
                raise MediaStreamError

            if not self.event_handler.channel_set.is_set():
                await self.event_handler.channel_set.wait()
            if current_channel.get() != self.event_handler.channel:
                current_channel.set(self.event_handler.channel)
            await self.start()

            frame = await self.queue.get()
            if isinstance(frame, CloseStream):
                cast(DataChannel, self.channel).send(
                    create_message("end_stream", frame.msg)
                )
                self.stop()
                return

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
        except Exception as e:
            logger.debug("exception %s\n%s", e, traceback.format_exc())

    def stop(self):
        logger.debug("audio callback stop")
        self.thread_quit.set()
        super().stop()


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
        self.generator: Generator[Any, None, Any] | None = None
        self.channel = channel
        self.set_additional_outputs = set_additional_outputs
        self.fps = fps
        self.frame_ptime = 1.0 / fps
        self.context = context
        self._clock_start: float | None = None
        self._clock_timestamp: int | None = None

    def array_to_frame(self, array: Any) -> VideoFrame:
        return VideoFrame.from_ndarray(array, format="bgr24")

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
        # StopIteration cannot cross into the awaiting task, so the end of the
        # generator is reported with a sentinel instead.
        if self.generator is None:
            self.generator = cast(
                Generator[Any, None, Any], self.event_handler(*self.latest_args)
            )
        try:
            return next(self.generator)
        except StopIteration:
            return _GENERATOR_DONE

    async def recv(self):
        try:
            pts, time_base = await self.next_timestamp()
            await self.args_set.wait()
            current_channel.set(self.channel)
            current_context.set(self.context)
            # The generator does the handler's work, so advance it in a worker
            # thread to keep the event loop free.
            item = await anyio.to_thread.run_sync(self._next_item)
            if item is _GENERATOR_DONE:
                self.stop()
                return
            next_array, outputs = split_output(item)
            if isinstance(outputs, CloseStream):
                cast(DataChannel, self.channel).send(
                    create_message("end_stream", outputs.msg)
                )
                self.stop()
                return
            if isinstance(outputs, AdditionalOutputs) and self.set_additional_outputs:
                self.set_additional_outputs(outputs)

            next_frame = self.array_to_frame(next_array)
            next_frame.pts = pts
            next_frame.time_base = time_base
            return next_frame
        except HandlerFailedError:
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
        self.generator: Generator[Any, None, Any] | None = None
        self.event_handler = event_handler
        self.current_timestamp = 0
        self.latest_args: list[Any] = []
        self.args_set = threading.Event()
        self.queue: asyncio.Queue = asyncio.Queue()
        self.thread_quit = asyncio.Event()
        self.channel = channel
        self.set_additional_outputs = set_additional_outputs
        self.has_started = False
        self._clock_start: float | None = None
        self.context = context
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

    def next(self) -> tuple[int, np.ndarray] | None:
        current_context.set(self.context)
        self.args_set.wait()
        current_channel.set(self.channel)
        if self.generator is None:
            self.generator = self.event_handler(*self.latest_args)
        if self.generator is not None:
            try:
                return next(self.generator)
            except StopIteration:
                self.thread_quit.set()
        return None

    async def start(self):
        if not self.has_started:
            loop = asyncio.get_running_loop()
            callable = functools.partial(loop.run_in_executor, None, self.next)
            asyncio.create_task(
                player_worker_decode(
                    callable,
                    self.queue,
                    self.thread_quit,
                    self.set_additional_outputs,
                    True,
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
                cast(DataChannel, self.channel).send(
                    create_message("end_stream", data.msg)
                )
                self.stop()
                return
            if data is None:
                self.stop()
                return

            data_time = data.time

            # control playback rate
            if data_time is not None:
                if self._clock_start is None:
                    self._clock_start = time.time() - data_time
                else:
                    wait = self._clock_start + data_time - time.time()
                    await asyncio.sleep(wait)

            return data
        except HandlerFailedError:
            raise
        except Exception as e:
            raise handler_failed(e) from e

    def stop(self):
        logger.debug("audio-to-client stop callback")
        self.thread_quit.set()
        super().stop()


Track = (
    VideoCallback
    | HandlerVideoTrack
    | AudioCallback
    | ServerToClientAudio
    | ServerToClientVideo
)
