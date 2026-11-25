"""The public settings and type hints of WebRTC streams. This module imports
without aiortc, so apps can name these before the `webrtc` extra is needed."""

from __future__ import annotations

import dataclasses
from collections.abc import Callable
from typing import TYPE_CHECKING, Any

import numpy as np
from gradio_client.documentation import document

if TYPE_CHECKING:
    from gradio.components.base import Component


@document()
@dataclasses.dataclass
class WebRTCOptions:
    """
    Settings of a stream whose media travels over WebRTC. Pass an instance as `transport=` of an event listener (for example `.stream()` of a gr.Image, gr.Audio or gr.Video) or of `gr.Server.api()`; `transport="webrtc"` is the same with all the defaults. Requires the `webrtc` extra: `pip install "gradio[webrtc]"`.

    Parameters:
        rtc_configuration: the configuration of the browser's RTCPeerConnection, in particular the ICE servers (STUN and TURN) it may use. A dict, or a function (sync or async) that returns one, called for every new connection so that short-lived TURN credentials can be issued. Like an event listener, the function can take `gr.Request`, `gr.OAuthProfile` or `gr.OAuthToken` parameters, e.g. to issue the credentials with the visitor's own Hugging Face account. Required on Hugging Face Spaces and Colab, where the browser often cannot reach the server directly.
        server_rtc_configuration: the equivalent configuration for the server's side of the connection. Not sent to the browser.
        video_bitrate: the bitrate range of the video in kbps, as a dict with any of the keys "min", "start" and "max", e.g. `{"min": 1000, "start": 1500, "max": 4000}`. WebRTC starts video at a low bitrate and raises it as it finds bandwidth, so the first seconds are blurry and the browser may send a smaller picture than the camera captures; a higher "start" and "min" avoid that at the cost of bandwidth. If None, the defaults of the browser and of aiortc apply.
        rtp_params: parameters the browser passes to `RTCRtpSender.setParameters` for the tracks it sends. For example, `{"degradationPreference": "maintain-framerate"}` keeps the frame rate steady when the resolution has to drop. Sent to the browser.
        allow_extra_tracks: if True, connections that carry tracks the stream does not use (for example an audio track on a video stream) are accepted and the extra tracks are dropped. If False, such connections are refused.
        skip_frames: for a function called once per video frame: if True (the default), frames that arrive while the function is still busy are dropped and it gets the newest one, so the output stays close to real time. If False, every frame is processed and the output falls behind for as long as the function cannot keep up.
        media_output: the output component that shows the live media, when several outputs could. Not needed when the streaming component is one of the outputs, or when only one output is of its kind.
        output_every: the shortest interval in seconds between updates of the outputs other than the media, such as a gr.Textbox next to the video. A value that changes while an update waits replaces the one before it, so the page always gets the newest values, and the first change after a quiet moment goes out at once. A value equal to what the stream last sent is not sent again, even if another event changed the component since. None or 0 sends every change as soon as the function returns it.
    """

    rtc_configuration: dict[str, Any] | Callable | None = None
    server_rtc_configuration: dict[str, Any] | None = None
    video_bitrate: dict[str, int] | None = None
    rtp_params: dict[str, Any] | None = None
    allow_extra_tracks: bool = False
    skip_frames: bool = True
    media_output: Component | None = None
    output_every: float | None = 0.1


@document()
class VideoFrame(np.ndarray):
    """
    Type hint that marks the video of a `gr.Server` endpoint streamed over WebRTC (`@app.api(transport="webrtc")`): as a parameter, each frame from the client; as a return value, the frame sent back. A frame is an RGB numpy array of shape (height, width, 3), like the numpy value of gr.Image.
    """


@document()
class AudioChunk(tuple):
    """
    Type hint that marks the audio of a `gr.Server` endpoint streamed over WebRTC (`@app.api(transport="webrtc")`): as a parameter, the audio from the client; as a return value, the audio sent back. A chunk is a (sample_rate, numpy array) tuple, like the numpy value of gr.Audio.
    """
