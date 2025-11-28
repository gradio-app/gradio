from __future__ import annotations

import os
import signal
import socket
import subprocess
import sys
import time
import warnings
from concurrent.futures import TimeoutError
from contextlib import closing
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:  # Only import for type checking (to avoid circular imports).
    pass

# By default, the local server will try to open on localhost, port 7860.
# If that is not available, then it will try 7861, 7862, ... 7959.
INITIAL_PORT_VALUE = int(os.getenv("GRADIO_SERVER_PORT", "7860"))
TRY_NUM_PORTS = int(os.getenv("GRADIO_NODE_NUM_PORTS", "100"))
LOCALHOST_NAME = os.getenv(
    "GRADIO_NODE_SERVER_NAME", os.getenv("GRADIO_SERVER_NAME", "127.0.0.1")
)


def start_node_server(
    server_name: str | None = None,
    server_port: int | None = None,
    node_path: str | None = None,
) -> tuple[str | None, subprocess.Popen[bytes] | None, int | None]:
    """Launches a local server running the provided Interface
    Parameters:
        server_name: to make app accessible on local network, set this to "0.0.0.0". Can be set by environment variable GRADIO_SERVER_NAME.
        server_port: will start gradio app on this port (if available). Can be set by environment variable GRADIO_SERVER_PORT.
        node_path: the path to the node executable. Can be set by environment variable GRADIO_NODE_PATH.
        ssr_mode: If False, will not start the node server and will serve the SPA from the Python server

    Returns:
        server_name: the name of the server (default is "localhost")
        node_process: the node process that is running the SSR app
        node_port: the port the node server is running on
    """

    server_name = server_name or LOCALHOST_NAME

    # Strip IPv6 brackets from the address if they exist.
    # This is needed as http://[::1]:port/ is a valid browser address,
    # but not a valid IPv6 address, so asyncio will throw an exception.
    if server_name.startswith("[") and server_name.endswith("]"):
        host = server_name[1:-1]
    else:
        host = server_name

    server_ports = (
        [server_port]
        if server_port is not None
        else range(INITIAL_PORT_VALUE + 1, INITIAL_PORT_VALUE + 1 + TRY_NUM_PORTS)
    )

    node_process, node_port = start_node_process(
        node_path=node_path or os.getenv("GRADIO_NODE_PATH"),
        server_name=host,
        server_ports=server_ports,
    )

    return server_name, node_process, node_port


GRADIO_LOCAL_DEV_MODE = os.getenv("GRADIO_LOCAL_DEV_MODE") is not None
SSR_APP_PATH = Path(__file__).parent.joinpath("templates", "node", "build")


def start_node_process(
    node_path: str | None,
    server_name: str,
    server_ports: list[int] | range,
) -> tuple[subprocess.Popen[bytes] | None, int | None]:
    if GRADIO_LOCAL_DEV_MODE:
        return None, 9876
    if not node_path:
        return None, None

    node_process = None

    for port in server_ports:
        try:
            # The fastest way to check if a port is available is to try to bind to it with socket.
            # If the port is not available, socket will throw an OSError.
            s = socket.socket()
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            # Really, we should be checking if (server_name, server_port) is available, but
            # socket.bind() doesn't seem to throw an OSError with ipv6 addresses, based on my testing.
            # Instead, we just check if the port is available on localhost.
            s.bind((server_name, port))
            s.close()

            # Set environment variables for the Node server
            env = os.environ
            env["PORT"] = str(port)
            env["HOST"] = server_name
            if GRADIO_LOCAL_DEV_MODE:
                env["GRADIO_LOCAL_DEV_MODE"] = "1"

            register_file = str(
                Path(__file__).parent.joinpath("templates", "register.mjs")
            )

            if sys.platform == "win32":
                register_file = "file://" + register_file

            node_process = subprocess.Popen(
                [node_path, "--import", register_file, SSR_APP_PATH],
                stdout=subprocess.DEVNULL,
                env=env,
            )

            is_working = verify_server_startup(server_name, port, timeout=5)
            if is_working:
                signal.signal(
                    signal.SIGTERM, lambda _, __: handle_sigterm(node_process)
                )
                signal.signal(signal.SIGINT, lambda _, __: handle_sigterm(node_process))

                return node_process, port

            else:
                # If verification failed, terminate the process and try the next port
                node_process.terminate()
                node_process.wait(timeout=2)
                node_process = None

        except OSError:
            continue
        except Exception as e:
            warnings.warn(
                f"Unexpected error while starting Node server: {e}. Trying next port..."
            )
            if node_process:
                node_process.terminate()
                node_process = None
            continue

    # If all attempts fail
    print(
        f"Cannot start Node server on any port in the range {server_ports[0]}-{server_ports[-1]}."
    )
    print(
        "Please install Node 20 or higher and set the environment variable GRADIO_NODE_PATH to the path of your Node executable."
    )
    print(
        "You can explicitly specify a port by setting the environment variable GRADIO_NODE_PORT."
    )

    return None, None


def attempt_connection(host: str, port: int) -> bool:
    """Attempts a single connection to the server."""
    try:
        with closing(socket.create_connection((host, port), timeout=1)):
            return True
    except (TimeoutError, ConnectionRefusedError):
        return False
    except Exception:
        return False


def verify_server_startup(host: str, port: int, timeout: float = 5.0) -> bool:
    """Verifies if a server is up and running by attempting to connect."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except (TimeoutError, OSError):
            time.sleep(0.1)
    return False


def handle_sigterm(node_process: subprocess.Popen[bytes] | None):
    if node_process is not None:
        print("\nStopping Node.js server...")
        node_process.terminate()
        node_process.wait()
        sys.exit(0)
