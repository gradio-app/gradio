"""The bitrate range of gr.WebRTC video (the component's `video_bitrate`).

WebRTC starts video at a low bitrate and raises it as it finds bandwidth, so
the first seconds of a stream are blurry, and the browser may send a smaller
picture than the camera captures. A range with a higher start and minimum is
applied in both directions:

- the video the browser sends: as the `x-google-*-bitrate` parameters in the
  answer, which Chromium-based browsers honor and others ignore;
- the video the server sends back: aiortc has no per-connection setting (its
  encoders clamp to module constants), so each connection gets an encoder that
  clamps to the range instead, set on the sender before its first frame.
"""

from __future__ import annotations

import logging
from typing import Any, cast

from aiortc import RTCPeerConnection
from aiortc.codecs import h264, vpx

logger = logging.getLogger(__name__)

BITRATE_KEYS = ("min", "start", "max")


def add_bitrate_hints(sdp: str, video_bitrate: dict[str, int]) -> str:
    """Adds the x-google-*-bitrate parameters to every video codec of `sdp`."""
    hints = ";".join(
        f"x-google-{key}-bitrate={video_bitrate[key]}"
        for key in BITRATE_KEYS
        if key in video_bitrate
    )
    # Split into the session part and one block per media section
    sections: list[list[str]] = [[]]
    for line in sdp.split("\r\n"):
        if line.startswith("m="):
            sections.append([])
        sections[-1].append(line)
    out: list[str] = []
    for section in sections:
        if not section or not section[0].startswith("m=video"):
            out.extend(section)
            continue
        codecs = []
        for line in section:
            if line.startswith("a=rtpmap:"):
                payload_type, codec = line[len("a=rtpmap:") :].split(" ", 1)
                if not codec.lower().startswith(("rtx/", "red/", "ulpfec/")):
                    codecs.append(payload_type)
        with_fmtp = {
            line[len("a=fmtp:") :].split(" ", 1)[0]
            for line in section
            if line.startswith("a=fmtp:")
        }
        for line in section:
            if (
                line.startswith("a=fmtp:")
                and line[len("a=fmtp:") :].split(" ", 1)[0] in codecs
            ):
                line = f"{line};{hints}"
            out.append(line)
            if line.startswith("a=rtpmap:"):
                payload_type = line[len("a=rtpmap:") :].split(" ", 1)[0]
                if payload_type in codecs and payload_type not in with_fmtp:
                    out.append(f"a=fmtp:{payload_type} {hints}")
    return "\r\n".join(out)


def _limited_encoder(encoder_class: Any, low: int, start: int, high: int) -> Any:
    class LimitedEncoder(encoder_class):
        def __init__(self) -> None:
            super().__init__()
            self.target_bitrate = start

        @property
        def target_bitrate(self) -> int:
            return self._limited_bitrate

        @target_bitrate.setter
        def target_bitrate(self, bitrate: int) -> None:
            self._limited_bitrate = max(low, min(bitrate, high))
            # Vp8Encoder sizes its buffer from its private copy of the value
            setattr(
                self,
                f"_{encoder_class.__name__}__target_bitrate",
                self._limited_bitrate,
            )

    return LimitedEncoder()


def limit_video_encoders(pc: RTCPeerConnection, video_bitrate: dict[str, int]) -> None:
    """
    Gives the video senders of `pc` encoders that keep to `video_bitrate`.
    Call after setLocalDescription(): the codecs are negotiated by then and no
    frame has been encoded yet.
    """
    # aiortc internals too, so a version that renames them leaves the bitrate
    # alone rather than failing the stream
    encoders = {
        mime: (getattr(module, name), module)
        for mime, module, name in (
            ("video/vp8", vpx, "Vp8Encoder"),
            ("video/h264", h264, "H264Encoder"),
        )
        if all(
            hasattr(module, attr)
            for attr in (name, "MIN_BITRATE", "DEFAULT_BITRATE", "MAX_BITRATE")
        )
    }
    for transceiver in pc.getTransceivers():
        sender = transceiver.sender
        if transceiver.kind != "video" or sender.track is None:
            continue
        # aiortc internals: the sender encodes with the first negotiated codec
        # and creates its encoder on the first frame unless one is set
        codecs = getattr(transceiver, "_codecs", None)
        found = encoders.get(codecs[0].mimeType.lower()) if codecs else None
        if found is None or not hasattr(sender, "_RTCRtpSender__encoder"):
            logger.warning("video_bitrate cannot be applied to the outgoing video")
            continue
        encoder_class, module = found
        # Keys that are not given keep aiortc's values, widened when needed to
        # stay consistent with the given ones
        given = {key: kbps * 1000 for key, kbps in video_bitrate.items()}
        high = given.get(
            "max",
            max(module.MAX_BITRATE, given.get("min", 0), given.get("start", 0)),
        )
        low = given.get("min", min(module.MIN_BITRATE, given.get("start", high), high))
        start = max(low, min(given.get("start", module.DEFAULT_BITRATE), high))
        cast(Any, sender)._RTCRtpSender__encoder = _limited_encoder(
            encoder_class, low, start, high
        )
