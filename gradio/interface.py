import asyncio
import websockets
import nest_asyncio
import webbrowser
import pkg_resources
from bs4 import BeautifulSoup
from gradio import inputs
from gradio import outputs
from gradio import networking
import os
import shutil
import tempfile

nest_asyncio.apply()

LOCALHOST_IP = '127.0.0.1'
INITIAL_WEBSOCKET_PORT = 9200
TRY_NUM_PORTS = 100

BASE_TEMPLATE = pkg_resources.resource_filename('gradio', 'templates/all_io.html')
JS_PATH_LIB = pkg_resources.resource_filename('gradio', 'js/')
CSS_PATH_LIB = pkg_resources.resource_filename('gradio', 'css/')
JS_PATH_TEMP = 'js/'
CSS_PATH_TEMP = 'css/'
TEMPLATE_TEMP = 'interface.html'
BASE_JS_FILE = 'js/all-io.js'


class Interface():
    """
    """

    # Dictionary in which each key is a valid `model_type` argument to constructor, and the value being the description.
    VALID_MODEL_TYPES = {'sklearn': 'sklearn model', 'keras': 'keras model', 'function': 'python function'}

    def __init__(self, input, output, model, model_type=None, preprocessing_fn=None, postprocessing_fn=None):
        """
        :param model_type: what kind of trained model, can be 'keras' or 'sklearn'.
        :param model_obj: the model object, such as a sklearn classifier or keras model.
        :param model_params: additional model parameters.
        """
        self.input_interface = inputs.registry[input](preprocessing_fn)
        self.output_interface = outputs.registry[output](postprocessing_fn)
        self.model_obj = model
        if model_type is None:
            model_type = self._infer_model_type(model)
            if model_type is None:
                raise ValueError("model_type could not be inferred, please specify parameter `model_type`")
            else:
                print("Model type not explicitly identified, inferred to be: {}".format(
                    self.VALID_MODEL_TYPES[model_type]))
        elif not(model_type.lower() in self.VALID_MODEL_TYPES):
            ValueError('model_type must be one of: {}'.format(self.VALID_MODEL_TYPES))
        self.model_type = model_type

    def _infer_model_type(self, model):
        if callable(model):
            return 'function'

        try:
            import sklearn
            if isinstance(model, sklearn.base.BaseEstimator):
                return 'sklearn'
        except ImportError:
            pass

        try:
            import tensorflow as tf
            if isinstance(model, tf.keras.Model):
                return 'keras'
        except ImportError:
            pass

        try:
            import keras
            if isinstance(model, keras.Model):
                return 'keras'
        except ImportError:
            pass

        return None

    def _build_template(self, temp_dir):
        input_template_path = pkg_resources.resource_filename(
            'gradio', self.input_interface._get_template_path())
        output_template_path = pkg_resources.resource_filename(
            'gradio', self.output_interface._get_template_path())
        input_page = open(input_template_path)
        output_page = open(output_template_path)
        input_soup = BeautifulSoup(input_page.read(), features="html.parser")
        output_soup = BeautifulSoup(output_page.read(), features="html.parser")

        all_io_page = open(BASE_TEMPLATE)
        all_io_soup = BeautifulSoup(all_io_page.read(), features="html.parser")
        input_tag = all_io_soup.find("div", {"id": "input"})
        output_tag = all_io_soup.find("div", {"id": "output"})

        input_tag.replace_with(input_soup)
        output_tag.replace_with(output_soup)

        f = open(os.path.join(temp_dir, TEMPLATE_TEMP), "w")
        f.write(str(all_io_soup.prettify))

        self._copy_files(JS_PATH_LIB, os.path.join(temp_dir, JS_PATH_TEMP))
        self._copy_files(CSS_PATH_LIB, os.path.join(temp_dir, CSS_PATH_TEMP))
        return

    def _copy_files(self, src_dir, dest_dir):
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        src_files = os.listdir(src_dir)
        for file_name in src_files:
            full_file_name = os.path.join(src_dir, file_name)
            if os.path.isfile(full_file_name):
                shutil.copy(full_file_name, dest_dir)

    def _set_socket_url_in_js(self, temp_dir, socket_url):
        with open(os.path.join(temp_dir, BASE_JS_FILE)) as fin:
            lines = fin.readlines()
            lines[0] = 'var NGROK_URL = "{}"\n'.format(socket_url.replace('http', 'ws'))

        with open(os.path.join(temp_dir, BASE_JS_FILE), 'w') as fout:
            for line in lines:
                fout.write(line)

    def _set_socket_port_in_js(self, temp_dir, socket_port):
        with open(os.path.join(temp_dir, BASE_JS_FILE)) as fin:
            lines = fin.readlines()
            lines[1] = 'var SOCKET_PORT = {}\n'.format(socket_port)

        with open(os.path.join(temp_dir, BASE_JS_FILE), 'w') as fout:
            for line in lines:
                fout.write(line)

    def predict(self, array):
        if self.model_type=='sklearn':
            return self.model_obj.predict(array)
        elif self.model_type=='keras':
            return self.model_obj.predict(array)
        elif self.model_type=='function':
            return self.model_obj(array)
        else:
            ValueError('model_type must be one of: {}'.format(self.VALID_MODEL_TYPES))

    async def communicate(self, websocket, path):
        """
        Method that defines how this interface communicates with the websocket.
        :param websocket: a Websocket object used to communicate with the interface frontend
        :param path: ignored
        """
        while True:
            try:
                msg = await websocket.recv()
                processed_input = self.input_interface._pre_process(msg)
                prediction = self.predict(processed_input)
                processed_output = self.output_interface._post_process(prediction)
                await websocket.send(str(processed_output))
            except websockets.exceptions.ConnectionClosed:
                pass

    def launch(self, share_link=False, verbose=True):
        """
        Standard method shared by interfaces that launches a websocket at a specified IP address.
        """
        output_directory = tempfile.mkdtemp()
        server_port = networking.start_simple_server(output_directory)
        path_to_server = 'http://localhost:{}/'.format(server_port)
        self._build_template(output_directory)

        ports_in_use = networking.get_ports_in_use()
        for i in range(TRY_NUM_PORTS):
            if not ((INITIAL_WEBSOCKET_PORT + i) in ports_in_use):
                break
        else:
            raise OSError("All ports from {} to {} are in use. Please close a port.".format(
                INITIAL_WEBSOCKET_PORT, INITIAL_WEBSOCKET_PORT + TRY_NUM_PORTS))

        start_server = websockets.serve(self.communicate, LOCALHOST_IP, INITIAL_WEBSOCKET_PORT + i)
        self._set_socket_port_in_js(output_directory, INITIAL_WEBSOCKET_PORT + i)
        if verbose:
            print("NOTE: Gradio is in beta stage, please report all bugs to: a12d@stanford.edu")
            print("Model available locally at: {}".format(path_to_server + TEMPLATE_TEMP))

        if share_link:
            networking.kill_processes([4040, 4041])
            site_ngrok_url = networking.setup_ngrok(server_port)
            socket_ngrok_url = networking.setup_ngrok(INITIAL_WEBSOCKET_PORT, api_url=networking.NGROK_TUNNELS_API_URL2)
            self._set_socket_url_in_js(output_directory, socket_ngrok_url)
            if verbose:
                print("Model available publicly for 8 hours at: {}".format(site_ngrok_url + '/' + TEMPLATE_TEMP))
        else:
            if verbose:
                print("To create a public link, set `share_link=True` in the argument to `launch()`")
        asyncio.get_event_loop().run_until_complete(start_server)
        try:
            asyncio.get_event_loop().run_forever()
        except RuntimeError:  # Runtime errors are thrown in jupyter notebooks because of async.
            pass

        webbrowser.open(path_to_server + TEMPLATE_TEMP)
