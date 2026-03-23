"""Headless Gradio App — a FastAPI-based server with Gradio's API engine."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any, Literal

from gradio.routes import App as _InternalApp


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


class App(_InternalApp):
    """Headless Gradio App — exposes Gradio's API engine on a FastAPI server.

    Inherits from FastAPI, so all standard FastAPI methods (.get(), .post(),
    .add_middleware(), .include_router(), etc.) work directly on this instance.

    New methods added on top of FastAPI:
        api(): Decorator to register a Gradio API endpoint with queue,
            SSE streaming, and concurrency control.
        mcp: Namespace with .tool(), .resource(), and .prompt() decorators
            to tag functions with MCP metadata.
        launch(): Creates an internal Blocks, registers deferred API
            endpoints, and starts the server.

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

    def __init__(
        self,
        *,
        debug: bool = False,
        title: str = "FastAPI",
        summary: str | None = None,
        description: str = "",
        version: str = "0.1.0",
        openapi_url: str | None = "/openapi.json",
        openapi_tags: list[dict[str, Any]] | None = None,
        servers: list[dict[str, Any]] | None = None,
        dependencies: Any = None,
        default_response_class: Any = None,
        redirect_slashes: bool = True,
        docs_url: str | None = "/docs",
        redoc_url: str | None = "/redoc",
        middleware: Any = None,
        exception_handlers: Any = None,
        on_startup: Any = None,
        on_shutdown: Any = None,
        lifespan: Any = None,
        terms_of_service: str | None = None,
        contact: dict[str, Any] | None = None,
        license_info: dict[str, Any] | None = None,
        root_path: str = "",
        root_path_in_servers: bool = True,
        responses: dict[int | str, dict[str, Any]] | None = None,
        callbacks: Any = None,
        webhooks: Any = None,
        deprecated: bool | None = None,
        include_in_schema: bool = True,
        generate_unique_id_function: Any = None,
        separate_input_output_schemas: bool = True,
        **extra: Any,
    ):
        init_kwargs: dict[str, Any] = {
            "debug": debug,
            "title": title,
            "summary": summary,
            "description": description,
            "version": version,
            "openapi_url": openapi_url,
            "openapi_tags": openapi_tags,
            "servers": servers,
            "redirect_slashes": redirect_slashes,
            "docs_url": docs_url,
            "redoc_url": redoc_url,
            "terms_of_service": terms_of_service,
            "contact": contact,
            "license_info": license_info,
            "root_path": root_path,
            "root_path_in_servers": root_path_in_servers,
            "responses": responses,
            "deprecated": deprecated,
            "include_in_schema": include_in_schema,
            "separate_input_output_schemas": separate_input_output_schemas,
            **extra,
        }
        if dependencies is not None:
            init_kwargs["dependencies"] = dependencies
        if default_response_class is not None:
            init_kwargs["default_response_class"] = default_response_class
        if middleware is not None:
            init_kwargs["middleware"] = middleware
        if exception_handlers is not None:
            init_kwargs["exception_handlers"] = exception_handlers
        if on_startup is not None:
            init_kwargs["on_startup"] = on_startup
        if on_shutdown is not None:
            init_kwargs["on_shutdown"] = on_shutdown
        if lifespan is not None:
            init_kwargs["lifespan"] = lifespan
        if callbacks is not None:
            init_kwargs["callbacks"] = callbacks
        if webhooks is not None:
            init_kwargs["webhooks"] = webhooks
        if generate_unique_id_function is not None:
            init_kwargs["generate_unique_id_function"] = generate_unique_id_function
        super().__init__(**init_kwargs)
        self._deferred_apis: list[tuple[Callable, dict[str, Any]]] = []
        self._mcp = _MCPNamespace()

    @property
    def mcp(self) -> _MCPNamespace:
        """MCP decorator namespace: app.mcp.tool(), app.mcp.resource(), app.mcp.prompt()."""
        return self._mcp

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
        kwargs = {
            "api_name": name,
            "api_description": description,
            "concurrency_limit": concurrency_limit,
            "concurrency_id": concurrency_id,
            "queue": queue,
            "batch": batch,
            "max_batch_size": max_batch_size,
            "api_visibility": api_visibility,
            "time_limit": time_limit,
            "stream_every": stream_every,
        }
        if fn is not None:
            self._deferred_apis.append((fn, kwargs))
            return fn

        def wrapper(func):
            self._deferred_apis.append((func, kwargs))
            return func

        return wrapper

    def launch(self, **kwargs):
        """Launch the headless API server.

        Accepts all the same keyword arguments as Blocks.launch().

        Returns:
            Tuple of (fastapi_app, local_url, share_url).
        """
        from gradio.blocks import Blocks
        from gradio.events import api as gr_api

        blocks = Blocks()
        blocks.__enter__()
        for fn, api_kwargs in self._deferred_apis:
            gr_api(fn=fn, **api_kwargs)
        blocks.__exit__(None)

        kwargs.setdefault("ssr_mode", False)
        return blocks.launch(_app=self, **kwargs)
