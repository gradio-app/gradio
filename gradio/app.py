"""Headless Gradio App — a FastAPI-based server with Gradio's API engine."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any, Literal


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

    def launch(self, **kwargs):
        """Launch the headless API server.

        Creates an internal Blocks, registers all deferred .api() endpoints,
        sets up Gradio's API routes, applies user-defined custom routes, and
        starts the uvicorn server.

        Accepts all the same keyword arguments as Blocks.launch().

        Returns:
            Tuple of (fastapi_app, local_url, share_url).
        """
        from gradio.blocks import Blocks
        from gradio.events import api as gr_api
        from gradio.routes import App as _InternalApp

        # 1. Create Blocks and register deferred APIs inside its context
        blocks = Blocks()
        blocks.__enter__()
        for fn, api_kwargs in self._deferred_apis:
            gr_api(fn=fn, **api_kwargs)
        blocks.__exit__(None)

        # 2. Create internal FastAPI app with user's custom routes registered
        #    first so they take priority (FastAPI uses first-match).
        internal_app = _InternalApp()
        for method, path, route_kwargs, fn in self._custom_routes:
            getattr(internal_app, method)(path, **route_kwargs)(fn)

        # 3. Delegate to Blocks.launch() which handles everything:
        #    queue setup, create_app (reusing internal_app), server start,
        #    share links, monitoring, etc.
        return blocks.launch(_app=internal_app, **kwargs)
