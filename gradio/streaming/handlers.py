"""Handler classes for audio, video and audio-video streams.

A handler gets the incoming media with `receive()` / `video_receive()` and is
polled for outgoing values with `emit()` / `video_emit()`. How the media gets
there (e.g. `transport="webrtc"`) is up to the transport that runs it.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
from abc import ABC, abstractmethod
from collections.abc import Callable
from typing import Any, Literal, Self, TypeAlias, cast

import numpy as np
from numpy import typing as npt

from gradio.streaming.utils import (
    AdditionalOutputs,
    CloseStream,
    DataChannel,
    StreamInputs,
    create_message,
    send_to_page,
)

logger = logging.getLogger(__name__)

VideoNDArray: TypeAlias = (
    np.ndarray[Any, np.dtype[np.uint8]]
    | np.ndarray[Any, np.dtype[np.uint16]]
    | np.ndarray[Any, np.dtype[np.float32]]
)

# What a handler's emit() returns: one value per output (a tuple with several
# outputs). AdditionalOutputs is what the stream turns the outputs other than
# the media into before the transport sends them.
VideoEmitType = (
    VideoNDArray
    | tuple[Any, ...]
    | tuple[VideoNDArray, AdditionalOutputs]
    | tuple[VideoNDArray, CloseStream]
    | AdditionalOutputs
    | CloseStream
    | None
)

AudioEmitType: TypeAlias = (
    tuple[int, npt.NDArray[np.integer | np.floating]]
    | tuple[Any, ...]
    | AdditionalOutputs
    | tuple[tuple[int, npt.NDArray[np.integer | np.floating]], AdditionalOutputs]
    | CloseStream
    | None
)


class StreamHandlerBase:
    """
    Common state for stream handlers: the channel for messages to the page, the
    latest values of the extra input components, and audio format settings.
    Each stream gets its own handler, created from the class or with
    `copy()` on the server's event loop, so keep that cheap and do slow setup,
    such as loading a model, in `start_up()` (which sync handlers run in a
    worker thread).

    Parameters:
        expected_layout: channel layout the handler wants incoming audio in, "mono" or "stereo".
        output_sample_rate: sample rate of the audio the handler emits.
        input_sample_rate: sample rate the handler wants incoming audio resampled to.
        fps: frame rate of the video that audio-video handlers send.
    """

    def __init__(
        self,
        expected_layout: Literal["mono", "stereo"] = "mono",
        output_sample_rate: int = 24000,
        input_sample_rate: int = 48000,
        fps: int = 30,
    ) -> None:
        self.expected_layout = expected_layout
        self.output_sample_rate = output_sample_rate
        self.input_sample_rate = input_sample_rate
        self.fps = fps
        self._channel: DataChannel | None = None
        self._loop: asyncio.AbstractEventLoop | None = None
        self._inputs = StreamInputs()
        self.channel_set = asyncio.Event()
        self._clear_queue: Callable | None = None

        # Output frames are 20 ms long, so the sample rate must split into
        # 50 whole frames per second.
        frames_per_second = 50
        if output_sample_rate % frames_per_second != 0:
            raise ValueError(
                f"output_sample_rate must be a multiple of {frames_per_second}, "
                f"got {output_sample_rate}"
            )
        self.output_frame_size = output_sample_rate // frames_per_second

    @property
    def clear_queue(self) -> Callable:
        """Drops any audio the handler has emitted but not yet sent to the page."""
        return cast(Callable, self._clear_queue)

    @property
    def loop(self) -> asyncio.AbstractEventLoop:
        return cast(asyncio.AbstractEventLoop, self._loop)

    @property
    def channel(self) -> DataChannel | None:
        return self._channel

    def set_channel(self, channel: DataChannel) -> None:
        self._channel = channel
        self.channel_set.set()

    async def fetch_args(self) -> None:
        send_to_page(self.channel, create_message("send_input", []))

    async def wait_for_args(self) -> None:
        """
        Waits until the values of the extra input components have arrived in
        `latest_args`, asking the page for them the first time. Once they
        have, it returns at once: each change of an input updates
        `latest_args`, so it can be called with every frame.
        """
        if self.args_set.is_set():
            return
        await self.fetch_args()
        await self.args_set.wait()

    def wait_for_args_sync(self) -> None:
        """Synchronous version of `wait_for_args()` for use in `StreamHandler`."""
        try:
            asyncio.run_coroutine_threadsafe(self.wait_for_args(), self.loop).result()
        except Exception:
            logger.exception("Failed to fetch the handler inputs")

    async def send_message(self, msg: str) -> None:
        """Sends a message to the page."""
        send_to_page(self.channel, msg)

    def send_message_sync(self, msg: str) -> None:
        """Synchronous version of `send_message()` for use in `StreamHandler`."""
        try:
            asyncio.run_coroutine_threadsafe(self.send_message(msg), self.loop).result()
        except Exception as e:
            logger.debug("Exception sending msg %s", e)

    @property
    def latest_args(self) -> list[Any]:
        """The latest values of the extra input components, an empty list
        until they arrive."""
        return self._inputs.latest

    @latest_args.setter
    def latest_args(self, values: list[Any]) -> None:
        self._inputs.values = list(values)

    @property
    def args_set(self) -> asyncio.Event:
        """Set once the values of the extra input components have arrived."""
        return self._inputs.arrived

    def _use_inputs(self, inputs: StreamInputs) -> None:
        """Reads the extra inputs of the stream it serves, which the transport
        reads too. Called when the transport sets the stream up."""
        self._inputs = inputs

    def set_args(self, args: list[Any]) -> None:
        """Stores the latest values of the extra input components."""
        self._inputs.set(args)

    def reset(self) -> None:
        self.args_set.clear()

    def copy(self) -> Self:
        """Returns a new handler for a new stream."""
        raise NotImplementedError(
            f"{type(self).__name__} must implement copy() when an instance is "
            "passed as a stream's function. Pass the class instead to create a new "
            "handler per stream."
        )

    def shutdown(self) -> None:
        """
        Called when the stream ends. Override to release resources. A
        sync `shutdown()` runs in a worker thread, and a last call of the other
        methods may still be running when it starts.
        """
        pass


class StreamHandler(StreamHandlerBase, ABC):
    """
    Base class for synchronous audio stream handlers. Subclasses implement
    `receive()`, which is called with every incoming audio frame, and `emit()`,
    which is polled for the next outgoing frame. One handler instance serves
    one stream; pass the class as the stream's function to get a fresh instance
    per stream, or pass an instance and implement `copy()`.
    """

    @abstractmethod
    def receive(self, frame: tuple[int, npt.NDArray[np.int16]]) -> None:
        """
        Called with each incoming audio frame as a `(sample_rate, array)` tuple
        like the numpy value of `gr.Audio`: an int16 array of shape (samples,)
        for `expected_layout="mono"` or (samples, 2) for "stereo". Parameters
        declared after `frame` get the latest values of the stream's other
        inputs, in order; they need defaults, which are used until the page
        has sent the values.
        """
        pass

    @abstractmethod
    def emit(self) -> AudioEmitType:
        """
        Returns the next value of the stream's outputs, or None when nothing is
        ready: the value itself with one output, or one value per output in
        their order, where `gr.skip()` leaves an output unchanged (for example
        `(gr.skip(), transcript)` to update only a text output). Audio is a
        `(sample_rate, array)` tuple like the numpy value of `gr.Audio` (shape
        (samples,) for mono or (samples, 2) for stereo). Return a `CloseStream`
        to end the stream. Integer arrays are scaled as in `gr.Audio`;
        float arrays are played as values in [-1, 1], without `gr.Audio`'s
        scaling of each array to its own peak, so that chunks keep their
        loudness. Must not block; use `wait_for_item()` on a queue instead.
        """
        pass

    def start_up(self) -> None:
        """Called once when the stream starts. Return once the stream is ready,
        rather than running for the whole stream: its time limit counts from
        when this returns."""
        pass


class AsyncStreamHandler(StreamHandlerBase, ABC):
    """
    Base class for asynchronous audio stream handlers. Same contract as
    `StreamHandler`, with `receive()`, `emit()` and `start_up()` as coroutines.
    """

    @abstractmethod
    async def receive(self, frame: tuple[int, npt.NDArray[np.int16]]) -> None:
        pass

    @abstractmethod
    async def emit(self) -> AudioEmitType:
        pass

    async def start_up(self) -> None:
        """Called once when the stream starts. Return once the stream is ready,
        rather than running for the whole stream: its time limit counts from
        when this returns."""
        pass


StreamHandlerImpl = StreamHandler | AsyncStreamHandler


class AudioVideoStreamHandler(StreamHandler):
    """
    Synchronous handler for streams that carry audio and video. Adds
    `video_receive()` and `video_emit()` to the audio methods of `StreamHandler`.
    """

    @abstractmethod
    def video_receive(self, frame: npt.NDArray[np.uint8]) -> None:
        """Called with each incoming video frame as an RGB uint8 array. Frames that arrive while it runs are dropped except the newest. Parameters declared after `frame` get the latest values of the stream's other inputs, as in `receive()`."""
        pass

    @abstractmethod
    def video_emit(self) -> VideoEmitType:
        """Returns the next value of the stream's outputs, as `emit()` does: the video frame (an RGB uint8 array) in the video output's place, `gr.skip()` for an output to leave unchanged, or None when nothing is ready yet."""
        pass


class AsyncAudioVideoStreamHandler(AsyncStreamHandler):
    """
    Asynchronous handler for streams that carry audio and video. Adds
    `video_receive()` and `video_emit()` coroutines to the audio methods of
    `AsyncStreamHandler`.
    """

    @abstractmethod
    async def video_receive(self, frame: npt.NDArray[np.uint8]) -> None:
        pass

    @abstractmethod
    async def video_emit(self) -> VideoEmitType:
        pass


class VideoStreamHandler(StreamHandlerBase, ABC):
    """
    Base class for synchronous handlers of video-only streams that need state or resources for the whole stream, for example a model session that keeps state between frames. `video_receive()` is called with every incoming frame (or, when it is slower than the camera, with the newest one that arrived while it ran) and `video_emit()` is polled for the next outgoing frame; `start_up()` is called once when the stream starts (frames may already arrive while it runs) and `shutdown()` when it ends. Works when the video component is among both the inputs and the outputs, and when it is only among the inputs, where `video_emit()` is still called and returns only the other outputs. For a function called once per frame, pass the function itself.

    Parameters:
        fps: the frame rate at which frames are sent to the page; when the video component is only among the inputs, how often `video_emit()` is called.
    """

    def __init__(self, fps: int = 30) -> None:
        super().__init__(fps=fps)

    @abstractmethod
    def video_receive(self, frame: npt.NDArray[np.uint8]) -> None:
        """Called with each incoming video frame as an RGB uint8 array. Frames that arrive while it runs are dropped except the newest. Parameters declared after `frame` get the latest values of the stream's other inputs, as in `receive()`."""
        pass

    @abstractmethod
    def video_emit(self) -> VideoEmitType:
        """Returns the next value of the stream's outputs, as `emit()` does: the video frame (an RGB uint8 array) in the video output's place, `gr.skip()` for an output to leave unchanged, or None when nothing is ready yet."""
        pass

    def start_up(self) -> None:
        """Called once when the stream starts. Return once the stream is ready,
        rather than running for the whole stream: its time limit counts from
        when this returns."""
        pass


class AsyncVideoStreamHandler(StreamHandlerBase, ABC):
    """
    Asynchronous version of `VideoStreamHandler`, with `video_receive()`,
    `video_emit()` and `start_up()` as coroutines.
    """

    def __init__(self, fps: int = 30) -> None:
        super().__init__(fps=fps)

    @abstractmethod
    async def video_receive(self, frame: npt.NDArray[np.uint8]) -> None:
        pass

    @abstractmethod
    async def video_emit(self) -> VideoEmitType:
        pass

    async def start_up(self) -> None:
        """Called once when the stream starts. Return once the stream is ready,
        rather than running for the whole stream: its time limit counts from
        when this returns."""
        pass


AudioVideoStreamHandlerImpl = AudioVideoStreamHandler | AsyncAudioVideoStreamHandler
VideoStreamHandlerImpl = VideoStreamHandler | AsyncVideoStreamHandler
# Handlers with video_receive() and video_emit()
VideoTrackHandler = AudioVideoStreamHandlerImpl | VideoStreamHandlerImpl
AsyncHandler = AsyncStreamHandler | AsyncAudioVideoStreamHandler


def is_handler(fn: Any) -> bool:
    """Whether `fn` is a handler class or an instance of one."""
    return (inspect.isclass(fn) and issubclass(fn, StreamHandlerBase)) or isinstance(
        fn, StreamHandlerBase
    )
