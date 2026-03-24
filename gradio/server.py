"""Gradio Server mode — a FastAPI-based server with Gradio's API engine."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from pathlib import Path
from typing import Any, Literal

import fastapi
from gradio_client.documentation import document

from gradio import mcp
from gradio.i18n import I18n
from gradio.routes import App
from gradio.themes import ThemeClass as Theme


class _MCPNamespace:
    """Namespace for MCP decorators: server.mcp.tool(), server.mcp.resource(), server.mcp.prompt()."""

    tool = staticmethod(mcp.tool)
    resource = staticmethod(mcp.resource)
    prompt = staticmethod(mcp.prompt)


@document("api", "launch")
class Server(App):
    """
    Server is the Gradio API engine exposed on a FastAPI application (Server mode).
    It inherits from FastAPI, so all standard FastAPI methods (.get(), .post(),
    .add_middleware(), .include_router(), etc.) work directly on this instance.

    New methods added on top of FastAPI:
        api(): Decorator to register a Gradio API endpoint with queue,
            SSE streaming, and concurrency control.
        mcp: Namespace with .tool(), .resource(), and .prompt() decorators
            to tag functions with MCP metadata.
        launch(): Creates an internal Blocks, registers deferred API
            endpoints, and starts the server.

    Example:
        from gradio import Server

        server = Server()

        @server.api(name="hello")
        def hello(name: str) -> str:
            return f"Hello {name}"

        @server.get("/")
        def root():
            return {"message": "Hello World"}

        server.launch()
    Demos: server_app
    Guides: server-mode
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
        """
        Parameters:
            debug: Enable debug mode for detailed error tracebacks.
            title: The title of the API, shown in the OpenAPI docs.
            summary: A short summary of the API.
            description: A longer description of the API. Supports Markdown.
            version: The version of the API.
            openapi_url: The URL path for the OpenAPI schema. Set to None to disable.
            openapi_tags: Tags for organizing endpoints in the OpenAPI docs.
            servers: Server URLs for the OpenAPI schema.
            dependencies: Global dependencies applied to all routes.
            default_response_class: The default response class for routes.
            redirect_slashes: Whether to redirect trailing slashes.
            docs_url: The URL path for the Swagger UI docs. Set to None to disable.
            redoc_url: The URL path for the ReDoc docs. Set to None to disable.
            middleware: List of middleware to add to the server.
            exception_handlers: Custom exception handlers.
            on_startup: List of startup event handlers. Prefer lifespan instead.
            on_shutdown: List of shutdown event handlers. Prefer lifespan instead.
            lifespan: An async context manager for startup/shutdown lifecycle.
            terms_of_service: URL to the terms of service.
            contact: Contact information dict for the API.
            license_info: License information dict for the API.
            root_path: A path prefix for the app when behind a proxy.
            root_path_in_servers: Whether to include root_path in the OpenAPI servers field.
            responses: Additional responses for the OpenAPI schema.
            callbacks: OpenAPI callback definitions.
            webhooks: OpenAPI webhook definitions.
            deprecated: Mark all routes as deprecated.
            include_in_schema: Whether to include all routes in the OpenAPI schema.
            generate_unique_id_function: Custom function to generate unique operation IDs.
            separate_input_output_schemas: Whether to generate separate input/output schemas.
        """
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
        """MCP decorator namespace: server.mcp.tool(), server.mcp.resource(), server.mcp.prompt()."""
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

    def launch(
        self,
        inline: bool | None = None,
        inbrowser: bool = False,
        share: bool | None = None,
        debug: bool = False,
        max_threads: int = 40,
        auth: (
            Callable[[str, str], bool] | tuple[str, str] | list[tuple[str, str]] | None
        ) = None,
        auth_message: str | None = None,
        prevent_thread_lock: bool = False,
        show_error: bool = False,
        server_name: str | None = None,
        server_port: int | None = None,
        *,
        height: int = 500,
        width: int | str = "100%",
        favicon_path: str | Path | None = None,
        ssl_keyfile: str | None = None,
        ssl_certfile: str | None = None,
        ssl_keyfile_password: str | None = None,
        ssl_verify: bool = True,
        quiet: bool = False,
        footer_links: list[Literal["api", "gradio", "settings"] | dict[str, str]]
        | None = None,
        allowed_paths: list[str] | None = None,
        blocked_paths: list[str] | None = None,
        root_path: str | None = None,
        app_kwargs: dict[str, Any] | None = None,
        state_session_capacity: int = 10000,
        share_server_address: str | None = None,
        share_server_protocol: Literal["http", "https"] | None = None,
        share_server_tls_certificate: str | None = None,
        auth_dependency: Callable[[fastapi.Request], str | None] | None = None,
        max_file_size: str | int | None = None,
        enable_monitoring: bool | None = None,
        strict_cors: bool = True,
        node_server_name: str | None = None,
        node_port: int | None = None,
        ssr_mode: bool | None = None,
        pwa: bool | None = None,
        mcp_server: bool | None = None,
        _frontend: bool = True,
        i18n: I18n | None = None,
        theme: Theme | str | None = None,
        css: str | None = None,
        css_paths: str | Path | Sequence[str | Path] | None = None,
        js: str | Literal[True] | None = None,
        head: str | None = None,
        head_paths: str | Path | Sequence[str | Path] | None = None,
    ) -> tuple[App, str, str]:
        """Launch the Gradio API server (Server mode).

        Parameters match ``Blocks.launch()``; see that method for full descriptions.

        Returns:
            Tuple of (fastapi_app, local_url, share_url).
        """
        _ = ssr_mode
        from gradio.blocks import Blocks
        from gradio.events import api as gr_api

        with Blocks() as blocks:
            for fn, api_kwargs in self._deferred_apis:
                gr_api(fn=fn, **api_kwargs)

        return blocks.launch(
            _app=self,
            inline=inline,
            inbrowser=inbrowser,
            share=share,
            debug=debug,
            max_threads=max_threads,
            auth=auth,
            auth_message=auth_message,
            prevent_thread_lock=prevent_thread_lock,
            show_error=show_error,
            server_name=server_name,
            server_port=server_port,
            height=height,
            width=width,
            favicon_path=favicon_path,
            ssl_keyfile=ssl_keyfile,
            ssl_certfile=ssl_certfile,
            ssl_keyfile_password=ssl_keyfile_password,
            ssl_verify=ssl_verify,
            quiet=quiet,
            footer_links=footer_links,
            allowed_paths=allowed_paths,
            blocked_paths=blocked_paths,
            root_path=root_path,
            app_kwargs=app_kwargs,
            state_session_capacity=state_session_capacity,
            share_server_address=share_server_address,
            share_server_protocol=share_server_protocol,
            share_server_tls_certificate=share_server_tls_certificate,
            auth_dependency=auth_dependency,
            max_file_size=max_file_size,
            enable_monitoring=enable_monitoring,
            strict_cors=strict_cors,
            node_server_name=node_server_name,
            node_port=node_port,
            ssr_mode=False,  # Server mode does not support SSR
            pwa=pwa,
            mcp_server=mcp_server,
            _frontend=_frontend,
            i18n=i18n,
            theme=theme,
            css=css,
            css_paths=css_paths,
            js=js,
            head=head,
            head_paths=head_paths,
        )
