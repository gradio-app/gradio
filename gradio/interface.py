'''
This is the core file in the `gradio` package, and defines the Interface class, including methods for constructing the
interface using the input and output types.
'''

import asyncio
import websockets
import nest_asyncio
import webbrowser
import gradio.inputs
import gradio.outputs
from gradio import networking, strings, inputs
import tempfile
import threading
import traceback
import urllib
import json
import os
import errno


nest_asyncio.apply()

LOCALHOST_IP = '127.0.0.1'
SHARE_LINK_FORMAT = 'https://{}.gradio.app/'
INITIAL_WEBSOCKET_PORT = 9200
TRY_NUM_PORTS = 100


class Interface:
    """
    The Interface class represents a general input/output interface for a machine learning model. During construction,
    the appropriate inputs and outputs
    """

    # Dictionary in which each key is a valid `model_type` argument to constructor, and the value being the description.
    VALID_MODEL_TYPES = {'sklearn': 'sklearn model', 'keras': 'Keras model', 'pyfunc': 'python function',
                         'pytorch': 'PyTorch model'}
    STATUS_TYPES = {'OFF': 'off', 'RUNNING': 'running'}

    def __init__(self, inputs, outputs, model, model_type=None, preprocessing_fns=None, postprocessing_fns=None,
                 verbose=True):
        """
        :param inputs: a string or `AbstractInput` representing the input interface.
        :param outputs: a string or `AbstractOutput` representing the output interface.
        :param model: the model object, such as a sklearn classifier or keras model.
        :param model_type: what kind of trained model, can be 'keras' or 'sklearn' or 'function'. Inferred if not
            provided.
        :param preprocessing_fns: an optional function that overrides the preprocessing function of the input interface.
        :param postprocessing_fns: an optional function that overrides the postprocessing fn of the output interface.
        """
        if isinstance(inputs, str):
            self.input_interface = gradio.inputs.registry[inputs.lower()](preprocessing_fns)
        elif isinstance(inputs, gradio.inputs.AbstractInput):
            self.input_interface = inputs
        else:
            raise ValueError('Input interface must be of type `str` or `AbstractInput`')
        if isinstance(outputs, str):
            self.output_interface = gradio.outputs.registry[outputs.lower()](postprocessing_fns)
        elif isinstance(outputs, gradio.outputs.AbstractOutput):
            self.output_interface = outputs
        else:
            raise ValueError('Output interface must be of type `str` or `AbstractOutput`')
        self.model_obj = model
        if model_type is None:
            model_type = self._infer_model_type(model)
            if verbose:
                print("Model type not explicitly identified, inferred to be: {}".format(
                        self.VALID_MODEL_TYPES[model_type]))
        elif not(model_type.lower() in self.VALID_MODEL_TYPES):
            ValueError('model_type must be one of: {}'.format(self.VALID_MODEL_TYPES))
        self.model_type = model_type
        self.verbose = verbose
        self.status = self.STATUS_TYPES['OFF']
        self.validate_flag = False
        self.simple_server = None
        self.ngrok_api_ports = None

    @staticmethod
    def _infer_model_type(model):
        """ Helper method that attempts to identify the type of trained ML model."""
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

        if callable(model):
            return 'pyfunc'

        raise ValueError("model_type could not be inferred, please specify parameter `model_type`")

    async def communicate(self, websocket, path):
        """
        Method that defines how this interface should communicates with the websocket. (1) When an input is received by
        the websocket, it is passed into the input interface and preprocssed. (2) Then the model is called to make a
        prediction. (3) Finally, the prediction is postprocessed to get something to be displayed by the output.
        :param websocket: a Websocket server used to communicate with the interface frontend
        :param path: not used, but required for compliance with websocket library
        """
        while True:
            try:
                msg = json.loads(await websocket.recv())
                if msg['action'] == 'input':
                    processed_input = self.input_interface.preprocess(msg['data'])
                    prediction = self.predict(processed_input)
                    processed_output = self.output_interface.postprocess(prediction)
                    output = {
                    'action': 'output',
                    'data': processed_output,
                    }
                    await websocket.send(json.dumps(output))
                if msg['action'] == 'flag':
                    if not os.path.exists(os.path.dirname('gradio-flagged/')):
                        try:
                            os.makedirs(os.path.dirname('gradio-flagged/'))
                        except OSError as exc: # Guard against race condition
                            if exc.errno != errno.EEXIST:
                                raise
                    f = open('gradio-flagged/gradio-flagged.txt','a+')
                    f.write(str(msg['data']))
                    f.close()
                    inp = msg['data']['input']
                    self.input_interface.rebuild_flagged(inp)

            except websockets.exceptions.ConnectionClosed:
                pass
            # except Exception as e:
            #     print(e)

    def predict(self, preprocessed_input):
        """
        Method that calls the relevant method of the model object to make a prediction.
        :param preprocessed_input: the preprocessed input returned by the input interface
        """
        if self.model_type=='sklearn':
            return self.model_obj.predict(preprocessed_input)
        elif self.model_type=='keras':
            return self.model_obj.predict(preprocessed_input)
        elif self.model_type=='pyfunc':
            return self.model_obj(preprocessed_input)
        elif self.model_type=='pytorch':
            import torch
            print(preprocessed_input.dtype)
            value = torch.from_numpy(preprocessed_input)
            print(value.dtype)
            value = torch.autograd.Variable(value)
            prediction = self.model_obj(value)
            return prediction.data.numpy()
        else:
            ValueError('model_type must be one of: {}'.format(self.VALID_MODEL_TYPES))

    def validate(self):
        if self.validate_flag:
            if self.verbose:
                print("Interface already validated")
            return
        validation_inputs = self.input_interface.get_validation_inputs()
        n = len(validation_inputs)
        if n == 0:
            self.validate_flag = True
            if self.verbose:
                print("No validation samples for this interface... skipping validation.")
            return
        for m, msg in enumerate(validation_inputs):
            if self.verbose:
                print(f"Validating samples: {m+1}/{n}  [" + "="*(m+1) + "."*(n-m-1) + "]", end='\r')
            try:
                processed_input = self.input_interface.preprocess(msg)
                prediction = self.predict(processed_input)
            except Exception as e:
                if self.verbose:
                    print("\n----------")
                    print("Validation failed, likely due to incompatible pre-processing and model input. See below:\n")
                    print(traceback.format_exc())
                break
            try:
                _ = self.output_interface.postprocess(prediction)
            except Exception as e:
                if self.verbose:
                    print("\n----------")
                    print("Validation failed, likely due to incompatible model output and post-processing."
                          "See below:\n")
                    print(traceback.format_exc())
                break
        else:  # This means if a break was not explicitly called
            self.validate_flag = True
            if self.verbose:
                print("\n\nValidation passed successfully!")
            return
        raise RuntimeError("Validation did not pass")

    def launch(self, inline=None, inbrowser=None, share=False, validate=True):
        """
        Standard method shared by interfaces that creates the interface and sets up a websocket to communicate with it.
        :param inline: boolean. If True, then a gradio interface is created inline (e.g. in jupyter or colab notebook)
        :param inbrowser: boolean. If True, then a new browser window opens with the gradio interface.
        :param share: boolean. If True, then a share link is generated using ngrok is displayed to the user.
        :param validate: boolean. If True, then the validation is run if the interface has not already been validated.
        """
        if validate and not self.validate_flag:
            self.validate()

        # If an existing interface is running with this instance, close it.
        if self.status == self.STATUS_TYPES['RUNNING']:
            if self.verbose:
                print("Closing existing server...")
            if self.simple_server is not None:
                try:
                    networking.close_server(self.simple_server)
                except OSError:
                    pass

        output_directory = tempfile.mkdtemp()
        # Set up a port to serve the directory containing the static files with interface.
        server_port, httpd = networking.start_simple_server(output_directory)
        path_to_local_server = 'http://localhost:{}/'.format(server_port)
        networking.build_template(output_directory, self.input_interface, self.output_interface)

        # Set up a port to serve a websocket that sets up the communication between the front-end and model.
        websocket_port = networking.get_first_available_port(
            INITIAL_WEBSOCKET_PORT, INITIAL_WEBSOCKET_PORT + TRY_NUM_PORTS)
        start_server = websockets.serve(self.communicate, LOCALHOST_IP, websocket_port)
        networking.set_socket_port_in_js(output_directory, websocket_port)  # sets the websocket port in the JS file.
        networking.set_interface_types_in_config_file(output_directory,
                                                      self.input_interface.__class__.__name__.lower(),
                                                      self.output_interface.__class__.__name__.lower())
        self.status = self.STATUS_TYPES['RUNNING']
        self.simple_server = httpd

        is_colab = False
        try:  # Check if running interactively using ipython.
            from_ipynb = get_ipython()
            if 'google.colab' in str(from_ipynb):
                is_colab = True
        except NameError:
            pass

        if self.verbose:
            print(strings.en["BETA_MESSAGE"])
            if not is_colab:
                print(strings.en["RUNNING_LOCALLY"].format(path_to_local_server))
        if share:
            try:
                path_to_ngrok_server, ngrok_api_ports = networking.setup_ngrok(
                    server_port, websocket_port, output_directory, self.ngrok_api_ports)
                self.ngrok_api_ports = ngrok_api_ports
            except RuntimeError:
                path_to_ngrok_server = None
                if self.verbose:
                    print(strings.en["NGROK_NO_INTERNET"])
        else:
            if is_colab:  # For a colab notebook, create a public link even if share is False.
                path_to_ngrok_server, ngrok_api_ports = networking.setup_ngrok(
                    server_port, websocket_port, output_directory, self.ngrok_api_ports)
                self.ngrok_api_ports = ngrok_api_ports
                if self.verbose:
                    print(strings.en["COLAB_NO_LOCAL"])
            else:  # If it's not a colab notebook and share=False, print a message telling them about the share option.
                if self.verbose:
                    print(strings.en["PUBLIC_SHARE_TRUE"])
                path_to_ngrok_server = None

        if path_to_ngrok_server is not None:
            url = urllib.parse.urlparse(path_to_ngrok_server)
            subdomain = url.hostname.split('.')[0]
            path_to_ngrok_interface_page = SHARE_LINK_FORMAT.format(subdomain)
            if self.verbose:
                print(strings.en["MODEL_PUBLICLY_AVAILABLE_URL"].format(path_to_ngrok_interface_page))

        # Keep the server running in the background.
        asyncio.get_event_loop().run_until_complete(start_server)
        try:
            _ = get_ipython()
        except NameError:  # Runtime errors are thrown in jupyter notebooks because of async.
            t = threading.Thread(target=asyncio.get_event_loop().run_forever, daemon=True)
            t.start()

        if inline is None:
            try:  # Check if running interactively using ipython.
                get_ipython()
                inline = True
                if inbrowser is None:
                    inbrowser = False
            except NameError:
                inline = False
                if inbrowser is None:
                    inbrowser = True
        else:
            if inbrowser is None:
                inbrowser = False

        if inbrowser and not is_colab:
            webbrowser.open(path_to_local_server)  # Open a browser tab with the interface.
        if inline:
            from IPython.display import IFrame
            if is_colab:  # Embed the remote interface page if on google colab; otherwise, embed the local page.
                display(IFrame(path_to_ngrok_interface_page, width=1000, height=500))
            else:
                display(IFrame(path_to_local_server, width=1000, height=500))

        return httpd, path_to_local_server, path_to_ngrok_server
