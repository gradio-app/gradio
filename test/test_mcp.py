import os
import tempfile

import httpx
import pytest
from PIL import Image

import gradio as gr
from gradio.data_classes import FileData
from gradio.mcp import GradioMCPServer

with gr.Blocks() as app:
    t1 = gr.Textbox(label="Test Textbox")
    t2 = gr.Textbox(label="Test Textbox 2")
    t1.submit(lambda x: x, t1, t2, api_name="test_tool")


def test_gradio_mcp_server_initialization():
    server = GradioMCPServer(app)
    assert server.blocks == app
    assert server.mcp_server is not None


def test_get_block_fn_from_tool_name():
    server = GradioMCPServer(app)
    result = server.get_block_fn_from_endpoint_name("test_tool")
    assert result == app.fns[0]
    result = server.get_block_fn_from_endpoint_name("nonexistent_tool")
    assert result is None


def test_convert_strings_to_filedata():
    server = GradioMCPServer(app)

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


def test_postprocess_output_data():
    server = GradioMCPServer(app)

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


def test_simplify_filedata_schema():
    server = GradioMCPServer(app)

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


def test_tool_prefix_character_replacement():
    test_cases = [
        ("test-space", "test_space"),
        ("flux.1_schnell", "flux_1_schnell"),
        ("test\\backslash", "test_backslash"),
        ("test:colon spaces ", "test_colon_spaces_"),
    ]

    original_system = os.environ.get("SYSTEM")
    original_space_id = os.environ.get("SPACE_ID")

    try:
        os.environ["SYSTEM"] = "spaces"
        for input_prefix, expected_prefix in test_cases:
            os.environ["SPACE_ID"] = input_prefix
            server = GradioMCPServer(app)
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


def test_mcp_sse_transport():
    _, url, _ = app.launch(mcp_server=True, prevent_thread_lock=True)

    with httpx.Client(timeout=5) as client:
        sse_url = f"{url}gradio_api/mcp/sse"

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
