from __future__ import annotations

import asyncio
import json
import time
from typing import List, Optional

import fastapi
import httpx
from fastapi import WebSocketDisconnect
from pydantic import BaseModel

from gradio.utils import synchronize_async


class EventBody(BaseModel):
    hash: str


class Estimation(BaseModel):
    message: Optional[str] = "estimation"
    queue_size: int
    queue_duration: int


class Queue:
    EVENT_QUEUE = []
    STOP = False
    CURRENT = None
    MAX_THREAD_COUNT = 1
    DATA_GATHERING_START_AT = 50
    UPDATE_INTERVALS = 5
    ACTIVE_JOBS: List[None | Event] = [None]
    LOCK = asyncio.Lock()
    SERVER_PATH = None
    DURATION_HISTORY_SIZE = 10
    DURATION_HISTORY = []
    ESTIMATION = 1

    @classmethod
    def init(
        cls,
        server_path: str,
        max_thread_count: int = 1,
        data_gathering_start: int = 50,
        update_intervals: int = 5,
        duration_history_size=10,
    ) -> None:
        cls.SERVER_PATH = server_path
        cls.EVENT_QUEUE = []
        cls.MAX_THREAD_COUNT = max_thread_count
        cls.ACTIVE_JOBS = [None] * max_thread_count
        cls.DATA_GATHERING_START_AT = data_gathering_start
        cls.UPDATE_INTERVALS = update_intervals
        cls.DURATION_HISTORY_SIZE = duration_history_size

    @classmethod
    def close(cls):
        cls.STOP = True

    @classmethod
    def resume(cls):
        cls.STOP = False

    @classmethod
    async def start_processing(cls) -> None:
        while not cls.STOP:
            if not cls.EVENT_QUEUE:
                await asyncio.sleep(1)
                continue

            if None in cls.ACTIVE_JOBS:
                # Using mutex to avoid editing a list in use
                async with cls.LOCK:
                    event = cls.EVENT_QUEUE.pop(0)
                cls.ACTIVE_JOBS[cls.ACTIVE_JOBS.index(None)] = event

                synchronize_async(cls.process_event, event)
                await cls.gather_data_for_first_ranks(cls.DATA_GATHERING_START_AT)

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
            try:
                cls.EVENT_QUEUE.remove(event)
            except ValueError:
                pass

    @classmethod
    async def gather_data_for_first_ranks(cls, event_count: int) -> None:
        """
        Gather data for the first x events.

        Args:
            event_count:
        """
        await asyncio.gather(
            *[cls.gather_event_data(event) for event in cls.EVENT_QUEUE[:event_count]]
        )

    @classmethod
    async def gather_event_data(cls, event: Event) -> None:
        """
        Gather data for the event

        Args:
            event:
        """
        if not event.data:
            client_awake = await event.send_message({"message": "send_data"})
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

            if not cls.EVENT_QUEUE:
                continue

            estimation = cls.get_estimation()
            # Send all messages concurrently
            await asyncio.gather(
                *[cls.send_estimation(event, estimation) for event in cls.EVENT_QUEUE]
            )

    @classmethod
    async def send_estimation(cls, event: Event, estimation: Estimation) -> None:
        """
        Send estimation about ETA to the client.

        Args:
            event:
            estimation
        """
        client_awake = await event.send_message(estimation.json())
        if not client_awake:
            await cls.clean_event(event)

    @classmethod
    def update_estimation(cls, duration: float) -> None:
        """
        Update estimation by last x element's average duration.

        Args:
            duration:
        """
        cls.DURATION_HISTORY.append(duration)
        if len(cls.DURATION_HISTORY) > cls.DURATION_HISTORY_SIZE:
            cls.DURATION_HISTORY.pop(0)
        cls.ESTIMATION = round(
            sum(cls.DURATION_HISTORY) / len(cls.DURATION_HISTORY) / cls.MAX_THREAD_COUNT
            + duration,
            2,
        )

    @classmethod
    def get_estimation(cls) -> Estimation:
        return Estimation(
            queue_size=len(cls.EVENT_QUEUE), queue_duration=cls.ESTIMATION
        )

    @classmethod
    async def process_event(cls, event: Event) -> None:
        await cls.gather_event_data(event)  # Make sure we have the data
        client_awake = await event.send_message({"message": "process_starts"})
        if not client_awake:
            cls.clean_job(event)
            return

        # TODO: Move client under Http class after async-request-refactor
        # TODO: Correct the url and data
        async with httpx.AsyncClient() as client:
            begin_time = time.time()
            response = await client.post(
                f"{cls.SERVER_PATH}api/predict", json=event.data
            )
            end_time = time.time()
            cls.update_estimation(duration=round(end_time - begin_time, 3))

            client_awake = await event.send_message(response.json())
            if client_awake:
                await event.disconnect()
            cls.clean_job(event)


class Event:
    def __init__(self, websocket: fastapi.WebSocket, event_body: EventBody):
        from gradio.routes import PredictBody
        self.websocket = websocket
        self.event_body = event_body
        self.data: None | PredictBody = None

    async def disconnect(self, code=1000):
        await self.websocket.close(code=code)

    async def send_message(self, data: json) -> bool:
        try:
            await self.websocket.send_json(data=data)
            return True
        except WebSocketDisconnect:
            return False

    async def get_message(self) -> (json, bool):
        try:
            data = await self.websocket.receive_json()
            return data
        except WebSocketDisconnect:
            return None
