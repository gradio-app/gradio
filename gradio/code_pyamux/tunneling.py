"""Defines methods used internally to set up the share links for the Gradio app."""
import _thread
import asyncio
import hashlib
import json
import select
import socket
import struct
import sys
import threading
from queue import Queue
from time import sleep, time
from typing import Callable, Tuple

from .pyamux import Client, stream


async def a_next(async_generator):
    value = await async_generator.__anext__()
    return value


async def a_unpile(async_generator):
    async for _ in async_generator:
        pass


async def handle_req_work_conn(run_id: int, local_host: str, local_port: int, session):
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

    _stream.reset_reader()

    reader, writer = await asyncio.open_connection(local_host, local_port)
    pipe2 = reader_to_stream(reader, _stream)
    pipe1 = stream_to_writer(_stream, writer)
    await asyncio.gather(pipe1, pipe2)


async def reader_to_stream(reader, stream):
    while not reader.at_eof():
        read_ = await reader.read(1024)
        await stream.write(read_)


async def stream_to_writer(stream, writer):
    while True:
        data = await stream.reader.read(1024)
        writer.write(data)


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
    return await stream.write(binary_message)


async def _read(stream):
    """Read message from frps

    First byte is the message type
    https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/msg/msg.go#L20-L20
    8 next bytes are the message length.
    Then it's the json body.
    """
    data, _ = await stream.read(1)
    if not data:
        return None, None
    binary_type = list(data)[0]

    size, _ = await stream.read(8)
    if not size:
        return None, None
    size = struct.unpack(">Q", size)[0]
    json_raw, _ = await stream.read(size)
    return json.loads(json_raw), binary_type


def _heartbeat(client):
    """Heartbeat to keep connection alive."""
    try:
        while True:
            _send(client, {}, 104)
            sleep(15)
    except Exception:
        pass


async def _client_loop(
    session,
    _stream,
    run_id,
    local_host,
    local_port,
    expiry,
):
    while True:
        _, type = await _read(_stream)
        if not type or time() > expiry:
            break
        # TypeReqWorkConn
        if type == 114:
            asyncio.create_task(
                handle_req_work_conn(run_id, local_host, local_port, session)
            )
            continue
        # Pong
        if type == 52:
            # Simple pong from server nothing to do
            continue
    _stream.close()


def _generate_privilege_key() -> Tuple[int, str]:
    """Generate and return a (timestamp, privilege_key) hash.

    Privilege Key and Timestamp should be generate like:
    https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/util/util/util.go#L46-L46
    """
    timestamp = round(time())
    return timestamp, hashlib.md5(f"{timestamp}".encode()).hexdigest()


async def create_tunnel(
    session,
    local_host: str,
    local_port: int,
) -> str:
    """
    Creates a tunnel between a local server/port and a remote server/port. Returns
    the URL of the share link that is connected to the local server/port.
    """
    # Connect to frps
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
        print("WTF")
        sys.exit(1)

    # Start a warm-up connection
    asyncio.create_task(handle_req_work_conn(run_id, local_host, local_port, session))

    # Sending proxy information `TypeNewProxy`
    await _send(_stream, {"proxy_type": "http"}, 112)
    msg, msg_type = await _read(_stream)

    if msg_type != 50:
        # TODO Handle this correctly
        print("error during proxy registration")
        sys.exit(1)

    # Starting heartbeat and frps_client loop
    # _start_as_daemon_thread(target=_heartbeat, args=(frps_client,))
    asyncio.create_task(
        _client_loop(session, _stream, run_id, local_host, local_port, expiry)
    )

    yield msg["remote_addr"]


def create_tunnel_pyamux(remote_host, remote_port, local_host, local_port):
    # Run all tunnel coroutines in same even loop
    loop = asyncio.get_event_loop()

    # Open connection
    reader, writer = loop.run_until_complete(
        asyncio.open_connection(remote_host, remote_port)
    )
    conn = stream.Conn(reader, writer)
    session = Client(conn, None)

    # Create tunnel
    # Returns an async generator. Yields a single value (the address)
    a_tunnel = create_tunnel(session, local_host, local_port)

    # Get remote address
    remote_addr = loop.run_until_complete(a_next(a_tunnel))

    # Then continue the tunnel in a thread that will run indefinitely
    def _then():
        reader, writer = loop.run_until_complete(
            asyncio.open_connection(remote_host, remote_port)
        )

        loop.run_until_complete(asyncio.gather(session.init(), a_unpile(a_tunnel)))
        loop.run_forever()

    thread = threading.Thread(target=_then, daemon=True, name=f"Thread-tunnel-pyamux")
    thread.start()

    # Return remote address
    return remote_addr


if __name__ == "__main__":
    loop = asyncio.get_event_loop()

    a = loop.run_until_complete(
        init_tunnel_pyamux("127.0.0.1", 7000, "127.0.0.1", 8001)
    )
    loop.run_forever()
