"""Server side of gr.WebRTC connections: signalling, peer connections and the
per-connection handler, track and output bookkeeping.

One `ConnectionManager` exists per `WebRTC.stream()` call, held by the stream's
queue event. It is not kept on the component, because Gradio copies components
into each session and every copy has to see the same connections.

Each stream is one event in Gradio's queue, from the moment the user starts it
until it ends. The event waits in line like any other, which is what limits the
number of simultaneous streams. Once the event runs, its first call admits the
stream's id with the event's manager, and only then is an offer with that id
accepted. Signalling and input updates find the manager by the stream's id, not
by component id: a component that @gr.render keys keeps its id across sessions
and renders, so the id alone could lead to another session's handler. The media
never goes through the queue: the event is only woken up to deliver
`AdditionalOutputs` to the other output components, and ends when the peer
connection does.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
import math
import time
import weakref
from collections import Counter, OrderedDict, defaultdict, deque
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
from aiortc.mediastreams import MediaStreamError
from aiortc.sdp import candidate_from_sdp

from gradio.context import LocalContext
from gradio.exceptions import Error
from gradio.utils import error_payload
from gradio.webrtc.bitrate import add_bitrate_hints, limit_video_encoders
from gradio.webrtc.handlers import (
    AsyncVideoStreamHandler,
    AudioVideoStreamHandlerImpl,
    HandlerType,
    StreamHandlerBase,
    StreamHandlerImpl,
    VideoOptions,
    VideoStreamHandler,
)
from gradio.webrtc.tracks import (
    AudioCallback,
    HandlerVideoTrack,
    ServerToClientAudio,
    ServerToClientVideo,
    Track,
    VideoCallback,
    run_in_thread,
)
from gradio.webrtc.utils import (
    AdditionalOutputs,
    Context,
    HandlerFailedError,
    StreamNotifier,
    bind_special_args,
    webrtc_error_handler,
)

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
# The queue ends a stream event that is not woken up within 30 seconds, or
# within its time limit
KEEPALIVE_INTERVAL = 10
WATCH_INTERVAL = 0.25
MAX_PENDING_OUTPUTS = 64
MAX_PENDING_CANDIDATES = 32
MAX_PENDING_CANDIDATE_IDS = 256
# Seconds a new stream waits for the handlers of ended streams to shut down
SHUTDOWN_WAIT = 5

# The stream each queue event admitted. Weak, so that an event is forgotten
# once the queue drops it; module-level, so that it outlives a manager that
# a reload replaces.
_admitted: weakref.WeakKeyDictionary[Event, str] = weakref.WeakKeyDictionary()


def admitted_id(event: Event) -> str | None:
    return _admitted.get(event)


# The manager of each admitted stream, by stream id. Weak, like `_managers`.
_streams: weakref.WeakValueDictionary[str, ConnectionManager] = (
    weakref.WeakValueDictionary()
)
# Set when a stream is admitted, for an offer that arrives just before
_admissions: defaultdict[str, asyncio.Event] = defaultdict(asyncio.Event)
_admission_waiters: Counter[str] = Counter()
# ICE candidates of an admitted stream that arrive before its peer connection
# exists, while the offer is still on its way. Each is kept with the session
# that sent it. MAX_PENDING_CANDIDATE_IDS bounds it for the whole app, not per
# component.
_pending_candidates: OrderedDict[str, list[tuple[str | None, RTCIceCandidate]]] = (
    OrderedDict()
)


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
    notifier: StreamNotifier | None = None
    # The page's rtc_configuration, resolved once per stream
    rtc_configuration: asyncio.Future | None = None

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


def instantiate_handler(handler: HandlerType, request: Any = None) -> HandlerType:
    """
    Returns the handler object for a new connection: a new instance when a
    handler class was given, a copy when an instance was given, and the
    callable itself otherwise. Handler methods are wrapped so that exceptions
    reach the client as errors. Functions, and `start_up()` of handler
    classes, can take `gr.Request`, `gr.OAuthProfile` and `gr.OAuthToken`
    parameters like event listeners; `request` is the visitor's.
    """
    instance: StreamHandlerImpl
    if inspect.isclass(handler) and issubclass(handler, StreamHandlerBase):
        instance = cast(StreamHandlerImpl, handler())
    elif isinstance(handler, StreamHandlerBase):
        instance = cast(StreamHandlerImpl, handler).copy()
    elif isinstance(handler, VideoOptions):
        return VideoOptions(
            callable=webrtc_error_handler(bind_special_args(handler.callable, request)),
            fps=handler.fps,
            skip_frames=handler.skip_frames,
        )
    else:
        return webrtc_error_handler(bind_special_args(cast(Callable, handler), request))
    cast(Any, instance).start_up = bind_special_args(instance.start_up, request)
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


def _concurrency_limit(session: Session) -> int | None:
    """How many streams of this kind the queue runs at once."""
    group = session.queue.event_queue_per_concurrency_id.get(
        session.event.concurrency_id
    )
    return group.concurrency_limit if group is not None else None


def _parse_ice_candidate(candidate: dict[str, Any]) -> RTCIceCandidate | None:
    # Example: "candidate:2393089663 1 udp 2122260223 192.168.86.60 63692 typ host ..."
    line = candidate.get("candidate", "")
    if not line.startswith("candidate:"):
        return None
    sdp = line.split(":", 1)[1]
    parts = sdp.split()
    if len(parts) < 8 or parts[6] != "typ":
        return None
    try:
        parsed = candidate_from_sdp(sdp)
    except ValueError:
        return None
    parsed.sdpMid = candidate.get("sdpMid")
    parsed.sdpMLineIndex = candidate.get("sdpMLineIndex")
    return parsed


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
        video_bitrate: dict[str, int] | None = None,
    ) -> None:
        self.handler = handler
        self.mode = mode
        self.modality = modality
        self.time_limit = time_limit
        self.allow_extra_tracks = allow_extra_tracks
        self.server_rtc_configuration = to_rtc_configuration(server_rtc_configuration)
        self.video_bitrate = video_bitrate
        self.sessions: dict[str, Session] = {}
        self.pcs: dict[str, RTCPeerConnection] = {}
        self.connections: dict[str, list[Track]] = defaultdict(list)
        self.data_channels: dict[str, Any] = {}
        self.tasks: set[asyncio.Task] = set()
        self.shutdowns: set[asyncio.Task] = set()

    def admit(self, webrtc_id: str, event: Event, queue: Queue) -> bool:
        """
        Lets a stream in. Called by the first call of the stream's queue event,
        that is, once the stream's turn has come. An event admits one stream,
        and a stream id is admitted once: returns False when another event
        already holds the id.
        """
        session = self.sessions.get(webrtc_id)
        if session is not None:
            return session.event is event
        other = _streams.get(webrtc_id)
        if other is not None and webrtc_id in other.sessions:
            return False
        _admitted[event] = webrtc_id
        # The watcher keeps the time limit, from admission, and ends the stream
        # through `end`. The queue's own cut would end the event before its
        # last calls deliver what is pending.
        event.run_time = -math.inf
        _streams[webrtc_id] = self
        session = Session(event=event, queue=queue)
        self.sessions[webrtc_id] = session
        session.watcher = self._spawn(self._watch(webrtc_id, session))
        _admissions[webrtc_id].set()
        return True

    @staticmethod
    async def _drain(track: AudioCallback) -> None:
        """
        Runs an audio handler whose output nobody plays (mode="send"): its
        output still has to be read, or CloseStream never takes effect and
        the frames pile up.
        """
        while track.readyState != "ended":
            try:
                await track.recv()
            except (HandlerFailedError, MediaStreamError):
                # A failed handler has already ended the stream
                return

    def _spawn(self, coroutine: Any) -> asyncio.Task:
        # The event loop keeps only weak references to tasks
        task = asyncio.create_task(coroutine)
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)
        return task

    async def _watch(self, webrtc_id: str, session: Session) -> None:
        """
        Keeps the stream's queue event and its peer connection in step for the
        life of the stream: ends the stream at the time limit or when it does
        not connect in time, keeps the event awake while the stream runs, and
        closes the connection once the event is over, however it ended.
        """
        keepalive = KEEPALIVE_INTERVAL
        if self.time_limit is not None:
            keepalive = min(keepalive, self.time_limit / 2)
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
                elif now - session.last_signal >= keepalive:
                    session.wake()
        finally:
            pc = self.pcs.get(webrtc_id)
            if pc is not None:
                await pc.close()
            self.clean_up(webrtc_id)
            if self.sessions.get(webrtc_id) is session:
                del self.sessions[webrtc_id]
                if _streams.get(webrtc_id) is self:
                    del _streams[webrtc_id]
            _admissions.pop(webrtc_id, None)

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
        if session.notifier is not None:
            session.notifier.close()
        session.wake()

    def _close_connection(self, webrtc_id: str) -> None:
        pc = self.pcs.get(webrtc_id)
        if pc is not None and pc.connectionState != "closed":
            self._spawn(pc.close())

    def take_outputs(self, webrtc_id: str) -> AdditionalOutputs | None:
        session = self.sessions.get(webrtc_id)
        if session is None or not session.outputs:
            return None
        outputs = session.outputs.popleft()
        if session.outputs:
            # One call delivers one set of outputs; come back for the rest
            session.wake()
        return outputs

    def finish_if_drained(
        self, webrtc_id: str, delivered: bool
    ) -> dict[str, Any] | None:
        """
        Lets the queue event of an ended stream finish once its outputs are
        delivered. Called at the end of each of the event's calls, `delivered`
        saying whether the call delivers outputs. Returns the handler's error
        (see `StreamNotifier.fail`) for the call that finishes the event of a
        stream whose handler failed, which delivers nothing.
        """
        session = self.sessions.get(webrtc_id)
        if session is None or not session.ended or session.outputs:
            return None
        failure = session.notifier.failure if session.notifier else None
        if failure is not None and delivered:
            # The next call reports the error
            session.wake()
            return None
        session.event.closed = True
        return failure

    def clean_up(self, webrtc_id: str) -> None:
        """
        Releases everything a connection holds: stops its tracks, shuts its
        handler down and ends the stream. Whichever path notices the end first
        does the work; later calls find nothing left.
        """
        # Close before letting go: a track that ended (a receive-mode
        # generator ran out) leaves the connection open otherwise
        self._close_connection(webrtc_id)
        self.pcs.pop(webrtc_id, None)
        connection = self.connections.pop(webrtc_id, [])
        self.data_channels.pop(webrtc_id, None)
        _pending_candidates.pop(webrtc_id, None)
        try:
            for conn in connection:
                # Stopping a track ends its loops; its "ended" event calls
                # this again, which then finds the id already released
                conn.stop()
                if isinstance(conn, ServerToClientAudio | ServerToClientVideo):
                    self._add_shutdown(conn.close_generator())
            # Handler classes, once each: both tracks of an audio-video
            # connection share one handler
            handlers = {
                id(conn.event_handler): conn.event_handler
                for conn in connection
                if isinstance(conn, AudioCallback | HandlerVideoTrack)
                and isinstance(conn.event_handler, StreamHandlerBase)
            }
            for handler in handlers.values():
                # A handler blocked in wait_for_args() would wait forever
                handler.args_set.set()
                self._add_shutdown(self._shut_down(handler))
        finally:
            self.end(webrtc_id)

    def _add_shutdown(self, coroutine: Any) -> None:
        # The next stream waits for it (see `_wait_for_shutdowns`)
        shutdown = self._spawn(coroutine)
        self.shutdowns.add(shutdown)
        shutdown.add_done_callback(self.shutdowns.discard)

    @staticmethod
    async def _shut_down(handler: StreamHandlerBase) -> None:
        # A sync shutdown() runs in a worker thread like the handler's other
        # methods: it may join a worker or wait for a queue to drain
        try:
            if inspect.iscoroutinefunction(handler.shutdown):
                # Declared sync on the base class; a subclass may make it async
                await cast(Any, handler).shutdown()
            else:
                await run_in_thread(handler.shutdown)
        except Exception:
            # The handler's own clean-up must not keep the stream going
            logger.exception("Stream handler shutdown() failed")
        handler.reset()

    def owns(self, webrtc_id: str, session_hash: str | None) -> bool:
        """
        Whether the stream was admitted for this browser session. A stream id
        travels in signalling and input messages, so only the session whose
        queue event admitted it may connect to it or feed it.
        """
        session = self.sessions.get(webrtc_id)
        return (
            session is not None
            and session_hash is not None
            and session.event.session_hash == session_hash
        )

    def set_input(self, webrtc_id: str, session_hash: str | None, *args: Any) -> None:
        """Pushes the current values of the extra inputs into a live connection."""
        if not self.owns(webrtc_id, session_hash):
            return
        for conn in self.connections.get(webrtc_id, []):
            conn.set_args(list(args))

    def _output_setter(self, webrtc_id: str) -> Callable[[AdditionalOutputs], None]:
        def set_outputs(outputs: AdditionalOutputs) -> None:
            session = self.sessions.get(webrtc_id)
            if session is not None:
                session.outputs.append(outputs)
                session.wake()

        return set_outputs

    async def handle_offer(
        self, webrtc_id: str, body: dict[str, Any], request: Any = None
    ) -> dict[str, Any]:
        """
        Creates the peer connection of an admitted stream from the client's SDP
        offer and returns the answer. `request` is the visitor's `gr.Request`,
        for the handler's special parameters. If the connection cannot be set
        up, for example because the handler class cannot be created, the
        stream ends and the error is returned for the page to show.
        """
        session_hash = getattr(request, "session_hash", None)
        # The queue frees an ended stream's place before its handler has shut
        # down. With concurrency_limit=1, a model that each handler loads must
        # not be in memory twice, so the next handler waits.
        session = self.sessions.get(webrtc_id)
        if session is not None and _concurrency_limit(session) == 1:
            await self._wait_for_shutdowns()
        session = self.sessions.get(webrtc_id)
        if session is None or session.ended or not self.owns(webrtc_id, session_hash):
            return _failed("not_admitted")
        # Another offer for the same id may have waited for the admission too.
        # Nothing awaits between this check and claiming the id below.
        if webrtc_id in self.pcs:
            return _failed("connection_already_exists")

        # The handler's tasks and threads are all started from here, so they
        # inherit it: errors, gr.Warning and gr.Info reach this stream's page
        blocks = LocalContext.blocks.get(None)
        show_error = bool(blocks and blocks.show_error)
        notifier = StreamNotifier(
            asyncio.get_running_loop(),
            end_stream=lambda: self.end(webrtc_id),
            show_error=show_error,
        )
        LocalContext.stream_notifier.set(notifier)
        session.notifier = notifier
        pc = RTCPeerConnection(configuration=self.server_rtc_configuration)
        self.pcs[webrtc_id] = pc
        try:
            return await self._connect(webrtc_id, session, pc, body, request, notifier)
        except Exception as e:
            if not isinstance(e, Error):
                logger.exception("Could not set up the stream")
            await pc.close()
            payload = error_payload(e, show_error)
            # The page shows the error from the answer; the event fails too
            notifier.failure = payload
            self.clean_up(webrtc_id)
            return _failed(
                "setup_failed", message=payload["error"] or "An error occurred."
            )

    async def _wait_for_shutdowns(self) -> None:
        pending = [task for task in self.shutdowns if not task.done()]
        if not pending:
            return
        _, still_running = await asyncio.wait(pending, timeout=SHUTDOWN_WAIT)
        if still_running:
            logger.warning(
                "A stream handler's shutdown() is still running after %s s; "
                "starting the next stream anyway",
                SHUTDOWN_WAIT,
            )

    async def _connect(
        self,
        webrtc_id: str,
        session: Session,
        pc: RTCPeerConnection,
        body: dict[str, Any],
        request: Any,
        notifier: StreamNotifier,
    ) -> dict[str, Any]:
        session_hash = getattr(request, "session_hash", None)
        offer = RTCSessionDescription(sdp=body["sdp"], type=body["type"])
        handler = instantiate_handler(self.handler, request)
        set_outputs = self._output_setter(webrtc_id)
        context = Context(webrtc_id=webrtc_id)
        # Whether the webcam preview is mirrored on the client
        mirror = body.get("mirror") is True
        rejected: list[str] = []

        @pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            logger.debug("ICE connection state change %s", pc.iceConnectionState)
            if pc.iceConnectionState == "failed":
                await pc.close()
                self.clean_up(webrtc_id)

        @pc.on("connectionstatechange")
        async def on_connectionstatechange():
            logger.debug("pc.connectionState %s", pc.connectionState)
            if pc.connectionState in ["failed", "closed"]:
                await pc.close()
                self.clean_up(webrtc_id)
            if pc.connectionState == "connected" and self.sessions.get(webrtc_id) is (
                session
            ):
                session.connected = True

        @pc.on("track")
        def on_track(track):
            relay = MediaRelay()
            cb: Track
            if (
                self.modality == "video"
                and track.kind == "video"
                and isinstance(handler, VideoStreamHandler | AsyncVideoStreamHandler)
            ):
                handler._loop = asyncio.get_running_loop()
                cb = HandlerVideoTrack(
                    relay.subscribe(track),
                    event_handler=cast(Callable, handler),
                    set_additional_outputs=set_outputs,
                    fps=handler.fps,
                    context=context,
                    mirror=mirror,
                )
            elif self.modality == "video" and track.kind == "video":
                callback = handler
                extra: dict[str, Any] = {}
                if isinstance(handler, VideoOptions):
                    callback = handler.callable
                    extra = {"fps": handler.fps, "skip_frames": handler.skip_frames}
                cb = VideoCallback(
                    relay.subscribe(track),
                    event_handler=cast(Callable, callback),
                    set_additional_outputs=set_outputs,
                    mode=cast(Literal["send", "send-receive"], self.mode),
                    context=context,
                    mirror=mirror,
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
                    mirror=mirror,
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
            # A handler that returns CloseStream stops its track: end the
            # stream here, whether or not the browser reacts to "end_stream"
            cb.on("ended", lambda: self.clean_up(webrtc_id))
            if webrtc_id in self.data_channels:
                for conn in self.connections[webrtc_id]:
                    conn.set_channel(self.data_channels[webrtc_id])
            if self.mode == "send-receive":
                pc.addTrack(cb)
            elif self.mode == "send" and isinstance(cb, AudioCallback):
                self._spawn(self._drain(cb))
            elif self.mode == "send":
                self._spawn(cb.start())

        if self.mode == "receive":
            cb: Track
            if self.modality == "video":
                if isinstance(handler, VideoOptions):
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
            notifier.set_channel(channel)

            async def set_channel():
                while not self.connections.get(webrtc_id):
                    if webrtc_id not in self.pcs:
                        return
                    await asyncio.sleep(0.05)
                for conn in self.connections[webrtc_id]:
                    conn.set_channel(channel)

            self._spawn(set_channel())

        await pc.setRemoteDescription(offer)
        if rejected:
            await pc.close()
            self.clean_up(webrtc_id)
            return _failed("unsupported_track", message=rejected[0])
        for sender, candidate in _pending_candidates.pop(webrtc_id, []):
            if sender != session_hash:
                continue
            try:
                await pc.addIceCandidate(candidate)
            except Exception as e:
                logger.error("Error adding ICE candidate: %s", e, exc_info=True)

        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        sdp = pc.localDescription.sdp
        if self.video_bitrate:
            limit_video_encoders(pc, self.video_bitrate)
            sdp = add_bitrate_hints(sdp, self.video_bitrate)
        return {
            "sdp": sdp,
            "type": pc.localDescription.type,
            # Counted from the stream's admission, so the browser can show
            # what is left of it
            "time_limit": session.remaining_time(self.time_limit),
        }


async def handle_signal(body: dict[str, Any], request: Any = None) -> dict[str, Any]:
    """
    Handles one signalling message from the client: an SDP offer, which
    creates the peer connection and returns the answer, or a trickled ICE
    candidate. Both go to the manager that admitted the stream.
    """
    if body.get("type") == "ice-candidate" and "candidate" in body:
        return await _add_ice_candidate(body, getattr(request, "session_hash", None))
    webrtc_id = body.get("webrtc_id")
    if not webrtc_id or "sdp" not in body:
        return _failed("invalid_offer")
    manager = _streams.get(webrtc_id)
    if manager is not None and webrtc_id in manager.pcs:
        return _failed("connection_already_exists")
    manager = await _wait_for_admission(webrtc_id)
    if manager is None:
        return _failed("not_admitted")
    return await manager.handle_offer(webrtc_id, body, request)


async def _wait_for_admission(webrtc_id: str) -> ConnectionManager | None:
    if webrtc_id not in _streams:
        _admission_waiters[webrtc_id] += 1
        try:
            await asyncio.wait_for(_admissions[webrtc_id].wait(), ADMISSION_WAIT)
        except TimeoutError:
            pass
        finally:
            _admission_waiters[webrtc_id] -= 1
            # The others waiting for the same stream share its event
            if not _admission_waiters[webrtc_id]:
                del _admission_waiters[webrtc_id]
                if webrtc_id not in _streams:
                    _admissions.pop(webrtc_id, None)
                    _pending_candidates.pop(webrtc_id, None)
    return _streams.get(webrtc_id)


async def _add_ice_candidate(
    body: dict[str, Any], session_hash: str | None
) -> dict[str, Any]:
    webrtc_id = body.get("webrtc_id")
    if not webrtc_id:
        return _failed("unknown_connection")
    manager = _streams.get(webrtc_id)
    # The page makes its connection only after the stream's turn, so a
    # candidate for a stream not admitted for this session is not kept
    if manager is None or not manager.owns(webrtc_id, session_hash):
        return _failed("unknown_connection")
    pc = manager.pcs.get(webrtc_id)
    if pc is not None and pc.connectionState == "closed":
        return _failed("connection_closed")
    try:
        candidate = _parse_ice_candidate(body["candidate"])
        if candidate is None:
            logger.error("Invalid candidate format: %s", body["candidate"])
            return _failed("invalid_candidate_format")
        if pc is None:
            # Kept until the offer creates the connection, within bounds
            pending = _pending_candidates.setdefault(webrtc_id, [])
            if len(pending) < MAX_PENDING_CANDIDATES:
                pending.append((session_hash, candidate))
            while len(_pending_candidates) > MAX_PENDING_CANDIDATE_IDS:
                _pending_candidates.popitem(last=False)
            return {"status": "success"}
        await pc.addIceCandidate(candidate)
        return {"status": "success"}
    except Exception as e:
        logger.error("Error adding ICE candidate: %s", e, exc_info=True)
        return _failed(str(e))


def stream_manager(webrtc_id: str) -> ConnectionManager | None:
    """The manager that admitted the stream, if it is still running."""
    return _streams.get(webrtc_id)


def end_admitted_stream(event: Event) -> bool:
    """
    Ends the stream that the queue event admitted, for a page that closes it:
    the event then delivers the outputs still pending and fails if the handler
    did (see `finish_if_drained`). False if the event has no running stream.
    """
    webrtc_id = admitted_id(event)
    if webrtc_id is None:
        return False
    manager = stream_manager(webrtc_id)
    session = manager.sessions.get(webrtc_id) if manager is not None else None
    if manager is None or session is None or session.event is not event:
        return False
    manager.end(webrtc_id)
    return True


async def stream_admitted(
    webrtc_id: str | None, session_hash: str | None, component_id: int
) -> Session | None:
    """
    The stream, if its turn has come in the line of this component, has not
    ended, and belongs to this browser session. Waits a little for an admission that is
    just under way.
    """
    if not webrtc_id:
        return None
    manager = await _wait_for_admission(webrtc_id)
    if manager is None or not manager.owns(webrtc_id, session_hash):
        return None
    session = manager.sessions[webrtc_id]
    if session.ended:
        return None
    targets = [tuple(target) for target in session.event.fn.targets]
    return session if (component_id, "stream") in targets else None


def set_input(webrtc_id: str, session_hash: str | None, *args: Any) -> None:
    """Pushes the current values of the extra inputs into a live stream."""
    manager = _streams.get(webrtc_id)
    if manager is not None:
        manager.set_input(webrtc_id, session_hash, *args)


# The manager registered for each component id, which the component's config
# reads (its time limit, whether it has a stream). Streams themselves go by
# `_streams`. Weak, so that a manager goes away with the event that streams
# through it: the event's function holds it (see `WebRTC.stream()`). A
# component created by @gr.render or replaced by a reload thus does not keep
# its handler alive.
_managers: weakref.WeakValueDictionary[int, ConnectionManager] = (
    weakref.WeakValueDictionary()
)


def register_manager(component_id: int, **kwargs: Any) -> ConnectionManager:
    manager = ConnectionManager(**kwargs)
    _managers[component_id] = manager
    return manager


def get_manager(component_id: int) -> ConnectionManager | None:
    return _managers.get(component_id)
