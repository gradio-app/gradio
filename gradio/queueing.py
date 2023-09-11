from __future__ import annotations

import asyncio
import copy
import json
import time
import traceback
from asyncio import TimeoutError as AsyncTimeOutError
from collections import deque
from typing import Any

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


class Event:
    def __init__(
        self,
        websocket: fastapi.WebSocket,
        session_hash: str,
        fn_index: int,
    ):
        self.websocket = websocket
        self.session_hash: str = session_hash
        self.fn_index: int = fn_index
        self._id = f"{self.session_hash}_{self.fn_index}"
        self.data: PredictBody | None = None
        self.lost_connection_time: float | None = None
        self.username: str | None = None
        self.progress: Progress | None = None
        self.progress_pending: bool = False
        self.log_messages: deque[LogMessage] = deque()

    async def disconnect(self, code: int = 1000):
        await self.websocket.close(code=code)


class Queue:
    def __init__(
        self,
        live_updates: bool,
        concurrency_count: int,
        update_intervals: float,
        max_size: int | None,
        blocks_dependencies: list,
    ):
        self.event_queue: deque[Event] = deque()
        self.events_pending_reconnection = []
        self.stopped = False
        self.max_thread_count = concurrency_count
        self.update_intervals = update_intervals
        self.active_jobs: list[None | list[Event]] = [None] * concurrency_count
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
        self.blocks_dependencies = blocks_dependencies
        self.continuous_tasks: list[Event] = []

    async def start(self, ssl_verify=True):
        run_coro_in_background(self.start_processing)
        run_coro_in_background(self.start_log_and_progress_updates)
        if not self.live_updates:
            run_coro_in_background(self.notify_clients)

    def close(self):
        self.stopped = True

    def resume(self):
        self.stopped = False

    def set_server_app(self, app: routes.App):
        self.server_app = app

    def get_active_worker_count(self) -> int:
        count = 0
        for worker in self.active_jobs:
            if worker is not None:
                count += 1
        return count

    def get_events_in_batch(self) -> tuple[list[Event] | None, bool]:
        if not (self.event_queue):
            return None, False

        first_event = self.event_queue.popleft()
        events = [first_event]

        event_fn_index = first_event.fn_index
        batch = self.blocks_dependencies[event_fn_index]["batch"]

        if batch:
            batch_size = self.blocks_dependencies[event_fn_index]["max_batch_size"]
            rest_of_batch = [
                event for event in self.event_queue if event.fn_index == event_fn_index
            ][: batch_size - 1]
            events.extend(rest_of_batch)
            [self.event_queue.remove(event) for event in rest_of_batch]

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
                task = run_coro_in_background(self.process_events, events, batch)
                run_coro_in_background(self.broadcast_live_estimations)
                set_task_name(task, events[0].session_hash, events[0].fn_index, batch)

    async def start_log_and_progress_updates(self) -> None:
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
                    client_awake = await self.send_message(event, event.progress.dict())
                    if not client_awake:
                        await self.clean_event(event)
                await self.send_log_updates_for_event(event)

            await asyncio.sleep(self.progress_update_sleep_when_free)

    async def send_log_updates_for_event(self, event: Event) -> None:
        while True:
            try:
                message = event.log_messages.popleft()
            except IndexError:
                break
            client_awake = await self.send_message(event, message.dict())
            if not client_awake:
                await self.clean_event(event)

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
                event.log_messages.append(log_message)

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

    async def clean_event(self, event: Event) -> None:
        if event in self.event_queue:
            async with self.delete_lock:
                self.event_queue.remove(event)

    async def broadcast_live_estimations(self) -> None:
        """
        Runs 2 functions sequentially instead of concurrently. Otherwise dced clients are tried to get deleted twice.
        """
        if self.live_updates:
            await self.broadcast_estimations()

    async def gather_event_data(self, event: Event, receive_timeout=60) -> bool:
        """
        Gather data for the event
        Parameters:
            event: the Event to gather data for
            receive_timeout: how long to wait for data to be received from frontend
        """
        if not event.data:
            client_awake = await self.send_message(event, {"msg": "send_data"})
            if not client_awake:
                return False
            data, client_awake = await self.get_message(event, timeout=receive_timeout)
            if not client_awake:
                # In the event, we timeout due to large data size
                # Let the client know, otherwise will hang
                await self.send_message(
                    event,
                    {
                        "msg": "process_completed",
                        "output": {"error": "Time out uploading data to server"},
                        "success": False,
                    },
                )
                return False
            event.data = data
        return True

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
        client_awake = await self.send_message(event, estimation.dict())
        if not client_awake:
            await self.clean_event(event)
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

    def get_request_params(self, websocket: fastapi.WebSocket) -> dict[str, Any]:
        params = {
            "url": str(websocket.url),
            "headers": dict(websocket.headers),
            "query_params": dict(websocket.query_params),
            "path_params": dict(websocket.path_params),
            "client": {"host": websocket.client.host, "port": websocket.client.port},  # type: ignore
        }
        try:
            params[
                "session"
            ] = websocket.session  # forward OAuth information if available
        except Exception:
            pass
        return params

    async def call_prediction(self, events: list[Event], batch: bool):
        body = events[0].data
        assert body is not None, "No event data"
        username = events[0].username
        body.event_id = events[0]._id if not batch else None
        try:
            body.request = self.get_request_params(events[0].websocket)
        except ValueError:
            pass

        if batch:
            body.data = list(zip(*[event.data.data for event in events if event.data]))
            body.request = [
                self.get_request_params(event.websocket)
                for event in events
                if event.data
            ]
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
                client_awake = await self.gather_event_data(event)
                if client_awake:
                    client_awake = await self.send_message(
                        event, {"msg": "process_starts"}
                    )
                if client_awake:
                    awake_events.append(event)
            if not awake_events:
                return
            begin_time = time.time()
            try:
                response = await self.call_prediction(awake_events, batch)
                err = None
            except Exception as e:
                response = None
                err = e
                for event in awake_events:
                    await self.send_message(
                        event,
                        {
                            "msg": "process_completed",
                            "output": {"error": str(e)},
                            "success": False,
                        },
                    )
            if response and response.get("is_generating", False):
                old_response = response
                old_err = err
                while response and response.get("is_generating", False):
                    old_response = response
                    old_err = err
                    open_ws = []
                    for event in awake_events:
                        open = await self.send_message(
                            event,
                            {
                                "msg": "process_generating",
                                "output": old_response,
                                "success": old_response is not None,
                            },
                        )
                        open_ws.append(open)
                    awake_events = [
                        e for e, is_open in zip(awake_events, open_ws) if is_open
                    ]
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
                    await self.send_log_updates_for_event(event)
                    await self.send_message(
                        event,
                        {
                            "msg": "process_completed",
                            "output": {"error": str(relevant_response)}
                            if isinstance(relevant_response, Exception)
                            else relevant_response,
                            "success": relevant_response
                            and not isinstance(relevant_response, Exception),
                        },
                    )
            elif response:
                output = copy.deepcopy(response)
                for e, event in enumerate(awake_events):
                    if batch and "data" in output:
                        output["data"] = list(zip(*response.get("data")))[e]
                    await self.send_log_updates_for_event(
                        event
                    )  # clean out pending log updates first
                    await self.send_message(
                        event,
                        {
                            "msg": "process_completed",
                            "output": output,
                            "success": response is not None,
                        },
                    )
            end_time = time.time()
            if response is not None:
                self.update_estimation(end_time - begin_time)
        except Exception as e:
            print(e)
        finally:
            for event in awake_events:
                try:
                    await event.disconnect()
                except Exception:
                    pass
            self.active_jobs[self.active_jobs.index(events)] = None
            for event in events:
                await self.clean_event(event)
                # Always reset the state of the iterator
                # If the job finished successfully, this has no effect
                # If the job is cancelled, this will enable future runs
                # to start "from scratch"
                await self.reset_iterators(event.session_hash, event.fn_index)

    async def send_message(self, event, data: dict, timeout: float | int = 1) -> bool:
        try:
            await asyncio.wait_for(
                event.websocket.send_json(data=data), timeout=timeout
            )
            return True
        except Exception:
            await self.clean_event(event)
            return False

    async def get_message(self, event, timeout=5) -> tuple[PredictBody | None, bool]:
        try:
            data = await asyncio.wait_for(
                event.websocket.receive_json(), timeout=timeout
            )
            return PredictBody(**data), True
        except AsyncTimeOutError:
            await self.clean_event(event)
            return None, False

    async def reset_iterators(self, session_hash: str, fn_index: int):
        # Do the same thing as the /reset route
        app = self.server_app
        if app is None:
            raise Exception("Server app has not been set.")
        if session_hash not in app.iterators:
            # Failure, but don't raise an error
            return
        async with app.lock:
            app.iterators[session_hash][fn_index] = None
            app.iterators_to_reset[session_hash].add(fn_index)
        return
