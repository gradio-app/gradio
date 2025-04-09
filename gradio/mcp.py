from typing import TYPE_CHECKING

from mcp import types
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Mount, Route

if TYPE_CHECKING:
    from gradio.blocks import Blocks

def create_mcp_server(blocks: "Blocks") -> Server:
    """
    Create an MCP server for the given Gradio Blocks app.

    Parameters:
        blocks: The Blocks app to create the MCP server for.

    Returns:
        The MCP server.
    """
    server = Server(blocks.title or "Gradio App")

    @server.call_tool()
    async def fetch_tool(
        name: str, arguments: dict
    ) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
        block_fn = next((fn for fn in blocks.fns.values() if fn.api_name == name), None)
        if block_fn is None or block_fn.show_api is False or block_fn.api_name is False:
            raise ValueError(f"Unknown tool: {name}")
        output = await blocks.process_api(
            block_fn=block_fn,
            inputs=list(arguments.values()),
        )
        return [
            types.TextContent(type="text", text=str(return_value))
            for return_value in output["data"]
        ]

    @server.list_tools()
    async def list_tools() -> list[types.Tool]:
        api_info = blocks.get_api_info()
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
                Mount("/messages", app=sse.handle_post_message),  # Removed trailing slash
            ],
        ),
    )


                #     continue
                # fn_docstring = block_fn.fn.__doc__
                # description = ""
                # parameters = {}
                # if fn_docstring:
                #     lines = fn_docstring.strip().split("\n")
                #     lines_iter = iter(lines)
                #     description = next(lines_iter, "").strip() if lines else ""
                #     for line in lines_iter:
                #         if line.strip().startswith("Args:"):
                #             break
                #     else:
                #         line = ""
                #     while line:
                #         line = line.strip()
                #         if line.startswith("Args:") or not line:
                #             line = next(lines_iter, "").strip()
                #             continue
                #         param_name, param_desc = line.split(":", 1)
                #         parameters[param_name.strip()] = param_desc.strip()
                #         line = next(lines_iter, "").strip()
                # tools.append(
                #     types.Tool(
                #         name=endpoint_name,
                #         description=description,
                #         inputSchema={
                #             "type": "object",
                #             "properties": {
                #                 p["parameter_name"]: {
                #                     "type": p["type"],
                #                     **({"description": parameters[p["parameter_name"]]} if p["parameter_name"] in parameters else {})
                #                 }
