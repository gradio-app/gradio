from __future__ import annotations

import os
import socket
import sys
import threading
import time
from functools import partial
from typing import TYPE_CHECKING

import uvicorn
from uvicorn.config import Config

from gradio.exceptions import ServerFailedToStartError
from gradio.routes import App
from gradio.utils import SourceFileReloader, watchfn

if TYPE_CHECKING:  # Only import for type checking (to avoid circular imports).
    pass

# By default, the local server will try to open on localhost, port 7860.
# If that is not available, then it will try 7861, 7862, ... 7959.
INITIAL_PORT_VALUE = int(os.getenv("GRADIO_SERVER_PORT", "7860"))
TRY_NUM_PORTS = int(os.getenv("GRADIO_NUM_PORTS", "100"))
LOCALHOST_NAME = os.getenv("GRADIO_SERVER_NAME", "127.0.0.1")

should_watch = bool(os.getenv("GRADIO_WATCH_DIRS", ""))
GRADIO_WATCH_DIRS = (
    os.getenv("GRADIO_WATCH_DIRS", "").split(",") if should_watch else []
)
GRADIO_WATCH_MODULE_NAME = os.getenv("GRADIO_WATCH_MODULE_NAME", "app")
GRADIO_WATCH_DEMO_NAME = os.getenv("GRADIO_WATCH_DEMO_NAME", "demo")
GRADIO_WATCH_DEMO_PATH = os.getenv("GRADIO_WATCH_DEMO_PATH", "")


class Server(uvicorn.Server):
    def __init__(
        self, config: Config, reloader: SourceFileReloader | None = None
    ) -> None:
        self.running_app = config.app
        super().__init__(config)
        self.reloader = reloader
        if self.reloader:
            self.event = threading.Event()
            self.watch = partial(watchfn, self.reloader)

    def install_signal_handlers(self):
        pass

    def run_in_thread(self):
        self.thread = threading.Thread(target=self.run, daemon=True)
        if self.reloader:
            self.watch_thread = threading.Thread(target=self.watch, daemon=True)
            self.watch_thread.start()
        self.thread.start()
        start = time.time()
        while not self.started:
            time.sleep(1e-3)
            if time.time() - start > 5:
                raise ServerFailedToStartError(
                    "Server failed to start. Please check that the port is available."
                )

    def close(self):
        self.should_exit = True
        if self.reloader:
            self.reloader.stop()
            self.watch_thread.join()
        self.thread.join(timeout=5)


def start_server(
    app: App,
    server_name: str | None = None,
    server_port: int | None = None,
    ssl_keyfile: str | None = None,
    ssl_certfile: str | None = None,
    ssl_keyfile_password: str | None = None,
) -> tuple[str, int, str, Server]:
    """Launches a local server running the provided Interface
    Parameters:
        app: the FastAPI app object to run
        server_name: to make app accessible on local network, set this to "0.0.0.0". Can be set by environment variable GRADIO_SERVER_NAME.
        server_port: will start gradio app on this port (if available). Can be set by environment variable GRADIO_SERVER_PORT.
        auth: If provided, username and password (or list of username-password tuples) required to access the Blocks. Can also provide function that takes username and password and returns True if valid login.
        ssl_keyfile: If a path to a file is provided, will use this as the private key file to create a local server running on https.
        ssl_certfile: If a path to a file is provided, will use this as the signed certificate for https. Needs to be provided if ssl_keyfile is provided.
        ssl_keyfile_password: If a password is provided, will use this with the ssl certificate for https.

    Returns:
        server_name: the name of the server (default is "localhost")
        port: the port number the server is running on
        path_to_local_server: the complete address that the local server can be accessed at
        server: the server object that is a subclass of uvicorn.Server (used to close the server)
    """
    if ssl_keyfile is not None and ssl_certfile is None:
        raise ValueError("ssl_certfile must be provided if ssl_keyfile is provided.")

    server_name = server_name or LOCALHOST_NAME
    url_host_name = "localhost" if server_name == "0.0.0.0" else server_name

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

    for port in server_ports:
        try:
            # The fastest way to check if a port is available is to try to bind to it with socket.
            # If the port is not available, socket will throw an OSError.
            s = socket.socket()
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            # Really, we should be checking if (server_name, server_port) is available, but
            # socket.bind() doesn't seem to throw an OSError with ipv6 addresses, based on my testing.
            # Instead, we just check if the port is available on localhost.
            s.bind((LOCALHOST_NAME, port))
            s.close()

            # To avoid race conditions, so we also check if the port by trying to start the uvicorn server.
            # If the port is not available, this will throw a ServerFailedToStartError.
            config = uvicorn.Config(
                app=app,
                port=port,
                host=host,
                log_level="warning",
                ssl_keyfile=ssl_keyfile,
                ssl_certfile=ssl_certfile,
                ssl_keyfile_password=ssl_keyfile_password,
            )
            reloader = None
            if GRADIO_WATCH_DIRS:
                reloader = SourceFileReloader(
                    app=app,
                    watch_dirs=GRADIO_WATCH_DIRS,
                    watch_module_name=GRADIO_WATCH_MODULE_NAME,
                    demo_name=GRADIO_WATCH_DEMO_NAME,
                    stop_event=threading.Event(),
                    demo_file=GRADIO_WATCH_DEMO_PATH,
                    watch_module=sys.modules["__main__"],
                )
            server = Server(config=config, reloader=reloader)
            server.run_in_thread()
            break
        except (OSError, ServerFailedToStartError):
            pass
    else:
        raise OSError(
            f"Cannot find empty port in range: {min(server_ports)}-{max(server_ports)}. You can specify a different port by setting the GRADIO_SERVER_PORT environment variable or passing the `server_port` parameter to `launch()`."
        )

    if ssl_keyfile is not None:
        path_to_local_server = f"https://{url_host_name}:{port}/"
    else:
        path_to_local_server = f"http://{url_host_name}:{port}/"

    return server_name, port, path_to_local_server, server
