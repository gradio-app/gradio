"""
This file defines two useful high-level abstractions to build Gradio apps: Interface and TabbedInterface.
"""

from __future__ import annotations

import inspect
import json
import os
import warnings
import weakref
from typing import TYPE_CHECKING, Any, Callable, Literal

from gradio_client.documentation import document, set_documentation_group

from gradio import Examples, utils
from gradio.blocks import Blocks
from gradio.components import (
    Button,
    ClearButton,
    Component,
    DuplicateButton,
    Markdown,
    State,
    get_component_instance,
)
from gradio.data_classes import InterfaceTypes
from gradio.events import Events, on
from gradio.exceptions import RenderError
from gradio.flagging import CSVLogger, FlaggingCallback, FlagMethod
from gradio.layouts import Column, Row, Tab, Tabs
from gradio.pipelines import load_from_pipeline
from gradio.themes import ThemeClass as Theme

set_documentation_group("interface")

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from transformers.pipelines.base import Pipeline


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
    Demos: hello_world, hello_world_3, gpt2_xl
    Guides: quickstart, key-features, sharing-your-app, interface-state, reactive-interfaces, advanced-interface-features, setting-up-a-gradio-demo-for-maximum-performance
    """

    # stores references to all currently existing Interface instances
    instances: weakref.WeakSet = weakref.WeakSet()

    @classmethod
    def get_instances(cls) -> list[Interface]:
        """
        :return: list of all current instances.
        """
        return list(Interface.instances)

    @classmethod
    def from_pipeline(cls, pipeline: Pipeline, **kwargs) -> Interface:
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
        inputs: str | Component | list[str | Component] | None,
        outputs: str | Component | list[str | Component] | None,
        examples: list[Any] | list[list[Any]] | str | None = None,
        cache_examples: bool | None = None,
        examples_per_page: int = 10,
        live: bool = False,
        title: str | None = None,
        description: str | None = None,
        article: str | None = None,
        thumbnail: str | None = None,
        theme: Theme | str | None = None,
        css: str | None = None,
        allow_flagging: str | None = None,
        flagging_options: list[str] | list[tuple[str, str]] | None = None,
        flagging_dir: str = "flagged",
        flagging_callback: FlaggingCallback | None = None,
        analytics_enabled: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        api_name: str | Literal[False] | None = "predict",
        _api_mode: bool = False,
        allow_duplication: bool = False,
        concurrency_limit: int | None | Literal["default"] = "default",
        **kwargs,
    ):
        """
        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: a single Gradio component, or list of Gradio components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of input components should match the number of parameters in fn. If set to None, then only the output components will be displayed.
            outputs: a single Gradio component, or list of Gradio components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of output components should match the number of values returned by fn. If set to None, then only the input components will be displayed.
            examples: sample inputs for the function; if provided, appear below the UI components and can be clicked to populate the interface. Should be nested list, in which the outer list consists of samples and each inner list consists of an input corresponding to each input component. A string path to a directory of examples can also be provided, but it should be within the directory with the python file running the gradio app. If there are multiple input components and a directory is provided, a log.csv file must be present in the directory to link corresponding inputs.
            cache_examples: If True, caches examples in the server for fast runtime in examples. If `fn` is a generator function, then the last yielded value will be used as the output. The default option in HuggingFace Spaces is True. The default option elsewhere is False.
            examples_per_page: If examples are provided, how many to display per page.
            live: whether the interface should automatically rerun if any of the inputs change.
            title: a title for the interface; if provided, appears above the input and output components in large font. Also used as the tab title when opened in a browser window.
            description: a description for the interface; if provided, appears above the input and output components and beneath the title in regular font. Accepts Markdown and HTML content.
            article: an expanded article explaining the interface; if provided, appears below the input and output components in regular font. Accepts Markdown and HTML content.
            thumbnail: path or url to image to use as display image when the web demo is shared on social media.
            theme: Theme to use, loaded from gradio.themes.
            css: custom css or path to custom css file to use with interface.
            allow_flagging: one of "never", "auto", or "manual". If "never" or "auto", users will not see a button to flag an input and output. If "manual", users will see a button to flag. If "auto", every input the user submits will be automatically flagged (outputs are not flagged). If "manual", both the input and outputs are flagged when the user clicks flag button. This parameter can be set with environmental variable GRADIO_ALLOW_FLAGGING; otherwise defaults to "manual".
            flagging_options: if provided, allows user to select from the list of options when flagging. Only applies if allow_flagging is "manual". Can either be a list of tuples of the form (label, value), where label is the string that will be displayed on the button and value is the string that will be stored in the flagging CSV; or it can be a list of strings ["X", "Y"], in which case the values will be the list of strings and the labels will ["Flag as X", "Flag as Y"], etc.
            flagging_dir: what to name the directory where flagged data is stored.
            flagging_callback: None or an instance of a subclass of FlaggingCallback which will be called when a sample is flagged. If set to None, an instance of gradio.flagging.CSVLogger will be created and logs will be saved to a local CSV file in flagging_dir. Default to None.
            analytics_enabled: Whether to allow basic telemetry. If None, will use GRADIO_ANALYTICS_ENABLED environment variable if defined, or default to True.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            api_name: defines how the endpoint appears in the API docs. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given name. If None, the name of the prediction function will be used as the API endpoint. If False, the endpoint will not be exposed in the API docs and downstream apps (including those that `gr.load` this app) will not be able to use this event.
            allow_duplication: If True, then will show a 'Duplicate Spaces' button on Hugging Face Spaces.
            concurrency_limit: If set, this this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `.queue()`, which itself is 1 by default).
        """
        super().__init__(
            analytics_enabled=analytics_enabled,
            mode="interface",
            css=css,
            title=title or "Gradio",
            theme=theme,
            **kwargs,
        )
        self.api_name: str | Literal[False] | None = api_name
        self.interface_type = InterfaceTypes.STANDARD
        if (inputs is None or inputs == []) and (outputs is None or outputs == []):
            raise ValueError("Must provide at least one of `inputs` or `outputs`")
        elif outputs is None or outputs == []:
            outputs = []
            self.interface_type = InterfaceTypes.INPUT_ONLY
        elif inputs is None or inputs == []:
            inputs = []
            self.interface_type = InterfaceTypes.OUTPUT_ONLY

        assert isinstance(inputs, (str, list, Component))
        assert isinstance(outputs, (str, list, Component))

        if not isinstance(inputs, list):
            inputs = [inputs]
        if not isinstance(outputs, list):
            outputs = [outputs]

        if self.space_id and cache_examples is None:
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
                state_variable = State(value=default)  # type: ignore
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
            get_component_instance(i, unrender=True) for i in inputs  # type: ignore
        ]
        self.output_components = [
            get_component_instance(o, unrender=True) for o in outputs  # type: ignore
        ]

        for component in self.input_components + self.output_components:
            if not (isinstance(component, Component)):
                raise ValueError(
                    f"{component} is not a valid input/output component for Interface."
                )

        if len(self.input_components) == len(self.output_components):
            same_components = [
                i is o for i, o in zip(self.input_components, self.output_components)
            ]
            if all(same_components):
                self.interface_type = InterfaceTypes.UNIFIED

        if self.interface_type in [
            InterfaceTypes.STANDARD,
            InterfaceTypes.OUTPUT_ONLY,
        ]:
            for o in self.output_components:
                assert isinstance(o, Component)
                if o.interactive is None:
                    # Unless explicitly otherwise specified, force output components to
                    # be non-interactive
                    o.interactive = False

        self.api_mode = _api_mode
        self.fn = fn
        self.fn_durations = [0, 0]
        self.__name__ = getattr(fn, "__name__", "fn")
        self.live = live
        self.title = title

        self.simple_description = utils.remove_html_tags(description)
        self.description = description
        if article is not None:
            article = utils.readme_to_html(article)
        self.article = article

        self.thumbnail = thumbnail

        self.examples = examples
        self.examples_per_page = examples_per_page

        self.simple_server = None

        # For allow_flagging: (1) first check for parameter,
        # (2) check for env variable, (3) default to True/"manual"
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

        if flagging_options is None:
            self.flagging_options = [("Flag", "")]
        elif not (isinstance(flagging_options, list)):
            raise ValueError(
                "flagging_options must be a list of strings or list of (string, string) tuples."
            )
        elif all(isinstance(x, str) for x in flagging_options):
            self.flagging_options = [(f"Flag as {x}", x) for x in flagging_options]
        elif all(isinstance(x, tuple) for x in flagging_options):
            self.flagging_options = flagging_options
        else:
            raise ValueError(
                "flagging_options must be a list of strings or list of (string, string) tuples."
            )

        if flagging_callback is None:
            flagging_callback = CSVLogger()

        self.flagging_callback = flagging_callback
        self.flagging_dir = flagging_dir

        self.batch = batch
        self.max_batch_size = max_batch_size
        self.allow_duplication = allow_duplication
        self.concurrency_limit: int | None | Literal["default"] = concurrency_limit

        self.share = None
        self.share_url = None
        self.local_url = None

        self.favicon_path = None
        Interface.instances.add(self)

        param_types = utils.get_type_hints(self.fn)
        # param_names = inspect.getfullargspec(self.fn)[0]
        param_names = []
        try:
            param_names = inspect.getfullargspec(self.fn)[0]
            if len(param_names) > 0 and inspect.ismethod(self.fn):
                param_names = param_names[1:]
            for param_name in param_names.copy():
                if utils.is_special_typed_parameter(param_name, param_types):
                    param_names.remove(param_name)
        except (TypeError, ValueError):
            param_names = utils.default_input_labels()
        for component, param_name in zip(self.input_components, param_names):
            assert isinstance(component, Component)
            if component.label is None:
                component.label = param_name
        for i, component in enumerate(self.output_components):
            assert isinstance(component, Component)
            if component.label is None:
                if len(self.output_components) == 1:
                    component.label = "output"
                else:
                    component.label = f"output {i}"

        if self.allow_flagging != "never":
            if (
                self.interface_type == InterfaceTypes.UNIFIED
                or self.allow_flagging == "auto"
            ):
                self.flagging_callback.setup(self.input_components, self.flagging_dir)  # type: ignore
            elif self.interface_type == InterfaceTypes.INPUT_ONLY:
                pass
            else:
                self.flagging_callback.setup(
                    self.input_components + self.output_components, self.flagging_dir  # type: ignore
                )

        # Render the Gradio UI
        with self:
            self.render_title_description()

            submit_btn, clear_btn, stop_btn, flag_btns, duplicate_btn = (
                None,
                None,
                None,
                None,
                None,
            )
            input_component_column = None

            with Row(equal_height=False):
                if self.interface_type in [
                    InterfaceTypes.STANDARD,
                    InterfaceTypes.INPUT_ONLY,
                    InterfaceTypes.UNIFIED,
                ]:
                    (
                        submit_btn,
                        clear_btn,
                        stop_btn,
                        flag_btns,
                        input_component_column,
                    ) = self.render_input_column()
                if self.interface_type in [
                    InterfaceTypes.STANDARD,
                    InterfaceTypes.OUTPUT_ONLY,
                ]:
                    (
                        submit_btn_out,
                        clear_btn_2_out,
                        duplicate_btn,
                        stop_btn_2_out,
                        flag_btns_out,
                    ) = self.render_output_column(submit_btn)
                    submit_btn = submit_btn or submit_btn_out
                    clear_btn = clear_btn or clear_btn_2_out
                    stop_btn = stop_btn or stop_btn_2_out
                    flag_btns = flag_btns or flag_btns_out

            if clear_btn is None:
                raise RenderError("Clear button not rendered")

            self.attach_submit_events(submit_btn, stop_btn)
            self.attach_clear_events(clear_btn, input_component_column)
            if duplicate_btn is not None:
                duplicate_btn.activate()

            self.attach_flagging_events(flag_btns, clear_btn)
            self.render_examples()
            self.render_article()

        self.config = self.get_config_file()

    def render_title_description(self) -> None:
        if self.title:
            Markdown(
                f"<h1 style='text-align: center; margin-bottom: 1rem'>{self.title}</h1>"
            )
        if self.description:
            Markdown(self.description)

    def render_flag_btns(self) -> list[Button]:
        return [Button(label) for label, _ in self.flagging_options]

    def render_input_column(
        self,
    ) -> tuple[
        Button | None,
        ClearButton | None,
        Button | None,
        list[Button] | None,
        Column,
    ]:
        submit_btn, clear_btn, stop_btn, flag_btns = None, None, None, None

        with Column(variant="panel"):
            input_component_column = Column()
            with input_component_column:
                for component in self.input_components:
                    component.render()
            with Row():
                if self.interface_type in [
                    InterfaceTypes.STANDARD,
                    InterfaceTypes.INPUT_ONLY,
                ]:
                    clear_btn = ClearButton()
                    if not self.live:
                        submit_btn = Button("Submit", variant="primary")
                        # Stopping jobs only works if the queue is enabled
                        # We don't know if the queue is enabled when the interface
                        # is created. We use whether a generator function is provided
                        # as a proxy of whether the queue will be enabled.
                        # Using a generator function without the queue will raise an error.
                        if inspect.isgeneratorfunction(
                            self.fn
                        ) or inspect.isasyncgenfunction(self.fn):
                            stop_btn = Button("Stop", variant="stop", visible=False)
                elif self.interface_type == InterfaceTypes.UNIFIED:
                    clear_btn = ClearButton()
                    submit_btn = Button("Submit", variant="primary")
                    if (
                        inspect.isgeneratorfunction(self.fn)
                        or inspect.isasyncgenfunction(self.fn)
                    ) and not self.live:
                        stop_btn = Button("Stop", variant="stop")
                    if self.allow_flagging == "manual":
                        flag_btns = self.render_flag_btns()
                    elif self.allow_flagging == "auto":
                        flag_btns = [submit_btn]
        return (
            submit_btn,
            clear_btn,
            stop_btn,
            flag_btns,
            input_component_column,
        )

    def render_output_column(
        self,
        submit_btn_in: Button | None,
    ) -> tuple[
        Button | None,
        ClearButton | None,
        DuplicateButton | None,
        Button | None,
        list | None,
    ]:
        submit_btn = submit_btn_in
        clear_btn, duplicate_btn, flag_btns, stop_btn = (
            None,
            None,
            None,
            None,
        )

        with Column(variant="panel"):
            for component in self.output_components:
                if not (isinstance(component, State)):
                    component.render()
            with Row():
                if self.interface_type == InterfaceTypes.OUTPUT_ONLY:
                    clear_btn = ClearButton()
                    submit_btn = Button("Generate", variant="primary")
                    if (
                        inspect.isgeneratorfunction(self.fn)
                        or inspect.isasyncgenfunction(self.fn)
                    ) and not self.live:
                        # Stopping jobs only works if the queue is enabled
                        # We don't know if the queue is enabled when the interface
                        # is created. We use whether a generator function is provided
                        # as a proxy of whether the queue will be enabled.
                        # Using a generator function without the queue will raise an error.
                        stop_btn = Button("Stop", variant="stop", visible=False)
                if self.allow_flagging == "manual":
                    flag_btns = self.render_flag_btns()
                elif self.allow_flagging == "auto":
                    if submit_btn is None:
                        raise RenderError("Submit button not rendered")
                    flag_btns = [submit_btn]

                if self.allow_duplication:
                    duplicate_btn = DuplicateButton(scale=1, size="lg", _activate=False)

        return (
            submit_btn,
            clear_btn,
            duplicate_btn,
            stop_btn,
            flag_btns,
        )

    def render_article(self):
        if self.article:
            Markdown(self.article)

    def attach_submit_events(self, submit_btn: Button | None, stop_btn: Button | None):
        if self.live:
            if self.interface_type == InterfaceTypes.OUTPUT_ONLY:
                if submit_btn is None:
                    raise RenderError("Submit button not rendered")
                super().load(self.fn, None, self.output_components)
                # For output-only interfaces, the user probably still want a "generate"
                # button even if the Interface is live
                submit_btn.click(
                    self.fn,
                    None,
                    self.output_components,
                    api_name=self.api_name,
                    preprocess=not (self.api_mode),
                    postprocess=not (self.api_mode),
                    batch=self.batch,
                    max_batch_size=self.max_batch_size,
                )
            else:
                events: list[Callable] = []
                for component in self.input_components:
                    if component.has_event("stream") and component.streaming:  # type: ignore
                        events.append(component.stream)  # type: ignore
                    elif component.has_event("change"):
                        events.append(component.change)  # type: ignore
                on(
                    events,
                    self.fn,
                    self.input_components,
                    self.output_components,
                    api_name=self.api_name,
                    preprocess=not (self.api_mode),
                    postprocess=not (self.api_mode),
                )
        else:
            if submit_btn is None:
                raise RenderError("Submit button not rendered")
            fn = self.fn
            extra_output = []

            triggers = [submit_btn.click] + [
                component.submit  # type: ignore
                for component in self.input_components
                if component.has_event(Events.submit)
            ]

            if stop_btn:
                extra_output = [submit_btn, stop_btn]

                def cleanup():
                    return [Button(visible=True), Button(visible=False)]

                predict_event = on(
                    triggers,
                    lambda: (
                        Button(visible=False),
                        Button(visible=True),
                    ),
                    inputs=None,
                    outputs=[submit_btn, stop_btn],
                    queue=False,
                ).then(
                    self.fn,
                    self.input_components,
                    self.output_components,
                    api_name=self.api_name,
                    scroll_to_output=True,
                    preprocess=not (self.api_mode),
                    postprocess=not (self.api_mode),
                    batch=self.batch,
                    max_batch_size=self.max_batch_size,
                    concurrency_limit=self.concurrency_limit,
                )

                predict_event.then(
                    cleanup,
                    inputs=None,
                    outputs=extra_output,  # type: ignore
                    queue=False,
                )

                stop_btn.click(
                    cleanup,
                    inputs=None,
                    outputs=[submit_btn, stop_btn],
                    cancels=predict_event,
                    queue=False,
                    api_name=False,
                )
            else:
                on(
                    triggers,
                    fn,
                    self.input_components,
                    self.output_components,
                    api_name=self.api_name,
                    scroll_to_output=True,
                    preprocess=not (self.api_mode),
                    postprocess=not (self.api_mode),
                    batch=self.batch,
                    max_batch_size=self.max_batch_size,
                    concurrency_limit=self.concurrency_limit,
                )

    def attach_clear_events(
        self,
        clear_btn: ClearButton,
        input_component_column: Column | None,
    ):
        clear_btn.add(self.input_components + self.output_components)
        clear_btn.click(
            None,
            [],
            (
                [input_component_column] if input_component_column else []
            ),  # type: ignore
            js=f"""() => {json.dumps(
                
                    [{'variant': None, 'visible': True, '__type__': 'update'}]
                    if self.interface_type
                       in [
                           InterfaceTypes.STANDARD,
                           InterfaceTypes.INPUT_ONLY,
                           InterfaceTypes.UNIFIED,
                       ]
                    else []
                
            )}
            """,
        )

    def attach_flagging_events(
        self, flag_btns: list[Button] | None, clear_btn: ClearButton
    ):
        if not (
            flag_btns
            and self.interface_type
            in (
                InterfaceTypes.STANDARD,
                InterfaceTypes.OUTPUT_ONLY,
                InterfaceTypes.UNIFIED,
            )
        ):
            return

        if self.allow_flagging == "auto":
            flag_method = FlagMethod(
                self.flagging_callback, "", "", visual_feedback=False
            )
            flag_btns[0].click(  # flag_btns[0] is just the "Submit" button
                flag_method,
                inputs=self.input_components,
                outputs=None,
                preprocess=False,
                queue=False,
            )
            return

        if self.interface_type == InterfaceTypes.UNIFIED:
            flag_components = self.input_components
        else:
            flag_components = self.input_components + self.output_components

        for flag_btn, (label, value) in zip(flag_btns, self.flagging_options):
            assert isinstance(value, str)
            flag_method = FlagMethod(self.flagging_callback, label, value)
            flag_btn.click(
                lambda: Button(value="Saving...", interactive=False),
                None,
                flag_btn,
                queue=False,
                api_name=False,
            )
            flag_btn.click(
                flag_method,
                inputs=flag_components,
                outputs=flag_btn,
                preprocess=False,
                queue=False,
                api_name=False,
            )
            clear_btn.click(
                flag_method.reset, None, flag_btn, queue=False, api_name=False
            )

    def render_examples(self):
        if self.examples:
            non_state_inputs = [
                c for c in self.input_components if not isinstance(c, State)
            ]
            non_state_outputs = [
                c for c in self.output_components if not isinstance(c, State)
            ]
            self.examples_handler = Examples(
                examples=self.examples,
                inputs=non_state_inputs,  # type: ignore
                outputs=non_state_outputs,  # type: ignore
                fn=self.fn,
                cache_examples=self.cache_examples,
                examples_per_page=self.examples_per_page,
                _api_mode=self.api_mode,
                batch=self.batch,
            )

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        repr = f"Gradio Interface for: {self.__name__}"
        repr += f"\n{'-' * len(repr)}"
        repr += "\ninputs:"
        for component in self.input_components:
            repr += f"\n|-{component}"
        repr += "\noutputs:"
        for component in self.output_components:
            repr += f"\n|-{component}"
        return repr


@document()
class TabbedInterface(Blocks):
    """
    A TabbedInterface is created by providing a list of Interfaces, each of which gets
    rendered in a separate tab.
    Demos: stt_or_tts
    """

    def __init__(
        self,
        interface_list: list[Interface],
        tab_names: list[str] | None = None,
        title: str | None = None,
        theme: Theme | None = None,
        analytics_enabled: bool | None = None,
        css: str | None = None,
    ):
        """
        Parameters:
            interface_list: a list of interfaces to be rendered in tabs.
            tab_names: a list of tab names. If None, the tab names will be "Tab 1", "Tab 2", etc.
            title: a title for the interface; if provided, appears above the input and output components in large font. Also used as the tab title when opened in a browser window.
            analytics_enabled: whether to allow basic telemetry. If None, will use GRADIO_ANALYTICS_ENABLED environment variable or default to True.
            css: custom css or path to custom css file to apply to entire Blocks
        Returns:
            a Gradio Tabbed Interface for the given interfaces
        """
        super().__init__(
            title=title or "Gradio",
            theme=theme,
            analytics_enabled=analytics_enabled,
            mode="tabbed_interface",
            css=css,
        )
        if tab_names is None:
            tab_names = [f"Tab {i}" for i in range(len(interface_list))]
        with self:
            if title:
                Markdown(
                    f"<h1 style='text-align: center; margin-bottom: 1rem'>{title}</h1>"
                )
            with Tabs():
                for interface, tab_name in zip(interface_list, tab_names):
                    with Tab(label=tab_name):
                        interface.render()


def close_all(verbose: bool = True) -> None:
    for io in Interface.get_instances():
        io.close(verbose)
