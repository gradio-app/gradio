"""
Lightweight static file server for multi-process Gradio.

Handles file serving, uploads, and static assets in separate processes
to free the main Gradio server for queue/SSE/state work.
"""

from __future__ import annotations

import math
import multiprocessing
import time
from dataclasses import dataclass, field
from pathlib import Path

import fastapi
import uvicorn
from starlette.formparsers import MultiPartException
from starlette.responses import PlainTextResponse

from gradio.route_utils import (
    BUILD_PATH_LIB,
    STATIC_PATH_LIB,
    favicon,
    file_fetch,
    file_response,
    upload_fn,
)
from gradio.utils import (
    DeveloperPath,
    UserProvidedPath,
)


@dataclass
class StaticServerConfig:
    build_path: str = ""
    static_path: str = ""
    uploaded_file_dir: str = ""
    allowed_paths: list[str] = field(default_factory=list)
    blocked_paths: list[str] = field(default_factory=list)
    max_file_size: int | float | None = None
    favicon_path: str | None = None


def create_static_app(config: StaticServerConfig) -> fastapi.FastAPI:
    """Create a minimal FastAPI app that only serves static files and handles uploads."""
    from starlette.middleware.cors import CORSMiddleware

    app = fastapi.FastAPI()
    app.add_middleware(
        CORSMiddleware,  # type: ignore
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    upload_dir = config.uploaded_file_dir
    max_file_size = (
        config.max_file_size if config.max_file_size is not None else math.inf
    )

    @app.get("/svelte/{path:path}")
    async def svelte_resource(path: str):
        svelte_path = DeveloperPath(str(Path(BUILD_PATH_LIB) / "svelte"))
        return file_response(svelte_path, UserProvidedPath(path))

    @app.get("/static/{path:path}")
    async def static_resource(path: str):
        return file_response(STATIC_PATH_LIB, UserProvidedPath(path))

    @app.get("/assets/{path:path}")
    async def build_resource(path: str):
        return file_response(BUILD_PATH_LIB, UserProvidedPath(path))

    @app.get("/favicon.ico")
    async def _():
        return favicon(config.favicon_path)

    @app.head("/gradio_api/file={path_or_url:path}")
    @app.get("/gradio_api/file={path_or_url:path}")
    @app.head("/file={path_or_url:path}")
    @app.get("/file={path_or_url:path}")
    async def file(path_or_url: str, request: fastapi.Request):
        return file_fetch(path_or_url, request, config, upload_dir)

    @app.post("/gradio_api/upload")
    @app.post("/upload")
    async def upload_file(
        request: fastapi.Request,
    ):
        try:
            output_files, _, _ = await upload_fn(
                request, upload_dir, max_file_size, upload_id=None, force_move=False
            )
        except MultiPartException as exc:
            code = 413 if "maximum allowed size" in exc.message else 400
            return PlainTextResponse(exc.message, status_code=code)
        return output_files

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


def _run_static_worker(port: int, config_dict: dict):
    """Entry point for a static worker subprocess."""
    config = StaticServerConfig(**config_dict)
    app = create_static_app(config)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")


class StaticWorkerPool:
    """Manages N static file server processes."""

    def __init__(self, num_workers: int, config: StaticServerConfig, ports: list[int]):
        self.num_workers = num_workers
        self.config = config
        self.workers: list[multiprocessing.Process] = []
        self.ports = list(ports)
        self._counter = 0
        self._started = False

    def start(self):
        """Spawn all static worker processes."""
        if self._started:
            return
        self._started = True

        config_dict = {
            "build_path": self.config.build_path,
            "static_path": self.config.static_path,
            "uploaded_file_dir": self.config.uploaded_file_dir,
            "allowed_paths": self.config.allowed_paths,
            "blocked_paths": self.config.blocked_paths,
            "max_file_size": self.config.max_file_size
            if self.config.max_file_size is not None
            and self.config.max_file_size != math.inf
            else None,
            "favicon_path": self.config.favicon_path,
        }

        for i, port in enumerate(self.ports):
            process = multiprocessing.Process(
                target=_run_static_worker,
                args=(port, config_dict),
                daemon=True,
                name=f"gradio-static-{i}",
            )
            process.start()
            self.workers.append(process)

        # Wait for workers to be ready
        import httpx

        for port in self.ports:
            for _ in range(50):
                try:
                    r = httpx.get(f"http://127.0.0.1:{port}/health", timeout=1)
                    if r.status_code == 200:
                        break
                except Exception:
                    time.sleep(0.1)

    def get_next_url(self) -> str:
        """Round-robin to the next static worker."""
        port = self.ports[self._counter % len(self.ports)]
        self._counter += 1
        return f"http://127.0.0.1:{port}"

    def shutdown(self):
        """Stop all static worker processes."""
        for process in self.workers:
            process.kill()
        for process in self.workers:
            process.join(timeout=0.5)
        self.workers.clear()
        self.ports.clear()
        self._started = False
