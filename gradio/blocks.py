from __future__ import annotations

import asyncio
import copy
import getpass
import inspect
import os
import random
import sys
import time
import webbrowser
from typing import TYPE_CHECKING, Any, AnyStr, Callable, Dict, List, Optional, Tuple

import anyio
import requests
from anyio import CapacityLimiter

from gradio import encryptor, event_queue, external, networking, routes, strings, utils
from gradio.context import Context
from gradio.deprecation import check_deprecated_parameters
from gradio.utils import component_or_layout_class, delete_none

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from fastapi.applications import FastAPI

    from gradio.components import Component, StatusTracker
    from gradio.routes import PredictBody


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
        if Context.block is not None:
            Context.block.children.append(self)
        if Context.root_block is not None:
            Context.root_block.blocks[self._id] = self

    def unrender(self):
        """
        Removes self from BlockContext if it has been rendered (otherwise does nothing).
        Only deletes the first occurrence of self in BlockContext. Removes from the
        layout and collection of Blocks, but does not delete any event triggers.
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
        js: Optional[str] = False,
        no_target: bool = False,
        status_tracker: Optional[StatusTracker] = None,
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
            status_tracker: StatusTracker to visualize function progress
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
        dependency = {
            "targets": [self._id] if not no_target else [],
            "trigger": event_name,
            "inputs": [block._id for block in inputs],
            "outputs": [block._id for block in outputs],
            "backend_fn": fn is not None,
            "js": js,
            "status_tracker": status_tracker._id
            if status_tracker is not None
            else None,
            "queue": queue,
            "api_name": api_name,
            "scroll_to_output": scroll_to_output,
            "show_progress": show_progress,
        }
        if api_name is not None:
            dependency["documentation"] = [
                [component.document_parameters("input") for component in inputs],
                [component.document_parameters("output") for component in outputs],
            ]
        Context.root_block.dependencies.append(dependency)

    def get_config(self):
        return {
            "visible": self.visible,
            "elem_id": self.elem_id,
            "style": self._style,
        }


class BlockContext(Block):
    def __init__(
        self,
        visible: bool = True,
        render: bool = True,
        **kwargs,
    ):
        self.children = []
        super().__init__(visible=visible, render=render, **kwargs)

    def __enter__(self):
        self.parent = Context.block
        Context.block = self
        return self

    def __exit__(self, *args):
        Context.block = self.parent

    def postprocess(self, y):
        return y


class BlockFunction:
    def __init__(self, fn: Optional[Callable], preprocess: bool, postprocess: bool):
        self.fn = fn
        self.preprocess = preprocess
        self.postprocess = postprocess
        self.total_runtime = 0
        self.total_runs = 0


class class_or_instancemethod(classmethod):
    def __get__(self, instance, type_):
        descr_get = super().__get__ if instance is None else self.__func__.__get__
        return descr_get(instance, type_)


def update(**kwargs) -> dict:
    """
    Updates component parameters
    @param kwargs: Updating component parameters
    @return: Updated component parameters
    """
    kwargs["__type__"] = "generic_update"
    return kwargs


def is_update(val):
    return type(val) is dict and "update" in val.get("__type__", "")


def skip() -> dict:
    return update()


class Blocks(BlockContext):
    """
    The Blocks class is a low-level API that allows you to create custom web
    applications entirely in Python. Compared to the Interface class, Blocks offers
    more flexibility and control over: (1) the layout of components (2) the events that
    trigger the execution of functions (3) data flows (e.g. inputs can trigger outputs,
    which can trigger the next level of outputs). Blocks also offers ways to group
    together related demos e.g. using tabs.

    The basic usage of Blocks is as follows: create a Blocks object, then use it as a
    context (with the "with" statement), and then define layouts, components, or events
    within the Blocks context. Finally, call the launch() method to launch the demo.
    """

    def __init__(
        self,
        theme: str = "default",
        analytics_enabled: Optional[bool] = None,
        mode: str = "blocks",
        css: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        theme (str): which theme to use - right now, only "default" is supported.
        analytics_enabled (bool | None): whether to allow basic telemetry. If None, will use GRADIO_ANALYTICS_ENABLED environment variable or default to True.
        mode (str): a human-friendly name for the kind of Blocks interface being created.
        """
        # Cleanup shared parameters with Interface #TODO: is this part still necessary after Interface with Blocks?
        self.limiter = None
        self.save_to = None
        self.api_mode = False
        self.theme = theme
        self.requires_permissions = False  # TODO: needs to be implemented
        self.encrypt = False
        self.share = False
        self.enable_queue = False
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
        self.share_url = None

        self.ip_address = utils.get_local_ip_address()
        self.is_space = True if os.getenv("SYSTEM") == "spaces" else False
        self.favicon_path = None
        self.auth = None
        self.dev_mode = True
        self.app_id = random.getrandbits(64)

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
                if dependency.get("status_tracker", None) is not None:
                    dependency["status_tracker"] = original_mapping[
                        dependency["status_tracker"]
                    ]
                dependency["_js"] = dependency.pop("js", None)
                dependency["_preprocess"] = False
                dependency["_postprocess"] = False

                for target in targets:
                    event_method = getattr(original_mapping[target], trigger)
                    event_method(fn=fn, **dependency)

            # Allows some use of Interface-specific methods with loaded Spaces
            blocks.predict = [fns[0]]
            dependency = blocks.dependencies[0]
            blocks.input_components = [blocks.blocks[i] for i in dependency["inputs"]]
            blocks.output_components = [blocks.blocks[o] for o in dependency["outputs"]]

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

        if self.api_mode:
            serialized_params = []
            for i, input_id in enumerate(dependency["inputs"]):
                block = self.blocks[input_id]
                if getattr(block, "stateful", False):
                    raise ValueError(
                        "Cannot call Blocks object as a function if any of"
                        " the inputs are stateful."
                    )
                else:
                    serialized_input = block.serialize(params[i], True)
                    serialized_params.append(serialized_input)
        else:
            serialized_params = params

        processed_input = self.preprocess_data(fn_index, serialized_params, None)

        if inspect.iscoroutinefunction(block_fn.fn):
            predictions = utils.synchronize_async(block_fn.fn, *processed_input)
        else:
            predictions = block_fn.fn(*processed_input)

        output = self.postprocess_data(fn_index, predictions, None)

        if self.api_mode:
            output_copy = copy.deepcopy(output)
            deserialized_output = []
            for o, output_id in enumerate(dependency["outputs"]):
                block = self.blocks[output_id]
                if getattr(block, "stateful", False):
                    raise ValueError(
                        "Cannot call Blocks object as a function if any of"
                        " the outputs are stateful."
                    )
                else:
                    deserialized = block.deserialize(output_copy[o])
                    deserialized_output.append(deserialized)
        else:
            deserialized_output = output

        if len(deserialized_output) == 1:
            return deserialized_output[0]
        return deserialized_output

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
            Context.root_block.blocks.update(self.blocks)
            Context.root_block.fns.extend(self.fns)
            Context.root_block.dependencies.extend(self.dependencies)
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

    async def call_function(self, fn_index, processed_input):
        """Calls and times function with given index and preprocessed input."""
        block_fn = self.fns[fn_index]

        start = time.time()
        if inspect.iscoroutinefunction(block_fn.fn):
            prediction = await block_fn.fn(*processed_input)
        else:
            prediction = await anyio.to_thread.run_sync(
                block_fn.fn, *processed_input, limiter=self.limiter
            )
        duration = time.time() - start
        return prediction, duration

    def postprocess_data(self, fn_index, predictions, state):
        block_fn = self.fns[fn_index]
        dependency = self.dependencies[fn_index]

        if type(predictions) is dict and len(predictions) > 0:
            keys_are_blocks = [isinstance(key, Block) for key in predictions.keys()]
            if all(keys_are_blocks):
                reordered_predictions = [skip() for _ in dependency["outputs"]]
                for component, value in predictions.items():
                    if component._id not in dependency["outputs"]:
                        return ValueError(
                            f"Returned component {component} not specified as output of function."
                        )
                    output_index = dependency["outputs"].index(component._id)
                    reordered_predictions[output_index] = value
                predictions = reordered_predictions
            elif any(keys_are_blocks):
                raise ValueError(
                    "Returned dictionary included some keys as Components. Either all keys must be Components to assign Component values, or return a List of values to assign output values in order."
                )
        if len(dependency["outputs"]) == 1:
            predictions = (predictions,)

        if block_fn.postprocess:
            output = []
            for i, output_id in enumerate(dependency["outputs"]):
                block = self.blocks[output_id]
                if getattr(block, "stateful", False):
                    if not is_update(predictions[i]):
                        state[output_id] = predictions[i]
                    output.append(None)
                else:
                    prediction_value = predictions[i]
                    if is_update(prediction_value):
                        if prediction_value["__type__"] == "generic_update":
                            del prediction_value["__type__"]
                            prediction_value = block.__class__.update(
                                **prediction_value
                            )
                        prediction_value = delete_none(prediction_value)
                        if "value" in prediction_value:
                            prediction_value["value"] = (
                                block.postprocess(prediction_value["value"])
                                if prediction_value["value"] is not None
                                else None
                            )
                        output_value = prediction_value
                    else:
                        output_value = (
                            block.postprocess(prediction_value)
                            if prediction_value is not None
                            else None
                        )
                    output.append(output_value)

        else:
            output = predictions
        return output

    async def process_api(
        self,
        fn_index: int,
        raw_input: List[Any],
        username: str = None,
        state: Optional[Dict[int, any]] = None,
    ) -> Dict[str, Any]:
        """
        Processes API calls from the frontend. First preprocesses the data,
        then runs the relevant function, then postprocesses the output.
        Parameters:
            data: data recieved from the frontend
            username: name of user if authentication is set up
            state: data stored from stateful components for session
        Returns: None
        """
        block_fn = self.fns[fn_index]

        processed_input = self.preprocess_data(fn_index, raw_input, state)

        predictions, duration = await self.call_function(fn_index, processed_input)
        block_fn.total_runtime += duration
        block_fn.total_runs += 1

        output = self.postprocess_data(fn_index, predictions, state)

        return {
            "data": output,
            "duration": duration,
            "average_duration": block_fn.total_runtime / block_fn.total_runs,
        }

    async def create_limiter(self, max_threads: Optional[int]):
        self.limiter = (
            None if max_threads is None else CapacityLimiter(total_tokens=max_threads)
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
            "enable_queue": getattr(
                self, "enable_queue", False
            ),  # attribute set at launch
        }

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

        def getLayout(block):
            if not isinstance(block, BlockContext):
                return {"id": block._id}
            children = []
            for child in block.children:
                children.append(getLayout(child))
            return {"id": block._id, "children": children}

        config["layout"] = getLayout(self)
        config["dependencies"] = self.dependencies
        return config

    def __enter__(self):
        if Context.block is None:
            Context.root_block = self
        self.parent = Context.block
        Context.block = self
        return self

    def __exit__(self, *args):
        Context.block = self.parent
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
        **kwargs,
    ) -> Blocks | None:
        """
        For reverse compatibility reasons, this is both a class method and an instance
        method, the two of which, confusingly, do two completely different things.

        Class method: loads a demo from a Hugging Face Spaces repo and creates it locally
        Parameters:
            name (str): the name of the model (e.g. "gpt2"), can include the `src` as prefix (e.g. "models/gpt2")
            src (str | None): the source of the model: `models` or `spaces` (or empty if source is provided as a prefix in `name`)
            api_key (str | None): optional api key for use with Hugging Face Hub
            alias (str | None): optional string used as the name of the loaded model instead of the default name
            type (str): the type of the Blocks, either a standard `blocks` or `column`
        Returns: Blocks instance

        Instance method: adds an event for when the demo loads in the browser.
        Parameters:
            fn: Callable function
            inputs: input list
            outputs: output list
        Returns: None
        """
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
                event_name="load", fn=fn, inputs=inputs, outputs=outputs, no_target=True
            )

    def clear(self):
        """Resets the layout of the Blocks object."""
        self.blocks = {}
        self.fns = []
        self.dependencies = []
        self.children = []
        return self

    def launch(
        self,
        inline: bool = None,
        inbrowser: bool = False,
        share: Optional[bool] = None,
        debug: bool = False,
        enable_queue: bool = None,
        max_threads: Optional[int] = None,
        auth: Optional[Callable | Tuple[str, str] | List[Tuple[str, str]]] = None,
        auth_message: Optional[str] = None,
        prevent_thread_lock: bool = False,
        show_error: bool = True,
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
        live_queue_updates=True,
        queue_concurrency_count: int = 1,
        data_gathering_start: int = 30,
        update_intervals: int = 5,
        duration_history_size=100,
        _frontend: bool = True,
    ) -> Tuple[FastAPI, str, str]:
        """
        Launches a simple web server that serves the demo. Can also be used to create a
        shareable link.
        Parameters:
        inline (bool | None): whether to display in the interface inline in an iframe. Defaults to True in python notebooks; False otherwise.
        inbrowser (bool): whether to automatically launch the interface in a new tab on the default browser.
        share (bool | None): whether to create a publicly shareable link for the interface. Creates an SSH tunnel to make your UI accessible from anywhere. If not provided, it is set to False by default every time, except when running in Google Colab. When localhost is not accessible (e.g. Google Colab), setting share=False is not supported.
        debug (bool): if True, blocks the main thread from running. If running in Google Colab, this is needed to print the errors in the cell output.
        auth (Callable | Union[Tuple[str, str] | List[Tuple[str, str]]] | None): If provided, username and password (or list of username-password tuples) required to access interface. Can also provide function that takes username and password and returns True if valid login.
        auth_message (str | None): If provided, HTML message provided on login page.
        prevent_thread_lock (bool): If True, the interface will block the main thread while the server is running.
        show_error (bool): If True, any errors in the interface will be printed in the browser console log
        server_port (int | None): will start gradio app on this port (if available). Can be set by environment variable GRADIO_SERVER_PORT. If None, will search for an available port starting at 7860.
        server_name (str | None): to make app accessible on local network, set this to "0.0.0.0". Can be set by environment variable GRADIO_SERVER_NAME. If None, will use "127.0.0.1".
        show_tips (bool): if True, will occasionally show tips about new Gradio features
        enable_queue (bool | None): if True, inference requests will be served through a queue instead of with parallel threads. Required for longer inference times (> 1min) to prevent timeout. The default option in HuggingFace Spaces is True. The default option elsewhere is False.
        max_threads (int | None): allow up to `max_threads` to be processed in parallel. The default is inherited from the starlette library (currently 40).
        width (int): The width in pixels of the iframe element containing the interface (used if inline=True)
        height (int): The height in pixels of the iframe element containing the interface (used if inline=True)
        encrypt (bool): If True, flagged data will be encrypted by key provided by creator at launch
        favicon_path (str | None): If a path to a file (.png, .gif, or .ico) is provided, it will be used as the favicon for the web page.
        ssl_keyfile (str | None): If a path to a file is provided, will use this as the private key file to create a local server running on https.
        ssl_certfile (str | None): If a path to a file is provided, will use this as the signed certificate for https. Needs to be provided if ssl_keyfile is provided.
        ssl_keyfile_password (str | None): If a password is provided, will use this with the ssl certificate for https.
        quiet (bool): If True, suppresses most print statements.
        live_queue_updates(bool): If True, Queue will send estimations whenever a job is finished as well.
        queue_concurrency_count(int): Number of max number concurrent jobs inside the Queue.
        data_gathering_start(int): If Rank<Parameter, Queue asks for data from the client. You may make it smaller if users can send very big data(video or such) to not reach memory overflow.
        update_intervals(int): Queue will send estimations to the clients using intervals determined by update_intervals.
        duration_history_size(int): Queue duration estimation calculation window size.

        Returns:
        app (FastAPI): FastAPI app object that is running the demo
        local_url (str): Locally accessible link to the demo
        share_url (str): Publicly accessible link to the demo (if share=True, otherwise None)
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
        if self.is_space and enable_queue is None:
            self.enable_queue = True
        else:
            self.enable_queue = enable_queue or False
        utils.run_coro_in_background(self.create_limiter, max_threads)
        self.config = self.get_config_file()
        self.share = share
        self.encrypt = encrypt
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
            server_port, path_to_local_server, app, server = networking.start_server(
                self,
                server_name,
                server_port,
                ssl_keyfile,
                ssl_certfile,
                ssl_keyfile_password,
            )
            self.local_url = path_to_local_server
            self.server_port = server_port
            self.server_app = app
            self.server = server
            self.is_running = True

            if app.blocks.enable_queue:
                if app.blocks.auth is not None or app.blocks.encrypt:
                    raise ValueError(
                        "Cannot queue with encryption or authentication enabled."
                    )
                event_queue.Queue.configure_queue(
                    self.local_url,
                    live_queue_updates,
                    queue_concurrency_count,
                    data_gathering_start,
                    update_intervals,
                    duration_history_size,
                )
                # Cannot run async functions in background other than app's scope.
                # Workaround by triggering the app endpoint
                requests.get(f"{self.local_url}start/queue")
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
            print(strings.en["RUNNING_LOCALLY"].format(self.local_url))
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
                            f'<div><iframe src="{self.share_url}" width="{self.width}" height="{self.height}" allow="autoplay; camera; microphone;" frameborder="0" allowfullscreen></iframe></div>'
                        )
                    )
                else:
                    display(
                        HTML(
                            f'<div><iframe src="{self.local_url}" width="{self.width}" height="{self.height}" allow="autoplay; camera; microphone;" frameborder="0" allowfullscreen></iframe></div>'
                        )
                    )
            except ImportError:
                pass

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
        if hasattr(self, "analytics_enabled") and self.analytics_enabled:
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

    def close(self, verbose: bool = True) -> None:
        """
        Closes the Interface that was launched and frees the port.
        """
        try:
            from gradio.event_queue import Queue

            if self.enable_queue:
                Queue.close()
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
