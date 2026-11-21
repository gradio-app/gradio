"""What a WebRTC stream runs: a handler class from `gradio.streaming`, or a
plain function wrapped in `VideoOptions`."""

from __future__ import annotations

from collections.abc import Awaitable, Callable, Generator
from dataclasses import dataclass
from typing import Any

from gradio.streaming.handlers import (
    AudioVideoStreamHandlerImpl,
    StreamHandlerBase,
    StreamHandlerImpl,
    VideoEmitType,
    VideoStreamHandlerImpl,
)

VideoEventGenerator = Generator[VideoEmitType, None, None]
VideoEventHandler = Callable[..., VideoEmitType | VideoEventGenerator]


@dataclass
class VideoOptions:
    """
    Wraps a video handler function to control how frames are processed.

    Parameters:
        callable: the function that processes (send modes) or generates (receive mode) video frames.
        fps: in the send modes, the most frames a second the function runs on (frames from a faster camera wait, or are dropped with `skip_frames`); in receive mode, the frame rate of the video it generates.
        skip_frames: if True (the default), frames that arrive while the handler is still processing the previous one are dropped, so the output stays close to real time when the handler is slower than the camera. Set it to False to process every frame; the output then falls further behind the input for as long as the handler cannot keep up.
        per_stream: for a function that keeps state per stream (a generator): called with each stream's request, it returns that stream's frame function and a coroutine function that cleans up after the stream.
        close: the clean-up of one stream's handler, set from `per_stream`.
    """

    callable: VideoEventHandler
    fps: float = 30
    skip_frames: bool = True
    per_stream: (
        Callable[[Any], tuple[Callable, Callable[[], Awaitable[None]]]] | None
    ) = None
    close: Callable[[], Awaitable[None]] | None = None


HandlerType = (
    StreamHandlerImpl
    | AudioVideoStreamHandlerImpl
    | VideoStreamHandlerImpl
    | type[StreamHandlerBase]
    | VideoOptions
    | Callable
)
