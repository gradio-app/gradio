"""
Lightweight static file server for multi-process Gradio.

Handles file serving, uploads, and static assets in separate processes
to free the main Gradio server for queue/SSE/state work.
"""

from __future__ import annotations

import logging
import math
import mimetypes
import multiprocessing
import os
import secrets
import socket
import time
from dataclasses import dataclass, field
from pathlib import Path

import fastapi
import uvicorn
from fastapi import HTTPException
from fastapi.responses import FileResponse, PlainTextResponse
from gradio_client import utils as client_utils
from python_multipart.multipart import parse_options_header
from starlette.formparsers import MultiPartException

from gradio import route_utils, utils
from gradio.route_utils import GradioMultiPartParser, GradioUploadFile
from gradio.utils import (
    DeveloperPath,
    InvalidPathError,
    UserProvidedPath,
    safe_join,
)

logger = logging.getLogger(__name__)


@dataclass
class StaticServerConfig:
    """Configuration for static file server workers."""

    build_path: str = ""
    static_path: str = ""
    uploaded_file_dir: str = ""
    allowed_paths: list[str] = field(default_factory=list)
    blocked_paths: list[str] = field(default_factory=list)
    max_file_size: int | float | None = None
    favicon_path: str | None = None


XSS_SAFE_MIMETYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/avif",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/aac",
    "audio/flac",
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "application/pdf",
    "text/plain",
    "text/csv",
}


def _routes_safe_join(directory: DeveloperPath | str, path: UserProvidedPath) -> str:
    """Safe path join that prevents directory traversal."""
    return utils.safe_join(directory, path)


def create_static_app(config: StaticServerConfig) -> fastapi.FastAPI:
    """Create a minimal FastAPI app that only serves static files and handles uploads."""
    from starlette.middleware.cors import CORSMiddleware

    app = fastapi.FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    build_path = config.build_path
    static_path = config.static_path
    upload_dir = config.uploaded_file_dir
    max_file_size = (
        config.max_file_size if config.max_file_size is not None else math.inf
    )

    @app.get("/svelte/{path:path}")
    def svelte_resource(path: str):
        svelte_dir = str(Path(build_path) / "svelte")
        file_path = _routes_safe_join(DeveloperPath(svelte_dir), UserProvidedPath(path))
        return FileResponse(file_path)

    @app.get("/static/{path:path}")
    def static_resource(path: str):
        file_path = _routes_safe_join(static_path, UserProvidedPath(path))
        return FileResponse(file_path)

    @app.get("/assets/{path:path}")
    def build_resource(path: str):
        file_path = _routes_safe_join(build_path, UserProvidedPath(path))
        return FileResponse(file_path)

    @app.get("/favicon.ico")
    def favicon():
        if config.favicon_path:
            return FileResponse(config.favicon_path)
        return static_resource("img/logo.svg")

    @app.head("/file={path_or_url:path}")
    @app.get("/file={path_or_url:path}")
    async def file(path_or_url: str, request: fastapi.Request):
        if client_utils.is_http_url_like(path_or_url):
            from starlette.responses import RedirectResponse

            return RedirectResponse(url=path_or_url, status_code=302)

        if route_utils.starts_with_protocol(path_or_url):
            raise HTTPException(403, f"File not allowed: {path_or_url}.")

        abs_path = utils.abspath(path_or_url)
        try:
            if abs_path.is_dir() or not abs_path.exists():
                raise HTTPException(403, f"File not allowed: {path_or_url}.")
        except Exception as e:
            raise HTTPException(403, f"File not allowed: {path_or_url}.") from e

        from gradio.data_classes import _StaticFiles

        allowed, reason = utils.is_allowed_file(
            abs_path,
            blocked_paths=config.blocked_paths,
            allowed_paths=config.allowed_paths + _StaticFiles.all_paths,
            created_paths=[upload_dir, str(utils.get_cache_folder())],
        )
        if not allowed:
            raise HTTPException(403, f"File not allowed: {path_or_url}.")

        mime_type, _ = mimetypes.guess_type(abs_path)
        if mime_type in XSS_SAFE_MIMETYPES or reason == "allowed":
            media_type = mime_type or "application/octet-stream"
            content_disposition_type = "inline"
        else:
            media_type = "application/octet-stream"
            content_disposition_type = "attachment"

        range_val = request.headers.get("Range", "").strip()
        if range_val.startswith("bytes=") and "-" in range_val:
            range_val = range_val[6:]
            start, end = range_val.split("-")
            if start.isnumeric() and end.isnumeric():
                from gradio_client.utils import ranged_response

                start = int(start)
                end = int(end)
                headers = dict(request.headers)
                headers["Content-Disposition"] = content_disposition_type
                headers["Content-Type"] = media_type
                return ranged_response.RangedFileResponse(
                    abs_path,
                    ranged_response.OpenRange(start, end),
                    headers,
                    stat_result=os.stat(abs_path),
                )

        return FileResponse(
            abs_path,
            headers={"Accept-Ranges": "bytes"},
            content_disposition_type=content_disposition_type,
            media_type=media_type,
            filename=abs_path.name,
        )

    @app.post("/upload")
    async def upload_file(
        request: fastapi.Request,
    ):
        content_type_header = request.headers.get("Content-Type")
        content_type: bytes
        content_type, _ = parse_options_header(content_type_header or "")
        if content_type != b"multipart/form-data":
            raise HTTPException(status_code=400, detail="Invalid content type.")

        try:
            multipart_parser = GradioMultiPartParser(
                request.headers,
                request.stream(),
                max_files=1000,
                max_fields=1000,
                max_file_size=max_file_size,
            )
            form = await multipart_parser.parse()
        except MultiPartException as exc:
            code = 413 if "maximum allowed size" in exc.message else 400
            return PlainTextResponse(exc.message, status_code=code)

        output_files = []
        for temp_file in form.getlist("files"):
            if not isinstance(temp_file, GradioUploadFile):
                raise TypeError("File is not an instance of GradioUploadFile")
            if temp_file.filename:
                file_name = Path(temp_file.filename).name
                name = client_utils.strip_invalid_filename_characters(file_name)
            else:
                name = f"tmp{secrets.token_hex(5)}"
            directory = Path(upload_dir) / temp_file.sha.hexdigest()
            directory.mkdir(exist_ok=True, parents=True)
            try:
                dest = safe_join(DeveloperPath(str(directory)), UserProvidedPath(name))
            except InvalidPathError as err:
                raise HTTPException(
                    status_code=400, detail=f"Invalid file name: {name}"
                ) from err
            temp_file.file.close()
            try:
                os.rename(temp_file.file.name, dest)
            except OSError:
                import shutil

                shutil.move(temp_file.file.name, dest)
            output_files.append(dest)

        return output_files

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


# ── Static Worker Pool ──────────────────────────────────────────────────────


def _find_free_port(start: int = 0) -> int:
    """Find a free port. If start=0, let the OS pick an ephemeral port."""
    s = socket.socket()
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(("127.0.0.1", start))
    port = s.getsockname()[1]
    s.close()
    return port


def _run_static_worker(port: int, config_dict: dict):
    """Entry point for a static worker subprocess."""
    config = StaticServerConfig(**config_dict)
    app = create_static_app(config)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")


class StaticWorkerPool:
    """Manages N static file server processes."""

    def __init__(self, num_workers: int, config: StaticServerConfig):
        self.num_workers = num_workers
        self.config = config
        self.workers: list[multiprocessing.Process] = []
        self.ports: list[int] = []
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

        for i in range(self.num_workers):
            port = _find_free_port()  # OS picks an ephemeral port
            process = multiprocessing.Process(
                target=_run_static_worker,
                args=(port, config_dict),
                daemon=True,
                name=f"gradio-static-{i}",
            )
            process.start()
            self.workers.append(process)
            self.ports.append(port)

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

        # Write ports to file so external tools (nginx, benchmarks) can discover them
        ports_file = os.environ.get("GRADIO_WORKER_PORTS_FILE")
        if ports_file:
            import json

            Path(ports_file).write_text(json.dumps(self.ports))

        logger.info(
            f"StaticWorkerPool: {self.num_workers} workers on ports {self.ports}"
        )

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
