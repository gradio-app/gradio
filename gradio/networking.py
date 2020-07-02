"""
Defines helper methods useful for setting up ports, launching servers, and handling `ngrok`
"""

import os
import socket
import threading
from http.server import HTTPServer as BaseHTTPServer, SimpleHTTPRequestHandler
import pkg_resources
from distutils import dir_util
from gradio import inputs, outputs
import json
from gradio.tunneling import create_tunnel
import urllib.request
from shutil import copyfile
import requests

INITIAL_PORT_VALUE = (
    7860
)  # The http server will try to open on port 7860. If not available, 7861, 7862, etc.
TRY_NUM_PORTS = (
    100
)  # Number of ports to try before giving up and throwing an exception.
LOCALHOST_NAME = "127.0.0.1"
GRADIO_API_SERVER = "https://api.gradio.app/v1/tunnel-request"

STATIC_TEMPLATE_LIB = pkg_resources.resource_filename("gradio", "templates/")
STATIC_PATH_LIB = pkg_resources.resource_filename("gradio", "static/")
STATIC_PATH_TEMP = "static/"
TEMPLATE_TEMP = "index.html"
BASE_JS_FILE = "static/js/all_io.js"
CONFIG_FILE = "static/config.json"

ASSOCIATION_PATH_IN_STATIC = "static/apple-app-site-association"
ASSOCIATION_PATH_IN_ROOT = "apple-app-site-association"

FLAGGING_DIRECTORY = 'static/flagged/'
FLAGGING_FILENAME = 'data.txt'


def build_template(temp_dir):
    """
    Create HTML file with supporting JS and CSS files in a given directory.
    :param temp_dir: string with path to temp directory in which the html file should be built
    """
    dir_util.copy_tree(STATIC_TEMPLATE_LIB, temp_dir)
    dir_util.copy_tree(STATIC_PATH_LIB, os.path.join(
        temp_dir, STATIC_PATH_TEMP))

    # Move association file to root of temporary directory.
    copyfile(os.path.join(temp_dir, ASSOCIATION_PATH_IN_STATIC),
             os.path.join(temp_dir, ASSOCIATION_PATH_IN_ROOT))


def render_template_with_tags(template_path, context):
    """
    Combines the given template with a given context dictionary by replacing all of the occurrences of tags (enclosed
    in double curly braces) with corresponding values.
    :param template_path: a string with the path to the template file
    :param context: a dictionary whose string keys are the tags to replace and whose string values are the replacements.
    """
    print(template_path, context)
    with open(template_path) as fin:
        old_lines = fin.readlines()
    new_lines = render_string_or_list_with_tags(old_lines, context)
    with open(template_path, "w") as fout:
        for line in new_lines:
            fout.write(line)


def render_string_or_list_with_tags(old_lines, context):
    # Handle string case
    if isinstance(old_lines, str):
        for key, value in context.items():
            old_lines = old_lines.replace(r"{{" + key + r"}}", str(value))
        return old_lines

    # Handle list case
    new_lines = []
    for line in old_lines:
        for key, value in context.items():
            line = line.replace(r"{{" + key + r"}}", str(value))
        new_lines.append(line)
    return new_lines


def set_config(config, temp_dir):
    config_file = os.path.join(temp_dir, CONFIG_FILE)
    with open(config_file, "w") as output:
        json.dump(config, output)


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


def serve_files_in_background(interface, port, directory_to_serve=None, server_name=LOCALHOST_NAME):
    class HTTPHandler(SimpleHTTPRequestHandler):
        """This handler uses server.base_path instead of always using os.getcwd()"""

        def _set_headers(self):
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()

        def translate_path(self, path):
            path = SimpleHTTPRequestHandler.translate_path(self, path)
            relpath = os.path.relpath(path, os.getcwd())
            fullpath = os.path.join(self.server.base_path, relpath)
            return fullpath

        def log_message(self, format, *args):
            return

        def do_POST(self):
            # Read body of the request.

            if self.path == "/api/predict/":
                # Make the prediction.
                self._set_headers()
                data_string = self.rfile.read(
                    int(self.headers["Content-Length"]))
                msg = json.loads(data_string)
                raw_input = msg["data"]
                prediction, durations = interface.process(raw_input)

                output = {"data": prediction, "durations": durations}
                if interface.saliency is not None:
                    saliency = interface.saliency(raw_input, prediction)
                    output['saliency'] = saliency.tolist()
                # if interface.always_flag:
                #     msg = json.loads(data_string)
                #     flag_dir = os.path.join(FLAGGING_DIRECTORY, str(interface.hash))
                #     os.makedirs(flag_dir, exist_ok=True)
                #     output_flag = {'input': interface.input_interface.rebuild_flagged(flag_dir, msg['data']),
                #               'output': interface.output_interface.rebuild_flagged(flag_dir, processed_output),
                #               }
                #     with open(os.path.join(flag_dir, FLAGGING_FILENAME), 'a+') as f:
                #         f.write(json.dumps(output_flag))
                #         f.write("\n")

                # Prepare return json dictionary.
                self.wfile.write(json.dumps(output).encode())

            elif self.path == "/api/flag/":
                self._set_headers()
                data_string = self.rfile.read(
                    int(self.headers["Content-Length"]))
                msg = json.loads(data_string)
                flag_dir = os.path.join(FLAGGING_DIRECTORY,
                                        str(interface.flag_hash))
                os.makedirs(flag_dir, exist_ok=True)
                output = {'inputs': [interface.input_interfaces[
                    i].rebuild_flagged(
                    flag_dir, msg['data']['input_data']) for i
                    in range(len(interface.input_interfaces))],
                    'outputs': [interface.output_interfaces[
                        i].rebuild_flagged(
                        flag_dir, msg['data']['output_data']) for i
                    in range(len(interface.output_interfaces))],
                    'message': msg['data']['message']}

                with open(os.path.join(flag_dir, FLAGGING_FILENAME), 'a+') as f:
                    f.write(json.dumps(output))
                    f.write("\n")

            else:
                self.send_error(404, 'Path not found: {}'.format(self.path))

    class HTTPServer(BaseHTTPServer):
        """The main server, you pass in base_path which is the path you want to serve requests from"""

        def __init__(self, base_path, server_address, RequestHandlerClass=HTTPHandler):
            self.base_path = base_path
            BaseHTTPServer.__init__(self, server_address, RequestHandlerClass)

    httpd = HTTPServer(directory_to_serve, (server_name, port))

    # Now loop forever
    def serve_forever():
        # try:
        while True:
            # sys.stdout.flush()
            httpd.serve_forever()
        # except (KeyboardInterrupt, OSError):
        #     httpd.server_close()

    thread = threading.Thread(target=serve_forever, daemon=False)
    thread.start()

    return httpd


def start_simple_server(interface, directory_to_serve=None, server_name=None):
    port = get_first_available_port(
        INITIAL_PORT_VALUE, INITIAL_PORT_VALUE + TRY_NUM_PORTS
    )
    httpd = serve_files_in_background(
        interface, port, directory_to_serve, server_name)
    return port, httpd


def close_server(server):
    server.shutdown()
    server.server_close()


def url_request(url):
    try:
        req = urllib.request.Request(
            url=url, headers={"content-type": "application/json"}
        )
        res = urllib.request.urlopen(req, timeout=10)
        return res
    except Exception as e:
        raise RuntimeError(str(e))


def setup_tunnel(local_server_port):
    response = url_request(GRADIO_API_SERVER)
    if response and response.code == 200:
        try:
            payload = json.loads(response.read().decode("utf-8"))[0]
            return create_tunnel(payload, LOCALHOST_NAME, local_server_port)

        except Exception as e:
            raise RuntimeError(str(e))


def url_ok(url):
    try:
        r = requests.head(url)
        return r.status_code == 200
    except ConnectionError:
        return False