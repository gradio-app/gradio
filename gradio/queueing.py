from __future__ import annotations

import asyncio
import copy
import json
import os
import time
import traceback
import uuid
from queue import Queue as ThreadQueue
from typing import TYPE_CHECKING

import fastapi
from typing_extensions import Literal

from gradio import route_utils, routes
from gradio.data_classes import (
    Estimation,
    LogMessage,
    PredictBody,
    Progress,
    ProgressUnit,
)
from gradio.exceptions import Error
from gradio.helpers import TrackedIterable
from gradio.utils import run_coro_in_background, safe_get_lock, set_task_name

if TYPE_CHECKING:
    from gradio.blocks import BlockFunction


class Event:
    def __init__(
        self,
        session_hash: str,
        fn_index: int,
        request: fastapi.Request,
        username: str | None,
    ):
        self.message_queue = ThreadQueue()
        self.session_hash = session_hash
        self.fn_index = fn_index
        self.request = request
        self.username = username
        self._id = uuid.uuid4().hex
        self.data: PredictBody | None = None
        self.progress: Progress | None = None
        self.progress_pending: bool = False
        self.alive = True

    def send_message(
        self,
        message_type: str,
        data: dict | None = None,
        final: bool = False,
    ):
        data = {} if data is None else data
        self.message_queue.put_nowait({"msg": message_type, **data})
        if final:
            self.message_queue.put_nowait(None)

    async def get_data(self, timeout=5) -> bool:
        self.send_message("send_data", {"event_id": self._id})
        sleep_interval = 0.05
        wait_time = 0
        while wait_time < timeout and self.alive:
            if self.data is not None:
                break
            await asyncio.sleep(sleep_interval)
            wait_time += sleep_interval
        return self.data is not None


class Queue:
    def __init__(
        self,
        live_updates: bool,
        concurrency_count: int,
        update_intervals: float,
        max_size: int | None,
        block_fns: list[BlockFunction],
        default_concurrency_limit: int | None | Literal["not_set"] = "not_set",
    ):
        self.event_queue: list[Event] = []
        self.awaiting_data_events: dict[str, Event] = {}
        self.stopped = False
        self.max_thread_count = concurrency_count
        self.update_intervals = update_intervals
        self.active_jobs: list[None | list[Event]] = []
        self.delete_lock = safe_get_lock()
        self.server_app = None
        self.duration_history_total = 0
        self.duration_history_count = 0
        self.avg_process_time = 0
        self.avg_concurrent_process_time = None
        self.queue_duration = 1
        self.live_updates = live_updates
        self.sleep_when_free = 0.05
        self.progress_update_sleep_when_free = 0.1
        self.max_size = max_size
        self.block_fns = block_fns
        self.continuous_tasks: list[Event] = []
        self._asyncio_tasks: list[asyncio.Task] = []
        self.default_concurrency_limit = self._resolve_concurrency_limit(
            default_concurrency_limit
        )
        self.concurrency_limit_per_concurrency_id = {}

    def start(self):
        self.active_jobs = [None] * self.max_thread_count
        for block_fn in self.block_fns:
            concurrency_limit = (
                self.default_concurrency_limit
                if block_fn.concurrency_limit == "default"
                else block_fn.concurrency_limit
            )
            if concurrency_limit is not None:
                self.concurrency_limit_per_concurrency_id[
                    block_fn.concurrency_id
                ] = min(
                    self.concurrency_limit_per_concurrency_id.get(
                        block_fn.concurrency_id, concurrency_limit
                    ),
                    concurrency_limit,
                )

        run_coro_in_background(self.start_processing)
        run_coro_in_background(self.start_progress_updates)
        if not self.live_updates:
            run_coro_in_background(self.notify_clients)

    def close(self):
        self.stopped = True

    def _resolve_concurrency_limit(self, default_concurrency_limit):
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

    def attach_data(self, body: PredictBody):
        event_id = body.event_id
        if event_id in self.awaiting_data_events:
            event = self.awaiting_data_events[event_id]
            event.data = body
        else:
            raise ValueError("Event not found", event_id)

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

    def get_events_in_batch(self) -> tuple[list[Event] | None, bool]:
        if not self.event_queue:
            return None, False

        worker_count_per_concurrency_id = {}
        for job in self.active_jobs:
            if job is not None:
                for event in job:
                    concurrency_id = self.block_fns[event.fn_index].concurrency_id
                    worker_count_per_concurrency_id[concurrency_id] = (
                        worker_count_per_concurrency_id.get(concurrency_id, 0) + 1
                    )

        events = []
        batch = False
        for index, event in enumerate(self.event_queue):
            block_fn = self.block_fns[event.fn_index]
            concurrency_id = block_fn.concurrency_id
            concurrency_limit = self.concurrency_limit_per_concurrency_id.get(
                concurrency_id, None
            )
            existing_worker_count = worker_count_per_concurrency_id.get(
                concurrency_id, 0
            )
            if concurrency_limit is None or existing_worker_count < concurrency_limit:
                batch = block_fn.batch
                if batch:
                    batch_size = block_fn.max_batch_size
                    if concurrency_limit is None:
                        remaining_worker_count = batch_size - 1
                    else:
                        remaining_worker_count = (
                            concurrency_limit - existing_worker_count
                        )
                    rest_of_batch = [
                        event
                        for event in self.event_queue[index:]
                        if event.fn_index == event.fn_index
                    ][: min(batch_size - 1, remaining_worker_count)]
                    events = [event] + rest_of_batch
                else:
                    events = [event]
                break

        for event in events:
            self.event_queue.remove(event)

        return events, batch

    async def start_processing(self) -> None:
        while not self.stopped:
            if not self.event_queue:
                await asyncio.sleep(self.sleep_when_free)
                continue

            if None not in self.active_jobs:
                await asyncio.sleep(self.sleep_when_free)
                continue
            # Using mutex to avoid editing a list in use
            async with self.delete_lock:
                events, batch = self.get_events_in_batch()

            if events:
                self.active_jobs[self.active_jobs.index(None)] = events
                process_event_task = run_coro_in_background(
                    self.process_events, events, batch
                )
                set_task_name(
                    process_event_task,
                    events[0].session_hash,
                    events[0].fn_index,
                    batch,
                )

                self._asyncio_tasks.append(process_event_task)
                if self.live_updates:
                    broadcast_live_estimations_task = run_coro_in_background(
                        self.broadcast_estimations
                    )
                    self._asyncio_tasks.append(broadcast_live_estimations_task)
            else:
                await asyncio.sleep(self.sleep_when_free)

    async def start_progress_updates(self) -> None:
        """
        Because progress updates can be very frequent, we do not necessarily want to send a message per update.
        Rather, we check for progress updates at regular intervals, and send a message if there is a pending update.
        Consecutive progress updates between sends will overwrite each other so only the most recent update will be sent.
        """
        while not self.stopped:
            events = [
                evt for job in self.active_jobs if job is not None for evt in job
            ] + self.continuous_tasks

            if len(events) == 0:
                await asyncio.sleep(self.progress_update_sleep_when_free)
                continue

            for event in events:
                if event.progress_pending and event.progress:
                    event.progress_pending = False
                    event.send_message("progress", event.progress.model_dump())

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
                    evt.progress = Progress(progress_data=progress_data)
                    evt.progress_pending = True

    def log_message(
        self,
        event_id: str,
        log: str,
        level: Literal["info", "warning"],
    ):
        events = [
            evt for job in self.active_jobs if job is not None for evt in job
        ] + self.continuous_tasks
        for event in events:
            if event._id == event_id:
                log_message = LogMessage(
                    log=log,
                    level=level,
                )
                event.send_message("log", log_message.model_dump())

    def push(self, event: Event) -> int | None:
        """
        Add event to queue, or return None if Queue is full
        Parameters:
            event: Event to add to Queue
        Returns:
            rank of submitted Event
        """
        queue_len = len(self.event_queue)
        if self.max_size is not None and queue_len >= self.max_size:
            return None
        self.event_queue.append(event)
        return queue_len

    async def clean_event(self, event: Event | str) -> None:
        if isinstance(event, str):
            for job_set in self.active_jobs:
                if job_set:
                    for job in job_set:
                        if job._id == event:
                            event = job
                            break
        if isinstance(event, str):
            raise ValueError("Event not found", event)
        event.alive = False
        if event in self.event_queue:
            async with self.delete_lock:
                self.event_queue.remove(event)

    async def notify_clients(self) -> None:
        """
        Notify clients about events statuses in the queue periodically.
        """
        while not self.stopped:
            await asyncio.sleep(self.update_intervals)
            if self.event_queue:
                await self.broadcast_estimations()

    async def broadcast_estimations(self) -> None:
        estimation = self.get_estimation()
        # Send all messages concurrently
        await asyncio.gather(
            *[
                self.send_estimation(event, estimation, rank)
                for rank, event in enumerate(self.event_queue)
            ]
        )

    async def send_estimation(
        self, event: Event, estimation: Estimation, rank: int
    ) -> Estimation:
        """
        Send estimation about ETA to the client.

        Parameters:
            event:
            estimation:
            rank:
        """
        estimation.rank = rank

        if self.avg_concurrent_process_time is not None:
            estimation.rank_eta = (
                estimation.rank * self.avg_concurrent_process_time
                + self.avg_process_time
            )
            if None not in self.active_jobs:
                # Add estimated amount of time for a thread to get empty
                estimation.rank_eta += self.avg_concurrent_process_time
        event.send_message("estimation", estimation.model_dump())
        return estimation

    def update_estimation(self, duration: float) -> None:
        """
        Update estimation by last x element's average duration.

        Parameters:
            duration:
        """
        self.duration_history_total += duration
        self.duration_history_count += 1
        self.avg_process_time = (
            self.duration_history_total / self.duration_history_count
        )
        self.avg_concurrent_process_time = self.avg_process_time / min(
            self.max_thread_count, self.duration_history_count
        )
        self.queue_duration = self.avg_concurrent_process_time * len(self.event_queue)

    def get_estimation(self) -> Estimation:
        return Estimation(
            queue_size=len(self.event_queue),
            avg_event_process_time=self.avg_process_time,
            avg_event_concurrent_process_time=self.avg_concurrent_process_time,
            queue_eta=self.queue_duration,
        )

    async def call_prediction(self, events: list[Event], batch: bool):
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
            body.data = list(zip(*[event.data.data for event in events if event.data]))
            body.request = events[0].request
            body.batched = True

        app = self.server_app
        if app is None:
            raise Exception("Server app has not been set.")
        api_name = "predict"

        fn_index_inferred = route_utils.infer_fn_index(
            app=app, api_name=api_name, body=body
        )

        gr_request = route_utils.compile_gr_request(
            app=app,
            body=body,
            fn_index_inferred=fn_index_inferred,
            username=username,
            request=None,
        )

        try:
            output = await route_utils.call_process_api(
                app=app,
                body=body,
                gr_request=gr_request,
                fn_index_inferred=fn_index_inferred,
            )
        except Exception as error:
            show_error = app.get_blocks().show_error or isinstance(error, Error)
            traceback.print_exc()
            raise Exception(str(error) if show_error else None) from error

        # To emulate the HTTP response from the predict API,
        # convert the output to a JSON response string.
        # This is done by FastAPI automatically in the HTTP endpoint handlers,
        # but we need to do it manually here.
        response_class = app.router.default_response_class
        if isinstance(response_class, fastapi.datastructures.DefaultPlaceholder):
            actual_response_class = response_class.value
        else:
            actual_response_class = response_class
        http_response = actual_response_class(
            output
        )  # Do the same as https://github.com/tiangolo/fastapi/blob/0.87.0/fastapi/routing.py#L264
        # Also, decode the JSON string to a Python object, emulating the HTTP client behavior e.g. the `json()` method of `httpx`.
        response_json = json.loads(http_response.body.decode())

        return response_json

    async def process_events(self, events: list[Event], batch: bool) -> None:
        awake_events: list[Event] = []
        try:
            for event in events:
                if not event.data:
                    self.awaiting_data_events[event._id] = event
                    client_awake = await event.get_data()
                    del self.awaiting_data_events[event._id]
                    if not client_awake:
                        await self.clean_event(event)
                        continue
                event.send_message("process_starts")
                awake_events.append(event)
            if not awake_events:
                return
            begin_time = time.time()
            try:
                response = await self.call_prediction(awake_events, batch)
                err = None
            except Exception as e:
                traceback.print_exc()
                response = None
                err = e
                for event in awake_events:
                    event.send_message(
                        "process_completed",
                        {
                            "output": {
                                "error": None
                                if len(e.args) and e.args[0] is None
                                else str(e)
                            },
                            "success": False,
                        },
                        final=True,
                    )
            if response and response.get("is_generating", False):
                old_response = response
                old_err = err
                while response and response.get("is_generating", False):
                    old_response = response
                    old_err = err
                    for event in awake_events:
                        event.send_message(
                            "process_generating",
                            {
                                "output": old_response,
                                "success": old_response is not None,
                            },
                        )
                    awake_events = [event for event in awake_events if event.alive]
                    if not awake_events:
                        return
                    try:
                        response = await self.call_prediction(awake_events, batch)
                        err = None
                    except Exception as e:
                        response = None
                        err = e
                for event in awake_events:
                    if response is None:
                        relevant_response = err
                    else:
                        relevant_response = old_response or old_err
                    event.send_message(
                        "process_completed",
                        {
                            "output": {"error": str(relevant_response)}
                            if isinstance(relevant_response, Exception)
                            else relevant_response,
                            "success": relevant_response
                            and not isinstance(relevant_response, Exception),
                        },
                        final=True,
                    )
            elif response:
                output = copy.deepcopy(response)
                for e, event in enumerate(awake_events):
                    if batch and "data" in output:
                        output["data"] = list(zip(*response.get("data")))[e]
                    event.send_message(
                        "process_completed",
                        {
                            "output": output,
                            "success": response is not None,
                        },
                        final=True,
                    )
            end_time = time.time()
            if response is not None:
                self.update_estimation(end_time - begin_time)
        except Exception as e:
            traceback.print_exc()
        finally:
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
