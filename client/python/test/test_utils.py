import importlib.resources
import json
import os
import tempfile
from copy import deepcopy
from pathlib import Path
from unittest.mock import MagicMock, patch

import httpx
import pytest
from huggingface_hub import HfFolder

from gradio_client import media_data, utils

types = json.loads(importlib.resources.read_text("gradio_client", "types.json"))
types["MultipleFile"] = {
    "type": "array",
    "items": {"type": "string", "description": "filepath or URL to file"},
}
types["SingleFile"] = {"type": "string", "description": "filepath or URL to file"}


HF_TOKEN = os.getenv("HF_TOKEN") or HfFolder.get_token()


def test_encode_url_or_file_to_base64():
    output_base64 = utils.encode_url_or_file_to_base64(
        Path(__file__).parent / "../../../gradio/test_data/test_image.png"
    )
    assert output_base64 == deepcopy(media_data.BASE64_IMAGE)


def test_encode_file_to_base64():
    output_base64 = utils.encode_file_to_base64(
        Path(__file__).parent / "../../../gradio/test_data/test_image.png"
    )
    assert output_base64 == deepcopy(media_data.BASE64_IMAGE)


@pytest.mark.flaky
def test_encode_url_to_base64():
    output_base64 = utils.encode_url_to_base64(
        "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/test_data/test_image.png"
    )
    assert output_base64 == deepcopy(media_data.BASE64_IMAGE)


def test_encode_url_to_base64_doesnt_encode_errors(monkeypatch):
    request = httpx.Request("GET", "https://example.com/foo")
    error_response = httpx.Response(status_code=404, request=request)
    monkeypatch.setattr(httpx, "get", lambda *args, **kwargs: error_response)
    with pytest.raises(httpx.HTTPStatusError):
        utils.encode_url_to_base64("https://example.com/foo")


def test_decode_base64_to_binary():
    binary = utils.decode_base64_to_binary(deepcopy(media_data.BASE64_IMAGE))
    assert deepcopy(media_data.BINARY_IMAGE) == binary

    b64_img_without_header = deepcopy(media_data.BASE64_IMAGE).split(",")[1]
    binary_without_header, extension = utils.decode_base64_to_binary(
        b64_img_without_header
    )

    assert binary[0] == binary_without_header
    assert extension is None


def test_decode_base64_to_file():
    temp_file = utils.decode_base64_to_file(deepcopy(media_data.BASE64_IMAGE))
    assert isinstance(temp_file, tempfile._TemporaryFileWrapper)


@pytest.mark.parametrize(
    "path_or_url, file_types, expected_result",
    [
        ("/home/user/documents/example.pdf", [".json", "text", ".mp3", ".pdf"], True),
        ("C:\\Users\\user\\documents\\example.png", [".png"], True),
        ("C:\\Users\\user\\documents\\example.png", ["image"], True),
        ("C:\\Users\\user\\documents\\example.png", ["file"], True),
        ("/home/user/documents/example.pdf", [".json", "text", ".mp3"], False),
        ("https://example.com/avatar/xxxx.mp4", ["audio", ".png", ".jpg"], False),
    ],
)
def test_is_valid_file_type(path_or_url, file_types, expected_result):
    assert utils.is_valid_file(path_or_url, file_types) is expected_result


@pytest.mark.parametrize(
    "orig_filename, new_filename",
    [
        ("abc", "abc"),
        ("$$AAabc&3", "AAabc3"),
        ("$$AAa&..b-c3_", "AAa..b-c3_"),
        (
            "ゆかりです｡私､こんなかわいい服は初めて着ました…｡なんだかうれしくって､楽しいです｡歌いたくなる気分って､初めてです｡これがｱｲﾄﾞﾙってことなのかもしれませんね",
            "ゆかりです私こんなかわいい服は初めて着ましたなんだかうれしくって楽しいです歌いたくなる気分って初めてですこれがｱｲﾄﾞﾙってことなの",
        ),
        (
            "Bringing-computational-thinking-into-classrooms-a-systematic-review-on-supporting-teachers-in-integrating-computational-thinking-into-K12-classrooms_2024_Springer-Science-and-Business-Media-Deutschland-GmbH.pdf",
            "Bringing-computational-thinking-into-classrooms-a-systematic-review-on-supporting-teachers-in-integrating-computational-thinking-into-K12-classrooms_2024_Springer-Science-and-Business-Media-Deutsc.pdf",
        ),
    ],
)
def test_strip_invalid_filename_characters(orig_filename, new_filename):
    assert utils.strip_invalid_filename_characters(orig_filename) == new_filename


class AsyncMock(MagicMock):
    async def __call__(self, *args, **kwargs):
        return super().__call__(*args, **kwargs)


@pytest.mark.asyncio
async def test_get_pred_from_ws():
    mock_ws = AsyncMock(name="ws")
    messages = [
        json.dumps({"msg": "estimation"}),
        json.dumps({"msg": "send_data"}),
        json.dumps({"msg": "process_generating"}),
        json.dumps({"msg": "process_completed", "output": {"data": ["result!"]}}),
    ]
    mock_ws.recv.side_effect = messages
    data = {"data": ["foo"], "fn_index": "foo"}
    hash_data = {"session_hash": "daslskdf", "fn_index": "foo"}
    output = await utils.get_pred_from_ws(mock_ws, data, hash_data)  # type: ignore
    assert output == {"data": ["result!"]}
    mock_ws.send.assert_called_once_with(data)


@pytest.mark.asyncio
async def test_get_pred_from_ws_raises_if_queue_full():
    mock_ws = AsyncMock(name="ws")
    messages = [json.dumps({"msg": "queue_full"})]
    mock_ws.recv.side_effect = messages
    data = json.dumps({"data": ["foo"], "fn_index": "foo"})
    hash_data = json.dumps({"session_hash": "daslskdf", "fn_index": "foo"})
    with pytest.raises(utils.QueueError, match="Queue is full!"):
        await utils.get_pred_from_ws(mock_ws, data, hash_data)


@patch("httpx.post")
def test_sleep_successful(mock_post):
    utils.set_space_timeout("gradio/calculator")


@patch(
    "httpx.post",
    side_effect=httpx.HTTPStatusError("error", request=None, response=None),
)
def test_sleep_unsuccessful(mock_post):
    with pytest.raises(utils.SpaceDuplicationError):
        utils.set_space_timeout("gradio/calculator")


@pytest.mark.parametrize("schema", types)
def test_json_schema_to_python_type(schema):
    if schema == "SimpleSerializable":
        answer = "Any"
    elif schema == "StringSerializable":
        answer = "str"
    elif schema == "ListStringSerializable":
        answer = "list[str]"
    elif schema == "BooleanSerializable":
        answer = "bool"
    elif schema == "NumberSerializable":
        answer = "float"
    elif schema == "ImgSerializable":
        answer = "str"
    elif schema == "FileSerializable":
        answer = "str | dict(name: str (name of file), data: str (base64 representation of file), size: int (size of image in bytes), is_file: bool (true if the file has been uploaded to the server), orig_name: str (original name of the file)) | list[str | dict(name: str (name of file), data: str (base64 representation of file), size: int (size of image in bytes), is_file: bool (true if the file has been uploaded to the server), orig_name: str (original name of the file))]"
    elif schema == "JSONSerializable":
        answer = "str | float | bool | list | dict"
    elif schema == "GallerySerializable":
        answer = "tuple[dict(name: str (name of file), data: str (base64 representation of file), size: int (size of image in bytes), is_file: bool (true if the file has been uploaded to the server), orig_name: str (original name of the file)), str | None]"
    elif schema == "SingleFileSerializable":
        answer = "str | dict(name: str (name of file), data: str (base64 representation of file), size: int (size of image in bytes), is_file: bool (true if the file has been uploaded to the server), orig_name: str (original name of the file))"
    elif schema == "MultipleFileSerializable":
        answer = "list[str | dict(name: str (name of file), data: str (base64 representation of file), size: int (size of image in bytes), is_file: bool (true if the file has been uploaded to the server), orig_name: str (original name of the file))]"
    elif schema == "SingleFile":
        answer = "str"
    elif schema == "MultipleFile":
        answer = "list[str]"
    else:
        raise ValueError(f"This test has not been modified to check {schema}")
    assert utils.json_schema_to_python_type(types[schema]) == answer


class TestConstructArgs:
    def test_no_parameters_empty_args(self):
        assert utils.construct_args(None, (), {}) == []

    def test_no_parameters_with_args(self):
        assert utils.construct_args(None, (1, 2), {}) == [1, 2]

    def test_no_parameters_with_kwargs(self):
        with pytest.raises(
            ValueError, match="This endpoint does not support key-word arguments"
        ):
            utils.construct_args(None, (), {"a": 1})

    def test_parameters_no_args_kwargs(self):
        parameters_info = [
            {
                "label": "param1",
                "parameter_name": "a",
                "parameter_has_default": True,
                "parameter_default": 10,
            }
        ]
        assert utils.construct_args(parameters_info, (), {"a": 1}) == [1]

    def test_parameters_with_args_no_kwargs(self):
        parameters_info = [{"label": "param1", "parameter_name": "a"}]
        assert utils.construct_args(parameters_info, (1,), {}) == [1]

    def test_parameter_with_default_no_args_no_kwargs(self):
        parameters_info = [
            {"label": "param1", "parameter_has_default": True, "parameter_default": 10}
        ]
        assert utils.construct_args(parameters_info, (), {}) == [10]

    def test_args_filled_parameters_with_defaults(self):
        parameters_info = [
            {"label": "param1", "parameter_has_default": True, "parameter_default": 10},
            {"label": "param2", "parameter_has_default": True, "parameter_default": 20},
        ]
        assert utils.construct_args(parameters_info, (1,), {}) == [1, 20]

    def test_kwargs_filled_parameters_with_defaults(self):
        parameters_info = [
            {
                "label": "param1",
                "parameter_name": "a",
                "parameter_has_default": True,
                "parameter_default": 10,
            },
            {
                "label": "param2",
                "parameter_name": "b",
                "parameter_has_default": True,
                "parameter_default": 20,
            },
        ]
        assert utils.construct_args(parameters_info, (), {"a": 1, "b": 2}) == [1, 2]

    def test_positional_arg_and_kwarg_for_same_parameter(self):
        parameters_info = [{"label": "param1", "parameter_name": "a"}]
        with pytest.raises(
            TypeError, match="Parameter `a` is already set as a positional argument."
        ):
            utils.construct_args(parameters_info, (1,), {"a": 2})

    def test_invalid_kwarg(self):
        parameters_info = [{"label": "param1", "parameter_name": "a"}]
        with pytest.raises(
            TypeError, match="Parameter `b` is not a valid key-word argument."
        ):
            utils.construct_args(parameters_info, (), {"b": 1})

    def test_required_arg_missing(self):
        parameters_info = [{"label": "param1", "parameter_name": "a"}]
        with pytest.raises(
            TypeError, match="No value provided for required argument: a"
        ):
            utils.construct_args(parameters_info, (), {})
