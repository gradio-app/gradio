"""Handler classes for gr.WebRTC audio, video and audio-video streams.

This module must import without aiortc or av installed, so av is imported
inside `StreamHandlerBase.resample()`.
"""

from __future__ import annotations

import asyncio
import logging
from abc import ABC, abstractmethod
from collections.abc import Callable, Generator
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any, Literal, TypeAlias, cast

import numpy as np
from numpy import typing as npt

from gradio.webrtc.utils import (
    AdditionalOutputs,
    CloseStream,
    DataChannel,
    create_message,
)

if TYPE_CHECKING:
    from av import AudioFrame

logger = logging.getLogger(__name__)

VideoNDArray: TypeAlias = (
    np.ndarray[Any, np.dtype[np.uint8]]
    | np.ndarray[Any, np.dtype[np.uint16]]
    | np.ndarray[Any, np.dtype[np.float32]]
)

VideoEmitType = (
    VideoNDArray
    | tuple[VideoNDArray, AdditionalOutputs]
    | tuple[VideoNDArray, CloseStream]
    | AdditionalOutputs
    | CloseStream
    | None
)
VideoEventGenerator = Generator[VideoEmitType, None, None]
VideoEventHandler = Callable[..., VideoEmitType | VideoEventGenerator]

AudioEmitType: TypeAlias = (
    tuple[int, npt.NDArray[np.integer | np.floating]]
    | AdditionalOutputs
    | tuple[tuple[int, npt.NDArray[np.integer | np.floating]], AdditionalOutputs]
    | CloseStream
    | None
)


@dataclass
class VideoOptions:
    """
    Wraps a video handler function to control how frames are processed.

    Parameters:
        callable: the function that processes (send modes) or generates (receive mode) video frames.
        fps: the frame rate at which frames are sent to the client.
        skip_frames: if True (the default), frames that arrive while the handler is still processing the previous one are dropped, so the output stays close to real time when the handler is slower than the camera. Set it to False to process every frame; the output then falls further behind the input for as long as the handler cannot keep up.
    """

    callable: VideoEventHandler
    fps: int = 30
    skip_frames: bool = True


class StreamHandlerBase:
    """
    Common state for stream handlers: the data channel to the client, the
    latest values of the extra input components, and audio format settings.
    Each connection gets its own handler, created from the class or with
    `copy()` on the server's event loop, so keep that cheap and do slow setup,
    such as loading a model, in `start_up()` (which sync handlers run in a
    worker thread).

    Parameters:
        expected_layout: channel layout the handler wants incoming audio in, "mono" or "stereo".
        output_sample_rate: sample rate of the audio the handler emits.
        input_sample_rate: sample rate the handler wants incoming audio resampled to.
        fps: frame rate for the video track of audio-video handlers.
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
        self.latest_args: list[Any] = []
        self._resampler = None
        self._channel: DataChannel | None = None
        self._loop: asyncio.AbstractEventLoop | None = None
        self.args_set = asyncio.Event()
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
        """Drops any audio the handler has emitted but not yet sent to the client."""
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
        if self.channel:
            self.channel.send(create_message("send_input", []))

    async def wait_for_args(self) -> None:
        """
        Asks the client for the current values of the extra input components
        and waits until they arrive in `latest_args`.
        """
        await self.fetch_args()
        await self.args_set.wait()

    def wait_for_args_sync(self) -> None:
        """Synchronous version of `wait_for_args()` for use in `StreamHandler`."""
        try:
            asyncio.run_coroutine_threadsafe(self.wait_for_args(), self.loop).result()
        except Exception:
            logger.exception("Failed to fetch the handler inputs")

    async def send_message(self, msg: str) -> None:
        """Sends a message over the data channel to the client."""
        if self.channel:
            self.channel.send(msg)

    def send_message_sync(self, msg: str) -> None:
        """Synchronous version of `send_message()` for use in `StreamHandler`."""
        try:
            asyncio.run_coroutine_threadsafe(self.send_message(msg), self.loop).result()
        except Exception as e:
            logger.debug("Exception sending msg %s", e)

    def set_args(self, args: list[Any]) -> None:
        """Stores the latest values of the extra input components."""
        self.latest_args = list(args)
        self.args_set.set()

    def reset(self) -> None:
        self.args_set.clear()

    def shutdown(self) -> None:
        """
        Called when the connection closes. Override to release resources. A
        sync `shutdown()` runs in a worker thread, and a last call of the other
        methods may still be running when it starts.
        """
        pass

    def resample(self, frame: AudioFrame) -> Generator[AudioFrame, None, None]:
        import av

        if self._resampler is None:
            self._resampler = av.AudioResampler(
                format="s16",
                layout=self.expected_layout,
                rate=self.input_sample_rate,
                frame_size=frame.samples,
            )
        yield from self._resampler.resample(frame)


class StreamHandler(StreamHandlerBase, ABC):
    """
    Base class for synchronous audio stream handlers. Subclasses implement
    `receive()`, which is called with every incoming audio frame, and `emit()`,
    which is polled for the next outgoing frame. One handler instance serves
    one connection; pass the class to `WebRTC.stream()` to get a fresh instance
    per connection, or pass an instance and implement `copy()`.
    """

    @abstractmethod
    def receive(self, frame: tuple[int, npt.NDArray[np.int16]]) -> None:
        """
        Called with each incoming audio frame as a `(sample_rate, array)` tuple
        like the numpy value of `gr.Audio`: an int16 array of shape (samples,)
        for `expected_layout="mono"` or (samples, 2) for "stereo".
        """
        pass

    @abstractmethod
    def emit(self) -> AudioEmitType:
        """
        Returns the next audio frame to send, as a `(sample_rate, array)` tuple
        like the numpy value of `gr.Audio` (shape (samples,) for mono or
        (samples, 2) for stereo), an `AdditionalOutputs`, a `CloseStream`, or
        None when nothing is ready. Integer arrays are scaled as in `gr.Audio`;
        float arrays are played as values in [-1, 1], without `gr.Audio`'s
        scaling of each array to its own peak, so that chunks keep their
        loudness. Must not block; use `wait_for_item()` on a queue instead.
        """
        pass

    def copy(self) -> StreamHandler:
        """Returns a new handler for a new connection."""
        raise NotImplementedError(
            f"{type(self).__name__} must implement copy() when an instance is "
            "passed to WebRTC.stream(). Pass the class instead to create a new "
            "handler per connection."
        )

    def start_up(self) -> None:
        """Called once when the connection is established."""
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

    def copy(self) -> AsyncStreamHandler:
        """Returns a new handler for a new connection."""
        raise NotImplementedError(
            f"{type(self).__name__} must implement copy() when an instance is "
            "passed to WebRTC.stream(). Pass the class instead to create a new "
            "handler per connection."
        )

    async def start_up(self) -> None:
        """Called once when the connection is established."""
        pass


StreamHandlerImpl = StreamHandler | AsyncStreamHandler


class AudioVideoStreamHandler(StreamHandler):
    """
    Synchronous handler for streams that carry audio and video. Adds
    `video_receive()` and `video_emit()` to the audio methods of `StreamHandler`.
    """

    @abstractmethod
    def video_receive(self, frame: npt.NDArray[np.uint8]) -> None:
        """Called with each incoming video frame as an RGB uint8 array."""
        pass

    @abstractmethod
    def video_emit(self) -> VideoEmitType:
        """Returns the next video frame to send, as an RGB uint8 array, or None when none is ready yet."""
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
    Base class for synchronous handlers of video-only streams that need state
    or resources for the whole stream, for example one GPU allocation per
    stream on ZeroGPU. `video_receive()` is called with every incoming frame
    and `video_emit()` is polled for the next outgoing frame; `start_up()` is
    called once when the connection is established (frames may already arrive
    while it runs) and `shutdown()` when it closes. Works in mode="send-receive". For a function called once per frame,
    pass the function (or a `VideoOptions`) to `WebRTC.stream()` instead.

    Parameters:
        fps: the frame rate at which frames are sent to the client.
    """

    def __init__(self, fps: int = 30) -> None:
        super().__init__(fps=fps)

    @abstractmethod
    def video_receive(self, frame: npt.NDArray[np.uint8]) -> None:
        """Called with each incoming video frame as an RGB uint8 array."""
        pass

    @abstractmethod
    def video_emit(self) -> VideoEmitType:
        """Returns the next video frame to send, as an RGB uint8 array, or None when none is ready yet."""
        pass

    def copy(self) -> VideoStreamHandler:
        """Returns a new handler for a new connection."""
        raise NotImplementedError(
            f"{type(self).__name__} must implement copy() when an instance is "
            "passed to WebRTC.stream(). Pass the class instead to create a new "
            "handler per connection."
        )

    def start_up(self) -> None:
        """Called once when the connection is established."""
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

    def copy(self) -> AsyncVideoStreamHandler:
        """Returns a new handler for a new connection."""
        raise NotImplementedError(
            f"{type(self).__name__} must implement copy() when an instance is "
            "passed to WebRTC.stream(). Pass the class instead to create a new "
            "handler per connection."
        )

    async def start_up(self) -> None:
        """Called once when the connection is established."""
        pass


AudioVideoStreamHandlerImpl = AudioVideoStreamHandler | AsyncAudioVideoStreamHandler
VideoStreamHandlerImpl = VideoStreamHandler | AsyncVideoStreamHandler
# Handlers whose video_receive() and video_emit() serve a video track
VideoTrackHandler = AudioVideoStreamHandlerImpl | VideoStreamHandlerImpl
AsyncHandler = AsyncStreamHandler | AsyncAudioVideoStreamHandler

HandlerType = (
    StreamHandlerImpl
    | AudioVideoStreamHandlerImpl
    | VideoStreamHandlerImpl
    | type[StreamHandlerBase]
    | VideoOptions
    | Callable
)
