from __future__ import annotations

import asyncio
import json
import time
from typing import List, Optional

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
    EVENT_QUEUE = []
    STOP = False
    CURRENT = None
    MAX_THREAD_COUNT = 1
    DATA_GATHERING_STARTS_AT = 30
    UPDATE_INTERVALS = 10
    ACTIVE_JOBS: List[None | Event] = [None]
    DELETE_LOCK = asyncio.Lock()
    SERVER_PATH = None
    DURATION_HISTORY_TOTAL = 0
    DURATION_HISTORY_COUNT = 0
    AVG_PROCESS_TIME = None
    AVG_CONCURRENT_PROCESS_TIME = None
    QUEUE_DURATION = 1
    LIVE_UPDATES = True
    SLEEP_WHEN_FREE = 0.001

    @classmethod
    def configure_queue(
        cls,
        live_updates: bool,
        concurrency_count: int,
        data_gathering_start: int,
        update_intervals: int,
    ):
        """
        See Blocks.configure_queue() docstring for the explanation of parameters.
        """
        cls.LIVE_UPDATES = live_updates
        cls.MAX_THREAD_COUNT = concurrency_count
        cls.DATA_GATHERING_STARTS_AT = data_gathering_start
        cls.UPDATE_INTERVALS = update_intervals
        cls.ACTIVE_JOBS = [None] * cls.MAX_THREAD_COUNT

    @classmethod
    def set_url(cls, url: str):
        cls.SERVER_PATH = url

    @classmethod
    async def init(
        cls,
    ) -> None:
        run_coro_in_background(Queue.start_processing)
        if not cls.LIVE_UPDATES:
            run_coro_in_background(Queue.notify_clients)

    @classmethod
    def close(cls):
        cls.STOP = True

    @classmethod
    def resume(cls):
        cls.STOP = False

    @classmethod
    def get_active_worker_count(cls) -> int:
        count = 0
        for worker in cls.ACTIVE_JOBS:
            if worker is not None:
                count += 1
        return count

    @classmethod
    async def start_processing(cls) -> None:
        while not cls.STOP:
            if not cls.EVENT_QUEUE:
                await asyncio.sleep(cls.SLEEP_WHEN_FREE)
                continue

            if not (None in cls.ACTIVE_JOBS):
                await asyncio.sleep(1)
                continue

            # Using mutex to avoid editing a list in use
            async with cls.DELETE_LOCK:
                event = cls.EVENT_QUEUE.pop(0)

            cls.ACTIVE_JOBS[cls.ACTIVE_JOBS.index(None)] = event
            run_coro_in_background(cls.process_event, event)
            run_coro_in_background(cls.gather_data_and_broadcast_estimations)

    @classmethod
    def push(cls, event: Event) -> int:
        """
        Add event to queue
        Parameters:
            event: Event to add to Queue
        Returns:
            rank of submitted Event
        """
        cls.EVENT_QUEUE.append(event)
        return len(cls.EVENT_QUEUE) - 1

    @classmethod
    def clean_job(cls, event: Event):
        cls.ACTIVE_JOBS[cls.ACTIVE_JOBS.index(event)] = None

    @classmethod
    async def clean_event(cls, event: Event) -> None:
        # Using mutex to avoid editing a list in use
        async with cls.DELETE_LOCK:
            # TODO: Might log number of cleaned events in the future
            try:  # TODO: Might search with event hash to speed up
                cls.EVENT_QUEUE.remove(event)
            except ValueError as er:
                print(f"{er}, {event}")

    @classmethod
    async def gather_data_and_broadcast_estimations(cls) -> None:
        """
        Runs 2 functions sequentially instead of concurrently. Otherwise dced clients are tried to get deleted twice.
        """
        await cls.gather_data_for_first_ranks()
        if cls.LIVE_UPDATES:
            await cls.broadcast_estimations()

    @classmethod
    async def gather_data_for_first_ranks(cls) -> None:
        """
        Gather data for the first x events.
        """
        # Send all messages concurrently
        await asyncio.gather(
            *[
                cls.gather_event_data(event)
                for event in cls.EVENT_QUEUE[: cls.DATA_GATHERING_STARTS_AT]
            ]
        )

    @classmethod
    async def gather_event_data(cls, event: Event) -> None:
        """
        Gather data for the event

        Parameters:
            event:
        """
        if not event.data:

            client_awake = await event.send_message({"msg": "send_data"})
            if not client_awake:
                await cls.clean_event(event)
                return

            event.data = await event.get_message()

    @classmethod
    async def notify_clients(cls) -> None:
        """
        Notify clients about events statuses in the queue periodically.
        """
        while not cls.STOP:
            await asyncio.sleep(cls.UPDATE_INTERVALS)
            if cls.EVENT_QUEUE:
                await cls.broadcast_estimations()

    @classmethod
    async def broadcast_estimations(cls) -> None:
        estimation = cls.get_estimation()
        # Send all messages concurrently
        await asyncio.gather(
            *[
                cls.send_estimation(event, estimation, rank)
                for rank, event in enumerate(cls.EVENT_QUEUE)
            ]
        )

    @classmethod
    async def send_estimation(
        cls, event: Event, estimation: Estimation, rank: int
    ) -> None:
        """
        Send estimation about ETA to the client.

        Parameters:
            event:
            estimation:
            rank:
        """
        estimation.rank = rank

        if cls.AVG_CONCURRENT_PROCESS_TIME is not None:
            estimation.rank_eta = (
                estimation.rank * cls.AVG_CONCURRENT_PROCESS_TIME + cls.AVG_PROCESS_TIME
            )
            if None not in cls.ACTIVE_JOBS:
                # Add estimated amount of time for a thread to get empty
                estimation.rank_eta += cls.AVG_CONCURRENT_PROCESS_TIME
        client_awake = await event.send_message(estimation.dict())
        if not client_awake:
            await cls.clean_event(event)

    @classmethod
    def update_estimation(cls, duration: float) -> None:
        """
        Update estimation by last x element's average duration.

        Parameters:
            duration:
        """
        cls.DURATION_HISTORY_TOTAL += duration
        cls.DURATION_HISTORY_COUNT += 1
        cls.AVG_PROCESS_TIME = cls.DURATION_HISTORY_TOTAL / cls.DURATION_HISTORY_COUNT
        cls.AVG_CONCURRENT_PROCESS_TIME = cls.AVG_PROCESS_TIME / min(
            cls.MAX_THREAD_COUNT, cls.DURATION_HISTORY_COUNT
        )
        cls.QUEUE_DURATION = cls.AVG_CONCURRENT_PROCESS_TIME * len(cls.EVENT_QUEUE)

    @classmethod
    def get_estimation(cls) -> Estimation:
        return Estimation(
            queue_size=len(cls.EVENT_QUEUE),
            avg_event_process_time=cls.AVG_PROCESS_TIME,
            avg_event_concurrent_process_time=cls.AVG_CONCURRENT_PROCESS_TIME,
            queue_eta=cls.QUEUE_DURATION,
        )

    @classmethod
    async def process_event(cls, event: Event) -> None:
        await cls.gather_event_data(event)  # Make sure we have the data
        client_awake = await event.send_message({"msg": "process_starts"})
        if not client_awake:
            cls.clean_job(event)
            return
        begin_time = time.time()
        response = await Request(
            method=Request.Method.POST,
            url=f"{cls.SERVER_PATH}api/predict",
            json=event.data,
        )
        end_time = time.time()
        cls.update_estimation(end_time - begin_time)
        client_awake = await event.send_message(
            {"msg": "process_completed", "output": response.json}
        )
        if client_awake:
            run_coro_in_background(cls.wait_in_inactive, event)
        cls.clean_job(event)

    @classmethod
    async def wait_in_inactive(cls, event: Event) -> None:
        """
        Waits the event until it receives the join_back message or loses ws connection.
        """
        event.data = None
        client_awake = await event.get_message()
        if client_awake:
            if client_awake.get("msg") == "join_back":
                cls.push(event)
            else:
                await event.disconnect()


class Event:
    def __init__(self, websocket: fastapi.WebSocket):
        from gradio.routes import PredictBody

        self.websocket = websocket
        self.hash = None
        self.data: None | PredictBody = None

    def __repr__(self):
        return f"hash:{self.hash}, data: {self.data}, ws:{self.websocket}"

    async def disconnect(self, code=1000):
        await self.websocket.close(code=code)

    async def send_message(self, data: json) -> bool:
        try:
            await self.websocket.send_json(data=data)
            return True
        except:
            return False

    async def get_message(self) -> (json, bool):
        try:
            data = await self.websocket.receive_json()
            return data
        except:
            return None
