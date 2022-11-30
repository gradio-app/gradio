"""Defines methods used internally to set up the share links for the Gradio app."""
import asyncio
import hashlib
import json
import struct
import sys
from asyncio import AbstractEventLoop

from time import time
from typing import Tuple, Any
from pyamux import stream
from pyamux import Client


async def handle_req_work_conn(
        run_id: int, local_host: str, local_port: int, session
):
    _stream, err = session.Open()
    if err is not None:
        raise err
    # Send the run id (TypeNewWorkConn)
    await _send(_stream, {"run_id": run_id}, 119)

    # Wait for the server to ask to connect
    # We don't use the message as we don't need his content
    # Useful if the client implement multiple proxy
    # In our use case only one that we know
    await _read(_stream)

    # Cleanup the reader that contains previous data
    _stream.reset_reader()

    # Connect to the running app
    reader, writer = await asyncio.open_connection(local_host, local_port)
    pipe2 = pipe(reader, _stream)
    pipe1 = pipe(_stream.reader, writer)
    await asyncio.gather(pipe1, pipe2)


async def pipe(reader, writer):
    while not reader.at_eof():
        read_ = await reader.read(1024)
        writer.write(read_)
    writer.close()


async def _send(stream, msg, type):
    """Send a message to frps.

    First byte is the message type
    https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/msg/msg.go#L20-L20
    8 next bytes are the message length.
    Then it's the json body.
    """
    binary_message = bytearray(0)
    binary_message.extend([type])
    json_raw = json.dumps(msg).encode("utf-8")
    binary_message.extend(struct.pack(">q", len(json_raw)))
    binary_message.extend(json_raw)
    return stream.write(binary_message)


async def _read(stream):
    """Read message from frps

    First byte is the message type
    https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/msg/msg.go#L20-L20
    8 next bytes are the message length.
    Then it's the json body.
    """
    data = await stream.reader.read(1)
    if not data:
        return None, None
    binary_type = list(data)[0]

    size = await stream.reader.read(8)
    if not size:
        return None, None
    size = struct.unpack(">Q", size)[0]
    json_raw = await stream.reader.read(size)
    return json.loads(json_raw), binary_type


async def _client_loop(
        session, _stream, run_id , local_host, local_port, expiry,
):
    while True:
        _, type = await _read(_stream)
        if not type or time() > expiry:
            break
        # TypeReqWorkConn
        if type == 114:
            asyncio.create_task(handle_req_work_conn(run_id, local_host, local_port, session))
            continue
    _stream.close()


def _generate_privilege_key() -> Tuple[int, str]:
    """Generate and return a (timestamp, privilege_key) hash.

    Privilege Key and Timestamp should be generate like:
    https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/util/util/util.go#L46-L46
    """
    timestamp = round(time())
    return timestamp, hashlib.md5(f"{timestamp}".encode()).hexdigest()


async def _create_tunnel(
        remote_host, remote_port, local_host, local_port
) -> str:
    """
    Creates a tunnel between a local server/port and a remote server/port. Returns
    the URL of the share link that is connected to the local server/port.
    """

    # Connect to remote frps
    reader, writer = await asyncio.open_connection(remote_host, remote_port)
    conn = stream.Conn(reader, writer)
    session = Client(conn, None)

    asyncio.create_task(session.init())

    _stream, err = session.Open()
    if err is not None:
        raise err

    # Send `TypeLogin`
    timestamp, privilege_key = _generate_privilege_key()
    expiry = timestamp + 60 * 60 * 72

    await _send(
        _stream,
        {
            "version": "0.44.0",
            "pool_count": 1,
            "privilege_key": privilege_key,
            "timestamp": timestamp,
        },
        111,
    )

    # Wait for response `TypeLoginResp`
    login_response, _ = await _read(_stream)

    if not login_response:
        # TODO Handle this correctly
        print("error getting response")
        sys.exit(1)

    if "error" in login_response:
        # TODO Handle this correctly
        print("error during login")
        sys.exit(1)

    run_id = login_response["run_id"]

    # Server will ask to warm connection
    msg, msg_type = await _read(_stream)

    if msg_type != 114:
        # TODO Handle this correctly
        sys.exit(1)

    # Sending proxy information `TypeNewProxy`
    await _send(_stream, {"proxy_type": "http"}, 112)
    msg, msg_type = await _read(_stream)

    if msg_type != 50:
        # TODO Handle this correctly
        print("error during proxy registration")
        sys.exit(1)

    asyncio.create_task(_client_loop(session, _stream, run_id, local_host, local_port, expiry))

    return msg["remote_addr"]


def create_tunnel(
        remote_host, remote_port, local_host, local_port
) -> tuple[Any, AbstractEventLoop]:
    loop = asyncio.new_event_loop()
    address = loop.run_until_complete(_create_tunnel(remote_host, remote_port, local_host, local_port))
    return address, loop


if __name__ == '__main__':
    address, loop = create_tunnel("localhost", 7000, "localhost", 8001)
    print(address)
    loop.run_forever()
