from __future__ import annotations

import asyncio
import copy
import os
import random
import threading
import time
import traceback
import uuid
from collections import defaultdict
from queue import Queue as ThreadQueue
from typing import TYPE_CHECKING

import fastapi
from typing_extensions import Literal

from gradio import route_utils, routes
from gradio.data_classes import (
    PredictBody,
)
from gradio.helpers import TrackedIterable
from gradio.server_messages import (
    EstimationMessage,
    EventMessage,
    LogMessage,
    ProcessCompletedMessage,
    ProcessGeneratingMessage,
    ProcessStartsMessage,
    ProgressMessage,
    ProgressUnit,
)
from gradio.utils import (
    LRUCache,
    error_payload,
    run_coro_in_background,
    safe_get_lock,
    set_task_name,
)

if TYPE_CHECKING:
    from gradio.blocks import BlockFunction, Blocks


class Event:
    def __init__(
        self,
        session_hash: str | None,
        fn: BlockFunction,
        request: fastapi.Request,
        username: str | None,
    ):
        self._id = uuid.uuid4().hex
        self.session_hash: str = session_hash or self._id
        self.fn = fn
        self.request = request
        self.username = username
        self.concurrency_id = fn.concurrency_id
        self.data: PredictBody | None = None
        self.progress: ProgressMessage | None = None
        self.progress_pending: bool = False
        self.alive = True


class EventQueue:
    def __init__(self, concurrency_id: str, concurrency_limit: int | None):
        self.queue: list[Event] = []
        self.concurrency_id = concurrency_id
        self.concurrency_limit = concurrency_limit
        self.current_concurrency = 0
        self.start_times_per_fn: defaultdict[BlockFunction, set[float]] = defaultdict(
            set
        )


class ProcessTime:
    def __init__(self):
        self.process_time = 0
        self.count = 0
        self.avg_time = 0

    def add(self, time: float):
        self.process_time += time
        self.count += 1
        self.avg_time = self.process_time / self.count


class Queue:
    def __init__(
        self,
        live_updates: bool,
        concurrency_count: int,
        update_intervals: float,
        max_size: int | None,
        blocks: Blocks,
        default_concurrency_limit: int | None | Literal["not_set"] = "not_set",
    ):
        self.pending_messages_per_session: LRUCache[str, ThreadQueue[EventMessage]] = (
            LRUCache(2000)
        )
        self.pending_event_ids_session: dict[str, set[str]] = {}
        self.pending_message_lock = safe_get_lock()
        self.event_queue_per_concurrency_id: dict[str, EventQueue] = {}
        self.stopped = False
        self.max_thread_count = concurrency_count
        self.update_intervals = update_intervals
        self.active_jobs: list[None | list[Event]] = []
        self.delete_lock = safe_get_lock()
        self.server_app = None
        self.process_time_per_fn: defaultdict[BlockFunction, ProcessTime] = defaultdict(
            ProcessTime
        )
        self.live_updates = live_updates
        self.sleep_when_free = 0.05
        self.progress_update_sleep_when_free = 0.1
        self.max_size = max_size
        self.blocks = blocks
        self._asyncio_tasks: list[asyncio.Task] = []
        self.default_concurrency_limit = self._resolve_concurrency_limit(
            default_concurrency_limit
        )
        self.event_analytics: dict[str, dict[str, float | str | None]] = {}
        self.reload_lock = threading.Lock()

    def start(self):
        self.active_jobs = [None] * self.max_thread_count

        run_coro_in_background(self.start_processing)
        run_coro_in_background(self.start_progress_updates)
        if not self.live_updates:
            run_coro_in_background(self.notify_clients)

    def create_event_queue_for_fn(self, block_fn: BlockFunction):
        concurrency_id = block_fn.concurrency_id
        concurrency_limit: int | None
        if block_fn.concurrency_limit == "default":
            concurrency_limit = self.default_concurrency_limit
        else:
            concurrency_limit = block_fn.concurrency_limit
        if concurrency_id not in self.event_queue_per_concurrency_id:
            self.event_queue_per_concurrency_id[concurrency_id] = EventQueue(
                concurrency_id, concurrency_limit
            )
        elif (
            concurrency_limit is not None
        ):  # Update concurrency limit if it is lower than existing limit
            existing_event_queue = self.event_queue_per_concurrency_id[concurrency_id]
            if (
                existing_event_queue.concurrency_limit is None
                or concurrency_limit < existing_event_queue.concurrency_limit
            ):
                existing_event_queue.concurrency_limit = concurrency_limit

    def close(self):
        self.stopped = True

    def send_message(
        self,
        event: Event,
        event_message: EventMessage,
    ):
        if not event.alive:
            return
        event_message.event_id = event._id
        messages = self.pending_messages_per_session[event.session_hash]
        messages.put_nowait(event_message)

    def _resolve_concurrency_limit(
        self, default_concurrency_limit: int | None | Literal["not_set"]
    ) -> int | None:
        """
        Handles the logic of resolving the default_concurrency_limit as this can be specified via a combination
        of the `default_concurrency_limit` parameter of the `Blocks.queue()` or the `GRADIO_DEFAULT_CONCURRENCY_LIMIT`
        environment variable. The parameter in `Blocks.queue()` takes precedence over the environment variable.
        Parameters:
            default_concurrency_limit: The default concurrency limit, as specified by a user in `Blocks.queu()`.
        """
        if default_concurrency_limit != "not_set":
            return default_concurrency_limit
        if default_concurrency_limit_env := os.environ.get(
            "GRADIO_DEFAULT_CONCURRENCY_LIMIT"
        ):
            if default_concurrency_limit_env.lower() == "none":
                return None
            else:
                return int(default_concurrency_limit_env)
        else:
            return 1

    def __len__(self):
        total_len = 0
        for event_queue in self.event_queue_per_concurrency_id.values():
            total_len += len(event_queue.queue)
        return total_len

    async def push(
        self, body: PredictBody, request: fastapi.Request, username: str | None
    ) -> tuple[bool, str]:
        if body.fn_index is None:
            return False, "No function index provided."
        if self.max_size is not None and len(self) >= self.max_size:
            return (
                False,
                f"Queue is full. Max size is {self.max_size} and size is {len(self)}.",
            )

        if body.session_hash:
            session_state = self.blocks.state_holder[body.session_hash]
            fn = session_state.blocks_config.fns[body.fn_index]
        else:
            fn = self.blocks.fns[body.fn_index]

        fn = route_utils.get_fn(self.blocks, None, body)
        self.create_event_queue_for_fn(fn)
        event = Event(
            body.session_hash,
            fn,
            request,
            username,
        )
        event.data = body
        if body.session_hash is None:
            body.session_hash = event.session_hash
        async with self.pending_message_lock:
            if body.session_hash not in self.pending_messages_per_session:
                self.pending_messages_per_session[body.session_hash] = ThreadQueue()
            if body.session_hash not in self.pending_event_ids_session:
                self.pending_event_ids_session[body.session_hash] = set()
        self.pending_event_ids_session[body.session_hash].add(event._id)
        try:
            event_queue = self.event_queue_per_concurrency_id[event.concurrency_id]
        except KeyError as e:
            raise KeyError(
                "Event not found in queue. If you are deploying this Gradio app with multiple replicas, please enable stickiness to ensure that all requests from the same user are routed to the same instance."
            ) from e
        event_queue.queue.append(event)
        self.event_analytics[event._id] = {
            "time": time.time(),
            "status": "queued",
            "process_time": None,
            "function": fn.api_name,
            "session_hash": body.session_hash,
        }

        self.broadcast_estimations(event.concurrency_id, len(event_queue.queue) - 1)

        return True, event._id

    def _cancel_asyncio_tasks(self):
        for task in self._asyncio_tasks:
            task.cancel()
        self._asyncio_tasks = []

    def set_server_app(self, app: routes.App):
        self.server_app = app

    def get_active_worker_count(self) -> int:
        count = 0
        for worker in self.active_jobs:
            if worker is not None:
                count += 1
        return count

    def get_events(self) -> tuple[list[Event], bool, str] | None:
        concurrency_ids = list(self.event_queue_per_concurrency_id.keys())
        random.shuffle(concurrency_ids)
        for concurrency_id in concurrency_ids:
            event_queue = self.event_queue_per_concurrency_id[concurrency_id]
            if len(event_queue.queue) and (
                event_queue.concurrency_limit is None
                or event_queue.current_concurrency < event_queue.concurrency_limit
            ):
                first_event = event_queue.queue[0]
                block_fn = first_event.fn
                events = [first_event]
                batch = block_fn.batch
                if batch:
                    events += [
                        event
                        for event in event_queue.queue[1:]
                        if event.fn == first_event.fn
                    ][: block_fn.max_batch_size - 1]

                for event in events:
                    event_queue.queue.remove(event)

                return events, batch, concurrency_id

    async def start_processing(self) -> None:
        try:
            while not self.stopped:
                if len(self) == 0:
                    await asyncio.sleep(self.sleep_when_free)
                    continue

                if None not in self.active_jobs:
                    await asyncio.sleep(self.sleep_when_free)
                    continue

                # Using mutex to avoid editing a list in use
                async with self.delete_lock:
                    event_batch = self.get_events()

                if event_batch:
                    events, batch, concurrency_id = event_batch
                    self.active_jobs[self.active_jobs.index(None)] = events
                    event_queue = self.event_queue_per_concurrency_id[concurrency_id]
                    event_queue.current_concurrency += 1
                    start_time = time.time()
                    event_queue.start_times_per_fn[events[0].fn].add(start_time)
                    for event in events:
                        self.event_analytics[event._id]["status"] = "processing"
                    process_event_task = run_coro_in_background(
                        self.process_events, events, batch, start_time
                    )
                    set_task_name(
                        process_event_task,
                        events[0].session_hash,
                        events[0].fn._id,
                        events[0]._id,
                        batch,
                    )

                    self._asyncio_tasks.append(process_event_task)
                    if self.live_updates:
                        self.broadcast_estimations(concurrency_id)
                else:
                    await asyncio.sleep(self.sleep_when_free)
        finally:
            self.stopped = True
            self._cancel_asyncio_tasks()

    async def start_progress_updates(self) -> None:
        """
        Because progress updates can be very frequent, we do not necessarily want to send a message per update.
        Rather, we check for progress updates at regular intervals, and send a message if there is a pending update.
        Consecutive progress updates between sends will overwrite each other so only the most recent update will be sent.
        """
        while not self.stopped:
            events = [evt for job in self.active_jobs if job is not None for evt in job]

            if len(events) == 0:
                await asyncio.sleep(self.progress_update_sleep_when_free)
                continue

            for event in events:
                if event.progress_pending and event.progress:
                    event.progress_pending = False
                    self.send_message(event, event.progress)

            await asyncio.sleep(self.progress_update_sleep_when_free)

    def set_progress(
        self,
        event_id: str,
        iterables: list[TrackedIterable] | None,
    ):
        if iterables is None:
            return
        for job in self.active_jobs:
            if job is None:
                continue
            for evt in job:
                if evt._id == event_id:
                    progress_data: list[ProgressUnit] = []
                    for iterable in iterables:
                        progress_unit = ProgressUnit(
                            index=iterable.index,
                            length=iterable.length,
                            unit=iterable.unit,
                            progress=iterable.progress,
                            desc=iterable.desc,
                        )
                        progress_data.append(progress_unit)
                    evt.progress = ProgressMessage(progress_data=progress_data)
                    evt.progress_pending = True

    def log_message(
        self,
        event_id: str,
        log: str,
        level: Literal["info", "warning"],
        duration: float | None = 10,
        visible: bool = True,
    ):
        events = [evt for job in self.active_jobs if job is not None for evt in job]
        for event in events:
            if event._id == event_id:
                log_message = LogMessage(
                    log=log,
                    level=level,
                    duration=duration,
                    visible=visible,
                )
                self.send_message(event, log_message)

    async def clean_events(
        self, *, session_hash: str | None = None, event_id: str | None = None
    ) -> None:
        for job_set in self.active_jobs:
            if job_set:
                for job in job_set:
                    if job.session_hash == session_hash or job._id == event_id:
                        job.alive = False

        async with self.delete_lock:
            events_to_remove: list[Event] = []
            for event_queue in self.event_queue_per_concurrency_id.values():
                for event in event_queue.queue:
                    if event.session_hash == session_hash or event._id == event_id:
                        events_to_remove.append(event)

            for event in events_to_remove:
                self.event_queue_per_concurrency_id[event.concurrency_id].queue.remove(
                    event
                )

    async def notify_clients(self) -> None:
        """
        Notify clients about events statuses in the queue periodically.
        """
        while not self.stopped:
            await asyncio.sleep(self.update_intervals)
            if len(self) > 0:
                for concurrency_id in self.event_queue_per_concurrency_id:
                    self.broadcast_estimations(concurrency_id)

    def broadcast_estimations(
        self, concurrency_id: str, after: int | None = None
    ) -> None:
        wait_so_far = 0
        event_queue = self.event_queue_per_concurrency_id[concurrency_id]
        time_till_available_worker: int | None = 0

        if event_queue.current_concurrency == event_queue.concurrency_limit:
            expected_end_times = []
            for fn, start_times in event_queue.start_times_per_fn.items():
                if fn not in self.process_time_per_fn:
                    time_till_available_worker = None
                    break
                process_time = self.process_time_per_fn[fn].avg_time
                expected_end_times += [
                    start_time + process_time for start_time in start_times
                ]
            if time_till_available_worker is not None and len(expected_end_times) > 0:
                time_of_first_completion = min(expected_end_times)
                time_till_available_worker = max(
                    time_of_first_completion - time.time(), 0
                )

        for rank, event in enumerate(event_queue.queue):
            process_time_for_fn = (
                self.process_time_per_fn[event.fn].avg_time
                if event.fn in self.process_time_per_fn
                else None
            )
            rank_eta = (
                process_time_for_fn + wait_so_far + time_till_available_worker
                if process_time_for_fn is not None
                and wait_so_far is not None
                and time_till_available_worker is not None
                else None
            )

            if after is None or rank >= after:
                self.send_message(
                    event,
                    EstimationMessage(
                        rank=rank, rank_eta=rank_eta, queue_size=len(event_queue.queue)
                    ),
                )
            if event_queue.concurrency_limit is None:
                wait_so_far = 0
            elif wait_so_far is not None and process_time_for_fn is not None:
                wait_so_far += process_time_for_fn / event_queue.concurrency_limit
            else:
                wait_so_far = None

    def get_status(self) -> EstimationMessage:
        return EstimationMessage(
            queue_size=len(self),
        )

    async def process_events(
        self, events: list[Event], batch: bool, begin_time: float
    ) -> None:
        awake_events: list[Event] = []
        fn = events[0].fn
        success = False
        try:
            for event in events:
                if event.alive:
                    self.send_message(
                        event,
                        ProcessStartsMessage(
                            eta=self.process_time_per_fn[fn].avg_time
                            if fn in self.process_time_per_fn
                            else None
                        ),
                    )
                    awake_events.append(event)
            if not awake_events:
                return

            events = awake_events
            body = events[0].data
            if body is None:
                raise ValueError("No event data")
            username = events[0].username
            body.event_id = events[0]._id if not batch else None
            try:
                body.request = events[0].request
            except ValueError:
                pass

            if batch:
                body.data = list(
                    zip(*[event.data.data for event in events if event.data])
                )
                body.request = events[0].request
                body.batched = True

            app = self.server_app
            if app is None:
                raise Exception("Server app has not been set.")

            gr_request = route_utils.compile_gr_request(
                body=body,
                fn=fn,
                username=username,
                request=None,
            )
            assert body.request is not None  # noqa: S101
            root_path = route_utils.get_root_url(
                request=body.request, route_path="/queue/join", root_path=app.root_path
            )
            app.blocks._queue.reload_lock.acquire()
            try:
                response = await route_utils.call_process_api(
                    app=app,
                    body=body,
                    gr_request=gr_request,
                    fn=fn,
                    root_path=root_path,
                )
                err = None
            except Exception as e:
                traceback.print_exc()
                response = None
                err = e
                for event in awake_events:
                    content = error_payload(err, app.get_blocks().show_error)
                    self.send_message(
                        event,
                        ProcessCompletedMessage(
                            output=content,
                            success=False,
                        ),
                    )
            finally:
                app.blocks._queue.reload_lock.release()
            if response and response.get("is_generating", False):
                old_response = response
                old_err = err
                while response and response.get("is_generating", False):
                    old_response = response
                    old_err = err
                    for event in awake_events:
                        self.send_message(
                            event,
                            ProcessGeneratingMessage(
                                output=old_response,
                                success=old_response is not None,
                            ),
                        )
                    awake_events = [event for event in awake_events if event.alive]
                    if not awake_events:
                        return

                    app.blocks._queue.reload_lock.acquire()
                    try:
                        response = await route_utils.call_process_api(
                            app=app,
                            body=body,
                            gr_request=gr_request,
                            fn=fn,
                            root_path=root_path,
                        )
                    except Exception as e:
                        traceback.print_exc()
                        response = None
                        err = e
                    finally:
                        app.blocks._queue.reload_lock.release()

                if response:
                    success = True
                    output = response
                else:
                    success = False
                    error = err or old_err
                    output = error_payload(error, app.get_blocks().show_error)
                for event in awake_events:
                    self.send_message(
                        event, ProcessCompletedMessage(output=output, success=success)
                    )

            elif response:
                output = copy.deepcopy(response)
                for e, event in enumerate(awake_events):
                    if batch and "data" in output:
                        output["data"] = list(zip(*response.get("data")))[e]
                    success = response is not None
                    self.send_message(
                        event,
                        ProcessCompletedMessage(
                            output=output,
                            success=success,
                        ),
                    )
            end_time = time.time()
            if response is not None:
                duration = end_time - begin_time
                self.process_time_per_fn[events[0].fn].add(duration)
                for event in events:
                    self.event_analytics[event._id]["process_time"] = duration
        except Exception as e:
            traceback.print_exc()
        finally:
            event_queue = self.event_queue_per_concurrency_id[events[0].concurrency_id]
            event_queue.current_concurrency -= 1
            start_times = event_queue.start_times_per_fn[fn]
            if begin_time in start_times:
                start_times.remove(begin_time)
            try:
                self.active_jobs[self.active_jobs.index(events)] = None
            except ValueError:
                # `events` can be absent from `self.active_jobs`
                # when this coroutine is called from the `join_queue` endpoint handler in `routes.py`
                # without putting the `events` into `self.active_jobs`.
                # https://github.com/gradio-app/gradio/blob/f09aea34d6bd18c1e2fef80c86ab2476a6d1dd83/gradio/routes.py#L594-L596
                pass
            for event in events:
                # Always reset the state of the iterator
                # If the job finished successfully, this has no effect
                # If the job is cancelled, this will enable future runs
                # to start "from scratch"
                await self.reset_iterators(event._id)

                if event in awake_events:
                    self.event_analytics[event._id]["status"] = (
                        "success" if success else "failed"
                    )
                else:
                    self.event_analytics[event._id]["status"] = "cancelled"

    async def reset_iterators(self, event_id: str):
        # Do the same thing as the /reset route
        app = self.server_app
        if app is None:
            raise Exception("Server app has not been set.")
        if event_id not in app.iterators:
            # Failure, but don't raise an error
            return
        async with app.lock:
            del app.iterators[event_id]
            app.iterators_to_reset.add(event_id)
        return
