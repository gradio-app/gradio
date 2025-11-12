import copy
import json
import os
import tempfile
import time

import httpx
import pytest
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from PIL import Image
from starlette.requests import Request

import gradio as gr
from gradio.data_classes import FileData
from gradio.mcp import GradioMCPServer


def test_gradio_mcp_server_initialization(test_mcp_app):
    server = GradioMCPServer(test_mcp_app)
    assert server.blocks == test_mcp_app
    assert server.mcp_server is not None


def test_get_block_fn_from_tool_name(test_mcp_app):
    server = GradioMCPServer(test_mcp_app)
    result = server.get_block_fn_from_endpoint_name("test_tool")
    assert result == test_mcp_app.fns[0]
    result = server.get_block_fn_from_endpoint_name("nonexistent_tool")
    assert result is None


def test_generate_tool_names_correctly_for_interfaces():
    def echo(x):
        return x

    class MyCallable:
        def __call__(self, x):
            return x

    app = gr.TabbedInterface(
        [
            gr.Interface(echo, "text", "text"),
            gr.Interface(echo, "image", "image"),
            gr.Interface(lambda x: x, "audio", "audio"),
            gr.Interface(MyCallable(), "text", "text"),
        ]
    )
    server = GradioMCPServer(app)
    assert list(server.tool_to_endpoint.keys()) == [
        "echo",
        "echo_1",
        "_lambda_",
        "MyCallable",
    ]


def test_convert_strings_to_filedata(test_mcp_app):
    server = GradioMCPServer(test_mcp_app)

    test_data = {
        "text": "test text",
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    }
    filedata_positions: list[list[str | int]] = [["image"]]
    result = server.convert_strings_to_filedata(test_data, filedata_positions)
    assert isinstance(result["image"], dict)
    result["image"] = FileData(**result["image"])  # type: ignore
    assert os.path.exists(result["image"].path)

    test_data = {"image": "invalid_data"}
    with pytest.raises(ValueError):
        server.convert_strings_to_filedata(test_data, filedata_positions)


def test_postprocess_output_data(test_mcp_app):
    server = GradioMCPServer(test_mcp_app)
    fake_root_url = "http://localhost:7860"

    temp_file = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    temp_file.close()
    try:
        img = Image.new("RGB", (10, 10), color="red")
        img.save(temp_file.name)
        url = f"http://localhost:7860/gradio_api/file={temp_file.name}"
        test_data = [
            {"path": temp_file.name, "url": url, "meta": {"_type": "gradio.FileData"}}
        ]
        result = server.postprocess_output_data(test_data, fake_root_url)
        assert len(result) == 2
        assert result[0].type == "image"
        assert result[0].mimeType == "image/png"  # type: ignore
        assert result[1].type == "text"
        assert url in result[1].text  # type: ignore
    finally:
        os.unlink(temp_file.name)

    svg_data_uri = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2240%22%20fill%3D%22blue%22%2F%3E%3C%2Fsvg%3E"
    test_data = [
        {
            "path": None,
            "url": svg_data_uri,
            "meta": {"_type": "gradio.FileData"},
            "orig_name": "test.svg",
        }
    ]
    result = server.postprocess_output_data(test_data, fake_root_url)
    assert len(result) == 2
    assert result[0].type == "image"
    assert result[0].mimeType == "image/svg+xml"  # type: ignore
    assert result[1].type == "text"
    assert "Image URL:" in result[1].text  # type: ignore
    assert "/gradio_api/file=" in result[1].text  # type: ignore

    test_data = ["test text"]
    result = server.postprocess_output_data(test_data, fake_root_url)
    assert len(result) == 1
    assert result[0].type == "text"
    assert result[0].text == "test text"  # type: ignore


def test_simplify_filedata_schema(test_mcp_app):
    server = GradioMCPServer(test_mcp_app)

    test_schema = {
        "type": "object",
        "properties": {
            "text": {"type": "string"},
            "image": {
                "type": "object",
                "properties": {"meta": {"default": {"_type": "gradio.FileData"}}},
            },
        },
    }
    old_schema = copy.deepcopy(test_schema)

    simplified_schema, filedata_positions = server.simplify_filedata_schema(test_schema)
    assert simplified_schema["properties"]["image"]["type"] == "string"
    assert filedata_positions == [["image"]]
    # Verify that the original schema is not modified
    assert test_schema == old_schema


def test_tool_prefix_character_replacement(test_mcp_app):
    test_cases = [
        ("test-space", "test_space_test_tool"),
        ("flux.1_schnell", "flux_1_schnell_test_tool"),
        ("test\\backslash", "test_backslash_test_tool"),
        ("test:colon spaces ", "test_colon_spaces__test_tool"),
    ]

    original_system = os.environ.get("SYSTEM")
    original_space_id = os.environ.get("SPACE_ID")

    try:
        os.environ["SYSTEM"] = "spaces"
        for space_id, tool_name in test_cases:
            os.environ["SPACE_ID"] = space_id
            server = GradioMCPServer(test_mcp_app)
            assert tool_name in server.tool_to_endpoint
    finally:
        if original_system is not None:
            os.environ["SYSTEM"] = original_system
        else:
            os.environ.pop("SYSTEM", None)
        if original_space_id is not None:
            os.environ["SPACE_ID"] = original_space_id
        else:
            os.environ.pop("SPACE_ID", None)


@pytest.mark.serial
def test_mcp_sse_transport(test_mcp_app):
    _, url, _ = test_mcp_app.launch(mcp_server=True, prevent_thread_lock=True)

    with httpx.Client(timeout=5) as client:
        config_url = f"{url}config"
        config_response = client.get(config_url)
        assert config_response.is_success
        assert config_response.json()["mcp_server"] is True

        schema_url = f"{url}gradio_api/mcp/schema"
        sse_url = f"{url}gradio_api/mcp/sse"

        response = client.get(schema_url)
        assert response.is_success
        assert response.json() == [
            {
                "name": "test_tool",
                "description": "This is a test tool. Returns: - the original value as a string",
                "inputSchema": {
                    "type": "object",
                    "properties": {"x": {"type": "string", "description": ""}},
                },
                "meta": {
                    "file_data_present": False,
                    "mcp_type": "tool",
                    "endpoint_name": "test_tool",
                },
            }
        ]

        with client.stream("GET", sse_url) as response:
            assert response.is_success

            terminate_next = False
            line = ""
            for line in response.iter_lines():
                if terminate_next:
                    break
                if line.startswith("event: endpoint"):
                    terminate_next = True

            messages_path = line[5:].strip()
            messages_url = f"{url.rstrip('/')}{messages_path}"

            message_response = client.post(
                messages_url,
                json={
                    "method": "initialize",
                    "params": {
                        "protocolVersion": "2025-03-26",
                        "capabilities": {},
                    },
                    "jsonrpc": "2.0",
                    "id": 0,
                },
                headers={"Content-Type": "application/json"},
            )

            assert message_response.is_success, (
                f"Failed with status {message_response.status_code}: {message_response.text}"
            )


def make_app():
    import uvicorn
    from fastapi import FastAPI

    from gradio.routes import mount_gradio_app

    with gr.Blocks() as app:
        t1 = gr.Textbox(label="Test Textbox")
        t2 = gr.Textbox(label="Test Textbox 2")
        t1.submit(lambda x: x, t1, t2, api_name="test_tool")

    fastapi_app = FastAPI()
    mount_gradio_app(fastapi_app, app, path="/test", mcp_server=True)
    uvicorn.run(fastapi_app, port=6868)


@pytest.mark.serial
def test_mcp_mount_gradio_app():
    import multiprocessing

    process = multiprocessing.Process(target=make_app)
    try:
        process.start()
        max_retries = 4
        retry_delay = 2

        for attempt in range(max_retries):
            try:
                with httpx.Client(timeout=1) as test_client:
                    test_response = test_client.get("http://localhost:6868/test/")
                    if test_response.status_code == 200:
                        break
            except (httpx.ConnectError, httpx.TimeoutException):
                if attempt == max_retries - 1:
                    raise Exception("Gradio app did not start") from None
                time.sleep(retry_delay * (2**attempt))

        with httpx.Client(timeout=5) as client:
            config_url = "http://localhost:6868/test/config"
            config_response = client.get(config_url)
            assert config_response.is_success
            assert config_response.json()["mcp_server"] is True

            sse_url = "http://localhost:6868/test/gradio_api/mcp/sse"

            with client.stream("GET", sse_url) as response:
                assert response.is_success

                terminate_next = False
                line = ""
                for line in response.iter_lines():
                    if terminate_next:
                        break
                    if line.startswith("event: endpoint"):
                        terminate_next = True

                messages_path = line[5:].strip()
                messages_url = f"http://localhost:6868{messages_path}"

                message_response = client.post(
                    messages_url,
                    json={
                        "method": "initialize",
                        "params": {
                            "protocolVersion": "2025-03-26",
                            "capabilities": {},
                        },
                        "jsonrpc": "2.0",
                        "id": 0,
                    },
                    headers={"Content-Type": "application/json"},
                )

                assert message_response.is_success, (
                    f"Failed with status {message_response.status_code}: {message_response.text}"
                )
    finally:
        process.terminate()


@pytest.mark.asyncio
async def test_associative_keyword_in_schema():
    def test_tool(x):
        return x

    demo = gr.Interface(test_tool, "image", "image")
    server = GradioMCPServer(demo)

    scope = {
        "type": "http",
        "headers": [],
        "server": ("localhost", 7860),
        "path": "/gradio_api/mcp/schema",
        "query_string": "",
    }
    request = Request(scope)

    schema = (await server.get_complete_schema(request)).body.decode("utf-8")  # type: ignore
    schema = json.loads(schema)
    assert (
        schema[0]["inputSchema"]["properties"]["x"]["format"]
        == "Gradio File Input - a http or https url to a file"
    )
    assert (
        "to upload the file to the gradio app and create a Gradio File Input"
        in schema[0]["description"]
    )
    assert schema[0]["meta"]["file_data_present"]


@pytest.mark.asyncio
async def test_tool_selection_via_query_params():
    def tool_1(x):
        return x

    def tool_2(x):
        return x

    demo = gr.TabbedInterface(
        [
            gr.Interface(tool_1, "image", "image"),
            gr.Interface(tool_2, "image", "image"),
        ]
    )

    server = GradioMCPServer(demo)

    scope = {
        "type": "http",
        "headers": [],
        "server": ("localhost", 7860),
        "path": "/gradio_api/mcp/schema",
        "query_string": "",
    }
    request = Request(scope)

    schema = (await server.get_complete_schema(request)).body.decode("utf-8")  # type: ignore
    schema = json.loads(schema)
    assert schema[0]["name"] == "tool_1"
    assert schema[1]["name"] == "tool_2"

    scope = {
        "type": "http",
        "headers": [],
        "server": ("localhost", 7860),
        "path": "/gradio_api/mcp/schema",
        "query_string": "tools=tool_2",
    }
    request = Request(scope)

    schema = (await server.get_complete_schema(request)).body.decode("utf-8")  # type: ignore
    schema = json.loads(schema)
    assert len(schema) == 1
    assert schema[0]["name"] == "tool_2"


@pytest.mark.asyncio
@pytest.mark.serial
async def test_mcp_streamable_http_client():
    def double(word: str) -> str:
        """
        Doubles the input word.

        Parameters:
            word: The word to double
        Returns:
            The doubled word
        """
        return word * 2

    with gr.Blocks() as demo:
        input_box = gr.Textbox(label="Input")
        output_box = gr.Textbox(label="Output")
        input_box.change(double, input_box, output_box, api_name="double")

    _, local_url, _ = demo.launch(prevent_thread_lock=True, mcp_server=True)
    mcp_url = f"{local_url}gradio_api/mcp/"

    try:
        async with streamablehttp_client(mcp_url) as (read_stream, write_stream, _):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()

                tools_response = await session.list_tools()
                assert len(tools_response.tools) == 1
                tool = tools_response.tools[0]
                assert "double" in tool.name
                assert "Doubles the input word" in tool.description

                result = await session.call_tool(tool.name, arguments={"word": "Hello"})
                assert len(result.content) == 1
                assert result.content[0].text == "HelloHello"
    finally:
        demo.close()


@pytest.mark.serial
@pytest.mark.asyncio
async def test_mcp_streamable_http_client_with_progress_callback():
    progress_updates = []

    def slow_processor(text: str, progress=gr.Progress()) -> str:
        """
        Processes text slowly with progress updates.

        Parameters:
            text: The text to process
        Returns:
            The processed text
        """
        total = len(text)
        for i in range(total):
            progress((i + 1) / total, desc=f"Processing character {i + 1}/{total}")
        return text.upper()

    with gr.Blocks() as demo:
        input_box = gr.Textbox(label="Input")
        output_box = gr.Textbox(label="Output")
        input_box.submit(slow_processor, input_box, output_box, api_name="process")

    demo.queue()
    _, local_url, _ = demo.launch(prevent_thread_lock=True, mcp_server=True)
    mcp_url = f"{local_url}gradio_api/mcp/"

    try:
        async with streamablehttp_client(mcp_url) as (read_stream, write_stream, _):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()

                tools_response = await session.list_tools()
                assert len(tools_response.tools) == 1
                tool = tools_response.tools[0]
                assert "process" in tool.name

                async def progress_callback(
                    progress: float, total: float | None, message: str | None
                ):
                    progress_updates.append(
                        {"progress": progress, "total": total, "message": message}
                    )

                result = await session.call_tool(
                    tool.name,
                    arguments={"text": "test"},
                    progress_callback=progress_callback,
                    meta={"progressToken": "test-token-123"},
                )

                assert len(result.content) == 1
                assert result.content[0].text == "TEST"
                assert len(progress_updates) > 0, "Expected to receive progress updates"
    finally:
        demo.close()
