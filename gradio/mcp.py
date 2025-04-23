from collections.abc import Callable
from typing import TYPE_CHECKING, Any

import gradio_client.utils as client_utils
from mcp import types
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.responses import JSONResponse
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
        self.mcp_server = self.create_mcp_server()

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
            _, filedata_positions = self.get_input_schema(name)
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
            if not api_info:
                return []

            tools = []
            for endpoint_name, endpoint_info in api_info["named_endpoints"].items():
                tool_name = endpoint_name.lstrip("/")
                if endpoint_info["show_api"]:
                    block_fn = next(
                        (
                            fn
                            for fn in self.blocks.fns.values()
                            if fn.api_name == tool_name
                        ),
                        None,
                    )
                    if block_fn is None or block_fn.fn is None:
                        continue
                    description, parameters = self.get_function_docstring(block_fn.fn)
                    schema, _ = self.get_input_schema(tool_name, parameters)
                    tools.append(
                        types.Tool(
                            name=tool_name,
                            description=description,
                            inputSchema=schema,
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
        messages_path = f"{subpath}/messages/"
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
                    Route(
                        "/schema", endpoint=self.get_complete_schema
                    ),  # Required for proper initialization
                    Route("/sse", endpoint=handle_sse),
                    Mount("/messages/", app=sse.handle_post_message),
                ],
            ),
        )

    def get_function_docstring(self, fn: Callable) -> tuple[str, dict[str, str]]:
        """
        Get the docstring of a function, and the description and parameters.

        Parameters:
            fn: The function to get the docstring for.

        Returns:
            - The docstring of the function
            - A dictionary of parameter names and their descriptions
        """
        fn_docstring = fn.__doc__
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
                param_name = param_name.split(" ")[0].strip()
                parameters[param_name] = param_desc.strip()
                line = next(lines_iter, "").strip()

        return description, parameters

    def get_input_schema(
        self,
        tool_name: str,
        parameters: dict[str, str] | None = None,
    ) -> tuple[dict[str, Any], list[list[str | int]]]:
        """
        Get the input schema of the Gradio app API, appropriately formatted for MCP.

        Parameters:
            tool_name: The name of the tool to get the schema for, e.g. "predict"
            parameters: The description and parameters of the tool to get the schema for.
        Returns:
            The input schema of the Gradio app API.
        """
        endpoint_name = f"/{tool_name}"
        named_endpoints = self.blocks.get_api_info()["named_endpoints"]  # type: ignore
        assert isinstance(named_endpoints, dict)  # noqa: S101
        endpoint_info = named_endpoints.get(endpoint_name)

        if endpoint_info is None:
            raise ValueError(f"Unknown tool for this Gradio app: {tool_name}")

        schema = {
            "type": "object",
            "properties": {
                p["parameter_name"]: {
                    **p["type"],
                    **(
                        {"description": parameters[p["parameter_name"]]}
                        if parameters and p["parameter_name"] in parameters
                        else {}
                    ),
                }
                for p in endpoint_info["parameters"]
            },
        }
        return self.simplify_filedata_schema(schema)

    async def get_complete_schema(self, request) -> JSONResponse:  # noqa: ARG002
        """
        Get the complete schema of the Gradio app API. (For debugging purposes)

        Parameters:
            request: The Starlette request object.

        Returns:
            A JSONResponse containing a dictionary mapping tool names to their input schemas.
        """
        api_info = self.blocks.get_api_info()
        if not api_info:
            return JSONResponse({})

        schemas = {}
        for endpoint_name, endpoint_info in api_info["named_endpoints"].items():
            tool_name = endpoint_name.lstrip("/")
            if endpoint_info["show_api"]:
                block_fn = next(
                    (fn for fn in self.blocks.fns.values() if fn.api_name == tool_name),
                    None,
                )
                if block_fn is None or block_fn.fn is None:
                    continue
                _, parameters = self.get_function_docstring(block_fn.fn)
                schema, _ = self.get_input_schema(tool_name, parameters)
                schemas[tool_name] = schema

        return JSONResponse(schemas)

    def simplify_filedata_schema(
        self, schema: dict[str, Any]
    ) -> tuple[dict[str, Any], list[list[str | int]]]:
        """
        Parses a schema of a Gradio app API to identify positions of FileData objects. Replaces them with
        just strings while keeping track of their positions so that they can be converted back to FileData objects
        later.

        Parameters:
            schema: The original schema of the Gradio app API.

        Returns:
            A tuple containing the simplified schema and the positions of the FileData objects.
        """
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
                is_schema_root = "type" in node and "properties" in node
                for key, value in node.items():
                    if is_schema_root and key == "properties":
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
        This is used to convert string values (which can be URLs or base64 encoded strings)
        to FileData dictionaries so that they can be passed into .preprocess() logic of a
        Gradio app.

        Parameters:
            value: The input data to process, which can be an arbitrary nested data structure
                that may or may not contain strings that should be converted to FileData objects.
            filedata_positions: List of paths to positions in the input data that should be converted to FileData objects.

        Returns:
            The processed data with strings converted to FileData objects where appropriate. Base64
            encoded strings are first saved to a temporary file and then converted to a FileData object.

        Example:
            >>> convert_strings_to_filedata(
                {"image": "https://example.com/image.jpg", "text": "Hello, world!"},
                [["image"]]
            )
            >>> {'image': FileData(path='https://example.com/image.jpg'), 'text': 'Hello, world!'},
            >>> convert_strings_to_filedata(
                {"image": "data:image/jpeg;base64,..."},
                [["image"]]
            )
            >>> {'image': FileData(path='<temporary file path>')},
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
