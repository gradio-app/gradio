"""Handler classes and helpers for streams with `transport="webrtc"`.

A plain function covers most streams: it takes one value per input and returns
one value per output. The handler classes are for streams that need state for
their whole life or that send and receive independently (e.g. a voice agent
that talks while it listens); their `emit()` returns one value per output too.

Everything here imports without the `webrtc` extra installed; aiortc is only
needed once a stream is added with `transport=`.
"""

from gradio.webrtc.handlers import (
    AsyncAudioVideoStreamHandler,
    AsyncStreamHandler,
    AsyncVideoStreamHandler,
    AudioVideoStreamHandler,
    StreamHandler,
    VideoStreamHandler,
)
from gradio.webrtc.utils import (
    CloseStream,
    audio_to_float32,
    audio_to_int16,
    get_current_context,
    wait_for_item,
)

__all__ = [
    "AsyncAudioVideoStreamHandler",
    "AsyncStreamHandler",
    "AsyncVideoStreamHandler",
    "AudioVideoStreamHandler",
    "CloseStream",
    "StreamHandler",
    "VideoStreamHandler",
    "audio_to_float32",
    "audio_to_int16",
    "get_current_context",
    "wait_for_item",
]
