"""Headless Gradio App — a FastAPI-based server with Gradio's API engine."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any, Literal

import httpx

from gradio.route_utils import API_PREFIX


class _MCPNamespace:
    """Namespace for MCP decorators: app.mcp.tool(), .resource(), .prompt().

    These decorators tag functions with metadata attributes.
    The MCP server discovers them at launch time.
    """

    @staticmethod
    def tool(
        name: str | None = None,
        description: str | None = None,
        structured_output: bool = False,
        _meta: dict[str, Any] | None = None,
    ):
        """Decorator to mark a function as an MCP tool."""

        def decorator(fn):
            fn._mcp_type = "tool"
            fn._mcp_name = name
            fn._mcp_structured_output = structured_output
            fn._mcp_description = description
            fn._mcp_meta = _meta
            return fn

        return decorator

    @staticmethod
    def resource(
        uri_template: str,
        description: str | None = None,
        mime_type: str | None = None,
    ):
        """Decorator to mark a function as an MCP resource."""

        def decorator(fn):
            fn._mcp_type = "resource"
            fn._mcp_uri_template = uri_template
            fn._mcp_description = description
            fn._mcp_mime_type = mime_type or "text/plain"
            return fn

        return decorator

    @staticmethod
    def prompt(name: str | None = None, description: str | None = None):
        """Decorator to mark a function as an MCP prompt."""

        def decorator(fn):
            fn._mcp_type = "prompt"
            fn._mcp_name = name or fn.__name__
            fn._mcp_description = description
            return fn

        return decorator


class App:
    """Headless Gradio App — exposes Gradio's API engine on a FastAPI server.

    Supports registering Gradio API endpoints (with queue, SSE streaming,
    concurrency control) alongside plain FastAPI routes and MCP tools.

    Example::

        from gradio import App

        app = App()

        @app.api(name="hello")
        def hello(name: str) -> str:
            return f"Hello {name}"

        @app.get("/")
        def root():
            return {"message": "Hello World"}

        app.launch()
    """

    def __init__(self):
        self._deferred_apis: list[tuple[Callable, dict[str, Any]]] = []
        self._custom_routes: list[tuple[str, str, dict, Callable]] = []
        self._mcp = _MCPNamespace()
        self._internal_app: Any | None = None

    @property
    def mcp(self) -> _MCPNamespace:
        """MCP decorator namespace: app.mcp.tool(), app.mcp.resource(), app.mcp.prompt()."""
        return self._mcp

    # ---- Deferred FastAPI route decorators ----

    def _deferred_route(self, method: str, path: str, **kwargs):
        def decorator(fn):
            self._custom_routes.append((method, path, kwargs, fn))
            return fn

        return decorator

    def get(self, path: str, **kwargs):
        """Register a GET route (applied at launch time)."""
        return self._deferred_route("get", path, **kwargs)

    def post(self, path: str, **kwargs):
        """Register a POST route (applied at launch time)."""
        return self._deferred_route("post", path, **kwargs)

    def put(self, path: str, **kwargs):
        """Register a PUT route (applied at launch time)."""
        return self._deferred_route("put", path, **kwargs)

    def delete(self, path: str, **kwargs):
        """Register a DELETE route (applied at launch time)."""
        return self._deferred_route("delete", path, **kwargs)

    def patch(self, path: str, **kwargs):
        """Register a PATCH route (applied at launch time)."""
        return self._deferred_route("patch", path, **kwargs)

    # ---- Gradio API decorator ----

    def api(
        self,
        fn: Callable | None = None,
        *,
        name: str | None = None,
        description: str | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        queue: bool = True,
        batch: bool = False,
        max_batch_size: int = 4,
        api_visibility: Literal["public", "private", "undocumented"] = "public",
        time_limit: int | None = None,
        stream_every: float = 0.5,
    ):
        """Decorator to register a function as a Gradio API endpoint.

        Goes through Gradio's queue with concurrency control and SSE streaming.
        """
        kwargs = dict(
            api_name=name,
            api_description=description,
            concurrency_limit=concurrency_limit,
            concurrency_id=concurrency_id,
            queue=queue,
            batch=batch,
            max_batch_size=max_batch_size,
            api_visibility=api_visibility,
            time_limit=time_limit,
            stream_every=stream_every,
        )
        if fn is not None:
            self._deferred_apis.append((fn, kwargs))
            return fn

        def wrapper(func):
            self._deferred_apis.append((func, kwargs))
            return func

        return wrapper

    # ---- Launch ----

    def launch(
        self,
        server_name: str | None = None,
        server_port: int | None = None,
        *,
        share: bool | None = None,
        mcp_server: bool | None = None,
        ssl_keyfile: str | None = None,
        ssl_certfile: str | None = None,
        ssl_keyfile_password: str | None = None,
        ssl_verify: bool = True,
        quiet: bool = False,
        prevent_thread_lock: bool = False,
        max_threads: int = 40,
        auth: (
            Callable[[str, str], bool]
            | tuple[str, str]
            | list[tuple[str, str]]
            | None
        ) = None,
        auth_message: str | None = None,
        allowed_paths: list[str] | None = None,
        blocked_paths: list[str] | None = None,
        root_path: str | None = None,
        app_kwargs: dict[str, Any] | None = None,
        state_session_capacity: int = 10000,
        max_file_size: str | int | None = None,
        enable_monitoring: bool | None = None,
        strict_cors: bool = True,
        default_concurrency_limit: int | None | Literal["not_set"] = "not_set",
    ):
        """Launch the headless API server.

        Creates an internal Blocks, registers all deferred .api() endpoints,
        sets up Gradio's API routes, applies user-defined routes, and starts
        the uvicorn server.

        Returns:
            Tuple of (fastapi_app, local_url, share_url).
        """
        import gradio.queueing
        from gradio import http_server
        from gradio.blocks import Blocks
        from gradio.events import api as gr_api
        from gradio.routes import App as _InternalApp

        # 1. Create Blocks and register deferred APIs inside its context
        blocks = Blocks()
        blocks.__enter__()

        if auth is not None:
            blocks.auth = auth
            blocks.auth_message = auth_message or ""
        if root_path:
            blocks.root_path = root_path
        if allowed_paths:
            blocks.allowed_paths = allowed_paths
        if blocked_paths:
            blocks.blocked_paths = blocked_paths
        if max_file_size is not None:
            blocks.max_file_size = max_file_size

        blocks.max_threads = max_threads
        blocks.state_session_capacity = state_session_capacity

        for fn, kwargs in self._deferred_apis:
            gr_api(fn=fn, **kwargs)

        blocks.__exit__(None)

        # 2. Set up the queue
        blocks._queue = gradio.queueing.Queue(
            live_updates=True,
            concurrency_count=max_threads,
            update_intervals=1,
            max_size=None,
            blocks=blocks,
            default_concurrency_limit=default_concurrency_limit,
        )

        # 3. Create the internal FastAPI app
        #    Register user's custom routes FIRST so they take priority
        #    over Gradio's default routes (FastAPI uses first-match).
        internal_app = _InternalApp()
        self._internal_app = internal_app

        for method, path, route_kwargs, fn in self._custom_routes:
            getattr(internal_app, method)(path, **route_kwargs)(fn)

        # 4. Apply Gradio's routes on top via create_app
        if app_kwargs is None:
            app_kwargs = {}

        _InternalApp.create_app(
            blocks,
            app=internal_app,
            app_kwargs=app_kwargs,
            strict_cors=strict_cors,
            mcp_server=mcp_server,
        )
        if blocks.mcp_error and not quiet:
            print(blocks.mcp_error)

        # 5. Start the server
        (
            _server_name,
            _server_port,
            local_url,
            server,
        ) = http_server.start_server(
            app=internal_app,
            server_name=server_name,
            server_port=server_port,
            ssl_keyfile=ssl_keyfile,
            ssl_certfile=ssl_certfile,
            ssl_keyfile_password=ssl_keyfile_password,
        )

        blocks.server_name = _server_name
        blocks.local_url = local_url
        blocks.local_api_url = f"{local_url.rstrip('/')}{API_PREFIX}/"
        blocks.server_port = _server_port
        blocks.server = server
        blocks.is_running = True
        blocks.has_launched = True
        blocks.app = internal_app
        blocks.server_app = internal_app

        if blocks.mcp_server_obj:
            blocks.mcp_server_obj._local_url = local_url

        blocks._queue.set_server_app(internal_app)

        protocol = "https" if local_url.startswith("https") else "http"
        if not quiet:
            print(
                f"* Running on local URL:  {protocol}://{_server_name}:{_server_port}"
            )

        if enable_monitoring:
            print(
                f"Monitoring URL: {local_url}monitoring/{internal_app.analytics_key}"
            )
        internal_app.monitoring_enabled = enable_monitoring in [True, None]

        resp = httpx.get(
            f"{blocks.local_api_url}startup-events",
            verify=ssl_verify,
            timeout=None,
        )
        if not resp.is_success:
            raise Exception(
                f"Couldn't start the app because '{resp.url}' failed "
                f"(code {resp.status_code})."
            )

        if blocks.mcp_server and not quiet:
            print(f"* MCP server running at: {local_url}gradio_api/mcp/sse")

        share_url = ""
        if share:
            from gradio import networking

            share_url, _ = networking.setup_tunnel(
                local_host=_server_name,
                local_port=_server_port,
                share_token="",
                share_server_address=None,
                share_server_protocol="https",
                share_server_tls_certificate=None,
            )
            if not quiet:
                print(f"* Running on public URL: {share_url}")

        if not prevent_thread_lock:
            server.thread.join()

        return internal_app, local_url, share_url
