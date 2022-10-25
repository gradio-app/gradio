"""Defines methods used internally to set up the share links for the Gradio app."""
import asyncio
import hashlib
import json
import select
import socket
import struct
import sys
from asyncio import StreamReader, StreamWriter
from time import time
from typing import Coroutine, Tuple

_ALL_BACKGROUND_TASKS = set()


def _start_as_background_task(target: Coroutine) -> None:
    """Start a task in the background.

    Taken from https://docs.python.org/3/library/asyncio-task.html#asyncio.create_task
    """
    task = asyncio.create_task(target)

    # Add task to the set. This creates a strong reference.
    _ALL_BACKGROUND_TASKS.add(task)

    # To prevent keeping references to finished tasks forever,
    # make each task remove its own reference from the set after
    # completion:
    task.add_done_callback(_ALL_BACKGROUND_TASKS.discard)

    print(task)


async def handle_req_work_conn(
    run_id: int, remote_host: str, remote_port: int, local_host: str, local_port: int
):
    # Connect to frps for the forward socket
    socket_worker = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    socket_worker.connect((remote_host, remote_port))

    reader_worker: StreamReader
    writer_worker: StreamWriter
    reader_worker, writer_worker = await asyncio.open_connection(sock=socket_worker)

    # Send the run id (TypeNewWorkConn)
    _send(writer_worker, {"run_id": run_id}, 119)

    # Wait for the server to ask to connect
    # We don't use the message as we don't need his content
    # Useful if the client implement multiple proxy
    # In our use case only one that we know
    await _read(reader_worker)

    # Connect to the gradio app
    socket_gradio = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    socket_gradio.connect((local_host, local_port))

    reader_gradio: StreamReader
    writer_gradio: StreamWriter
    reader_gradio, writer_gradio = await asyncio.open_connection(sock=socket_gradio)

    while True:
        r, w, x = select.select([socket_gradio, socket_worker], [], [])
        if socket_gradio in r:
            data = await reader_gradio.read(1024)
            if len(data) == 0:
                break
            writer_worker.send(data)
        if socket_worker in r:
            data = await reader_worker.read(1024)
            if len(data) == 0:
                break
            writer_gradio.send(data)
    socket_gradio.close()
    socket_worker.close()


def _send(writer: StreamWriter, msg, type):
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
    writer.write(binary_message)


async def _read(reader: StreamReader):
    """Read message from frps

    First byte is the message type
    https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/msg/msg.go#L20-L20
    8 next bytes are the message length.
    Then it's the json body.
    """
    data = await reader.read(1)
    if not data:
        return None, None
    binary_type = list(data)[0]

    size = await reader.read(8)
    if not size:
        return None, None
    size = struct.unpack(">Q", size)[0]
    json_raw = await reader.read(size)
    return json.loads(json_raw), binary_type


async def _heartbeat(writer: StreamWriter):
    """Heartbeat to keep connection alive."""
    try:
        while True:
            _send(writer, {}, 104)
            await asyncio.sleep(15)
    except Exception:
        pass


async def _client_loop(
    client, reader, run_id, remote_host, remote_port, local_host, local_port
):
    while True:
        msg, type = await _read(reader)
        if not type:
            break
        # TypeReqWorkConn
        if type == 114:
            _start_as_background_task(
                handle_req_work_conn(
                    run_id, remote_host, remote_port, local_host, local_port
                )
            )
            continue
        # Pong
        if type == 52:
            # Simple pong from server nothing to do
            continue
    client.close()


def _generate_privilege_key() -> Tuple[int, str]:
    """Generate and return a (timestamp, privilege_key) hash.

    Privilege Key and Timestamp should be generate like:
    https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/util/util/util.go#L46-L46
    """
    timestamp = round(time())
    return timestamp, hashlib.md5(f"{timestamp}".encode()).hexdigest()


async def create_tunnel(
    remote_host: str, remote_port: int, local_host: str, local_port: int
):
    """Create a tunnel.

    Based on asyncio and sockets.
    See:
    - https://docs.python.org/3/library/asyncio-stream.html#asyncio.open_connection
    - https://docs.python.org/3/library/asyncio-stream.html#asyncio.StreamReader
    """
    frps_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    frps_client.connect((remote_host, remote_port))

    reader: StreamReader
    writer: StreamWriter
    reader, writer = await asyncio.open_connection(sock=frps_client)

    timestamp, privilege_key = _generate_privilege_key()
    _send(
        writer,
        {
            "version": "0.44.0",
            "pool_count": 1,
            "privilege_key": privilege_key,
            "timestamp": timestamp,
        },
        111,
    )

    # Wait for response `TypeLoginResp`
    login_response, _ = await _read(reader)
    print(login_response)

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
    msg, msg_type = await _read(reader)

    if msg_type != 114:
        # TODO Handle this correctly
        sys.exit(1)

    # Start a warm-up connection
    _start_as_background_task(
        handle_req_work_conn(run_id, remote_host, remote_port, local_host, local_port)
    )

    # Sending proxy information `TypeNewProxy`
    _send(writer, {"proxy_type": "http"}, 112)
    msg, msg_type = await _read(reader)

    if msg_type != 50:
        # TODO Handle this correctly
        print("error during proxy registration")
        sys.exit(1)

    # Starting heartbeat and frps_client loop
    _start_as_background_task(_heartbeat(writer))
    _start_as_background_task(
        _client_loop(
            frps_client,
            reader,
            run_id,
            remote_host,
            remote_port,
            local_host,
            local_port,
        )
    )

    return msg["remote_addr"]
