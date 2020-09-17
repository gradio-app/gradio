"""
Defines helper methods useful for setting up ports, launching servers, and handling `ngrok`
"""

import os
import socket
import threading
from flask import Flask, request, jsonify, abort, send_file, render_template
from multiprocessing import Process
import pkg_resources
from distutils import dir_util
from gradio import inputs, outputs
import time
import json
from gradio.tunneling import create_tunnel
import urllib.request
from shutil import copyfile
import requests
import sys
import csv


INITIAL_PORT_VALUE = int(os.getenv(
    'GRADIO_SERVER_PORT', "7860"))  # The http server will try to open on port 7860. If not available, 7861, 7862, etc.
TRY_NUM_PORTS = int(os.getenv(
    'GRADIO_NUM_PORTS', "100"))  # Number of ports to try before giving up and throwing an exception.
LOCALHOST_NAME = os.getenv(
    'GRADIO_SERVER_NAME', "127.0.0.1")
GRADIO_API_SERVER = "https://api.gradio.app/v1/tunnel-request"

STATIC_TEMPLATE_LIB = pkg_resources.resource_filename("gradio", "templates/")
STATIC_PATH_LIB = pkg_resources.resource_filename("gradio", "static/")

app = Flask(__name__,
    template_folder=STATIC_TEMPLATE_LIB,
    static_folder=STATIC_PATH_LIB)
app.app_globals = {}


def set_meta_tags(title, description, thumbnail):
    app.app_globals.update({
        "title": title,
        "description": description,
        "thumbnail": thumbnail
    })


def set_config(config):
    app.app_globals["config"] = config


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
def gradio():
    return render_template("index.html",
        title=app.app_globals["title"],
        description=app.app_globals["description"],
        thumbnail=app.app_globals["thumbnail"],
    )

@app.route("/config/", methods=["GET"])
def config():
    return jsonify(app.app_globals["config"])

@app.route("/api/predict/", methods=["POST"])
def predict():
    raw_input = request.json["data"]
    prediction, durations = app.interface.process(raw_input)
    output = {"data": prediction, "durations": durations}
    return jsonify(output)

@app.route("/api/flag/", methods=["POST"])
def flag():
    os.makedirs(app.interface.flagging_dir, exist_ok=True)
    output = {'inputs': [app.interface.input_interfaces[
        i].rebuild(
        app.interface.flagging_dir, request.json['data']['input_data'][i]) for i
        in range(len(app.interface.input_interfaces))],
        'outputs': [app.interface.output_interfaces[
            i].rebuild(
            app.interface.flagging_dir, request.json['data']['output_data'][i])
            for i
        in range(len(app.interface.output_interfaces))]}

    log_fp = "{}/log.csv".format(app.interface.flagging_dir)

    is_new = not os.path.exists(log_fp)

    with open(log_fp, "a") as csvfile:
        headers = ["input_{}".format(i) for i in range(len(
            output["inputs"]))] + ["output_{}".format(i) for i in
                                    range(len(output["outputs"]))]
        writer = csv.DictWriter(csvfile, delimiter=',',
                                lineterminator='\n',
                                fieldnames=headers)
        if is_new:
            writer.writeheader()

        writer.writerow(
            dict(zip(headers, output["inputs"] +
                        output["outputs"]))
        )
        return jsonify(success=True)

@app.route("/file/<path:path>", methods=["GET"])
def file(path):
    return send_file(os.path.join(os.getcwd(), path))
                

def start_server(interface, server_name=None, server_port=None):
    if server_port is None:
        server_port = INITIAL_PORT_VALUE
    port = get_first_available_port(
        server_port, server_port + TRY_NUM_PORTS
    )
    app.interface = interface
    process = Process(target=app.run, kwargs={"port": port, "debug": True})
    process.start()
    return port, app, process


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


# def setup_tunnel(local_server_port):
#     response = url_request(GRADIO_API_SERVER)
#     if response and response.code == 200:
#         try:
#             payload = json.loads(response.read().decode("utf-8"))[0]
#             return create_tunnel(payload, LOCALHOST_NAME, local_server_port)

#         except Exception as e:
#             raise RuntimeError(str(e))


def url_ok(url):
    try:
        r = requests.head(url)
        return r.status_code == 200
    except ConnectionError:
        return False
