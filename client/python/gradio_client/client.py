"""The main Client class for the Python client."""
from __future__ import annotations

import concurrent.futures
import json
import re
import uuid
from concurrent.futures import Future
from typing import Any, Callable, Dict, List, Tuple

import requests
import websockets
from packaging import version

from gradio_client import serializing, utils
from gradio_client.serializing import Serializable


class Client:
    def __init__(
        self,
        space: str | None = None,
        src: str | None = None,
        access_token: str | None = None,
        max_workers: int = 40,
    ):
        self.access_token = access_token
        self.headers = (
            {"Authorization": f"Bearer {access_token}"} if access_token else {}
        )

        if space is None and src is None:
            raise ValueError("Either `space` or `src` must be provided")
        elif space and src:
            raise ValueError("Only one of `space` or `src` should be provided")
        self.src = src or self._space_name_to_src(space)
        if self.src is None:
            raise ValueError(
                f"Could not find Space: {space}. If it is a private Space, please provide an access_token."
            )
        else:
            print(f"Loaded as API: {self.src} ✔")

        self.api_url = utils.API_URL.format(self.src)
        self.ws_url = utils.WS_URL.format(self.src).replace("https", "wss")
        self.config = self._get_config()

        self.endpoints = [
            Endpoint(self, fn_index, dependency)
            for fn_index, dependency in enumerate(self.config["dependencies"])
        ]

        # Create a pool of threads to handle the requests
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=max_workers)

    def predict(
        self,
        *args,
        api_name: str | None = None,
        fn_index: int = 0,
        result_callbacks: List[Callable] | None = None,
    ) -> Future:
        if api_name:
            fn_index = self._infer_fn_index(api_name)

        end_to_end_fn = self.endpoints[fn_index].end_to_end_fn
        future = self.executor.submit(end_to_end_fn, *args)
        job = Job(future)

        if result_callbacks:

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

    def info(self, api_name: str | None = None) -> Dict:
        if api_name:
            fn_index = self._infer_fn_index(api_name)
            dependency = self.config["dependencies"][fn_index]
            return {
                api_name: {
                    "input_parameters": ["(str) value"],
                    "output_values": ["(str) value"],
                }
            }
        else:
            api_info = {"named_endpoints": {}}
            for dependency in self.config["dependencies"]:
                if dependency.get("api_name") and dependency["backend_fn"]:
                    api_name = dependency["api_name"]
                    api_info["named_endpoints"] = self.info(api_name)
            api_info["num_named_endpoints"] = len(api_info)  # type: ignore
            return api_info

    def pprint(self, api_name: str | None = None) -> None:
        print(json.dumps(self.info(api_name), indent=2))

    ##################################
    # Private helper methods
    ##################################

    def _infer_fn_index(self, api_name: str) -> int:
        for i, d in enumerate(self.config["dependencies"]):
            if d.get("api_name") == api_name:
                return i
        raise ValueError(f"Cannot find a function with api_name: {api_name}")

    def __del__(self):
        if hasattr(self, "executor"):
            self.executor.shutdown(wait=True)

    def _space_name_to_src(self, space) -> str | None:
        return (
            requests.get(
                f"https://huggingface.co/api/spaces/{space}/host",
                headers=self.headers,
            )
            .json()
            .get("host")
        )

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
                f"Gradio 2.x is not supported by this client. Please upgrade this app to Gradio 3.x."
            )
        return config


class Endpoint:
    """Helper class for storing all the information about a single API endpoint."""

    def __init__(self, client: Client, fn_index: int, dependency: Dict):
        self.api_url = client.api_url
        self.ws_url = client.ws_url
        self.fn_index = fn_index
        self.dependency = dependency
        self.headers = client.headers
        self.config = client.config
        self.use_ws = self._use_websocket(self.dependency)
        self.access_token = client.access_token
        try:
            self.serializers, self.deserializers = self._setup_serializers()
            self.is_valid = self.dependency[
                "backend_fn"
            ]  # Only a real API endpoint if backend_fn is True
        except AssertionError:
            self.is_valid = False

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
                s.deserialize(d, access_token=self.access_token)
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
