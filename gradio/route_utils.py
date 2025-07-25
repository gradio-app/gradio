from __future__ import annotations

import asyncio
import functools
import hashlib
import hmac
import json
import os
import pickle
import re
import shutil
import threading
import uuid
from collections import defaultdict, deque
from collections.abc import AsyncGenerator, Callable
from contextlib import AbstractAsyncContextManager, AsyncExitStack, asynccontextmanager
from dataclasses import dataclass as python_dataclass
from datetime import datetime
from pathlib import Path
from tempfile import NamedTemporaryFile, _TemporaryFileWrapper
from typing import (
    TYPE_CHECKING,
    Any,
    BinaryIO,
    Optional,
    Union,
)
from urllib.parse import urlparse

import anyio
import fastapi
import gradio_client.utils as client_utils
import httpx
from gradio_client.documentation import document
from python_multipart.multipart import MultipartParser, parse_options_header
from starlette.datastructures import FormData, Headers, MutableHeaders, UploadFile
from starlette.formparsers import MultiPartException, MultipartPart
from starlette.responses import PlainTextResponse, Response
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from gradio import processing_utils, utils
from gradio.data_classes import (
    BlocksConfigDict,
    MediaStreamChunk,
    PredictBody,
    PredictBodyInternal,
)
from gradio.exceptions import Error
from gradio.state_holder import SessionState

if TYPE_CHECKING:
    from gradio.blocks import BlockFunction, Blocks, BlocksConfig
    from gradio.helpers import EventData
    from gradio.routes import App


config_lock = threading.Lock()
API_PREFIX = "/gradio_api"


class Obj:
    """
    Using a class to convert dictionaries into objects. Used by the `Request` class.
    Credit: https://www.geeksforgeeks.org/convert-nested-python-dictionary-to-object/
    """

    def __init__(self, dict_):
        self.__dict__.update(dict_)
        for key, value in dict_.items():
            if isinstance(value, (dict, list)):
                value = Obj(value)
            setattr(self, key, value)

    def __getitem__(self, item):
        return self.__dict__[item]

    def __setitem__(self, item, value):
        self.__dict__[item] = value

    def __iter__(self):
        for key, value in self.__dict__.items():
            if isinstance(value, Obj):
                yield (key, dict(value))
            else:
                yield (key, value)

    def __contains__(self, item) -> bool:
        if item in self.__dict__:
            return True
        for value in self.__dict__.values():
            if isinstance(value, Obj) and item in value:
                return True
        return False

    def get(self, item, default=None):
        if item in self:
            return self.__dict__[item]
        return default

    def keys(self):
        return self.__dict__.keys()

    def values(self):
        return self.__dict__.values()

    def items(self):
        return self.__dict__.items()

    def __str__(self) -> str:
        return str(self.__dict__)

    def __repr__(self) -> str:
        return str(self.__dict__)

    def pop(self, item, default=None):
        if item in self:
            return self.__dict__.pop(item)
        return default


@document()
class Request:
    """
    A Gradio request object that can be used to access the request headers, cookies,
    query parameters and other information about the request from within the prediction
    function. The class is a thin wrapper around the fastapi.Request class. Attributes
    of this class include: `headers`, `client`, `query_params`, `session_hash`, and `path_params`. If
    auth is enabled, the `username` attribute can be used to get the logged in user. In some environments,
    the dict-like attributes (e.g. `requests.headers`, `requests.query_params`) of this class are automatically
    converted to dictionaries, so we recommend converting them to dictionaries before accessing
    attributes for consistent behavior in different environments.
    Example:
        import gradio as gr
        def echo(text, request: gr.Request):
            if request:
                print("Request headers dictionary:", dict(request.headers))
                print("Query parameters:", dict(request.query_params))
                print("IP address:", request.client.host)
                print("Gradio session hash:", request.session_hash)
            return text
        io = gr.Interface(echo, "textbox", "textbox").launch()
    Demos: request_ip_headers
    """

    def __init__(
        self,
        request: fastapi.Request | None = None,
        username: str | None = None,
        session_hash: str | None = None,
        **kwargs,
    ):
        """
        Can be instantiated with either a fastapi.Request or by manually passing in
        attributes (needed for queueing).
        Parameters:
            request: A fastapi.Request
            username: The username of the logged in user (if auth is enabled)
            session_hash: The session hash of the current session. It is unique for each page load.
        """

        self.request = request
        self.username = username
        self.session_hash: str | None = session_hash
        self.kwargs: dict[str, Any] = kwargs

    def dict_to_obj(self, d):
        if isinstance(d, dict):
            return json.loads(json.dumps(d), object_hook=Obj)
        else:
            return d

    def __getattr__(self, name: str):
        if self.request:
            return self.dict_to_obj(getattr(self.request, name))
        else:
            try:
                obj = self.kwargs[name]
            except KeyError as ke:
                raise AttributeError(
                    f"'Request' object has no attribute '{name}'"
                ) from ke
            return self.dict_to_obj(obj)

    def __getstate__(self) -> dict[str, Any]:
        self.kwargs.update(
            {
                "headers": dict(getattr(self, "headers", {})),
                "query_params": dict(getattr(self, "query_params", {})),
                "cookies": dict(getattr(self, "cookies", {})),
                "path_params": dict(getattr(self, "path_params", {})),
                "client": {
                    "host": getattr(self, "client", {}) and self.client.host,
                    "port": getattr(self, "client", {}) and self.client.port,
                },
                "url": getattr(self, "url", ""),
            }
        )
        if request_state := hasattr(self, "state"):
            try:
                pickle.dumps(request_state)
                self.kwargs["request_state"] = request_state
            except pickle.PicklingError:
                pass
        self.request = None
        return self.__dict__

    def __setstate__(self, state: dict[str, Any]):
        if request_state := state.pop("request_state", None):
            self.state = request_state
        self.__dict__ = state


@document()
class Header(str):
    """A string that represents a header value in an incoming HTTP request to the Gradio app.

    When you type a function argument of type `Header`, Gradio will automatically extract that header from the request and pass it to the function.
    Note that it's common for header values to use hyphens, e.g. `x-forwarded-host`, and these will automatically be converted to underscores.
    So make sure you use underscores in your function arguments.

    Example:
        import gradio as gr

        def make_api_request_on_behalf_of_user(prompt: str, x_api_token: gr.Header):
            return "Hello from the API" if not x_api_token else "Hello from the API with token!"

        demo = gr.Interface(
            make_api_request_on_behalf_of_user,
            [
                gr.Textbox(label="Prompt"),
            ],
            gr.Textbox(label="Response"),
        )

        demo.launch(mcp_server=True)
    """

    pass


class FnIndexInferError(Exception):
    pass


def get_fn(blocks: Blocks, api_name: str | None, body: PredictBody) -> BlockFunction:
    if body.session_hash:
        session_state = blocks.state_holder[body.session_hash]
        fns = session_state.blocks_config.fns
    else:
        fns = blocks.fns

    if body.fn_index is None:
        if api_name is not None:
            for fn in fns.values():
                if fn.api_name == api_name:
                    return fn
        raise FnIndexInferError(
            f"Could not infer function index for API name: {api_name}"
        )
    else:
        return fns[body.fn_index]


def compile_gr_request(
    body: PredictBodyInternal,
    fn: BlockFunction,
    username: Optional[str],
    request: Optional[fastapi.Request],
):
    # If this fn_index cancels jobs, then the only input we need is the
    # current session hash
    if fn.cancels:
        body.data = [body.session_hash]
    if body.request:
        if body.batched:
            gr_request = [Request(username=username, request=request)]
        else:
            gr_request = Request(
                username=username, request=body.request, session_hash=body.session_hash
            )
    else:
        if request is None:
            raise ValueError("request must be provided if body.request is None")
        gr_request = Request(
            username=username, request=request, session_hash=body.session_hash
        )

    return gr_request


def restore_session_state(app: App, body: PredictBodyInternal):
    event_id = body.event_id
    session_hash = getattr(body, "session_hash", None)
    if session_hash is not None:
        session_state = app.state_holder[session_hash]
        # The should_reset set keeps track of the fn_indices
        # that have been cancelled. When a job is cancelled,
        # the /reset route will mark the jobs as having been reset.
        # That way if the cancel job finishes BEFORE the job being cancelled
        # the job being cancelled will not overwrite the state of the iterator.
        if event_id is None:
            iterator = None
        elif event_id in app.iterators_to_reset:
            iterator = None
            app.iterators_to_reset.remove(event_id)
        else:
            iterator = app.iterators.get(event_id)
    else:
        session_state = SessionState(app.get_blocks())
        iterator = None

    return session_state, iterator


def prepare_event_data(
    blocks_config: BlocksConfig,
    body: PredictBodyInternal,
) -> EventData:
    from gradio.helpers import EventData

    target = body.trigger_id
    event_data = EventData(
        blocks_config.blocks.get(target) if target else None,
        body.event_data,
    )
    return event_data


async def call_process_api(
    app: App,
    body: PredictBodyInternal,
    gr_request: Union[Request, list[Request]],
    fn: BlockFunction,
    root_path: str,
):
    session_state, iterator = restore_session_state(app=app, body=body)

    event_data = prepare_event_data(session_state.blocks_config, body)
    event_id = body.event_id

    session_hash = getattr(body, "session_hash", None)
    inputs = body.data

    batch_in_single_out = not body.batched and fn.batch
    if batch_in_single_out:
        inputs = [inputs]

    try:
        with utils.MatplotlibBackendMananger():
            output = await app.get_blocks().process_api(
                block_fn=fn,
                inputs=inputs,
                request=gr_request,
                state=session_state,
                iterator=iterator,
                session_hash=session_hash,
                event_id=event_id,
                event_data=event_data,
                in_event_listener=True,
                simple_format=body.simple_format,
                root_path=root_path,
            )
        iterator = output.pop("iterator", None)
        if event_id is not None:
            app.iterators[event_id] = iterator  # type: ignore
        if isinstance(output, Error):
            raise output
    except BaseException:
        iterator = app.iterators.get(event_id) if event_id is not None else None
        if iterator is not None:  # close off any streams that are still open
            run_id = id(iterator)
            pending_streams: dict[int, MediaStream] = (
                app.get_blocks().pending_streams[session_hash].get(run_id, {})
            )
            for stream in pending_streams.values():
                stream.end_stream()
        raise

    if batch_in_single_out:
        output["data"] = output["data"][0]
    return output


def get_first_header_value(request: fastapi.Request, header_name: str):
    header_value = request.headers.get(header_name)
    if header_value:
        return header_value.split(",")[0].strip()
    return None


def get_request_origin(request: fastapi.Request, route_path: str) -> httpx.URL:
    """
    Examines the request headers to determine the origin of the request.
    If the request includes the x-forwarded-host header, it is used directly to determine the origin.
    Otherwise, the request url is used and the route path is stripped off.

    The returned URL is a httpx.URL object without a trailing slash, e.g. "https://example.com"
    """
    x_forwarded_host = get_first_header_value(request, "x-forwarded-host")
    root_url = f"http://{x_forwarded_host}" if x_forwarded_host else str(request.url)
    root_url = httpx.URL(root_url)
    root_url = root_url.copy_with(query=None)
    root_url = str(root_url).rstrip("/")
    if get_first_header_value(request, "x-forwarded-proto") == "https":
        root_url = root_url.replace("http://", "https://")

    route_path = route_path.rstrip("/")
    if len(route_path) > 0 and not x_forwarded_host:
        root_url = root_url[: -len(route_path)]
    root_url = root_url.rstrip("/")
    root_url = httpx.URL(root_url)
    return root_url


def get_api_call_path(request: fastapi.Request) -> str:
    """
    Extracts the API call path from the request URL.

    If the URL (without query parameters) ends with "{API_PREFIX}/queue/join", that exact path is returned.
    Otherwise, if the URL contains "{API_PREFIX}/call", the substring starting from "{API_PREFIX}/call" is returned.
    This allows for dynamic API calls to methods other than "predict".

    Raises:
        ValueError: If the request URL does not match any recognized API call pattern.
    """
    queue_api_url = f"{API_PREFIX}/queue/join"
    generic_api_url = f"{API_PREFIX}/call"
    request_path = request.url.path.rstrip("/")

    if request_path.endswith(queue_api_url):
        return queue_api_url

    start_index = request_path.rfind(generic_api_url)
    if start_index >= 0:
        return request_path[start_index : len(request_path)]

    raise ValueError(
        f"Request url '{str(request.url)}' has an unknown api call pattern."
    )


def get_root_url(
    request: fastapi.Request, route_path: str, root_path: str | None
) -> str:
    """
    Gets the root url of the Gradio app (i.e. the public url of the app) without a trailing slash.

    This is how the root_url is resolved:
    1. If a user provides a `root_path` manually that is a full URL, it is returned directly.
    2. If the request has an x-forwarded-host header (e.g. because it is behind a proxy), the root url is
    constructed from the x-forwarded-host header. In this case, `route_path` is not used to construct the root url.
    3. Otherwise, the root url is constructed from the request url. The query parameters and `route_path` are stripped off.
    And if a relative `root_path` is provided, and it is not already the subpath of the URL, it is appended to the root url.

    In cases (2) and (3), We also check to see if the x-forwarded-proto header is present, and if so, convert the root url to https.
    And if there are multiple hosts in the x-forwarded-host or multiple protocols in the x-forwarded-proto, the first one is used.
    """

    if root_path and client_utils.is_http_url_like(root_path):
        return root_path.rstrip("/")

    root_url = get_request_origin(request, route_path)

    if root_path and root_url.path != root_path:
        root_url = root_url.copy_with(path=root_path)

    return str(root_url).rstrip("/")


def _user_safe_decode(src: bytes, codec: str) -> str:
    try:
        return src.decode(codec)
    except (UnicodeDecodeError, LookupError):
        return src.decode("latin-1")


class GradioUploadFile(UploadFile):
    """UploadFile with a sha attribute."""

    def __init__(
        self,
        file: BinaryIO,
        *,
        size: int | None = None,
        filename: str | None = None,
        headers: Headers | None = None,
    ) -> None:
        super().__init__(file, size=size, filename=filename, headers=headers)
        self.sha = hashlib.sha256()
        self.sha.update(processing_utils.hash_seed)


@python_dataclass(frozen=True)
class FileUploadProgressUnit:
    filename: str
    chunk_size: int


@python_dataclass
class FileUploadProgressTracker:
    deque: deque[FileUploadProgressUnit]
    is_done: bool


class FileUploadProgressNotTrackedError(Exception):
    pass


class FileUploadProgressNotQueuedError(Exception):
    pass


class FileUploadProgress:
    def __init__(self) -> None:
        self._statuses: dict[str, FileUploadProgressTracker] = {}
        self._signals = defaultdict(asyncio.Event)

    def track(self, upload_id: str):
        if upload_id not in self._statuses:
            self._statuses[upload_id] = FileUploadProgressTracker(deque(), False)
            self._signals[upload_id].set()

    async def is_tracked(self, upload_id: str) -> bool:
        return await self._signals[upload_id].wait()

    def append(self, upload_id: str, filename: str, message_bytes: bytes):
        if upload_id not in self._statuses:
            self.track(upload_id)
        queue = self._statuses[upload_id].deque

        if len(queue) == 0:
            queue.append(FileUploadProgressUnit(filename, len(message_bytes)))
        else:
            last_unit = queue.popleft()
            if last_unit.filename != filename:
                queue.append(FileUploadProgressUnit(filename, len(message_bytes)))
            else:
                queue.append(
                    FileUploadProgressUnit(
                        filename,
                        last_unit.chunk_size + len(message_bytes),
                    )
                )

    def set_done(self, upload_id: str):
        if upload_id not in self._statuses:
            self.track(upload_id)
        self._statuses[upload_id].is_done = True

    def is_done(self, upload_id: str):
        if upload_id not in self._statuses:
            raise FileUploadProgressNotTrackedError()
        return self._statuses[upload_id].is_done

    def stop_tracking(self, upload_id: str):
        if upload_id in self._statuses:
            del self._statuses[upload_id]

    def pop(self, upload_id: str) -> FileUploadProgressUnit:
        if upload_id not in self._statuses:
            raise FileUploadProgressNotTrackedError()
        try:
            return self._statuses[upload_id].deque.pop()
        except IndexError as e:
            raise FileUploadProgressNotQueuedError() from e


class GradioMultiPartParser:
    """Vendored from starlette.MultipartParser.

    Thanks starlette!

    Made the following modifications
        - Use GradioUploadFile instead of UploadFile
        - Use NamedTemporaryFile instead of SpooledTemporaryFile
        - Compute hash of data as the request is streamed

    """

    max_header_size = 1024 * 8

    def __init__(
        self,
        headers: Headers,
        stream: AsyncGenerator[bytes, None],
        *,
        max_files: Union[int, float] = 1000,
        max_fields: Union[int, float] = 1000,
        upload_id: str | None = None,
        upload_progress: FileUploadProgress | None = None,
        max_file_size: int | float,
        max_header_size: int = max_header_size,
    ) -> None:
        self.headers = headers
        self.stream = stream
        self.max_files = max_files
        self.max_fields = max_fields
        self.items: list[tuple[str, Union[str, UploadFile]]] = []
        self.upload_id = upload_id
        self.upload_progress = upload_progress
        self._current_files = 0
        self._current_fields = 0
        self.max_file_size = max_file_size
        self.max_header_size = max_header_size
        self._current_partial_header_name: bytes = b""
        self._current_partial_header_value: bytes = b""
        self._current_header_size: int = 0
        self._current_part = MultipartPart()
        self._charset = ""
        self._file_parts_to_write: list[tuple[MultipartPart, bytes]] = []
        self._file_parts_to_finish: list[MultipartPart] = []
        self._files_to_close_on_error: list[_TemporaryFileWrapper] = []

    def on_part_begin(self) -> None:
        self._current_part = MultipartPart()
        self._current_header_size = 0

    def on_part_data(self, data: bytes, start: int, end: int) -> None:
        message_bytes = data[start:end]
        if self.upload_progress is not None:
            self.upload_progress.append(
                self.upload_id,  # type: ignore
                self._current_part.file.filename,  # type: ignore
                message_bytes,
            )
        if self._current_part.file is None:
            self._current_part.data += message_bytes
        else:
            self._file_parts_to_write.append((self._current_part, message_bytes))

    def on_part_end(self) -> None:
        if self._current_part.file is None:
            self.items.append(
                (
                    self._current_part.field_name,
                    _user_safe_decode(self._current_part.data, str(self._charset)),
                )
            )
        else:
            self._file_parts_to_finish.append(self._current_part)
            # The file can be added to the items right now even though it's not
            # finished yet, because it will be finished in the `parse()` method, before
            # self.items is used in the return value.
            self.items.append((self._current_part.field_name, self._current_part.file))

    def _check_header_size(self, additional_bytes: int):
        if self._current_header_size + additional_bytes > self.max_header_size:
            raise MultiPartException(
                f"Headers exceeded maximum allowed size of {self.max_header_size} bytes."
            )

    def on_header_field(self, data: bytes, start: int, end: int) -> None:
        additional_header_bytes = end - start
        self._check_header_size(additional_header_bytes)
        self._current_partial_header_name += data[start:end]
        self._current_header_size += additional_header_bytes

    def on_header_value(self, data: bytes, start: int, end: int) -> None:
        additional_header_bytes = end - start
        self._check_header_size(additional_header_bytes)
        self._current_partial_header_value += data[start:end]
        self._current_header_size += additional_header_bytes

    def on_header_end(self) -> None:
        field = self._current_partial_header_name.lower()
        if field == b"content-disposition":
            self._current_part.content_disposition = self._current_partial_header_value
        self._current_part.item_headers.append(
            (field, self._current_partial_header_value)
        )
        self._current_partial_header_name = b""
        self._current_partial_header_value = b""

    def on_headers_finished(self) -> None:
        _, options = parse_options_header(self._current_part.content_disposition or b"")
        try:
            self._current_part.field_name = _user_safe_decode(
                options[b"name"], str(self._charset)
            )
        except KeyError as e:
            raise MultiPartException(
                'The Content-Disposition header field "name" must be provided.'
            ) from e
        if b"filename" in options:
            self._current_files += 1
            if self._current_files > self.max_files:
                raise MultiPartException(
                    f"Too many files. Maximum number of files is {self.max_files}."
                )
            filename = _user_safe_decode(options[b"filename"], str(self._charset))
            tempfile = NamedTemporaryFile(delete=False)
            self._files_to_close_on_error.append(tempfile)
            self._current_part.file = GradioUploadFile(
                file=tempfile,  # type: ignore[arg-type]
                size=0,
                filename=filename,
                headers=Headers(raw=self._current_part.item_headers),
            )
        else:
            self._current_fields += 1
            if self._current_fields > self.max_fields:
                raise MultiPartException(
                    f"Too many fields. Maximum number of fields is {self.max_fields}."
                )
            self._current_part.file = None

    def on_end(self) -> None:
        pass

    async def parse(self) -> FormData:
        # Parse the Content-Type header to get the multipart boundary.
        _, params = parse_options_header(self.headers["Content-Type"])
        charset = params.get(b"charset", "utf-8")
        if isinstance(charset, bytes):
            charset = charset.decode("latin-1")
        self._charset = charset
        try:
            boundary = params[b"boundary"]
        except KeyError as e:
            raise MultiPartException("Missing boundary in multipart.") from e

        # Callbacks dictionary.
        callbacks = {
            "on_part_begin": self.on_part_begin,
            "on_part_data": self.on_part_data,
            "on_part_end": self.on_part_end,
            "on_header_field": self.on_header_field,
            "on_header_value": self.on_header_value,
            "on_header_end": self.on_header_end,
            "on_headers_finished": self.on_headers_finished,
            "on_end": self.on_end,
        }

        # Create the parser.
        parser = MultipartParser(boundary, callbacks)  # type: ignore
        try:
            # Feed the parser with data from the request.
            async for chunk in self.stream:
                parser.write(chunk)
                # Write file data, it needs to use await with the UploadFile methods
                # that call the corresponding file methods *in a threadpool*,
                # otherwise, if they were called directly in the callback methods above
                # (regular, non-async functions), that would block the event loop in
                # the main thread.
                for part, data in self._file_parts_to_write:
                    assert part.file  # for type checkers  # noqa: S101
                    if (part.file.size or 0) + len(data) > self.max_file_size:
                        if self.upload_progress is not None:
                            self.upload_progress.set_done(self.upload_id)  # type: ignore
                        raise MultiPartException(
                            f"File size exceeded maximum allowed size of {self.max_file_size} bytes."
                        )
                    await part.file.write(data)
                    part.file.sha.update(data)  # type: ignore
                for part in self._file_parts_to_finish:
                    assert part.file  # for type checkers  # noqa: S101
                    await part.file.seek(0)
                self._file_parts_to_write.clear()
                self._file_parts_to_finish.clear()
        except MultiPartException as exc:
            # Close all the files if there was an error.
            for file in self._files_to_close_on_error:
                file.close()
                Path(file.name).unlink()
            raise exc

        parser.finalize()
        if self.upload_progress is not None:
            self.upload_progress.set_done(self.upload_id)  # type: ignore
        return FormData(self.items)


def move_uploaded_files_to_cache(files: list[str], destinations: list[str]) -> None:
    for file, dest in zip(files, destinations, strict=False):
        shutil.move(file, dest)


def update_root_in_config(config: BlocksConfigDict, root: str) -> BlocksConfigDict:
    """
    Updates the root "key" in the config dictionary to the new root url. If the
    root url has changed, all of the urls in the config that correspond to component
    file urls are updated to use the new root url.
    """
    previous_root = config.get("root")
    if previous_root is None or previous_root != root:
        config["root"] = root
        config = processing_utils.add_root_url(config, root, previous_root)  # type: ignore
    return config


def update_example_values_to_use_public_url(api_info: dict[str, Any]) -> dict[str, Any]:
    """
    Updates the example values in the api_info dictionary to use a public url
    """

    def _add_root_url(file_dict: dict):
        default_value = file_dict.get("parameter_default")
        if default_value is not None and client_utils.is_file_obj_with_url(
            default_value
        ):
            if client_utils.is_http_url_like(default_value["url"]):
                return file_dict
            # If the default value's url is not already a full public url,
            # we use the example_input url. This makes it so that the example
            # value for images, audio, and video components pass SSRF checks.
            default_value["url"] = file_dict["example_input"]["url"]
        return file_dict

    return client_utils.traverse(
        api_info,
        _add_root_url,
        lambda d: isinstance(d, dict) and "parameter_default" in d,
    )


def compare_passwords_securely(input_password: str, correct_password: str) -> bool:
    return hmac.compare_digest(input_password.encode(), correct_password.encode())


def starts_with_protocol(string: str) -> bool:
    """This regex matches strings that start with a scheme (one or more characters not including colon, slash, or space)
    followed by ://, or start with just //, \\/, /\\, or \\ as they are interpreted as SMB paths on Windows.
    """
    pattern = r"^(?:[a-zA-Z][a-zA-Z0-9+\-.]*://|//|\\\\|\\/|/\\)"
    return re.match(pattern, string) is not None


def get_hostname(url: str) -> str:
    """
    Returns the hostname of a given url, or an empty string if the url cannot be parsed.
    Examples:
        get_hostname("https://www.gradio.app") -> "www.gradio.app"
        get_hostname("localhost:7860") -> "localhost"
        get_hostname("127.0.0.1") -> "127.0.0.1"
    """
    if not url:
        return ""
    if "://" not in url:
        url = "http://" + url
    try:
        return urlparse(url).hostname or ""
    except Exception:
        return ""


class CustomCORSMiddleware:
    # This is a modified version of the Starlette CORSMiddleware that restricts the allowed origins when the host is localhost.
    # Adapted from: https://github.com/encode/starlette/blob/89fae174a1ea10f59ae248fe030d9b7e83d0b8a0/starlette/middleware/cors.py

    def __init__(
        self,
        app: ASGIApp,
        strict_cors: bool = True,
    ) -> None:
        self.app = app
        self.all_methods = ("DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT")
        self.preflight_headers = {
            "Access-Control-Allow-Methods": ", ".join(self.all_methods),
            "Access-Control-Max-Age": str(600),
            "Access-Control-Allow-Credentials": "true",
        }
        self.simple_headers = {"Access-Control-Allow-Credentials": "true"}
        # Any of these hosts suggests that the Gradio app is running locally.
        self.localhost_aliases = ["localhost", "127.0.0.1", "0.0.0.0"]
        if not strict_cors or os.getenv("GRADIO_LOCAL_DEV_MODE") is not None:  # type: ignore
            # Note: "null" is a special case that happens if a Gradio app is running
            # as an embedded web component in a local static webpage. However, it can
            # also be used maliciously for CSRF attacks, so it is not allowed by default.
            self.localhost_aliases.append("null")

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        headers = Headers(scope=scope)
        origin = headers.get("origin")
        if origin is None:
            await self.app(scope, receive, send)
            return
        if scope["method"] == "OPTIONS" and "access-control-request-method" in headers:
            response = self.preflight_response(request_headers=headers)
            await response(scope, receive, send)
            return
        await self.simple_response(scope, receive, send, request_headers=headers)

    def preflight_response(self, request_headers: Headers) -> Response:
        headers = dict(self.preflight_headers)
        origin = request_headers["Origin"]
        if self.is_valid_origin(request_headers):
            headers["Access-Control-Allow-Origin"] = origin
        requested_headers = request_headers.get("access-control-request-headers")
        if requested_headers is not None:
            headers["Access-Control-Allow-Headers"] = requested_headers
        return PlainTextResponse("OK", status_code=200, headers=headers)

    async def simple_response(
        self, scope: Scope, receive: Receive, send: Send, request_headers: Headers
    ) -> None:
        send = functools.partial(self._send, send=send, request_headers=request_headers)
        await self.app(scope, receive, send)

    async def _send(
        self, message: Message, send: Send, request_headers: Headers
    ) -> None:
        if message["type"] != "http.response.start":
            await send(message)
            return
        message.setdefault("headers", [])
        headers = MutableHeaders(scope=message)
        headers.update(self.simple_headers)
        origin = request_headers["Origin"]
        if self.is_valid_origin(request_headers):
            self.allow_explicit_origin(headers, origin)
        await send(message)

    def is_valid_origin(self, request_headers: Headers) -> bool:
        origin = request_headers["Origin"]
        host = request_headers["Host"]
        host_name = get_hostname(host)
        origin_name = get_hostname(origin)

        return (
            host_name not in self.localhost_aliases
            or origin_name in self.localhost_aliases
        )

    @staticmethod
    def allow_explicit_origin(headers: MutableHeaders, origin: str) -> None:
        headers["Access-Control-Allow-Origin"] = origin
        headers.add_vary_header("Origin")


def delete_files_created_by_app(blocks: Blocks, age: int | None) -> None:
    """Delete files that are older than age. If age is None, delete all files."""
    dont_delete = set()

    for component in blocks.blocks.values():
        dont_delete.update(getattr(component, "keep_in_cache", set()))
    for temp_set in blocks.temp_file_sets:
        # We use a copy of the set to avoid modifying the set while iterating over it
        # otherwise we would get an exception: Set changed size during iteration
        to_remove = set()
        for file in temp_set:
            if file in dont_delete:
                continue
            try:
                file_path = Path(file)
                modified_time = datetime.fromtimestamp(file_path.lstat().st_ctime)
                if age is None or (datetime.now() - modified_time).seconds > age:
                    os.remove(file)
                    to_remove.add(file)
            except FileNotFoundError:
                continue
        temp_set -= to_remove


async def delete_files_on_schedule(app: App, frequency: int, age: int) -> None:
    """Startup task to delete files created by the app based on time since last modification."""
    while True:
        await asyncio.sleep(frequency)
        await anyio.to_thread.run_sync(
            delete_files_created_by_app, app.get_blocks(), age
        )


@asynccontextmanager
async def _lifespan_handler(
    app: App, frequency: int = 1, age: int = 1
) -> AsyncGenerator:
    """A context manager that triggers the startup and shutdown events of the app."""
    asyncio.create_task(delete_files_on_schedule(app, frequency, age))
    yield
    delete_files_created_by_app(app.get_blocks(), age=None)


async def _delete_state(app: App):
    """Delete all expired state every second."""
    while True:
        app.state_holder.delete_all_expired_state()
        await asyncio.sleep(1)


@asynccontextmanager
async def _delete_state_handler(app: App):
    """When the server launches, regularly delete expired state."""
    asyncio.create_task(_delete_state(app))
    yield


def create_lifespan_handler(
    user_lifespan: Callable[[App], AbstractAsyncContextManager] | None,
    frequency: int | None = 1,
    age: int | None = 1,
) -> Callable[[App], AbstractAsyncContextManager]:
    """Return a context manager that applies _lifespan_handler and user_lifespan if it exists."""

    @asynccontextmanager
    async def _handler(app: App):
        state = None
        async with AsyncExitStack() as stack:
            await stack.enter_async_context(_delete_state_handler(app))
            if frequency and age:
                await stack.enter_async_context(_lifespan_handler(app, frequency, age))
            if user_lifespan is not None:
                state = await stack.enter_async_context(user_lifespan(app))
            yield state

    return _handler


class MediaStream:
    def __init__(self, desired_output_format: str | None = None):
        self.segments: list[MediaStreamChunk] = []
        self.combined_file: str | None = None
        self.ended = False
        self.segment_index = 0
        self.playlist = "#EXTM3U\n#EXT-X-PLAYLIST-TYPE:EVENT\n#EXT-X-TARGETDURATION:10\n#EXT-X-VERSION:4\n#EXT-X-MEDIA-SEQUENCE:0\n"
        self.max_duration = 5
        self.desired_output_format = desired_output_format

    async def add_segment(self, data: MediaStreamChunk | None):
        if not data:
            return

        segment_id = str(uuid.uuid4())
        self.segments.append({"id": segment_id, **data})
        self.max_duration = max(self.max_duration, data["duration"]) + 1

    def end_stream(self):
        self.ended = True


def create_url_safe_hash(data: bytes, digest_size=8):
    """Create a URL-safe short hash of the data. Used to generate unique short deep links."""
    import base64

    hash_obj = hashlib.blake2b(data, digest_size=digest_size, usedforsecurity=False)
    url_safe_hash = base64.urlsafe_b64encode(hash_obj.digest()).decode().rstrip("=")

    return url_safe_hash
