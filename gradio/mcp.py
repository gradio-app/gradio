from typing import TYPE_CHECKING

import uvicorn
from mcp import types
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Mount, Route

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
        output = await block.process_api(
            block_fn=block_fn,
            inputs=list(arguments.values()),
        )
        return [types.TextContent(type="text", text=str(return_value)) for return_value in output["data"]]

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
                                p["parameter_name"]: p["type"] for p in endpoint_info["parameters"]
                            }
                        },
                    )
                )
        return tools

    return server

def launch_mcp_on_sse(server: Server):
    sse = SseServerTransport("/messages/")

    async def handle_sse(request):
        async with sse.connect_sse(
            request.scope, request.receive, request._send
        ) as streams:
            await server.run(
                streams[0], streams[1], server.create_initialization_options()
            )

    starlette_app = Starlette(
        debug=True,
        routes=[
            Route("/sse", endpoint=handle_sse),
            Mount("/messages/", app=sse.handle_post_message),
        ],
    )

    uvicorn.run(starlette_app, host="0.0.0.0", port=8000)
