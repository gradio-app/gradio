"""
Defines helper methods useful for setting up ports, launching servers, and handling `ngrok`
"""

from flask import Flask, request, session, jsonify, abort, send_file, render_template, redirect
from flask_cachebuster import CacheBuster
from flask_login import LoginManager, login_user, current_user, login_required
from flask_cors import CORS
from functools import wraps
import inspect
import io
import json
import logging
import os
import pkg_resources
import requests
import socket
import sys
import threading
import time
import traceback
import urllib.parse
import urllib.request
from werkzeug.security import safe_join
from werkzeug.serving import make_server

from gradio import encryptor, queue
from gradio.tunneling import create_tunnel
from gradio.process_examples import load_from_cache, process_example

# By default, the http server will try to open on port 7860. If not available, 7861, 7862, etc.
INITIAL_PORT_VALUE = int(os.getenv('GRADIO_SERVER_PORT', "7860"))  
# Number of ports to try before giving up and throwing an exception.
TRY_NUM_PORTS = int(os.getenv('GRADIO_NUM_PORTS', "100"))  
LOCALHOST_NAME = os.getenv('GRADIO_SERVER_NAME', "127.0.0.1")
GRADIO_API_SERVER = "https://api.gradio.app/v1/tunnel-request"
GRADIO_FEATURE_ANALYTICS_URL = "https://api.gradio.app/gradio-feature-analytics/"

STATIC_TEMPLATE_LIB = pkg_resources.resource_filename("gradio", "templates/")
STATIC_PATH_LIB = pkg_resources.resource_filename("gradio", "templates/frontend/static")
VERSION_FILE = pkg_resources.resource_filename("gradio", "version.txt")

with open(VERSION_FILE) as version_file:
    GRADIO_STATIC_ROOT = "https://gradio.s3-us-west-2.amazonaws.com/" + \
        version_file.read() + "/static/"

app = Flask(__name__,
            template_folder=STATIC_TEMPLATE_LIB,
            static_folder="",
            static_url_path="/none/")
app.url_map.strict_slashes = False

CORS(app)
cache_buster = CacheBuster(
    config={'extensions': ['.js', '.css'], 'hash_size': 5})
cache_buster.init_app(app)
app.secret_key = os.getenv("GRADIO_KEY", "secret")
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

# Hide Flask default message
cli = sys.modules['flask.cli']
cli.show_server_banner = lambda *x: None


class User:
    def __init__(self, id):
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
        self.id = id

    def get_id(self):
        return self.id


@login_manager.user_loader
def load_user(_id):
    return User(_id)


def login_check(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if app.auth:
            @login_required
            def func2(*args, **kwargs):
                return func(*args, **kwargs)

            return func2(*args, **kwargs)
        else:
            return func(*args, **kwargs)
    return wrapper


def get_local_ip_address():
    try:
        ip_address = requests.get('https://api.ipify.org', timeout=3).text
    except (requests.ConnectionError, requests.exceptions.ReadTimeout):
        ip_address = "No internet connection"
    return ip_address


IP_ADDRESS = get_local_ip_address()


def get_first_available_port(initial, final):
    """
    Gets the first open port in a specified range of port numbers
    :param initial: the initial value in the range of port numbers
    :param final: final (exclusive) value in the range of port numbers, should be greater than `initial`
    :return:
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


@app.route("/", methods=["GET"])
@login_check
def main():
    session["state"] = None
    return render_template("frontend/index.html", config=app.interface.config)


@app.route("/static/<path:path>", methods=["GET"])
def static_resource(path):
    if app.interface.share:
        return redirect(GRADIO_STATIC_ROOT + path)
    else:
        return send_file(safe_join(STATIC_PATH_LIB, path))


# TODO(@aliabid94): this throws a 500 error if app.auth is None (should probalbly just redirect to '/')
@app.route('/login', methods=["GET", "POST"])
def login():
    if request.method == "GET":
        config = get_config()
        return render_template("frontend/index.html", config=config)
    elif request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if ((not callable(app.auth) and username in app.auth and app.auth[username] == password)
                or (callable(app.auth) and app.auth.__call__(username, password))):
            login_user(User(username))
            return redirect("/")
        else:
            return abort(401)


@app.route("/api/", methods=["GET"])
def api_docs():
    inputs = [type(inp) for inp in app.interface.input_components]
    outputs = [type(out) for out in app.interface.output_components]
    input_types_doc, input_types = get_types(inputs, "input")
    output_types_doc, output_types = get_types(outputs, "output")
    input_names = [type(inp).__name__ for inp in app.interface.input_components]
    output_names = [type(out).__name__ for out in app.interface.output_components]
    if app.interface.examples is not None:
        sample_inputs = app.interface.examples[0]
    else:
        sample_inputs = [inp.generate_sample() for inp in app.interface.input_components]
    docs = {
        "inputs": input_names,
        "outputs": output_names,
        "len_inputs": len(inputs),
        "len_outputs": len(outputs),
        "inputs_lower": [name.lower() for name in input_names],
        "outputs_lower": [name.lower() for name in output_names],
        "input_types": input_types,
        "output_types": output_types,
        "input_types_doc": input_types_doc,
        "output_types_doc": output_types_doc,
        "sample_inputs": sample_inputs,
        "auth": app.interface.auth,
        "local_login_url": urllib.parse.urljoin(
            app.interface.local_url, "login"),
        "local_api_url": urllib.parse.urljoin(
            app.interface.local_url, "api/predict")
    }
    return render_template("api_docs.html", **docs)


@app.route("/config/", methods=["GET"])
def get_config():
    if app.interface.auth is None or current_user.is_authenticated:
        return jsonify(app.interface.config)
    else:
        return {"auth_required": True, "auth_message": app.interface.auth_message}


@app.route("/enable_sharing/<path:path>", methods=["GET"])
@login_check
def enable_sharing(path):
    if path == "None":
        path = None
    app.interface.config["share_url"] = path
    return jsonify(success=True)


@app.route("/shutdown", methods=['GET'])
def shutdown():
    shutdown_func = request.environ.get('werkzeug.server.shutdown')
    if shutdown_func is None:
        raise RuntimeError('Not running werkzeug')
    shutdown_func()
    return "Shutting down..."


@app.route("/api/predict/", methods=["POST"])
@login_check
def predict():
    request_data = request.get_json()
    flag_index = None
    if request_data.get("example_id") != None:
        example_id = request_data["example_id"]
        if app.interface.cache_examples:
            prediction = load_from_cache(app.interface, example_id)
            durations = None
        else:
            prediction, durations = process_example(app.interface, example_id)
    else:
        raw_input = request_data["data"]
        if app.interface.show_error:
            try:
                prediction, durations = app.interface.process(raw_input)
            except BaseException as error:
                traceback.print_exc()
                return jsonify({"error": str(error)}), 500
        else:
            prediction, durations = app.interface.process(raw_input)
        if app.interface.allow_flagging == "auto":
            flag_index = app.interface.flagging_callback.flag(app.interface, raw_input, prediction,
                flag_option=(None if app.interface.flagging_options is None else ""), 
                username=current_user.id if current_user.is_authenticated else None)
    output = {
        "data": prediction, 
        "durations": durations, 
        "avg_durations": app.interface.config.get("avg_durations"),
        "flag_index": flag_index
    }
    return output


@app.route("/api/flag/", methods=["POST"])
@login_check
def flag():
    log_feature_analytics('flag')
    data = request.json['data']
    app.interface.flagging_callback.flag(
        app.interface, data['input_data'], data['output_data'], 
        data.get("flag_option"), data.get("flag_index"),
        current_user.id if current_user.is_authenticated else None)
    return jsonify(success=True)


@app.route("/api/interpret/", methods=["POST"])
@login_check
def interpret():
    log_feature_analytics('interpret')
    raw_input = request.json["data"]
    interpretation_scores, alternative_outputs = app.interface.interpret(
        raw_input)
    return jsonify({
        "interpretation_scores": interpretation_scores,
        "alternative_outputs": alternative_outputs
    })


@app.route("/file/<path:path>", methods=["GET"])
@login_check
def file(path):
    if app.interface.encrypt and isinstance(app.interface.examples, str) and path.startswith(app.interface.examples):
        with open(safe_join(app.cwd, path), "rb") as encrypted_file:
            encrypted_data = encrypted_file.read()
        file_data = encryptor.decrypt(
            app.interface.encryption_key, encrypted_data)
        return send_file(io.BytesIO(file_data), attachment_filename=os.path.basename(path))
    else:
        return send_file(safe_join(app.cwd, path))


@app.route("/api/queue/push/", methods=["POST"])
@login_check
def queue_push():
    data = request.get_json()
    action = data["action"]
    job_hash, queue_position = queue.push(data, action)
    return {"hash": job_hash, "queue_position": queue_position}


@app.route("/api/queue/status/", methods=["POST"])
@login_check
def queue_status():
    hash = request.json['hash']
    status, data = queue.get_status(hash)
    return {"status": status, "data": data}


def queue_thread(path_to_local_server, test_mode=False):
    while True:
        try:
            next_job = queue.pop()
            if next_job is not None:
                _, hash, input_data, task_type = next_job
                queue.start_job(hash)
                response = requests.post(
                    path_to_local_server + "/api/" + task_type + "/", json=input_data)
                if response.status_code == 200:
                    queue.pass_job(hash, response.json())
                else:
                    queue.fail_job(hash, response.text)
            else:
                time.sleep(1)
        except Exception as e:
            time.sleep(1)
            pass
        if test_mode:
            break


def start_server(interface, server_name=None, server_port=None, auth=None, ssl=None):
    if server_name is None:
        server_name = LOCALHOST_NAME
    if server_port is None:  # if port is not specified, start at 7860 and search for first available port        
        port = get_first_available_port(
            INITIAL_PORT_VALUE, INITIAL_PORT_VALUE + TRY_NUM_PORTS
        )
    else:
        try:
            s = socket.socket()  # create a socket object
            s.bind((LOCALHOST_NAME, server_port))  # Bind to the port to see if it's available (otherwise, raise OSError)
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
    app.cwd = os.getcwd()
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    if app.interface.enable_queue:
        if auth is not None or app.interface.encrypt:
            raise ValueError("Cannot queue with encryption or authentication enabled.")
        queue.init()
        app.queue_thread = threading.Thread(target=queue_thread, args=(path_to_local_server,))
        app.queue_thread.start()
    if interface.save_to is not None:
        interface.save_to["port"] = port
    app_kwargs = {"app": app, "port": port, "host": server_name}
    if ssl:
        app_kwargs["ssl_context"] = ssl
    server = make_server(**app_kwargs)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return port, path_to_local_server, app, thread, server

def get_state():
    return session.get("state")

def set_state(value):
    session["state"] = value

def close_server(process):
    process.terminate()
    process.join()


def url_request(url):
    try:
        req = urllib.request.Request(
            url=url, headers={"content-type": "application/json"}
        )
        res = urllib.request.urlopen(req, timeout=10)
        return res
    except Exception as e:
        raise RuntimeError(str(e))


def setup_tunnel(local_server_port, endpoint):
    response = url_request(
        endpoint + '/v1/tunnel-request' if endpoint is not None else GRADIO_API_SERVER)
    if response and response.code == 200:
        try:
            payload = json.loads(response.read().decode("utf-8"))[0]
            return create_tunnel(payload, LOCALHOST_NAME, local_server_port)

        except Exception as e:
            raise RuntimeError(str(e))


def url_ok(url):
    try:
        for _ in range(5):
            time.sleep(.500)
            r = requests.head(url, timeout=3)
            if r.status_code in (200, 401, 302):  # 401 or 302 if auth is set
                return True
    except (ConnectionError, requests.exceptions.ConnectionError):
        return False
    


def get_types(cls_set, component):
    docset = []
    types = []
    if component == "input":
        for cls in cls_set:
            doc = inspect.getdoc(cls.preprocess)
            doc_lines = doc.split("\n")
            docset.append(doc_lines[1].split(":")[-1])
            types.append(doc_lines[1].split(")")[0].split("(")[-1])
    else:
        for cls in cls_set:
            doc = inspect.getdoc(cls.postprocess)
            doc_lines = doc.split("\n")
            docset.append(doc_lines[-1].split(":")[-1])
            types.append(doc_lines[-1].split(")")[0].split("(")[-1])
    return docset, types


def log_feature_analytics(feature):
    if app.interface.analytics_enabled:
        try:
            requests.post(GRADIO_FEATURE_ANALYTICS_URL,
                          data={
                              'ip_address': IP_ADDRESS,
                              'feature': feature}, timeout=3)
        except (requests.ConnectionError, requests.exceptions.ReadTimeout):
            pass  # do not push analytics if no network


