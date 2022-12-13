"""
This is the core file in the `gradio` package, and defines the Interface class,
including various methods for constructing an interface and then launching it.
"""

from __future__ import annotations

import inspect
import json
import os
import pkgutil
import re
import warnings
import weakref
from enum import Enum, auto
from typing import TYPE_CHECKING, Any, Callable, List, Optional

from markdown_it import MarkdownIt
from mdit_py_plugins.dollarmath import dollarmath_plugin
from mdit_py_plugins.footnote import footnote_plugin

from gradio import Examples, interpretation, utils
from gradio.blocks import Blocks
from gradio.components import (
    Button,
    Component,
    Interpretation,
    IOComponent,
    Markdown,
    State,
    get_component_instance,
)
from gradio.documentation import document, set_documentation_group
from gradio.events import Changeable, Streamable
from gradio.flagging import CSVLogger, FlaggingCallback  # type: ignore
from gradio.layouts import Column, Row, TabItem, Tabs
from gradio.pipelines import load_from_pipeline  # type: ignore

set_documentation_group("interface")

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    import transformers


@document("launch", "load", "from_pipeline", "integrate", "queue")
class Interface(Blocks):
    """
    Interface is Gradio's main high-level class, and allows you to create a web-based GUI / demo
    around a machine learning model (or any Python function) in a few lines of code.
    You must specify three parameters: (1) the function to create a GUI for (2) the desired input components and
    (3) the desired output components. Additional parameters can be used to control the appearance
    and behavior of the demo.

    Example:
        import gradio as gr

        def image_classifier(inp):
            return {'cat': 0.3, 'dog': 0.7}

        demo = gr.Interface(fn=image_classifier, inputs="image", outputs="label")
        demo.launch()
    Demos: hello_world, hello_world_3, gpt_j
    Guides: quickstart, key_features, sharing_your_app, interface_state, reactive_interfaces, advanced_interface_features, setting_up_a_gradio_demo_for_maximum_performance
    """

    # stores references to all currently existing Interface instances
    instances: weakref.WeakSet = weakref.WeakSet()

    class InterfaceTypes(Enum):
        STANDARD = auto()
        INPUT_ONLY = auto()
        OUTPUT_ONLY = auto()
        UNIFIED = auto()

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
        Class method that constructs an Interface from a Hugging Face repo. Can accept
        model repos (if src is "models") or Space repos (if src is "spaces"). The input
        and output components are automatically loaded from the repo.
        Parameters:
            name: the name of the model (e.g. "gpt2" or "facebook/bart-base") or space (e.g. "flax-community/spanish-gpt2"), can include the `src` as prefix (e.g. "models/facebook/bart-base")
            src: the source of the model: `models` or `spaces` (or leave empty if source is provided as a prefix in `name`)
            api_key: optional access token for loading private Hugging Face Hub models or spaces. Find your token here: https://huggingface.co/settings/tokens
            alias: optional string used as the name of the loaded model instead of the default name (only applies if loading a Space running Gradio 2.x)
        Returns:
            a Gradio Interface object for the given model
        Example:
            import gradio as gr
            description = "Story generation with GPT"
            examples = [["An adventurer is approached by a mysterious stranger in the tavern for a new quest."]]
            demo = gr.Interface.load("models/EleutherAI/gpt-neo-1.3B", description=description, examples=examples)
            demo.launch()
        """
        return super().load(name=name, src=src, api_key=api_key, alias=alias, **kwargs)

    @classmethod
    def from_pipeline(cls, pipeline: transformers.Pipeline, **kwargs) -> Interface:
        """
        Class method that constructs an Interface from a Hugging Face transformers.Pipeline object.
        The input and output components are automatically determined from the pipeline.
        Parameters:
            pipeline: the pipeline object to use.
        Returns:
            a Gradio Interface object from the given Pipeline
        Example:
            import gradio as gr
            from transformers import pipeline
            pipe = pipeline("image-classification")
            gr.Interface.from_pipeline(pipe).launch()
        """
        interface_info = load_from_pipeline(pipeline)
        kwargs = dict(interface_info, **kwargs)
        interface = cls(**kwargs)
        return interface

    def __init__(
        self,
        fn: Callable,
        inputs: Optional[str | Component | List[str | Component]],
        outputs: Optional[str | Component | List[str | Component]],
        examples: Optional[List[Any] | List[List[Any]] | str] = None,
        cache_examples: Optional[bool] = None,
        examples_per_page: int = 10,
        live: bool = False,
        interpretation: Optional[Callable | str] = None,
        num_shap: float = 2.0,
        title: Optional[str] = None,
        description: Optional[str] = None,
        article: Optional[str] = None,
        thumbnail: Optional[str] = None,
        theme: Optional[str] = None,
        css: Optional[str] = None,
        allow_flagging: Optional[str] = None,
        flagging_options: List[str] = None,
        flagging_dir: str = "flagged",
        flagging_callback: FlaggingCallback = CSVLogger(),
        analytics_enabled: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        _api_mode: bool = False,
        **kwargs,
    ):
        """
        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: a single Gradio component, or list of Gradio components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of input components should match the number of parameters in fn. If set to None, then only the output components will be displayed.
            outputs: a single Gradio component, or list of Gradio components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of output components should match the number of values returned by fn. If set to None, then only the input components will be displayed.
            examples: sample inputs for the function; if provided, appear below the UI components and can be clicked to populate the interface. Should be nested list, in which the outer list consists of samples and each inner list consists of an input corresponding to each input component. A string path to a directory of examples can also be provided, but it should be within the directory with the python file running the gradio app. If there are multiple input components and a directory is provided, a log.csv file must be present in the directory to link corresponding inputs.
            cache_examples: If True, caches examples in the server for fast runtime in examples. The default option in HuggingFace Spaces is True. The default option elsewhere is False.
            examples_per_page: If examples are provided, how many to display per page.
            live: whether the interface should automatically rerun if any of the inputs change.
            interpretation: function that provides interpretation explaining prediction output. Pass "default" to use simple built-in interpreter, "shap" to use a built-in shapley-based interpreter, or your own custom interpretation function. For more information on the different interpretation methods, see the Advanced Interface Features guide.
            num_shap: a multiplier that determines how many examples are computed for shap-based interpretation. Increasing this value will increase shap runtime, but improve results. Only applies if interpretation is "shap".
            title: a title for the interface; if provided, appears above the input and output components in large font. Also used as the tab title when opened in a browser window.
            description: a description for the interface; if provided, appears above the input and output components and beneath the title in regular font. Accepts Markdown and HTML content.
            article: an expanded article explaining the interface; if provided, appears below the input and output components in regular font. Accepts Markdown and HTML content.
            thumbnail: path or url to image to use as display image when the web demo is shared on social media.
            theme: Theme to use - right now, only "default" is supported. Can be set with the GRADIO_THEME environment variable.
            css: custom css or path to custom css file to use with interface.
            allow_flagging: one of "never", "auto", or "manual". If "never" or "auto", users will not see a button to flag an input and output. If "manual", users will see a button to flag. If "auto", every prediction will be automatically flagged. If "manual", samples are flagged when the user clicks flag button. Can be set with environmental variable GRADIO_ALLOW_FLAGGING; otherwise defaults to "manual".
            flagging_options: if provided, allows user to select from the list of options when flagging. Only applies if allow_flagging is "manual".
            flagging_dir: what to name the directory where flagged data is stored.
            flagging_callback: An instance of a subclass of FlaggingCallback which will be called when a sample is flagged. By default logs to a local CSV file.
            analytics_enabled: Whether to allow basic telemetry. If None, will use GRADIO_ANALYTICS_ENABLED environment variable if defined, or default to True.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
        """
        super().__init__(
            analytics_enabled=analytics_enabled,
            mode="interface",
            css=css,
            title=title,
            theme=theme,
            **kwargs,
        )

        self.interface_type = self.InterfaceTypes.STANDARD
        if (inputs is None or inputs == []) and (outputs is None or outputs == []):
            raise ValueError("Must provide at least one of `inputs` or `outputs`")
        elif outputs is None or outputs == []:
            outputs = []
            self.interface_type = self.InterfaceTypes.INPUT_ONLY
        elif inputs is None or inputs == []:
            inputs = []
            self.interface_type = self.InterfaceTypes.OUTPUT_ONLY

        if isinstance(fn, list):
            raise DeprecationWarning(
                "The `fn` parameter only accepts a single function, support for a list "
                "of functions has been deprecated. Please use gradio.mix.Parallel "
                "instead."
            )

        if not isinstance(inputs, list):
            inputs = [inputs]
        if not isinstance(outputs, list):
            outputs = [outputs]

        if self.is_space and cache_examples is None:
            self.cache_examples = True
        else:
            self.cache_examples = cache_examples or False

        state_input_indexes = [
            idx for idx, i in enumerate(inputs) if i == "state" or isinstance(i, State)
        ]
        state_output_indexes = [
            idx for idx, o in enumerate(outputs) if o == "state" or isinstance(o, State)
        ]

        if len(state_input_indexes) == 0 and len(state_output_indexes) == 0:
            pass
        elif len(state_input_indexes) != 1 or len(state_output_indexes) != 1:
            raise ValueError(
                "If using 'state', there must be exactly one state input and one state output."
            )
        else:
            state_input_index = state_input_indexes[0]
            state_output_index = state_output_indexes[0]
            if inputs[state_input_index] == "state":
                default = utils.get_default_args(fn)[state_input_index]
                state_variable = State(value=default)
            else:
                state_variable = inputs[state_input_index]

            inputs[state_input_index] = state_variable
            outputs[state_output_index] = state_variable

            if cache_examples:
                warnings.warn(
                    "Cache examples cannot be used with state inputs and outputs."
                    "Setting cache_examples to False."
                )
            self.cache_examples = False

        self.input_components = [
            get_component_instance(i, render=False) for i in inputs
        ]
        self.output_components = [
            get_component_instance(o, render=False) for o in outputs
        ]

        for component in self.input_components + self.output_components:
            if not (isinstance(component, IOComponent)):
                raise ValueError(
                    f"{component} is not a valid input/output component for Interface."
                )

        if len(self.input_components) == len(self.output_components):
            same_components = [
                i is o for i, o in zip(self.input_components, self.output_components)
            ]
            if all(same_components):
                self.interface_type = self.InterfaceTypes.UNIFIED

        if self.interface_type in [
            self.InterfaceTypes.STANDARD,
            self.InterfaceTypes.OUTPUT_ONLY,
        ]:
            for o in self.output_components:
                o.interactive = False  # Force output components to be non-interactive

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

        self.api_mode = _api_mode
        self.fn = fn
        self.fn_durations = [0, 0]
        self.__name__ = getattr(fn, "__name__", "fn")
        self.live = live
        self.title = title

        CLEANER = re.compile("<.*?>")

        def clean_html(raw_html):
            cleantext = re.sub(CLEANER, "", raw_html)
            return cleantext

        md = (
            MarkdownIt(
                "js-default",
                {
                    "linkify": True,
                    "typographer": True,
                    "html": True,
                },
            )
            .use(dollarmath_plugin)
            .use(footnote_plugin)
            .enable("table")
        )

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
        self.theme = theme or os.getenv("GRADIO_THEME", "default")
        if not (self.theme == "default"):
            warnings.warn("Currently, only the 'default' theme is supported.")

        self.examples = examples
        self.num_shap = num_shap
        self.examples_per_page = examples_per_page

        self.simple_server = None

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

        self.favicon_path = None

        if self.analytics_enabled:
            data = {
                "mode": self.mode,
                "fn": fn,
                "inputs": inputs,
                "outputs": outputs,
                "live": live,
                "ip_address": self.ip_address,
                "interpretation": interpretation,
                "allow_flagging": allow_flagging,
                "custom_css": self.css is not None,
                "theme": self.theme,
                "version": pkgutil.get_data(__name__, "version.txt")
                .decode("ascii")
                .strip(),
            }
            utils.initiated_analytics(data)

        utils.version_check()
        Interface.instances.add(self)

        param_names = inspect.getfullargspec(self.fn)[0]
        for component, param_name in zip(self.input_components, param_names):
            if component.label is None:
                component.label = param_name
        for i, component in enumerate(self.output_components):
            if component.label is None:
                if len(self.output_components) == 1:
                    component.label = "output"
                else:
                    component.label = "output " + str(i)

        if self.allow_flagging != "never":
            if self.interface_type == self.InterfaceTypes.UNIFIED:
                self.flagging_callback.setup(self.input_components, self.flagging_dir)
            elif self.interface_type == self.InterfaceTypes.INPUT_ONLY:
                pass
            else:
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

            def render_flag_btns(flagging_options):
                if flagging_options is None:
                    return [(Button("Flag"), None)]
                else:
                    return [
                        (
                            Button("Flag as " + flag_option),
                            flag_option,
                        )
                        for flag_option in flagging_options
                    ]

            with Row().style(equal_height=False):
                if self.interface_type in [
                    self.InterfaceTypes.STANDARD,
                    self.InterfaceTypes.INPUT_ONLY,
                    self.InterfaceTypes.UNIFIED,
                ]:
                    with Column(variant="panel"):
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
                            if self.interface_type in [
                                self.InterfaceTypes.STANDARD,
                                self.InterfaceTypes.INPUT_ONLY,
                            ]:
                                clear_btn = Button("Clear")
                                if not self.live:
                                    submit_btn = Button("Submit", variant="primary")
                                    # Stopping jobs only works if the queue is enabled
                                    # We don't know if the queue is enabled when the interface
                                    # is created. We use whether a generator function is provided
                                    # as a proxy of whether the queue will be enabled.
                                    # Using a generator function without the queue will raise an error.
                                    if inspect.isgeneratorfunction(fn):
                                        stop_btn = Button("Stop", variant="stop")

                            elif self.interface_type == self.InterfaceTypes.UNIFIED:
                                clear_btn = Button("Clear")
                                submit_btn = Button("Submit", variant="primary")
                                if inspect.isgeneratorfunction(fn) and not self.live:
                                    stop_btn = Button("Stop", variant="stop")
                                if self.allow_flagging == "manual":
                                    flag_btns = render_flag_btns(self.flagging_options)

                if self.interface_type in [
                    self.InterfaceTypes.STANDARD,
                    self.InterfaceTypes.OUTPUT_ONLY,
                ]:

                    with Column(variant="panel"):
                        for component in self.output_components:
                            if not (isinstance(component, State)):
                                component.render()
                        with Row():
                            if self.interface_type == self.InterfaceTypes.OUTPUT_ONLY:
                                clear_btn = Button("Clear")
                                submit_btn = Button("Generate", variant="primary")
                                if inspect.isgeneratorfunction(fn) and not self.live:
                                    # Stopping jobs only works if the queue is enabled
                                    # We don't know if the queue is enabled when the interface
                                    # is created. We use whether a generator function is provided
                                    # as a proxy of whether the queue will be enabled.
                                    # Using a generator function without the queue will raise an error.
                                    stop_btn = Button("Stop", variant="stop")
                            if self.allow_flagging == "manual":
                                flag_btns = render_flag_btns(self.flagging_options)
                            if self.interpretation:
                                interpretation_btn = Button("Interpret")
            if self.live:
                if self.interface_type == self.InterfaceTypes.OUTPUT_ONLY:
                    super().load(self.fn, None, self.output_components)
                    submit_btn.click(
                        self.fn,
                        None,
                        self.output_components,
                        api_name="predict",
                        preprocess=not (self.api_mode),
                        postprocess=not (self.api_mode),
                        batch=batch,
                        max_batch_size=max_batch_size,
                    )
                else:
                    for component in self.input_components:
                        if isinstance(component, Streamable):
                            if component.streaming:
                                component.stream(
                                    self.fn,
                                    self.input_components,
                                    self.output_components,
                                    api_name="predict",
                                    preprocess=not (self.api_mode),
                                    postprocess=not (self.api_mode),
                                )
                                continue
                            else:
                                print(
                                    "Hint: Set streaming=True for "
                                    + component.__class__.__name__
                                    + " component to use live streaming."
                                )
                        if isinstance(component, Changeable):
                            component.change(
                                self.fn,
                                self.input_components,
                                self.output_components,
                                api_name="predict",
                                preprocess=not (self.api_mode),
                                postprocess=not (self.api_mode),
                            )
            else:
                pred = submit_btn.click(
                    self.fn,
                    self.input_components,
                    self.output_components,
                    api_name="predict",
                    scroll_to_output=True,
                    preprocess=not (self.api_mode),
                    postprocess=not (self.api_mode),
                    batch=batch,
                    max_batch_size=max_batch_size,
                )
                if inspect.isgeneratorfunction(fn):
                    stop_btn.click(
                        None,
                        inputs=None,
                        outputs=None,
                        cancels=[pred],
                    )

            clear_btn.click(
                None,
                [],
                (
                    self.input_components
                    + self.output_components
                    + (
                        [input_component_column]
                        if self.interface_type
                        in [
                            self.InterfaceTypes.STANDARD,
                            self.InterfaceTypes.INPUT_ONLY,
                            self.InterfaceTypes.UNIFIED,
                        ]
                        else []
                    )
                    + ([interpret_component_column] if self.interpretation else [])
                ),
                _js=f"""() => {json.dumps(
                    [component.cleared_value if hasattr(component, "cleared_value") else None
                     for component in self.input_components + self.output_components] + (
                        [Column.update(visible=True)]
                        if self.interface_type
                           in [
                               self.InterfaceTypes.STANDARD,
                               self.InterfaceTypes.INPUT_ONLY,
                               self.InterfaceTypes.UNIFIED,
                           ]
                        else []
                    )
                    + ([Column.update(visible=False)] if self.interpretation else [])
                )}
                """,
            )

            class FlagMethod:
                def __init__(self, flagging_callback, flag_option=None):
                    self.flagging_callback = flagging_callback
                    self.flag_option = flag_option
                    self.__name__ = "Flag"

                def __call__(self, *flag_data):
                    self.flagging_callback.flag(flag_data, flag_option=self.flag_option)

            if self.allow_flagging == "manual":
                if self.interface_type in [
                    self.InterfaceTypes.STANDARD,
                    self.InterfaceTypes.OUTPUT_ONLY,
                    self.InterfaceTypes.UNIFIED,
                ]:
                    if self.interface_type == self.InterfaceTypes.UNIFIED:
                        flag_components = self.input_components
                    else:
                        flag_components = self.input_components + self.output_components
                    for flag_btn, flag_option in flag_btns:
                        flag_method = FlagMethod(self.flagging_callback, flag_option)
                        flag_btn.click(
                            flag_method,
                            inputs=flag_components,
                            outputs=[],
                            preprocess=False,
                            queue=False,
                        )

            if self.examples:
                non_state_inputs = [
                    c for c in self.input_components if not isinstance(c, State)
                ]
                non_state_outputs = [
                    c for c in self.output_components if not isinstance(c, State)
                ]
                self.examples_handler = Examples(
                    examples=examples,
                    inputs=non_state_inputs,
                    outputs=non_state_outputs,
                    fn=self.fn,
                    cache_examples=self.cache_examples,
                    examples_per_page=examples_per_page,
                    _api_mode=_api_mode,
                    batch=batch,
                )

            if self.interpretation:
                interpretation_btn.click(
                    self.interpret_func,
                    inputs=self.input_components + self.output_components,
                    outputs=interpretation_set
                    + [input_component_column, interpret_component_column],
                    preprocess=False,
                )

            if self.article:
                Markdown(self.article)

        self.config = self.get_config_file()

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        repr = f"Gradio Interface for: {self.__name__}"
        repr += "\n" + "-" * len(repr)
        repr += "\ninputs:"
        for component in self.input_components:
            repr += "\n|-{}".format(str(component))
        repr += "\noutputs:"
        for component in self.output_components:
            repr += "\n|-{}".format(str(component))
        return repr

    async def interpret_func(self, *args):
        return await self.interpret(args) + [
            Column.update(visible=False),
            Column.update(visible=True),
        ]

    async def interpret(self, raw_input: List[Any]) -> List[Any]:
        return [
            {"original": raw_value, "interpretation": interpretation}
            for interpretation, raw_value in zip(
                (await interpretation.run_interpret(self, raw_input))[0], raw_input
            )
        ]

    def test_launch(self) -> None:
        """
        Passes a few samples through the function to test if the inputs/outputs
        components are consistent with the function parameter and return values.
        """
        print("Test launch: {}()...".format(self.__name__), end=" ")
        raw_input = []
        for input_component in self.input_components:
            if input_component.test_input is None:
                print("SKIPPED")
                break
            else:
                raw_input.append(input_component.test_input)
        else:
            self(raw_input)
            print("PASSED")


@document()
class TabbedInterface(Blocks):
    """
    A TabbedInterface is created by providing a list of Interfaces, each of which gets
    rendered in a separate tab.
    Demos: stt_or_tts
    """

    def __init__(
        self,
        interface_list: List[Interface],
        tab_names: Optional[List[str]] = None,
        theme: str = "default",
        analytics_enabled: Optional[bool] = None,
        css: Optional[str] = None,
    ):
        """
        Parameters:
            interface_list: a list of interfaces to be rendered in tabs.
            tab_names: a list of tab names. If None, the tab names will be "Tab 1", "Tab 2", etc.
            theme: which theme to use - right now, only "default" is supported.
            analytics_enabled: whether to allow basic telemetry. If None, will use GRADIO_ANALYTICS_ENABLED environment variable or default to True.
            css: custom css or path to custom css file to apply to entire Blocks
        Returns:
            a Gradio Tabbed Interface for the given interfaces
        """
        super().__init__(
            theme=theme,
            analytics_enabled=analytics_enabled,
            mode="tabbed_interface",
            css=css,
        )
        if tab_names is None:
            tab_names = ["Tab {}".format(i) for i in range(len(interface_list))]
        with self:
            with Tabs():
                for (interface, tab_name) in zip(interface_list, tab_names):
                    with TabItem(label=tab_name):
                        interface.render()


def close_all(verbose: bool = True) -> None:
    for io in Interface.get_instances():
        io.close(verbose)
