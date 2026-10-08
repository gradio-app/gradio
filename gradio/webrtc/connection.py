"""Server side of gr.WebRTC connections: signalling, peer connections and the
per-connection handler, track and output queue bookkeeping.

One `ConnectionManager` exists per `gr.WebRTC` component that has a stream
handler. It is looked up by component id, not kept on the component, because
Gradio deep-copies components into each session and every copy has to see the
same connections.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
from collections import defaultdict
from collections.abc import AsyncGenerator, Callable
from dataclasses import dataclass, field
from typing import Any, Literal, cast

from aiortc import (
    RTCConfiguration,
    RTCIceCandidate,
    RTCIceServer,
    RTCPeerConnection,
    RTCSessionDescription,
)
from aiortc.contrib.media import MediaRelay

from gradio.webrtc.handlers import (
    AudioVideoStreamHandlerImpl,
    HandlerType,
    StreamHandlerBase,
    StreamHandlerImpl,
    VideoStreamHandler,
)
from gradio.webrtc.tracks import (
    AudioCallback,
    HandlerVideoTrack,
    ServerToClientAudio,
    ServerToClientVideo,
    Track,
    VideoCallback,
)
from gradio.webrtc.utils import AdditionalOutputs, Context, webrtc_error_handler

logger = logging.getLogger(__name__)

Mode = Literal["send-receive", "receive", "send"]
Modality = Literal["video", "audio", "audio-video"]

CONNECT_TIMEOUT = 30


@dataclass
class OutputQueue:
    queue: asyncio.Queue[AdditionalOutputs] = field(default_factory=asyncio.Queue)
    quit: asyncio.Event = field(default_factory=asyncio.Event)


def to_rtc_configuration(
    rtc_configuration: dict[str, Any] | None,
) -> RTCConfiguration | None:
    if rtc_configuration is None:
        return None
    return RTCConfiguration(
        iceServers=[
            RTCIceServer(
                urls=server["urls"],
                username=server.get("username"),
                credential=server.get("credential"),
            )
            for server in rtc_configuration.get("iceServers", [])
        ]
    )


def instantiate_handler(handler: HandlerType) -> HandlerType:
    """
    Returns the handler object for a new connection: a new instance when a
    handler class was given, a copy when an instance was given, and the
    callable itself otherwise. Handler methods are wrapped so that exceptions
    reach the client as errors.
    """
    instance: StreamHandlerImpl
    if inspect.isclass(handler) and issubclass(handler, StreamHandlerBase):
        instance = cast(StreamHandlerImpl, handler())
    elif isinstance(handler, StreamHandlerBase):
        instance = cast(StreamHandlerImpl, handler).copy()
    elif isinstance(handler, VideoStreamHandler):
        return VideoStreamHandler(
            callable=webrtc_error_handler(handler.callable),
            fps=handler.fps,
            skip_frames=handler.skip_frames,
        )
    else:
        return webrtc_error_handler(cast(Callable, handler))
    for name in (
        "emit",
        "receive",
        "start_up",
        "shutdown",
        "video_receive",
        "video_emit",
    ):
        if hasattr(instance, name):
            setattr(instance, name, webrtc_error_handler(getattr(instance, name)))
    return instance


def _failed(error: str, **meta: Any) -> dict[str, Any]:
    return {"status": "failed", "meta": {"error": error, **meta}}


def _parse_ice_candidate(candidate: dict[str, Any]) -> RTCIceCandidate | None:
    # Example: "candidate:2393089663 1 udp 2122260223 192.168.86.60 63692 typ host ..."
    parts = candidate.get("candidate", "").split()
    if len(parts) < 8 or not parts[0].startswith("candidate:") or "typ" not in parts:
        return None
    return RTCIceCandidate(
        foundation=parts[0].split(":", 1)[1],
        component=int(parts[1]),
        protocol=parts[2],
        priority=int(parts[3]),
        ip=parts[4],
        port=int(parts[5]),
        type=parts[parts.index("typ") + 1],
        sdpMid=candidate.get("sdpMid"),
        sdpMLineIndex=candidate.get("sdpMLineIndex"),
    )


class ConnectionManager:
    def __init__(
        self,
        *,
        handler: HandlerType,
        mode: Mode,
        modality: Modality,
        concurrency_limit: int | None,
        time_limit: float | None,
        allow_extra_tracks: bool,
        server_rtc_configuration: dict[str, Any] | None,
    ) -> None:
        self.handler = handler
        self.mode = mode
        self.modality = modality
        self.concurrency_limit = concurrency_limit
        self.time_limit = time_limit
        self.allow_extra_tracks = allow_extra_tracks
        self.server_rtc_configuration = to_rtc_configuration(server_rtc_configuration)
        self.pcs: dict[str, RTCPeerConnection] = {}
        self.connections: dict[str, list[Track]] = defaultdict(list)
        self.data_channels: dict[str, Any] = {}
        self.additional_outputs: dict[str, OutputQueue] = {}
        self.handlers: dict[str, HandlerType] = {}
        self.connection_timeouts: dict[str, asyncio.Event] = defaultdict(asyncio.Event)

    @staticmethod
    async def wait_for_time_limit(pc: RTCPeerConnection, time_limit: float):
        await asyncio.sleep(time_limit)
        await pc.close()

    async def connection_timeout(
        self, pc: RTCPeerConnection, webrtc_id: str, time_limit: float
    ):
        try:
            await asyncio.wait_for(
                self.connection_timeouts[webrtc_id].wait(), time_limit
            )
        except (asyncio.TimeoutError, TimeoutError):
            await pc.close()
            self.connection_timeouts[webrtc_id].clear()
            self.clean_up(webrtc_id)

    def clean_up(self, webrtc_id: str) -> list[Track]:
        self.handlers.pop(webrtc_id, None)
        self.connection_timeouts.pop(webrtc_id, None)
        self.pcs.pop(webrtc_id, None)
        connection = self.connections.pop(webrtc_id, [])
        for conn in connection:
            if isinstance(conn, AudioCallback):
                if inspect.iscoroutinefunction(conn.event_handler.shutdown):
                    asyncio.create_task(conn.event_handler.shutdown())
                else:
                    conn.event_handler.shutdown()
                conn.event_handler.reset()
        output = self.additional_outputs.pop(webrtc_id, None)
        if output:
            output.quit.set()
        self.data_channels.pop(webrtc_id, None)
        return connection

    def set_input(self, webrtc_id: str, *args: Any) -> None:
        """Pushes the current values of the extra inputs into a live connection."""
        for conn in self.connections.get(webrtc_id, []):
            conn.set_args(list(args))

    def _output_setter(self, webrtc_id: str) -> Callable[[AdditionalOutputs], None]:
        def set_outputs(outputs: AdditionalOutputs) -> None:
            self.additional_outputs.setdefault(
                webrtc_id, OutputQueue()
            ).queue.put_nowait(outputs)

        return set_outputs

    async def output_stream(
        self, webrtc_id: str
    ) -> AsyncGenerator[AdditionalOutputs, None]:
        """
        Yields the additional outputs of a connection until it closes. Outputs
        queued before the connection closed are still delivered.
        """
        outputs = self.additional_outputs.get(webrtc_id)
        if outputs is None:
            return
        while True:
            try:
                yield outputs.queue.get_nowait()
                continue
            except asyncio.QueueEmpty:
                pass
            if outputs.quit.is_set():
                return
            try:
                yield await asyncio.wait_for(outputs.queue.get(), 0.1)
            except (asyncio.TimeoutError, TimeoutError):
                continue

    def stop_outputs(self, webrtc_id: str) -> None:
        output = self.additional_outputs.get(webrtc_id)
        if output:
            output.quit.set()

    async def handle_offer(self, body: dict[str, Any]) -> dict[str, Any]:
        """
        Handles one signalling message from the client: an SDP offer, which
        creates the peer connection and returns the answer, or a trickled ICE
        candidate for an existing connection.
        """
        if body.get("type") == "ice-candidate" and "candidate" in body:
            return await self._add_ice_candidate(body)

        webrtc_id = body.get("webrtc_id")
        if not webrtc_id or "sdp" not in body:
            return _failed("invalid_offer")
        if webrtc_id in self.pcs:
            return _failed("connection_already_exists")
        if (
            self.concurrency_limit is not None
            and len(self.pcs) >= self.concurrency_limit
        ):
            return _failed("concurrency_limit_reached", limit=self.concurrency_limit)

        offer = RTCSessionDescription(sdp=body["sdp"], type=body["type"])
        pc = RTCPeerConnection(configuration=self.server_rtc_configuration)
        self.pcs[webrtc_id] = pc
        handler = instantiate_handler(self.handler)
        self.handlers[webrtc_id] = handler
        set_outputs = self._output_setter(webrtc_id)
        context = Context(webrtc_id=webrtc_id)
        rejected: list[str] = []

        @pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            logger.debug("ICE connection state change %s", pc.iceConnectionState)
            if pc.iceConnectionState == "failed":
                await pc.close()
                self.connections.pop(webrtc_id, None)
                self.pcs.pop(webrtc_id, None)

        @pc.on("connectionstatechange")
        async def on_connectionstatechange():
            logger.debug("pc.connectionState %s", pc.connectionState)
            if pc.connectionState in ["failed", "closed"]:
                await pc.close()
                for conn in self.clean_up(webrtc_id):
                    conn.stop()
                self.pcs.pop(webrtc_id, None)
            if pc.connectionState == "connected":
                self.connection_timeouts[webrtc_id].set()
                if self.time_limit is not None:
                    asyncio.create_task(self.wait_for_time_limit(pc, self.time_limit))

        @pc.on("track")
        def on_track(track):
            relay = MediaRelay()
            cb: Track
            if self.modality == "video" and track.kind == "video":
                callback = handler
                extra: dict[str, Any] = {}
                if isinstance(handler, VideoStreamHandler):
                    callback = handler.callable
                    extra = {"fps": handler.fps, "skip_frames": handler.skip_frames}
                cb = VideoCallback(
                    relay.subscribe(track),
                    event_handler=cast(Callable, callback),
                    set_additional_outputs=set_outputs,
                    mode=cast(Literal["send", "send-receive"], self.mode),
                    context=context,
                    **extra,
                )
            elif self.modality == "audio-video" and track.kind == "video":
                av_handler = cast(AudioVideoStreamHandlerImpl, handler)
                cb = HandlerVideoTrack(
                    relay.subscribe(track),
                    event_handler=cast(Callable, av_handler),
                    set_additional_outputs=set_outputs,
                    fps=av_handler.fps,
                    context=context,
                )
            elif self.modality in ["audio", "audio-video"] and track.kind == "audio":
                audio_handler = cast(StreamHandlerImpl, handler)
                audio_handler._loop = asyncio.get_running_loop()
                cb = AudioCallback(
                    relay.subscribe(track),
                    event_handler=audio_handler,
                    set_additional_outputs=set_outputs,
                    context=context,
                )
            else:
                if self.allow_extra_tracks:
                    return
                rejected.append(
                    f"Unsupported track kind '{track.kind}' for modality '{self.modality}'"
                )
                return

            self.connections[webrtc_id].append(cb)
            if webrtc_id in self.data_channels:
                for conn in self.connections[webrtc_id]:
                    conn.set_channel(self.data_channels[webrtc_id])
            if self.mode == "send-receive":
                pc.addTrack(cb)
            elif self.mode == "send":
                asyncio.create_task(cb.start())

        if self.mode == "receive":
            cb: Track
            if self.modality == "video":
                if isinstance(handler, VideoStreamHandler):
                    cb = ServerToClientVideo(
                        cast(Callable, handler.callable),
                        set_additional_outputs=set_outputs,
                        fps=handler.fps,
                        context=context,
                    )
                else:
                    cb = ServerToClientVideo(
                        cast(Callable, handler),
                        set_additional_outputs=set_outputs,
                        context=context,
                    )
            else:
                cb = ServerToClientAudio(
                    cast(Callable, handler),
                    set_additional_outputs=set_outputs,
                    context=context,
                )
            pc.addTrack(cb)
            self.connections[webrtc_id].append(cb)
            cb.on("ended", lambda: self.clean_up(webrtc_id))

        @pc.on("datachannel")
        def on_datachannel(channel):
            logger.debug("Data channel established: %s", channel.label)
            self.data_channels[webrtc_id] = channel

            async def set_channel():
                while not self.connections.get(webrtc_id):
                    if webrtc_id not in self.pcs:
                        return
                    await asyncio.sleep(0.05)
                for conn in self.connections[webrtc_id]:
                    conn.set_channel(channel)

            asyncio.create_task(set_channel())

        await pc.setRemoteDescription(offer)
        if rejected:
            await pc.close()
            self.clean_up(webrtc_id)
            return _failed("unsupported_track", message=rejected[0])

        asyncio.create_task(self.connection_timeout(pc, webrtc_id, CONNECT_TIMEOUT))
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        return {
            "sdp": pc.localDescription.sdp,
            "type": pc.localDescription.type,
            "time_limit": self.time_limit,
        }

    async def _add_ice_candidate(self, body: dict[str, Any]) -> dict[str, Any]:
        webrtc_id = body.get("webrtc_id")
        pc = self.pcs.get(cast(str, webrtc_id))
        if pc is None:
            logger.warning(
                "Received ICE candidate for unknown connection: %s", webrtc_id
            )
            return _failed("unknown_connection")
        if pc.connectionState == "closed":
            return _failed("connection_closed")
        try:
            candidate = _parse_ice_candidate(body["candidate"])
            if candidate is None:
                logger.error("Invalid candidate format: %s", body["candidate"])
                return _failed("invalid_candidate_format")
            await pc.addIceCandidate(candidate)
            return {"status": "success"}
        except Exception as e:
            logger.error("Error adding ICE candidate: %s", e, exc_info=True)
            return _failed(str(e))


_managers: dict[int, ConnectionManager] = {}


def register_manager(component_id: int, **kwargs: Any) -> ConnectionManager:
    manager = ConnectionManager(**kwargs)
    _managers[component_id] = manager
    return manager


def get_manager(component_id: int) -> ConnectionManager | None:
    return _managers.get(component_id)
