"""Handler classes and helpers for streaming with `gr.WebRTC`.

Everything here imports without the `webrtc` extra installed; aiortc is only
needed once a stream handler is attached with `WebRTC.stream()`.
"""

from gradio.webrtc.handlers import (
    AsyncAudioVideoStreamHandler,
    AsyncStreamHandler,
    AudioEmitType,
    AudioVideoStreamHandler,
    StreamHandler,
    VideoEmitType,
    VideoStreamHandler,
)
from gradio.webrtc.utils import (
    AdditionalOutputs,
    CloseStream,
    WebRTCError,
    audio_to_float32,
    audio_to_int16,
    get_current_context,
    wait_for_item,
)

__all__ = [
    "AdditionalOutputs",
    "AsyncAudioVideoStreamHandler",
    "AsyncStreamHandler",
    "AudioEmitType",
    "AudioVideoStreamHandler",
    "CloseStream",
    "StreamHandler",
    "VideoEmitType",
    "VideoStreamHandler",
    "WebRTCError",
    "audio_to_float32",
    "audio_to_int16",
    "get_current_context",
    "wait_for_item",
]
