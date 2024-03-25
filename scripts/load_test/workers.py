from __future__ import annotations
from fastapi import FastAPI, WebSocket
from fastapi.responses import StreamingResponse
from dataclasses import dataclass
from typing import Callable
import asyncio
import uuid
from pydantic import BaseModel

app = FastAPI()

@dataclass
class Event:
    session_id: str
    data: str
    outputs: asyncio.Queue[str] | None
    mode: str
    websocket: WebSocket | None = None
    completed: bool = False

queue: list[Event] = []
active_jobs: list[Event | None] = [None] * 1000


def run_coro_in_background(func: Callable, *args, **kwargs):
    event_loop = asyncio.get_event_loop()
    return event_loop.create_task(func(*args, **kwargs))

async def queue_process():
    while True:
        if queue and None in active_jobs:
            job_index = active_jobs.index(None)
            event = queue.pop(0)
            active_jobs[job_index] = event
            run_coro_in_background(process_event, event)
            continue
        await asyncio.sleep(0.05)

@app.on_event("startup")
async def startup_event():
    run_coro_in_background(queue_process)

async def number_generator(_):
    for number in range(1, 501):
        message = "Lorem "*(number)
        yield message
        await asyncio.sleep(0.01)

async def process_event(event: Event):
    async for output in number_generator(event.data):
        if event.mode == "sse":
            event.outputs.put_nowait(output)
        elif event.mode == "ws":
            await event.websocket.send_text(output)    
    if event.mode == "sse":
        event.outputs.put_nowait(None)
    event.completed = True   
    active_jobs[active_jobs.index(event)] = None

class EventData(BaseModel):
    data: str

@app.post("/sse/send")
async def sse_send(data: EventData):
    session_id = str(uuid.uuid4())
    event = Event(session_id=session_id, data=data.data, outputs=asyncio.Queue(), mode="sse")
    queue.append(event)
    return {"session_id": session_id}

@app.get("/sse/listen")
async def sse_listen(session_id: str):
    event = None
    while event is None:
        for evt in active_jobs:
            if evt:
                if evt.session_id == session_id:
                    event = evt
                    break
        await asyncio.sleep(0.05)
    
    async def event_generator():
        while not event.completed:
            output = await event.outputs.get()
            if output is None:
                break
            yield f"data: {output}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    data = await websocket.receive_text()
    session_id = str(uuid.uuid4())
    event = Event(session_id=session_id, data=data, outputs=None, mode="ws", websocket=websocket)
    queue.append(event)

    while True:
        await asyncio.sleep(1)
        if event.completed:
            return        

import uvicorn
uvicorn.run(app, host="0.0.0.0", port=7860)
