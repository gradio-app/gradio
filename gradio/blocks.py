from __future__ import annotations

import copy
import getpass
import inspect
import os
import pkgutil
import random
import sys
import time
import warnings
import webbrowser
from types import ModuleType
from typing import TYPE_CHECKING, Any, AnyStr, Callable, Dict, List, Optional, Tuple

import anyio
import requests
from anyio import CapacityLimiter

from gradio import (
    components,
    encryptor,
    external,
    networking,
    queue,
    routes,
    strings,
    utils,
)
from gradio.context import Context
from gradio.deprecation import check_deprecated_parameters
from gradio.documentation import (
    document,
    document_component_api,
    set_documentation_group,
)
from gradio.exceptions import DuplicateBlockError
from gradio.utils import component_or_layout_class, delete_none

set_documentation_group("blocks")

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    import comet_ml
    import mlflow
    import wandb
    from fastapi.applications import FastAPI

    from gradio.components import Component, IOComponent


class Block:
    def __init__(self, *, render=True, elem_id=None, visible=True, **kwargs):
        self._id = Context.id
        Context.id += 1
        self.visible = visible
        self.elem_id = elem_id
        self._style = {}
        if render:
            self.render()
        check_deprecated_parameters(self.__class__.__name__, **kwargs)

    def render(self):
        """
        Adds self into appropriate BlockContext
        """
        if Context.root_block is not None and self._id in Context.root_block.blocks:
            raise DuplicateBlockError(
                f"A block with id: {self._id} has already been rendered in the current Blocks."
            )
        if Context.block is not None:
            Context.block.add(self)
        if Context.root_block is not None:
            Context.root_block.blocks[self._id] = self
            if hasattr(self, "temp_dir"):
                Context.root_block.temp_dirs.add(self.temp_dir)

    def unrender(self):
        """
        Removes self from BlockContext if it has been rendered (otherwise does nothing).
        Removes self from the layout and collection of blocks, but does not delete any event triggers.
        """
        if Context.block is not None:
            try:
                Context.block.children.remove(self)
            except ValueError:
                pass
        if Context.root_block is not None:
            try:
                del Context.root_block.blocks[self._id]
            except KeyError:
                pass
        return self

    def get_block_name(self) -> str:
        """
        Gets block's class name.

        If it is template component it gets the parent's class name.

        @return: class name
        """
        return (
            self.__class__.__base__.__name__.lower()
            if hasattr(self, "is_template")
            else self.__class__.__name__.lower()
        )

    def set_event_trigger(
        self,
        event_name: str,
        fn: Optional[Callable],
        inputs: Optional[Component | List[Component]],
        outputs: Optional[Component | List[Component]],
        preprocess: bool = True,
        postprocess: bool = True,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        api_name: Optional[AnyStr] = None,
        js: Optional[str] = None,
        no_target: bool = False,
        queue: Optional[bool] = None,
    ) -> None:
        """
        Adds an event to the component's dependencies.
        Parameters:
            event_name: event name
            fn: Callable function
            inputs: input list
            outputs: output list
            preprocess: whether to run the preprocess methods of components
            postprocess: whether to run the postprocess methods of components
            scroll_to_output: whether to scroll to output of dependency on trigger
            show_progress: whether to show progress animation while running.
            api_name: Defining this parameter exposes the endpoint in the api docs
            js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components
            no_target: if True, sets "targets" to [], used for Blocks "load" event
        Returns: None
        """
        # Support for singular parameter
        if inputs is None:
            inputs = []
        if outputs is None:
            outputs = []
        if not isinstance(inputs, list):
            inputs = [inputs]
        if not isinstance(outputs, list):
            outputs = [outputs]
        Context.root_block.fns.append(BlockFunction(fn, preprocess, postprocess))
        if api_name is not None:
            api_name_ = utils.append_unique_suffix(
                api_name, [dep["api_name"] for dep in Context.root_block.dependencies]
            )
            if not (api_name == api_name_):
                warnings.warn(
                    "api_name {} already exists, using {}".format(api_name, api_name_)
                )
                api_name = api_name_
        dependency = {
            "targets": [self._id] if not no_target else [],
            "trigger": event_name,
            "inputs": [block._id for block in inputs],
            "outputs": [block._id for block in outputs],
            "backend_fn": fn is not None,
            "js": js,
            "queue": False if fn is None else queue,
            "api_name": api_name,
            "scroll_to_output": scroll_to_output,
            "show_progress": show_progress,
        }
        if api_name is not None:
            dependency["documentation"] = [
                [
                    document_component_api(component.__class__, "input")
                    for component in inputs
                ],
                [
                    document_component_api(component.__class__, "output")
                    for component in outputs
                ],
            ]
        Context.root_block.dependencies.append(dependency)

    def get_config(self):
        return {
            "visible": self.visible,
            "elem_id": self.elem_id,
            "style": self._style,
        }

    @classmethod
    def get_specific_update(cls, generic_update):
        del generic_update["__type__"]
        generic_update = cls.update(**generic_update)
        return generic_update


class BlockContext(Block):
    def __init__(
        self,
        visible: bool = True,
        render: bool = True,
        **kwargs,
    ):
        """
        Parameters:
            visible: If False, this will be hidden but included in the Blocks config file (its visibility can later be updated).
            render: If False, this will not be included in the Blocks config file at all.
        """
        self.children = []
        super().__init__(visible=visible, render=render, **kwargs)

    def __enter__(self):
        self.parent = Context.block
        Context.block = self
        return self

    def add(self, child):
        child.parent = self
        self.children.append(child)

    def fill_expected_parents(self):
        children = []
        pseudo_parent = None
        for child in self.children:
            expected_parent = getattr(child.__class__, "expected_parent", False)
            if not expected_parent or isinstance(self, expected_parent):
                pseudo_parent = None
                children.append(child)
            else:
                if pseudo_parent is not None and isinstance(
                    pseudo_parent, expected_parent
                ):
                    pseudo_parent.children.append(child)
                else:
                    pseudo_parent = expected_parent(render=False)
                    children.append(pseudo_parent)
                    pseudo_parent.children = [child]
                    Context.root_block.blocks[pseudo_parent._id] = pseudo_parent
                child.parent = pseudo_parent
        self.children = children

    def __exit__(self, *args):
        if getattr(self, "allow_expected_parents", True):
            self.fill_expected_parents()
        Context.block = self.parent

    def postprocess(self, y):
        """
        Any postprocessing needed to be performed on a block context.
        """
        return y


class BlockFunction:
    def __init__(self, fn: Optional[Callable], preprocess: bool, postprocess: bool):
        self.fn = fn
        self.preprocess = preprocess
        self.postprocess = postprocess
        self.total_runtime = 0
        self.total_runs = 0

    def __str__(self):
        return str(
            {
                "fn": getattr(self.fn, "__name__", "fn")
                if self.fn is not None
                else None,
                "preprocess": self.preprocess,
                "postprocess": self.postprocess,
            }
        )

    def __repr__(self):
        return str(self)


class class_or_instancemethod(classmethod):
    def __get__(self, instance, type_):
        descr_get = super().__get__ if instance is None else self.__func__.__get__
        return descr_get(instance, type_)


@document()
def update(**kwargs) -> dict:
    """
    Updates component properties.
    This is a shorthand for using the update method on a component.
    For example, rather than using gr.Number.update(...) you can just use gr.update(...).
    Note that your editor's autocompletion will suggest proper parameters
    if you use the update method on the component.

    Demos: blocks_essay, blocks_update, blocks_essay_update

    Parameters:
        kwargs: Key-word arguments used to update the component's properties.
    Example:
        # Blocks Example
        import gradio as gr
        with gr.Blocks() as demo:
            radio = gr.Radio([1, 2, 4], label="Set the value of the number")
            number = gr.Number(value=2, interactive=True)
            radio.change(fn=lambda value: gr.update(value=value), inputs=radio, outputs=number)
        demo.launch()
        # Interface example
        import gradio as gr
        def change_textbox(choice):
          if choice == "short":
              return gr.Textbox.update(lines=2, visible=True)
          elif choice == "long":
              return gr.Textbox.update(lines=8, visible=True)
          else:
              return gr.Textbox.update(visible=False)
        gr.Interface(
          change_textbox,
          gr.Radio(
              ["short", "long", "none"], label="What kind of essay would you like to write?"
          ),
          gr.Textbox(lines=2),
          live=True,
        ).launch()
    """
    kwargs["__type__"] = "generic_update"
    return kwargs


def skip() -> dict:
    return update()


def postprocess_update_dict(block: Block, update_dict: Dict, postprocess: bool = True):
    """
    Converts a dictionary of updates into a format that can be sent to the frontend.
    E.g. {"__type__": "generic_update", "value": "2", "interactive": False}
    Into -> {"__type__": "update", "value": 2.0, "mode": "static"}

    Parameters:
        block: The Block that is being updated with this update dictionary.
        update_dict: The original update dictionary
        postprocess: Whether to postprocess the "value" key of the update dictionary.
    """
    prediction_value = block.get_specific_update(update_dict)
    if prediction_value.get("value") is components._Keywords.NO_VALUE:
        prediction_value.pop("value")
    prediction_value = delete_none(prediction_value, skip_value=True)
    if "value" in prediction_value and postprocess:
        prediction_value["value"] = block.postprocess(prediction_value["value"])
    return prediction_value


def convert_component_dict_to_list(outputs_ids: List[int], predictions: Dict) -> List:
    """
    Converts a dictionary of component updates into a list of updates in the order of
    the outputs_ids and including every output component.
    E.g. {"textbox": "hello", "number": {"__type__": "generic_update", "value": "2"}}
    Into -> ["hello", {"__type__": "generic_update"}, {"__type__": "generic_update", "value": "2"}]
    """
    keys_are_blocks = [isinstance(key, Block) for key in predictions.keys()]
    if all(keys_are_blocks):
        reordered_predictions = [skip() for _ in outputs_ids]
        for component, value in predictions.items():
            if component._id not in outputs_ids:
                raise ValueError(
                    f"Returned component {component} not specified as output of function."
                )
            output_index = outputs_ids.index(component._id)
            reordered_predictions[output_index] = value
        predictions = utils.resolve_singleton(reordered_predictions)
    elif any(keys_are_blocks):
        raise ValueError(
            "Returned dictionary included some keys as Components. Either all keys must be Components to assign Component values, or return a List of values to assign output values in order."
        )
    return predictions


@document("load")
class Blocks(BlockContext):
    """
    Blocks is Gradio's low-level API that allows you to create more custom web
    applications and demos than Interfaces (yet still entirely in Python).


    Compared to the Interface class, Blocks offers more flexibility and control over:
    (1) the layout of components (2) the events that
    trigger the execution of functions (3) data flows (e.g. inputs can trigger outputs,
    which can trigger the next level of outputs). Blocks also offers ways to group
    together related demos such as with tabs.


    The basic usage of Blocks is as follows: create a Blocks object, then use it as a
    context (with the "with" statement), and then define layouts, components, or events
    within the Blocks context. Finally, call the launch() method to launch the demo.

    Example:
        import gradio as gr
        def update(name):
            return f"Welcome to Gradio, {name}!"

        with gr.Blocks() as demo:
            gr.Markdown("Start typing below and then click **Run** to see the output.")
            with gr.Row():
                inp = gr.Textbox(placeholder="What is your name?")
                out = gr.Textbox()
            btn = gr.Button("Run")
            btn.click(fn=update, inputs=inp, outputs=out)

        demo.launch()
    Demos: blocks_hello, blocks_flipper, blocks_speech_text_sentiment, generate_english_german
    Guides: blocks_and_event_listeners, controlling_layout, state_in_blocks, custom_CSS_and_JS, custom_interpretations_with_blocks, using_blocks_like_functions
    """

    def __init__(
        self,
        theme: str = "default",
        analytics_enabled: Optional[bool] = None,
        mode: str = "blocks",
        title: str = "Gradio",
        css: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            theme: which theme to use - right now, only "default" is supported.
            analytics_enabled: whether to allow basic telemetry. If None, will use GRADIO_ANALYTICS_ENABLED environment variable or default to True.
            mode: a human-friendly name for the kind of Blocks interface being created.
            title: The tab title to display when this is opened in a browser window.
            css: custom css or path to custom css file to apply to entire Blocks
        """
        # Cleanup shared parameters with Interface #TODO: is this part still necessary after Interface with Blocks?
        self.limiter = None
        self.save_to = None
        self.theme = theme
        self.requires_permissions = False  # TODO: needs to be implemented
        self.encrypt = False
        self.share = False
        self.enable_queue = None
        self.max_threads = 40
        self.show_error = True
        if css is not None and os.path.exists(css):
            with open(css) as css_file:
                self.css = css_file.read()
        else:
            self.css = css

        # For analytics_enabled and allow_flagging: (1) first check for
        # parameter, (2) check for env variable, (3) default to True/"manual"
        self.analytics_enabled = (
            analytics_enabled
            if analytics_enabled is not None
            else os.getenv("GRADIO_ANALYTICS_ENABLED", "True") == "True"
        )

        super().__init__(render=False, **kwargs)
        self.blocks: Dict[int, Block] = {}
        self.fns: List[BlockFunction] = []
        self.dependencies = []
        self.mode = mode

        self.is_running = False
        self.local_url = None
        self.share_url = None
        self.width = None
        self.height = None

        self.ip_address = None
        self.is_space = True if os.getenv("SYSTEM") == "spaces" else False
        self.favicon_path = None
        self.auth = None
        self.dev_mode = True
        self.app_id = random.getrandbits(64)
        self.temp_dirs = set()
        self.title = title
        self.show_api = True

        if self.analytics_enabled:
            self.ip_address = utils.get_local_ip_address()
            data = {
                "mode": self.mode,
                "ip_address": self.ip_address,
                "custom_css": self.css is not None,
                "theme": self.theme,
                "version": pkgutil.get_data(__name__, "version.txt")
                .decode("ascii")
                .strip(),
            }
            utils.initiated_analytics(data)

    @property
    def share(self):
        return self._share

    @share.setter
    def share(self, value: Optional[bool]):
        # If share is not provided, it is set to True when running in Google Colab, or False otherwise
        if value is None:
            self._share = True if utils.colab_check() else False
        else:
            self._share = value

    @classmethod
    def from_config(cls, config: dict, fns: List[Callable]) -> Blocks:
        """Factory method that creates a Blocks from a config and list of functions."""
        config = copy.deepcopy(config)
        components_config = config["components"]
        original_mapping: Dict[int, Block] = {}

        def get_block_instance(id: int) -> Block:
            for block_config in components_config:
                if block_config["id"] == id:
                    break
            else:
                raise ValueError("Cannot find block with id {}".format(id))
            cls = component_or_layout_class(block_config["type"])
            block_config["props"].pop("type", None)
            block_config["props"].pop("name", None)
            style = block_config["props"].pop("style", None)
            block = cls(**block_config["props"])
            if style:
                block.style(**style)
            return block

        def iterate_over_children(children_list):
            for child_config in children_list:
                id = child_config["id"]
                block = get_block_instance(id)
                original_mapping[id] = block

                children = child_config.get("children")
                if children is not None:
                    with block:
                        iterate_over_children(children)

        with Blocks(theme=config["theme"], css=config["theme"]) as blocks:
            iterate_over_children(config["layout"]["children"])

            # add the event triggers
            for dependency, fn in zip(config["dependencies"], fns):
                targets = dependency.pop("targets")
                trigger = dependency.pop("trigger")
                dependency.pop("backend_fn")
                dependency.pop("documentation", None)
                dependency["inputs"] = [
                    original_mapping[i] for i in dependency["inputs"]
                ]
                dependency["outputs"] = [
                    original_mapping[o] for o in dependency["outputs"]
                ]
                dependency.pop("status_tracker", None)
                dependency["_js"] = dependency.pop("js", None)
                dependency["preprocess"] = False
                dependency["postprocess"] = False

                for target in targets:
                    event_method = getattr(original_mapping[target], trigger)
                    event_method(fn=fn, **dependency)

            # Allows some use of Interface-specific methods with loaded Spaces
            blocks.predict = [fns[0]]
            dependency = blocks.dependencies[0]
            blocks.input_components = [blocks.blocks[i] for i in dependency["inputs"]]
            blocks.output_components = [blocks.blocks[o] for o in dependency["outputs"]]

        if config.get("mode", "blocks") == "interface":
            blocks.__name__ = "Interface"
            blocks.mode = "interface"
            blocks.api_mode = True

        return blocks

    def __call__(self, *params, fn_index=0):
        """
        Allows Blocks objects to be called as functions
        Parameters:
        *params: the parameters to pass to the function
        fn_index: the index of the function to call (defaults to 0, which for Interfaces, is the default prediction function)
        """
        dependency = self.dependencies[fn_index]
        block_fn = self.fns[fn_index]

        processed_input = []
        for i, input_id in enumerate(dependency["inputs"]):
            block = self.blocks[input_id]
            if getattr(block, "stateful", False):
                raise ValueError(
                    "Cannot call Blocks object as a function if any of"
                    " the inputs are stateful."
                )
            else:
                serialized_input = block.serialize(params[i])
                processed_input.append(serialized_input)

        processed_input = self.preprocess_data(fn_index, processed_input, None)

        if inspect.iscoroutinefunction(block_fn.fn):
            predictions = utils.synchronize_async(block_fn.fn, *processed_input)
        else:
            predictions = block_fn.fn(*processed_input)

        predictions = self.postprocess_data(fn_index, predictions, None)

        output_copy = copy.deepcopy(predictions)
        predictions = []
        for o, output_id in enumerate(dependency["outputs"]):
            block = self.blocks[output_id]
            if getattr(block, "stateful", False):
                raise ValueError(
                    "Cannot call Blocks object as a function if any of"
                    " the outputs are stateful."
                )
            else:
                deserialized = block.deserialize(output_copy[o])
                predictions.append(deserialized)

        return utils.resolve_singleton(predictions)

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        num_backend_fns = len([d for d in self.dependencies if d["backend_fn"]])
        repr = f"Gradio Blocks instance: {num_backend_fns} backend functions"
        repr += "\n" + "-" * len(repr)
        for d, dependency in enumerate(self.dependencies):
            if dependency["backend_fn"]:
                repr += f"\nfn_index={d}"
                repr += "\n inputs:"
                for input_id in dependency["inputs"]:
                    block = self.blocks[input_id]
                    repr += "\n |-{}".format(str(block))
                repr += "\n outputs:"
                for output_id in dependency["outputs"]:
                    block = self.blocks[output_id]
                    repr += "\n |-{}".format(str(block))
        return repr

    def render(self):
        if Context.root_block is not None:
            if self._id in Context.root_block.blocks:
                raise DuplicateBlockError(
                    f"A block with id: {self._id} has already been rendered in the current Blocks."
                )
            if not set(Context.root_block.blocks).isdisjoint(self.blocks):
                raise DuplicateBlockError(
                    "At least one block in this Blocks has already been rendered."
                )

            Context.root_block.blocks.update(self.blocks)
            Context.root_block.fns.extend(self.fns)
            for dependency in self.dependencies:
                api_name = dependency["api_name"]
                if api_name is not None:
                    api_name_ = utils.append_unique_suffix(
                        api_name,
                        [dep["api_name"] for dep in Context.root_block.dependencies],
                    )
                    if not (api_name == api_name_):
                        warnings.warn(
                            "api_name {} already exists, using {}".format(
                                api_name, api_name_
                            )
                        )
                        dependency["api_name"] = api_name_
                Context.root_block.dependencies.append(dependency)
            Context.root_block.temp_dirs = Context.root_block.temp_dirs | self.temp_dirs

        if Context.block is not None:
            Context.block.children.extend(self.children)

    def preprocess_data(self, fn_index, raw_input, state):
        block_fn = self.fns[fn_index]
        dependency = self.dependencies[fn_index]

        if block_fn.preprocess:
            processed_input = []
            for i, input_id in enumerate(dependency["inputs"]):
                block = self.blocks[input_id]
                if getattr(block, "stateful", False):
                    processed_input.append(state.get(input_id))
                else:
                    processed_input.append(block.preprocess(raw_input[i]))
        else:
            processed_input = raw_input
        return processed_input

    async def call_function(self, fn_index, processed_input, iterator=None):
        """Calls and times function with given index and preprocessed input."""
        block_fn = self.fns[fn_index]
        is_generating = False
        start = time.time()

        if iterator is None:  # If not a generator function that has already run
            if inspect.iscoroutinefunction(block_fn.fn):
                prediction = await block_fn.fn(*processed_input)
            else:
                prediction = await anyio.to_thread.run_sync(
                    block_fn.fn, *processed_input, limiter=self.limiter
                )

        if inspect.isasyncgenfunction(block_fn.fn):
            raise ValueError("Gradio does not support async generators.")
        if inspect.isgeneratorfunction(block_fn.fn):
            if not self.enable_queue:
                raise ValueError("Need to enable queue to use generators.")
            try:
                if iterator is None:
                    iterator = prediction
                prediction = await anyio.to_thread.run_sync(
                    utils.async_iteration, iterator, limiter=self.limiter
                )
                is_generating = True
            except StopAsyncIteration:
                n_outputs = len(self.dependencies[fn_index].get("outputs"))
                prediction = (
                    components._Keywords.FINISHED_ITERATING
                    if n_outputs == 1
                    else (components._Keywords.FINISHED_ITERATING,) * n_outputs
                )
                iterator = None

        duration = time.time() - start

        return {
            "prediction": prediction,
            "duration": duration,
            "is_generating": is_generating,
            "iterator": iterator,
        }

    def postprocess_data(self, fn_index, predictions, state):
        block_fn = self.fns[fn_index]
        dependency = self.dependencies[fn_index]

        if type(predictions) is dict and len(predictions) > 0:
            predictions = convert_component_dict_to_list(
                dependency["outputs"], predictions
            )

        if len(dependency["outputs"]) == 1:
            predictions = (predictions,)

        output = []
        for i, output_id in enumerate(dependency["outputs"]):
            if predictions[i] is components._Keywords.FINISHED_ITERATING:
                output.append(None)
                continue
            block = self.blocks[output_id]
            if getattr(block, "stateful", False):
                if not utils.is_update(predictions[i]):
                    state[output_id] = predictions[i]
                output.append(None)
            else:
                prediction_value = predictions[i]
                if utils.is_update(prediction_value):
                    prediction_value = postprocess_update_dict(
                        block=block,
                        update_dict=prediction_value,
                        postprocess=block_fn.postprocess,
                    )
                elif block_fn.postprocess:
                    prediction_value = block.postprocess(prediction_value)
                output.append(prediction_value)
        return output

    async def process_api(
        self,
        fn_index: int,
        inputs: List[Any],
        username: str = None,
        state: Dict[int, Any] | None = None,
        iterators: Dict[int, Any] | None = None,
    ) -> Dict[str, Any]:
        """
        Processes API calls from the frontend. First preprocesses the data,
        then runs the relevant function, then postprocesses the output.
        Parameters:
            data: data recieved from the frontend
            inputs: the list of raw inputs to pass to the function
            username: name of user if authentication is set up (not used)
            state: data stored from stateful components for session (key is input block id)
            iterators: the in-progress iterators for each generator function (key is function index)
        Returns: None
        """
        block_fn = self.fns[fn_index]

        inputs = self.preprocess_data(fn_index, inputs, state)
        iterator = iterators.get(fn_index, None) if iterators else None

        result = await self.call_function(fn_index, inputs, iterator)
        block_fn.total_runtime += result["duration"]
        block_fn.total_runs += 1

        predictions = self.postprocess_data(fn_index, result["prediction"], state)
        return {
            "data": predictions,
            "is_generating": result["is_generating"],
            "iterator": result["iterator"],
            "duration": result["duration"],
            "average_duration": block_fn.total_runtime / block_fn.total_runs,
        }

    async def create_limiter(self):
        self.limiter = (
            None
            if self.max_threads == 40
            else CapacityLimiter(total_tokens=self.max_threads)
        )

    def get_config(self):
        return {"type": "column"}

    def get_config_file(self):
        config = {
            "version": routes.VERSION,
            "mode": self.mode,
            "dev_mode": self.dev_mode,
            "components": [],
            "theme": self.theme,
            "css": self.css,
            "title": self.title or "Gradio",
            "is_space": self.is_space,
            "enable_queue": getattr(self, "enable_queue", False),  # launch attributes
            "show_error": getattr(self, "show_error", False),
            "show_api": self.show_api,
        }

        def getLayout(block):
            if not isinstance(block, BlockContext):
                return {"id": block._id}
            children_layout = []
            for child in block.children:
                children_layout.append(getLayout(child))
            return {"id": block._id, "children": children_layout}

        config["layout"] = getLayout(self)

        for _id, block in self.blocks.items():
            config["components"].append(
                {
                    "id": _id,
                    "type": (block.get_block_name()),
                    "props": utils.delete_none(block.get_config())
                    if hasattr(block, "get_config")
                    else {},
                }
            )
        config["dependencies"] = self.dependencies
        return config

    def __enter__(self):
        if Context.block is None:
            Context.root_block = self
        self.parent = Context.block
        Context.block = self
        return self

    def __exit__(self, *args):
        super().fill_expected_parents()
        Context.block = self.parent
        # Configure the load events before root_block is reset
        self.attach_load_events()
        if self.parent is None:
            Context.root_block = None
        else:
            self.parent.children.extend(self.children)
        self.config = self.get_config_file()
        self.app = routes.App.create_app(self)

    @class_or_instancemethod
    def load(
        self_or_cls,
        fn: Optional[Callable] = None,
        inputs: Optional[List[Component]] = None,
        outputs: Optional[List[Component]] = None,
        *,
        name: Optional[str] = None,
        src: Optional[str] = None,
        api_key: Optional[str] = None,
        alias: Optional[str] = None,
        _js: Optional[str] = None,
        **kwargs,
    ) -> Blocks | None:
        """
        For reverse compatibility reasons, this is both a class method and an instance
        method, the two of which, confusingly, do two completely different things.


        Class method: loads a demo from a Hugging Face Spaces repo and creates it locally and returns a block instance. Equivalent to gradio.Interface.load()


        Instance method: adds event that runs as soon as the demo loads in the browser. Example usage below.
        Parameters:
            name: Class Method - the name of the model (e.g. "gpt2"), can include the `src` as prefix (e.g. "models/gpt2")
            src: Class Method - the source of the model: `models` or `spaces` (or empty if source is provided as a prefix in `name`)
            api_key: Class Method - optional api key for use with Hugging Face Hub
            alias: Class Method - optional string used as the name of the loaded model instead of the default name
            fn: Instance Method - Callable function
            inputs: Instance Method - input list
            outputs: Instance Method - output list
        Example:
            import gradio as gr
            import datetime
            with gr.Blocks() as demo:
                def get_time():
                    return datetime.datetime.now().time()
                dt = gr.Textbox(label="Current time")
                demo.load(get_time, inputs=None, outputs=dt)
            demo.launch()
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if isinstance(self_or_cls, type):
            if name is None:
                raise ValueError(
                    "Blocks.load() requires passing `name` as a keyword argument"
                )
            if fn is not None:
                kwargs["fn"] = fn
            if inputs is not None:
                kwargs["inputs"] = inputs
            if outputs is not None:
                kwargs["outputs"] = outputs
            return external.load_blocks_from_repo(name, src, api_key, alias, **kwargs)
        else:
            self_or_cls.set_event_trigger(
                event_name="load",
                fn=fn,
                inputs=inputs,
                outputs=outputs,
                no_target=True,
                js=_js,
            )

    def clear(self):
        """Resets the layout of the Blocks object."""
        self.blocks = {}
        self.fns = []
        self.dependencies = []
        self.children = []
        return self

    @document()
    def queue(
        self,
        concurrency_count: int = 1,
        status_update_rate: float | str = "auto",
        client_position_to_load_data: int = 30,
        default_enabled: bool = True,
        max_size: Optional[int] = None,
    ):
        """
        You can control the rate of processed requests by creating a queue. This will allow you to set the number of requests to be processed at one time, and will let users know their position in the queue.
        Parameters:
            concurrency_count: Number of worker threads that will be processing requests concurrently.
            status_update_rate: If "auto", Queue will send status estimations to all clients whenever a job is finished. Otherwise Queue will send status at regular intervals set by this parameter as the number of seconds.
            client_position_to_load_data: Once a client's position in Queue is less that this value, the Queue will collect the input data from the client. You may make this smaller if clients can send large volumes of data, such as video, since the queued data is stored in memory.
            default_enabled: If True, all event listeners will use queueing by default.
        Example:
            demo = gr.Interface(gr.Textbox(), gr.Image(), image_generator)
            demo.queue(concurrency_count=3)
            demo.launch()
        """
        self.enable_queue = default_enabled
        self._queue = queue.Queue(
            live_updates=status_update_rate == "auto",
            concurrency_count=concurrency_count,
            data_gathering_start=client_position_to_load_data,
            update_intervals=status_update_rate if status_update_rate != "auto" else 1,
            max_size=max_size,
        )
        self.config = self.get_config_file()
        return self

    def launch(
        self,
        inline: bool = None,
        inbrowser: bool = False,
        share: Optional[bool] = None,
        debug: bool = False,
        enable_queue: bool = None,
        max_threads: int = 40,
        auth: Optional[Callable | Tuple[str, str] | List[Tuple[str, str]]] = None,
        auth_message: Optional[str] = None,
        prevent_thread_lock: bool = False,
        show_error: bool = False,
        server_name: Optional[str] = None,
        server_port: Optional[int] = None,
        show_tips: bool = False,
        height: int = 500,
        width: int = 900,
        encrypt: bool = False,
        favicon_path: Optional[str] = None,
        ssl_keyfile: Optional[str] = None,
        ssl_certfile: Optional[str] = None,
        ssl_keyfile_password: Optional[str] = None,
        quiet: bool = False,
        show_api: bool = True,
        _frontend: bool = True,
    ) -> Tuple[FastAPI, str, str]:
        """
        Launches a simple web server that serves the demo. Can also be used to create a
        public link used by anyone to access the demo from their browser by setting share=True.

        Parameters:
            inline: whether to display in the interface inline in an iframe. Defaults to True in python notebooks; False otherwise.
            inbrowser: whether to automatically launch the interface in a new tab on the default browser.
            share: whether to create a publicly shareable link for the interface. Creates an SSH tunnel to make your UI accessible from anywhere. If not provided, it is set to False by default every time, except when running in Google Colab. When localhost is not accessible (e.g. Google Colab), setting share=False is not supported.
            debug: if True, blocks the main thread from running. If running in Google Colab, this is needed to print the errors in the cell output.
            auth: If provided, username and password (or list of username-password tuples) required to access interface. Can also provide function that takes username and password and returns True if valid login.
            auth_message: If provided, HTML message provided on login page.
            prevent_thread_lock: If True, the interface will block the main thread while the server is running.
            show_error: If True, any errors in the interface will be displayed in an alert modal and printed in the browser console log
            server_port: will start gradio app on this port (if available). Can be set by environment variable GRADIO_SERVER_PORT. If None, will search for an available port starting at 7860.
            server_name: to make app accessible on local network, set this to "0.0.0.0". Can be set by environment variable GRADIO_SERVER_NAME. If None, will use "127.0.0.1".
            show_tips: if True, will occasionally show tips about new Gradio features
            enable_queue: DEPRECATED (use .queue() method instead.) if True, inference requests will be served through a queue instead of with parallel threads. Required for longer inference times (> 1min) to prevent timeout. The default option in HuggingFace Spaces is True. The default option elsewhere is False.
            max_threads: allow up to `max_threads` to be processed in parallel. The default is inherited from the starlette library (currently 40).
            width: The width in pixels of the iframe element containing the interface (used if inline=True)
            height: The height in pixels of the iframe element containing the interface (used if inline=True)
            encrypt: If True, flagged data will be encrypted by key provided by creator at launch
            favicon_path: If a path to a file (.png, .gif, or .ico) is provided, it will be used as the favicon for the web page.
            ssl_keyfile: If a path to a file is provided, will use this as the private key file to create a local server running on https.
            ssl_certfile: If a path to a file is provided, will use this as the signed certificate for https. Needs to be provided if ssl_keyfile is provided.
            ssl_keyfile_password: If a password is provided, will use this with the ssl certificate for https.
            quiet: If True, suppresses most print statements.
            show_api: If True, shows the api docs in the footer of the app. Default True.
        Returns:
            app: FastAPI app object that is running the demo
            local_url: Locally accessible link to the demo
            share_url: Publicly accessible link to the demo (if share=True, otherwise None)
        Example:
            import gradio as gr
            def reverse(text):
                return text[::-1]
            demo = gr.Interface(reverse, "text", "text")
            demo.launch(share=True, auth=("username", "password"))
        """
        self.dev_mode = False
        if (
            auth
            and not callable(auth)
            and not isinstance(auth[0], tuple)
            and not isinstance(auth[0], list)
        ):
            auth = [auth]
        self.auth = auth
        self.auth_message = auth_message
        self.show_tips = show_tips
        self.show_error = show_error
        self.height = height
        self.width = width
        self.favicon_path = favicon_path
        self.show_api = show_api
        if enable_queue is not None:
            self.enable_queue = enable_queue
            warnings.warn(
                "The `enable_queue` parameter has been deprecated. Please use the `.queue()` method instead.",
                DeprecationWarning,
            )

        if self.is_space:
            self.enable_queue = self.enable_queue is not False
        else:
            self.enable_queue = self.enable_queue is True
        if self.enable_queue and not hasattr(self, "_queue"):
            self.queue()

        self.config = self.get_config_file()
        self.share = share
        self.encrypt = encrypt
        self.max_threads = max(
            self._queue.max_thread_count if self.enable_queue else 0, max_threads
        )
        if self.encrypt:
            self.encryption_key = encryptor.get_key(
                getpass.getpass("Enter key for encryption: ")
            )

        if self.is_running:
            self.server_app.launchable = self
            if not (quiet):
                print(
                    "Rerunning server... use `close()` to stop if you need to change `launch()` parameters.\n----"
                )
        else:
            server_name, server_port, local_url, app, server = networking.start_server(
                self,
                server_name,
                server_port,
                ssl_keyfile,
                ssl_certfile,
                ssl_keyfile_password,
            )
            self.server_name = server_name
            self.local_url = local_url
            self.server_port = server_port
            self.server_app = app
            self.server = server
            self.is_running = True
            self.protocol = "https" if self.local_url.startswith("https") else "http"

            if self.enable_queue:
                self._queue.set_url(self.local_url)

            # Cannot run async functions in background other than app's scope.
            # Workaround by triggering the app endpoint
            requests.get(f"{self.local_url}startup-events")

            if self.enable_queue:
                if self.auth is not None or self.encrypt:
                    raise ValueError(
                        "Cannot queue with encryption or authentication enabled."
                    )
        utils.launch_counter()

        # If running in a colab or not able to access localhost,
        # a shareable link must be created.
        is_colab = utils.colab_check()
        if is_colab or (_frontend and not networking.url_ok(self.local_url)):
            if not self.share:
                raise ValueError(
                    "When running in Google Colab or when localhost is not accessible, a shareable link must be created. Please set share=True."
                )
            if is_colab and not quiet:
                if debug:
                    print(strings.en["COLAB_DEBUG_TRUE"])
                else:
                    print(strings.en["COLAB_DEBUG_FALSE"])
        else:
            print(
                strings.en["RUNNING_LOCALLY_SEPARATED"].format(
                    self.protocol, self.server_name, self.server_port
                )
            )
        if is_colab and self.requires_permissions:
            print(strings.en["MEDIA_PERMISSIONS_IN_COLAB"])

        if self.share:
            if self.is_space:
                raise RuntimeError("Share is not supported when you are in Spaces")
            try:
                if self.share_url is None:
                    share_url = networking.setup_tunnel(self.server_port, None)
                    self.share_url = share_url
                print(strings.en["SHARE_LINK_DISPLAY"].format(self.share_url))
                if not (quiet):
                    print(strings.en["SHARE_LINK_MESSAGE"])
            except RuntimeError:
                if self.analytics_enabled:
                    utils.error_analytics(self.ip_address, "Not able to set up tunnel")
                self.share_url = None
                self.share = False
                print(strings.en["COULD_NOT_GET_SHARE_LINK"])
        else:
            if not (quiet):
                print(strings.en["PUBLIC_SHARE_TRUE"])
            self.share_url = None

        if inbrowser:
            link = self.share_url if self.share else self.local_url
            webbrowser.open(link)

        # Check if running in a Python notebook in which case, display inline
        if inline is None:
            inline = utils.ipython_check() and (auth is None)
        if inline:
            if auth is not None:
                print(
                    "Warning: authentication is not supported inline. Please"
                    "click the link to access the interface in a new tab."
                )
            try:
                from IPython.display import HTML, display  # type: ignore

                if self.share:
                    while not networking.url_ok(self.share_url):
                        time.sleep(1)
                    display(
                        HTML(
                            f'<div><iframe src="{self.share_url}" width="{self.width}" height="{self.height}" allow="autoplay; camera; microphone; clipboard-read; clipboard-write;" frameborder="0" allowfullscreen></iframe></div>'
                        )
                    )
                else:
                    display(
                        HTML(
                            f'<div><iframe src="{self.local_url}" width="{self.width}" height="{self.height}" allow="autoplay; camera; microphone; clipboard-read; clipboard-write;" frameborder="0" allowfullscreen></iframe></div>'
                        )
                    )
            except ImportError:
                pass

        if getattr(self, "analytics_enabled", False):
            data = {
                "launch_method": "browser" if inbrowser else "inline",
                "is_google_colab": is_colab,
                "is_sharing_on": self.share,
                "share_url": self.share_url,
                "ip_address": self.ip_address,
                "enable_queue": self.enable_queue,
                "show_tips": self.show_tips,
                "server_name": server_name,
                "server_port": server_port,
                "is_spaces": self.is_space,
                "mode": self.mode,
            }
            utils.launch_analytics(data)

        utils.show_tip(self)

        # Block main thread if debug==True
        if debug or int(os.getenv("GRADIO_DEBUG", 0)) == 1:
            self.block_thread()
        # Block main thread if running in a script to stop script from exiting
        is_in_interactive_mode = bool(getattr(sys, "ps1", sys.flags.interactive))

        if not prevent_thread_lock and not is_in_interactive_mode:
            self.block_thread()

        return self.server_app, self.local_url, self.share_url

    def integrate(
        self,
        comet_ml: comet_ml.Experiment = None,
        wandb: ModuleType("wandb") = None,
        mlflow: ModuleType("mlflow") = None,
    ) -> None:
        """
        A catch-all method for integrating with other libraries. This method should be run after launch()
        Parameters:
            comet_ml: If a comet_ml Experiment object is provided, will integrate with the experiment and appear on Comet dashboard
            wandb: If the wandb module is provided, will integrate with it and appear on WandB dashboard
            mlflow: If the mlflow module  is provided, will integrate with the experiment and appear on ML Flow dashboard
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

    def close(self, verbose: bool = True) -> None:
        """
        Closes the Interface that was launched and frees the port.
        """
        try:
            if self.enable_queue:
                self._queue.close()
            self.server.close()
            self.is_running = False
            if verbose:
                print("Closing server running on port: {}".format(self.server_port))
        except (AttributeError, OSError):  # can't close if not running
            pass

    def block_thread(
        self,
    ) -> None:
        """Block main thread until interrupted by user."""
        try:
            while True:
                time.sleep(0.1)
        except (KeyboardInterrupt, OSError):
            print("Keyboard interruption in main thread... closing server.")
            self.server.close()

    def attach_load_events(self):
        """Add a load event for every component whose initial value should be randomized."""

        for component in Context.root_block.blocks.values():
            if (
                isinstance(component, components.IOComponent)
                and component.attach_load_event
            ):
                # Use set_event_trigger to avoid ambiguity between load class/instance method
                self.set_event_trigger(
                    "load",
                    component.load_fn,
                    None,
                    component,
                    no_target=True,
                    queue=False,
                )

    def startup_events(self):
        """Events that should be run when the app containing this block starts up."""
        if self.enable_queue:
            utils.run_coro_in_background(self._queue.start)
        utils.run_coro_in_background(self.create_limiter)
