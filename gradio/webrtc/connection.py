"""Server side of gr.WebRTC connections: signalling, peer connections and the
per-connection handler, track and output bookkeeping.

One `ConnectionManager` exists per `gr.WebRTC` component that has a stream
handler. It is looked up by component id, not kept on the component, because
Gradio deep-copies components into each session and every copy has to see the
same connections.

Each stream is one event in Gradio's queue, from the moment the user starts it
until it ends. The event waits in line like any other, which is what limits the
number of simultaneous streams. Once the event runs, its first call admits the
stream's id here, and only then is an offer with that id accepted. The media
never goes through the queue: the event is only woken up to deliver
`AdditionalOutputs` to the other output components, and ends when the peer
connection does.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
import time
import weakref
from collections import defaultdict, deque
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any, Literal, cast

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

if TYPE_CHECKING:
    from gradio.queueing import Event, Queue

logger = logging.getLogger(__name__)

Mode = Literal["send-receive", "receive", "send"]
Modality = Literal["video", "audio", "audio-video"]

# Seconds an admitted stream has to connect before its turn is given up
CONNECT_TIMEOUT = 30
# Seconds an offer waits for its stream to be admitted. The browser learns that
# its turn has come just before the event's first call admits the stream.
ADMISSION_WAIT = 5
# The queue ends a stream event that is not woken up within 30 seconds
KEEPALIVE_INTERVAL = 10
WATCH_INTERVAL = 0.25
MAX_PENDING_OUTPUTS = 64

# The stream each queue event admitted. Weak, so that an event is forgotten
# once the queue drops it; module-level, so that it outlives a manager that
# a reload replaces.
_admitted: weakref.WeakKeyDictionary[Event, str] = weakref.WeakKeyDictionary()


def admitted_id(event: Event) -> str | None:
    return _admitted.get(event)


@dataclass
class Session:
    """A stream that the queue has let in."""

    event: Event
    queue: Queue
    admitted_at: float = field(default_factory=time.monotonic)
    last_signal: float = field(default_factory=time.monotonic)
    # AdditionalOutputs not delivered yet, oldest first. A handler that emits
    # faster than the outputs can be delivered loses the oldest ones.
    outputs: deque[AdditionalOutputs] = field(
        default_factory=lambda: deque(maxlen=MAX_PENDING_OUTPUTS)
    )
    connected: bool = False
    ended: bool = False
    watcher: asyncio.Task | None = None

    def wake(self) -> None:
        self.last_signal = time.monotonic()
        self.event.signal.set()

    def remaining_time(self, time_limit: float | None) -> float | None:
        if time_limit is None:
            return None
        return max(0.0, time_limit - (time.monotonic() - self.admitted_at))


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
        time_limit: float | None,
        allow_extra_tracks: bool,
        server_rtc_configuration: dict[str, Any] | None,
    ) -> None:
        self.handler = handler
        self.mode = mode
        self.modality = modality
        self.time_limit = time_limit
        self.allow_extra_tracks = allow_extra_tracks
        self.server_rtc_configuration = to_rtc_configuration(server_rtc_configuration)
        self.sessions: dict[str, Session] = {}
        self.admissions: dict[str, asyncio.Event] = defaultdict(asyncio.Event)
        self.pcs: dict[str, RTCPeerConnection] = {}
        self.connections: dict[str, list[Track]] = defaultdict(list)
        self.data_channels: dict[str, Any] = {}
        self.handlers: dict[str, HandlerType] = {}

    def admit(self, webrtc_id: str, event: Event, queue: Queue) -> None:
        """
        Lets a stream in. Called by the first call of the stream's queue event,
        that is, once the stream's turn has come. An event admits one stream,
        and a stream id is admitted once.
        """
        _admitted[event] = webrtc_id
        if webrtc_id in self.sessions:
            return
        session = Session(event=event, queue=queue)
        self.sessions[webrtc_id] = session
        session.watcher = asyncio.create_task(self._watch(webrtc_id, session))
        self.admissions[webrtc_id].set()

    async def _watch(self, webrtc_id: str, session: Session) -> None:
        """
        Keeps the stream's queue event and its peer connection in step for the
        life of the stream: ends the stream at the time limit or when it does
        not connect in time, keeps the event awake while the stream runs, and
        closes the connection once the event is over, however it ended.
        """
        try:
            while True:
                await asyncio.sleep(WATCH_INTERVAL)
                event = session.event
                if (
                    event._id not in session.queue.event_ids_to_events
                    or not event.alive
                ):
                    return
                if session.ended:
                    # The event still has to make its last call
                    continue
                now = time.monotonic()
                timed_out = session.remaining_time(self.time_limit) == 0
                never_connected = (
                    not session.connected
                    and now - session.admitted_at > CONNECT_TIMEOUT
                )
                if timed_out or never_connected:
                    self.end(webrtc_id)
                elif now - session.last_signal >= KEEPALIVE_INTERVAL:
                    session.wake()
        finally:
            pc = self.pcs.get(webrtc_id)
            if pc is not None:
                await pc.close()
            for conn in self.clean_up(webrtc_id):
                conn.stop()
            if self.sessions.get(webrtc_id) is session:
                del self.sessions[webrtc_id]
            self.admissions.pop(webrtc_id, None)

    def end(self, webrtc_id: str) -> None:
        """
        Ends a stream. The media stops at once: closing the peer connection
        does not wait for the queue. The queue event then delivers the outputs
        still pending and finishes (see `take_outputs`), which needs a worker
        slot, so the stream's place in the concurrency limit is released only
        once one is free.
        """
        self._close_connection(webrtc_id)
        session = self.sessions.get(webrtc_id)
        if session is None or session.ended:
            return
        session.ended = True
        session.wake()

    def _close_connection(self, webrtc_id: str) -> None:
        pc = self.pcs.get(webrtc_id)
        if pc is not None and pc.connectionState != "closed":
            asyncio.create_task(pc.close())

    def take_outputs(self, webrtc_id: str) -> AdditionalOutputs | None:
        session = self.sessions.get(webrtc_id)
        if session is None or not session.outputs:
            return None
        outputs = session.outputs.popleft()
        if session.outputs:
            # One call delivers one set of outputs; come back for the rest
            session.wake()
        return outputs

    def finish_if_drained(self, webrtc_id: str) -> None:
        """
        Lets the queue event of an ended stream finish once its outputs are
        delivered. Called at the end of each of the event's calls.
        """
        session = self.sessions.get(webrtc_id)
        if session is not None and session.ended and not session.outputs:
            session.event.closed = True

    def clean_up(self, webrtc_id: str) -> list[Track]:
        self.handlers.pop(webrtc_id, None)
        # Close before letting go: a track that ended (a receive-mode
        # generator ran out) leaves the connection open otherwise
        self._close_connection(webrtc_id)
        self.pcs.pop(webrtc_id, None)
        connection = self.connections.pop(webrtc_id, [])
        for conn in connection:
            if isinstance(conn, AudioCallback):
                if inspect.iscoroutinefunction(conn.event_handler.shutdown):
                    asyncio.create_task(conn.event_handler.shutdown())
                else:
                    conn.event_handler.shutdown()
                conn.event_handler.reset()
        self.data_channels.pop(webrtc_id, None)
        self.end(webrtc_id)
        return connection

    def set_input(self, webrtc_id: str, *args: Any) -> None:
        """Pushes the current values of the extra inputs into a live connection."""
        for conn in self.connections.get(webrtc_id, []):
            conn.set_args(list(args))

    def _output_setter(self, webrtc_id: str) -> Callable[[AdditionalOutputs], None]:
        def set_outputs(outputs: AdditionalOutputs) -> None:
            session = self.sessions.get(webrtc_id)
            if session is not None:
                session.outputs.append(outputs)
                session.wake()

        return set_outputs

    async def _wait_for_admission(self, webrtc_id: str) -> Session | None:
        if webrtc_id not in self.sessions:
            try:
                await asyncio.wait_for(
                    self.admissions[webrtc_id].wait(), ADMISSION_WAIT
                )
            except (asyncio.TimeoutError, TimeoutError):
                self.admissions.pop(webrtc_id, None)
                return None
        return self.sessions.get(webrtc_id)

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
        session = await self._wait_for_admission(webrtc_id)
        if session is None or session.ended:
            return _failed("not_admitted")
        # Another offer for the same id may have waited for the admission too.
        # Nothing awaits between this check and claiming the id below.
        if webrtc_id in self.pcs:
            return _failed("connection_already_exists")

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
            if pc.connectionState == "connected" and self.sessions.get(webrtc_id) is (
                session
            ):
                session.connected = True

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

        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        return {
            "sdp": pc.localDescription.sdp,
            "type": pc.localDescription.type,
            # Counted from the stream's admission, so the browser can show
            # what is left of it
            "time_limit": session.remaining_time(self.time_limit),
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
