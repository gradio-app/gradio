import base64
import contextlib
import copy
import os
import re
import tempfile
import warnings
from collections.abc import AsyncIterator, Sequence
from io import BytesIO
from pathlib import Path
from typing import TYPE_CHECKING, Any, Optional, cast
from urllib.parse import unquote

import gradio_client.utils as client_utils
import httpx
from anyio.to_thread import run_sync
from gradio_client import Client, handle_file
from gradio_client.utils import Status, StatusUpdate
from mcp import types
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from mcp.server.streamable_http_manager import StreamableHTTPSessionManager
from PIL import Image
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.routing import Mount, Route
from starlette.types import Receive, Scope, Send

from gradio import processing_utils, route_utils, utils
from gradio.blocks import BlockFunction
from gradio.components import State
from gradio.route_utils import Header

if TYPE_CHECKING:
    from gradio.blocks import BlockContext, Blocks
    from gradio.components import Component


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
        self.root_path = ""
        space_id = utils.get_space()
        self.tool_prefix = space_id.split("/")[-1] + "_" if space_id else ""
        self.tool_to_endpoint = self.get_tool_to_endpoint()
        self.warn_about_state_inputs()
        self._local_url: str | None = None
        self._client_instance: Client

        manager = StreamableHTTPSessionManager(
            app=self.mcp_server, json_response=False, stateless=True
        )

        async def handle_streamable_http(
            scope: Scope, receive: Receive, send: Send
        ) -> None:
            path = scope.get("path", "")
            if not path.endswith(
                (
                    "/gradio_api/mcp",
                    "/gradio_api/mcp/",
                    "/gradio_api/mcp/http",
                    "/gradio_api/mcp/http/",
                )
            ):
                response = Response(
                    content=f"Path '{path}' not found. The MCP HTTP transport is available at /gradio_api/mcp.",
                    status_code=404,
                )
                await response(scope, receive, send)
                return

            await manager.handle_request(scope, receive, send)

        @contextlib.asynccontextmanager
        async def lifespan(app: Starlette) -> AsyncIterator[None]:  # noqa: ARG001
            """Context manager for managing session manager lifecycle."""
            async with manager.run():
                try:
                    yield
                finally:
                    pass

        self.lifespan = lifespan
        self.manager = manager
        self.handle_streamable_http = handle_streamable_http

    @property
    def local_url(self) -> str | None:
        return self._local_url

    def get_route_path(self, request: Request) -> str:
        """
        Gets the route path of the MCP server based on the incoming request.
        Can be different depending on whether the request is coming from the MCP SSE transport or the HTTP transport.
        """
        url = httpx.URL(str(request.url))
        url = url.copy_with(query=None)
        url = str(url).rstrip("/")
        if url.endswith("/gradio_api/mcp/messages"):
            return "/gradio_api/mcp/messages"
        else:
            return "/gradio_api/mcp"

    def get_selected_tools_from_request(
        self, request: Request | None
    ) -> list[str] | None:
        """
        Extract the selected tools from the request query parameters and return the full tool names (with the tool prefix).
        Returns None if no tools parameter is specified (meaning all tools are available).
        """
        if request is None:
            return None
        query_params = dict(getattr(request, "query_params", {}))
        if "tools" in query_params:
            tools = query_params["tools"].split(",")
            full_tool_names = [self.tool_prefix + tool for tool in tools]
            return full_tool_names
        return None

    @staticmethod
    def valid_and_unique_tool_name(
        tool_name: str, existing_tool_names: set[str]
    ) -> str:
        """
        Sanitizes a tool name to make it a valid MCP tool name (only
        alphanumeric characters, underscores, <= 128 characters)
        and is unique among the existing tool names.
        """
        tool_name = re.sub(r"[^a-zA-Z0-9]", "_", tool_name)
        tool_name = tool_name[:120]  # Leave room for suffix if needed
        tool_name_base = tool_name
        suffix = 1
        while tool_name in existing_tool_names:
            tool_name = tool_name_base + f"_{suffix}"
            suffix += 1
        return tool_name

    def get_tool_to_endpoint(self) -> dict[str, str]:
        """
        Gets all of the tools that are exposed by the Gradio app and also
        creates a mapping from the tool names to the endpoint names in the API docs.
        """
        tool_to_endpoint = {}
        for endpoint_name, endpoint_info in self.api_info["named_endpoints"].items():
            if endpoint_info["show_api"]:
                block_fn = self.get_block_fn_from_endpoint_name(endpoint_name)
                if block_fn is None or block_fn.fn is None:
                    continue
                fn_name = (
                    getattr(block_fn.fn, "__name__", None)
                    or (
                        hasattr(block_fn.fn, "__class__")
                        and getattr(block_fn.fn.__class__, "__name__", None)
                    )
                    or endpoint_name.lstrip("/")
                )
                tool_name = self.tool_prefix + fn_name
                tool_name = self.valid_and_unique_tool_name(
                    tool_name, set(tool_to_endpoint.keys())
                )
                tool_to_endpoint[tool_name] = endpoint_name
        return tool_to_endpoint

    def warn_about_state_inputs(self) -> None:
        """
        Warn about tools that have gr.State inputs.
        """
        for _, endpoint_name in self.tool_to_endpoint.items():
            block_fn = self.get_block_fn_from_endpoint_name(endpoint_name)
            if block_fn and any(isinstance(input, State) for input in block_fn.inputs):
                warnings.warn(
                    "This MCP server includes a tool that has a gr.State input, which will not be "
                    "updated between tool calls. The original, default value of the State will be "
                    "used each time."
                )

    def _create_client(self, url):
        return Client(url, download_files=False, verbose=False)

    def create_mcp_server(self) -> Server:
        """
        Create an MCP server for the given Gradio Blocks app.

        Parameters:
            blocks: The Blocks app to create the MCP server for.

        Returns:
            The MCP server.
        """
        server = Server(str(self.blocks.title or "Gradio App"))

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
            context_request: Request | None = self.mcp_server.request_context.request
            progress_token = None
            if self.mcp_server.request_context.meta is not None:
                progress_token = self.mcp_server.request_context.meta.progressToken
            if context_request is None:
                raise ValueError(
                    "Could not find the request object in the MCP server context. This is not expected to happen. Please raise an issue: https://github.com/gradio-app/gradio."
                )

            selected_tools = self.get_selected_tools_from_request(context_request)

            route_path = self.get_route_path(context_request)
            root_url = route_utils.get_root_url(
                request=context_request,
                route_path=route_path,
                root_path=self.root_path,
            )
            if not hasattr(self, "_client_instance"):
                # TODO: Per-request headers
                self._client_instance = await run_sync(
                    self._create_client, self.local_url or root_url
                )
            _, filedata_positions = self.get_input_schema(name)
            processed_kwargs = self.convert_strings_to_filedata(
                arguments, filedata_positions
            )
            endpoint_name = self.tool_to_endpoint.get(name)
            if endpoint_name is None:
                raise ValueError(f"Unknown tool for this Gradio app: {name}")

            if selected_tools is not None and name not in selected_tools:
                raise ValueError(f"Tool '{name}' is not in the selected tools list")

            block_fn = self.get_block_fn_from_endpoint_name(endpoint_name)
            assert block_fn is not None  # noqa: S101

            if endpoint_name in self.api_info["named_endpoints"]:
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
            request_headers = dict(context_request.headers.items())
            request_headers.pop("content-length", None)
            step = 0
            output = {"data": []}
            async for update in self._client_instance.submit(
                *processed_args, api_name=endpoint_name, headers=request_headers
            ):
                if update.type == "status" and progress_token is not None:
                    update = cast(StatusUpdate, update)

                    if update.code in [Status.JOINING_QUEUE, Status.STARTING]:
                        message = "Joined server queue."
                    elif update.code in [Status.IN_QUEUE]:
                        message = f"In queue. Position {update.rank} out of {update.queue_size}."
                        if update.eta is not None:
                            message += (
                                f" Estimated time remaining: {update.eta} seconds."
                            )
                    elif update.code in [Status.PROGRESS]:
                        for progress_unit in update.progress_data or []:
                            title = (
                                "Progress"
                                if progress_unit.desc is None
                                else f"Progress {progress_unit.desc}"
                            )
                            if (
                                progress_unit.index is not None
                                and progress_unit.length is not None
                            ):
                                message = f"{title}: Step {progress_unit.index} of {progress_unit.length}"
                            elif (
                                progress_unit.index is not None
                                and progress_unit.length is None
                            ):
                                message = f"{title}: Step {progress_unit.index}"
                    elif update.code in [Status.PROCESSING, Status.ITERATING]:
                        message = "Processing"
                    else:
                        message = None

                    await self.mcp_server.request_context.session.send_progress_notification(
                        progress_token=progress_token,
                        progress=step,
                        message=message,  # type: ignore
                    )
                    step += 1
                elif update.type == "output" and update.final:
                    output = update.outputs
                    if not update.success:
                        error_title = output.get("title")
                        error_message = output.get("error")
                        if error_title and error_message:
                            msg = f"{error_title}: {error_message}"
                        elif error_message:
                            msg = error_message
                        elif error_title:
                            msg = error_title
                        else:
                            msg = "Error!"
                        # Need to raise an error so that call_tool returns an error payload
                        raise RuntimeError(msg)
            processed_args = self.pop_returned_state(block_fn.inputs, processed_args)
            return self.postprocess_output_data(output["data"], root_url)

        @server.list_tools()
        async def list_tools() -> list[types.Tool]:
            """
            List all tools on the Gradio app.
            """
            context_request: Request | None = self.mcp_server.request_context.request
            selected_tools = self.get_selected_tools_from_request(context_request)

            tools = []
            for tool_name, endpoint_name in self.tool_to_endpoint.items():
                if selected_tools is not None and tool_name not in selected_tools:
                    continue

                block_fn = self.get_block_fn_from_endpoint_name(endpoint_name)
                assert block_fn is not None and block_fn.fn is not None  # noqa: S101

                description, parameters = self.get_fn_description(block_fn, tool_name)
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
            root_path: The root path of the Gradio Blocks app.
        """
        messages_path = "/messages/"
        sse = SseServerTransport(messages_path)
        self.root_path = root_path

        async def handle_sse(request):
            try:
                async with sse.connect_sse(
                    request.scope, request.receive, request._send
                ) as streams:
                    await self.mcp_server.run(
                        streams[0],
                        streams[1],
                        self.mcp_server.create_initialization_options(),
                    )
                return Response()
            except Exception as e:
                print(f"MCP SSE connection error: {str(e)}")
                raise

        app.mount(
            subpath,
            Starlette(
                routes=[
                    Route(
                        "/schema",
                        endpoint=self.get_complete_schema,  # Not required for MCP but used by the Hugging Face MCP server to get the schema for MCP Spaces without needing to establish an SSE connection
                    ),
                    Route("/sse", endpoint=handle_sse),
                    Mount("/messages/", app=sse.handle_post_message),
                    Mount("/", app=self.handle_streamable_http),
                ],
            ),
        )

    def get_block_fn_from_endpoint_name(
        self, endpoint_name: str
    ) -> "BlockFunction | None":
        """
        Get the BlockFunction for a given endpoint name (e.g. "/predict").

        Parameters:
            endpoint_name: The name of the endpoint to get the BlockFunction for.

        Returns:
            The BlockFunction for the given endpoint name, or None if it is not found.
        """
        block_fn = next(
            (
                fn
                for fn in self.blocks.fns.values()
                if fn.api_name == endpoint_name.lstrip("/")
            ),
            None,
        )
        return block_fn

    @property
    def _file_data_tool_description(self) -> str:
        """
        Sentence prompting the agent to use the upload_file_to_gradio tool if a file is passed as an input.
        """
        return " If a user passes a file as an input, use the upload_file_to_gradio tool, if present, to upload the file to the gradio app and create a Gradio File Input. Then use the returned path as the input to the tool"

    def get_fn_description(
        self, block_fn: "BlockFunction", tool_name: str
    ) -> tuple[str, dict[str, str]]:
        """
        Get the description of a function, which is used to describe the tool in the MCP server.
        Also returns the description of each parameter of the function as a dictionary.
        """
        description, parameters, returns = utils.get_function_description(block_fn.fn)  # type: ignore
        _, filedata_positions = self.get_input_schema(tool_name, parameters)
        if block_fn.api_description is False:
            description = ""
        elif block_fn.api_description is None:
            if len(filedata_positions) > 0:
                description += self._file_data_tool_description
            if returns:
                description += (
                    ("" if description.endswith(".") else ".")
                    + " Returns: "
                    + ", ".join(returns)
                )
        else:
            description = block_fn.api_description
            if len(filedata_positions) > 0:
                description += self._file_data_tool_description  # type: ignore
        assert isinstance(description, str)  # noqa: S101
        return description, parameters

    @staticmethod
    def insert_empty_state(
        inputs: Sequence["Component | BlockContext"], data: list
    ) -> list:
        """
        Insert None placeholder values for any State input components, as State inputs
        are not included in the endpoint schema.
        """
        for i, input_component_type in enumerate(inputs):
            if isinstance(input_component_type, State):
                data.insert(i, None)
        return data

    @staticmethod
    def pop_returned_state(
        inputs: Sequence["Component | BlockContext"], data: list
    ) -> list:
        """
        Remove any values corresponding to State output components from the data
        as State outputs are not included in the endpoint schema.
        """
        for i, input_component_type in enumerate(inputs):
            if isinstance(input_component_type, State):
                data.pop(i)
        return data

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
        endpoint_name = self.tool_to_endpoint.get(tool_name)
        if endpoint_name is None:
            raise ValueError(f"Unknown tool for this Gradio app: {tool_name}")
        named_endpoints = self.api_info["named_endpoints"]
        endpoint_info = named_endpoints.get(endpoint_name)
        assert endpoint_info is not None  # noqa: S101

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
                    **(
                        {"default": p["parameter_default"]}
                        if "parameter_default" in p and p["parameter_default"]
                        else {}
                    ),
                }
                for p in endpoint_info["parameters"]
            },
        }
        return self.simplify_filedata_schema(schema)

    async def get_complete_schema(self, request) -> JSONResponse:
        """
        Get the complete schema of the Gradio app API. For debugging purposes, also used by
        the Hugging Face MCP server to get the schema for MCP Spaces without needing to
        establish an SSE connection.

        Parameters:
            request: The Starlette request object.

        Returns:
            A JSONResponse containing a dictionary mapping tool names to their input schemas.
        """
        if not self.api_info:
            return JSONResponse({})

        query_params = dict(getattr(request, "query_params", {}))
        selected_tools = None
        if "tools" in query_params:
            tools = query_params["tools"].split(",")
            selected_tools = set(tools)

        file_data_present = False

        schemas = []
        for tool_name, endpoint_name in self.tool_to_endpoint.items():
            if selected_tools is not None and tool_name not in selected_tools:
                continue
            block_fn = self.get_block_fn_from_endpoint_name(endpoint_name)
            assert block_fn is not None and block_fn.fn is not None  # noqa: S101

            description, parameters = self.get_fn_description(block_fn, tool_name)
            schema, filedata_positions = self.get_input_schema(tool_name, parameters)
            if len(filedata_positions) > 0 and not file_data_present:
                file_data_present = True

            type_hints = utils.get_type_hints(block_fn.fn)
            required_headers = []
            for param_name, type_hint in type_hints.items():
                if type_hint is Header or type_hint is Optional[Header]:
                    header_name = param_name.replace("_", "-").lower()
                    required_headers.append(header_name)
            meta = None
            if required_headers:
                meta = {"headers": required_headers}

            info = {
                "name": tool_name,
                "description": description,
                "inputSchema": schema,
                "meta": {"file_data_present": file_data_present},
            }
            if meta is not None:
                info["meta"] = meta
            schemas.append(info)

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
            # Deep copy the node to avoid modifying the original node
            node = copy.deepcopy(node)

            if isinstance(node, dict):
                if "$defs" in node:
                    defs.update(node["$defs"])

                if is_gradio_filedata(node, defs):
                    filedata_positions.append(path.copy())
                    for key in ["properties", "additional_description", "$defs"]:
                        node.pop(key, None)
                    node["type"] = "string"
                    node["format"] = "Gradio File Input - a http or https url to a file"

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
                    return handle_file(
                        processing_utils.save_base64_to_cache(node, DEFAULT_TEMP_DIR)
                    )
                elif node.startswith(("http://", "https://")):
                    return handle_file(node)
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
    def get_svg(file_data: Any) -> bytes | None:
        """
        If a file_data is a valid FileDataDict with a url that is a data:image/svg+xml, returns bytes of the svg. Otherwise returns None.
        """
        if isinstance(file_data, dict) and (url := file_data.get("url")):
            if isinstance(url, str) and url.startswith("data:image/svg"):
                return unquote(url.split(",", 1)[1]).encode()
            else:
                return None
        else:
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
        self, data: Any, root_url: str
    ) -> list[types.TextContent | types.ImageContent]:
        """
        Postprocess the output data from the Gradio app to convert FileData objects back to base64 encoded strings.

        Parameters:
            data: The output data to postprocess.
        """
        return_values = []
        data = processing_utils.add_root_url(data, root_url, None)
        for output in data:
            if svg_bytes := self.get_svg(output):
                base64_data = base64.b64encode(svg_bytes).decode("utf-8")
                mimetype = "image/svg+xml"
                svg_path = processing_utils.save_bytes_to_cache(
                    svg_bytes, f"{output['orig_name']}", DEFAULT_TEMP_DIR
                )
                svg_url = f"{root_url}/gradio_api/file={svg_path}"
                return_value = [
                    types.ImageContent(
                        type="image", data=base64_data, mimeType=mimetype
                    ),
                    types.TextContent(
                        type="text",
                        text=f"SVG Image URL: {svg_url}",
                    ),
                ]
            elif client_utils.is_file_obj_with_meta(output):
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
