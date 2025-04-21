from typing import TYPE_CHECKING

from mcp import types
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Mount, Route

from gradio.data_classes import FileData
from gradio.utils import simplify_file_data_in_str

if TYPE_CHECKING:
    from gradio.blocks import Blocks


def simplify_filedata_schema(schema):
    filedata_positions = []

    def is_gradio_filedata(obj):
        if not isinstance(obj, dict):
            return False
        props = obj.get("properties", {})
        meta = props.get("meta", {})
        return meta.get("default", {}).get("_type") == "gradio.FileData"

    def traverse(node, path=None):
        if path is None:
            path = []

        if isinstance(node, dict):
            if is_gradio_filedata(node):
                filedata_positions.append(path.copy())
                return {"type": "string", "format": "uri"}
            result = {}
            for key, value in node.items():
                path.append(key)
                result[key] = traverse(value, path)
                path.pop()
            return result
        elif isinstance(node, list):
            result = []
            for i, item in enumerate(node):
                path.append(i)
                result.append(traverse(item, path))
                path.pop()
            return result
        return node

    simplified_schema = traverse(schema)
    return simplified_schema, filedata_positions


def convert_strings_to_filedata(value, filedata_positions):
    """
    Convert specific string values back to FileData objects based on their positions.

    Parameters:
        value: The input value to process
        filedata_positions: List of paths to positions where FileData objects were found
    """

    def traverse(node, path=None):
        if path is None:
            path = []

        if isinstance(node, dict):
            return {key: traverse(value, path + [key]) for key, value in node.items()}
        elif isinstance(node, list):
            return [traverse(item, path + [i]) for i, item in enumerate(node)]
        elif isinstance(node, str) and path in filedata_positions:
            return FileData(path=node)
        return node

    return traverse(value)


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

        # Get the API info for this endpoint
        api_info = blocks.get_api_info()
        if not api_info:
            raise ValueError(f"No API info found for tool: {name}")

        endpoint_info = api_info["named_endpoints"].get(f"/{name}")
        if not endpoint_info:
            raise ValueError(f"No endpoint info found for tool: {name}")

        schema = {
            "type": "object",
            "properties": {
                p["parameter_name"]: p["type"] for p in endpoint_info["parameters"]
            },
        }
        _, filedata_positions = simplify_filedata_schema(schema)

        processed_arguments = convert_strings_to_filedata(arguments, filedata_positions)

        output = await blocks.process_api(
            block_fn=block_fn,
            inputs=[processed_arguments],
        )
        print(">>>>", output)
        processed_outputs = [simplify_file_data_in_str(output["data"])]

        return [
            types.TextContent(type="text", text=str(return_value))
            for return_value in processed_outputs
        ]

    @server.list_tools()
    async def list_tools() -> list[types.Tool]:
        api_info = blocks.get_api_info()
        tools = []
        if not api_info:
            return tools
        for endpoint_name, endpoint_info in api_info["named_endpoints"].items():
            endpoint_name = endpoint_name.lstrip("/")
            if endpoint_info["show_api"]:
                block_fn = next(
                    (fn for fn in blocks.fns.values() if fn.api_name == endpoint_name),
                    None,
                )
                if block_fn is None or block_fn.fn is None:
                    continue
                fn_docstring = block_fn.fn.__doc__
                description = ""
                parameters = {}
                if fn_docstring:
                    lines = fn_docstring.strip().split("\n")
                    lines_iter = iter(lines)
                    description = next(lines_iter, "").strip() if lines else ""
                    for line in lines_iter:
                        if line.strip().startswith("Args:"):
                            break
                    else:
                        line = ""
                    while line:
                        line = line.strip()
                        if line.startswith("Args:") or not line:
                            line = next(lines_iter, "").strip()
                            continue
                        param_name, param_desc = line.split(":", 1)
                        parameters[param_name.strip()] = param_desc.strip()
                        line = next(lines_iter, "").strip()
                tools.append(
                    types.Tool(
                        name=endpoint_name,
                        description=description,
                        inputSchema={
                            "type": "object",
                            "properties": {
                                p["parameter_name"]: {
                                    "type": simplify_filedata_schema(p["type"]),
                                    **(
                                        {"description": parameters[p["parameter_name"]]}
                                        if p["parameter_name"] in parameters
                                        else {}
                                    ),
                                }
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
                Mount("/messages", app=sse.handle_post_message),
            ],
        ),
    )
