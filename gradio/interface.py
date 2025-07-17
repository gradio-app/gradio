"""
This file defines two useful high-level abstractions to build Gradio apps: Interface and TabbedInterface.
"""

from __future__ import annotations

import inspect
import json
import os
import warnings
import weakref
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio import Examples, utils, wasm_utils
from gradio.blocks import Blocks
from gradio.components import (
    Button,
    ClearButton,
    Component,
    DeepLinkButton,
    DuplicateButton,
    Markdown,
    State,
    get_component_instance,
)
from gradio.data_classes import InterfaceTypes
from gradio.events import Dependency, Events, on
from gradio.exceptions import RenderError
from gradio.flagging import CSVLogger, FlaggingCallback, FlagMethod
from gradio.i18n import I18nData
from gradio.layouts import Accordion, Column, Row, Tab, Tabs
from gradio.pipelines import load_from_js_pipeline, load_from_pipeline
from gradio.themes import ThemeClass as Theme

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from diffusers import DiffusionPipeline  # type: ignore
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
    Demos: hello_world, hello_world_2, hello_world_3
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
    def from_pipeline(
        cls, pipeline: Pipeline | DiffusionPipeline, **kwargs
    ) -> Interface:
        """
        Class method that constructs an Interface from a Hugging Face transformers.Pipeline or diffusers.DiffusionPipeline object.
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
        if wasm_utils.IS_WASM:
            interface_info = load_from_js_pipeline(pipeline)
        else:
            interface_info = load_from_pipeline(pipeline)
        kwargs = dict(interface_info, **kwargs)
        interface = cls(**kwargs)
        return interface

    def __init__(
        self,
        fn: Callable,
        inputs: str | Component | Sequence[str | Component] | None,
        outputs: str | Component | Sequence[str | Component] | None,
        examples: list[Any] | list[list[Any]] | str | None = None,
        *,
        cache_examples: bool | None = None,
        cache_mode: Literal["eager", "lazy"] | None = None,
        examples_per_page: int = 10,
        example_labels: list[str] | None = None,
        preload_example: int | Literal[False] = False,
        live: bool = False,
        title: str | I18nData | None = None,
        description: str | None = None,
        article: str | None = None,
        theme: Theme | str | None = None,
        flagging_mode: Literal["never"]
        | Literal["auto"]
        | Literal["manual"]
        | None = None,
        flagging_options: list[str] | list[tuple[str, str]] | None = None,
        flagging_dir: str = ".gradio/flagged",
        flagging_callback: FlaggingCallback | None = None,
        analytics_enabled: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        show_api: bool = True,
        api_name: str | Literal[False] | None = "predict",
        api_description: str | None | Literal[False] = None,
        _api_mode: bool = False,
        allow_duplication: bool = False,
        concurrency_limit: int | None | Literal["default"] = "default",
        css: str | None = None,
        css_paths: str | Path | Sequence[str | Path] | None = None,
        js: str | Literal[True] | None = None,
        head: str | None = None,
        head_paths: str | Path | Sequence[str | Path] | None = None,
        additional_inputs: str | Component | Sequence[str | Component] | None = None,
        additional_inputs_accordion: str | Accordion | None = None,
        submit_btn: str | Button = "Submit",
        stop_btn: str | Button = "Stop",
        clear_btn: str | Button | None = "Clear",
        delete_cache: tuple[int, int] | None = None,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        fill_width: bool = False,
        allow_flagging: Literal["never"]
        | Literal["auto"]
        | Literal["manual"]
        | None = None,
        time_limit: int | None = 30,
        stream_every: float = 0.5,
        deep_link: str | DeepLinkButton | bool | None = None,
        **kwargs,
    ):
        """
        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: a single Gradio component, or list of Gradio components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of input components should match the number of parameters in fn. If set to None, then only the output components will be displayed.
            outputs: a single Gradio component, or list of Gradio components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. The number of output components should match the number of values returned by fn. If set to None, then only the input components will be displayed.
            examples: sample inputs for the function; if provided, appear below the UI components and can be clicked to populate the interface. Should be nested list, in which the outer list consists of samples and each inner list consists of an input corresponding to each input component. A string path to a directory of examples can also be provided, but it should be within the directory with the python file running the gradio app. If there are multiple input components and a directory is provided, a log.csv file must be present in the directory to link corresponding inputs.
            cache_examples: If True, caches examples in the server for fast runtime in examples. If "lazy", then examples are cached (for all users of the app) after their first use (by any user of the app). If None, will use the GRADIO_CACHE_EXAMPLES environment variable, which should be either "true" or "false". In HuggingFace Spaces, this parameter defaults to True (as long as `fn` and `outputs` are also provided).  Note that examples are cached separately from Gradio's queue() so certain features, such as gr.Progress(), gr.Info(), gr.Warning(), etc. will not be displayed in Gradio's UI for cached examples.
            cache_mode: if "lazy", examples are cached after their first use. If "eager", all examples are cached at app launch. If None, will use the GRADIO_CACHE_MODE environment variable if defined, or default to "eager". In HuggingFace Spaces, this parameter defaults to "eager" except for ZeroGPU Spaces, in which case it defaults to "lazy".
            examples_per_page: if examples are provided, how many to display per page.
            preload_example: If an integer is provided (and examples are being cached), the example at that index in the examples list will be preloaded when the Gradio app is first loaded. If False, no example will be preloaded.
            live: whether the interface should automatically rerun if any of the inputs change.
            title: a title for the interface; if provided, appears above the input and output components in large font. Also used as the tab title when opened in a browser window.
            description: a description for the interface; if provided, appears above the input and output components and beneath the title in regular font. Accepts Markdown and HTML content.
            article: an expanded article explaining the interface; if provided, appears below the input and output components in regular font. Accepts Markdown and HTML content. If it is an HTTP(S) link to a downloadable remote file, the content of this file is displayed.
            theme: a Theme object or a string representing a theme. If a string, will look for a built-in theme with that name (e.g. "soft" or "default"), or will attempt to load a theme from the Hugging Face Hub (e.g. "gradio/monochrome"). If None, will use the Default theme.
            flagging_mode: one of "never", "auto", or "manual". If "never" or "auto", users will not see a button to flag an input and output. If "manual", users will see a button to flag. If "auto", every input the user submits will be automatically flagged, along with the generated output. If "manual", both the input and outputs are flagged when the user clicks flag button. This parameter can be set with environmental variable GRADIO_FLAGGING_MODE; otherwise defaults to "manual".
            flagging_options: if provided, allows user to select from the list of options when flagging. Only applies if flagging_mode is "manual". Can either be a list of tuples of the form (label, value), where label is the string that will be displayed on the button and value is the string that will be stored in the flagging CSV; or it can be a list of strings ["X", "Y"], in which case the values will be the list of strings and the labels will ["Flag as X", "Flag as Y"], etc.
            flagging_dir: path to the the directory where flagged data is stored. If the directory does not exist, it will be created.
            flagging_callback: either None or an instance of a subclass of FlaggingCallback which will be called when a sample is flagged. If set to None, an instance of gradio.flagging.CSVLogger will be created and logs will be saved to a local CSV file in flagging_dir. Default to None.
            analytics_enabled: whether to allow basic telemetry. If None, will use GRADIO_ANALYTICS_ENABLED environment variable if defined, or default to True.
            batch: if True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: the maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            api_name: defines how the prediction endpoint appears in the API docs. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given name. If None, the name of the prediction function will be used as the API endpoint. If False, the endpoint will not be exposed in the API docs and downstream apps (including those that `gr.load` this app) will not be able to use this prediction endpoint.
            api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
            show_api: whether to show the prediction endpoint in the "view API" page of the Gradio app, or in the ".view_api()" method of the Gradio clients. Unlike setting api_name to False, setting show_api to False will still allow downstream apps as well as the Clients to use this event.
            allow_duplication: if True, then will show a 'Duplicate Spaces' button on Hugging Face Spaces.
            concurrency_limit: if set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `.queue()`, which itself is 1 by default).
            css: Custom css as a code string. This css will be included in the demo webpage.
            css_paths: Custom css as a pathlib.Path to a css file or a list of such paths. This css files will be read, concatenated, and included in the demo webpage. If the `css` parameter is also set, the css from `css` will be included first.
            js: Custom js as a code string. The custom js should be in the form of a single js function. This function will automatically be executed when the page loads. For more flexibility, use the head parameter to insert js inside <script> tags.
            head: Custom html code to insert into the head of the demo webpage. This can be used to add custom meta tags, multiple scripts, stylesheets, etc. to the page.
            head_paths: Custom html code as a pathlib.Path to a html file or a list of such paths. This html files will be read, concatenated, and included in the head of the demo webpage. If the `head` parameter is also set, the html from `head` will be included first.
            additional_inputs: a single Gradio component, or list of Gradio components. Components can either be passed as instantiated objects, or referred to by their string shortcuts. These components will be rendered in an accordion below the main input components. By default, no additional input components will be displayed.
            additional_inputs_accordion: if a string is provided, this is the label of the `gr.Accordion` to use to contain additional inputs. A `gr.Accordion` object can be provided as well to configure other properties of the container holding the additional inputs. Defaults to a `gr.Accordion(label="Additional Inputs", open=False)`. This parameter is only used if `additional_inputs` is provided.
            submit_btn: the button to use for submitting inputs. Defaults to a `gr.Button("Submit", variant="primary")`. This parameter does not apply if the Interface is output-only, in which case the submit button always displays "Generate". Can be set to a string (which becomes the button label) or a `gr.Button` object (which allows for more customization).
            stop_btn: the button to use for stopping the interface. Defaults to a `gr.Button("Stop", variant="stop", visible=False)`. Can be set to a string (which becomes the button label) or a `gr.Button` object (which allows for more customization).
            clear_btn: the button to use for clearing the inputs. Defaults to a `gr.Button("Clear", variant="secondary")`. Can be set to a string (which becomes the button label) or a `gr.Button` object (which allows for more customization). Can be set to None, which hides the button.
            delete_cache: a tuple corresponding [frequency, age] both expressed in number of seconds. Every `frequency` seconds, the temporary files created by this Blocks instance will be deleted if more than `age` seconds have passed since the file was created. For example, setting this to (86400, 86400) will delete temporary files every day. The cache will be deleted entirely when the server restarts. If None, no cache deletion will occur.
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            example_labels: a list of labels for each example. If provided, the length of this list should be the same as the number of examples, and these labels will be used in the UI instead of rendering the example values.
            fill_width: whether to horizontally expand to fill container fully. If False, centers and constrains app to a maximum width.
            time_limit: The time limit for the stream to run. Default is 30 seconds. Parameter only used for streaming images or audio if the interface is live and the input components are set to "streaming=True".
            stream_every: The latency (in seconds) at which stream chunks are sent to the backend. Defaults to 0.5 seconds. Parameter only used for streaming images or audio if the interface is live and the input components are set to "streaming=True".
            deep_link: a string or `gr.DeepLinkButton` object that creates a unique URL you can use to share your app and all components **as they currently are** with others. Automatically enabled on Hugging Face Spaces unless explicitly set to False.
        """
        super().__init__(
            analytics_enabled=analytics_enabled,
            mode="interface",
            title=title or "Gradio",
            theme=theme,
            css=css,
            css_paths=css_paths,
            js=js,
            head=head,
            head_paths=head_paths,
            delete_cache=delete_cache,
            fill_width=fill_width,
            **kwargs,
        )
        if isinstance(deep_link, str):
            deep_link = DeepLinkButton(value=deep_link, render=False, interactive=False)
        elif deep_link is True:
            deep_link = DeepLinkButton(render=False, interactive=False)
        if utils.get_space() and deep_link is None:
            deep_link = DeepLinkButton(render=False, interactive=False)
        if wasm_utils.IS_WASM or deep_link is False:
            deep_link = None
        self.deep_link = deep_link
        self.time_limit = time_limit
        self.stream_every = stream_every
        self.api_name: str | Literal[False] | None = api_name
        self.api_description: str | None | Literal[False] = api_description
        self.show_api = show_api
        self.interface_type = InterfaceTypes.STANDARD
        if (inputs is None or inputs == []) and (outputs is None or outputs == []):
            raise ValueError("Must provide at least one of `inputs` or `outputs`")
        elif outputs is None or outputs == []:
            outputs = []
            self.interface_type = InterfaceTypes.INPUT_ONLY
        elif inputs is None or inputs == []:
            inputs = []
            self.interface_type = InterfaceTypes.OUTPUT_ONLY
        if additional_inputs is None:
            self.additional_input_components = []
        else:
            if not isinstance(additional_inputs, Sequence):
                additional_inputs = [additional_inputs]
            self.additional_input_components = [
                get_component_instance(i, unrender=True) for i in additional_inputs
            ]

        if not isinstance(inputs, (Sequence, Component)):
            raise TypeError(
                f"inputs must be a string, list, or Component, not {inputs}"
            )
        if not isinstance(outputs, (Sequence, Component)):
            raise TypeError(
                f"outputs must be a string, list, or Component, not {outputs}"
            )

        if isinstance(inputs, (str, Component)):
            inputs = [inputs]
        if isinstance(outputs, (str, Component)):
            outputs = [outputs]

        self.cache_examples = cache_examples
        self.cache_mode: Literal["eager", "lazy"] | None = cache_mode
        self.preload_example = preload_example

        self.main_input_components = [
            get_component_instance(i, unrender=True) for i in inputs
        ]
        self.input_components = (
            self.main_input_components + self.additional_input_components
        )
        self.output_components = [
            get_component_instance(o, unrender=True)
            for o in outputs  # type: ignore
        ]

        state_input_indexes = [
            idx
            for idx, i in enumerate(self.input_components)
            if i == "state" or isinstance(i, State)
        ]
        state_output_indexes = [
            idx
            for idx, o in enumerate(self.output_components)
            if o == "state" or isinstance(o, State)
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
            if self.input_components[state_input_index] == "state":
                default = utils.get_default_args(fn)[state_input_index]
                state_variable = State(value=default)
            else:
                state_variable = self.input_components[state_input_index]

            self.input_components[state_input_index] = state_variable
            self.output_components[state_output_index] = state_variable

            if cache_examples:
                warnings.warn(
                    "Cache examples cannot be used with state inputs and outputs. "
                    "Setting cache_examples to False."
                )
            self.cache_examples = False

        if additional_inputs_accordion is None:
            self.additional_inputs_accordion_params = {
                "label": "Additional Inputs",
                "open": False,
            }
        elif isinstance(additional_inputs_accordion, str):
            self.additional_inputs_accordion_params = {
                "label": additional_inputs_accordion
            }
        elif isinstance(additional_inputs_accordion, Accordion):
            self.additional_inputs_accordion_params = (
                additional_inputs_accordion.recover_kwargs(
                    additional_inputs_accordion.get_config()
                )
            )
        else:
            raise ValueError(
                f"The `additional_inputs_accordion` parameter must be a string or gr.Accordion, not {type(additional_inputs_accordion)}"
            )

        for component in self.input_components + self.output_components:
            if not (isinstance(component, Component)):
                raise ValueError(
                    f"{component} is not a valid input/output component for Interface."
                )

        if len(self.input_components) == len(self.output_components):
            same_components = [
                i is o
                for i, o in zip(
                    self.input_components, self.output_components, strict=False
                )
            ]
            if all(same_components):
                self.interface_type = InterfaceTypes.UNIFIED

        if self.interface_type in [
            InterfaceTypes.STANDARD,
            InterfaceTypes.OUTPUT_ONLY,
        ]:
            for o in self.output_components:
                if not isinstance(o, Component):
                    raise TypeError(
                        f"Output component must be a Component, not {type(o)}"
                    )
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
            article = utils.download_if_url(article)
        self.article = article

        self.examples = examples
        self.examples_per_page = examples_per_page
        self.example_labels = example_labels

        if isinstance(submit_btn, Button):
            self.submit_btn_parms = submit_btn.recover_kwargs(submit_btn.get_config())
        elif isinstance(submit_btn, str):
            self.submit_btn_parms = {
                "value": submit_btn,
                "variant": "primary",
            }
        else:
            raise ValueError(
                f"The submit_btn parameter must be a gr.Button or string, not {type(submit_btn)}"
            )

        if isinstance(stop_btn, Button):
            self.stop_btn_parms = stop_btn.recover_kwargs(stop_btn.get_config())
        elif isinstance(stop_btn, str):
            self.stop_btn_parms = {
                "value": stop_btn,
                "variant": "stop",
                "visible": False,
            }
        else:
            raise ValueError(
                f"The stop_btn parameter must be a gr.Button or string, not {type(stop_btn)}"
            )

        if clear_btn is None:
            self.clear_btn_params = {
                "visible": False,
                "variant": "secondary",
            }
        elif isinstance(clear_btn, Button):
            self.clear_btn_params = clear_btn.recover_kwargs(clear_btn.get_config())
        elif isinstance(clear_btn, str):
            self.clear_btn_params = {
                "value": clear_btn,
                "variant": "secondary",
            }
        else:
            raise ValueError(
                f"The clear_btn parameter must be a gr.Button, a string, or None, not {type(clear_btn)}"
            )

        self.simple_server = None

        # For flagging_mode: (1) first check for `flagging_mode` parameter (or its alias `allow_flagging`),
        # (2) check for env variable, (3) default to "manual"
        if allow_flagging is not None:
            warnings.warn(
                "The `allow_flagging` parameter in `Interface` is deprecated. "
                "Use `flagging_mode` instead."
            )
            flagging_mode = allow_flagging
        if flagging_mode is None:
            self.flagging_mode = os.getenv("GRADIO_FLAGGING_MODE", "manual")
        elif flagging_mode in ["manual", "never", "auto"]:
            self.flagging_mode = flagging_mode
        else:
            raise ValueError(
                "Invalid value for `flagging_mode` parameter."
                "Must be: 'auto', 'manual', or 'never'."
            )

        if flagging_options is None:
            self.flagging_options = [("Flag", None)]
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
        self.show_progress: Literal["full", "hidden", "minimal"] = show_progress

        self.batch = batch
        self.max_batch_size = max_batch_size
        self.allow_duplication = allow_duplication
        self.concurrency_limit: int | None | Literal["default"] = concurrency_limit

        self.share = None
        self.share_url = None
        self.local_url = None

        self.favicon_path = None
        self.i18n_instance = None
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
        for component, param_name in zip(
            self.input_components, param_names, strict=False
        ):
            if not isinstance(component, Component):
                raise TypeError(
                    f"Input component must be a Component, not {type(component)}"
                )
            if component.label is None:
                component.label = param_name
        for i, component in enumerate(self.output_components):
            if not isinstance(component, Component):
                raise TypeError(
                    f"Output component must be a Component, not {type(component)}"
                )
            if component.label is None:
                if len(self.output_components) == 1:
                    component.label = "output"
                else:
                    component.label = f"output {i}"

        if self.flagging_mode != "never":
            if self.interface_type == InterfaceTypes.UNIFIED:
                self.flagging_callback.setup(self.input_components, self.flagging_dir)  # type: ignore
            elif self.interface_type == InterfaceTypes.INPUT_ONLY:
                pass
            else:
                self.flagging_callback.setup(
                    self.input_components + self.output_components,
                    self.flagging_dir,  # type: ignore
                )

        # Render the Gradio UI
        with self:
            if self.deep_link:
                self.deep_link.activate()
            self.render_title_description()

            _submit_btn, _clear_btn, _stop_btn, flag_btns, duplicate_btn = (
                None,
                None,
                None,
                None,
                None,
            )  # type: ignore
            input_component_column = None

            with Row():
                if self.interface_type in [
                    InterfaceTypes.STANDARD,
                    InterfaceTypes.INPUT_ONLY,
                    InterfaceTypes.UNIFIED,
                ]:
                    (
                        _submit_btn,
                        _clear_btn,
                        _stop_btn,
                        flag_btns,
                        input_component_column,
                    ) = self.render_input_column()  # type: ignore
                if self.interface_type in [
                    InterfaceTypes.STANDARD,
                    InterfaceTypes.OUTPUT_ONLY,
                ]:
                    (
                        _submit_btn_out,
                        _clear_btn_2_out,
                        duplicate_btn,
                        _stop_btn_2_out,
                        flag_btns_out,
                    ) = self.render_output_column(_submit_btn)
                    _submit_btn = _submit_btn or _submit_btn_out
                    _clear_btn = _clear_btn or _clear_btn_2_out
                    _stop_btn = _stop_btn or _stop_btn_2_out
                    flag_btns = flag_btns or flag_btns_out

            if _clear_btn is None:
                raise RenderError("Clear button not rendered")

            _submit_event = self.attach_submit_events(_submit_btn, _stop_btn)
            self.attach_clear_events(_clear_btn, input_component_column)
            if duplicate_btn is not None:
                duplicate_btn.activate()

            self.attach_flagging_events(flag_btns, _clear_btn, _submit_event)
            if _submit_event and self.deep_link:
                _submit_event.then(
                    lambda: DeepLinkButton(interactive=True),
                    inputs=None,
                    outputs=[self.deep_link],
                    js=True,
                    show_api=False,
                )
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
        _submit_btn, _clear_btn, _stop_btn, flag_btns = None, None, None, None

        with Column():
            input_component_column = Column()
            with input_component_column:
                for component in self.main_input_components:
                    component.render()
                if self.additional_input_components:
                    with Accordion(**self.additional_inputs_accordion_params):  # type: ignore
                        for component in self.additional_input_components:
                            component.render()
            with Row():
                if self.interface_type in [
                    InterfaceTypes.STANDARD,
                    InterfaceTypes.INPUT_ONLY,
                ]:
                    _clear_btn = ClearButton(**self.clear_btn_params)  # type: ignore
                    if not self.live:
                        if (
                            self.deep_link
                            and self.interface_type == InterfaceTypes.INPUT_ONLY
                        ):
                            self.deep_link.render()
                        _submit_btn = Button(**self.submit_btn_parms)  # type: ignore
                        # Stopping jobs only works if the queue is enabled
                        # We don't know if the queue is enabled when the interface
                        # is created. We use whether a generator function is provided
                        # as a proxy of whether the queue will be enabled.
                        # Using a generator function without the queue will raise an error.
                        if inspect.isgeneratorfunction(
                            self.fn
                        ) or inspect.isasyncgenfunction(self.fn):
                            _stop_btn = Button(**self.stop_btn_parms)
                elif self.interface_type == InterfaceTypes.UNIFIED:
                    _clear_btn = ClearButton(**self.clear_btn_params)  # type: ignore
                    _submit_btn = Button(**self.submit_btn_parms)  # type: ignore
                    if self.deep_link:
                        self.deep_link.render()
                    if (
                        inspect.isgeneratorfunction(self.fn)
                        or inspect.isasyncgenfunction(self.fn)
                    ) and not self.live:
                        _stop_btn = Button(**self.stop_btn_parms)
                    if self.flagging_mode == "manual":
                        flag_btns = self.render_flag_btns()
                    elif self.flagging_mode == "auto":
                        flag_btns = [_submit_btn]
        return (
            _submit_btn,
            _clear_btn,
            _stop_btn,
            flag_btns,
            input_component_column,
        )

    def render_output_column(
        self,
        _submit_btn_in: Button | None,
    ) -> tuple[
        Button | None,
        ClearButton | None,
        DuplicateButton | None,
        Button | None,
        list | None,
    ]:
        _submit_btn = _submit_btn_in
        _clear_btn, duplicate_btn, flag_btns, _stop_btn = (
            None,
            None,
            None,
            None,
        )

        with Column():
            for component in self.output_components:
                if not (isinstance(component, State)):
                    component.render()
            with Row():
                if self.deep_link:
                    self.deep_link.render()
                if self.interface_type == InterfaceTypes.OUTPUT_ONLY:
                    _clear_btn = ClearButton(**self.clear_btn_params)  # type: ignore
                    _submit_btn = Button("Generate", variant="primary")
                    if (
                        inspect.isgeneratorfunction(self.fn)
                        or inspect.isasyncgenfunction(self.fn)
                    ) and not self.live:
                        # Stopping jobs only works if the queue is enabled
                        # We don't know if the queue is enabled when the interface
                        # is created. We use whether a generator function is provided
                        # as a proxy of whether the queue will be enabled.
                        # Using a generator function without the queue will raise an error.
                        _stop_btn = Button(**self.stop_btn_parms)
                if self.flagging_mode == "manual":
                    flag_btns = self.render_flag_btns()
                elif self.flagging_mode == "auto":
                    if _submit_btn is None:
                        raise RenderError("Submit button not rendered")
                    flag_btns = [_submit_btn]

                if self.allow_duplication:
                    duplicate_btn = DuplicateButton(scale=1, size="lg", _activate=False)

        return (
            _submit_btn,
            _clear_btn,
            duplicate_btn,
            _stop_btn,
            flag_btns,
        )

    def render_article(self):
        if self.article:
            Markdown(self.article)

    def attach_submit_events(
        self, _submit_btn: Button | None, _stop_btn: Button | None
    ) -> Dependency:
        if self.live:
            if self.interface_type == InterfaceTypes.OUTPUT_ONLY:
                if _submit_btn is None:
                    raise RenderError("Submit button not rendered")
                super().load(self.fn, None, self.output_components)
                # For output-only interfaces, the user probably still want a "generate"
                # button even if the Interface is live
                return _submit_btn.click(
                    self.fn,
                    None,
                    self.output_components,
                    api_name=self.api_name,
                    show_api=self.show_api,
                    api_description=self.api_description,
                    preprocess=not (self.api_mode),
                    postprocess=not (self.api_mode),
                    batch=self.batch,
                    max_batch_size=self.max_batch_size,
                )
            else:
                events: list[Callable] = []
                streaming_event = False
                for component in self.input_components:
                    if component.has_event("stream") and component.streaming:  # type: ignore
                        events.append(component.stream)  # type: ignore
                        streaming_event = True
                    elif component.has_event("change"):
                        events.append(component.change)  # type: ignore
                return on(
                    events,
                    self.fn,
                    self.input_components,
                    self.output_components,
                    api_name=self.api_name,
                    api_description=self.api_description,
                    show_api=self.show_api,
                    preprocess=not (self.api_mode),
                    postprocess=not (self.api_mode),
                    show_progress="hidden" if streaming_event else self.show_progress,
                    trigger_mode="always_last" if not streaming_event else "multiple",
                    time_limit=self.time_limit,
                    stream_every=self.stream_every,
                )
        else:
            if _submit_btn is None:
                raise RenderError("Submit button not rendered")
            fn = self.fn
            extra_output = []

            triggers = [_submit_btn.click] + [
                component.submit  # type: ignore
                for component in self.input_components
                if component.has_event(Events.submit)
            ]

            for component in self.input_components:
                if getattr(component, "streaming", None):
                    warnings.warn(
                        "Streaming components are only supported in live interfaces."
                    )

            if _stop_btn:
                extra_output = [_submit_btn, _stop_btn]

                async def cleanup():
                    return [Button(visible=True), Button(visible=False)]

                predict_event = on(
                    triggers,
                    utils.async_lambda(
                        lambda: (
                            Button(visible=False),
                            Button(visible=True),
                        )
                    ),
                    inputs=None,
                    outputs=[_submit_btn, _stop_btn],
                    queue=False,
                    show_api=False,
                ).then(
                    self.fn,
                    self.input_components,
                    self.output_components,
                    api_name=self.api_name,
                    show_api=self.show_api,
                    api_description=self.api_description,
                    scroll_to_output=True,
                    preprocess=not (self.api_mode),
                    postprocess=not (self.api_mode),
                    batch=self.batch,
                    max_batch_size=self.max_batch_size,
                    concurrency_limit=self.concurrency_limit,
                    show_progress=self.show_progress,
                )

                final_event = predict_event.then(
                    cleanup,
                    inputs=None,
                    outputs=extra_output,  # type: ignore
                    queue=False,
                    show_api=False,
                )

                _stop_btn.click(
                    cleanup,
                    inputs=None,
                    outputs=[_submit_btn, _stop_btn],
                    cancels=predict_event,
                    queue=False,
                    show_api=False,
                )
                return final_event
            else:
                return on(
                    triggers,
                    fn,
                    self.input_components,
                    self.output_components,
                    api_name=self.api_name,
                    show_api=self.show_api,
                    api_description=self.api_description,
                    scroll_to_output=True,
                    preprocess=not (self.api_mode),
                    postprocess=not (self.api_mode),
                    batch=self.batch,
                    max_batch_size=self.max_batch_size,
                    concurrency_limit=self.concurrency_limit,
                    show_progress=self.show_progress,
                )

    def attach_clear_events(
        self,
        _clear_btn: ClearButton,
        input_component_column: Column | None,
    ):
        _clear_btn.add(self.input_components + self.output_components)
        _clear_btn.click(
            None,
            [],
            ([input_component_column] if input_component_column else []),  # type: ignore
            js=f"""() => {
                json.dumps(
                    [{"variant": None, "visible": True, "__type__": "update"}]
                    if self.interface_type
                    in [
                        InterfaceTypes.STANDARD,
                        InterfaceTypes.INPUT_ONLY,
                        InterfaceTypes.UNIFIED,
                    ]
                    else []
                )
            }
            """,
        )

    def attach_flagging_events(
        self,
        flag_btns: list[Button] | None,
        _clear_btn: ClearButton,
        _submit_event: Dependency,
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

        if self.flagging_mode == "auto":
            flag_method = FlagMethod(
                self.flagging_callback, "", None, visual_feedback=False
            )
            _submit_event.success(
                flag_method,
                inputs=self.input_components + self.output_components,
                outputs=None,
                preprocess=False,
                queue=False,
                show_api=False,
            )
            return

        if self.interface_type == InterfaceTypes.UNIFIED:
            flag_components = self.input_components
        else:
            flag_components = self.input_components + self.output_components

        for flag_btn, (label, value) in zip(
            flag_btns, self.flagging_options, strict=False
        ):
            if value is not None and not isinstance(value, str):
                raise TypeError(
                    f"Flagging option value must be a string, not {value!r}"
                )
            flag_method = FlagMethod(self.flagging_callback, label, value)
            flag_btn.click(
                utils.async_lambda(
                    lambda: Button(value="Saving...", interactive=False)
                ),
                None,
                flag_btn,
                queue=False,
                show_api=False,
            )
            flag_btn.click(
                flag_method,
                inputs=flag_components,
                outputs=flag_btn,
                preprocess=False,
                queue=False,
                show_api=False,
            )
            _clear_btn.click(
                utils.async_lambda(flag_method.reset),
                None,
                flag_btn,
                queue=False,
                show_api=False,
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
                inputs=non_state_inputs,
                outputs=non_state_outputs,
                fn=self.fn,
                cache_examples=self.cache_examples,
                cache_mode=self.cache_mode,
                examples_per_page=self.examples_per_page,
                _api_mode=self.api_mode,
                batch=self.batch,
                example_labels=self.example_labels,
                preload=self.preload_example,
            )
            if self.deep_link and self.examples_handler.cache_event:
                self.examples_handler.cache_event.then(
                    lambda: DeepLinkButton(interactive=True),
                    inputs=None,
                    outputs=[self.deep_link],
                    js=True,
                    show_api=False,
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
    A TabbedInterface is created by providing a list of Interfaces or Blocks, each of which gets
    rendered in a separate tab. Only the components from the Interface/Blocks will be rendered in the tab.
    Certain high-level attributes of the Blocks (e.g. custom `css`, `js`, and `head` attributes) will not be loaded.

    Demos: tabbed_interface_lite
    """

    def __init__(
        self,
        interface_list: Sequence[Blocks],
        tab_names: list[str] | None = None,
        title: str | None = None,
        theme: Theme | str | None = None,
        analytics_enabled: bool | None = None,
        css: str | None = None,
        js: str | Literal[True] | None = None,
        head: str | None = None,
    ):
        """
        Parameters:
            interface_list: A list of Interfaces (or Blocks) to be rendered in the tabs.
            tab_names: A list of tab names. If None, the tab names will be "Tab 1", "Tab 2", etc.
            title: The tab title to display when this demo is opened in a browser window.
            theme: A Theme object or a string representing a theme. If a string, will look for a built-in theme with that name (e.g. "soft" or "default"), or will attempt to load a theme from the Hugging Face Hub (e.g. "gradio/monochrome"). If None, will use the Default theme.
            analytics_enabled: Whether to allow basic telemetry. If None, will use GRADIO_ANALYTICS_ENABLED environment variable or default to True.
            css: Custom css as a string or path to a css file. This css will be included in the demo webpage.
            js: Custom js as a string or path to a js file. The custom js should in the form of a single js function. This function will automatically be executed when the page loads. For more flexibility, use the head parameter to insert js inside <script> tags.
            head: Custom html to insert into the head of the demo webpage. This can be used to add custom meta tags, multiple scripts, stylesheets, etc. to the page.
        Returns:
            a Gradio Tabbed Interface for the given interfaces
        """
        super().__init__(
            title=title or "Gradio",
            theme=theme,
            analytics_enabled=analytics_enabled,
            mode="tabbed_interface",
            css=css,
            js=js,
            head=head,
            fill_height=True,
        )
        if tab_names is None:
            tab_names = [f"Tab {i}" for i in range(len(interface_list))]
        with self:
            if title:
                Markdown(
                    f"<h1 style='text-align: center; margin-bottom: 1rem'>{title}</h1>"
                )
            with Tabs():
                for interface, tab_name in zip(interface_list, tab_names, strict=False):
                    with Tab(
                        label=tab_name,
                        scale=1 if interface.fill_height else None,
                    ):
                        interface.render()


def close_all(verbose: bool = True) -> None:
    for io in Interface.get_instances():
        io.close(verbose)
