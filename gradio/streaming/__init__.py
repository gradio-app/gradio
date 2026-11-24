"""Handler classes and helpers for media streams.

A plain function covers most streams: it takes one value per input and returns
one value per output. The handler classes are for streams that need state for
their whole life or that send and receive independently (e.g. a voice agent
that talks while it listens); their `emit()` returns one value per output too.
They run on a stream with `transport=` (`transport="webrtc"` for now).
`ReplyOnPause` is a ready-made handler for the common voice agent: it waits
until the user stops talking and streams the reply of a generator function.

It needs numpy, which the `webrtc` extra installs, but not aiortc.
"""

try:
    import numpy  # noqa: F401
except ModuleNotFoundError as error:
    # Also for `from gradio import streaming`, which does not reach the hint
    # in gradio/__init__.py
    raise ModuleNotFoundError(
        '`gradio.streaming` needs numpy. Install it with the `webrtc` extra: pip install "gradio[webrtc]"',
        name="numpy",
    ) from error

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
