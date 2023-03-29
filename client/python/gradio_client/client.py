"""The main Client class for the Python client."""
from __future__ import annotations

import concurrent.futures
import json
import re
import threading
import uuid
from concurrent.futures import Future
from typing import Any, Callable, Dict, List, Tuple

import huggingface_hub
import requests
import websockets
from huggingface_hub.utils import build_hf_headers, send_telemetry
from packaging import version

from gradio_client import serializing, utils
from gradio_client.serializing import Serializable


class Client:
    def __init__(
        self,
        space: str | None = None,
        src: str | None = None,
        hf_token: str | None = None,
        max_workers: int = 40,
    ):
        """
        Parameters:
            space: The name of the Space to load, e.g. "abidlabs/pictionary". If it is a private Space, you must provide an hf_token. app. Either `space` or `src` must be provided.
            src: The full URL of the hosted Gradio app to load, e.g. "https://mydomain.com/app" or the shareable link to a Gradio app, e.g. "https://bec81a83-5b5c-471e.gradio.live/". Either `space` or `src` must be provided.
            hf_token: The Hugging Face token to use to access private Spaces. If not provided, only public Spaces can be loaded.
            max_workers: The maximum number of thread workers that can be used to make requests to the remote Gradio app simultaneously.
        """
        self.hf_token = hf_token
        self.headers = build_hf_headers(
            token=hf_token,
            library_name="gradio_client",
            library_version=utils.__version__,
        )

        if space is None and src is None:
            raise ValueError("Either `space` or `src` must be provided")
        elif space and src:
            raise ValueError("Only one of `space` or `src` should be provided")
        self.src = src or self._space_name_to_src(space)
        if self.src is None:
            raise ValueError(
                f"Could not find Space: {space}. If it is a private Space, please provide an hf_token."
            )
        else:
            print(f"Loaded as API: {self.src} ✔")

        self.api_url = utils.API_URL.format(self.src)
        self.ws_url = utils.WS_URL.format(self.src).replace("http", "ws", 1)
        self.config = self._get_config()

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
        fn_index: int = 0,
        result_callbacks: Callable | List[Callable] | None = None,
    ) -> Future:
        """
        Parameters:
            *args: The arguments to pass to the remote API. The order of the arguments must match the order of the inputs in the Gradio app.
            api_name: The name of the API endpoint to call. If not provided, the first API will be called. Takes precedence over fn_index.
            fn_index: The index of the API endpoint to call. If not provided, the first API will be called.
            result_callbacks: A callback function, or list of callback functions, to be called when the result is ready. If a list of functions is provided, they will be called in order. The return values from the remote API are provided as separate parameters into the callback. If None, no callback will be called.
        Returns:
            A Job object that can be used to retrieve the status and result of the remote API call.
        """
        if api_name:
            fn_index = self._infer_fn_index(api_name)

        end_to_end_fn = self.endpoints[fn_index].end_to_end_fn
        future = self.executor.submit(end_to_end_fn, *args)
        job = Job(future)

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

    def usage(self, all_endpoints=True, print_usage=True) -> str | None:
        """
        Parameters:
            all_endpoints: If True, returns information for both named and unnamed endpoints in the Gradio app. If False, will only return info about named endpoints.
            print_usage: If True, prints the usage info to the console. If False, returns the usage info as a string.
        """
        named_endpoints: Dict[str, Dict[str, Dict[str, Tuple[str, str]]]] = {}
        unnamed_endpoints: Dict[int, Dict[str, Dict[str, Tuple[str, str]]]] = {}
        for endpoint in self.endpoints:
            if endpoint.is_valid:
                if endpoint.api_name:
                    named_endpoints[endpoint.api_name] = endpoint.get_info()
                else:
                    unnamed_endpoints[endpoint.fn_index] = endpoint.get_info()

        usage_info = f"Client.predict() Usage Info\n---------------------------\nNamed endpoints: {len(named_endpoints)}\n"
        usage_info += self._render_endpoints_info(
            named_endpoints, label_format='api_name="{}"'
        )
        if unnamed_endpoints and all_endpoints:
            usage_info += f"\nUnnamed endpoints: {len(unnamed_endpoints)}\n"
            usage_info += self._render_endpoints_info(
                unnamed_endpoints, label_format="fn_index={}"
            )
        if print_usage:
            print(usage_info)
        else:
            return usage_info

    def _render_endpoints_info(
        self,
        endpoints_info: Dict[Any, Dict[str, Dict[str, Tuple[str, str]]]],
        label_format: str,
    ) -> str:
        usage_info = ""
        for label, info in endpoints_info.items():
            parameters = ",".join(list(info["parameters"].keys()))
            if parameters:
                parameters = f"{parameters}, "
            returns = ",".join(list(info["returns"].keys()))
            if returns:
                returns = f" -> {returns}"
            usage_info += (
                f" - predict({parameters}{label_format.format(label)}){returns}\n"
            )
            if parameters:
                usage_info += "    Parameters:\n"
                for name, type in info["parameters"].items():
                    usage_info += f"     - [{type[1]}] {name}: {type[0]}\n"
            if returns:
                usage_info += "    Returns:\n"
                for name, type in info["returns"].items():
                    usage_info += f"     - [{type[1]}] {name}: {type[0]}\n"
        return usage_info

    def __repr__(self):
        return self.usage()

    def __str__(self):
        return self.usage()

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

    def _infer_fn_index(self, api_name: str) -> int:
        for i, d in enumerate(self.config["dependencies"]):
            if d.get("api_name") == api_name:
                return i
        raise ValueError(f"Cannot find a function with api_name: {api_name}")

    def __del__(self):
        if hasattr(self, "executor"):
            self.executor.shutdown(wait=True)

    def _space_name_to_src(self, space) -> str | None:
        return huggingface_hub.space_info(space, token=self.hf_token).host  # type: ignore

    def _get_config(self) -> Dict:
        assert self.src is not None
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
        self.api_url = client.api_url
        self.ws_url = client.ws_url
        self.fn_index = fn_index
        self.dependency = dependency
        self.api_name: str | None = dependency.get("api_name")
        self.headers = client.headers
        self.config = client.config
        self.use_ws = self._use_websocket(self.dependency)
        self.hf_token = client.hf_token
        try:
            self.serializers, self.deserializers = self._setup_serializers()
            self.is_valid = self.dependency[
                "backend_fn"
            ]  # Only a real API endpoint if backend_fn is True and serializers are valid
        except AssertionError:
            self.is_valid = False

    def get_info(self) -> Dict[str, Dict[str, Tuple[str, str]]]:
        parameters = {}
        for i, input in enumerate(self.dependency["inputs"]):
            for component in self.config["components"]:
                if component["id"] == input:
                    label = component["props"].get("label", f"parameter_{i}").lower()
                    if "info" in component:
                        info = component["info"]["input"]
                    else:
                        info = (
                            self.serializers[i].get_input_type(),
                            component.get("type", "component").capitalize(),
                        )
                    parameters[label] = info
        returns = {}
        for o, output in enumerate(self.dependency["outputs"]):
            for component in self.config["components"]:
                if component["id"] == output:
                    label = component["props"].get("label", f"parameter_{o}").lower()
                    if "info" in component:
                        info = component["info"]["output"]
                    info = (
                        self.deserializers[o].get_output_type(),
                        component.get("type", "component").capitalize(),
                    )
                    returns[label] = info

        return {"parameters": parameters, "returns": returns}

    def end_to_end_fn(self, *data):
        if not self.is_valid:
            raise utils.InvalidAPIEndpointError()
        inputs = self.serialize(*data)
        predictions = self.predict(*inputs)
        outputs = self.deserialize(*predictions)
        if len(self.dependency["outputs"]) == 1:
            return outputs[0]
        return outputs

    def predict(self, *data) -> Tuple:
        data = json.dumps({"data": data, "fn_index": self.fn_index})
        hash_data = json.dumps(
            {"fn_index": self.fn_index, "session_hash": str(uuid.uuid4())}
        )
        if self.use_ws:
            result = utils.synchronize_async(self._ws_fn, data, hash_data)
            output = result["data"]
        else:
            response = requests.post(self.api_url, headers=self.headers, data=data)
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

    def _predict_resolve(self, *data) -> Any:
        """Needed for gradio.load(), which has a slightly different signature for serializing/deserializing"""
        outputs = self.predict(*data)
        if len(self.dependency["outputs"]) == 1:
            return outputs[0]
        return outputs

    def serialize(self, *data) -> Tuple:
        assert len(data) == len(
            self.serializers
        ), f"Expected {len(self.serializers)} arguments, got {len(data)}"
        return tuple([s.serialize(d) for s, d in zip(self.serializers, data)])

    def deserialize(self, *data) -> Tuple:
        assert len(data) == len(
            self.deserializers
        ), f"Expected {len(self.deserializers)} outputs, got {len(data)}"
        return tuple(
            [
                s.deserialize(d, hf_token=self.hf_token)
                for s, d in zip(self.deserializers, data)
            ]
        )

    def _setup_serializers(self) -> Tuple[List[Serializable], List[Serializable]]:
        inputs = self.dependency["inputs"]
        serializers = []

        for i in inputs:
            for component in self.config["components"]:
                if component["id"] == i:
                    if component.get("serializer"):
                        serializer_name = component["serializer"]
                        assert (
                            serializer_name in serializing.SERIALIZER_MAPPING
                        ), f"Unknown serializer: {serializer_name}, you may need to update your gradio_client version."
                        serializer = serializing.SERIALIZER_MAPPING[serializer_name]
                    else:
                        component_name = component["type"]
                        assert (
                            component_name in serializing.COMPONENT_MAPPING
                        ), f"Unknown component: {component_name}, you may need to update your gradio_client version."
                        serializer = serializing.COMPONENT_MAPPING[component_name]
                    serializers.append(serializer())  # type: ignore

        outputs = self.dependency["outputs"]
        deserializers = []
        for i in outputs:
            for component in self.config["components"]:
                if component["id"] == i:
                    if component.get("serializer"):
                        serializer_name = component["serializer"]
                        assert (
                            serializer_name in serializing.SERIALIZER_MAPPING
                        ), f"Unknown serializer: {serializer_name}, you may need to update your gradio_client version."
                        deserializer = serializing.SERIALIZER_MAPPING[serializer_name]
                    else:
                        component_name = component["type"]
                        assert (
                            component_name in serializing.COMPONENT_MAPPING
                        ), f"Unknown component: {component_name}, you may need to update your gradio_client version."
                        deserializer = serializing.COMPONENT_MAPPING[component_name]
                    deserializers.append(deserializer())  # type: ignore

        return serializers, deserializers

    def _use_websocket(self, dependency: Dict) -> bool:
        queue_enabled = self.config.get("enable_queue", False)
        queue_uses_websocket = version.parse(
            self.config.get("version", "2.0")
        ) >= version.Version("3.2")
        dependency_uses_queue = dependency.get("queue", False) is not False
        return queue_enabled and queue_uses_websocket and dependency_uses_queue

    async def _ws_fn(self, data, hash_data):
        async with websockets.connect(  # type: ignore
            self.ws_url, open_timeout=10, extra_headers=self.headers
        ) as websocket:
            return await utils.get_pred_from_ws(websocket, data, hash_data)


class Job(Future):
    """A Job is a thin wrapper over the Future class that can be cancelled."""

    def __init__(self, future: Future):
        self.future = future

    def __getattr__(self, name):
        """Forwards any properties to the Future class."""
        return getattr(self.future, name)

    def cancel(self) -> bool:
        """Cancels the job."""
        if self.future.cancelled() or self.future.done():
            pass
            return False
        elif self.future.running():
            pass  # TODO: Handle this case
            return True
        else:
            return self.future.cancel()
