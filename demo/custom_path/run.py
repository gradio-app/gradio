"""
Test script for https://github.com/gradio-app/gradio/issues/11848
Gradio does not show media when FastAPI is behind a reverse proxy (root_path).

Simulates a reverse proxy by wrapping the FastAPI app in an outer
Starlette app mounted at /myapp. Gradio is mounted at /gradio inside.

Open http://localhost:8000/myapp/gradio/ to test.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.applications import Starlette
from starlette.routing import Mount
import gradio as gr

CUSTOM_PATH = "/gradio"
PROXY_PREFIX = "/myapp"

app = FastAPI()


@app.get("/")
def read_main():
    return {"message": "This is your main app"}


def identity(image):
    return image


demo = gr.Interface(
    fn=identity,
    inputs=gr.Image(type="filepath"),
    outputs=gr.Image(label="Output Image"),
)

app = gr.mount_gradio_app(app, demo, path=CUSTOM_PATH, root_path=f"{PROXY_PREFIX}{CUSTOM_PATH}")


@asynccontextmanager
async def lifespan(outer_app):
    async with app.router.lifespan_context(app):
        yield


outer_app = Starlette(
    routes=[Mount(PROXY_PREFIX, app=app)],
    lifespan=lifespan,
)

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("GRADIO_SERVER_PORT", 8000))
    print(f"\nOpen http://localhost:{port}{PROXY_PREFIX}{CUSTOM_PATH}/\n")
    uvicorn.run(outer_app, host="0.0.0.0", port=port)
