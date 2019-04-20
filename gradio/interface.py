"""
This is the core file in the `gradio` package, and defines the Interface class, including methods for constructing the
interface using the input and output types.
"""

import tempfile
import traceback
import webbrowser

import gradio.inputs
import gradio.outputs
from gradio import networking, strings
from distutils.version import StrictVersion
import pkg_resources
import requests
import random
import time

LOCALHOST_IP = "127.0.0.1"
TRY_NUM_PORTS = 100
PKG_VERSION_URL = "https://gradio.app/api/pkg-version"


class Interface:
    """
    The Interface class represents a general input/output interface for a machine learning model. During construction,
    the appropriate inputs and outputs
    """

    # Dictionary in which each key is a valid `model_type` argument to constructor, and the value being the description.
    VALID_MODEL_TYPES = {
        "sklearn": "sklearn model",
        "keras": "Keras model",
        "pyfunc": "python function",
        "pytorch": "PyTorch model",
    }
    STATUS_TYPES = {"OFF": "off", "RUNNING": "running"}

    def __init__(
        self,
        inputs,
        outputs,
        model,
        model_type=None,
        preprocessing_fns=None,
        postprocessing_fns=None,
        verbose=True,
    ):
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
            self.input_interface = gradio.inputs.registry[inputs.lower()](
                preprocessing_fns
            )
        elif isinstance(inputs, gradio.inputs.AbstractInput):
            self.input_interface = inputs
        else:
            raise ValueError("Input interface must be of type `str` or `AbstractInput`")
        if isinstance(outputs, str):
            self.output_interface = gradio.outputs.registry[outputs.lower()](
                postprocessing_fns
            )
        elif isinstance(outputs, gradio.outputs.AbstractOutput):
            self.output_interface = outputs
        else:
            raise ValueError(
                "Output interface must be of type `str` or `AbstractOutput`"
            )
        self.model_obj = model
        if model_type is None:
            model_type = self._infer_model_type(model)
            if verbose:
                print(
                    "Model type not explicitly identified, inferred to be: {}".format(
                        self.VALID_MODEL_TYPES[model_type]
                    )
                )
        elif not (model_type.lower() in self.VALID_MODEL_TYPES):
            ValueError("model_type must be one of: {}".format(self.VALID_MODEL_TYPES))
        self.model_type = model_type
        if self.model_type == "keras":
            import tensorflow as tf
            self.graph = tf.get_default_graph()
            self.sess = tf.keras.backend.get_session()
        self.verbose = verbose
        self.status = self.STATUS_TYPES["OFF"]
        self.validate_flag = False
        self.simple_server = None
        self.hash = random.getrandbits(32)

    @staticmethod
    def _infer_model_type(model):
        """ Helper method that attempts to identify the type of trained ML model."""
        try:
            import sklearn

            if isinstance(model, sklearn.base.BaseEstimator):
                return "sklearn"
        except ImportError:
            pass

        try:
            import tensorflow as tf

            if isinstance(model, tf.keras.Model):
                return "keras"
        except ImportError:
            pass

        try:
            import keras

            if isinstance(model, keras.Model):
                return "keras"
        except ImportError:
            pass

        if callable(model):
            return 'pyfunc'

        raise ValueError("model_type could not be inferred, please specify parameter `model_type`")

    def predict(self, preprocessed_input):
        """
        Method that calls the relevant method of the model object to make a prediction.
        :param preprocessed_input: the preprocessed input returned by the input interface
        """
        if self.model_type == "sklearn":
            return self.model_obj.predict(preprocessed_input)
        elif self.model_type == "keras":
            import tensorflow as tf
            with self.graph.as_default():
                with self.sess.as_default():
                    return self.model_obj.predict(preprocessed_input)
        elif self.model_type == "pyfunc":
            return self.model_obj(preprocessed_input)
        elif self.model_type == "pytorch":
            import torch
            value = torch.from_numpy(preprocessed_input)
            value = torch.autograd.Variable(value)
            prediction = self.model_obj(value)
            return prediction.data.numpy()
        else:
            ValueError("model_type must be one of: {}".format(self.VALID_MODEL_TYPES))

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
                print(
                    "No validation samples for this interface... skipping validation."
                )
            return
        for m, msg in enumerate(validation_inputs):
            if self.verbose:
                print(
                    f"Validating samples: {m+1}/{n}  ["
                    + "=" * (m + 1)
                    + "." * (n - m - 1)
                    + "]",
                    end="\r",
                )
            try:
                processed_input = self.input_interface.preprocess(msg)
                prediction = self.predict(processed_input)
            except Exception as e:
                if self.verbose:
                    print("\n----------")
                    print(
                        "Validation failed, likely due to incompatible pre-processing and model input. See below:\n"
                    )
                    print(traceback.format_exc())
                break
            try:
                _ = self.output_interface.postprocess(prediction)
            except Exception as e:
                if self.verbose:
                    print("\n----------")
                    print(
                        "Validation failed, likely due to incompatible model output and post-processing."
                        "See below:\n"
                    )
                    print(traceback.format_exc())
                break
        else:  # This means if a break was not explicitly called
            self.validate_flag = True
            if self.verbose:
                print("\n\nValidation passed successfully!")
            return
        raise RuntimeError("Validation did not pass")

    def launch(self, inline=None, inbrowser=None, share=True, validate=True):
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
        if self.status == self.STATUS_TYPES["RUNNING"]:
            if self.verbose:
                print("Closing existing server...")
            if self.simple_server is not None:
                try:
                    networking.close_server(self.simple_server)
                except OSError:
                    pass

        output_directory = tempfile.mkdtemp()
        # Set up a port to serve the directory containing the static files with interface.
        server_port, httpd = networking.start_simple_server(self, output_directory)
        path_to_local_server = "http://localhost:{}/".format(server_port)
        networking.build_template(
            output_directory, self.input_interface, self.output_interface
        )

        networking.set_interface_types_in_config_file(
            output_directory,
            self.input_interface.__class__.__name__.lower(),
            self.output_interface.__class__.__name__.lower(),
        )
        self.status = self.STATUS_TYPES["RUNNING"]
        self.simple_server = httpd

        is_colab = False
        try:  # Check if running interactively using ipython.
            from_ipynb = get_ipython()
            if "google.colab" in str(from_ipynb):
                is_colab = True
        except NameError:
            pass

        current_pkg_version = pkg_resources.require("gradio")[0].version
        latest_pkg_version = requests.get(url=PKG_VERSION_URL).json()["version"]
        if StrictVersion(latest_pkg_version) > StrictVersion(current_pkg_version):
            print(f"IMPORTANT: You are using gradio version {current_pkg_version}, however version {latest_pkg_version} "
                  f"is available, please upgrade.")
            print('--------')
        if self.verbose:
            print(strings.en["BETA_MESSAGE"])
            if not is_colab:
                print(strings.en["RUNNING_LOCALLY"].format(path_to_local_server))
        if share:
            try:
                share_url = networking.setup_tunnel(server_port)
            except RuntimeError:
                share_url = None
                if self.verbose:
                    print(strings.en["NGROK_NO_INTERNET"])
        else:
            if (
                is_colab
            ):  # For a colab notebook, create a public link even if share is False.
                share_url = networking.setup_tunnel(server_port)
                if self.verbose:
                    print(strings.en["COLAB_NO_LOCAL"])
            else:  # If it's not a colab notebook and share=False, print a message telling them about the share option.
                if self.verbose:
                    print(strings.en["PUBLIC_SHARE_TRUE"])
                share_url = None

        if share_url is not None:
            networking.set_share_url_in_config_file(output_directory, share_url)
            if self.verbose:
                print(strings.en["GENERATING_PUBLIC_LINK"], end='\r')
                time.sleep(5)
                print(strings.en["MODEL_PUBLICLY_AVAILABLE_URL"].format(share_url))

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
            webbrowser.open(
                path_to_local_server
            )  # Open a browser tab with the interface.
        if inline:
            from IPython.display import IFrame

            if (
                is_colab
            ):  # Embed the remote interface page if on google colab; otherwise, embed the local page.
                display(IFrame(share_url, width=1000, height=500))
            else:
                display(IFrame(path_to_local_server, width=1000, height=500))

        return httpd, path_to_local_server, share_url
