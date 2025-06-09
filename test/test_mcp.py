import os
import tempfile
import time

import httpx
import pytest
from PIL import Image

import gradio as gr
from gradio.data_classes import FileData
from gradio.mcp import GradioMCPServer


def test_gradio_mcp_server_initialization(test_mcp_app):
    server = GradioMCPServer(test_mcp_app, root_path="")
    assert server.blocks == test_mcp_app
    assert server.mcp_server is not None


def test_get_block_fn_from_tool_name(test_mcp_app):
    server = GradioMCPServer(test_mcp_app, root_path="")
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
    server = GradioMCPServer(app, root_path="")
    assert list(server.tool_to_endpoint.keys()) == [
        "echo",
        "echo_",
        "<lambda>",
        "MyCallable",
    ]


def test_convert_strings_to_filedata(test_mcp_app):
    server = GradioMCPServer(test_mcp_app, root_path="")

    test_data = {
        "text": "test text",
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    }
    filedata_positions: list[list[str | int]] = [["image"]]
    result = server.convert_strings_to_filedata(test_data, filedata_positions)
    assert isinstance(result["image"], FileData)
    assert os.path.exists(result["image"].path)

    test_data = {"image": "invalid_data"}
    with pytest.raises(ValueError):
        server.convert_strings_to_filedata(test_data, filedata_positions)


def test_postprocess_output_data(test_mcp_app):
    server = GradioMCPServer(test_mcp_app, root_path="")

    with tempfile.NamedTemporaryFile(suffix=".png") as temp_file:
        img = Image.new("RGB", (10, 10), color="red")
        img.save(temp_file.name)
        url = f"http://localhost:7860/gradio_api/file={temp_file.name}"
        test_data = [
            {"path": temp_file.name, "url": url, "meta": {"_type": "gradio.FileData"}}
        ]
        result = server.postprocess_output_data(test_data)
        assert len(result) == 2
        assert result[0].type == "image"
        assert result[0].mimeType == "image/png"
        assert result[1].type == "text"
        assert url in result[1].text

    test_data = ["test text"]
    result = server.postprocess_output_data(test_data)
    assert len(result) == 1
    assert result[0].type == "text"
    assert result[0].text == "test text"


def test_simplify_filedata_schema(test_mcp_app):
    server = GradioMCPServer(test_mcp_app, root_path="")

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

    simplified_schema, filedata_positions = server.simplify_filedata_schema(test_schema)
    assert simplified_schema["properties"]["image"]["type"] == "string"
    assert filedata_positions == [["image"]]


def test_tool_prefix_character_replacement(test_mcp_app):
    test_cases = [
        ("test-space", "test_space_"),
        ("flux.1_schnell", "flux_1_schnell_"),
        ("test\\backslash", "test_backslash_"),
        ("test:colon spaces ", "test_colon_spaces__"),
    ]

    original_system = os.environ.get("SYSTEM")
    original_space_id = os.environ.get("SPACE_ID")

    try:
        os.environ["SYSTEM"] = "spaces"
        for input_prefix, expected_prefix in test_cases:
            os.environ["SPACE_ID"] = input_prefix
            server = GradioMCPServer(test_mcp_app, root_path="")
            assert server.tool_prefix == expected_prefix
    finally:
        if original_system is not None:
            os.environ["SYSTEM"] = original_system
        else:
            os.environ.pop("SYSTEM", None)
        if original_space_id is not None:
            os.environ["SPACE_ID"] = original_space_id
        else:
            os.environ.pop("SPACE_ID", None)


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
                "description": "This is a test tool. Returns: the original value as a string",
                "inputSchema": {
                    "type": "object",
                    "properties": {"x": {"type": "string"}},
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


@pytest.mark.serial
def test_mcp_mount_gradio_app():
    import threading

    import uvicorn
    from fastapi import FastAPI

    from gradio.routes import mount_gradio_app

    with gr.Blocks() as app:
        t1 = gr.Textbox(label="Test Textbox")
        t2 = gr.Textbox(label="Test Textbox 2")
        t1.submit(lambda x: x, t1, t2, api_name="test_tool")

    fastapi_app = FastAPI()
    mount_gradio_app(fastapi_app, app, path="/test", mcp_server=True)

    thread = threading.Thread(
        target=uvicorn.run, args=(fastapi_app,), kwargs={"port": 6868}, daemon=True
    )
    thread.start()

    # Wait for Gradio app to start with exponential backoff
    max_retries = 4
    retry_delay = 0.1

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
