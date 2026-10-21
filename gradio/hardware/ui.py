"""Local-only developer controls. Custom frontends include the overlay script."""

import json
import secrets
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import urlparse

from fastapi import HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse, Response

from gradio.hardware.executor import Executor

PREFIX = "/__gradio_hardware"


def install(app, executor: Executor):
    token = secrets.token_urlsafe(32)
    original_lifespan = app.router.lifespan_context

    @asynccontextmanager
    async def lifespan(application):
        try:
            async with original_lifespan(application) as state:
                yield state
        finally:
            executor.close()

    app.router.lifespan_context = lifespan

    def local(request):
        host = request.url.hostname
        if host not in {"localhost", "127.0.0.1", "::1", "testserver"}:
            raise HTTPException(403, "Hardware controls are local-only")
        if request.client and request.client.host not in {
            "127.0.0.1",
            "::1",
            "testclient",
        }:
            raise HTTPException(403, "Hardware controls are local-only")

    @app.get(PREFIX + "/status", include_in_schema=False)
    def status(request: Request):
        local(request)
        return JSONResponse(executor.status(), headers={"Cache-Control": "no-store"})

    @app.post(PREFIX + "/select", include_in_schema=False)
    async def select(request: Request):
        local(request)
        if request.headers.get("x-gradio-hardware-token") != token:
            raise HTTPException(403, "Invalid hardware control token")
        origin = request.headers.get("origin")
        if origin and urlparse(origin).netloc != request.url.netloc:
            raise HTTPException(403, "Cross-origin hardware changes are not allowed")
        try:
            data = await request.json()
            if not isinstance(data, dict) or not isinstance(data.get("hardware"), str):
                raise TypeError("Expected a hardware name")
            # Worker restart and native build must not block the HTTP event loop.
            import anyio

            await anyio.to_thread.run_sync(executor.select, data["hardware"])
            return executor.status()
        except (ValueError, TypeError) as error:
            raise HTTPException(400, str(error)) from error
        except RuntimeError as error:
            raise HTTPException(409, str(error)) from error

    @app.get(PREFIX + "/overlay.js", include_in_schema=False)
    def overlay(request: Request):
        local(request)
        script = (Path(__file__).parent / "overlay.js").read_text()
        return Response(
            "const gradioHardwareToken=" + json.dumps(token) + ";\n" + script,
            media_type="application/javascript",
            headers={"Cache-Control": "no-store"},
        )

    @app.get(PREFIX + "/settings", include_in_schema=False)
    def settings(request: Request):
        local(request)
        return HTMLResponse("""<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hardware Settings · Gradio</title>
<style>
:root{color-scheme:light;font:14px system-ui;color:#1f2937;background:white}
*{box-sizing:border-box}body{padding:32px 24px 80px;max-width:850px;margin:auto}
a{color:#c2410c;text-decoration:none}a:hover{text-decoration:underline}
h1{font-size:26px;font-weight:600;margin:28px 0 8px}p{color:#6b7280;line-height:1.6}
#gradio-hardware-settings{border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-top:24px}
#gradio-hardware-settings label{display:block;font-weight:500}
#gradio-hardware-settings select{display:block;margin-top:8px;width:100%;border:1px solid #d1d5db;background:#f9fafb;color:#1f2937}
#gradio-hardware-settings summary{cursor:pointer;font-weight:500;padding:12px 0}
#gradio-hardware-settings pre{font-size:12px;border:1px solid #e5e7eb;overflow-wrap:anywhere}
</style><body>
<a href="/">← Back to app</a><h1>Hardware Settings</h1>
<p>Choose where your queued predictions are simulated. Changes apply to the next run.</p>
<div id="gradio-hardware-settings"></div><script src="overlay.js"></script></body></html>""")
