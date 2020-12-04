"""
This is the core file in the `gradio` package, and defines the Interface class, including methods for constructing the
interface using the input and output types.
"""

from gradio.inputs import InputComponent
from gradio.outputs import OutputComponent
from gradio import networking, strings, utils
from gradio.interpretation import quantify_difference_in_label
import pkg_resources
import requests
import random
import time
import webbrowser
import inspect
import sys
import weakref
import analytics
import numpy as np
import os
import copy
import markdown2
import json

analytics.write_key = "uxIFddIEuuUcFLf9VgH2teTEtPlWdkNy"
analytics_url = 'https://api.gradio.app/'
ip_address = networking.get_local_ip_address()

JSON_PATH = pkg_resources.resource_filename("gradio", "launches.json")

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
                 examples_per_page=10, live=False, 
                 layout="horizontal", show_input=True, show_output=True,
                 capture_session=False, interpretation=None,
                 title=None, description=None, article=None, thumbnail=None, 
                 server_port=None, server_name=networking.LOCALHOST_NAME,
                 allow_screenshot=True, allow_flagging=True,
                 embedding="default", flagging_dir="flagged", analytics_enabled=True):

        """
        Parameters:
        fn (Callable): the function to wrap an interface around.
        inputs (Union[str, List[Union[str, InputComponent]]]): a single Gradio input component, or list of Gradio input components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of input components should match the number of parameters in fn.
        outputs (Union[str, List[Union[str, OutputComponent]]]): a single Gradio output component, or list of Gradio output components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of output components should match the number of values returned by fn.
        verbose (bool): whether to print detailed information during launch.
        examples (List[List[Any]]): sample inputs for the function; if provided, appears below the UI components and can be used to populate the interface. Should be nested list, in which the outer list consists of samples and each inner list consists of an input corresponding to each input component.
        examples_per_page (int): If examples are provided, how many to display per page.
        live (bool): whether the interface should automatically reload on change.
        layout (str): Layout of input and output panels. "horizontal" arranges them as two columns of equal height, "unaligned" arranges them as two columns of unequal height, and "vertical" arranges them vertically.
        capture_session (bool): if True, captures the default graph and session (needed for Tensorflow 1.x)
        interpretation (Union[Callable, str]): function that provides interpretation explaining prediction output. Pass "default" to use built-in interpreter. 
        title (str): a title for the interface; if provided, appears above the input and output components.
        description (str): a description for the interface; if provided, appears above the input and output components.
        article (str): an expanded article explaining the interface; if provided, appears below the input and output components. Accepts Markdown and HTML content.
        thumbnail (str): path to image or src to use as display picture for models listed in gradio.app/hub
        server_name (str): to make app accessible on local network set to "0.0.0.0".
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
        self.layout = layout
        self.show_input = show_input
        self.show_output = show_output
        self.flag_hash = random.getrandbits(32)
        self.capture_session = capture_session
        self.interpretation = interpretation            
        self.session = None
        self.server_name = server_name
        self.title = title
        self.description = description
        if article is not None:
            article = markdown2.markdown(article)
        self.article = article
        self.thumbnail = thumbnail
        self.examples = examples
        self.examples_per_page = examples_per_page
        self.server_port = server_port
        self.simple_server = None
        self.allow_screenshot = allow_screenshot
        self.allow_flagging = allow_flagging
        self.flagging_dir = flagging_dir
        Interface.instances.add(self)
        self.analytics_enabled=analytics_enabled
        self.save_to = None
        self.share = None
        self.embedding = embedding

        data = {'fn': fn,
                'inputs': inputs,
                'outputs': outputs,
                'live': live,
                'capture_session': capture_session,
                'ip_address': ip_address,
                'interpretation': interpretation,
                'embedding': embedding,
                'allow_flagging': allow_flagging,
                'allow_screenshot': allow_screenshot,
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
            "examples_per_page": self.examples_per_page,
            "layout": self.layout,
            "show_input": self.show_input,
            "show_output": self.show_output,
            "title": self.title,
            "description": self.description,
            "article": self.article,
            "thumbnail": self.thumbnail,
            "allow_screenshot": self.allow_screenshot,
            "allow_flagging": self.allow_flagging,
            "allow_interpretation": self.interpretation is not None
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
        if self.examples is not None:
            processed_examples = []
            for example_set in self.examples:
                processed_set = []
                for iface, example in zip(self.input_interfaces, example_set):
                    processed_set.append(example)
                processed_examples.append(processed_set)
            config["examples"] = processed_examples
        return config

    def run_prediction(self, processed_input, return_duration=False):
        predictions = []
        durations = []
        for predict_fn in self.predict:
            start = time.time()
            if self.capture_session and self.session is not None:
                graph, sess = self.session
                with graph.as_default(), sess.as_default():
                    prediction = predict_fn(*processed_input)
            else:
                try:
                    prediction = predict_fn(*processed_input)
                except ValueError as exception:
                    if str(exception).endswith("is not an element of this graph."):
                        raise ValueError(strings.en["TF1_ERROR"])
                    else:
                        raise exception
            duration = time.time() - start

            if len(self.output_interfaces) == len(self.predict):
                prediction = [prediction]
            durations.append(duration)
            predictions.extend(prediction)
        
        if return_duration:
            return predictions, durations
        else:
            return predictions

    def process(self, raw_input):
        """
        :param raw_input: a list of raw inputs to process and apply the prediction(s) on.
        processed output: a list of processed  outputs to return as the prediction(s).
        duration: a list of time deltas measuring inference time for each prediction fn.
        """
        processed_input = [input_interface.preprocess(raw_input[i])
                           for i, input_interface in enumerate(self.input_interfaces)]
        predictions, durations = self.run_prediction(processed_input, return_duration=True)
        processed_output = [output_interface.postprocess(
            predictions[i]) for i, output_interface in enumerate(self.output_interfaces)]
        return processed_output, durations
    
    def embed(self, processed_input):
        if self.embedding == "default":
            embeddings = np.concatenate([input_interface.embed(processed_input[i])
                            for i, input_interface in enumerate(self.input_interfaces)])
        else:
            embeddings = self.embedding(*processed_input)
        return embeddings

    def interpret(self, raw_input):
        """
        Runs the interpretation command for the machine learning model. Handles both the "default" out-of-the-box
        interpretation for a certain set of UI component types, as well as the custom interpretation case.
        :param raw_input: a list of raw inputs to apply the interpretation(s) on.
        """
        if self.interpretation == "default":
            processed_input = [input_interface.preprocess(raw_input[i])
                            for i, input_interface in enumerate(self.input_interfaces)]
            original_output = self.run_prediction(processed_input)
            scores, alternative_outputs = [], []
            for i, x in enumerate(raw_input):
                input_interface = self.input_interfaces[i]
                neighbor_raw_input = list(raw_input)
                neighbor_values, interpret_kwargs, interpret_by_removal = input_interface.get_interpretation_neighbors(x)
                interface_scores = []
                alternative_output = []
                for neighbor_input in neighbor_values:
                    neighbor_raw_input[i] = neighbor_input
                    processed_neighbor_input = [input_interface.preprocess(neighbor_raw_input[i])
                                    for i, input_interface in enumerate(self.input_interfaces)]
                    neighbor_output = self.run_prediction(processed_neighbor_input)
                    processed_neighbor_output = [output_interface.postprocess(
                        neighbor_output[i]) for i, output_interface in enumerate(self.output_interfaces)]

                    alternative_output.append(processed_neighbor_output)
                    interface_scores.append(quantify_difference_in_label(self, original_output, neighbor_output))
                alternative_outputs.append(alternative_output)
                if not interpret_by_removal:
                    interface_scores = [-score for score in interface_scores]
                scores.append(
                    input_interface.get_interpretation_scores(
                        raw_input[i], neighbor_values, interface_scores, **interpret_kwargs))
            return scores, alternative_outputs
        else:
            processed_input = [input_interface.preprocess(raw_input[i])
                               for i, input_interface in enumerate(self.input_interfaces)]
            interpreter = self.interpretation

            if self.capture_session and self.session is not None:
                graph, sess = self.session
                with graph.as_default(), sess.as_default():
                    interpretation = interpreter(*processed_input)
            else:
                try:
                    interpretation = interpreter(*processed_input)
                except ValueError as exception:
                    if str(exception).endswith("is not an element of this graph."):
                        raise ValueError(strings.en["TF1_ERROR"])
                    else:
                        raise exception
            if len(raw_input) == 1:
                interpretation = [interpretation]
            return interpretation, []

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
            networking.url_ok(path_to_local_server)  # Hit the server one more time to close it

    def test_launch(self):
        for predict_fn in self.predict:
            print("Test launch: {}()...".format(predict_fn.__name__), end=' ')

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
        Parameters:
        inline (bool): whether to display in the interface inline on python notebooks.
        inbrowser (bool): whether to automatically launch the interface in a new tab on the default browser.
        share (bool): whether to create a publicly shareable link from your computer for the interface.
        debug (bool): if True, and the interface was launched from Google Colab, prints the errors in the cell output.
        Returns:
        app (flask.Flask): Flask app object
        path_to_local_server (str): Locally accessible link
        share_url (str): Publicly accessible link (if share=True)
        """

        config = self.get_config_file()
        networking.set_config(config)
        networking.set_meta_tags(self.title, self.description, self.thumbnail)

        server_port, app, thread = networking.start_server(
            self, self.server_name, self.server_port)
        path_to_local_server = "http://{}:{}/".format(self.server_name, server_port)
        self.server_port = server_port
        self.status = "RUNNING"
        self.server = app

        utils.version_check()
        is_colab = utils.colab_check()
        if is_colab:
            share = True
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

        if not os.path.exists(JSON_PATH):
            with open(JSON_PATH, "w+") as j:
                launches = {"launches": 0}
                j.write(json.dumps(launches))
        else:
            with open(JSON_PATH) as j:
                launches = json.load(j)

        if launches["launches"] in [25, 50]:
            print(strings.en["BETA_INVITE"])

        self.share = share
        if share:
            print("This share link will expire in 24 hours. If you need a "
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

        r = requests.get(path_to_local_server + "enable_sharing/" + (share_url or "None"))

        if debug or int(os.getenv('GRADIO_DEBUG',0))==1:
            while True:
                sys.stdout.flush()
                time.sleep(0.1)

        launch_method = 'browser' if inbrowser else 'inline'

        if self.analytics_enabled:
            data = {
                'launch_method': launch_method,
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

        is_in_interactive_mode = bool(getattr(sys, 'ps1', sys.flags.interactive))
        if not is_in_interactive_mode:
            self.run_until_interrupted(thread, path_to_local_server)

        launches["launches"] += 1
        with open(JSON_PATH, "w") as j:
            j.write(json.dumps(launches))

        return app, path_to_local_server, share_url


def reset_all():
    for io in Interface.get_instances():
        io.close()
