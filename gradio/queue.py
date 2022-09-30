from __future__ import annotations

import asyncio
import json
import time
from typing import Dict, List, Optional

import fastapi
from pydantic import BaseModel

from gradio.utils import Request, run_coro_in_background


class Estimation(BaseModel):
    msg: Optional[str] = "estimation"
    rank: Optional[int] = None
    queue_size: int
    avg_event_process_time: Optional[float]
    avg_event_concurrent_process_time: Optional[float]
    rank_eta: Optional[int] = None
    queue_eta: int


class Queue:
    def __init__(
        self,
        live_updates: bool,
        concurrency_count: int,
        data_gathering_start: int,
        update_intervals: int,
        max_size: Optional[int],
    ):
        self.event_queue = []
        self.events_pending_reconnection = []
        self.stopped = False
        self.max_thread_count = concurrency_count
        self.data_gathering_start = data_gathering_start
        self.update_intervals = update_intervals
        self.active_jobs: List[None | Event] = [None] * concurrency_count
        self.delete_lock = asyncio.Lock()
        self.server_path = None
        self.duration_history_total = 0
        self.duration_history_count = 0
        self.avg_process_time = None
        self.avg_concurrent_process_time = None
        self.queue_duration = 1
        self.live_updates = live_updates
        self.sleep_when_free = 0.05
        self.max_size = max_size

    async def start(self):
        run_coro_in_background(self.start_processing)
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

    async def start_processing(self) -> None:
        while not self.stopped:
            if not self.event_queue:
                await asyncio.sleep(self.sleep_when_free)
                continue

            if not (None in self.active_jobs):
                await asyncio.sleep(self.sleep_when_free)
                continue

            # Using mutex to avoid editing a list in use
            async with self.delete_lock:
                event = self.event_queue.pop(0)

            self.active_jobs[self.active_jobs.index(None)] = event
            run_coro_in_background(self.process_event, event)
            run_coro_in_background(self.broadcast_live_estimations)

    def push(self, event: Event) -> int | None:
        """
        Add event to queue, or return None if Queue is full
        Parameters:
            event: Event to add to Queue
        Returns:
            rank of submitted Event
        """
        if self.max_size is not None and len(self.event_queue) >= self.max_size:
            return None
        self.event_queue.append(event)
        return len(self.event_queue) - 1

    async def clean_event(self, event: Event) -> None:
        if event in self.event_queue:
            async with self.delete_lock:
                self.event_queue.remove(event)
        elif event in self.active_jobs:
            self.active_jobs[self.active_jobs.index(event)] = None

    async def broadcast_live_estimations(self) -> None:
        """
        Runs 2 functions sequentially instead of concurrently. Otherwise dced clients are tried to get deleted twice.
        """
        if self.live_updates:
            await self.broadcast_estimations()

    async def gather_data_for_first_ranks(self) -> None:
        """
        Gather data for the first x events.
        """
        # Send all messages concurrently
        await asyncio.gather(
            *[
                self.gather_event_data(event)
                for event in self.event_queue[: self.data_gathering_start]
            ]
        )

    async def gather_event_data(self, event: Event) -> None:
        """
        Gather data for the event

        Parameters:
            event:
        """
        if not event.data:
            client_awake = await self.send_message(event, {"msg": "send_data"})
            if not client_awake:
                return False
            event.data = await self.get_message(event)
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

    async def call_prediction(self, event: Event):
        response = await Request(
            method=Request.Method.POST,
            url=f"{self.server_path}api/predict",
            json=event.data,
        )
        return response

    async def process_event(self, event: Event) -> None:
        try:
            client_awake = await self.gather_event_data(event)
            if not client_awake:
                return
            client_awake = await self.send_message(event, {"msg": "process_starts"})
            if not client_awake:
                return
            begin_time = time.time()
            response = await self.call_prediction(event)
            if response.has_exception:
                await self.send_message(
                    event,
                    {
                        "msg": "process_completed",
                        "output": {"error": str(response.exception)},
                        "success": False,
                    },
                )
            elif response.json.get("is_generating", False):
                while response.json.get("is_generating", False):
                    old_response = response
                    await self.send_message(
                        event,
                        {
                            "msg": "process_generating",
                            "output": old_response.json,
                            "success": old_response.status == 200,
                        },
                    )
                    response = await self.call_prediction(event)
                await self.send_message(
                    event,
                    {
                        "msg": "process_completed",
                        "output": old_response.json,
                        "success": old_response.status == 200,
                    },
                )
            else:
                await self.send_message(
                    event,
                    {
                        "msg": "process_completed",
                        "output": response.json,
                        "success": response.status == 200,
                    },
                )
            end_time = time.time()
            if response.status == 200:
                self.update_estimation(end_time - begin_time)
        finally:
            try:
                await event.disconnect()
            except Exception:
                pass
            finally:
                await self.clean_event(event)

    async def send_message(self, event, data: Dict) -> bool:
        try:
            await event.websocket.send_json(data=data)
            return True
        except:
            await self.clean_event(event)
            return False

    async def get_message(self, event) -> Optional[Dict]:
        try:
            data = await event.websocket.receive_json()
            return data
        except:
            await self.clean_event(event)
            return None


class Event:
    def __init__(self, websocket: fastapi.WebSocket):
        from gradio.routes import PredictBody

        self.websocket = websocket
        self.data: PredictBody | None = None
        self.lost_connection_time: float | None = None

    async def disconnect(self, code=1000):
        await self.websocket.close(code=code)
