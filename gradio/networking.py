"""
Defines helper methods useful for setting up ports, launching servers, and
creating tunnels.
"""
from __future__ import annotations
import fastapi
from flask import Flask, request, session, jsonify, abort, send_file, render_template, redirect
from flask_cachebuster import CacheBuster
from flask_login import LoginManager, login_user, current_user, login_required
from flask_cors import CORS
from functools import wraps
import http
import io
import json
import os
import requests
import socket
import threading
import time
from typing import Callable, Any, List, Optional, Tuple, TYPE_CHECKING
import urllib.parse
import urllib.request
import uvicorn
from werkzeug.security import safe_join
from werkzeug.serving import make_server

from gradio import encryptor, queueing
from gradio.tunneling import create_tunnel
from gradio.app import app

if TYPE_CHECKING:  # Only import for type checking (to avoid circular imports).
    from gradio import Interface

# By default, the local server will try to open on localhost, port 7860. 
# If that is not available, then it will try 7861, 7862, ... 7959.
INITIAL_PORT_VALUE = int(os.getenv('GRADIO_SERVER_PORT', "7860"))  
TRY_NUM_PORTS = int(os.getenv('GRADIO_NUM_PORTS', "100"))  
LOCALHOST_NAME = os.getenv('GRADIO_SERVER_NAME', "127.0.0.1")
GRADIO_API_SERVER = "https://api.gradio.app/v1/tunnel-request"

# # TODO: all of this needs to be migrated
# app = Flask(__name__,
#             template_folder=STATIC_TEMPLATE_LIB,
#             static_folder="",
#             static_url_path="/none/")
# app.url_map.strict_slashes = False  # TODO: go back to discussion with Charles

# CORS(app)
# cache_buster = CacheBuster(
#     config={'extensions': ['.js', '.css'], 'hash_size': 5})
# cache_buster.init_app(app)
# app.secret_key = os.getenv("GRADIO_KEY", "secret")
# login_manager = LoginManager()
# login_manager.login_view = 'login'
# login_manager.init_app(app)

# # Hide Flask default message
# cli = sys.modules['flask.cli']
# cli.show_server_banner = lambda *x: None


# class User:
#     def __init__(self, id):
#         self.is_authenticated = True
#         self.is_active = True
#         self.is_anonymous = False
#         self.id = id

#     def get_id(self):
#         return self.id


# @login_manager.user_loader
# def load_user(_id):
#     return User(_id)


# def login_check(func):
#     @wraps(func)
#     def wrapper(*args, **kwargs):
#         if app.auth:
#             @login_required
#             def func2(*args, **kwargs):
#                 return func(*args, **kwargs)

#             return func2(*args, **kwargs)
#         else:
#             return func(*args, **kwargs)
#     return wrapper

def get_first_available_port(
    initial: int, 
    final: int) -> int:
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

# TODO(@aliabid94): this throws a 500 error if app.auth is None (should probalbly just redirect to '/')
# @app.route('/login', methods=["GET", "POST"])
# def login():
#     if request.method == "GET":
#         config = get_config()
#         return render_template("frontend/index.html", config=config)
#     elif request.method == "POST":
#         username = request.form.get("username")
#         password = request.form.get("password")
#         if ((not callable(app.auth) and username in app.auth and app.auth[username] == password)
#                 or (callable(app.auth) and app.auth.__call__(username, password))):
#             login_user(User(username))
#             return redirect("/")
#         else:
#             return abort(401)


@app.route("/shutdown", methods=['GET'])
def shutdown():
    shutdown_func = request.environ.get('werkzeug.server.shutdown')
    if shutdown_func is None:
        raise RuntimeError('Not running werkzeug')
    shutdown_func()
    return "Shutting down..."


@app.route("/api/queue/push/", methods=["POST"])
#@login_check
def queue_push():
    data = request.json["data"]
    action = request.json["action"]
    job_hash, queue_position = queueing.push({"data": data}, action)
    return {"hash": job_hash, "queue_position": queue_position}


@app.route("/api/queue/status/", methods=["POST"])
#@login_check
def queue_status():
    hash = request.json['hash']
    status, data = queueing.get_status(hash)
    return {"status": status, "data": data}


def queue_thread(path_to_local_server, test_mode=False):
    while True:
        try:
            next_job = queueing.pop()
            if next_job is not None:
                _, hash, input_data, task_type = next_job
                queueing.start_job(hash)
                response = requests.post(
                    path_to_local_server + "/api/" + task_type + "/", json=input_data)
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
    auth: Optional[Callable | Tuple[str, str] | List[Tuple[str, str]]] = None, 
) -> Tuple[int, str, fastapi.FastAPI, threading.Thread, None]:
    """Launches a local server running the provided Interface
    Parameters:
    interface: The interface object to run on the server
    server_name: to make app accessible on local network, set this to "0.0.0.0". Can be set by environment variable GRADIO_SERVER_NAME.
    server_port: will start gradio app on this port (if available). Can be set by environment variable GRADIO_SERVER_PORT.
    auth: If provided, username and password (or list of username-password tuples) required to access interface. Can also provide function that takes username and password and returns True if valid login.
    """    
    server_name = server_name or LOCALHOST_NAME
    if server_port is None:  # if port is not specified, search for first available port        
        port = get_first_available_port(
            INITIAL_PORT_VALUE, INITIAL_PORT_VALUE + TRY_NUM_PORTS
        )
    else:
        try:
            s = socket.socket()
            s.bind((LOCALHOST_NAME, server_port)) 
            s.close()
        except OSError:
            raise OSError("Port {} is in use. If a gradio.Interface is running on the port, you can close() it or gradio.close_all().".format(server_port))
        port = server_port

    url_host_name = "localhost" if server_name == "0.0.0.0" else server_name
    path_to_local_server = "http://{}:{}/".format(url_host_name, port)
    if auth is not None:
        if not callable(auth):
            app.auth = {account[0]: account[1] for account in auth}
        else:
            app.auth = auth
    else:
        app.auth = None
    app.interface = interface
    # app.cwd = os.getcwd()
    # if app.interface.enable_queue:
    #     if auth is not None or app.interface.encrypt:
    #         raise ValueError("Cannot queue with encryption or authentication enabled.")
    #     queueing.init()
    #     app.queue_thread = threading.Thread(target=queue_thread, args=(path_to_local_server,))
    #     app.queue_thread.start()
    # if interface.save_to is not None:
    #     interface.save_to["port"] = port
    app_kwargs = {"app": app, "port": port, "host": server_name, 
                  "log_level": "warning"}
    thread = threading.Thread(target=uvicorn.run, kwargs=app_kwargs)
    thread.start()
    return port, path_to_local_server, app, thread, None


def get_state():
    return session.get("state")


def set_state(value):
    session["state"] = value


def setup_tunnel(local_server_port: int, endpoint: str) -> str:
    response = url_request(
        endpoint + '/v1/tunnel-request' if endpoint is not None else GRADIO_API_SERVER)
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
            time.sleep(.500)
            r = requests.head(url, timeout=3)
            if r.status_code in (200, 401, 302):  # 401 or 302 if auth is set
                return True
    except (ConnectionError, requests.exceptions.ConnectionError):
        return False
    






