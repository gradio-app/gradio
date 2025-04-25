import os
import tempfile
from unittest.mock import MagicMock

import pytest

import gradio as gr
from gradio.data_classes import FileData
from gradio.mcp import GradioMCPServer

with gr.Blocks() as mock_blocks:
    t1 = gr.Textbox(label="Test Textbox")
    t2 = gr.Textbox(label="Test Textbox 2")
    t1.submit(lambda x: x, t1, t2, api_name="test_tool")



def test_gradio_mcp_server_initialization():
    server = GradioMCPServer(mock_blocks)
    assert server.blocks == mock_blocks
    assert server.mcp_server is not None


def test_get_block_fn_from_tool_name(mock_blocks):
    server = GradioMCPServer(mock_blocks)
    result = server.get_block_fn_from_tool_name("test_tool")
    assert result == mock_blocks.fns[0]
    result = server.get_block_fn_from_tool_name("nonexistent_tool")
    assert result is None


def test_convert_strings_to_filedata():
    server = GradioMCPServer(MagicMock())

    # Test with base64 string
    test_data = {
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    }
    filedata_positions: list[list[str | int]] = [["image"]]
    result = server.convert_strings_to_filedata(test_data, filedata_positions)
    assert isinstance(result["image"], FileData)
    assert os.path.exists(result["image"]["path"])

    # Test with URL
    test_data = {"image": "https://example.com/image.png"}
    result = server.convert_strings_to_filedata(test_data, filedata_positions)
    assert isinstance(result["image"], FileData)

    # Test with invalid format
    test_data = {"image": "invalid_data"}
    with pytest.raises(ValueError):
        server.convert_strings_to_filedata(test_data, filedata_positions)


def test_postprocess_output_data(mock_image):
    server = GradioMCPServer(MagicMock())

    # Test with image data
    with tempfile.NamedTemporaryFile(suffix=".png") as temp_file:
        mock_image.save(temp_file.name)
        test_data = [{"path": temp_file.name}]
        result = server.postprocess_output_data(test_data)
        assert len(result) == 1
        assert result[0].type == "image"
        assert result[0].mimeType == "image/png"

    # Test with text data
    test_data = ["test text"]
    result = server.postprocess_output_data(test_data)
    assert len(result) == 1
    assert result[0].type == "text"
    assert result[0].text == "test text"


def test_simplify_filedata_schema():
    server = GradioMCPServer(MagicMock())

    test_schema = {
        "type": "object",
        "properties": {
            "image": {
                "type": "object",
                "properties": {"meta": {"default": {"_type": "gradio.FileData"}}},
            }
        },
    }

    simplified_schema, filedata_positions = server.simplify_filedata_schema(test_schema)
    assert simplified_schema["properties"]["image"]["type"] == "string"
    assert (
        simplified_schema["properties"]["image"]["format"]
        == "url or base64 encoded string"
    )
    assert filedata_positions == [["properties", "image"]]
