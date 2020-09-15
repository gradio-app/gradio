"""
This is the core file in the `gradio` package, and defines the Interface class, including methods for constructing the
interface using the input and output types.
"""

import tempfile
import webbrowser

from gradio.inputs import InputComponent
from gradio.inputs import Image
from gradio.inputs import Textbox
from gradio.outputs import OutputComponent
from gradio import networking, strings, utils, processing_utils
from distutils.version import StrictVersion
from skimage.segmentation import slic
from skimage.util import img_as_float
import pkg_resources
import requests
import random
import time
import inspect
from IPython import get_ipython
import sys
import weakref
import analytics
import os
import numpy as np

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

    @classmethod
    def get_instances(cls):
        """
        :return: list of all current instances.
        """
        return list(
            Interface.instances)

    def __init__(self, fn, inputs, outputs, verbose=False, examples=None,
                 live=False, show_input=True, show_output=True,
                 capture_session=False, explain_by=None, title=None, description=None,
                 thumbnail=None, server_port=None, server_name=networking.LOCALHOST_NAME,
                 allow_screenshot=True, allow_flagging=True,
                 flagging_dir="flagged", analytics_enabled=True):

        """
        Parameters:
        fn (Callable): the function to wrap an interface around.
        inputs (Union[str, List[Union[str, InputComponent]]]): a single Gradio input component, or list of Gradio input components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of input components should match the number of parameters in fn.
        outputs (Union[str, List[Union[str, OutputComponent]]]): a single Gradio output component, or list of Gradio output components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of output components should match the number of values returned by fn.
        verbose (bool): whether to print detailed information during launch.
        examples (List[List[Any]]): sample inputs for the function; if provided, appears below the UI components and can be used to populate the interface. Should be nested list, in which the outer list consists of samples and each inner list consists of an input corresponding to each input component.
        live (bool): whether the interface should automatically reload on change.
        capture_session (bool): if True, captures the default graph and session (needed for Tensorflow 1.x)
        title (str): a title for the interface; if provided, appears above the input and output components.
        description (str): a description for the interface; if provided, appears above the input and output components.
        thumbnail (str): path to image or src to use as display picture for models listed in gradio.app/hub
        allow_screenshot (bool): if False, users will not see a button to take a screenshot of the interface.
        allow_flagging (bool): if False, users will not see a button to flag an input and output.
        flagging_dir (str): what to name the dir where flagged data is stored.
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
        self.live = live
        self.show_input = show_input
        self.show_output = show_output
        self.flag_hash = random.getrandbits(32)
        self.capture_session = capture_session
        self.explain_by = explain_by
        self.session = None
        self.server_name = server_name
        self.title = title
        self.description = description
        self.thumbnail = thumbnail
        self.examples = examples
        self.server_port = server_port
        self.simple_server = None
        self.allow_screenshot = allow_screenshot
        self.allow_flagging = allow_flagging
        self.flagging_dir = flagging_dir
        Interface.instances.add(self)
        self.analytics_enabled=analytics_enabled

        data = {'fn': fn,
                'inputs': inputs,
                'outputs': outputs,
                'live': live,
                'capture_session': capture_session,
                'ip_address': ip_address
                }

        if self.capture_session:
            try:
                import tensorflow as tf
                self.session = tf.get_default_graph(), \
                               tf.keras.backend.get_session()
            except (ImportError, AttributeError):
                # If they are using TF >= 2.0 or don't have TF,
                # just ignore this.
                pass

        if self.allow_flagging:
            if self.title is not None:
                dir_name = "_".join(self.title.split(" "))
            else:
                dir_name = "_".join([fn.__name__ for fn in self.predict])
            index = 1
            while os.path.exists(self.flagging_dir + "/" + dir_name +
                                 "_{}".format(index)):
                index += 1
            self.flagging_dir = self.flagging_dir + "/" + dir_name + \
                                "_{}".format(index)

        if self.analytics_enabled:
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
            "allow_screenshot": self.allow_screenshot,
            "allow_flagging": self.allow_flagging,
            "allow_interpretation": self.explain_by is not None
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

    def process(self, raw_input, predict_fn=None):
        """
        :param raw_input: a list of raw inputs to process and apply the
        prediction(s) on.
        :param predict_fn: which function to process. If not provided, all of the model functions are used.
        :return:
        processed output: a list of processed  outputs to return as the
        prediction(s).
        duration: a list of time deltas measuring inference time for each
        prediction fn.
        """
        processed_input = [input_interface.preprocess(raw_input[i])
                           for i, input_interface in enumerate(self.input_interfaces)]
        predictions = []
        durations = []
        for predict_fn in self.predict:
            start = time.time()
            if self.capture_session and not (self.session is None):
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

    def close(self):
        if self.simple_server and not (self.simple_server.fileno() == -1):  # checks to see if server is running
            print("Closing Gradio server on port {}...".format(self.server_port))
            networking.close_server(self.simple_server)

    def run_until_interrupted(self, thread, path_to_local_server):
        try:
            while 1:
                pass
        except (KeyboardInterrupt, OSError):
            print("Keyboard interruption in main thread... closing server.")
            thread.keep_running = False
            networking.url_ok(path_to_local_server)

    def test_launch(self):
        for predict_fn in self.predict:
            print("Test launching: {}()...".format(predict_fn.__name__), end=' ')

            raw_input = []
            for input_interface in self.input_interfaces:
                if input_interface.test_input is None:  # If no test input is defined for that input interface
                    print("SKIPPED")
                    break
                else:  # If a test input is defined for each interface object
                    raw_input.append(input_interface.test_input)
            else:
                self.process(raw_input)
                print("PASSED")
                continue

    def launch(self, inline=None, inbrowser=None, share=False, debug=False):
        """
        Parameters
        inline (bool): whether to display in the interface inline on python notebooks.
        inbrowser (bool): whether to automatically launch the interface in a new tab on the default browser.
        share (bool): whether to create a publicly shareable link from your computer for the interface.
        debug (bool): if True, and the interface was launched from Google Colab, prints the errors in the cell output.
        Returns
        httpd (str): HTTPServer object
        path_to_local_server (str): Locally accessible link
        share_url (str): Publicly accessible link (if share=True)
        """
        output_directory = tempfile.mkdtemp()
        # Set up a port to serve the directory containing the static files with interface.
        server_port, httpd, thread = networking.start_simple_server(
            self, output_directory, self.server_name, server_port=self.server_port)
        path_to_local_server = "http://{}:{}/".format(self.server_name, server_port)
        networking.build_template(output_directory)

        self.server_port = server_port
        self.status = "RUNNING"
        self.simple_server = httpd

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

        is_colab = utils.colab_check()
        if not is_colab:
            if not networking.url_ok(path_to_local_server):
                share = True
            else:
                print(strings.en["RUNNING_LOCALLY"].format(path_to_local_server))
        else:
            if debug:
                print("Colab notebook detected. This cell will run indefinitely so that you can see errors and logs. "
                      "To turn off, set debug=False in launch().")
            else:
                print("Colab notebook detected. To show errors in colab notebook, set debug=True in launch()")

        if share:
            print("This share link will expire in 6 hours. If you need a "
                  "permanent link, email support@gradio.app")
            try:
                share_url = networking.setup_tunnel(server_port)
                print("Running on External URL:", share_url)
            except RuntimeError:
                data = {'error': 'RuntimeError in launch method'}
                if self.analytics_enabled:
                    try:
                        requests.post(analytics_url + 'gradio-error-analytics/',
                                      data=data)
                    except requests.ConnectionError:
                        pass  # do not push analytics if no network
                share_url = None
                if self.verbose:
                    print(strings.en["NGROK_NO_INTERNET"])
        else:
            if is_colab:  # For a colab notebook, create a public link even if
                # share is False.
                share_url = networking.setup_tunnel(server_port)
                print("Running on External URL:", share_url)
                if self.verbose:
                    print(strings.en["COLAB_NO_LOCAL"])
            else:  # If it's not a colab notebook and share=False, print a message telling them about the share option.
                print("To get a public link for a hosted model, "
                      "set Share=True")
                if self.verbose:
                    print(strings.en["PUBLIC_SHARE_TRUE"])
                share_url = None

        if inline is None:
            inline = utils.ipython_check()
            if inbrowser is None:
                # if interface won't appear inline, open it in new tab,
                # otherwise keep it inline
                inbrowser = not inline
        else:
            if inbrowser is None:
                inbrowser = False

        if inbrowser and not is_colab:
            webbrowser.open(path_to_local_server)  # Open a browser tab
            # with the interface.
        if inline:
            from IPython.display import IFrame, display
            # Embed the remote interface page if on google colab;
            # otherwise, embed the local page.
            print("Interface loading below...")
            if share:
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

        if self.analytics_enabled:
            try:
                requests.post(analytics_url + 'gradio-launched-analytics/',
                              data=data)
            except requests.ConnectionError:
                pass  # do not push analytics if no network

        is_in_interactive_mode = bool(getattr(sys, 'ps1', sys.flags.interactive))
        if not is_in_interactive_mode:
            self.run_until_interrupted(thread, path_to_local_server)

        return httpd, path_to_local_server, share_url

    def tokenize_text(self, text):
        leave_one_out_tokens = []
        tokens = text.split()
        for idx, _ in enumerate(tokens):
            new_token_array = tokens.copy()
            del new_token_array[idx]
            leave_one_out_tokens.append(new_token_array)
        return tokens, leave_one_out_tokens

    def tokenize_image(self, image):
        image = self.input_interfaces[0].preprocess(image)
        segments_slic = slic(image, n_segments=20, compactness=10, sigma=1)
        leave_one_out_tokens = []
        for (i, segVal) in enumerate(np.unique(segments_slic)):
            mask = np.copy(image)
            mask[segments_slic == segVal] = 255
            leave_one_out_tokens.append(mask)
        return leave_one_out_tokens

    def score_text(self, tokens, leave_one_out_tokens, text):
        original_label = ""
        original_confidence = 0
        tokens = text.split()

        input_text = " ".join(tokens)
        output = self.predict[0](input_text)
        original_label = max(output, key=output.get)
        original_confidence = output[original_label]

        scores = []
        for idx, input_text in enumerate(leave_one_out_tokens):
            input_text = " ".join(input_text)
            output = self.predict[0](input_text)
            scores.append(original_confidence - output[original_label])
        
        scores_by_char = []
        for idx, token in enumerate(tokens):
            if idx != 0:
                scores_by_char.append((" ", 0))
            for char in token:
                scores_by_char.append((char, scores[idx]))
        return scores_by_char

    def score_image(self, leave_one_out_tokens, image):
        original_output = self.process(image)
        original_label = original_output[0][0]['confidences'][0][
            'label']
        original_confidence = original_output[0][0]['confidences'][0][
            'confidence']
        output_scores = np.full(np.shape(self.input_interfaces[0].preprocess(
            image[0])), 255)
        for input_image in leave_one_out_tokens:
            input_image_base64 = processing_utils.encode_array_to_base64(
                input_image)
            input_image_arr = []
            input_image_arr.append(input_image_base64)
            output = self.process(input_image_arr)
            np.set_printoptions(threshold=sys.maxsize)
            if output[0][0]['confidences'][0]['label'] == original_label:
                input_image[input_image == 255] = (original_confidence -
                                                   output[0][0][
                                                       'confidences'][0][
                                                       'confidence']) * 100
                mask = (output_scores == 255)
                output_scores[mask] = input_image[mask]
        return output_scores

    def simple_explanation(self, input):
        if isinstance(self.input_interfaces[0], Textbox):
            tokens, leave_one_out_tokens = self.tokenize_text(input[0])
            return [self.score_text(tokens, leave_one_out_tokens, input[0])]
        elif isinstance(self.input_interfaces[0], Image):
            leave_one_out_tokens = self.tokenize_image(input[0])
            return self.score_image(leave_one_out_tokens, input[0])
        else:
            print("Not valid input type")

    def explain(self, input):
        if self.explain_by == "default":
            return self.simple_explanation(input)
        else:
            return self.explain_by(input)

def reset_all():
    for io in Interface.get_instances():
        io.close()
