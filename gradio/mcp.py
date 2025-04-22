from typing import TYPE_CHECKING, Any

import gradio_client.utils as client_utils
from gradio_client import Client
from mcp import types
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Mount, Route

from gradio.data_classes import FileData

if TYPE_CHECKING:
    from gradio.blocks import Blocks


class GradioMCPServer:
    """
    A class for creating an MCP server around a Gradio app.

    Args:
        blocks: The Blocks app to create the MCP server for.
    """

    def __init__(self, blocks: "Blocks"):
        self.blocks = blocks
        self.gradio_client = None
        self.mcp_server = self.create_mcp_server()

    def simplify_filedata_schema(
        self, schema: dict[str, Any]
    ) -> tuple[dict[str, Any], list[list[str | int]]]:
        filedata_positions: list[list[str | int]] = []

        def is_gradio_filedata(obj: Any) -> bool:
            if not isinstance(obj, dict):
                return False
            props = obj.get("properties", {})
            meta = props.get("meta", {})
            return meta.get("default", {}).get("_type") == "gradio.FileData"

        def traverse(node: Any, path: list[str | int] | None = None) -> Any:
            if path is None:
                path = []

            if isinstance(node, dict):
                if is_gradio_filedata(node):
                    filedata_positions.append(path.copy())
                    return {"type": "string", "format": "uri"}
                result = {}
                # Skip schema structure keys when building the path
                is_schema_root = "type" in node and "properties" in node
                for key, value in node.items():
                    if is_schema_root and key == "properties":
                        # Process properties without adding to path
                        result[key] = traverse(value, path)
                    else:
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

    def convert_strings_to_filedata(
        self, value: Any, filedata_positions: list[list[str | int]]
    ) -> Any:
        """
        Convert specific string values back to FileData objects based on their positions.

        Parameters:
            value: The input value to process
            filedata_positions: List of paths to positions where FileData objects were found
        """

        def traverse(node: Any, path: list[str | int] | None = None) -> Any:
            if path is None:
                path = []

            if isinstance(node, dict):
                return {
                    key: traverse(value, path + [key]) for key, value in node.items()
                }
            elif isinstance(node, list):
                return [traverse(item, path + [i]) for i, item in enumerate(node)]
            elif isinstance(node, str) and path in filedata_positions:
                return FileData(path=node)
            return node

        return traverse(value)

    def lazy_attach_gradio_client(self) -> Client:
        """
        Attach a Gradio client to the MCP server if it is not already attached.

        Parameters:
            server: The MCP server to attach the Gradio client to.
        """
        if self.gradio_client is None:
            if self.blocks.local_url is None:
                raise ValueError(
                    "Cannot query MCP server as the Gradio app is not running (no URL available)."
                )
            self.gradio_client = Client(self.blocks.local_url, verbose=False)
        return self.gradio_client

    def create_mcp_server(self) -> Server:
        """
        Create an MCP server for the given Gradio Blocks app.

        Parameters:
            blocks: The Blocks app to create the MCP server for.

        Returns:
            The MCP server.
        """
        server = Server(self.blocks.title or "Gradio App")

        @server.call_tool()
        async def call_tool(
            name: str, arguments: dict[str, Any]
        ) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
            """
            Call a tool on the Gradio app.

            Args:
                name: The name of the tool to call.
                arguments: The arguments to pass to the tool.
            """
            # client = self.lazy_attach_gradio_client()

            tool_endpoint = f"/{name}"
            named_endpoints = self.blocks.get_api_info()["named_endpoints"]  # type: ignore
            assert isinstance(named_endpoints, dict)  # noqa: S101
            endpoint_info = named_endpoints.get(tool_endpoint)
            if endpoint_info is None:
                raise ValueError(f"Unknown tool for this Gradio app: {name}")

            schema = {
                "type": "object",
                "properties": {
                    p["parameter_name"]: p["type"] for p in endpoint_info["parameters"]
                },
            }
            _, filedata_positions = self.simplify_filedata_schema(schema)
            processed_arguments = self.convert_strings_to_filedata(
                arguments, filedata_positions
            )
            block_fn = next(
                (fn for fn in self.blocks.fns.values() if fn.api_name == name),
                None,
            )
            if block_fn is None:
                raise ValueError(f"Unknown tool for this Gradio app: {name}")
            output = await self.blocks.process_api(
                block_fn=block_fn,
                inputs=list(processed_arguments.values()),
            )
            return_values = client_utils.traverse(
                output["data"], lambda x: x["path"], client_utils.is_file_obj_with_meta
            )
            return [
                types.TextContent(type="text", text=str(return_value))
                for return_value in return_values
            ]

        @server.list_tools()
        async def list_tools() -> list[types.Tool]:
            """
            List all tools on the Gradio app.
            """
            api_info = self.blocks.get_api_info()
            tools = []
            if not api_info:
                return tools
            for endpoint_name, endpoint_info in api_info["named_endpoints"].items():
                endpoint_name = endpoint_name.lstrip("/")
                if endpoint_info["show_api"]:
                    block_fn = next(
                        (
                            fn
                            for fn in self.blocks.fns.values()
                            if fn.api_name == endpoint_name
                        ),
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
                                        "type": self.simplify_filedata_schema(
                                            p["type"]
                                        ),
                                        **(
                                            {
                                                "description": parameters[
                                                    p["parameter_name"]
                                                ]
                                            }
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

    def launch_mcp_on_sse(self, app: Starlette, subpath: str) -> None:
        """
        Launch the MCP server on the SSE transport.

        Parameters:
            app: The Gradio app to mount the MCP server on.
            subpath: The subpath to mount the MCP server on. E.g. "/gradio_api/mcp"
        """
        messages_path = f"{subpath}/messages"
        sse = SseServerTransport(messages_path)

        async def handle_sse(request):
            async with sse.connect_sse(
                request.scope, request.receive, request._send
            ) as streams:
                await self.mcp_server.run(
                    streams[0],
                    streams[1],
                    self.mcp_server.create_initialization_options(),
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
