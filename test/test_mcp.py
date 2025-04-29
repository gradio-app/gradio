import os
import tempfile

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
    result = server.get_block_fn_from_tool_name("test_tool")
    assert result == app.fns[0]
    result = server.get_block_fn_from_tool_name("nonexistent_tool")
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
