"""
Defines helper methods useful for setting up ports, launching servers, and
creating tunnels.
"""
from __future__ import annotations

import http
import json
import os
import socket
import threading
import time
import urllib.parse
import urllib.request
from typing import TYPE_CHECKING, Optional, Tuple

import fastapi
import requests
import uvicorn

from gradio import queueing
from gradio.app import app
from gradio.tunneling import create_tunnel

if TYPE_CHECKING:  # Only import for type checking (to avoid circular imports).
    from gradio import Interface


# By default, the local server will try to open on localhost, port 7860.
# If that is not available, then it will try 7861, 7862, ... 7959.
INITIAL_PORT_VALUE = int(os.getenv("GRADIO_SERVER_PORT", "7860"))
TRY_NUM_PORTS = int(os.getenv("GRADIO_NUM_PORTS", "100"))
LOCALHOST_NAME = os.getenv("GRADIO_SERVER_NAME", "127.0.0.1")
GRADIO_API_SERVER = "https://api.gradio.app/v1/tunnel-request"


class Server(uvicorn.Server):
    def install_signal_handlers(self):
        pass

    def run_in_thread(self):
        self.thread = threading.Thread(target=self.run, daemon=True)
        self.thread.start()
        while not self.started:
            time.sleep(1e-3)

    def close(self):
        self.should_exit = True
        self.thread.join()


def get_first_available_port(initial: int, final: int) -> int:
    """
    Gets the first open port in a specified range of port numbers
    Parameters:
    initial: the initial value in the range of port numbers
    final: final (exclusive) value in the range of port numbers, should be greater than `initial`
    Returns:
    port: the first open port in the range
    """
    for port in range(initial, final):
        try:
            s = socket.socket()  # create a socket object
            s.bind((LOCALHOST_NAME, port))  # Bind to the port
            s.close()
            return port
        except OSError:
            pass
    raise OSError(
        "All ports from {} to {} are in use. Please close a port.".format(
            initial, final
        )
    )


def queue_thread(path_to_local_server, test_mode=False):
    while True:
        try:
            next_job = queueing.pop()
            if next_job is not None:
                _, hash, input_data, task_type = next_job
                queueing.start_job(hash)
                response = requests.post(
                    path_to_local_server + "api/" + task_type + "/", json=input_data
                )
                if response.status_code == 200:
                    queueing.pass_job(hash, response.json())
                else:
                    queueing.fail_job(hash, response.text)
            else:
                time.sleep(1)
        except Exception as e:
            time.sleep(1)
            pass
        if test_mode:
            break


def start_server(
    interface: Interface,
    server_name: Optional[str] = None,
    server_port: Optional[int] = None,
) -> Tuple[int, str, fastapi.FastAPI, threading.Thread, None]:
    """Launches a local server running the provided Interface
    Parameters:
    interface: The interface object to run on the server
    server_name: to make app accessible on local network, set this to "0.0.0.0". Can be set by environment variable GRADIO_SERVER_NAME.
    server_port: will start gradio app on this port (if available). Can be set by environment variable GRADIO_SERVER_PORT.
    auth: If provided, username and password (or list of username-password tuples) required to access interface. Can also provide function that takes username and password and returns True if valid login.
    """
    server_name = server_name or LOCALHOST_NAME
    # if port is not specified, search for first available port
    if server_port is None:
        port = get_first_available_port(
            INITIAL_PORT_VALUE, INITIAL_PORT_VALUE + TRY_NUM_PORTS
        )
    else:
        try:
            s = socket.socket()
            s.bind((LOCALHOST_NAME, server_port))
            s.close()
        except OSError:
            raise OSError(
                "Port {} is in use. If a gradio.Interface is running on the port, you can close() it or gradio.close_all().".format(
                    server_port
                )
            )
        port = server_port

    url_host_name = "localhost" if server_name == "0.0.0.0" else server_name
    path_to_local_server = "http://{}:{}/".format(url_host_name, port)
    auth = interface.auth
    if auth is not None:
        if not callable(auth):
            app.auth = {account[0]: account[1] for account in auth}
        else:
            app.auth = auth
    else:
        app.auth = None
    app.interface = interface
    app.cwd = os.getcwd()
    app.favicon_path = interface.favicon_path
    app.tokens = {}

    if app.interface.enable_queue:
        if auth is not None or app.interface.encrypt:
            raise ValueError("Cannot queue with encryption or authentication enabled.")
        queueing.init()
        app.queue_thread = threading.Thread(
            target=queue_thread, args=(path_to_local_server,)
        )
        app.queue_thread.start()
    if interface.save_to is not None:  # Used for selenium tests
        interface.save_to["port"] = port

    config = uvicorn.Config(app=app, port=port, host=server_name, log_level="warning")
    server = Server(config=config)
    server.run_in_thread()
    return port, path_to_local_server, app, server


def setup_tunnel(local_server_port: int, endpoint: str) -> str:
    response = url_request(
        endpoint + "/v1/tunnel-request" if endpoint is not None else GRADIO_API_SERVER
    )
    if response and response.code == 200:
        try:
            payload = json.loads(response.read().decode("utf-8"))[0]
            return create_tunnel(payload, LOCALHOST_NAME, local_server_port)
        except Exception as e:
            raise RuntimeError(str(e))


def url_request(url: str) -> Optional[http.client.HTTPResponse]:
    try:
        req = urllib.request.Request(
            url=url, headers={"content-type": "application/json"}
        )
        res = urllib.request.urlopen(req, timeout=10)
        return res
    except Exception as e:
        raise RuntimeError(str(e))


def url_ok(url: str) -> bool:
    try:
        for _ in range(5):
            time.sleep(0.500)
            r = requests.head(url, timeout=3)
            if r.status_code in (200, 401, 302):  # 401 or 302 if auth is set
                return True
    except (ConnectionError, requests.exceptions.ConnectionError):
        return False
