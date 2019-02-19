import asyncio
import websockets
import nest_asyncio
import webbrowser
from bs4 import BeautifulSoup
import inputs
import outputs
import networking

nest_asyncio.apply()

LOCALHOST_IP = '127.0.0.1'
INITIAL_WEBSOCKET_PORT = 9200


class Interface():
    """
    """
    build_template_path = 'templates/tmp_html.html'

    def __init__(self, input, output, model, model_type, preprocessing_fn=None, postprocessing_fn=None):
        """
        :param model_type: what kind of trained model, can be 'keras' or 'sklearn'.
        :param model_obj: the model object, such as a sklearn classifier or keras model.
        :param model_params: additional model parameters.
        """
        self.input_interface = inputs.registry[input](preprocessing_fn)
        self.output_interface = outputs.registry[output](postprocessing_fn)
        self.model_type = model_type
        self.model_obj = model

    def _build_template(self):
        input_template_path = self.input_interface._get_template_path()
        output_template_path = self.output_interface._get_template_path()
        input_page = open(input_template_path)
        output_page = open(output_template_path)
        input_soup = BeautifulSoup(input_page.read(), features="html.parser")
        output_soup = BeautifulSoup(output_page.read(), features="html.parser")

        all_io_url = 'templates/all_io.html'
        all_io_page = open(all_io_url)
        all_io_soup = BeautifulSoup(all_io_page.read(), features="html.parser")
        input_tag = all_io_soup.find("div", {"id": "input"})
        output_tag = all_io_soup.find("div", {"id": "output"})

        input_tag.replace_with(input_soup)
        output_tag.replace_with(output_soup)

        f = open(self.build_template_path, "w")
        f.write(str(all_io_soup.prettify))
        return self.build_template_path

    def _set_socket_url_in_js(self, socket_url):
        with open('js/all-io.js') as fin:
            lines = fin.readlines()
            lines[0] = 'var NGROK_URL = "{}"\n'.format(socket_url.replace('http', 'ws'))

        with open('js/all-io.js', 'w') as fout:
            for line in lines:
                fout.write(line)

    def predict(self, array):
        if self.model_type=='sklearn':
            return self.model_obj.predict(array)[0]
        elif self.model_type=='keras':
            return self.model_obj.predict(array)[0].argmax()
        elif self.model_type=='func':
            return self.model_obj(array)
        else:
            raise ValueError('model_type must be one of: "sklearn" or "keras" or "func".')

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

    def launch(self, share_link=True):
        """
        Standard method shared by interfaces that launches a websocket at a specified IP address.
        """
        server_port = networking.start_simple_server()
        path_to_server = 'http://localhost:{}/'.format(server_port)
        path_to_template = self._build_template()

        try:
            start_server = websockets.serve(self.communicate, LOCALHOST_IP, INITIAL_WEBSOCKET_PORT)
        except OSError:
            print("Error: port 9200 is already taken. Please close the process running on 9200 "
                  "and try running gradio again.")  # TODO(abidlabs): increment port number until free port is found

        print("Model available locally at: {}".format(path_to_server + path_to_template))

        if share_link:
            site_ngrok_url = networking.setup_ngrok(server_port)
            socket_ngrok_url = networking.setup_ngrok(INITIAL_WEBSOCKET_PORT, api_url=networking.NGROK_TUNNELS_API_URL2)
            print(socket_ngrok_url)
            self._set_socket_url_in_js(socket_ngrok_url)
            print("Model available publicly for 8 hours at: {}".format(site_ngrok_url + '/' + path_to_template))
            print("-- Gradio is in beta stage --")
            print("Please report all bugs to: a12d@stanford.edu")
            print("If you'd like to launch another gradio instance, please restart your notebook/python kernel.")
        asyncio.get_event_loop().run_until_complete(start_server)
        try:
            asyncio.get_event_loop().run_forever()
        except RuntimeError:  # Runtime errors are thrown in jupyter notebooks because of async.
            pass

        webbrowser.open(path_to_server + path_to_template)
