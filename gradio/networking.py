"""
Defines helper methods useful for setting up ports, launching servers, and handling `ngrok`
"""

import os
import socket
import threading
from flask import Flask, request, jsonify, abort, send_file, render_template, redirect
from flask_cachebuster import CacheBuster
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from flask_cors import CORS
import threading
import pkg_resources
from distutils import dir_util
import time
import json
import urllib.request
from shutil import copyfile
import requests
import sys
import csv
import logging
import gradio as gr
from gradio.embeddings import calculate_similarity, fit_pca_to_embeddings, transform_with_pca
from gradio.tunneling import create_tunnel
from gradio import encryptor
from functools import wraps
import io

INITIAL_PORT_VALUE = int(os.getenv(
    'GRADIO_SERVER_PORT', "7860"))  # The http server will try to open on port 7860. If not available, 7861, 7862, etc.
TRY_NUM_PORTS = int(os.getenv(
    'GRADIO_NUM_PORTS', "100"))  # Number of ports to try before giving up and throwing an exception.
LOCALHOST_NAME = os.getenv(
    'GRADIO_SERVER_NAME', "127.0.0.1")
GRADIO_API_SERVER = "https://api.gradio.app/v1/tunnel-request"
GRADIO_FEATURE_ANALYTICS_URL = "https://api.gradio.app/gradio-feature-analytics/"

STATIC_TEMPLATE_LIB = pkg_resources.resource_filename("gradio", "frontend/")
STATIC_PATH_LIB = pkg_resources.resource_filename("gradio", "frontend/static")
GRADIO_STATIC_ROOT = "https://gradio.app/static/"

app = Flask(__name__,
            template_folder=STATIC_TEMPLATE_LIB,
            static_folder="",
            static_url_path="/none/")
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
    return render_template("index.html", config=app.interface.config)

@app.route("/static/<path:path>", methods=["GET"])
def static_resource(path):
    if app.interface.share:
        return redirect(GRADIO_STATIC_ROOT + path)
    else:
        return send_file(os.path.join(STATIC_PATH_LIB, path))

@app.route('/login', methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html", current_user=current_user, auth_message=app.interface.auth_message)
    elif request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if username in app.auth and app.auth[username] == password:
            login_user(User(username))
            return redirect("/")
        else:
            return abort(401)


@app.route("/config/", methods=["GET"])
@login_check
def config():
    return jsonify(app.interface.config)


@app.route("/enable_sharing/<path:path>", methods=["GET"])
@login_check
def enable_sharing(path):
    if path == "None":
        path = None
    app.interface.config["share_url"] = path
    return jsonify(success=True)


@app.route("/api/predict/", methods=["POST"])
@login_check
def predict():
    raw_input = request.json["data"]
    prediction, durations = app.interface.process(raw_input)
    output = {"data": prediction, "durations": durations}
    if app.interface.allow_flagging == "auto":
        try:
            flag_data(raw_input, prediction)
        except:
            pass
    return jsonify(output)


def log_feature_analytics(feature):
    if app.interface.analytics_enabled:
        try:
            requests.post(GRADIO_FEATURE_ANALYTICS_URL,
                          data={
                              'ip_address': IP_ADDRESS,
                              'feature': feature}, timeout=3)
        except (requests.ConnectionError, requests.exceptions.ReadTimeout):
            pass  # do not push analytics if no network


@app.route("/api/score_similarity/", methods=["POST"])
@login_check
def score_similarity():
    raw_input = request.json["data"]

    preprocessed_input = [input_interface.preprocess(raw_input[i])
                          for i, input_interface in enumerate(app.interface.input_components)]
    input_embedding = app.interface.embed(preprocessed_input)
    scores = list()

    for example in app.interface.examples:
        preprocessed_example = [iface.preprocess(iface.preprocess_example(example))
                                for iface, example in zip(app.interface.input_components, example)]
        example_embedding = app.interface.embed(preprocessed_example)
        scores.append(calculate_similarity(input_embedding, example_embedding))
    log_feature_analytics('score_similarity')
    return jsonify({"data": scores})


@app.route("/api/view_embeddings/", methods=["POST"])
@login_check
def view_embeddings():
    sample_embedding = []
    if "data" in request.json:
        raw_input = request.json["data"]
        preprocessed_input = [input_interface.preprocess(raw_input[i])
                              for i, input_interface in enumerate(app.interface.input_components)]
        sample_embedding.append(app.interface.embed(preprocessed_input))

    example_embeddings = []
    for example in app.interface.examples:
        preprocessed_example = [iface.preprocess(iface.preprocess_example(example))
                                for iface, example in zip(app.interface.input_components, example)]
        example_embedding = app.interface.embed(preprocessed_example)
        example_embeddings.append(example_embedding)

    pca_model, embeddings_2d = fit_pca_to_embeddings(
        sample_embedding + example_embeddings)
    sample_embedding_2d = embeddings_2d[:len(sample_embedding)]
    example_embeddings_2d = embeddings_2d[len(sample_embedding):]
    app.pca_model = pca_model
    log_feature_analytics('view_embeddings')
    return jsonify({"sample_embedding_2d": sample_embedding_2d, "example_embeddings_2d": example_embeddings_2d})


@app.route("/api/update_embeddings/", methods=["POST"])
@login_check
def update_embeddings():
    sample_embedding, sample_embedding_2d = [], []
    if "data" in request.json:
        raw_input = request.json["data"]
        preprocessed_input = [input_interface.preprocess(raw_input[i])
                              for i, input_interface in enumerate(app.interface.input_components)]
        sample_embedding.append(app.interface.embed(preprocessed_input))
        sample_embedding_2d = transform_with_pca(
            app.pca_model, sample_embedding)

    return jsonify({"sample_embedding_2d": sample_embedding_2d})


@app.route("/api/predict_examples/", methods=["POST"])
@login_check
def predict_examples():
    example_ids = request.json["data"]
    predictions_set = {}
    for example_id in example_ids:
        example_set = app.interface.examples[example_id]
        processed_example_set = [iface.preprocess_example(example)
                                 for iface, example in zip(app.interface.input_components, example_set)]
        try:
            predictions, _ = app.interface.process(processed_example_set)
        except:
            continue
        predictions_set[example_id] = predictions
    output = {"data": predictions_set}
    return jsonify(output)


def flag_data(input_data, output_data, flag_option=None):
    flag_path = os.path.join(app.cwd, app.interface.flagging_dir)
    csv_data = []
    encryption_key = app.interface.encryption_key if app.interface.encrypt else None
    for i, interface in enumerate(app.interface.input_components):
        csv_data.append(interface.save_flagged(
            flag_path, app.interface.config["input_components"][i]["label"], input_data[i], encryption_key))
    for i, interface in enumerate(app.interface.output_components):
        csv_data.append(interface.save_flagged(
            flag_path, app.interface.config["output_components"][i]["label"], output_data[i], encryption_key))
    if flag_option:
        csv_data.append(flag_option)

    headers = [interface["label"]
               for interface in app.interface.config["input_components"]]
    headers += [interface["label"]
                for interface in app.interface.config["output_components"]]
    if app.interface.flagging_options is not None:
        headers.append("flag")

    log_fp = "{}/log.csv".format(flag_path)
    is_new = not os.path.exists(log_fp)

    if app.interface.encrypt:
        output = io.StringIO()
        if not is_new:
            with open(log_fp, "rb") as csvfile:
                encrypted_csv = csvfile.read()
                decrypted_csv = encryptor.decrypt(
                    app.interface.encryption_key, encrypted_csv)
                output.write(decrypted_csv.decode())
        writer = csv.writer(output)
        if is_new:
            writer.writerow(headers)
        writer.writerow(csv_data)
        with open(log_fp, "wb") as csvfile:
            csvfile.write(encryptor.encrypt(
                app.interface.encryption_key, output.getvalue().encode()))
    else:
        with open(log_fp, "a") as csvfile:
            writer = csv.writer(csvfile)
            if is_new:
                writer.writerow(headers)
            writer.writerow(csv_data)


@app.route("/api/flag/", methods=["POST"])
@login_check
def flag():
    log_feature_analytics('flag')
    data = request.json['data']
    flag_data(data['input_data'], data['output_data'], data.get("flag_option"))
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
        with open(os.path.join(app.cwd, path), "rb") as encrypted_file:
            encrypted_data = encrypted_file.read()
        file_data = encryptor.decrypt(
            app.interface.encryption_key, encrypted_data)
        return send_file(io.BytesIO(file_data), attachment_filename=os.path.basename(path))
    else:
        return send_file(os.path.join(app.cwd, path))


def start_server(interface, server_name, server_port=None, auth=None, ssl=None):
    if server_port is None:
        server_port = INITIAL_PORT_VALUE
    port = get_first_available_port(
        server_port, server_port + TRY_NUM_PORTS
    )
    if auth is not None:
        app.auth = {account[0]: account[1] for account in auth}
    else:
        app.auth = None
    app.interface = interface
    app.cwd = os.getcwd()
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    if interface.save_to is not None:
        interface.save_to["port"] = port
    app_kwargs = {"port": port, "host": server_name}
    if ssl:
        print(ssl)
        app_kwargs["ssl_context"] = ssl
    thread = threading.Thread(target=app.run,
                              kwargs=app_kwargs,
                              daemon=True)
    thread.start()

    return port, app, thread


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
