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
import inspect
from IPython import get_ipython


PKG_VERSION_URL = "https://gradio.app/api/pkg-version"


class Interface:
    """
    The Interface class represents a general input/output interface for a machine learning model. During construction,
    the appropriate inputs and outputs
    """

    def __init__(self, fn, inputs, outputs, saliency=None, verbose=False, examples=None,
                 live=False, show_input=True, show_output=True,
                 load_fn=None, capture_session=False, title=None, description=None,
                 thumbnail=None, server_name=networking.LOCALHOST_NAME):
        """
        :param fn: a function that will process the input panel data from the interface and return the output panel data.
        :param inputs: a string or `AbstractInput` representing the input interface.
        :param outputs: a string or `AbstractOutput` representing the output interface.
        """
        def get_input_instance(iface):
            if isinstance(iface, str):
                return gradio.inputs.shortcuts[iface.lower()]
            elif isinstance(iface, gradio.inputs.AbstractInput):
                return iface
            else:
                raise ValueError("Input interface must be of type `str` or "
                                 "`AbstractInput`")

        def get_output_instance(iface):
            if isinstance(iface, str):
                return gradio.outputs.shortcuts[iface.lower()]
            elif isinstance(iface, gradio.outputs.AbstractOutput):
                return iface
            else:
                raise ValueError(
                    "Output interface must be of type `str` or "
                    "`AbstractOutput`"
                )
        if isinstance(inputs, list):
            self.input_interfaces = [get_input_instance(i) for i in inputs]
        else:
            self.input_interfaces = [get_input_instance(inputs)]
        if isinstance(outputs, list):
            self.output_interfaces = [get_output_instance(i) for i in outputs]
        else:
            self.output_interfaces = [get_output_instance(outputs)]
        if not isinstance(fn, list):
            fn = [fn]
        self.output_interfaces *= len(fn)
        self.predict = fn
        self.verbose = verbose
        self.status = "OFF"
        self.saliency = saliency
        self.live = live
        self.show_input = show_input
        self.show_output = show_output
        self.flag_hash = random.getrandbits(32)
        self.capture_session = capture_session
        self.session = None
        self.server_name = server_name
        self.title = title
        self.description = description
        self.thumbnail = thumbnail
        self.examples = examples

    def get_config_file(self):
        config = {
            "input_interfaces": [
                (iface.__class__.__name__.lower(), iface.get_template_context())
                for iface in self.input_interfaces],
            "output_interfaces": [
                (iface.__class__.__name__.lower(), iface.get_template_context())
                for iface in self.output_interfaces],
            "function_count": len(self.predict),
            "live": self.live,
            "show_input": self.show_input,
            "show_output": self.show_output,
            "title": self.title,
            "description": self.description,
            "thumbnail": self.thumbnail
        }
        try:
            param_names = inspect.getfullargspec(self.predict[0])[0]
            for iface, param in zip(config["input_interfaces"], param_names):
                if not iface[1]["label"]:
                    iface[1]["label"] = param.replace("_", " ")
        except ValueError:
            pass
        return config    


    def process(self, raw_input):
        processed_input = [input_interface.preprocess(
            raw_input[i]) for i, input_interface in
            enumerate(self.input_interfaces)]
        predictions = []
        durations = []
        for predict_fn in self.predict:
            start = time.time()
            if self.capture_session and not(self.session is None):
                graph, sess = self.session
                with graph.as_default():
                    with sess.as_default():
                        prediction = predict_fn(*processed_input)
            else:
                try:
                    prediction = predict_fn(*processed_input)
                except ValueError as exception:
                    if str(exception).endswith("is not an element of this "
                                               "graph."):
                        raise ValueError("It looks like you might be using "
                                         "tensorflow < 2.0. Please "
                                         "pass capture_session=True in "
                                         "Interface to avoid the 'Tensor is "
                                         "not an element of this graph.' "
                                         "error.")
                    else:
                        raise exception
            duration = time.time() - start

            if len(self.output_interfaces) / \
                    len(self.predict) == 1:
                prediction = [prediction]
            durations.append(duration)
            predictions.extend(prediction)
        processed_output = [output_interface.postprocess(
            predictions[i]) for i, output_interface in enumerate(self.output_interfaces)]
        return processed_output, durations

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
                    "Validating samples: {}/{}  [".format(m+1, n)
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

    def launch(self, inline=None, inbrowser=None, share=False, validate=True):
        """
        Standard method shared by interfaces that creates the interface and sets up a websocket to communicate with it.
        :param inline: boolean. If True, then a gradio interface is created inline (e.g. in jupyter or colab notebook)
        :param inbrowser: boolean. If True, then a new browser window opens with the gradio interface.
        :param share: boolean. If True, then a share link is generated using ngrok is displayed to the user.
        :param validate: boolean. If True, then the validation is run if the interface has not already been validated.
        """
        # if validate and not self.validate_flag:
        #     self.validate()

        if self.capture_session:
            try:
                import tensorflow as tf
                self.session = tf.get_default_graph(), \
                              tf.keras.backend.get_session()
            except (ImportError, AttributeError):  # If they are using TF >= 2.0 or don't have TF, just ignore this.
                pass

        # If an existing interface is running with this instance, close it.
        if self.status == "RUNNING":
            if self.verbose:
                print("Closing existing server...")
            if self.simple_server is not None:
                try:
                    networking.close_server(self.simple_server)
                except OSError:
                    pass

        output_directory = tempfile.mkdtemp()
        # Set up a port to serve the directory containing the static files with interface.
        server_port, httpd = networking.start_simple_server(self, output_directory, self.server_name)
        path_to_local_server = "http://{}:{}/".format(self.server_name, server_port)
        networking.build_template(output_directory)

        self.status = "RUNNING"
        self.simple_server = httpd

        is_colab = False
        try:  # Check if running interactively using ipython.
            from_ipynb = get_ipython()
            if "google.colab" in str(from_ipynb):
                is_colab = True
        except NameError:
            pass

        try:
            current_pkg_version = pkg_resources.require("gradio")[0].version
            latest_pkg_version = requests.get(url=PKG_VERSION_URL).json()["version"]
            if StrictVersion(latest_pkg_version) > StrictVersion(current_pkg_version):
                print("IMPORTANT: You are using gradio version {}, "
                      "however version {} "
                      "is available, please upgrade.".format(
                            current_pkg_version, latest_pkg_version))
                print('--------')
        except:  # TODO(abidlabs): don't catch all exceptions
            pass

        if not is_colab:
            print(strings.en["RUNNING_LOCALLY"].format(path_to_local_server))

        if share:
            try:
                share_url = networking.setup_tunnel(server_port)
                print("External URL:", share_url)
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
            from IPython.display import IFrame, display

            if (
                is_colab
            ):  # Embed the remote interface page if on google colab;
                # otherwise, embed the local page.
                while not networking.url_ok(share_url):
                    time.sleep(1)
                display(IFrame(share_url, width=1000, height=500))
            else:
                display(IFrame(path_to_local_server, width=1000, height=500))

        config = self.get_config_file()
        config["share_url"] = share_url

        processed_examples = []
        if self.examples is not None:
            for example_set in self.examples:
                processed_set = []
                for iface, example in zip(self.input_interfaces, example_set):
                    processed_set.append(iface.process_example(example))
                processed_examples.append(processed_set)
            config["examples"] = processed_examples

        networking.set_config(config, output_directory)

        return httpd, path_to_local_server, share_url
