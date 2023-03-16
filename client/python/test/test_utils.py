from copy import deepcopy
import tempfile
from unittest.mock import MagicMock
import json

import pytest
from gradio import media_data

from gradio_client import utils


def test_encode_url_or_file_to_base64():
    output_base64 = utils.encode_url_or_file_to_base64(
        "gradio/test_data/test_image.png"
    )
    assert output_base64 == deepcopy(media_data.BASE64_IMAGE)

def test_encode_file_to_base64():
    output_base64 = utils.encode_file_to_base64(
        "gradio/test_data/test_image.png"
    )
    assert output_base64 == deepcopy(media_data.BASE64_IMAGE)

@pytest.mark.flaky
def test_encode_url_to_base64():
    output_base64 = utils.encode_url_to_base64(
        "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/test_data/test_image.png"
    )
    assert output_base64 == deepcopy(media_data.BASE64_IMAGE)

def test_decode_base64_to_binary():
    binary = utils.decode_base64_to_binary(
        deepcopy(media_data.BASE64_IMAGE)
    )
    assert deepcopy(media_data.BINARY_IMAGE) == binary

def test_decode_base64_to_file():
    temp_file = utils.decode_base64_to_file(
        deepcopy(media_data.BASE64_IMAGE)
    )
    assert isinstance(temp_file, tempfile._TemporaryFileWrapper)


def test_download_private_file():
    url_path = "https://gradio-tests-not-actually-private-space.hf.space/file=lion.jpg"
    access_token = "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"  # Intentionally revealing this key for testing purposes
    file = utils.download_tmp_copy_of_file(
        url_path=url_path, access_token=access_token
    )
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

