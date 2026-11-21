"""Handler classes and helpers for media streams.

A plain function covers most streams: it takes one value per input and returns
one value per output. The handler classes are for streams that need state for
their whole life or that send and receive independently (e.g. a voice agent
that talks while it listens); their `emit()` returns one value per output too.
They run on a stream with `transport=` (`transport="webrtc"` for now).
`ReplyOnPause` is a ready-made handler for the common voice agent: it waits
until the user stops talking and streams the reply of a generator function.

Everything here imports without the `webrtc` extra installed.
"""

from gradio.streaming.handlers import (
    AsyncAudioVideoStreamHandler,
    AsyncStreamHandler,
    AsyncVideoStreamHandler,
    AudioVideoStreamHandler,
    StreamHandler,
    VideoStreamHandler,
)
from gradio.streaming.reply_on_pause import ReplyOnPause, SileroVAD
from gradio.streaming.utils import (
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
    "ReplyOnPause",
    "SileroVAD",
    "StreamHandler",
    "VideoStreamHandler",
    "audio_to_float32",
    "audio_to_int16",
    "get_current_context",
    "wait_for_item",
]
