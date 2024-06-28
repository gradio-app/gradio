"""This module contains the EndpointV3Compatibility class, which is used to connect to Gradio apps running 3.x.x versions of Gradio."""

from __future__ import annotations

import json
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

import httpx
import huggingface_hub
import websockets
from packaging import version

from gradio_client import serializing, utils
from gradio_client.exceptions import SerializationSetupError
from gradio_client.utils import (
    Communicator,
)

if TYPE_CHECKING:
    from gradio_client import Client


class EndpointV3Compatibility:
    """Endpoint class for connecting to v3 endpoints. Backwards compatibility."""

    def __init__(self, client: Client, fn_index: int, dependency: dict, *_args):
        self.client: Client = client
        self.fn_index = fn_index
        self.dependency = dependency
        api_name = dependency.get("api_name")
        self.api_name: str | Literal[False] | None = (
            "/" + api_name if isinstance(api_name, str) else api_name
        )
        self.use_ws = self._use_websocket(self.dependency)
        self.protocol = "ws" if self.use_ws else "http"
        self.input_component_types = []
        self.output_component_types = []
        self.root_url = client.src + "/" if not client.src.endswith("/") else client.src
        try:
            # Only a real API endpoint if backend_fn is True (so not just a frontend function), serializers are valid,
            # and api_name is not False (meaning that the developer has explicitly disabled the API endpoint)
            self.serializers, self.deserializers = self._setup_serializers()
            self.is_valid = self.dependency["backend_fn"] and self.api_name is not False
        except SerializationSetupError:
            self.is_valid = False
        self.backend_fn = dependency.get("backend_fn")
        self.show_api = True

    def __repr__(self):
        return f"Endpoint src: {self.client.src}, api_name: {self.api_name}, fn_index: {self.fn_index}"

    def __str__(self):
        return self.__repr__()

    def make_end_to_end_fn(self, helper: Communicator | None = None):
        _predict = self.make_predict(helper)

        def _inner(*data):
            if not self.is_valid:
                raise utils.InvalidAPIEndpointError()
            data = self.insert_state(*data)
            data = self.serialize(*data)
            predictions = _predict(*data)
            predictions = self.process_predictions(*predictions)
            # Append final output only if not already present
            # for consistency between generators and not generators
            if helper:
                with helper.lock:
                    if not helper.job.outputs:
                        helper.job.outputs.append(predictions)
            return predictions

        return _inner

    def make_cancel(self, helper: Communicator | None = None):  # noqa: ARG002 (needed so that both endpoints classes have the same api)
        return None

    def make_predict(self, helper: Communicator | None = None):
        def _predict(*data) -> tuple:
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
                if "error" in result:
                    raise ValueError(result["error"])
            else:
                response = httpx.post(
                    self.client.api_url,
                    headers=self.client.headers,
                    json=data,
                    verify=self.client.ssl_verify,
                )
                result = json.loads(response.content.decode("utf-8"))
            try:
                output = result["data"]
            except KeyError as ke:
                is_public_space = (
                    self.client.space_id
                    and not huggingface_hub.space_info(self.client.space_id).private
                )
                if "error" in result and "429" in result["error"] and is_public_space:
                    raise utils.TooManyRequestsError(
                        f"Too many requests to the API, please try again later. To avoid being rate-limited, "
                        f"please duplicate the Space using Client.duplicate({self.client.space_id}) "
                        f"and pass in your Hugging Face token."
                    ) from None
                elif "error" in result:
                    raise ValueError(result["error"]) from None
                raise KeyError(
                    f"Could not find 'data' key in response. Response received: {result}"
                ) from ke
            return tuple(output)

        return _predict

    def _predict_resolve(self, *data) -> Any:
        """Needed for gradio.load(), which has a slightly different signature for serializing/deserializing"""
        outputs = self.make_predict()(*data)
        if len(self.dependency["outputs"]) == 1:
            return outputs[0]
        return outputs

    def _upload(
        self, file_paths: list[str | list[str]]
    ) -> list[str | list[str]] | list[dict[str, Any] | list[dict[str, Any]]]:
        if not file_paths:
            return []
        # Put all the filepaths in one file
        # but then keep track of which index in the
        # original list they came from so we can recreate
        # the original structure
        files = []
        indices = []
        for i, fs in enumerate(file_paths):
            if not isinstance(fs, list):
                fs = [fs]
            for f in fs:
                files.append(("files", (Path(f).name, open(f, "rb"))))  # noqa: SIM115
                indices.append(i)
        r = httpx.post(
            self.client.upload_url,
            headers=self.client.headers,
            files=files,
            verify=self.client.ssl_verify,
        )
        if r.status_code != 200:
            uploaded = file_paths
        else:
            uploaded = []
            result = r.json()
            for i, fs in enumerate(file_paths):
                if isinstance(fs, list):
                    output = [o for ix, o in enumerate(result) if indices[ix] == i]
                    res = [
                        {
                            "is_file": True,
                            "name": o,
                            "orig_name": Path(f).name,
                            "data": None,
                        }
                        for f, o in zip(fs, output)
                    ]
                else:
                    o = next(o for ix, o in enumerate(result) if indices[ix] == i)
                    res = {
                        "is_file": True,
                        "name": o,
                        "orig_name": Path(fs).name,
                        "data": None,
                    }
                uploaded.append(res)
        return uploaded

    def _add_uploaded_files_to_data(
        self,
        files: list[str | list[str]] | list[dict[str, Any] | list[dict[str, Any]]],
        data: list[Any],
    ) -> None:
        """Helper function to modify the input data with the uploaded files."""
        file_counter = 0
        for i, t in enumerate(self.input_component_types):
            if t in ["file", "uploadbutton"]:
                data[i] = files[file_counter]
                file_counter += 1

    def insert_state(self, *data) -> tuple:
        data = list(data)
        for i, input_component_type in enumerate(self.input_component_types):
            if input_component_type == utils.STATE_COMPONENT:
                data.insert(i, None)
        return tuple(data)

    def remove_skipped_components(self, *data) -> tuple:
        data = [
            d
            for d, oct in zip(data, self.output_component_types)
            if oct not in utils.SKIP_COMPONENTS
        ]
        return tuple(data)

    def reduce_singleton_output(self, *data) -> Any:
        if (
            len(
                [
                    oct
                    for oct in self.output_component_types
                    if oct not in utils.SKIP_COMPONENTS
                ]
            )
            == 1
        ):
            return data[0]
        else:
            return data

    def serialize(self, *data) -> tuple:
        if len(data) != len(self.serializers):
            raise ValueError(
                f"Expected {len(self.serializers)} arguments, got {len(data)}"
            )

        files = [
            f
            for f, t in zip(data, self.input_component_types)
            if t in ["file", "uploadbutton"]
        ]
        uploaded_files = self._upload(files)
        data = list(data)
        self._add_uploaded_files_to_data(uploaded_files, data)
        o = tuple([s.serialize(d) for s, d in zip(self.serializers, data)])
        return o

    def deserialize(self, *data) -> tuple:
        if len(data) != len(self.deserializers):
            raise ValueError(
                f"Expected {len(self.deserializers)} outputs, got {len(data)}"
            )
        outputs = tuple(
            [
                s.deserialize(
                    d,
                    save_dir=self.client.output_dir,
                    hf_token=self.client.hf_token,
                    root_url=self.root_url,
                )
                for s, d in zip(self.deserializers, data)
            ]
        )
        return outputs

    def process_predictions(self, *predictions):
        if self.client.download_files:
            predictions = self.deserialize(*predictions)
        predictions = self.remove_skipped_components(*predictions)
        predictions = self.reduce_singleton_output(*predictions)
        return predictions

    def _setup_serializers(
        self,
    ) -> tuple[list[serializing.Serializable], list[serializing.Serializable]]:
        inputs = self.dependency["inputs"]
        serializers = []

        for i in inputs:
            for component in self.client.config["components"]:
                if component["id"] == i:
                    component_name = component["type"]
                    self.input_component_types.append(component_name)
                    if component.get("serializer"):
                        serializer_name = component["serializer"]
                        if serializer_name not in serializing.SERIALIZER_MAPPING:
                            raise SerializationSetupError(
                                f"Unknown serializer: {serializer_name}, you may need to update your gradio_client version."
                            )
                        serializer = serializing.SERIALIZER_MAPPING[serializer_name]
                    elif component_name in serializing.COMPONENT_MAPPING:
                        serializer = serializing.COMPONENT_MAPPING[component_name]
                    else:
                        raise SerializationSetupError(
                            f"Unknown component: {component_name}, you may need to update your gradio_client version."
                        )
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
                        if serializer_name not in serializing.SERIALIZER_MAPPING:
                            raise SerializationSetupError(
                                f"Unknown serializer: {serializer_name}, you may need to update your gradio_client version."
                            )
                        deserializer = serializing.SERIALIZER_MAPPING[serializer_name]
                    elif component_name in utils.SKIP_COMPONENTS:
                        deserializer = serializing.SimpleSerializable
                    elif component_name in serializing.COMPONENT_MAPPING:
                        deserializer = serializing.COMPONENT_MAPPING[component_name]
                    else:
                        raise SerializationSetupError(
                            f"Unknown component: {component_name}, you may need to update your gradio_client version."
                        )
                    deserializers.append(deserializer())  # type: ignore

        return serializers, deserializers

    def _use_websocket(self, dependency: dict) -> bool:
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
