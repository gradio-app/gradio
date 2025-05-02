import base64
import os
import re
import tempfile
from io import BytesIO
from pathlib import Path
from typing import TYPE_CHECKING, Any

import gradio_client.utils as client_utils
from mcp import types
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from PIL import Image
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Mount, Route

from gradio import processing_utils, route_utils, utils
from gradio.blocks import BlockFunction
from gradio.data_classes import FileData

if TYPE_CHECKING:
    from gradio.blocks import Blocks


DEFAULT_TEMP_DIR = os.environ.get("GRADIO_TEMP_DIR") or str(
    Path(tempfile.gettempdir()) / "gradio"
)


class GradioMCPServer:
    """
    A class for creating an MCP server around a Gradio app.

    Args:
        blocks: The Blocks app to create the MCP server for.
    """

    def __init__(self, blocks: "Blocks"):
        self.blocks = blocks
        self.api_info = self.blocks.get_api_info()
        self.mcp_server = self.create_mcp_server()
        self.request = None
        self.root_url = None
        tool_prefix = utils.get_space()
        if tool_prefix:
            self.tool_prefix = re.sub(r"[^a-zA-Z0-9]", "_", tool_prefix)
        else:
            self.tool_prefix = ""

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
        ) -> list[types.TextContent | types.ImageContent]:
            """
            Call a tool on the Gradio app.

            Args:
                name: The name of the tool to call.
                arguments: The arguments to pass to the tool.
            """
            _, filedata_positions = self.get_input_schema(name)
            processed_kwargs = self.convert_strings_to_filedata(
                arguments, filedata_positions
            )
            block_fn = self.get_block_fn_from_tool_name(name)
            endpoint_name = f"/{name.removeprefix(self.tool_prefix)}"
            if self.api_info and endpoint_name in self.api_info["named_endpoints"]:
                parameters_info = self.api_info["named_endpoints"][endpoint_name][
                    "parameters"
                ]
                processed_args = client_utils.construct_args(
                    parameters_info,
                    (),
                    processed_kwargs,
                )
            else:
                processed_args = []
            if block_fn is None:
                raise ValueError(f"Unknown tool for this Gradio app: {name}")
            output = await self.blocks.process_api(
                block_fn=block_fn,
                inputs=processed_args,
                request=self.request,
            )
            return self.postprocess_output_data(output["data"])

        @server.list_tools()
        async def list_tools() -> list[types.Tool]:
            """
            List all tools on the Gradio app.
            """
            if not self.api_info:
                return []

            tools = []
            for endpoint_name, endpoint_info in self.api_info[
                "named_endpoints"
            ].items():
                tool_name = self.tool_prefix + endpoint_name.lstrip("/")
                if endpoint_info["show_api"]:
                    block_fn = self.get_block_fn_from_tool_name(tool_name)
                    if block_fn is None or block_fn.fn is None:
                        continue
                    description, parameters = utils.get_function_description(
                        block_fn.fn
                    )
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

    def launch_mcp_on_sse(self, app: Starlette, subpath: str, root_path: str) -> None:
        """
        Launch the MCP server on the SSE transport.

        Parameters:
            app: The Gradio app to mount the MCP server on.
            subpath: The subpath to mount the MCP server on. E.g. "/gradio_api/mcp"
        """
        messages_path = f"{subpath}/messages/"
        sse = SseServerTransport(messages_path)

        async def handle_sse(request):
            self.request = request
            self.root_url = route_utils.get_root_url(
                request=request,
                route_path="/gradio_api/mcp/sse",
                root_path=root_path,
            )
            try:
                async with sse.connect_sse(
                    request.scope, request.receive, request._send
                ) as streams:
                    await self.mcp_server.run(
                        streams[0],
                        streams[1],
                        self.mcp_server.create_initialization_options(),
                    )
            except Exception as e:
                print(f"MCP SSE connection error: {str(e)}")
                raise

        app.mount(
            subpath,
            Starlette(
                routes=[
                    Route(
                        "/schema",
                        endpoint=self.get_complete_schema,  # Not required for MCP but useful for debugging
                    ),
                    Route("/sse", endpoint=handle_sse),
                    Mount("/messages/", app=sse.handle_post_message),
                ],
            ),
        )

    def get_block_fn_from_tool_name(self, tool_name: str) -> "BlockFunction | None":
        """
        Get the BlockFunction for a given tool name.

        Parameters:
            tool_name: The name of the tool to get the BlockFunction for.

        Returns:
            The BlockFunction for the given tool name, or None if it is not found.
        """
        block_fn = next(
            (
                fn
                for fn in self.blocks.fns.values()
                if fn.api_name == tool_name.removeprefix(self.tool_prefix)
            ),
            None,
        )
        return block_fn

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
            - The input schema of the Gradio app API.
            - A list of positions of FileData objects in the input schema.
        """
        endpoint_name = f"/{tool_name.removeprefix(self.tool_prefix)}"
        named_endpoints = self.api_info["named_endpoints"]  # type: ignore
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
        if not self.api_info:
            return JSONResponse({})

        schemas = {}
        for endpoint_name, endpoint_info in self.api_info["named_endpoints"].items():
            tool_name = self.tool_prefix + endpoint_name.lstrip("/")
            if endpoint_info["show_api"]:
                block_fn = self.get_block_fn_from_tool_name(tool_name)
                if block_fn is None or block_fn.fn is None:
                    continue
                description, parameters = utils.get_function_description(block_fn.fn)
                schema, _ = self.get_input_schema(tool_name, parameters)
                schemas[tool_name] = schema
                schemas[tool_name]["description"] = description

        return JSONResponse(schemas)

    def simplify_filedata_schema(
        self, schema: dict[str, Any]
    ) -> tuple[dict[str, Any], list[list[str | int]]]:
        """
        Parses a schema of a Gradio app API to identify positions of FileData objects. Replaces them with base64
        strings while keeping track of their positions so that they can be converted back to FileData objects
        later.

        Parameters:
            schema: The original schema of the Gradio app API.

        Returns:
            A tuple containing the simplified schema and the positions of the FileData objects.
        """

        def is_gradio_filedata(obj: Any, defs: dict[str, Any]) -> bool:
            if not isinstance(obj, dict):
                return False

            if "$ref" in obj:
                ref = obj["$ref"]
                if ref.startswith("#/$defs/"):
                    key = ref.split("/")[-1]
                    obj = defs.get(key, {})
                else:
                    return False

            props = obj.get("properties", {})
            meta = props.get("meta", {})

            if "$ref" in meta:
                ref = meta["$ref"]
                if ref.startswith("#/$defs/"):
                    key = ref.split("/")[-1]
                    meta = defs.get(key, {})
                else:
                    return False

            type_field = meta.get("properties", {}).get("_type", {})
            default_type = meta.get("default", {}).get("_type")
            return (
                type_field.get("const") == "gradio.FileData"
                or default_type == "gradio.FileData"
            )

        def traverse(
            node: Any,
            path: list[str | int] | None = None,
            defs: dict[str, Any] | None = None,
        ) -> Any:
            if path is None:
                path = []
            if defs is None:
                defs = {}

            if isinstance(node, dict):
                if "$defs" in node:
                    defs.update(node["$defs"])

                if is_gradio_filedata(node, defs):
                    filedata_positions.append(path.copy())
                    for key in ["properties", "additional_description", "$defs"]:
                        node.pop(key, None)
                    node["type"] = "string"
                    node["format"] = "a http or https url to a file"

                result = {}
                is_schema_root = "type" in node and "properties" in node
                for key, value in node.items():
                    if is_schema_root and key == "properties":
                        result[key] = traverse(value, path, defs)
                    else:
                        path.append(key)
                        result[key] = traverse(value, path, defs)
                        path.pop()
                return result

            elif isinstance(node, list):
                result = []
                for i, item in enumerate(node):
                    path.append(i)
                    result.append(traverse(item, path, defs))
                    path.pop()
                return result

            return node

        filedata_positions: list[list[str | int]] = []
        simplified_schema = traverse(schema)
        return simplified_schema, filedata_positions

    def convert_strings_to_filedata(
        self, value: Any, filedata_positions: list[list[str | int]]
    ) -> Any:
        """
        Convert specific string values back to FileData objects based on their positions.
        This is used to convert string values (as base64 encoded strings) to FileData
        dictionaries so that they can be passed into .preprocess() logic of a Gradio app.

        Parameters:
            value: The input data to process, which can be an arbitrary nested data structure
                that may or may not contain strings that should be converted to FileData objects.
            filedata_positions: List of paths to positions in the input data that should be converted to FileData objects.

        Returns:
            The processed data with strings converted to FileData objects where appropriate. Base64
            encoded strings are first saved to a temporary file and then converted to a FileData object.

        Example:
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
                if node.startswith("data:"):
                    # Even though base64 is not officially part of our schema, some MCP clients
                    # might return base64 encoded strings, so try to save it to a temporary file.
                    return FileData(
                        path=processing_utils.save_base64_to_cache(
                            node, DEFAULT_TEMP_DIR
                        )
                    )
                elif node.startswith(("http://", "https://")):
                    return FileData(path=node)
                else:
                    raise ValueError(
                        f"Invalid file data format, provide a url ('http://...' or 'https://...'). Received: {node}"
                    )
            return node

        return traverse(value)

    @staticmethod
    def get_image(file_path: str) -> Image.Image | None:
        """
        If a filepath is a valid image, returns a PIL Image object. Otherwise returns None.
        """
        if not os.path.exists(file_path):
            return None
        ext = os.path.splitext(file_path.lower())[1]
        if ext not in Image.registered_extensions():
            return None
        try:
            return Image.open(file_path)
        except Exception:
            return None

    @staticmethod
    def get_base64_data(image: Image.Image, format: str) -> str:
        """
        Returns a base64 encoded string of the image.
        """
        buffer = BytesIO()
        image.save(buffer, format=format)
        return base64.b64encode(buffer.getvalue()).decode("utf-8")

    def postprocess_output_data(
        self, data: Any
    ) -> list[types.TextContent | types.ImageContent]:
        """
        Postprocess the output data from the Gradio app to convert FileData objects back to base64 encoded strings.

        Parameters:
            data: The output data to postprocess.
        """
        return_values = []
        if self.root_url:
            data = processing_utils.add_root_url(data, self.root_url, None)
        for output in data:
            if client_utils.is_file_obj_with_meta(output):
                if image := self.get_image(output["path"]):
                    image_format = image.format or "png"
                    base64_data = self.get_base64_data(image, image_format)
                    mimetype = f"image/{image_format.lower()}"
                    return_value = [
                        types.ImageContent(
                            type="image", data=base64_data, mimeType=mimetype
                        ),
                        types.TextContent(
                            type="text",
                            text=f"Image URL: {output['url'] or output['path']}",
                        ),
                    ]
                else:
                    return_value = [
                        types.TextContent(
                            type="text", text=str(output["url"] or output["path"])
                        )
                    ]
            else:
                return_value = [types.TextContent(type="text", text=str(output))]
            return_values.extend(return_value)
        return return_values
