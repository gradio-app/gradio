import importlib.resources
import json
import tempfile
from copy import deepcopy
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from requests.exceptions import HTTPError

from gradio_client import media_data, utils

types = json.loads(importlib.resources.read_text("gradio_client", "types.json"))
types["MultipleFile"] = {
    "type": "array",
    "items": {"type": "string", "description": "filepath or URL to file"},
}
types["SingleFile"] = {"type": "string", "description": "filepath or URL to file"}


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


def test_download_private_file():
    url_path = "https://gradio-tests-not-actually-private-space.hf.space/file=lion.jpg"
    hf_token = "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"  # Intentionally revealing this key for testing purposes
    file = utils.download_tmp_copy_of_file(url_path=url_path, hf_token=hf_token)
    assert file.name.endswith(".jpg")


@pytest.mark.parametrize(
    "orig_filename, new_filename",
    [
        ("abc", "abc"),
        ("$$AAabc&3", "AAabc3"),
        ("$$AAabc&3", "AAabc3"),
        ("$$AAa..b-c&3_", "AAa..b-c3_"),
        ("$$AAa..b-c&3_", "AAa..b-c3_"),
        (
            "ゆかりです｡私､こんなかわいい服は初めて着ました…｡なんだかうれしくって､楽しいです｡歌いたくなる気分って､初めてです｡これがｱｲﾄﾞﾙってことなのかもしれませんね",
            "ゆかりです私こんなかわいい服は初めて着ましたなんだかうれしくって楽しいです歌いたくなる気分って初めてですこれがｱｲﾄﾞﾙってことなの",
        ),
    ],
)
def test_strip_invalid_filename_characters(orig_filename, new_filename):
    assert utils.strip_invalid_filename_characters(orig_filename) == new_filename


class AsyncMock(MagicMock):
    async def __call__(self, *args, **kwargs):
        return super(AsyncMock, self).__call__(*args, **kwargs)


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
    data = json.dumps({"data": ["foo"], "fn_index": "foo"})
    hash_data = json.dumps({"session_hash": "daslskdf", "fn_index": "foo"})
    output = await utils.get_pred_from_ws(mock_ws, data, hash_data)
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


@patch("requests.post")
def test_sleep_successful(mock_post):
    utils.set_space_timeout("gradio/calculator")


@patch(
    "requests.post",
    return_value=MagicMock(raise_for_status=MagicMock(side_effect=HTTPError)),
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
        answer = "List[str]"
    elif schema == "BooleanSerializable":
        answer = "bool"
    elif schema == "NumberSerializable":
        answer = "int | float"
    elif schema == "ImgSerializable":
        answer = "str"
    elif schema == "FileSerializable":
        answer = "str | Dict(name: str (name of file), data: str (base64 representation of file), size: int (size of image in bytes), is_file: bool (true if the file has been uploaded to the server), orig_name: str (original name of the file)) | List[str | Dict(name: str (name of file), data: str (base64 representation of file), size: int (size of image in bytes), is_file: bool (true if the file has been uploaded to the server), orig_name: str (original name of the file))]"
    elif schema == "JSONSerializable":
        answer = "Dict[Any, Any]"
    elif schema == "GallerySerializable":
        answer = "Tuple[Dict(name: str (name of file), data: str (base64 representation of file), size: int (size of image in bytes), is_file: bool (true if the file has been uploaded to the server), orig_name: str (original name of the file)), str | None]"
    elif schema == "SingleFileSerializable":
        answer = "str | Dict(name: str (name of file), data: str (base64 representation of file), size: int (size of image in bytes), is_file: bool (true if the file has been uploaded to the server), orig_name: str (original name of the file))"
    elif schema == "MultipleFileSerializable":
        answer = "List[str | Dict(name: str (name of file), data: str (base64 representation of file), size: int (size of image in bytes), is_file: bool (true if the file has been uploaded to the server), orig_name: str (original name of the file))]"
    elif schema == "SingleFile":
        answer = "str"
    elif schema == "MultipleFile":
        answer = "List[str]"
    else:
        raise ValueError(f"This test has not been modified to check {schema}")
    assert utils.json_schema_to_python_type(types[schema]) == answer
