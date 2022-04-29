from __future__ import annotations

import asyncio
import json
from typing import Optional, Tuple

import requests

from gradio.routes import QueuePushBody


class Queue:
    QUEUE = []
    STOP = False
    ID = 0
    CURRENT = None

    @classmethod
    def init(cls) -> None:
        cls.QUEUE = []

    @classmethod
    def close(cls):
        cls.STOP = True

    @classmethod
    async def start_queuing(cls, path_to_local_server: str) -> None:
        while not cls.STOP:
            try:
                await asyncio.sleep(1)
                if cls.QUEUE:
                    next_job = cls.QUEUE.pop()
                else:
                    continue

                if next_job is not None:
                    (id, input_data, task_type) = next_job
                    cls.CURRENT = id
                    response = requests.post(
                        path_to_local_server + "api/" + task_type + "/", json=input_data
                    )
                    if response.status_code == 200:
                        cls.send_response(response.json())
                    else:
                        cls.send_response(response.text)
                    cls.CURRENT = None
                else:
                    continue
            except:
                continue

    @classmethod
    def push(cls, body: QueuePushBody) -> int:
        action = body.action
        input_data = json.dumps({"data": body.data})

        cls.QUEUE.append((cls.ID, action, input_data))
        cls.ID += 1
        return cls.ID - 1

    @classmethod
    def get_status(cls, id) -> Tuple[str, Optional[int]]:
        if id == cls.CURRENT:
            return "PENDING", None
        index = 0
        found = False
        for element_id, _, _ in cls.QUEUE:
            if element_id == id:
                found = True
                break
            index += 1

        if found:
            return "PENDING", index
        else:
            return "NOT FOUND", None

    @classmethod
    def send_response(cls, response: str | dict) -> None:
        # TODO: Send response to the frontend
        raise NotImplementedError
