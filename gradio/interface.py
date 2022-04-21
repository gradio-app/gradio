"""
This is the core file in the `gradio` package, and defines the Interface class,
including various methods for constructing an interface and then launching it.
"""

from __future__ import annotations

import copy
import csv
import inspect
import os
import random
import re
import warnings
import weakref
from typing import TYPE_CHECKING, Any, Callable, List, Optional, Tuple

from markdown_it import MarkdownIt
from mdit_py_plugins.footnote import footnote_plugin

from gradio import context, interpretation, utils
from gradio.blocks import Blocks, Column, Row, TabItem, Tabs
from gradio.components import (
    Button,
    Component,
    Dataset,
    Interpretation,
    Markdown,
    StatusTracker,
    Variable,
    get_component_instance,
)
from gradio.external import load_from_pipeline, load_interface  # type: ignore
from gradio.flagging import CSVLogger, FlaggingCallback  # type: ignore
from gradio.inputs import State as i_State  # type: ignore
from gradio.outputs import State as o_State  # type: ignore
from gradio.process_examples import cache_interface_examples, load_from_cache

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    import transformers


class Interface(Blocks):
    """
    Gradio interfaces are created by constructing a `Interface` object
    with a locally-defined function, or with `Interface.load()` with the path
    to a repo or by `Interface.from_pipeline()` with a Transformers Pipeline.
    """

    # stores references to all currently existing Interface instances
    instances: weakref.WeakSet = weakref.WeakSet()

    @classmethod
    def get_instances(cls) -> List[Interface]:
        """
        :return: list of all current instances.
        """
        return list(Interface.instances)

    @classmethod
    def load(
        cls,
        name: str,
        src: Optional[str] = None,
        api_key: Optional[str] = None,
        alias: Optional[str] = None,
        **kwargs,
    ) -> Interface:
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
        kwargs = dict(interface_info, **kwargs)
        interface = cls(**kwargs)
        interface.api_mode = True  # So interface doesn't run pre/postprocess.
        return interface

    @classmethod
    def from_pipeline(cls, pipeline: transformers.Pipeline, **kwargs) -> Interface:
        """
        Construct an Interface from a Hugging Face transformers.Pipeline.
        Parameters:
        pipeline (transformers.Pipeline):
        Returns:
        (gradio.Interface): a Gradio Interface object from the given Pipeline

        Example usage:
            import gradio as gr
            from transformers import pipeline
            pipe = pipeline(model="lysandre/tiny-vit-random")
            gr.Interface.from_pipeline(pipe).launch()
        """
        interface_info = load_from_pipeline(pipeline)
        kwargs = dict(interface_info, **kwargs)
        interface = cls(**kwargs)
        return interface

    def __init__(
        self,
        fn: Callable | List[Callable],
        inputs: str | Component | List[str | Component] = None,
        outputs: str | Component | List[str | Component] = None,
        verbose: bool = False,
        examples: Optional[List[Any] | List[List[Any]] | str] = None,
        cache_examples: bool = False,
        examples_per_page: int = 10,
        live: bool = False,
        layout: str = "unaligned",
        show_input: bool = True,
        show_output: bool = True,
        capture_session: Optional[bool] = None,
        interpretation: Optional[Callable | str] = None,
        num_shap: float = 2.0,
        theme: Optional[str] = None,
        repeat_outputs_per_model: bool = True,
        title: Optional[str] = None,
        description: Optional[str] = None,
        article: Optional[str] = None,
        thumbnail: Optional[str] = None,
        css: Optional[str] = None,
        height=None,
        width=None,
        allow_screenshot: bool = False,
        allow_flagging: Optional[str] = None,
        flagging_options: List[str] = None,
        encrypt=None,
        show_tips=None,
        flagging_dir: str = "flagged",
        analytics_enabled: Optional[bool] = None,
        server_name=None,
        server_port=None,
        enable_queue=None,
        api_mode=None,
        flagging_callback: FlaggingCallback = CSVLogger(),
    ):  # TODO: (faruk) Let's remove depreceated parameters in the version 3.0.0
        """
        Parameters:
        fn (Union[Callable, List[Callable]]): the function to wrap an interface around.
        inputs (Union[str, InputComponent, List[Union[str, InputComponent]]]): a single Gradio input component, or list of Gradio input components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of input components should match the number of parameters in fn.
        outputs (Union[str, OutputComponent, List[Union[str, OutputComponent]]]): a single Gradio output component, or list of Gradio output components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of output components should match the number of values returned by fn.
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
        theme (str): Theme to use - one of "default", "huggingface", "seafoam", "grass", "peach". Add "dark-" prefix, e.g. "dark-peach" for dark theme (or just "dark" for the default dark theme).
        css (str): custom css or path to custom css file to use with interface.
        allow_screenshot (bool): DEPRECATED if False, users will not see a button to take a screenshot of the interface.
        allow_flagging (str): one of "never", "auto", or "manual". If "never" or "auto", users will not see a button to flag an input and output. If "manual", users will see a button to flag. If "auto", every prediction will be automatically flagged. If "manual", samples are flagged when the user clicks flag button. Can be set with environmental variable GRADIO_ALLOW_FLAGGING.
        flagging_options (List[str]): if provided, allows user to select from the list of options when flagging. Only applies if allow_flagging is "manual".
        encrypt (bool): DEPRECATED. If True, flagged data will be encrypted by key provided by creator at launch
        flagging_dir (str): what to name the dir where flagged data is stored.
        show_tips (bool): DEPRECATED. if True, will occasionally show tips about new Gradio features
        enable_queue (bool): DEPRECATED. if True, inference requests will be served through a queue instead of with parallel threads. Required for longer inference times (> 1min) to prevent timeout.
        api_mode (bool): DEPRECATED. If True, will skip preprocessing steps when the Interface is called() as a function (should remain False unless the Interface is loaded from an external repo)
        server_name (str): DEPRECATED. Name of the server to use for serving the interface - pass in launch() instead.
        server_port (int): DEPRECATED. Port of the server to use for serving the interface - pass in launch() instead.
        """
        super().__init__(analytics_enabled=analytics_enabled, mode="interface")

        if not isinstance(fn, list):
            fn = [fn]
        if not isinstance(inputs, list):
            inputs = [inputs]
        if not isinstance(outputs, list):
            outputs = [outputs]

        if "state" in inputs or "state" in outputs:
            state_input_count = len([i for i in inputs if i == "state"])
            state_output_count = len([o for o in outputs if o == "state"])
            if state_input_count != 1 or state_output_count != 1:
                raise ValueError(
                    "If using 'state', there must be exactly one state input and one state output."
                )
            default = utils.get_default_args(fn[0])[inputs.index("state")]
            state_variable = Variable(default_value=default)
            inputs[inputs.index("state")] = state_variable
            outputs[outputs.index("state")] = state_variable

        self.input_components = [get_component_instance(i) for i in inputs]
        self.output_components = [get_component_instance(o) for o in outputs]
        for o in self.output_components:
            o.interactive = (
                False  # Force output components to be treated as non-interactive
            )

        if repeat_outputs_per_model:
            self.output_components *= len(fn)

        if (
            interpretation is None
            or isinstance(interpretation, list)
            or callable(interpretation)
        ):
            self.interpretation = interpretation
        elif isinstance(interpretation, str):
            self.interpretation = [
                interpretation.lower() for _ in self.input_components
            ]
        else:
            raise ValueError("Invalid value for parameter: interpretation")

        self.predict = fn
        self.predict_durations = [[0, 0]] * len(fn)
        self.function_names = [func.__name__ for func in fn]
        self.__name__ = ", ".join(self.function_names)

        if verbose:
            warnings.warn(
                "The `verbose` parameter in the `Interface`"
                "is deprecated and has no effect."
            )
        if allow_screenshot:
            warnings.warn(
                "The `allow_screenshot` parameter in the `Interface`"
                "is deprecated and has no effect."
            )

        self.live = live
        self.layout = layout
        self.show_input = show_input
        self.show_output = show_output
        self.flag_hash = random.getrandbits(32)
        self.capture_session = capture_session

        if capture_session is not None:
            warnings.warn(
                "The `capture_session` parameter in the `Interface`"
                " is deprecated and may be removed in the future."
            )
            try:
                import tensorflow as tf

                self.session = tf.get_default_graph(), tf.keras.backend.get_session()
            except (ImportError, AttributeError):
                # If they are using TF >= 2.0 or don't have TF,
                # just ignore this parameter.
                pass

        if server_name is not None or server_port is not None:
            raise DeprecationWarning(
                "The `server_name` and `server_port` parameters in `Interface`"
                "are deprecated. Please pass into launch() instead."
            )

        self.session = None
        self.title = title

        CLEANER = re.compile("<.*?>")

        def clean_html(raw_html):
            cleantext = re.sub(CLEANER, "", raw_html)
            return cleantext

        md = MarkdownIt(
            "js-default",
            {
                "linkify": True,
                "typographer": True,
                "html": True,
            },
        ).use(footnote_plugin)

        simple_description = None
        if description is not None:
            description = md.render(description)
            simple_description = clean_html(description)
        self.simple_description = simple_description
        self.description = description
        if article is not None:
            article = utils.readme_to_html(article)
            article = md.render(article)
        self.article = article

        self.thumbnail = thumbnail
        theme = theme if theme is not None else os.getenv("GRADIO_THEME", "default")
        self.is_space = True if os.getenv("SYSTEM") == "spaces" else False
        DEPRECATED_THEME_MAP = {
            "darkdefault": "default",
            "darkhuggingface": "dark-huggingface",
            "darkpeach": "dark-peach",
            "darkgrass": "dark-grass",
        }
        VALID_THEME_SET = (
            "default",
            "huggingface",
            "seafoam",
            "grass",
            "peach",
            "dark",
            "dark-huggingface",
            "dark-seafoam",
            "dark-grass",
            "dark-peach",
        )
        if theme in DEPRECATED_THEME_MAP:
            warnings.warn(
                f"'{theme}' theme name is deprecated, using {DEPRECATED_THEME_MAP[theme]} instead."
            )
            theme = DEPRECATED_THEME_MAP[theme]
        elif theme not in VALID_THEME_SET:
            raise ValueError(
                f"Invalid theme name, theme must be one of: {', '.join(VALID_THEME_SET)}"
            )
        self.theme = theme

        self.height = height
        self.width = width
        if self.height is not None or self.width is not None:
            warnings.warn(
                "The `height` and `width` parameters in `Interface` "
                "are deprecated and should be passed into launch()."
            )

        if css is not None and os.path.exists(css):
            with open(css) as css_file:
                self.css = css_file.read()
        else:
            self.css = css
        if examples is None or (
            isinstance(examples, list)
            and (len(examples) == 0 or isinstance(examples[0], list))
        ):
            self.examples = examples
        elif (
            isinstance(examples, list) and len(self.input_components) == 1
        ):  # If there is only one input component, examples can be provided as a regular list instead of a list of lists
            self.examples = [[e] for e in examples]
        elif isinstance(examples, str):
            if not os.path.exists(examples):
                raise FileNotFoundError(
                    "Could not find examples directory: " + examples
                )
            log_file = os.path.join(examples, "log.csv")
            if not os.path.exists(log_file):
                if len(self.input_components) == 1:
                    exampleset = [
                        [os.path.join(examples, item)] for item in os.listdir(examples)
                    ]
                else:
                    raise FileNotFoundError(
                        "Could not find log file (required for multiple inputs): "
                        + log_file
                    )
            else:
                with open(log_file) as logs:
                    exampleset = list(csv.reader(logs))
                    exampleset = exampleset[1:]  # remove header
            for i, example in enumerate(exampleset):
                for j, (component, cell) in enumerate(
                    zip(
                        self.input_components + self.output_components,
                        example,
                    )
                ):
                    exampleset[i][j] = component.restore_flagged(
                        examples,
                        cell,
                        None,
                    )
            self.examples = exampleset
        else:
            raise ValueError(
                "Examples argument must either be a directory or a nested "
                "list, where each sublist represents a set of inputs."
            )
        self.num_shap = num_shap
        self.examples_per_page = examples_per_page

        self.simple_server = None
        self.allow_screenshot = allow_screenshot

        # For analytics_enabled and allow_flagging: (1) first check for
        # parameter, (2) check for env variable, (3) default to True/"manual"
        self.analytics_enabled = (
            analytics_enabled
            if analytics_enabled is not None
            else os.getenv("GRADIO_ANALYTICS_ENABLED", "True") == "True"
        )
        if allow_flagging is None:
            allow_flagging = os.getenv("GRADIO_ALLOW_FLAGGING", "manual")
        if allow_flagging is True:
            warnings.warn(
                "The `allow_flagging` parameter in `Interface` now"
                "takes a string value ('auto', 'manual', or 'never')"
                ", not a boolean. Setting parameter to: 'manual'."
            )
            self.allow_flagging = "manual"
        elif allow_flagging == "manual":
            self.allow_flagging = "manual"
        elif allow_flagging is False:
            warnings.warn(
                "The `allow_flagging` parameter in `Interface` now"
                "takes a string value ('auto', 'manual', or 'never')"
                ", not a boolean. Setting parameter to: 'never'."
            )
            self.allow_flagging = "never"
        elif allow_flagging == "never":
            self.allow_flagging = "never"
        elif allow_flagging == "auto":
            self.allow_flagging = "auto"
        else:
            raise ValueError(
                "Invalid value for `allow_flagging` parameter."
                "Must be: 'auto', 'manual', or 'never'."
            )

        self.flagging_options = flagging_options
        self.flagging_callback = flagging_callback
        self.flagging_dir = flagging_dir

        self.save_to = None  # Used for selenium tests
        self.share = None
        self.share_url = None
        self.local_url = None

        if show_tips is not None:
            warnings.warn(
                "The `show_tips` parameter in the `Interface` is deprecated. Please use the `show_tips` parameter in `launch()` instead"
            )

        self.requires_permissions = any(
            [component.requires_permissions for component in self.input_components]
        )

        self.favicon_path = None
        self.height = height
        self.width = width
        if self.height is not None or self.width is not None:
            warnings.warn(
                "The `width` and `height` parameters in the `Interface` class"
                "will be deprecated. Please provide these parameters"
                "in `launch()` instead"
            )

        self.encrypt = encrypt
        if self.encrypt is not None:
            warnings.warn(
                "The `encrypt` parameter in the `Interface` class"
                "will be deprecated. Please provide this parameter"
                "in `launch()` instead"
            )

        if api_mode is not None:
            warnings.warn("The `api_mode` parameter in the `Interface` is deprecated.")
        self.api_mode = False

        data = {
            "fn": fn,
            "inputs": inputs,
            "outputs": outputs,
            "live": live,
            "capture_session": capture_session,
            "ip_address": self.ip_address,
            "interpretation": interpretation,
            "allow_flagging": allow_flagging,
            "allow_screenshot": allow_screenshot,
            "custom_css": self.css is not None,
            "theme": self.theme,
        }

        if self.analytics_enabled:
            utils.initiated_analytics(data)

        utils.version_check()
        Interface.instances.add(self)

        param_names = inspect.getfullargspec(self.predict[0])[0]
        for component, param_name in zip(self.input_components, param_names):
            if component.label is None:
                component.label = param_name
        for i, component in enumerate(self.output_components):
            if component.label is None:
                component.label = "output_" + str(i)

        self.cache_examples = cache_examples
        if cache_examples:
            cache_interface_examples(self)

        if self.allow_flagging != "never":
            self.flagging_callback.setup(
                self.input_components + self.output_components, self.flagging_dir
            )

        with self:
            if self.title:
                Markdown(
                    "<h1 style='text-align: center; margin-bottom: 1rem'>"
                    + self.title
                    + "</h1>"
                )
            if self.description:
                Markdown(self.description)
            with Row():
                with Column(
                    css={
                        "background-color": "rgb(249,250,251)",
                        "padding": "0.5rem",
                        "border-radius": "0.5rem",
                    }
                ):
                    input_component_column = Column()
                    with input_component_column:
                        for component in self.input_components:
                            component.render()
                    if self.interpretation:
                        interpret_component_column = Column(visible=False)
                        interpretation_set = []
                        with interpret_component_column:
                            for component in self.input_components:
                                interpretation_set.append(Interpretation(component))
                    with Row():
                        clear_btn = Button("Clear")
                        if not self.live:
                            submit_btn = Button("Submit")
                with Column(
                    css={
                        "background-color": "rgb(249,250,251)",
                        "padding": "0.5rem",
                        "border-radius": "0.5rem",
                    }
                ):
                    status_tracker = StatusTracker(cover_container=True)
                    for component in self.output_components:
                        component.render()
                    with Row():
                        flag_btn = Button("Flag")
                        if self.interpretation:
                            interpretation_btn = Button("Interpret")
            submit_fn = (
                lambda *args: self.run_prediction(args)[0]
                if len(self.output_components) == 1
                else self.run_prediction(args)
            )
            if self.live:
                for component in self.input_components:
                    component.change(
                        submit_fn, self.input_components, self.output_components
                    )
            else:
                submit_btn.click(
                    submit_fn,
                    self.input_components,
                    self.output_components,
                    status_tracker=status_tracker,
                )
            clear_btn.click(
                (
                    lambda: [
                        component.default_value
                        if hasattr(component, "default_value")
                        else None
                        for component in self.input_components + self.output_components
                    ]
                    + [True]
                    + ([False] if self.interpretation else [])
                ),
                [],
                (
                    self.input_components
                    + self.output_components
                    + [input_component_column]
                    + ([interpret_component_column] if self.interpretation else [])
                ),
            )
            if self.examples:
                examples = Dataset(
                    components=self.input_components,
                    samples=self.examples,
                    type="index",
                )

                def load_example(example_id):
                    processed_examples = [
                        component.preprocess_example(sample)
                        for component, sample in zip(
                            self.input_components, self.examples[example_id]
                        )
                    ]
                    if self.cache_examples:
                        processed_examples += load_from_cache(self, example_id)
                    if len(processed_examples) == 1:
                        return processed_examples[0]
                    else:
                        return processed_examples

                examples._click_no_postprocess(
                    load_example,
                    inputs=[examples],
                    outputs=self.input_components
                    + (self.output_components if self.cache_examples else []),
                )

            flag_btn._click_no_preprocess(
                lambda *flag_data: self.flagging_callback.flag(flag_data),
                inputs=self.input_components + self.output_components,
                outputs=[],
            )
            if self.interpretation:
                interpretation_btn._click_no_preprocess(
                    lambda *data: self.interpret(data) + [False, True],
                    inputs=self.input_components + self.output_components,
                    outputs=interpretation_set
                    + [input_component_column, interpret_component_column],
                    status_tracker=status_tracker,
                )

    def __call__(self, *params):
        if (
            self.api_mode
        ):  # skip the preprocessing/postprocessing if sending to a remote API
            output = self.run_prediction(params, called_directly=True)
        else:
            output = self.process(params)
        return output[0] if len(output) == 1 else output

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        repr = "Gradio Interface for: {}".format(
            ", ".join(fn.__name__ for fn in self.predict)
        )
        repr += "\n" + "-" * len(repr)
        repr += "\ninputs:"
        for component in self.input_components:
            repr += "\n|-{}".format(str(component))
        repr += "\noutputs:"
        for component in self.output_components:
            repr += "\n|-{}".format(str(component))
        return repr

    def render_basic_interface(self):
        Interface(
            fn=self.predict,
            inputs=self.input_components,
            outputs=self.output_components,
            examples=self.examples,
            examples_per_page=self.examples_per_page,
            live=self.live,
            layout=self.layout,
            interpretation=self.interpretation,
            num_shap=self.num_shap,
            title=self.title,
            description=self.description,
            article=self.article,
            allow_flagging=self.allow_flagging,
            flagging_options=self.flagging_options,
            flagging_dir=self.flagging_dir,
        )

    def run_prediction(
        self,
        processed_input: List[Any],
        called_directly: bool = False,
    ) -> List[Any] | Tuple[List[Any], List[float]]:
        """
        Runs the prediction function with the given (already processed) inputs.
        Parameters:
        processed_input (list): A list of processed inputs.
        called_directly (bool): Whether the prediction is being called
            directly (i.e. as a function, not through the GUI).
        Returns:
        predictions (list): A list of predictions (not post-processed).
        """
        if self.api_mode:  # Serialize the input
            processed_input = [
                input_component.serialize(processed_input[i], called_directly)
                for i, input_component in enumerate(self.input_components)
            ]
        predictions = []
        output_component_counter = 0

        for predict_fn in self.predict:
            if self.capture_session and self.session is not None:  # For TF 1.x
                graph, sess = self.session
                with graph.as_default(), sess.as_default():
                    prediction = predict_fn(*processed_input)
            else:
                prediction = predict_fn(*processed_input)

            if len(self.output_components) == len(self.predict):
                prediction = [prediction]

            if self.api_mode:  # Serialize the input
                prediction_ = copy.deepcopy(prediction)
                prediction = []
                for (
                    pred
                ) in (
                    prediction_
                ):  # Done this way to handle both single interfaces with multiple outputs and Parallel() interfaces
                    prediction.append(
                        self.output_components[output_component_counter].deserialize(
                            pred
                        )
                    )
                    output_component_counter += 1

            predictions.extend(prediction)

        return predictions

    def process(self, raw_input: List[Any]) -> Tuple[List[Any], List[float]]:
        """
        First preprocesses the input, then runs prediction using
        self.run_prediction(), then postprocesses the output.
        Parameters:
        raw_input: a list of raw inputs to process and apply the prediction(s) on.
        Returns:
        processed output: a list of processed  outputs to return as the prediction(s).
        duration: a list of time deltas measuring inference time for each prediction fn.
        """
        processed_input = [
            input_component.preprocess(raw_input[i])
            for i, input_component in enumerate(self.input_components)
        ]
        predictions = self.run_prediction(processed_input)
        processed_output = [
            output_component.postprocess(predictions[i])
            if predictions[i] is not None
            else None
            for i, output_component in enumerate(self.output_components)
        ]
        return processed_output

    def interpret(self, raw_input: List[Any]) -> List[Any]:
        return [
            {"original": raw_value, "interpretation": interpretation}
            for interpretation, raw_value in zip(
                interpretation.run_interpret(self, raw_input)[0], raw_input
            )
        ]

    def test_launch(self) -> None:
        """
        Passes a few samples through the function to test if the inputs/outputs
        components are consistent with the function parameter and return values.
        """
        for predict_fn in self.predict:
            print("Test launch: {}()...".format(predict_fn.__name__), end=" ")
            raw_input = []
            for input_component in self.input_components:
                if input_component.test_input is None:
                    print("SKIPPED")
                    break
                else:
                    raw_input.append(input_component.test_input)
            else:
                self.process(raw_input)
                print("PASSED")
                continue

    def integrate(self, comet_ml=None, wandb=None, mlflow=None) -> None:
        """
        A catch-all method for integrating with other libraries.
        Should be run after launch()
        Parameters:
            comet_ml (Experiment): If a comet_ml Experiment object is provided,
            will integrate with the experiment and appear on Comet dashboard
            wandb (module): If the wandb module is provided, will integrate
            with it and appear on WandB dashboard
            mlflow (module): If the mlflow module  is provided, will integrate
            with the experiment and appear on ML Flow dashboard
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
                wandb.log(
                    {
                        "Gradio panel": wandb.Html(
                            '<iframe src="'
                            + self.share_url
                            + '" width="'
                            + str(self.width)
                            + '" height="'
                            + str(self.height)
                            + '" frameBorder="0"></iframe>'
                        )
                    }
                )
            else:
                print(
                    "The WandB integration requires you to "
                    "`launch(share=True)` first."
                )
        if mlflow is not None:
            analytics_integration = "MLFlow"
            if self.share_url is not None:
                mlflow.log_param("Gradio Interface Share Link", self.share_url)
            else:
                mlflow.log_param("Gradio Interface Local Link", self.local_url)
        if self.analytics_enabled and analytics_integration:
            data = {"integration": analytics_integration}
            utils.integration_analytics(data)


class TabbedInterface(Blocks):
    def __init__(
        self, interface_list: List[Interface], tab_names: Optional[List[str]] = None
    ):
        if tab_names is None:
            tab_names = ["Tab {}".format(i) for i in range(len(interface_list))]
        super().__init__()
        with self:
            with Tabs():
                for (interface, tab_name) in zip(interface_list, tab_names):
                    with TabItem(label=tab_name):
                        interface.render_basic_interface()


def close_all(verbose: bool = True) -> None:
    for io in Interface.get_instances():
        io.close(verbose)


def reset_all() -> None:
    warnings.warn(
        "The `reset_all()` method has been renamed to `close_all()` "
        "and will be deprecated. Please use `close_all()` instead."
    )
    close_all()
