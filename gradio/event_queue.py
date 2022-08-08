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
    rank: Optional[int] = -1
    queue_size: int
    avg_event_process_time: float  # TODO(faruk): might be removed if not used by frontend in the future
    avg_event_concurrent_process_time: float  # TODO(faruk): might be removed if not used by frontend in the future
    rank_eta: Optional[int] = -1
    queue_eta: int


class Queue:
    EVENT_QUEUE = []
    STOP = False
    CURRENT = None
    MAX_THREAD_COUNT = 1
    DATA_GATHERING_STARTS_AT = 30
    UPDATE_INTERVALS = 10
    ACTIVE_JOBS: List[None | Event] = [None]
    LOCK = asyncio.Lock()
    SERVER_PATH = None
    DURATION_HISTORY_SIZE = 100
    DURATION_HISTORY = []
    # When there is no estimation is calculated, default estimation is 1 sec
    AVG_PROCESS_TIME = 1
    AVG_CONCURRENT_PROCESS_TIME = 1
    QUEUE_DURATION = 1
    LIVE_QUEUE_UPDATES = True
    SLEEP_WHEN_FREE = 0.001

    @classmethod
    def configure_queue(
        cls,
        live_queue_updates: bool,
        queue_concurrency_count: int,
        data_gathering_start: int,
        update_intervals: int,
        duration_history_size: int,
    ):
        """
        See Blocks.configure_queue() docstring for the explanation of parameters.
        """
        cls.LIVE_QUEUE_UPDATES = live_queue_updates
        cls.MAX_THREAD_COUNT = queue_concurrency_count
        cls.DATA_GATHERING_STARTS_AT = data_gathering_start
        cls.UPDATE_INTERVALS = update_intervals
        cls.DURATION_HISTORY_SIZE = duration_history_size
        cls.ACTIVE_JOBS = [None] * cls.MAX_THREAD_COUNT

    @classmethod
    def set_url(cls, url: str):
        cls.SERVER_PATH = url

    @classmethod
    async def init(
        cls,
    ) -> None:
        run_coro_in_background(Queue.start_processing)
        if not cls.LIVE_QUEUE_UPDATES:
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

    # TODO: Remove prints
    @classmethod
    async def start_processing(cls) -> None:
        while not cls.STOP:
            if not cls.EVENT_QUEUE:
                await asyncio.sleep(cls.SLEEP_WHEN_FREE)
                continue

            print("Searching for inactive job slots")
            if not (None in cls.ACTIVE_JOBS):
                print("All threads busy")
                await asyncio.sleep(1)
                continue

            # Using mutex to avoid editing a list in use
            async with cls.LOCK:
                print("Start Processing, found inactive job slot, now popping event")
                event = cls.EVENT_QUEUE.pop(0)
                print(f"Start Processing, found event, popped event: {event}")

            cls.ACTIVE_JOBS[cls.ACTIVE_JOBS.index(None)] = event
            run_coro_in_background(cls.process_event, event)
            run_coro_in_background(cls.gather_data_for_first_ranks)
            if cls.LIVE_QUEUE_UPDATES:
                run_coro_in_background(cls.broadcast_estimation)

    @classmethod
    def push(cls, event: Event):
        cls.EVENT_QUEUE.append(event)

    @classmethod
    def clean_job(cls, event: Event):
        cls.ACTIVE_JOBS[cls.ACTIVE_JOBS.index(event)] = None

    @classmethod
    async def clean_event(cls, event: Event) -> None:
        # Using mutex to avoid editing a list in use
        async with cls.LOCK:
            # TODO: Might log number of cleaned events in the future
            try:  # TODO: Might search with event hash to speed up
                cls.EVENT_QUEUE.remove(event)
            except ValueError:
                pass

    @classmethod
    async def gather_data_for_first_ranks(cls) -> None:
        """
        Gather data for the first x events.
        """
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
            print(f"Event Queue: {cls.EVENT_QUEUE}")
            if cls.EVENT_QUEUE:
                await cls.broadcast_estimation()

    @classmethod
    async def broadcast_estimation(cls) -> None:
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
        estimation.rank_eta = round(
            estimation.rank * cls.AVG_CONCURRENT_PROCESS_TIME + cls.AVG_PROCESS_TIME
        )
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
        cls.DURATION_HISTORY.append(duration)
        if len(cls.DURATION_HISTORY) > cls.DURATION_HISTORY_SIZE:
            cls.DURATION_HISTORY.pop(0)
        duration_history_size = len(cls.DURATION_HISTORY)
        cls.AVG_PROCESS_TIME = round(
            sum(cls.DURATION_HISTORY) / duration_history_size, 2
        )
        cls.AVG_CONCURRENT_PROCESS_TIME = round(
            cls.AVG_PROCESS_TIME / max(cls.MAX_THREAD_COUNT, duration_history_size), 2
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
        print(f"Process starts for event: {event.hash}")
        begin_time = time.time()
        response = await Request(
            method=Request.Method.POST,
            url=f"{cls.SERVER_PATH}api/predict",
            json=event.data,
        )
        end_time = time.time()
        cls.update_estimation(duration=round(end_time - begin_time, 3))
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
