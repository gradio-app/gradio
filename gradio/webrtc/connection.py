"""Server side of WebRTC streams: admission, signalling, peer connections, and
the per-stream handler, tracks, inputs and outputs.

Each stream is one event in Gradio's queue, from the moment the user starts it
until it ends. The event waits in line like any other, which is what limits the
number of simultaneous streams. Once the event runs, its first call admits the
stream's id, and only then is an offer with that id accepted. The media never
goes through the queue: the event is only woken up to deliver
`AdditionalOutputs` to the other output components, and ends after the stream
does.

One `Stream` holds everything of one admitted stream (its place in the queue,
peer connection, tracks, handler, inputs, pending outputs and errors) and has
one way to end, `Stream.close()`, whichever path notices the end. The streams of
an app are kept in its `StreamRegistry`, one per queue: a hot reload keeps the
queue. Signalling and input updates find a stream there by its id, not by
component id: every session's copy of a component has the same id, so the id
alone could lead to another session's handler.

A `ConnectionManager` is what one `WebRTC.stream()` call or `Server.webrtc()`
endpoint configures: the handler, mode, modality and limits. It admits the
streams of its queue event and builds each one's peer connection from the
offer. It is not kept on the component, because Gradio copies components into
each session and every copy has to see the same streams.
"""

from __future__ import annotations

import asyncio
import enum
import inspect
import json
import logging
import time
import weakref
from collections import Counter, OrderedDict, deque
from collections.abc import AsyncGenerator, Callable
from typing import TYPE_CHECKING, Any, Literal, cast

import anyio
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
from gradio.helpers import special_args
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
    StreamErrors,
    StreamInputs,
    bind_special_args,
    current_errors,
    is_async,
    webrtc_error_handler,
)

if TYPE_CHECKING:
    from gradio.queueing import EventHandle

logger = logging.getLogger(__name__)

Mode = Literal["send-receive", "receive", "send"]
Modality = Literal["video", "audio", "audio-video"]

# Seconds an admitted stream has to connect before its turn is given up
CONNECT_TIMEOUT = 30
# Seconds an offer waits for its stream to be admitted. The browser learns that
# its turn has come just before the event's first call admits the stream.
ADMISSION_WAIT = 5
WATCH_INTERVAL = 0.25
MAX_PENDING_OUTPUTS = 64
MAX_PENDING_CANDIDATES = 128
MAX_PENDING_CANDIDATE_IDS = 256
# Seconds a new stream waits for the handlers of ended streams to shut down
SHUTDOWN_WAIT = 5


class StreamRegistry:
    """
    The admitted streams of one app, by stream id and by the id of the queue
    event that admitted each, and what arrives for a stream just before its
    admission (an offer) or its peer connection (ICE candidates).
    """

    def __init__(self) -> None:
        self.streams: dict[str, Stream] = {}
        # Kept until the stream's watcher ends, after the stream itself, so
        # that the event's next call finishes it instead of admitting again
        self.by_event: dict[str, Stream] = {}
        self._admissions: dict[str, asyncio.Event] = {}
        self._admission_waiters: Counter[str] = Counter()
        # ICE candidates of an admitted stream that arrive before its peer
        # connection exists, while the offer is still on its way. Each is kept
        # with the session that sent it. MAX_PENDING_CANDIDATE_IDS bounds it
        # for the whole app.
        self.pending_candidates: OrderedDict[
            str, list[tuple[str | None, RTCIceCandidate]]
        ] = OrderedDict()

    def add(self, stream: Stream) -> None:
        self.streams[stream.id] = stream
        self.by_event[stream.event.id] = stream
        admitted = self._admissions.get(stream.id)
        if admitted is not None:
            admitted.set()

    def remove(self, stream: Stream) -> None:
        if self.streams.get(stream.id) is stream:
            del self.streams[stream.id]
        if self.by_event.get(stream.event.id) is stream:
            del self.by_event[stream.event.id]
        self._admissions.pop(stream.id, None)

    def get(self, webrtc_id: Any) -> Stream | None:
        """The stream `webrtc_id`. Any value may come in from a client; only a
        string can name a stream."""
        return self.streams.get(webrtc_id) if isinstance(webrtc_id, str) else None

    async def wait_for_admission(self, webrtc_id: str) -> Stream | None:
        """The stream `webrtc_id`, waiting a little for an admission that is
        just under way."""
        if webrtc_id not in self.streams:
            admitted = self._admissions.setdefault(webrtc_id, asyncio.Event())
            self._admission_waiters[webrtc_id] += 1
            try:
                await asyncio.wait_for(admitted.wait(), ADMISSION_WAIT)
            except TimeoutError:
                pass
            finally:
                self._admission_waiters[webrtc_id] -= 1
                # The others waiting for the same stream share its event
                if not self._admission_waiters[webrtc_id]:
                    del self._admission_waiters[webrtc_id]
                    if webrtc_id not in self.streams:
                        self._admissions.pop(webrtc_id, None)
                        self.pending_candidates.pop(webrtc_id, None)
        return self.streams.get(webrtc_id)

    def keep_candidate(
        self, webrtc_id: str, session_hash: str | None, candidate: RTCIceCandidate
    ) -> None:
        """Keeps a candidate until the offer creates the connection, within
        bounds."""
        pending = self.pending_candidates.setdefault(webrtc_id, [])
        if len(pending) < MAX_PENDING_CANDIDATES:
            pending.append((session_hash, candidate))
        else:
            logger.warning(
                "Dropped an ICE candidate of stream %s: %s are already "
                "waiting for its offer",
                webrtc_id,
                MAX_PENDING_CANDIDATES,
            )
        while len(self.pending_candidates) > MAX_PENDING_CANDIDATE_IDS:
            self.pending_candidates.popitem(last=False)


# The registry of each app, by its queue, which a hot reload keeps
_registries: weakref.WeakKeyDictionary[Any, StreamRegistry] = (
    weakref.WeakKeyDictionary()
)


def registry_for(queue: Any) -> StreamRegistry:
    registry = _registries.get(queue)
    if registry is None:
        registry = _registries[queue] = StreamRegistry()
    return registry


def current_registry() -> StreamRegistry | None:
    """The registry of the app whose request or event is being served."""
    blocks = LocalContext.blocks.get(None)
    queue = getattr(blocks, "_queue", None)
    return registry_for(queue) if queue is not None else None


def stream_of_event(event_id: str) -> Stream | None:
    """The stream that the queue event `event_id` admitted, until its watcher
    ends. Event ids are unique, so any app's registry can be asked."""
    for registry in list(_registries.values()):
        stream = registry.by_event.get(event_id)
        if stream is not None:
            return stream
    return None


class StreamState(enum.Enum):
    # Its turn came: the page may now connect
    ADMITTED = "admitted"
    # The offer arrived: the peer connection is being set up
    CONNECTING = "connecting"
    # The peer connection is connected
    LIVE = "live"
    # Ended: the media has stopped, and the queue event still delivers the
    # outputs that are pending
    ENDING = "ending"
    # The queue event is over and the stream is out of its registry
    ENDED = "ended"


class QueueLease:
    """
    How a stream holds its place in the queue: its queue event is a lease
    (`BlockFunction.lease`), whose run the queue steps each time the stream
    wakes it, and which ends when the stream has ended (see `stream_run`).
    The queue leaves the time limit to the stream, kept here, since cutting
    the event would drop the outputs still pending. Everything a stream asks
    of the queue goes through this class.
    """

    def __init__(self, event: EventHandle, time_limit: float | None) -> None:
        self.event = event
        self.time_limit = time_limit
        self.admitted_at = time.monotonic()

    @property
    def live(self) -> bool:
        """Whether the queue still runs the event."""
        return self.event.live

    def begin(self, stream_id: str) -> None:
        self.event.stream_admitted(stream_id)

    def wake(self) -> None:
        """Has the queue step the event's run again."""
        self.event.wake()

    def finish(self) -> None:
        """Makes the step running now the run's last (see `EventHandle.finish`)."""
        self.event.finish()

    def remaining_time(self) -> float | None:
        if self.time_limit is None:
            return None
        return max(0.0, self.time_limit - (time.monotonic() - self.admitted_at))

    async def keep(self, stream: Stream) -> None:
        """
        Runs until the queue event is over, however it ended: ends the stream
        at its time limit or when it does not connect in time.
        """
        while True:
            await asyncio.sleep(WATCH_INTERVAL)
            if not self.live:
                return
            if stream.ended:
                # The event still has to make its last call
                continue
            try:
                now = time.monotonic()
                timed_out = self.remaining_time() == 0
                never_connected = (
                    not stream.connected and now - self.admitted_at > CONNECT_TIMEOUT
                )
                if timed_out or never_connected:
                    stream.close()
            except Exception:
                # Watching goes on until the event is over: no re-admission
                logger.exception("Error while watching stream %s", stream.id)
                stream.close()


class Stream:
    """A stream that the queue has let in, from its admission until its queue
    event is over."""

    def __init__(
        self,
        webrtc_id: str,
        manager: ConnectionManager,
        event: EventHandle,
        registry: StreamRegistry,
    ) -> None:
        self.id = webrtc_id
        self.manager = manager
        self.registry = registry
        self.lease = QueueLease(event, manager.time_limit)
        self.state = StreamState.ADMITTED
        self.connected_at: float | None = None
        self.context = Context(webrtc_id=webrtc_id)
        # The values of the extra inputs, which the tracks and the handler read
        self.inputs = StreamInputs()
        # AdditionalOutputs not delivered yet, oldest first. A handler that
        # emits faster than the outputs can be delivered loses the oldest ones.
        self.outputs: deque[AdditionalOutputs] = deque(maxlen=MAX_PENDING_OUTPUTS)
        # The handler's first error, which ends the stream and its event
        self.errors: StreamErrors | None = None
        # The page's rtc_configuration, resolved once per stream
        self.rtc_configuration: asyncio.Future | None = None
        # Set by the offer, and let go of when the stream ends. The stream
        # outlives them: an ended stream still delivers its pending outputs.
        self.pc: RTCPeerConnection | None = None
        self.tracks: list[Track] = []
        self.channel: Any = None
        self.watcher: asyncio.Task | None = None
        self._shut_down_handlers: set[int] = set()

    @property
    def event(self) -> EventHandle:
        return self.lease.event

    @property
    def connected(self) -> bool:
        """Whether its peer connection has connected, at any point."""
        return self.connected_at is not None

    @property
    def ended(self) -> bool:
        return self.state in (StreamState.ENDING, StreamState.ENDED)

    def owned_by(self, session_hash: str | None) -> bool:
        """
        Whether the stream was admitted for this browser session. A stream id
        travels in signalling and input messages, so only the session whose
        queue event admitted it may connect to it or feed it.
        """
        return session_hash is not None and self.event.session_hash == session_hash

    def mark_connected(self, pc: RTCPeerConnection) -> None:
        if self.pc is pc and self.state is StreamState.CONNECTING:
            self.state = StreamState.LIVE
            self.connected_at = time.monotonic()

    def set_inputs(self, values: list[Any]) -> None:
        """Pushes the current values of the extra inputs into the stream, once
        it has a connection."""
        if self.pc is not None:
            self.inputs.set(values)

    def add_output(self, outputs: AdditionalOutputs) -> None:
        self.outputs.append(outputs)
        self.lease.wake()

    def add_track(self, track: Track) -> bool:
        """Adds a track of the peer connection. A track that arrives after the
        stream ended is stopped at once; returns False then."""
        self.tracks.append(track)
        if self.ended:
            self._release()
            return False
        return True

    def take_output(self) -> AdditionalOutputs | None:
        """The next AdditionalOutputs to deliver. One step of the event's run
        delivers one and comes back for the rest. The last ones of an ended
        stream go out with the event's completion, as a stream's last outputs
        do, unless a failure is still to be reported."""
        if not self.outputs:
            return None
        outputs = self.outputs.popleft()
        if self.outputs:
            self.lease.wake()
        elif self.ended:
            if self.failure is None:
                self.lease.finish()
            else:
                self.lease.wake()
        return outputs

    @property
    def failure(self) -> dict[str, Any] | None:
        """The handler's error (see `StreamErrors.fail`), once it failed."""
        return self.errors.failure if self.errors else None

    def close(self) -> None:
        """
        Ends the stream, from whichever path notices the end first (the page,
        the time limit, the handler, the peer connection, a track, the queue);
        later calls only release what was added since. The media stops at once:
        the peer connection closes, the tracks stop, and the handler shuts down,
        without waiting for the queue. The queue event then delivers the outputs
        still pending and ends (see `stream_run`), which needs a worker slot,
        so the stream's place in the concurrency limit is released only once
        one is free.
        """
        first = not self.ended
        if first:
            self.state = StreamState.ENDING
        self._release()
        if first:
            self.lease.wake()

    def _release(self) -> None:
        manager = self.manager
        if self.pc is not None:
            manager._close_pc(self.pc)
            self.pc = None
        tracks, self.tracks = self.tracks, []
        self.channel = None
        self.registry.pending_candidates.pop(self.id, None)
        for track in tracks:
            # Stopping a track ends its loops; its "ended" event calls close()
            # again, which then finds nothing left to release
            track.stop()
            if isinstance(track, ServerToClientAudio | ServerToClientVideo):
                manager._add_shutdown(track.close_generator())
        # Handler classes, once each: both tracks of an audio-video connection
        # share one handler
        for track in tracks:
            if not isinstance(track, AudioCallback | HandlerVideoTrack):
                continue
            handler = track.event_handler
            if not isinstance(handler, StreamHandlerBase):
                continue
            if id(handler) in self._shut_down_handlers:
                continue
            self._shut_down_handlers.add(id(handler))
            # A handler blocked in wait_for_args() would wait forever
            handler.args_set.set()
            manager._add_shutdown(manager._shut_down(handler))

    async def watch(self) -> None:
        """
        Keeps the stream and its queue event in step for the life of the
        stream (see `QueueLease.keep`), then lets go of everything the stream
        holds once the event is over, however it ended.
        """
        try:
            await self.lease.keep(self)
        finally:
            pc = self.pc
            try:
                # Before awaiting anything: the handler's shutdown is then
                # registered for the next stream to wait for
                self.close()
                if pc is not None:
                    await pc.close()
            finally:
                self.state = StreamState.ENDED
                self.registry.remove(self)


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
    # Not shutdown(): it cleans up after the stream, which may have ended well,
    # and _shut_down logs its errors
    for name in (
        "emit",
        "receive",
        "start_up",
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
    """What one `WebRTC.stream()` call or `Server.webrtc()` endpoint sets up:
    the handler and how its streams run. It admits the streams of its queue
    event and builds their peer connections."""

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
        rtc_configuration: dict[str, Any] | Callable | None = None,
        inputs_over_channel: bool = False,
    ) -> None:
        self.handler = handler
        self.mode = mode
        self.modality = modality
        self.time_limit = time_limit
        self.allow_extra_tracks = allow_extra_tracks
        # The browser's configuration, or a function that issues it
        self.rtc_configuration = rtc_configuration
        # Whether the client sends the extra inputs over the data channel (a
        # gr.Server endpoint), as raw values. gr.WebRTC sends them through
        # events instead, which run the input components' preprocess.
        self.inputs_over_channel = inputs_over_channel
        self.server_rtc_configuration = to_rtc_configuration(server_rtc_configuration)
        self.video_bitrate = video_bitrate
        self.tasks: set[asyncio.Task] = set()
        self.shutdowns: set[asyncio.Task] = set()

    def admit(
        self, webrtc_id: str, event: EventHandle, registry: StreamRegistry
    ) -> bool:
        """
        Lets a stream in. Called by the first call of the stream's queue event,
        that is, once the stream's turn has come. An event admits one stream,
        and a stream id is admitted once: returns False when another event
        already holds the id.
        """
        existing = registry.streams.get(webrtc_id)
        if existing is not None:
            return existing.event.id == event.id
        stream = Stream(webrtc_id, self, event, registry)
        # The lease keeps the time limit, from admission, and ends the stream
        # through `close`. The queue's own cut would end the event before its
        # last calls deliver what is pending.
        stream.lease.begin(webrtc_id)
        registry.add(stream)
        stream.watcher = self._spawn(stream.watch())
        return True

    @staticmethod
    async def _drain(track: AudioCallback | HandlerVideoTrack) -> None:
        """
        Runs a handler class whose output nobody plays (mode="send"): its
        output still has to be read, or its AdditionalOutputs never reach the
        page, CloseStream never takes effect, and audio frames pile up.
        Frames it returns are dropped.
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

    def _close_pc(self, pc: RTCPeerConnection) -> None:
        if pc.connectionState != "closed":
            self._spawn(pc.close())

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
        # No reset(): each connection has its own handler, and clearing
        # args_set would block a last call of the handler that still waits
        # for its inputs (close() set args_set to release it)

    async def _wait_for_shutdowns(self) -> None:
        pending = [task for task in self.shutdowns if not task.done()]
        if not pending:
            return
        _, still_running = await asyncio.wait(pending, timeout=SHUTDOWN_WAIT)
        if still_running:
            # Waited for once: one that never ends must not delay every later
            # stream. `self.tasks` still holds them.
            self.shutdowns.difference_update(still_running)
            logger.warning(
                "A stream handler's shutdown() is still running after %s s; "
                "starting the next stream anyway",
                SHUTDOWN_WAIT,
            )

    async def _resolve_rtc_configuration(self, request: Any = None) -> dict[str, Any]:
        config = self.rtc_configuration
        if config is None:
            return {}
        if not callable(config):
            return cast(dict[str, Any], config)
        # Same injection as event listeners, so that the function can e.g.
        # issue TURN credentials with the visitor's gr.OAuthToken
        args, *_ = special_args(config, [], request)
        if is_async(config):
            result = await config(*args)
        else:
            result = await anyio.to_thread.run_sync(config, *args)
        if not isinstance(result, dict):
            raise TypeError(
                "The rtc_configuration function must return a dict, but it "
                f"returned a {type(result).__name__}."
            )
        return result

    async def rtc_configuration_for(self, request: Any = None) -> dict[str, Any]:
        """The browser's configuration, or the error to show instead."""
        try:
            return await self._resolve_rtc_configuration(request)
        except Exception as e:
            # A gr.Error is a message for the visitor (e.g. "sign in first"),
            # not a failure
            if not isinstance(e, Error):
                logger.exception("Could not resolve rtc_configuration")
            # Shown like the error of an event
            blocks = LocalContext.blocks.get(None)
            payload = error_payload(e, bool(blocks and blocks.show_error))
            return {"error": payload["error"] or "An error occurred."}

    async def handle_offer(
        self, stream: Stream, body: dict[str, Any], request: Any = None
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
        if stream.event.concurrency_limit == 1:
            await self._wait_for_shutdowns()
        if stream.ended or not stream.owned_by(session_hash):
            return _failed("not_admitted")
        # Another offer for the same id may have waited for the admission too.
        # Nothing awaits between this check and claiming the stream below.
        if stream.pc is not None:
            return _failed("connection_already_exists")

        # The handler's tasks and threads are all started from here, so they
        # inherit the stream's queue event, through which gr.Warning and
        # gr.Info reach the page as an event's do, and where errors go
        blocks = LocalContext.blocks.get(None)
        show_error = bool(blocks and blocks.show_error)
        errors = StreamErrors(
            asyncio.get_running_loop(),
            end_stream=stream.close,
            show_error=show_error,
        )
        LocalContext.event_id.set(stream.event.id)
        current_errors.set(errors)
        stream.errors = errors
        pc = RTCPeerConnection(configuration=self.server_rtc_configuration)
        stream.pc = pc
        stream.state = StreamState.CONNECTING
        try:
            return await self._connect(stream, pc, body, request)
        except Exception as e:
            if not isinstance(e, Error):
                logger.exception("Could not set up the stream")
            await pc.close()
            payload = error_payload(e, show_error)
            # The stream's event fails with it, which the page shows; a
            # client also gets it from the answer
            errors.failure = payload
            stream.close()
            return _failed(
                "setup_failed", message=payload["error"] or "An error occurred."
            )

    async def _connect(
        self,
        stream: Stream,
        pc: RTCPeerConnection,
        body: dict[str, Any],
        request: Any,
    ) -> dict[str, Any]:
        session_hash = getattr(request, "session_hash", None)
        offer = RTCSessionDescription(sdp=body["sdp"], type=body["type"])
        handler = instantiate_handler(self.handler, request)
        set_outputs = stream.add_output
        context = stream.context
        inputs = stream.inputs
        # Whether the webcam preview is mirrored on the client
        mirror = body.get("mirror") is True
        rejected: list[str] = []

        @pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            logger.debug("ICE connection state change %s", pc.iceConnectionState)
            if pc.iceConnectionState == "failed":
                await pc.close()
                stream.close()

        @pc.on("connectionstatechange")
        async def on_connectionstatechange():
            logger.debug("pc.connectionState %s", pc.connectionState)
            if pc.connectionState in ["failed", "closed"]:
                await pc.close()
                stream.close()
            if pc.connectionState == "connected":
                stream.mark_connected(pc)

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
                    inputs=inputs,
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
                    inputs=inputs,
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
                    inputs=inputs,
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
                    inputs=inputs,
                )
            else:
                if self.allow_extra_tracks:
                    return
                rejected.append(
                    f"Unsupported track kind '{track.kind}' for modality '{self.modality}'"
                )
                return

            if not stream.add_track(cb):
                return
            # A handler that returns CloseStream stops its track: end the
            # stream here, whether or not the browser reacts to "end_stream"
            cb.on("ended", stream.close)
            if stream.channel is not None:
                for conn in stream.tracks:
                    conn.set_channel(stream.channel)
            if self.mode == "send-receive":
                pc.addTrack(cb)
            elif self.mode == "send" and (
                isinstance(cb, AudioCallback)
                or (
                    isinstance(cb, HandlerVideoTrack)
                    and isinstance(
                        handler, VideoStreamHandler | AsyncVideoStreamHandler
                    )
                )
            ):
                # Handler classes give their values through emit() and
                # video_emit(), which run only when their track is read
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
                        inputs=inputs,
                    )
                else:
                    cb = ServerToClientVideo(
                        cast(Callable, handler),
                        set_additional_outputs=set_outputs,
                        context=context,
                        inputs=inputs,
                    )
            else:
                cb = ServerToClientAudio(
                    cast(Callable, handler),
                    set_additional_outputs=set_outputs,
                    context=context,
                    inputs=inputs,
                )
            pc.addTrack(cb)
            stream.add_track(cb)
            cb.on("ended", stream.close)

        @pc.on("datachannel")
        def on_datachannel(channel):
            logger.debug("Data channel established: %s", channel.label)
            stream.channel = channel
            if self.inputs_over_channel:

                @channel.on("message")
                def on_message(message: Any) -> None:
                    try:
                        data = json.loads(message) if isinstance(message, str) else None
                    except ValueError:
                        data = None
                    if (
                        isinstance(data, dict)
                        and data.get("type") == "input"
                        and isinstance(data.get("data"), list)
                    ):
                        stream.set_inputs(list(data["data"]))

            async def set_channel():
                while not stream.tracks:
                    if stream.ended:
                        return
                    await asyncio.sleep(0.05)
                for conn in stream.tracks:
                    conn.set_channel(channel)

            self._spawn(set_channel())

        await pc.setRemoteDescription(offer)
        if rejected:
            await pc.close()
            # As for a handler that cannot start
            cast(StreamErrors, stream.errors).failure = {"error": rejected[0]}
            stream.close()
            return _failed("unsupported_track", message=rejected[0])
        for sender, candidate in stream.registry.pending_candidates.pop(stream.id, []):
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
            "time_limit": stream.lease.remaining_time(),
        }


async def handle_signal(body: dict[str, Any], request: Any = None) -> dict[str, Any]:
    """
    Handles one signalling message from the client: an SDP offer, which
    creates the peer connection and returns the answer, or a trickled ICE
    candidate. Both go to the stream with that id.
    """
    if body.get("type") == "ice-candidate" and "candidate" in body:
        return await _add_ice_candidate(body, getattr(request, "session_hash", None))
    webrtc_id = body.get("webrtc_id")
    if not webrtc_id or "sdp" not in body:
        return _failed("invalid_offer")
    registry = current_registry()
    if registry is None:
        return _failed("not_admitted")
    stream = registry.get(webrtc_id)
    if stream is not None and stream.pc is not None:
        return _failed("connection_already_exists")
    stream = await registry.wait_for_admission(webrtc_id)
    if stream is None:
        return _failed("not_admitted")
    return await stream.manager.handle_offer(stream, body, request)


async def _add_ice_candidate(
    body: dict[str, Any], session_hash: str | None
) -> dict[str, Any]:
    webrtc_id = body.get("webrtc_id")
    if not webrtc_id:
        return _failed("unknown_connection")
    registry = current_registry()
    stream = registry.get(webrtc_id) if registry is not None else None
    # The page makes its connection only after the stream's turn, so a
    # candidate for a stream not admitted for this session is not kept
    if registry is None or stream is None or not stream.owned_by(session_hash):
        return _failed("unknown_connection")
    pc = stream.pc
    if pc is not None and pc.connectionState == "closed":
        return _failed("connection_closed")
    try:
        candidate = _parse_ice_candidate(body["candidate"])
        if candidate is None:
            logger.error("Invalid candidate format: %s", body["candidate"])
            return _failed("invalid_candidate_format")
        if pc is None:
            registry.keep_candidate(stream.id, session_hash, candidate)
            return {"status": "success"}
        await pc.addIceCandidate(candidate)
        return {"status": "success"}
    except Exception as e:
        logger.error("Error adding ICE candidate: %s", e, exc_info=True)
        return _failed(str(e))


async def stream_run(
    manager: ConnectionManager, webrtc_id: str | None
) -> AsyncGenerator[AdditionalOutputs | None, None]:
    """
    The run of a stream's queue event, a lease (`BlockFunction.lease`) that
    the queue steps each time the stream wakes it. Its first step admits the
    stream; each later step gives the next AdditionalOutputs, or None when
    there is none. Once the stream has ended and its outputs are delivered,
    it raises the handler's error if it failed, or else finishes the event
    with a step that changes nothing: a run that just ran out would complete
    with empty outputs, which the page would apply. `manager` is the one that
    the event's function was created with; after a hot reload the run keeps
    the stream it admitted.
    """
    blocks = LocalContext.blocks.get(None)
    queue = blocks._queue if blocks is not None else None
    event = (
        queue.event_handle(LocalContext.event_id.get(None))
        if queue is not None
        else None
    )
    if event is None:
        return
    registry = registry_for(queue)
    if (
        not isinstance(webrtc_id, str)
        or not webrtc_id
        or not event.live
        or not manager.admit(webrtc_id, event, registry)
    ):
        # No id (or not a string, which signalling could never match), an
        # event that is over, or an id that belongs to another event's stream:
        # end this event instead of letting it hold a place it cannot use
        event.finish()
        yield None
        return
    stream = registry.by_event[event.id]
    try:
        # The turn: the page may now connect
        yield None
        while True:
            outputs = stream.take_output()
            if outputs is not None:
                yield outputs
            elif stream.ended:
                failure = stream.failure
                if failure is not None:
                    # The server has logged it
                    raise Error(
                        cast(str, failure["error"] or ""),
                        title=cast(str, failure.get("title") or "Error"),
                        visible=bool(failure.get("visible", True)),
                        print_exception=False,
                    )
                stream.lease.finish()
                yield None
                return
            else:
                yield None
    finally:
        # A run closed by the queue (`cancels=`, /cancel) ends its stream at
        # once: the queue has already freed the stream's place, and with
        # concurrency_limit=1 the next stream must find this handler's
        # shutdown to wait for (see `_wait_for_shutdowns`)
        stream.close()


def end_admitted_stream(event_id: str) -> bool:
    """
    Ends the stream that the queue event `event_id` admitted, for a page that
    closes it: the event then delivers the outputs still pending and fails if
    the handler did (see `stream_run`). False if the event has
    no running stream.
    """
    stream = stream_of_event(event_id)
    if stream is None or stream.registry.streams.get(stream.id) is not stream:
        return False
    stream.close()
    return True


async def stream_admitted(
    webrtc_id: str | None, session_hash: str | None
) -> tuple[ConnectionManager, Stream] | None:
    """
    The stream and its manager, if its turn has come, it has not ended, and it
    belongs to this browser session. Waits a little for an admission that is
    just under way.
    """
    if not webrtc_id:
        return None
    registry = current_registry()
    if registry is None:
        return None
    stream = await registry.wait_for_admission(webrtc_id)
    if stream is None or not stream.owned_by(session_hash) or stream.ended:
        return None
    return stream.manager, stream


async def get_rtc_configuration(
    body: dict[str, Any] | None, request: Any = None
) -> dict[str, Any]:
    """
    The browser's configuration for a stream. Only for a stream whose turn has
    come, and only to the page that started it: the configuration may hold
    TURN credentials billed to the app's owner, so the queue's limits have to
    cap who gets them.
    """
    webrtc_id = body.get("webrtc_id") if isinstance(body, dict) else None
    admitted = await stream_admitted(webrtc_id, getattr(request, "session_hash", None))
    if admitted is None:
        return {
            "error": "The stream's turn in the queue ended before it "
            "connected. Please try again."
        }
    manager, stream = admitted
    # Once per stream, however often the page asks: each call of the author's
    # function may issue credentials on their account
    if stream.rtc_configuration is None:
        stream.rtc_configuration = asyncio.ensure_future(
            manager.rtc_configuration_for(request)
        )
    return await asyncio.shield(stream.rtc_configuration)


def set_input(webrtc_id: Any, session_hash: str | None, *args: Any) -> None:
    """Pushes the current values of the extra inputs into a live stream of
    this browser session."""
    registry = current_registry()
    stream = registry.get(webrtc_id) if registry is not None else None
    if stream is not None and stream.owned_by(session_hash):
        stream.set_inputs(list(args))
