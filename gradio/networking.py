'''
Defines helper methods useful for setting up ports, launching servers, and handling `ngrok`
'''

import subprocess
import requests
import zipfile
import io
import sys
import os
import socket
from psutil import process_iter, AccessDenied, NoSuchProcess
from signal import SIGTERM  # or SIGKILL
import threading
from http.server import HTTPServer as BaseHTTPServer, SimpleHTTPRequestHandler
import stat
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import pkg_resources
from bs4 import BeautifulSoup
from distutils import dir_util
from gradio import inputs, outputs

INITIAL_PORT_VALUE = 7860  # The http server will try to open on port 7860. If not available, 7861, 7862, etc.
TRY_NUM_PORTS = 100  # Number of ports to try before giving up and throwing an exception.
LOCALHOST_NAME = 'localhost'
NGROK_TUNNELS_API_URL = "http://localhost:4040/api/tunnels"  # TODO(this should be captured from output)
NGROK_TUNNELS_API_URL2 = "http://localhost:4041/api/tunnels"  # TODO(this should be captured from output)


BASE_TEMPLATE = pkg_resources.resource_filename('gradio', 'templates/base_template.html')
STATIC_PATH_LIB = pkg_resources.resource_filename('gradio', 'static/')
STATIC_PATH_TEMP = 'static/'
TEMPLATE_TEMP = 'index.html'
BASE_JS_FILE = 'static/js/all-io.js'
CONFIG_FILE = 'static/config.json'


NGROK_ZIP_URLS = {
    "linux": "https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip",
    "darwin": "https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-darwin-amd64.zip",
    "win32": "https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-windows-amd64.zip",
}


def build_template(temp_dir, input_interface, output_interface):
    """
    Builds a complete HTML template with supporting JS and CSS files in a given directory.
    :param temp_dir: string with path to temp directory in which the template should be built
    :param input_interface: an AbstractInput object which includes is used to get the input template
    :param output_interface: an AbstractInput object which includes is used to get the input template
    """
    input_template_path = pkg_resources.resource_filename(
        'gradio', inputs.BASE_INPUT_INTERFACE_TEMPLATE_PATH.format(input_interface.get_name()))
    output_template_path = pkg_resources.resource_filename(
        'gradio', outputs.BASE_OUTPUT_INTERFACE_TEMPLATE_PATH.format(output_interface.get_name()))
    input_page = open(input_template_path)
    output_page = open(output_template_path)
    input_soup = BeautifulSoup(render_string_or_list_with_tags(
        input_page.read(), input_interface.get_template_context()), features="html.parser")
    output_soup = BeautifulSoup(
        render_string_or_list_with_tags(
            output_page.read(), output_interface.get_template_context()), features="html.parser")

    all_io_page = open(BASE_TEMPLATE)
    all_io_soup = BeautifulSoup(all_io_page.read(), features="html.parser")
    input_tag = all_io_soup.find("div", {"id": "input"})
    output_tag = all_io_soup.find("div", {"id": "output"})

    input_tag.replace_with(input_soup)
    output_tag.replace_with(output_soup)

    f = open(os.path.join(temp_dir, TEMPLATE_TEMP), "w")
    f.write(str(all_io_soup))

    copy_files(STATIC_PATH_LIB, os.path.join(temp_dir, STATIC_PATH_TEMP))
    render_template_with_tags(os.path.join(
        temp_dir, inputs.BASE_INPUT_INTERFACE_JS_PATH.format(input_interface.get_name())),
        input_interface.get_js_context())
    render_template_with_tags(os.path.join(
        temp_dir, outputs.BASE_OUTPUT_INTERFACE_JS_PATH.format(output_interface.get_name())),
        output_interface.get_js_context())


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
    with open(template_path, 'w') as fout:
        for line in new_lines:
            fout.write(line)


def render_string_or_list_with_tags(old_lines, context):
    # Handle string case
    if isinstance(old_lines, str):
        for key, value in context.items():
            old_lines = old_lines.replace(r'{{' + key + r'}}', str(value))
        return old_lines

    # Handle list case
    new_lines = []
    for line in old_lines:
        for key, value in context.items():
            line = line.replace(r'{{' + key + r'}}', str(value))
        new_lines.append(line)
    return new_lines


#TODO(abidlabs): Handle the http vs. https issue that sometimes happens (a ws cannot be loaded from an https page)
def set_ngrok_url_in_js(temp_dir, ngrok_socket_url):
    ngrok_socket_url = ngrok_socket_url.replace('http', 'ws')
    js_file = os.path.join(temp_dir, BASE_JS_FILE)
    render_template_with_tags(js_file, {'ngrok_socket_url': ngrok_socket_url})
    config_file = os.path.join(temp_dir, CONFIG_FILE)
    render_template_with_tags(config_file, {'ngrok_socket_url': ngrok_socket_url})


def set_socket_port_in_js(temp_dir, socket_port):
    js_file = os.path.join(temp_dir, BASE_JS_FILE)
    render_template_with_tags(js_file, {'socket_port': str(socket_port)})


def set_interface_types_in_config_file(temp_dir, input_interface, output_interface):
    config_file = os.path.join(temp_dir, CONFIG_FILE)
    render_template_with_tags(config_file, {'input_interface_type': input_interface,
                                            'output_interface_type': output_interface})


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
    raise OSError("All ports from {} to {} are in use. Please close a port.".format(initial, final))


def serve_files_in_background(port, directory_to_serve=None):
    class HTTPHandler(SimpleHTTPRequestHandler):
        """This handler uses server.base_path instead of always using os.getcwd()"""

        def translate_path(self, path):
            path = SimpleHTTPRequestHandler.translate_path(self, path)
            relpath = os.path.relpath(path, os.getcwd())
            fullpath = os.path.join(self.server.base_path, relpath)
            return fullpath

        def log_message(self, format, *args):
            return

    class HTTPServer(BaseHTTPServer):
        """The main server, you pass in base_path which is the path you want to serve requests from"""

        def __init__(self, base_path, server_address, RequestHandlerClass=HTTPHandler):
            self.base_path = base_path
            BaseHTTPServer.__init__(self, server_address, RequestHandlerClass)

    httpd = HTTPServer(directory_to_serve, (LOCALHOST_NAME, port))

    # Now loop forever
    def serve_forever():
        try:
            while True:
                # sys.stdout.flush()
                httpd.serve_forever()
        except (KeyboardInterrupt, OSError):
            httpd.server_close()

    thread = threading.Thread(target=serve_forever, daemon=True)
    thread.start()

    return httpd


def start_simple_server(directory_to_serve=None):
    port = get_first_available_port(INITIAL_PORT_VALUE, INITIAL_PORT_VALUE + TRY_NUM_PORTS)
    httpd = serve_files_in_background(port, directory_to_serve)
    return port, httpd


def close_server(server):
    server.shutdown()
    server.server_close()


def download_ngrok():
    try:
        zip_file_url = NGROK_ZIP_URLS[sys.platform]
    except KeyError:
        print("Sorry, we don't currently support your operating system, please leave us a note on GitHub, and "
              "we'll look into it!")
        return
    r = requests.get(zip_file_url)
    z = zipfile.ZipFile(io.BytesIO(r.content))
    z.extractall()
    if sys.platform == 'darwin' or sys.platform == 'linux':
        st = os.stat('ngrok')
        os.chmod('ngrok', st.st_mode | stat.S_IEXEC)


def create_ngrok_tunnel(local_port, api_url):
    if not(os.path.isfile('ngrok.exe') or os.path.isfile('ngrok')):
        download_ngrok()
    if sys.platform == 'win32':
        subprocess.Popen(['ngrok', 'http', str(local_port)])
    else:
        subprocess.Popen(['./ngrok', 'http', str(local_port)])
    session = requests.Session()
    retry = Retry(connect=3, backoff_factor=0.5)
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    r = session.get(api_url)
    for tunnel in r.json()['tunnels']:
        if '{}:'.format(LOCALHOST_NAME) + str(local_port) in tunnel['config']['addr']:
            return tunnel['public_url']
    raise RuntimeError("Not able to retrieve ngrok public URL")


def setup_ngrok(server_port, websocket_port, output_directory):
    kill_processes([4040, 4041])  #TODO(abidlabs): better way to do this
    site_ngrok_url = create_ngrok_tunnel(server_port, NGROK_TUNNELS_API_URL)
    socket_ngrok_url = create_ngrok_tunnel(websocket_port, NGROK_TUNNELS_API_URL2)
    set_ngrok_url_in_js(output_directory, socket_ngrok_url)
    return site_ngrok_url


def kill_processes(process_ids):  #TODO(abidlabs): remove this, we shouldn't need to kill
    for proc in process_iter():
        try:
            for conns in proc.connections(kind='inet'):
                if conns.laddr.port in process_ids:
                        proc.send_signal(SIGTERM)  # or SIGKILL
        except (AccessDenied, NoSuchProcess):
            pass


