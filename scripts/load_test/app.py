from fastapi import FastAPI, WebSocket
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

async def number_generator():
    for number in range(1, 501):
        message = "Lorem "*(number + 1)
        yield f"data: {message}\n\n"
        await asyncio.sleep(0.01)

@app.get("/sse")
async def sse():
    return StreamingResponse(number_generator(), media_type="text/event-stream")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    for number in range(1, 501):
        message = "Lorem "*(number + 1)
        await websocket.send_text(message)
        await asyncio.sleep(0.01)
    await websocket.close()


import uvicorn
uvicorn.run(app, host="0.0.0.0", port=7860)