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
from gradio import networking
import tempfile
import threading
import traceback

nest_asyncio.apply()

LOCALHOST_IP = '127.0.0.1'
INITIAL_WEBSOCKET_PORT = 9200
TRY_NUM_PORTS = 100


class Interface:
    """
    The Interface class represents a general input/output interface for a machine learning model. During construction,
    the appropriate inputs and outputs
    """

    # Dictionary in which each key is a valid `model_type` argument to constructor, and the value being the description.
    VALID_MODEL_TYPES = {'sklearn': 'sklearn model', 'keras': 'Keras model', 'function': 'python function',
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
            return 'function'

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
                msg = await websocket.recv()
                processed_input = self.input_interface.preprocess(msg)
                prediction = self.predict(processed_input)
                processed_output = self.output_interface.postprocess(prediction)
                await websocket.send(str(processed_output))
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
        elif self.model_type=='function':
            return self.model_obj(preprocessed_input)
        elif self.model_type=='pytorch':
            import torch
            value = torch.from_numpy(preprocessed_input)
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

        output_directory = tempfile.mkdtemp()

        # Set up a port to serve the directory containing the static files with interface.
        server_port, httpd = networking.start_simple_server(output_directory)
        path_to_local_server = 'http://localhost:{}/'.format(server_port)
        path_to_local_interface_page = path_to_local_server + networking.TEMPLATE_TEMP
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

        is_colab = False
        try:  # Check if running interactively using ipython.
            from_ipynb = get_ipython()
            if 'google.colab' in str(from_ipynb):
                is_colab = True
        except NameError:
            pass

        if self.verbose:
            print("NOTE: Gradio is in beta stage, please report all bugs to: a12d@stanford.edu")
            if not is_colab:
                print(f"Model is running locally at: {path_to_local_interface_page}")

        if share:
            try:
                path_to_ngrok_server = networking.setup_ngrok(server_port, websocket_port, output_directory)
                path_to_ngrok_interface_page = path_to_ngrok_server + '/' + networking.TEMPLATE_TEMP
                if self.verbose:
                    print(f"Model available publicly for 8 hours at: {path_to_ngrok_interface_page}")
            except RuntimeError:
                path_to_ngrok_server = None
                if self.verbose:
                    print("Unable to create public link for interface, please check internet connection.")
        else:
            if self.verbose:
                print("To create a public link, set `share=True` in the argument to `launch()`")
            path_to_ngrok_server = None
            if is_colab:  # for a colab notebook, create a public link even if share is False.
                path_to_ngrok_server = networking.setup_ngrok(server_port, websocket_port, output_directory)
                path_to_ngrok_interface_page = path_to_ngrok_server + '/' + networking.TEMPLATE_TEMP
                print(f"Cannot display local interface on google colab, public link created at:"
                      f"{path_to_ngrok_interface_page} and displayed below.")
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
            webbrowser.open(path_to_local_interface_page)  # Open a browser tab with the interface.
        if inline:
            from IPython.display import IFrame
            if is_colab:  # Embed the remote interface page if on google colab; otherwise, embed the local page.
                display(IFrame(path_to_ngrok_interface_page, width=1000, height=500))
            else:
                display(IFrame(path_to_local_interface_page, width=1000, height=500))

        return httpd, path_to_local_server, path_to_ngrok_server
