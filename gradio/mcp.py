from typing import TYPE_CHECKING

from mcp import types
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Mount, Route

from gradio import utils

if TYPE_CHECKING:
    from gradio.blocks import Blocks

server = Server("gradio")


def add_tools(block: "Blocks") -> Server:
    @server.call_tool()
    async def fetch_tool(
        name: str, arguments: dict
    ) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
        block_fn = next((fn for fn in block.fns.values() if fn.api_name == name), None)

        if block_fn is None or block_fn.show_api is False or block_fn.api_name is False:
            raise ValueError(f"Unknown tool: {name}")

        fn_params = block_fn.fn and utils.get_function_params(block_fn.fn) or []
        ordered_args = []

        for param_name, has_default, default_value, _ in fn_params:
            if param_name in arguments:
                ordered_args.append(arguments[param_name])
            elif has_default:
                ordered_args.append(default_value)
            else:
                raise ValueError(f"Missing required argument: {param_name}")

        output = await block.process_api(
            block_fn=block_fn,
            inputs=ordered_args,
        )
        return [
            types.TextContent(type="text", text=str(return_value))
            for return_value in output["data"]
        ]

    @server.list_tools()
    async def list_tools() -> list[types.Tool]:
        api_info = block.get_api_info()
        tools = []
        if not api_info:
            return tools
        for endpoint_name, endpoint_info in api_info["named_endpoints"].items():
            if endpoint_info["show_api"]:
                tools.append(
                    types.Tool(
                        name=endpoint_name.lstrip("/"),
                        inputSchema={
                            "type": "object",
                            "properties": {
                                p["parameter_name"]: p["type"]
                                for p in endpoint_info["parameters"]
                            },
                        },
                    )
                )
        return tools

    return server


def launch_mcp_on_sse(server: Server, app: Starlette, subpath: str):
    """
    Launch the MCP server on the SSE transport.

    Parameters:
        server: The MCP server to launch.
        app: The Gradio app to mount the MCP server on.
        subpath: The subpath to mount the MCP server on. E.g. "/gradio_api/mcp"
    """
    messages_path = f"{subpath}/messages"
    sse = SseServerTransport(messages_path)

    async def handle_sse(request):
        async with sse.connect_sse(
            request.scope, request.receive, request._send
        ) as streams:
            await server.run(
                streams[0], streams[1], server.create_initialization_options()
            )

    app.mount(
        subpath,
        Starlette(
            routes=[
                Route("/sse", endpoint=handle_sse),
                Mount(
                    "/messages", app=sse.handle_post_message
                ),  # Removed trailing slash
            ],
        ),
    )
