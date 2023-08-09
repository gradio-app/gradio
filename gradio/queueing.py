from __future__ import annotations

import asyncio
import copy
import json
import time
from asyncio import TimeoutError as AsyncTimeOutError
from collections import deque
from typing import Any, Optional

import fastapi
import httpx
from typing_extensions import Literal

from gradio.data_classes import (
    Estimation,
    LogMessage,
    PredictBody,
    Progress,
    ProgressUnit,
)
from gradio.helpers import TrackedIterable
from gradio.utils import AsyncRequest, run_coro_in_background, set_task_name


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
        self.username: Optional[str] = None
        self.progress: Progress | None = None
        self.progress_pending: bool = False
        self.log_messages: deque[LogMessage] = deque()

    async def disconnect(self, code: int = 1000):
        await self.websocket.close(code=code)


class Queue:
    def __init__(
        self,
        app: fastapi.FastAPI,
        live_updates: bool,
        concurrency_count: int,
        update_intervals: float,
        max_size: int | None,
        blocks_dependencies: list,
    ):
        self.app = app
        self.event_queue: deque[Event] = deque()
        self.events_pending_reconnection = []
        self.stopped = False
        self.max_thread_count = concurrency_count
        self.update_intervals = update_intervals
        self.active_jobs: list[None | list[Event]] = [None] * concurrency_count
        self.delete_lock = asyncio.Lock()
        self.server_path = None
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
        self.queue_client = None
        self.continuous_tasks: list[Event] = []

    async def start(self, ssl_verify=True):
        # So that the client is attached to the running event loop
        self.queue_client = httpx.AsyncClient(verify=ssl_verify)

        run_coro_in_background(self.start_processing)
        run_coro_in_background(self.start_log_and_progress_updates)
        if not self.live_updates:
            run_coro_in_background(self.notify_clients)

    def close(self):
        self.stopped = True

    def resume(self):
        self.stopped = False

    def set_url(self, url: str):
        self.server_path = url

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
        return {
            "url": str(websocket.url),
            "headers": dict(websocket.headers),
            "query_params": dict(websocket.query_params),
            "path_params": dict(websocket.path_params),
            "client": {"host": websocket.client.host, "port": websocket.client.port},  # type: ignore
        }

    async def call_prediction(self, events: list[Event], batch: bool) -> fastapi.responses.JSONResponse:
        data = events[0].data
        assert data is not None, "No event data"
        username = events[0].username
        data.event_id = events[0]._id if not batch else None
        try:
            data.request = self.get_request_params(events[0].websocket)
        except ValueError:
            pass

        if batch:
            data.data = list(zip(*[event.data.data for event in events if event.data]))
            data.request = [
                self.get_request_params(event.websocket)
                for event in events
                if event.data
            ]
            data.batched = True

        ## TODO: extract the following code copied from routes.py into a shared function.
        from copy import deepcopy
        import traceback
        from gradio import utils
        from gradio.helpers import EventData
        from gradio.routes import Request
        from gradio.exceptions import Error
        from fastapi.responses import JSONResponse
        api_name = "predict"
        app = self.app
        body = data
        default_response_class = app.router.default_response_class

        fn_index_inferred = None
        if body.fn_index is None:
            for i, fn in enumerate(app.get_blocks().dependencies):
                if fn["api_name"] == api_name:
                    fn_index_inferred = i
                    break
            if fn_index_inferred is None:
                return JSONResponse(
                    content={
                        "error": f"This app has no endpoint /api/{api_name}/."
                    },
                    status_code=500,
                )
        else:
            fn_index_inferred = body.fn_index

        # If this fn_index cancels jobs, then the only input we need is the
        # current session hash
        if app.get_blocks().dependencies[fn_index_inferred]["cancels"]:
            body.data = [body.session_hash]
        if body.request:
            if body.batched:
                gr_request = [
                    Request(username=username, **req) for req in body.request
                ]
            else:
                assert isinstance(body.request, dict)
                gr_request = Request(username=username, **body.request)
        else:
            gr_request = Request(username=username, request=request)  # TODO

        fn_index = body.fn_index
        if hasattr(body, "session_hash"):
            if body.session_hash not in app.state_holder:
                app.state_holder[body.session_hash] = {
                    _id: deepcopy(getattr(block, "value", None))
                    for _id, block in app.get_blocks().blocks.items()
                    if getattr(block, "stateful", False)
                }
            session_state = app.state_holder[body.session_hash]
            # The should_reset set keeps track of the fn_indices
            # that have been cancelled. When a job is cancelled,
            # the /reset route will mark the jobs as having been reset.
            # That way if the cancel job finishes BEFORE the job being cancelled
            # the job being cancelled will not overwrite the state of the iterator.
            if fn_index in app.iterators_to_reset[body.session_hash]:
                iterators = {}
                app.iterators_to_reset[body.session_hash].remove(fn_index)
            else:
                iterators = app.iterators[body.session_hash]
        else:
            session_state = {}
            iterators = {}

        event_id = getattr(body, "event_id", None)
        raw_input = body.data

        dependency = app.get_blocks().dependencies[fn_index_inferred]
        target = dependency["targets"][0] if len(dependency["targets"]) else None
        event_data = EventData(
            app.get_blocks().blocks.get(target) if target else None,
            body.event_data,
        )
        batch = dependency["batch"]
        if not (body.batched) and batch:
            raw_input = [raw_input]
        try:
            with utils.MatplotlibBackendMananger():
                output = await app.get_blocks().process_api(
                    fn_index=fn_index_inferred,
                    inputs=raw_input,
                    request=gr_request,
                    state=session_state,
                    iterators=iterators,
                    event_id=event_id,
                    event_data=event_data,
                )
            iterator = output.pop("iterator", None)
            if hasattr(body, "session_hash"):
                app.iterators[body.session_hash][fn_index] = iterator
            if isinstance(output, Error):
                output = default_response_class(output)  # Added
                raise output
        except BaseException as error:
            show_error = app.get_blocks().show_error or isinstance(error, Error)
            traceback.print_exc()
            return JSONResponse(
                content={"error": str(error) if show_error else None},
                status_code=500,
            )

        if not (body.batched) and batch:
            output["data"] = output["data"][0]

        output = default_response_class(output)  # Added
        return output

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
                response_json = json.loads(response.body.decode("utf-8"))
            except Exception as e:
                response = None
                for event in awake_events:
                    await self.send_message(
                        event,
                        {
                            "msg": "process_completed",
                            "output": {"error": str(e)},
                            "success": False,
                        },
                    )
            if response and response_json.get("is_generating", False):
                old_response = response
                while response_json.get("is_generating", False):
                    old_response = response
                    old_response_json = response_json
                    open_ws = []
                    for event in awake_events:
                        open = await self.send_message(
                            event,
                            {
                                "msg": "process_generating",
                                "output": old_response_json,
                                "success": old_response.status_code == 200,
                            },
                        )
                        open_ws.append(open)
                    awake_events = [
                        e for e, is_open in zip(awake_events, open_ws) if is_open
                    ]
                    if not awake_events:
                        return
                    response = await self.call_prediction(awake_events, batch)
                    response_json = json.loads(response.body.decode("utf-8"))
                for event in awake_events:
                    if response.status_code != 200:
                        relevant_response = response
                    else:
                        relevant_response = old_response
                    relevant_response_json = json.loads(
                        relevant_response.body.decode("utf-8")
                    )
                    await self.send_log_updates_for_event(event)
                    await self.send_message(
                        event,
                        {
                            "msg": "process_completed",
                            "output": relevant_response_json,
                            "success": relevant_response.status_code == 200,
                        },
                    )
            elif response:
                output = copy.deepcopy(response_json)
                for e, event in enumerate(awake_events):
                    if batch and "data" in output:
                        output["data"] = list(zip(*response_json.get("data")))[e]
                    await self.send_log_updates_for_event(
                        event
                    )  # clean out pending log updates first
                    await self.send_message(
                        event,
                        {
                            "msg": "process_completed",
                            "output": output,
                            "success": response.status_code == 200,
                        },
                    )
            end_time = time.time()
            if response.status_code == 200:
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
        # TODO: Replace with a direct function call
        await AsyncRequest(
            method=AsyncRequest.Method.POST,
            url=f"{self.server_path}reset",
            json={
                "session_hash": session_hash,
                "fn_index": fn_index,
            },
            client=self.queue_client,
        )
