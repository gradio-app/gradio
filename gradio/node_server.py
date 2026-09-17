from __future__ import annotations

import os
import signal
import socket
import subprocess
import sys
import threading
import time
import warnings
from collections import deque
from concurrent.futures import TimeoutError
from contextlib import closing
from http.client import HTTPConnection
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:  # Only import for type checking (to avoid circular imports).
    from collections.abc import Callable

# By default, the local server will try to open on localhost, port 7860.
# If that is not available, then it will try 7861, 7862, ... 7959.
INITIAL_PORT_VALUE = int(os.getenv("GRADIO_SERVER_PORT", "7860"))
TRY_NUM_PORTS = int(os.getenv("GRADIO_NODE_NUM_PORTS", "100"))
# Node waits for the connections it is serving to finish, so without a bound
# here a single long-lived connection keeps the Python process alive too.
NODE_SHUTDOWN_TIMEOUT = 5.0
LOCALHOST_NAME = os.getenv(
    "GRADIO_NODE_SERVER_NAME", os.getenv("GRADIO_SERVER_NAME", "127.0.0.1")
)


def start_node_server(
    server_name: str | None = None,
    server_port: int | None = None,
    node_path: str | None = None,
    python_port: int | None = None,
    python_host: str | None = None,
    static_worker_ports: list[int] | None = None,
    debug: bool = False,
    on_shutdown: Callable[[], None] | None = None,
) -> tuple[str | None, subprocess.Popen[bytes] | None, int | None]:
    """Launches the Node SSR server as a front proxy.

    Parameters:
        server_name: to make app accessible on local network, set this to "0.0.0.0". Can be set by environment variable GRADIO_SERVER_NAME.
        server_port: will start gradio app on this port (if available). Can be set by environment variable GRADIO_SERVER_PORT.
        node_path: the path to the node executable. Can be set by environment variable GRADIO_NODE_PATH.
        python_port: the port of the main Python (FastAPI) server that Node will proxy to.
        python_host: the host of the main Python server (default 127.0.0.1).
        static_worker_ports: ports of static file worker processes for round-robin proxying.
        on_shutdown: called when a shutdown signal arrives, before Node is stopped.

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
        else range(INITIAL_PORT_VALUE, INITIAL_PORT_VALUE + TRY_NUM_PORTS)
    )

    node_process, node_port = start_node_process(
        node_path=node_path or os.getenv("GRADIO_NODE_PATH"),
        server_name=host,
        server_ports=server_ports,
        python_port=python_port,
        python_host=python_host or "127.0.0.1",
        static_worker_ports=static_worker_ports or [],
        debug=debug,
        on_shutdown=on_shutdown,
    )

    return server_name, node_process, node_port


GRADIO_LOCAL_DEV_MODE = os.getenv("GRADIO_LOCAL_DEV_MODE") is not None
SSR_APP_PATH = Path(__file__).parent.joinpath("templates", "node", "build")


def start_node_process(
    node_path: str | None,
    server_name: str,
    server_ports: list[int] | range,
    python_port: int | None = None,
    python_host: str = "127.0.0.1",
    static_worker_ports: list[int] | None = None,
    debug: bool = False,
    on_shutdown: Callable[[], None] | None = None,
) -> tuple[subprocess.Popen[bytes] | None, int | None]:
    if GRADIO_LOCAL_DEV_MODE:
        return None, 9876
    if not node_path:
        return None, None

    node_process = None
    # Node's own output is hidden unless debug=True, which means a server that starts
    # but fails to render leaves no trace. Keep the last of it so a failed startup can
    # say what actually went wrong instead of guessing at the Node version.
    node_errors: str = ""
    busy_ports: list[int] = []
    attempted_start = False

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
            attempted_start = True

            # Set environment variables for the Node server
            env = os.environ.copy()
            env["PORT"] = str(port)
            env["HOST"] = server_name
            if GRADIO_LOCAL_DEV_MODE:
                env["GRADIO_LOCAL_DEV_MODE"] = "1"

            # Proxy configuration: tell Node where Python and workers are
            if python_port is not None:
                env["GRADIO_PYTHON_PORT"] = str(python_port)
                env["GRADIO_PYTHON_HOST"] = python_host
            if static_worker_ports:
                env["GRADIO_STATIC_WORKER_PORTS"] = ",".join(
                    str(p) for p in static_worker_ports
                )
            else:
                env.pop("GRADIO_STATIC_WORKER_PORTS", None)

            register_file = str(
                Path(__file__).parent.joinpath("templates", "register.mjs")
            )

            # Node --import needs a file:// URL on Windows; Path.as_uri()
            # produces a valid URL (file:///C:/...) unlike "file://" + path.
            if sys.platform == "win32":
                register_file = Path(register_file).as_uri()

            node_process = subprocess.Popen(
                [node_path, "--import", register_file, SSR_APP_PATH],
                env=env,
                stdout=None if debug else subprocess.DEVNULL,
                stderr=None if debug else subprocess.PIPE,
            )

            # The pipe has to be drained for the lifetime of the process or Node
            # blocks once the buffer fills, so a thread keeps reading it and holds
            # on to only the most recent lines.
            recent_errors: deque[str] = deque(maxlen=50)
            stderr_thread = None
            if node_process.stderr is not None:
                stderr_thread = threading.Thread(
                    target=drain_stderr,
                    args=(node_process.stderr, recent_errors),
                    daemon=True,
                )
                stderr_thread.start()

            # Node starts only after the Python backend is already
            # listening (Blocks.launch defers the front-proxy start), so we
            # can verify that Node actually renders a page rather than merely
            # opening its TCP port. Polling HEAD / until it succeeds means the
            # SSR runtime is warm before we return — otherwise the user-facing
            # port is reachable while the first requests 502 as SSR initialises.
            is_working = verify_server_startup(server_name, port, timeout=30)
            if is_working:
                install_shutdown_handlers(node_process, on_shutdown)
                return node_process, port

            else:
                # If verification failed, terminate the process and try the next port
                node_process.terminate()
                node_process.wait(timeout=2)
                # Let the reader finish the lines already in the pipe before we
                # look at them, otherwise the diagnosis can race the output.
                if stderr_thread is not None:
                    stderr_thread.join(timeout=2)
                node_errors = "".join(recent_errors).strip() or node_errors
                node_process = None

        except OSError:
            busy_ports.append(port)
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
    if node_errors:
        # Node ran and told us why it couldn't serve requests, so pass that along
        # rather than pointing at the Node installation, which is evidently fine.
        # The same failure usually repeats once per probe, so one tail is enough.
        print("The Node server reported:")
        print("\n".join(node_errors.splitlines()[-20:]))
    elif not attempted_start:
        if len(busy_ports) == 1:
            print(
                f"Port {busy_ports[0]} is already in use. "
                "Pass a free `server_port`, or omit it to let Gradio pick the next available port."
            )
        else:
            print(f"No free port found in range {server_ports[0]}-{server_ports[-1]}.")
    else:
        print(
            "Please install Node 20 or higher and set the environment variable GRADIO_NODE_PATH to the path of your Node executable."
        )
    print(
        "You can explicitly specify a port by setting the environment variable GRADIO_NODE_SERVER_PORT."
    )

    return None, None


def drain_stderr(stream, buffer: deque[str]) -> None:
    """Reads the Node server's stderr, keeping only the most recent lines."""
    try:
        for line in iter(stream.readline, b""):
            buffer.append(line.decode("utf-8", errors="replace"))
    except Exception:
        pass
    finally:
        try:
            stream.close()
        except Exception:
            pass


def attempt_connection(host: str, port: int) -> bool:
    """Attempts a single connection to the server."""
    try:
        with closing(socket.create_connection((host, port), timeout=1)):
            return True
    except (TimeoutError, ConnectionRefusedError):
        return False
    except Exception:
        return False


def verify_server_startup(host: str, port: int, timeout: float = 15.0) -> bool:
    """Polls ``HEAD /`` until the server returns a non-5xx status (or the
    timeout elapses), confirming it can actually serve requests rather than
    just that its TCP port is open."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            conn = HTTPConnection(host, port, timeout=2)
            conn.request("HEAD", "/")
            resp = conn.getresponse()
            conn.close()
            if resp.status < 500:
                return True
        except Exception:
            pass
        time.sleep(0.2)
    return False


def stop_node_process(
    node_process: subprocess.Popen[bytes],
    timeout: float = NODE_SHUTDOWN_TIMEOUT,
) -> None:
    """Stops the Node server, killing it if it does not exit within `timeout`."""
    node_process.terminate()
    try:
        node_process.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        node_process.kill()
        node_process.wait()


def install_shutdown_handlers(
    node_process: subprocess.Popen[bytes],
    on_shutdown: Callable[[], None] | None = None,
) -> None:
    """Stops the Node server when this process is asked to terminate."""
    stopping = False

    def handle_shutdown(_signum, _frame):
        nonlocal stopping
        # Popen.wait() holds a non-reentrant lock across its waitpid() call, so
        # a second signal re-entering this handler would deadlock the process
        # for good. Once shutdown is under way, later signals are ignored.
        if stopping:
            return
        stopping = True
        print("\nStopping Node.js server...")
        if on_shutdown is not None:
            try:
                on_shutdown()
            except Exception:
                # Only an optimisation: stopping Node has to happen regardless,
                # and leaving it running would hold the user-facing port.
                pass
        stop_node_process(node_process)
        sys.exit(0)

    signal.signal(signal.SIGTERM, handle_shutdown)
    signal.signal(signal.SIGINT, handle_shutdown)
