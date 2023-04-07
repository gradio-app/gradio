"""The main Client class for the Python client."""
from __future__ import annotations

import concurrent.futures
import json
import re
import threading
import time
import uuid
from concurrent.futures import Future, TimeoutError
from datetime import datetime
from threading import Lock
from typing import Any, Callable, Dict, List, Tuple

import huggingface_hub
import requests
import websockets
from huggingface_hub.utils import build_hf_headers, send_telemetry
from packaging import version
from typing_extensions import Literal

from gradio_client import serializing, utils
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import Serializable
from gradio_client.utils import Communicator, JobStatus, Status, StatusUpdate

set_documentation_group("py-client")


@document("predict", "submit", "view_api")
class Client:
    """
    The main Client class for the Python client. This class is used to connect to a remote Gradio app and call its API endpoints.

    Example:
        from gradio_client import Client

        client = Client("abidlabs/whisper-large-v2")  # connecting to a Hugging Face Space
        client.predict("test.mp4", api_name="/predict")
        >> What a nice recording! # returns the result of the remote API call

        client = Client("https://bec81a83-5b5c-471e.gradio.live")  # connecting to a temporary Gradio share URL
        job = client.submit("hello", api_name="/predict")  # runs the prediction in a background thread
        job.result()
        >> 49 # returns the result of the remote API call (blocking call)

    """

    def __init__(
        self,
        src: str,
        hf_token: str | None = None,
        max_workers: int = 40,
    ):
        """
        Parameters:
            src: Either the name of the Hugging Face Space to load, (e.g. "abidlabs/whisper-large-v2") or the full URL (including "http" or "https") of the hosted Gradio app to load (e.g. "http://mydomain.com/app" or "https://bec81a83-5b5c-471e.gradio.live/").
            hf_token: The Hugging Face token to use to access private Spaces. Automatically fetched if you are logged in via the Hugging Face Hub CLI.
            max_workers: The maximum number of thread workers that can be used to make requests to the remote Gradio app simultaneously.
        """
        self.hf_token = hf_token
        self.headers = build_hf_headers(
            token=hf_token,
            library_name="gradio_client",
            library_version=utils.__version__,
        )

        if src.startswith("http://") or src.startswith("https://"):
            _src = src
        else:
            _src = self._space_name_to_src(src)
            if _src is None:
                raise ValueError(
                    f"Could not find Space: {src}. If it is a private Space, please provide an hf_token."
                )
        self.src = _src
        print(f"Loaded as API: {self.src} ✔")

        self.api_url = utils.API_URL.format(self.src)
        self.ws_url = utils.WS_URL.format(self.src).replace("http", "ws", 1)
        self.config = self._get_config()
        self.session_hash = str(uuid.uuid4())

        self.endpoints = [
            Endpoint(self, fn_index, dependency)
            for fn_index, dependency in enumerate(self.config["dependencies"])
        ]

        # Create a pool of threads to handle the requests
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=max_workers)

        # Disable telemetry by setting the env variable HF_HUB_DISABLE_TELEMETRY=1
        threading.Thread(target=self._telemetry_thread).start()

    def predict(
        self,
        *args,
        api_name: str | None = None,
        fn_index: int | None = None,
    ) -> Any:
        """
        Calls the Gradio API and returns the result (this is a blocking call).

        Parameters:
            args: The arguments to pass to the remote API. The order of the arguments must match the order of the inputs in the Gradio app.
            api_name: The name of the API endpoint to call starting with a leading slash, e.g. "/predict". Does not need to be provided if the Gradio app has only one named API endpoint.
            fn_index: As an alternative to api_name, this parameter takes the index of the API endpoint to call, e.g. 0. Both api_name and fn_index can be provided, but if they conflict, api_name will take precedence.
        Returns:
            The result of the API call. Will be a Tuple if the API has multiple outputs.
        Example:
            from gradio_client import Client
            client = Client(src="gradio/calculator")
            client.predict(5, "add", 4, api_name="/predict")
            >> 9.0
        """
        return self.submit(*args, api_name=api_name, fn_index=fn_index).result()

    def submit(
        self,
        *args,
        api_name: str | None = None,
        fn_index: int | None = None,
        result_callbacks: Callable | List[Callable] | None = None,
    ) -> Job:
        """
        Creates and returns a Job object which calls the Gradio API in a background thread. The job can be used to retrieve the status and result of the remote API call.

        Parameters:
            args: The arguments to pass to the remote API. The order of the arguments must match the order of the inputs in the Gradio app.
            api_name: The name of the API endpoint to call starting with a leading slash, e.g. "/predict". Does not need to be provided if the Gradio app has only one named API endpoint.
            fn_index: As an alternative to api_name, this parameter takes the index of the API endpoint to call, e.g. 0. Both api_name and fn_index can be provided, but if they conflict, api_name will take precedence.
            result_callbacks: A callback function, or list of callback functions, to be called when the result is ready. If a list of functions is provided, they will be called in order. The return values from the remote API are provided as separate parameters into the callback. If None, no callback will be called.
        Returns:
            A Job object that can be used to retrieve the status and result of the remote API call.
        Example:
            from gradio_client import Client
            client = Client(src="gradio/calculator")
            job = client.submit(5, "add", 4, api_name="/predict")
            job.status()
            >> <Status.STARTING: 'STARTING'>
            job.result()  # blocking call
            >> 9.0
        """
        inferred_fn_index = self._infer_fn_index(api_name, fn_index)

        helper = None
        if self.endpoints[inferred_fn_index].use_ws:
            helper = Communicator(
                Lock(), JobStatus(), self.endpoints[inferred_fn_index].deserialize
            )
        end_to_end_fn = self.endpoints[inferred_fn_index].make_end_to_end_fn(helper)
        future = self.executor.submit(end_to_end_fn, *args)

        job = Job(future, communicator=helper)

        if result_callbacks:
            if isinstance(result_callbacks, Callable):
                result_callbacks = [result_callbacks]

            def create_fn(callback) -> Callable:
                def fn(future):
                    if isinstance(future.result(), tuple):
                        callback(*future.result())
                    else:
                        callback(future.result())

                return fn

            for callback in result_callbacks:
                job.add_done_callback(create_fn(callback))

        return job


    def view_api(
        self,
        all_endpoints: bool | None = None,
        print_info: bool = True,
        return_format: Literal["dict", "str"] | None = None,
    ) -> Dict | str | None:
        """
        Prints the usage info for the API. If the Gradio app has multiple API endpoints, the usage info for each endpoint will be printed separately. If return_format="dict" the info is returned in dictionary format, as shown in the example below.

        Parameters:
            all_endpoints: If True, prints information for both named and unnamed endpoints in the Gradio app. If False, will only print info about named endpoints. If None (default), will only print info about unnamed endpoints if there are no named endpoints.
            print_info: If True, prints the usage info to the console. If False, does not print the usage info.
            return_format: If None, nothing is returned. If "str", returns the same string that would be printed to the console. If "dict", returns the usage info as a dictionary that can be programmatically parsed, and *all endpoints are returned in the dictionary* regardless of the value of `all_endpoints`. The format of the dictionary is in the docstring of this method.
        Example:
            from gradio_client import Client
            client = Client(src="gradio/calculator")
            client.view_api(return_format="dict")
            >> {
                'named_endpoints': {
                    '/predict': {
                        'parameters': {
                            'num1': ['int | float', 'value', 'Number'],
                            'operation': ['str', 'value', 'Radio'],
                            'num2': ['int | float', 'value', 'Number']
                            },
                        'returns': {
                            'output': ['int | float', 'value', 'Number']
                            }
                        }
                    },
                'unnamed_endpoints': {
                    2: {
                        'parameters': {
                            'parameter_0': ['str', 'value', 'Dataset']
                            },
                        'returns': {
                            'num1': ['int | float', 'value', 'Number'],
                            'operation': ['str', 'value', 'Radio'],
                            'num2': ['int | float', 'value', 'Number'],
                            'output': ['int | float', 'value', 'Number']
                            }
                        }
                    }
                }
            }

        """
        r = requests.get(utils.API_INFO_URL.format(self.src), headers=self.headers)
        if r.ok:
            info = r.json()
        else:  
            pass # TODO(@freddy): support older versions of Gradio
        
        num_named_endpoints = len(info["named_endpoints"])
        num_unnamed_endpoints = len(info["unnamed_endpoints"])
        if num_named_endpoints == 0 and all_endpoints is None:
            all_endpoints = True

        human_info = "Client.predict() Usage Info\n---------------------------\n"
        human_info += f"Named API endpoints: {num_named_endpoints}\n"

        for api_name, endpoint_info in info["named_endpoints"].items():
            human_info += self._render_endpoints_info(api_name, endpoint_info)

        if all_endpoints:
            human_info += f"\nUnnamed API endpoints: {num_unnamed_endpoints}\n"
            for fn_index, endpoint_info in info["unnamed_endpoints"].items():
                human_info += self._render_endpoints_info(fn_index, endpoint_info)
        else:
            if num_unnamed_endpoints > 0:
                human_info += f"\nUnnamed API endpoints: {num_unnamed_endpoints}, to view, run Client.view_api(`all_endpoints=True`)\n"

        if print_info:
            print(human_info)
        if return_format == "str":
            return human_info
        elif return_format == "dict":
            return info

    def reset_session(self) -> None:
        self.session_hash = str(uuid.uuid4())

    def _render_endpoints_info(
        self,
        name_or_index: str | int,
        endpoints_info: Dict[str, Dict[str, List[str]]],
    ) -> str:
        parameter_names = list(endpoints_info["parameters"].keys())
        rendered_parameters = ", ".join(parameter_names)
        if rendered_parameters:
            rendered_parameters = rendered_parameters + ", "
        return_value_names = list(endpoints_info["returns"].keys())
        rendered_return_values = ", ".join(return_value_names)
        if len(return_value_names) > 1:
            rendered_return_values = f"({rendered_return_values})"

        if isinstance(name_or_index, str):
            final_param = f'api_name="{name_or_index}"'
        elif isinstance(name_or_index, int):
            final_param = f"fn_index={name_or_index}"
        else:
            raise ValueError("name_or_index must be a string or integer")

        human_info = f"\n - predict({rendered_parameters}{final_param}) -> {rendered_return_values}\n"
        human_info += "    Parameters:\n"
        if endpoints_info["parameters"]:
            for label, info in endpoints_info["parameters"].items():
                human_info += f"     - [{info[2]}] {label}: {info[0]} ({info[1]})\n"
        else:
            human_info += "     - None\n"
        human_info += "    Returns:\n"
        if endpoints_info["returns"]:
            for label, info in endpoints_info["returns"].items():
                human_info += f"     - [{info[2]}] {label}: {info[0]} ({info[1]})\n"
        else:
            human_info += "     - None\n"

        return human_info

    def __repr__(self):
        return self.view_api(print_info=False, return_format="str")

    def __str__(self):
        return self.view_api(print_info=False, return_format="str")

    def _telemetry_thread(self) -> None:
        # Disable telemetry by setting the env variable HF_HUB_DISABLE_TELEMETRY=1
        data = {
            "src": self.src,
        }
        try:
            send_telemetry(
                topic="py_client/initiated",
                library_name="gradio_client",
                library_version=utils.__version__,
                user_agent=data,
            )
        except Exception:
            pass

    def _infer_fn_index(self, api_name: str | None, fn_index: int | None) -> int:
        inferred_fn_index = None
        if api_name is not None:
            for i, d in enumerate(self.config["dependencies"]):
                config_api_name = d.get("api_name")
                if config_api_name is None:
                    continue
                if "/" + config_api_name == api_name:
                    inferred_fn_index = i
                    break
            else:
                error_message = f"Cannot find a function with `api_name`: {api_name}."
                if not api_name.startswith("/"):
                    error_message += " Did you mean to use a leading slash?"
                raise ValueError(error_message)
        elif fn_index is not None:
            inferred_fn_index = fn_index
        else:
            valid_endpoints = [
                e for e in self.endpoints if e.is_valid and e.api_name is not None
            ]
            if len(valid_endpoints) == 1:
                inferred_fn_index = valid_endpoints[0].fn_index
            else:
                raise ValueError(
                    "This Gradio app might have multiple endpoints. Please specify an `api_name` or `fn_index`"
                )
        return inferred_fn_index

    def __del__(self):
        if hasattr(self, "executor"):
            self.executor.shutdown(wait=True)

    def _space_name_to_src(self, space) -> str | None:
        return huggingface_hub.space_info(space, token=self.hf_token).host  # type: ignore

    def _get_config(self) -> Dict:
        r = requests.get(utils.CONFIG_URL.format(self.src), headers=self.headers)
        if r.ok:
            return r.json()
        else:  # to support older versions of Gradio
            r = requests.get(self.src, headers=self.headers)
            # some basic regex to extract the config
            result = re.search(r"window.gradio_config = (.*?);[\s]*</script>", r.text)
            try:
                config = json.loads(result.group(1))  # type: ignore
            except AttributeError:
                raise ValueError(f"Could not get Gradio config from: {self.src}")
            if "allow_flagging" in config:
                raise ValueError(
                    "Gradio 2.x is not supported by this client. Please upgrade your Gradio app to Gradio 3.x or higher."
                )
            return config


class Endpoint:
    """Helper class for storing all the information about a single API endpoint."""

    def __init__(self, client: Client, fn_index: int, dependency: Dict):
        self.client: Client = client
        self.fn_index = fn_index
        self.dependency = dependency
        api_name = dependency.get("api_name")
        self.api_name: str | None = None if api_name is None else "/" + api_name 
        self.use_ws = self._use_websocket(self.dependency)
        self.input_component_types = []
        self.output_component_types = []
        self.root_url = client.src + "/" if not client.src.endswith("/") else client.src
        try:
            self.serializers, self.deserializers = self._setup_serializers()
            self.is_valid = self.dependency[
                "backend_fn"
            ]  # Only a real API endpoint if backend_fn is True and serializers are valid
        except AssertionError:
            self.is_valid = False

    def __repr__(self):
        return "{}"
api_name
    def __str__(self):
        return json.dumps(self.get_info(), indent=4)

    def make_end_to_end_fn(self, helper: Communicator | None = None):

        _predict = self.make_predict(helper)

        def _inner(*data):
            if not self.is_valid:
                raise utils.InvalidAPIEndpointError()
            inputs = self.serialize(*data)
            predictions = _predict(*inputs)
            output = self.deserialize(*predictions)
            # Append final output only if not already present
            # for consistency between generators and not generators
            if helper:
                with helper.lock:
                    if not helper.job.outputs:
                        helper.job.outputs.append(output)
            return output

        return _inner

    def make_predict(self, helper: Communicator | None = None):
        def _predict(*data) -> Tuple:
            data = json.dumps(
                {
                    "data": data,
                    "fn_index": self.fn_index,
                    "session_hash": self.client.session_hash,
                }
            )
            hash_data = json.dumps(
                {
                    "fn_index": self.fn_index,
                    "session_hash": self.client.session_hash,
                }
            )

            if self.use_ws:
                result = utils.synchronize_async(self._ws_fn, data, hash_data, helper)
                output = result["data"]
            else:
                response = requests.post(
                    self.client.api_url, headers=self.client.headers, data=data
                )
                result = json.loads(response.content.decode("utf-8"))
                try:
                    output = result["data"]
                except KeyError:
                    if "error" in result and "429" in result["error"]:
                        raise utils.TooManyRequestsError(
                            "Too many requests to the Hugging Face API"
                        )
                    raise KeyError(
                        f"Could not find 'data' key in response. Response received: {result}"
                    )
            return tuple(output)

        return _predict

    def _predict_resolve(self, *data) -> Any:
        """Needed for gradio.load(), which has a slightly different signature for serializing/deserializing"""
        outputs = self.make_predict()(*data)
        if len(self.dependency["outputs"]) == 1:
            return outputs[0]
        return outputs

    def serialize(self, *data) -> Tuple:
        for i, input_component_type in enumerate(self.input_component_types):
            if input_component_type == utils.STATE_COMPONENT:
                data = list(data)
                data.insert(i, None)
                data = tuple(data)
        assert len(data) == len(
            self.serializers
        ), f"Expected {len(self.serializers)} arguments, got {len(data)}"
        return tuple([s.serialize(d) for s, d in zip(self.serializers, data)])

    def deserialize(self, *data) -> Tuple | Any:
        assert len(data) == len(
            self.deserializers
        ), f"Expected {len(self.deserializers)} outputs, got {len(data)}"
        outputs = tuple(
            [
                s.deserialize(d, hf_token=self.client.hf_token, root_url=self.root_url)
                for s, d, oct in zip(
                    self.deserializers, data, self.output_component_types
                )
                if not oct == utils.STATE_COMPONENT
            ]
        )
        if (
            len(
                [
                    oct
                    for oct in self.output_component_types
                    if not oct == utils.STATE_COMPONENT
                ]
            )
            == 1
        ):
            output = outputs[0]
        else:
            output = outputs
        return output

    def _setup_serializers(self) -> Tuple[List[Serializable], List[Serializable]]:
        inputs = self.dependency["inputs"]
        serializers = []

        for i in inputs:
            for component in self.client.config["components"]:
                if component["id"] == i:
                    component_name = component["type"]
                    self.input_component_types.append(component_name)
                    if component.get("serializer"):
                        serializer_name = component["serializer"]
                        assert (
                            serializer_name in serializing.SERIALIZER_MAPPING
                        ), f"Unknown serializer: {serializer_name}, you may need to update your gradio_client version."
                        serializer = serializing.SERIALIZER_MAPPING[serializer_name]
                    else:
                        assert (
                            component_name in serializing.COMPONENT_MAPPING
                        ), f"Unknown component: {component_name}, you may need to update your gradio_client version."
                        serializer = serializing.COMPONENT_MAPPING[component_name]
                    serializers.append(serializer())  # type: ignore

        outputs = self.dependency["outputs"]
        deserializers = []
        for i in outputs:
            for component in self.client.config["components"]:
                if component["id"] == i:
                    component_name = component["type"]
                    self.output_component_types.append(component_name)
                    if component.get("serializer"):
                        serializer_name = component["serializer"]
                        assert (
                            serializer_name in serializing.SERIALIZER_MAPPING
                        ), f"Unknown serializer: {serializer_name}, you may need to update your gradio_client version."
                        deserializer = serializing.SERIALIZER_MAPPING[serializer_name]
                    else:
                        assert (
                            component_name in serializing.COMPONENT_MAPPING
                        ), f"Unknown component: {component_name}, you may need to update your gradio_client version."
                        deserializer = serializing.COMPONENT_MAPPING[component_name]
                    deserializers.append(deserializer())  # type: ignore

        return serializers, deserializers

    def _use_websocket(self, dependency: Dict) -> bool:
        queue_enabled = self.client.config.get("enable_queue", False)
        queue_uses_websocket = version.parse(
            self.client.config.get("version", "2.0")
        ) >= version.Version("3.2")
        dependency_uses_queue = dependency.get("queue", False) is not False
        return queue_enabled and queue_uses_websocket and dependency_uses_queue

    async def _ws_fn(self, data, hash_data, helper: Communicator):
        async with websockets.connect(  # type: ignore
            self.client.ws_url,
            open_timeout=10,
            extra_headers=self.client.headers,
            max_size=1024 * 1024 * 1024,
        ) as websocket:
            return await utils.get_pred_from_ws(websocket, data, hash_data, helper)


@document("result", "outputs", "status")
class Job(Future):
    """
    A Job is a wrapper over the Future class that represents a prediction call that has been
    submitted by the Gradio client. This class is not meant to be instantiated directly, but rather
    is created by the Client.submit() method.

    A Job object includes methods to get the status of the prediction call, as well to get the outputs of
    the prediction call. Job objects are also iterable, and can be used in a loop to get the outputs
    of prediction calls as they become available for generator endpoints.
    """

    def __init__(
        self,
        future: Future,
        communicator: Communicator | None = None,
    ):
        """
        Parameters:
            future: The future object that represents the prediction call, created by the Client.submit() method
            communicator: The communicator object that is used to communicate between the client and the background thread running the job
        """
        self.future = future
        self.communicator = communicator
        self._counter = 0

    def __iter__(self) -> Job:
        return self

    def __next__(self) -> Tuple | Any:
        if not self.communicator:
            raise StopIteration()

        with self.communicator.lock:
            if self.communicator.job.latest_status.code == Status.FINISHED:
                raise StopIteration()

        while True:
            with self.communicator.lock:
                if len(self.communicator.job.outputs) == self._counter + 1:
                    o = self.communicator.job.outputs[self._counter]
                    self._counter += 1
                    return o
                if self.communicator.job.latest_status.code == Status.FINISHED:
                    raise StopIteration()

    def result(self, timeout=None) -> Any:
        """
        Return the result of the call that the future represents. Raises CancelledError: If the future was cancelled, TimeoutError: If the future didn't finish executing before the given timeout, and Exception: If the call raised then that exception will be raised.

        Parameters:
            timeout: The number of seconds to wait for the result if the future isn't done. If None, then there is no limit on the wait time.
        Returns:
            The result of the call that the future represents.
        Example:
            from gradio_client import Client
            calculator = Client(src="gradio/calculator")
            job = calculator.submit("foo", "add", 4, fn_index=0)
            job.result(timeout=5)
            >> 9
        """
        if self.communicator:
            timeout = timeout or float("inf")
            if self.future._exception:  # type: ignore
                raise self.future._exception  # type: ignore
            with self.communicator.lock:
                if self.communicator.job.outputs:
                    return self.communicator.job.outputs[0]
            start = datetime.now()
            while True:
                if (datetime.now() - start).seconds > timeout:
                    raise TimeoutError()
                if self.future._exception:  # type: ignore
                    raise self.future._exception  # type: ignore
                with self.communicator.lock:
                    if self.communicator.job.outputs:
                        return self.communicator.job.outputs[0]
                time.sleep(0.01)
        else:
            return super().result(timeout=timeout)

    def outputs(self) -> List[Tuple | Any]:
        """
        Returns a list containing the latest outputs from the Job.

        If the endpoint has multiple output components, the list will contain
        a tuple of results. Otherwise, it will contain the results without storing them
        in tuples.

        For endpoints that are queued, this list will contain the final job output even
        if that endpoint does not use a generator function.

        Example:
            from gradio_client import Client
            client = Client(src="gradio/count_generator")
            job = client.submit(3, api_name="/count")
            while not job.done():
                time.sleep(0.1)
            job.outputs()
            >> ['0', '1', '2']
        """
        if not self.communicator:
            return []
        else:
            with self.communicator.lock:
                return self.communicator.job.outputs

    def status(self) -> StatusUpdate:
        """
        Returns the latest status update from the Job in the form of a StatusUpdate
        object, which contains the following fields: code, rank, queue_size, success, time, eta.

        Example:
            from gradio_client import Client
            client = Client(src="gradio/calculator")
            job = client.submit(5, "add", 4, api_name="/predict")
            job.status()
            >> <Status.STARTING: 'STARTING'>
            job.status().eta
            >> 43.241  # seconds
        """
        time = datetime.now()
        if self.done():
            if not self.future._exception:  # type: ignore
                return StatusUpdate(
                    code=Status.FINISHED,
                    rank=0,
                    queue_size=None,
                    success=True,
                    time=time,
                    eta=None,
                )
            else:
                return StatusUpdate(
                    code=Status.FINISHED,
                    rank=0,
                    queue_size=None,
                    success=False,
                    time=time,
                    eta=None,
                )
        else:
            if not self.communicator:
                return StatusUpdate(
                    code=Status.PROCESSING,
                    rank=0,
                    queue_size=None,
                    success=None,
                    time=time,
                    eta=None,
                )
            else:
                with self.communicator.lock:
                    return self.communicator.job.latest_status

    def __getattr__(self, name):
        """Forwards any properties to the Future class."""
        return getattr(self.future, name)
