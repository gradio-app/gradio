import asyncio

import pytest

from gradio.ranged_response import OpenRange, RangedFileResponse


@pytest.mark.asyncio
@pytest.mark.parametrize("truncate_during_stream", [False, True])
async def test_truncated_file_aborts_response(tmp_path, truncate_during_stream):
    path = tmp_path / "file.bin"
    content = b"a" * (RangedFileResponse.chunk_size * 4)
    path.write_bytes(content)
    response = RangedFileResponse(
        path, OpenRange(0, len(content) - 1), stat_result=path.stat()
    )
    if not truncate_during_stream:
        path.write_bytes(b"")

    messages = []

    async def send(message):
        messages.append(message)
        if truncate_during_stream and message["type"] == "http.response.body":
            path.write_bytes(b"")

    async def receive():
        return {"type": "http.request"}

    with pytest.raises(RuntimeError, match="File ended before the requested range"):
        await asyncio.wait_for(response({}, receive, send), timeout=30)

    assert messages[0]["status"] == 206
    body_messages = messages[1:]
    assert all(message["more_body"] and message["body"] for message in body_messages)
    body = b"".join(message["body"] for message in body_messages)
    assert len(body) < len(content)
    if truncate_during_stream:
        assert body
