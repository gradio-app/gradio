"""
This is the core file in the `gradio` package, and defines the Interface class, including methods for constructing the
interface using the input and output types.
"""

import tempfile
import traceback
import webbrowser

from gradio.inputs import InputComponent
from gradio.outputs import OutputComponent
from gradio import networking, strings
from distutils.version import StrictVersion
import pkg_resources
import requests
import random
import time
import inspect
from IPython import get_ipython
import sys
import weakref
import analytics


PKG_VERSION_URL = "https://gradio.app/api/pkg-version"
analytics.write_key = "uxIFddIEuuUcFLf9VgH2teTEtPlWdkNy"
analytics_url = 'https://api.gradio.app/'
try:
    ip_address = requests.get('https://api.ipify.org').text
except requests.ConnectionError:
    ip_address = "No internet connection"


class Interface:
    """
    Interfaces are created with Gradio using the `gradio.Interface()` function.
    """
    instances = weakref.WeakSet()

    def __init__(self, fn, inputs, outputs, saliency=None, verbose=False, examples=None,
                 live=False, show_input=True, show_output=True,
                 capture_session=False, title=None, description=None,
                 thumbnail=None,  server_port=None, server_name=networking.LOCALHOST_NAME,
                 allow_screenshot=True):
        """
        Parameters:
        fn (Callable): the function to wrap an interface around.
        inputs (Union[str, List[Union[str, InputComponent]]]): a single Gradio input component, or list of Gradio input components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of input components should match the number of parameters in fn.
        outputs (Union[str, List[Union[str, OutputComponent]]]): a single Gradio output component, or list of Gradio output components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of output components should match the number of values returned by fn.
        live (bool): whether the interface should automatically reload on change.
        capture_session (bool): if True, captures the default graph and session (needed for Tensorflow 1.x)
        title (str): a title for the interface; if provided, appears above the input and output components.
        description (str): a description for the interface; if provided, appears above the input and output components.
        examples (List[List[Any]]): sample inputs for the function; if provided, appears below the UI components and can be used to populate the interface. Should be nested list, in which the outer list consists of samples and each inner list consists of an input corresponding to each input component.
        """
        def get_input_instance(iface):
            if isinstance(iface, str):
                shortcut = InputComponent.get_all_shortcut_implementations()[iface]
                return shortcut[0](**shortcut[1])
            elif isinstance(iface, InputComponent):
                return iface
            else:
                raise ValueError("Input interface must be of type `str` or "
                                 "`InputComponent`")

        def get_output_instance(iface):
            if isinstance(iface, str):
                shortcut = OutputComponent.get_all_shortcut_implementations()[iface]
                return shortcut[0](**shortcut[1])
            elif isinstance(iface, OutputComponent):
                return iface
            else:
                raise ValueError(
                    "Output interface must be of type `str` or "
                    "`OutputComponent`"
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
        self.server_port = server_port
        self.simple_server = None
        self.allow_screenshot = allow_screenshot
        Interface.instances.add(self)

        data = {'fn': fn,
                'inputs': inputs,
                'outputs': outputs,
                'saliency': saliency,
                'live': live,
                'capture_session': capture_session,
                'ip_address': ip_address
                }

        if self.capture_session:
            try:
                import tensorflow as tf
                self.session = tf.get_default_graph(), \
                              tf.keras.backend.get_session()
            except (ImportError, AttributeError):  # If they are using TF >= 2.0 or don't have TF, just ignore this.
                pass

        try:
            requests.post(analytics_url + 'gradio-initiated-analytics/',
                          data=data)
        except requests.ConnectionError:
            pass  # do not push analytics if no network

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
            "thumbnail": self.thumbnail,
            "allow_screenshot": self.allow_screenshot
        }
        try:
            param_names = inspect.getfullargspec(self.predict[0])[0]
            for iface, param in zip(config["input_interfaces"], param_names):
                if not iface[1]["label"]:
                    iface[1]["label"] = param.replace("_", " ")
            for i, iface in enumerate(config["output_interfaces"]):
                ret_name = "Output " + str(i + 1) if len(config["output_interfaces"]) > 1 else "Output"
                if not iface[1]["label"]:
                    iface[1]["label"] = ret_name
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

            if len(self.output_interfaces) == len(self.predict):
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
                data = {'error': e}
                try:
                    requests.post(analytics_url + 'gradio-error-analytics/',
                              data=data)
                except requests.ConnectionError:
                    pass  # do not push analytics if no network
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
                data = {'error': e}
                try:
                    requests.post(analytics_url + 'gradio-error-analytics/',
                                  data=data)
                except requests.ConnectionError:
                    pass  # do not push analytics if no network
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

    def close(self):
        if self.simple_server and not(self.simple_server.fileno() == -1):  # checks to see if server is running
            print("Closing Gradio server on port {}...".format(self.server_port))
            networking.close_server(self.simple_server)

    def launch(self, inline=None, inbrowser=None, share=False, validate=True, debug=False):
        """
        Parameters
        share (bool): whether to create a publicly shareable link from your computer for the interface.
        """
        # if validate and not self.validate_flag:
        #     self.validate()

        output_directory = tempfile.mkdtemp()
        # Set up a port to serve the directory containing the static files with interface.
        server_port, httpd = networking.start_simple_server(self, output_directory, self.server_name,
                                                            server_port=self.server_port)
        path_to_local_server = "http://{}:{}/".format(self.server_name, server_port)
        networking.build_template(output_directory)

        self.server_port = server_port
        self.status = "RUNNING"
        self.simple_server = httpd

        is_colab = False
        try:  # Check if running interactively using ipython.
            from_ipynb = get_ipython()
            if "google.colab" in str(from_ipynb):
                is_colab = True
        except NameError:
            data = {'error': 'NameError in launch method'}
            try:
                requests.post(analytics_url + 'gradio-error-analytics/',
                              data=data)
            except requests.ConnectionError:
                pass  # do not push analytics if no network
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
        else:
            if debug:
                print("Colab notebook detected. This cell will run indefinitely so that you can see errors and logs. "
                      "To turn off, set debug=False in launch().")
            else:
                print("Colab notebook detected. To show errors in colab notebook, set debug=True in launch()")

        if share:
            try:
                share_url = networking.setup_tunnel(server_port)
                print("Running on External URL:", share_url)
            except RuntimeError:
                data = {'error': 'RuntimeError in launch method'}
                try:
                    requests.post(analytics_url + 'gradio-error-analytics/',
                                  data=data)
                except requests.ConnectionError:
                    pass  # do not push analytics if no network
                share_url = None
                if self.verbose:
                    print(strings.en["NGROK_NO_INTERNET"])
        else:
            if (
                is_colab
            ):  # For a colab notebook, create a public link even if share is False.
                share_url = networking.setup_tunnel(server_port)
                print("Running on External URL:", share_url)
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
                print("Interface loading below...")
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
        networking.set_meta_tags(output_directory, self.title, self.description, self.thumbnail)

        if debug:
            while True:
                sys.stdout.flush()
                time.sleep(0.1)

        launch_method = 'browser' if inbrowser else 'inline'
        data = {'launch_method': launch_method,
                'is_google_colab': is_colab,
                'is_sharing_on': share,
                'share_url': share_url,
                'ip_address': ip_address
                }
        try:
            requests.post(analytics_url + 'gradio-launched-analytics/',
                          data=data)
        except requests.ConnectionError:
            pass  # do not push analytics if no network
        return httpd, path_to_local_server, share_url

    @classmethod
    def get_instances(cls):
        return list(Interface.instances)  # Returns list of all current instances.


def reset_all():
    for io in Interface.get_instances():
        io.close()
