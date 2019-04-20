"""
Defines helper methods useful for setting up ports, launching servers, and handling `ngrok`
"""

import os
import socket
import threading
from http.server import HTTPServer as BaseHTTPServer, SimpleHTTPRequestHandler
import pkg_resources
from bs4 import BeautifulSoup
from distutils import dir_util
from gradio import inputs, outputs
import json
from gradio.tunneling import create_tunnel
import urllib.request
from shutil import copyfile


INITIAL_PORT_VALUE = (
    7860
)  # The http server will try to open on port 7860. If not available, 7861, 7862, etc.
TRY_NUM_PORTS = (
    100
)  # Number of ports to try before giving up and throwing an exception.
LOCALHOST_NAME = "localhost"
GRADIO_API_SERVER = "https://api.gradio.app/v1/tunnel-request"

BASE_TEMPLATE = pkg_resources.resource_filename(
    "gradio", "templates/base_template.html"
)
STATIC_PATH_LIB = pkg_resources.resource_filename("gradio", "static/")
STATIC_PATH_TEMP = "static/"
TEMPLATE_TEMP = "index.html"
BASE_JS_FILE = "static/js/all_io.js"
CONFIG_FILE = "static/config.json"

ASSOCIATION_PATH_IN_STATIC = "static/apple-app-site-association"
ASSOCIATION_PATH_IN_ROOT = "apple-app-site-association"

FLAGGING_DIRECTORY = 'gradio-flagged/{}'
FLAGGING_FILENAME = 'gradio-flagged.txt'


def build_template(temp_dir, input_interface, output_interface):
    """
    Builds a complete HTML template with supporting JS and CSS files in a given directory.
    :param temp_dir: string with path to temp directory in which the template should be built
    :param input_interface: an AbstractInput object which includes is used to get the input template
    :param output_interface: an AbstractInput object which includes is used to get the input template
    """
    input_template_path = pkg_resources.resource_filename(
        "gradio",
        inputs.BASE_INPUT_INTERFACE_TEMPLATE_PATH.format(input_interface.get_name()),
    )
    output_template_path = pkg_resources.resource_filename(
        "gradio",
        outputs.BASE_OUTPUT_INTERFACE_TEMPLATE_PATH.format(output_interface.get_name()),
    )
    input_page = open(input_template_path)
    output_page = open(output_template_path)
    input_soup = BeautifulSoup(
        render_string_or_list_with_tags(
            input_page.read(), input_interface.get_template_context()
        ),
        features="html.parser",
    )
    output_soup = BeautifulSoup(
        render_string_or_list_with_tags(
            output_page.read(), output_interface.get_template_context()
        ),
        features="html.parser",
    )

    all_io_page = open(BASE_TEMPLATE)
    all_io_soup = BeautifulSoup(all_io_page.read(), features="html.parser")
    input_tag = all_io_soup.find("div", {"id": "input"})
    output_tag = all_io_soup.find("div", {"id": "output"})

    # input_tag.replace_with(input_soup)
    # output_tag.replace_with(output_soup)

    f = open(os.path.join(temp_dir, TEMPLATE_TEMP), "w")
    f.write(str(all_io_soup))

    copy_files(STATIC_PATH_LIB, os.path.join(temp_dir, STATIC_PATH_TEMP))
    # Move association file to root of temporary directory.
    copyfile(os.path.join(temp_dir, ASSOCIATION_PATH_IN_STATIC),
             os.path.join(temp_dir, ASSOCIATION_PATH_IN_ROOT))

    render_template_with_tags(
        os.path.join(
            temp_dir,
            inputs.BASE_INPUT_INTERFACE_JS_PATH.format(input_interface.get_name()),
        ),
        input_interface.get_js_context(),
    )
    render_template_with_tags(
        os.path.join(
            temp_dir,
            outputs.BASE_OUTPUT_INTERFACE_JS_PATH.format(output_interface.get_name()),
        ),
        output_interface.get_js_context(),
    )


def copy_files(src_dir, dest_dir):
    """
    Copies all the files from one directory to another
    :param src_dir: string path to source directory
    :param dest_dir: string path to destination directory
    """
    dir_util.copy_tree(src_dir, dest_dir)


def render_template_with_tags(template_path, context):
    """
    Combines the given template with a given context dictionary by replacing all of the occurrences of tags (enclosed
    in double curly braces) with corresponding values.
    :param template_path: a string with the path to the template file
    :param context: a dictionary whose string keys are the tags to replace and whose string values are the replacements.
    """
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


def set_interface_types_in_config_file(temp_dir, input_interface, output_interface):
    config_file = os.path.join(temp_dir, CONFIG_FILE)
    render_template_with_tags(
        config_file,
        {
            "input_interface_type": input_interface,
            "output_interface_type": output_interface,
        },
    )


def set_share_url_in_config_file(temp_dir, share_url):
    config_file = os.path.join(temp_dir, CONFIG_FILE)
    render_template_with_tags(
        config_file,
        {
            "share_url": share_url,
        },
    )


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


def serve_files_in_background(interface, port, directory_to_serve=None):
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
                data_string = self.rfile.read(int(self.headers["Content-Length"]))
                msg = json.loads(data_string)
                processed_input = interface.input_interface.preprocess(msg["data"])
                prediction = interface.predict(processed_input)
                processed_output = interface.output_interface.postprocess(prediction)
                output = {"action": "output", "data": processed_output}

                # Prepare return json dictionary.
                self.wfile.write(json.dumps(output).encode())

            elif self.path == "/api/flag/":
                self._set_headers()
                data_string = self.rfile.read(int(self.headers["Content-Length"]))
                msg = json.loads(data_string)
                flag_dir = FLAGGING_DIRECTORY.format(interface.hash)
                os.makedirs(flag_dir, exist_ok=True)
                dict = {'input': interface.input_interface.rebuild_flagged(flag_dir, msg),
                        'output': interface.output_interface.rebuild_flagged(flag_dir, msg),
                        'message': msg['data']['message']}
                with open(os.path.join(flag_dir, FLAGGING_FILENAME), 'a+') as f:
                    f.write(json.dumps(dict))
                    f.write("\n")

            else:
                self.send_error(404, 'Path not found: %s' % self.path)

    class HTTPServer(BaseHTTPServer):
        """The main server, you pass in base_path which is the path you want to serve requests from"""

        def __init__(self, base_path, server_address, RequestHandlerClass=HTTPHandler):
            self.base_path = base_path
            BaseHTTPServer.__init__(self, server_address, RequestHandlerClass)

    httpd = HTTPServer(directory_to_serve, (LOCALHOST_NAME, port))

    # Now loop forever
    def serve_forever():
        # try:
        while True:
            # sys.stdout.flush()
            httpd.serve_forever()
        # except (KeyboardInterrupt, OSError):
        #     httpd.server_close()

    thread = threading.Thread(target=serve_forever, daemon=True)
    thread.start()

    return httpd


def start_simple_server(interface, directory_to_serve=None):
    port = get_first_available_port(
        INITIAL_PORT_VALUE, INITIAL_PORT_VALUE + TRY_NUM_PORTS
    )
    httpd = serve_files_in_background(interface, port, directory_to_serve)
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
