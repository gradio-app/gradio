"""
This is the core file in the `gradio` package, and defines the Interface class, including methods for constructing the
interface using the input and output types.
"""

import copy
import csv
import getpass
import inspect
import markdown2
import numpy as np
import os
import pkg_resources
import requests
import random
import sys
import time
import warnings
import webbrowser
import weakref
from gradio import networking, strings, utils, encryptor, queue
from gradio.inputs import get_input_instance
from gradio.outputs import get_output_instance
from gradio.interpretation import quantify_difference_in_label, get_regression_or_classification_value
from gradio.external import load_interface, load_from_pipeline


class Interface:
    """
    Interfaces are created with Gradio by constructing a `gradio.Interface()` object or by calling `gradio.Interface.load()`.
    """

    instances = weakref.WeakSet()  # stores references to all currently existing Interface instances

    @classmethod
    def get_instances(cls):
        """
        :return: list of all current instances.
        """
        return list(Interface.instances)

    @classmethod
    def load(cls, name, src=None, api_key=None, alias=None, **kwargs):
        """
        Class method to construct an Interface from an external source repository, such as huggingface.
        Parameters: 
        name (str): the name of the model (e.g. "gpt2"), can include the `src` as prefix (e.g. "huggingface/gpt2")
        src (str): the source of the model: `huggingface` or `gradio` (or empty if source is provided as a prefix in `name`)
        api_key (str): optional api key for use with Hugging Face Model Hub
        alias (str): optional, used as the name of the loaded model instead of the default name
        Returns:
        (gradio.Interface): a Gradio Interface object for the given model
        """
        interface_info = load_interface(name, src, api_key, alias)
         # create a dictionary of kwargs without overwriting the original interface_info dict because it is mutable
         # and that can cause some issues since the internal prediction function may rely on the original interface_info dict  
        kwargs = dict(interface_info, **kwargs) 
        interface = cls(**kwargs)
        interface.api_mode = True  # set api mode to true so that the interface will not preprocess/postprocess
        return interface

    @classmethod
    def from_pipeline(cls, pipeline, **kwargs):
        """
        Class method to construct an Interface from a Hugging Face transformers.Pipeline.
        pipeline (transformers.Pipeline): 
        Returns:
        (gradio.Interface): a Gradio Interface object from the given Pipeline
        """
        interface_info = load_from_pipeline(pipeline)
        kwargs = dict(interface_info, **kwargs) 
        interface = cls(**kwargs)
        return interface

    def __init__(self, fn, inputs=None, outputs=None, verbose=None, examples=None,
                 examples_per_page=10, live=False, layout="unaligned", show_input=True, show_output=True,
                 capture_session=None, interpretation=None, num_shap=2.0, theme=None, repeat_outputs_per_model=True,
                 title=None, description=None, article=None, thumbnail=None,
                 css=None, height=500, width=900, allow_screenshot=True, allow_flagging=None, flagging_options=None, 
                 encrypt=False, show_tips=None, flagging_dir="flagged", analytics_enabled=None, enable_queue=None, api_mode=None):
        """
        Parameters:
        fn (Callable): the function to wrap an interface around.
        inputs (Union[str, List[Union[str, InputComponent]]]): a single Gradio input component, or list of Gradio input components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of input components should match the number of parameters in fn.
        outputs (Union[str, List[Union[str, OutputComponent]]]): a single Gradio output component, or list of Gradio output components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of output components should match the number of values returned by fn.
        verbose (bool): DEPRECATED. Whether to print detailed information during launch.
        examples (Union[List[List[Any]], str]): sample inputs for the function; if provided, appears below the UI components and can be used to populate the interface. Should be nested list, in which the outer list consists of samples and each inner list consists of an input corresponding to each input component. A string path to a directory of examples can also be provided. If there are multiple input components and a directory is provided, a log.csv file must be present in the directory to link corresponding inputs.
        examples_per_page (int): If examples are provided, how many to display per page.
        live (bool): whether the interface should automatically reload on change.
        layout (str): Layout of input and output panels. "horizontal" arranges them as two columns of equal height, "unaligned" arranges them as two columns of unequal height, and "vertical" arranges them vertically.
        capture_session (bool): DEPRECATED. If True, captures the default graph and session (needed for Tensorflow 1.x)
        interpretation (Union[Callable, str]): function that provides interpretation explaining prediction output. Pass "default" to use simple built-in interpreter, "shap" to use a built-in shapley-based interpreter, or your own custom interpretation function. 
        num_shap (float): a multiplier that determines how many examples are computed for shap-based interpretation. Increasing this value will increase shap runtime, but improve results. Only applies if interpretation is "shap".
        title (str): a title for the interface; if provided, appears above the input and output components.
        description (str): a description for the interface; if provided, appears above the input and output components.
        article (str): an expanded article explaining the interface; if provided, appears below the input and output components. Accepts Markdown and HTML content.
        thumbnail (str): path to image or src to use as display picture for models listed in gradio.app/hub
        theme (str): Theme to use - one of "default", "huggingface", "grass", "peach". Add "dark" prefix, e.g. "darkpeach" or "darkdefault" for darktheme.
        css (str): custom css or path to custom css file to use with interface.
        allow_screenshot (bool): if False, users will not see a button to take a screenshot of the interface.
        allow_flagging (bool): if False, users will not see a button to flag an input and output.
        flagging_options (List[str]): if not None, provides options a user must select when flagging.
        encrypt (bool): If True, flagged data will be encrypted by key provided by creator at launch
        flagging_dir (str): what to name the dir where flagged data is stored.
        show_tips (bool): DEPRECATED. if True, will occasionally show tips about new Gradio features
        enable_queue (bool): DEPRECATED. if True, inference requests will be served through a queue instead of with parallel threads. Required for longer inference times (> 1min) to prevent timeout.  
        api_mode (bool): DEPRECATED. If True, will skip preprocessing steps when the Interface is called() as a function (should remain False unless the Interface is loaded from an external repo)
        """
        if not isinstance(fn, list):
            fn = [fn]
        if not isinstance(inputs, list):
            inputs = [inputs]
        if not isinstance(outputs, list):
            outputs = [outputs]

        self.input_components = [get_input_instance(i) for i in inputs]
        self.output_components = [get_output_instance(o) for o in outputs]
        if repeat_outputs_per_model:
            self.output_components *= len(fn)

        if interpretation is None or isinstance(interpretation, list) or callable(interpretation):
            self.interpretation = interpretation
        elif isinstance(interpretation, str):
            self.interpretation = [interpretation.lower() for _ in self.input_components]
        else:
            raise ValueError("Invalid value for parameter: interpretation")

        self.predict = fn
        self.predict_durations = [[0, 0]] * len(fn)
        self.function_names = [func.__name__ for func in fn]
        self.__name__ = ", ".join(self.function_names)
        
        if verbose is not None:
            warnings.warn("The `verbose` parameter in the `Interface` is deprecated and has no effect.")

        self.status = "OFF"
        self.live = live
        self.layout = layout
        self.show_input = show_input
        self.show_output = show_output
        self.flag_hash = random.getrandbits(32)
        self.capture_session = capture_session
        
        if capture_session is not None:
            warnings.warn("The `capture_session` parameter in the `Interface` will be deprecated in the near future.")

        self.session = None
        self.title = title
        self.description = description
        if article is not None:
            article = utils.readme_to_html(article)
            article = markdown2.markdown(
                article, extras=["fenced-code-blocks"])

        self.article = article
        self.thumbnail = thumbnail
        theme = theme if theme is not None else os.getenv("GRADIO_THEME", "default")
        if theme not in ("default", "huggingface", "grass", "peach", "darkdefault", "darkhuggingface", "darkgrass", "darkpeach"):
            raise ValueError("Invalid theme name.")
        self.theme = theme
        self.height = height
        self.width = width
        if css is not None and os.path.exists(css):
            with open(css) as css_file:
                self.css = css_file.read()
        else:
            self.css = css
        if examples is None or isinstance(examples, str) or (isinstance(examples, list) and (len(examples) == 0 or isinstance(examples[0], list))):
            self.examples = examples
        elif isinstance(examples, list) and len(self.input_components) == 1:  # If there is only one input component, examples can be provided as a regular list instead of a list of lists 
            self.examples = [[e] for e in examples]
        else:
            raise ValueError(
                "Examples argument must either be a directory or a nested list, where each sublist represents a set of inputs.")
        self.num_shap = num_shap
        self.examples_per_page = examples_per_page
                
        self.simple_server = None
        self.allow_screenshot = allow_screenshot
        # For allow_flagging and analytics_enabled: (1) first check for parameter, (2) check for environment variable, (3) default to True
        self.allow_flagging = allow_flagging if allow_flagging is not None else os.getenv("GRADIO_ALLOW_FLAGGING", "True")=="True"
        self.analytics_enabled = analytics_enabled if analytics_enabled is not None else os.getenv("GRADIO_ANALYTICS_ENABLED", "True")=="True"
        self.flagging_options = flagging_options
        self.flagging_dir = flagging_dir
        self.encrypt = encrypt
        self.save_to = None
        self.share = None
        self.share_url = None
        self.local_url = None
        self.ip_address = networking.get_local_ip_address()
        
        if show_tips is not None:
            warnings.warn("The `show_tips` parameter in the `Interface` is deprecated. Please use the `show_tips` parameter in `launch()` instead")

        self.requires_permissions = any(
            [component.requires_permissions for component in self.input_components])
        
        self.enable_queue = enable_queue
        if self.enable_queue is not None:
            warnings.warn("The `enable_queue` parameter in the `Interface` will be deprecated. Please use the `enable_queue` parameter in `launch()` instead")

        if api_mode is not None:
            warnings.warn("The `api_mode` parameter in the `Interface` is deprecated.")
        self.api_mode = False

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
            os.makedirs(self.flagging_dir, exist_ok=True)

        data = {'fn': fn,
                'inputs': inputs,
                'outputs': outputs,
                'live': live,
                'capture_session': capture_session,
                'ip_address': self.ip_address,
                'interpretation': interpretation,
                'allow_flagging': allow_flagging,
                'allow_screenshot': allow_screenshot,
                'custom_css': self.css is not None,
                'theme': self.theme
                }

        if self.analytics_enabled:
            utils.initiated_analytics(data)

        # Alert user if a more recent version of the library exists
        utils.version_check()
        Interface.instances.add(self)

    def __call__(self, *params):
        if self.api_mode:  # skip the preprocessing/postprocessing if sending to a remote API
            output = self.run_prediction(params, called_directly=True)
        else:
            output, _ = self.process(params) 
        return output[0] if len(output) == 1 else output

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        repr = "Gradio Interface for: {}".format(
            ", ".join(fn.__name__ for fn in self.predict))
        repr += "\n" + "-"*len(repr)
        repr += "\ninputs:"
        for component in self.input_components:
            repr += "\n|-{}".format(str(component))
        repr += "\noutputs:"
        for component in self.output_components:
            repr += "\n|-{}".format(str(component))
        return repr

    def get_config_file(self):
        config = {
            "input_components": [
                iface.get_template_context()
                for iface in self.input_components],
            "output_components": [
                iface.get_template_context()
                for iface in self.output_components],
            "function_count": len(self.predict),
            "live": self.live,
            "examples_per_page": self.examples_per_page,
            "layout": self.layout,
            "show_input": self.show_input,
            "show_output": self.show_output,
            "title": self.title,
            "description": self.description,
            "article": self.article,
            "theme": self.theme,
            "css": self.css,
            "thumbnail": self.thumbnail,
            "allow_screenshot": self.allow_screenshot,
            "allow_flagging": self.allow_flagging,
            "flagging_options": self.flagging_options,
            "allow_interpretation": self.interpretation is not None,
            "queue": self.enable_queue,
            "version": pkg_resources.require("gradio")[0].version
        }
        try:
            param_names = inspect.getfullargspec(self.predict[0])[0]
            for iface, param in zip(config["input_components"], param_names):
                if not iface["label"]:
                    iface["label"] = param.replace("_", " ")
            for i, iface in enumerate(config["output_components"]):
                outputs_per_function = int(
                    len(self.output_components) / len(self.predict))
                function_index = i // outputs_per_function
                component_index = i - function_index * outputs_per_function
                ret_name = "Output " + \
                    str(component_index + 1) if outputs_per_function > 1 else "Output"
                if iface["label"] is None:
                    iface["label"] = ret_name
                if len(self.predict) > 1:
                    iface["label"] = self.function_names[function_index].replace(
                        "_", " ") + ": " + iface["label"]

        except ValueError:
            pass
        if self.examples is not None:
            if isinstance(self.examples, str):
                if not os.path.exists(self.examples):
                    raise FileNotFoundError(
                        "Could not find examples directory: " + self.examples)
                log_file = os.path.join(self.examples, "log.csv")
                if not os.path.exists(log_file):
                    if len(self.input_components) == 1:
                        examples = [[os.path.join(self.examples, item)]
                                    for item in os.listdir(self.examples)]
                    else:
                        raise FileNotFoundError(
                            "Could not find log file (required for multiple inputs): " + log_file)
                else:
                    with open(log_file) as logs:
                        examples = list(csv.reader(logs))
                        examples = examples[1:]  # remove header
                for i, example in enumerate(examples):
                    for j, (interface, cell) in enumerate(zip(self.input_components + self.output_components, example)):
                        examples[i][j] = interface.restore_flagged(cell)
                config["examples"] = examples
                config["examples_dir"] = self.examples
            else:
                config["examples"] = self.examples
        return config

    def run_prediction(self, processed_input, return_duration=False, called_directly=False):
        """
        This is the method that actually runs the prediction function with the given (processed) inputs.
        Parameters:
        processed_input (list): A list of processed inputs.
        return_duration (bool): Whether to return the duration of the prediction.
        called_directly (bool): Whether the prediction is being called directly (i.e. as a function, not through the GUI).
        Returns:
        predictions (list): A list of predictions (not post-processed).
        durations (list): A list of durations for each prediction (only if `return_duration` is True).
        """
        if self.api_mode:  # Serialize the input
            processed_input = [input_component.serialize(processed_input[i], called_directly)
                            for i, input_component in enumerate(self.input_components)]
        predictions = []
        durations = []
        output_component_counter = 0

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

            if len(self.output_components) == len(self.predict):
                prediction = [prediction]

            if self.api_mode:  # Serialize the input
                prediction_ = copy.deepcopy(prediction)
                prediction = []
                for pred in prediction_:  # Done this way to handle both single interfaces with multiple outputs and Parallel() interfaces
                    prediction.append(self.output_components[output_component_counter].deserialize(pred))
                    output_component_counter += 1

            durations.append(duration)
            predictions.extend(prediction)

        if return_duration:
            return predictions, durations
        else:
            return predictions

    def process(self, raw_input):
        """
        Parameters:
        raw_input: a list of raw inputs to process and apply the prediction(s) on.
        Returns:
        processed output: a list of processed  outputs to return as the prediction(s).
        duration: a list of time deltas measuring inference time for each prediction fn.
        """
        processed_input = [input_component.preprocess(raw_input[i])
                           for i, input_component in enumerate(self.input_components)]
        predictions, durations = self.run_prediction(
            processed_input, return_duration=True)
        processed_output = [output_component.postprocess(predictions[i]) if predictions[i] is not None else None 
                            for i, output_component in enumerate(self.output_components)]
        return processed_output, durations

    def interpret(self, raw_input):
        """
        Runs the interpretation command for the machine learning model. Handles both the "default" out-of-the-box
        interpretation for a certain set of UI component types, as well as the custom interpretation case.
        Parameters:
        raw_input: a list of raw inputs to apply the interpretation(s) on.
        """
        if isinstance(self.interpretation, list):  # Either "default" or "shap"
            processed_input = [input_component.preprocess(raw_input[i])
                               for i, input_component in enumerate(self.input_components)]
            original_output = self.run_prediction(processed_input)
            scores, alternative_outputs = [], []
            for i, (x, interp) in enumerate(zip(raw_input, self.interpretation)):
                if interp == "default":
                    input_component = self.input_components[i]
                    neighbor_raw_input = list(raw_input)
                    if input_component.interpret_by_tokens:
                        tokens, neighbor_values, masks = input_component.tokenize(
                            x)
                        interface_scores = []
                        alternative_output = []
                        for neighbor_input in neighbor_values:
                            neighbor_raw_input[i] = neighbor_input
                            processed_neighbor_input = [input_component.preprocess(neighbor_raw_input[i])
                                                        for i, input_component in enumerate(self.input_components)]
                            neighbor_output = self.run_prediction(
                                processed_neighbor_input)
                            processed_neighbor_output = [output_component.postprocess(
                                neighbor_output[i]) for i, output_component in enumerate(self.output_components)]

                            alternative_output.append(
                                processed_neighbor_output)
                            interface_scores.append(quantify_difference_in_label(
                                self, original_output, neighbor_output))
                        alternative_outputs.append(alternative_output)
                        scores.append(
                            input_component.get_interpretation_scores(
                                raw_input[i], neighbor_values, interface_scores, masks=masks, tokens=tokens))
                    else:
                        neighbor_values, interpret_kwargs = input_component.get_interpretation_neighbors(
                            x)
                        interface_scores = []
                        alternative_output = []
                        for neighbor_input in neighbor_values:
                            neighbor_raw_input[i] = neighbor_input
                            processed_neighbor_input = [input_component.preprocess(neighbor_raw_input[i])
                                                        for i, input_component in enumerate(self.input_components)]
                            neighbor_output = self.run_prediction(
                                processed_neighbor_input)
                            processed_neighbor_output = [output_component.postprocess(
                                neighbor_output[i]) for i, output_component in enumerate(self.output_components)]

                            alternative_output.append(
                                processed_neighbor_output)
                            interface_scores.append(quantify_difference_in_label(
                                self, original_output, neighbor_output))
                        alternative_outputs.append(alternative_output)
                        interface_scores = [-score for score in interface_scores]
                        scores.append(
                            input_component.get_interpretation_scores(
                                raw_input[i], neighbor_values, interface_scores, **interpret_kwargs))
                elif interp == "shap" or interp == "shapley":
                    try:
                        import shap
                    except (ImportError, ModuleNotFoundError):
                        raise ValueError(
                            "The package `shap` is required for this interpretation method. Try: `pip install shap`")
                    input_component = self.input_components[i]
                    if not(input_component.interpret_by_tokens):
                        raise ValueError(
                            "Input component {} does not support `shap` interpretation".format(input_component))

                    tokens, _, masks = input_component.tokenize(x)

                    # construct a masked version of the input
                    def get_masked_prediction(binary_mask):
                        masked_xs = input_component.get_masked_inputs(
                            tokens, binary_mask)
                        preds = []
                        for masked_x in masked_xs:
                            processed_masked_input = copy.deepcopy(
                                processed_input)
                            processed_masked_input[i] = input_component.preprocess(
                                masked_x)
                            new_output = self.run_prediction(
                                processed_masked_input)
                            pred = get_regression_or_classification_value(
                                self, original_output, new_output)
                            preds.append(pred)
                        return np.array(preds)

                    num_total_segments = len(tokens)
                    explainer = shap.KernelExplainer(
                        get_masked_prediction, np.zeros((1, num_total_segments)))
                    shap_values = explainer.shap_values(np.ones((1, num_total_segments)), nsamples=int(
                        self.num_shap*num_total_segments), silent=True)
                    scores.append(input_component.get_interpretation_scores(
                        raw_input[i], None, shap_values[0], masks=masks, tokens=tokens))
                    alternative_outputs.append([])
                elif interp is None:
                    scores.append(None)
                    alternative_outputs.append([])
                else:
                    raise ValueError(
                        "Uknown intepretation method: {}".format(interp))
            return scores, alternative_outputs
        else:  # custom interpretation function
            processed_input = [input_component.preprocess(raw_input[i])
                               for i, input_component in enumerate(self.input_components)]
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

    def run_until_interrupted(self, thread, path_to_local_server):
        try:
            while True:
                time.sleep(0.5)
        except (KeyboardInterrupt, OSError):
            print("Keyboard interruption in main thread... closing server.")
            thread.keep_running = False
            # Hit the server one more time to close it
            networking.url_ok(path_to_local_server)
            if self.enable_queue:
                queue.close()

    def test_launch(self):
        for predict_fn in self.predict:
            print("Test launch: {}()...".format(predict_fn.__name__), end=' ')

            raw_input = []
            for input_component in self.input_components:
                if input_component.test_input is None:  # If no test input is defined for that input interface
                    print("SKIPPED")
                    break
                else:  # If a test input is defined for each interface object
                    raw_input.append(input_component.test_input)
            else:
                self.process(raw_input)
                print("PASSED")
                continue

    def launch(self, inline=None, inbrowser=None, share=False, debug=False,
               auth=None, auth_message=None, private_endpoint=None,
               prevent_thread_lock=False, show_error=True, server_name=None,
               server_port=None, show_tips=False, enable_queue=False):
        """
        Launches the webserver that serves the UI for the interface.
        Parameters:
        inline (bool): whether to display in the interface inline on python notebooks.
        inbrowser (bool): whether to automatically launch the interface in a new tab on the default browser.
        share (bool): whether to create a publicly shareable link from your computer for the interface.
        debug (bool): if True, and the interface was launched from Google Colab, prints the errors in the cell output.
        auth (Callable, Union[Tuple[str, str], List[Tuple[str, str]]]): If provided, username and password (or list of username-password tuples) required to access interface. Can also provide function that takes username and password and returns True if valid login.
        auth_message (str): If provided, HTML message provided on login page.
        private_endpoint (str): If provided, the public URL of the interface will be this endpoint (should generally be unchanged).
        prevent_thread_lock (bool): If True, the interface will block the main thread while the server is running.
        show_error (bool): If True, any errors in the interface will be printed in the browser console log
        server_port (int): will start gradio app on this port (if available) 
        server_name (str): to make app accessible on local network, set this to "0.0.0.0".
        show_tips (bool): if True, will occasionally show tips about new Gradio features
        enable_queue (bool): if True, inference requests will be served through a queue instead of with parallel threads. Required for longer inference times (> 1min) to prevent timeout.  
        Returns:
        app (flask.Flask): Flask app object
        path_to_local_server (str): Locally accessible link
        share_url (str): Publicly accessible link (if share=True)
        """
        # Set up local flask server
        config = self.get_config_file()
        self.config = config
        if auth and not callable(auth) and not isinstance(auth[0], tuple) and not isinstance(auth[0], list):
            auth = [auth]
        self.auth = auth
        self.auth_message = auth_message
        self.show_tips = show_tips
        self.show_error = show_error

        # Request key for encryption
        if self.encrypt:
            self.encryption_key = encryptor.get_key(
                getpass.getpass("Enter key for encryption: "))

        # Store parameters
        if self.enable_queue is None:
            self.enable_queue = enable_queue

        # Launch local flask server
        server_port, path_to_local_server, app, thread, server = networking.start_server(
            self, server_name, server_port, self.auth)
        self.local_url = path_to_local_server
        self.server_port = server_port
        self.status = "RUNNING"
        self.server = server
        self.server_app = app
        self.server_thread = thread

        # Count number of launches
        utils.launch_counter()

        # If running in a colab or not able to access localhost, automatically create a shareable link
        is_colab = utils.colab_check()
        if is_colab or not(networking.url_ok(path_to_local_server)):
            share = True
            if is_colab:
                if debug:
                    print(strings.en["COLAB_DEBUG_TRUE"])
                else:
                    print(strings.en["COLAB_DEBUG_FALSE"])
        else:
            print(strings.en["RUNNING_LOCALLY"].format(path_to_local_server))
        if is_colab and self.requires_permissions:
            print(strings.en["MEDIA_PERMISSIONS_IN_COLAB"])

        if private_endpoint is not None:
            share = True
        # Set up shareable link
        self.share = share

        if share:
            try:
                share_url = networking.setup_tunnel(
                    server_port, private_endpoint)
                self.share_url = share_url
                print(strings.en["SHARE_LINK_DISPLAY"].format(share_url))
                if private_endpoint:
                    print(strings.en["PRIVATE_LINK_MESSAGE"])
                else:
                    print(strings.en["SHARE_LINK_MESSAGE"])
            except RuntimeError:
                if self.analytics_enabled:
                    utils.error_analytics("RuntimeError")
                share_url = None
        else:
            print(strings.en["PUBLIC_SHARE_TRUE"])
            share_url = None

        # Open a browser tab with the interface.
        if inbrowser:
            if share:
                webbrowser.open(share_url)
            else:
                webbrowser.open(path_to_local_server)

        # Check if running in a Python notebook in which case, display inline
        if inline is None:
            inline = utils.ipython_check()
        if inline:
            try:
                from IPython.display import IFrame, display
                # Embed the remote interface page if on google colab; otherwise, embed the local page.
                if share:
                    while not networking.url_ok(share_url):
                        time.sleep(1)
                    display(IFrame(share_url, width=self.width, height=self.height))
                else:
                    display(IFrame(path_to_local_server,
                            width=self.width, height=self.height))
            except ImportError:
                pass  # IPython is not available so does not print inline.

        data = {
            'launch_method': 'browser' if inbrowser else 'inline',
            'is_google_colab': is_colab,
            'is_sharing_on': share,
            'share_url': share_url,
            'ip_address': self.ip_address,
            'enable_queue': self.enable_queue,
            'show_tips': self.show_tips,
            'api_mode': self.api_mode,
            'server_name': server_name,
            'server_port': server_port,
        }
        if self.analytics_enabled:
            utils.launch_analytics(data)

        utils.show_tip(self)

        # Run server perpetually under certain circumstances
        if debug or int(os.getenv('GRADIO_DEBUG', 0)) == 1:
            while True:
                sys.stdout.flush()
                time.sleep(0.1)
        is_in_interactive_mode = bool(
            getattr(sys, 'ps1', sys.flags.interactive))
        if not prevent_thread_lock and not is_in_interactive_mode:
            self.run_until_interrupted(thread, path_to_local_server)

        return app, path_to_local_server, share_url

    def close(self, verbose=True):
        """
        Closes the Interface that was launched. This will close the server and free the port.
        """
        try:
            self.server.shutdown()
            self.server_thread.join()
            print("Closing server running on port: {}".format(self.server_port))
        except AttributeError: # can't close if not running
            pass
        except OSError: # sometimes OSError is thrown when shutting down
            pass

    def integrate(self, comet_ml=None, wandb=None, mlflow=None):
        """
        A catch-all method for integrating with other libraries. Should be run after launch()
        Parameters:
            comet_ml (Experiment): If a comet_ml Experiment object is provided, will integrate with the experiment and appear on Comet dashboard
            wandb (module): If the wandb module is provided, will integrate with it and appear on WandB dashboard
            mlflow (module): If the mlflow module  is provided, will integrate with the experiment and appear on ML Flow dashboard
        """
        analytics_integration = ""
        if comet_ml is not None:
            analytics_integration = "CometML"
            comet_ml.log_other("Created from", "Gradio")
            if self.share_url is not None:
                comet_ml.log_text("gradio: " + self.share_url)
                comet_ml.end()
            else:
                comet_ml.log_text("gradio: " + self.local_url)
                comet_ml.end()
        if wandb is not None:
            analytics_integration = "WandB"
            if self.share_url is not None:
                wandb.log({"Gradio panel": wandb.Html('<iframe src="' + self.share_url + '" width="' +
                          str(self.width) + '" height="' + str(self.height) + '" frameBorder="0"></iframe>')})
            else:
                print(
                    "The WandB integration requires you to `launch(share=True)` first.")
        if mlflow is not None:
            analytics_integration = "MLFlow"
            if self.share_url is not None:
                mlflow.log_param("Gradio Interface Share Link",
                                 self.share_url)
            else:
                mlflow.log_param("Gradio Interface Local Link",
                                 self.local_url)
        if self.analytics_enabled and analytics_integration:
                data = {'integration': analytics_integration}
                utils.integration_analytics(data)


def close_all(verbose=True):
    # Tries to close all running interfaces, but method is a little flaky.
    for io in Interface.get_instances():
        io.close(verbose)


def reset_all():
    warnings.warn("The `reset_all()` method has been renamed to `close_all()` " 
    "and will be deprecated. Please use `close_all()` instead.")
    close_all()
