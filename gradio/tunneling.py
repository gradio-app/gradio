"""Defines methods used internally to set up the share links for the Gradio app."""
import _thread
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

BACKGROUND_TUNNEL_EXCEPTIONS = Queue(maxsize=1)  # To propagate exception to main thread
_NB_DAEMON_THREADS = 0  # (optional) For better thread naming


def _start_as_daemon_thread(target: Callable, args: Tuple) -> None:
    """Start a task in the background.

    Thread is set as "daemon" which means it will be killed when the main thread
    terminates.
    See https://docs.python.org/3/library/threading.html#threading.Thread.daemon
    """

    def _inner_target():
        try:
            target(*args)
        except Exception as e:
            # On any exception, add it to the queue of exceptions and stop the main
            # thread. `interrupt_main` send a KeyboardInterrupt signal that is caught
            # by the gradio server to gracefully terminate.
            # See: https://docs.python.org/3/library/_thread.html#thread.interrupt_main
            BACKGROUND_TUNNEL_EXCEPTIONS.put_nowait(e)
            _thread.interrupt_main()
            raise

    global _NB_DAEMON_THREADS
    _NB_DAEMON_THREADS += 1
    thread = threading.Thread(
        target=_inner_target,
        daemon=True,
        # Custom thread name to ease debugging if a user copy-pastes the traceback
        name=f"Thread-{_NB_DAEMON_THREADS}-{target.__name__}",
    )
    thread.start()


def handle_req_work_conn(
    run_id: int, remote_host: str, remote_port: int, local_host: str, local_port: int
):
    # Connect to frps for the forward socket
    socket_worker = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    socket_worker.connect((remote_host, remote_port))

    # Send the run id (TypeNewWorkConn)
    _send(socket_worker, {"run_id": run_id}, 119)

    # Wait for the server to ask to connect
    # We don't use the message as we don't need his content
    # Useful if the client implement multiple proxy
    # In our use case only one that we know
    _read(socket_worker)

    # Connect to the gradio app
    socket_gradio = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    socket_gradio.connect((local_host, local_port))

    while True:
        r, w, x = select.select([socket_gradio, socket_worker], [], [])
        if socket_gradio in r:
            data = socket_gradio.recv(1024)
            if len(data) == 0:
                break
            socket_worker.send(data)
        if socket_worker in r:
            data = socket_worker.recv(1024)
            if len(data) == 0:
                break
            socket_gradio.send(data)
    socket_gradio.close()
    socket_worker.close()


def _send(client, msg, type):
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
    client.send(binary_message)


def _read(client):
    """Read message from frps

    First byte is the message type
    https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/msg/msg.go#L20-L20
    8 next bytes are the message length.
    Then it's the json body.
    """
    data = client.recv(1)
    if not data:
        return None, None
    binary_type = list(data)[0]

    size = client.recv(8)
    if not size:
        return None, None
    size = struct.unpack(">Q", size)[0]
    json_raw = client.recv(size)
    return json.loads(json_raw), binary_type


def _heartbeat(client):
    """Heartbeat to keep connection alive."""
    try:
        while True:
            _send(client, {}, 104)
            sleep(15)
    except Exception:
        pass


def _client_loop(client, run_id, remote_host, remote_port, local_host, local_port, expiry):
    while True:
        _, type = _read(client)
        if not type or time() > expiry:
            break
        # TypeReqWorkConn
        if type == 114:
            _start_as_daemon_thread(
                target=handle_req_work_conn,
                args=(run_id, remote_host, remote_port, local_host, local_port),
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


def create_tunnel(
    remote_host: str, remote_port: int, local_host: str, local_port: int
) -> str:
    """
    Creates a tunnel between a local server/port and a remote server/port. Returns
    the URL of the share link that is connected to the local server/port.
    """
    # Connect to frps
    frps_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    frps_client.connect((remote_host, remote_port))

    # Send `TypeLogin`
    timestamp, privilege_key = _generate_privilege_key()
    expiry = timestamp + 60*60*72
    
    _send(
        frps_client,
        {
            "version": "0.44.0",
            "pool_count": 1,
            "privilege_key": privilege_key,
            "timestamp": timestamp,
        },
        111,
    )

    # Wait for response `TypeLoginResp`
    login_response, _ = _read(frps_client)

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
    msg, msg_type = _read(frps_client)

    if msg_type != 114:
        # TODO Handle this correctly
        sys.exit(1)

    # Start a warm-up connection
    _start_as_daemon_thread(
        target=handle_req_work_conn,
        args=(run_id, remote_host, remote_port, local_host, local_port),
    )

    # Sending proxy information `TypeNewProxy`
    _send(frps_client, {"proxy_type": "http"}, 112)
    msg, msg_type = _read(frps_client)

    if msg_type != 50:
        # TODO Handle this correctly
        print("error during proxy registration")
        sys.exit(1)

    # Starting heartbeat and frps_client loop
    _start_as_daemon_thread(target=_heartbeat, args=(frps_client,))
    _start_as_daemon_thread(
        target=_client_loop,
        args=(frps_client, run_id, remote_host, remote_port, local_host, local_port, expiry),
    )

    return msg["remote_addr"]
