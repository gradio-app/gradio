"""What a WebRTC stream runs: a handler class from `gradio.streaming`, or a
plain function wrapped in `VideoOptions`."""

from __future__ import annotations

from collections.abc import Callable, Generator
from dataclasses import dataclass

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
    """

    callable: VideoEventHandler
    fps: float = 30
    skip_frames: bool = True


HandlerType = (
    StreamHandlerImpl
    | AudioVideoStreamHandlerImpl
    | VideoStreamHandlerImpl
    | type[StreamHandlerBase]
    | VideoOptions
    | Callable
)
