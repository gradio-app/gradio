"""simple_fastapi.py with a slow, model-like function (see ml_work.py).

It follows FastAPI's own advice, to give it its best case: the blocking model
call is a plain `def` route, which FastAPI runs in its thread pool (40 threads),
and the page is an `async def` route, which runs on the event loop and never
waits for a thread.
"""

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from ml_work import work
from simple_fastapi import PAGE, Payload

app = FastAPI()


@app.get("/", response_class=HTMLResponse)
async def index():
    return PAGE


@app.post("/api/greet")
def predict(payload: Payload):
    work()
    return {"data": [f"Hello {payload.data[0]}!"]}
