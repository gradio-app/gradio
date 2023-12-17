from __future__ import annotations

import asyncio
import base64
import hashlib
import json
import mimetypes
import os
import pkgutil
import secrets
import shutil
import tempfile
import warnings
from concurrent.futures import CancelledError
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from threading import Lock
from typing import Any, Callable, Optional, TypedDict

import fsspec.asyn
import httpx
import huggingface_hub
from huggingface_hub import SpaceStage
from websockets.legacy.protocol import WebSocketCommonProtocol

API_URL = "api/predict/"
SSE_URL_V0 = "queue/join"
SSE_DATA_URL_V0 = "queue/data"
SSE_URL = "queue/data"
SSE_DATA_URL = "queue/join"
WS_URL = "queue/join"
UPLOAD_URL = "upload"
LOGIN_URL = "login"
CONFIG_URL = "config"
API_INFO_URL = "info"
RAW_API_INFO_URL = "info?serialize=False"
SPACE_FETCHER_URL = "https://gradio-space-api-fetcher-v2.hf.space/api"
RESET_URL = "reset"
SPACE_URL = "https://hf.space/{}"

STATE_COMPONENT = "state"
INVALID_RUNTIME = [
    SpaceStage.NO_APP_FILE,
    SpaceStage.CONFIG_ERROR,
    SpaceStage.BUILD_ERROR,
    SpaceStage.RUNTIME_ERROR,
    SpaceStage.PAUSED,
]


class Message(TypedDict, total=False):
    msg: str
    output: dict[str, Any]
    event_id: str
    rank: int
    rank_eta: float
    queue_size: int
    success: bool
    progress_data: list[dict]
    log: str
    level: str


def get_package_version() -> str:
    try:
        package_json_data = (
            pkgutil.get_data(__name__, "package.json").decode("utf-8").strip()  # type: ignore
        )
        package_data = json.loads(package_json_data)
        version = package_data.get("version", "")
        return version
    except Exception:
        return ""


__version__ = get_package_version()


class TooManyRequestsError(Exception):
    """Raised when the API returns a 429 status code."""

    pass


class QueueError(Exception):
    """Raised when the queue is full or there is an issue adding a job to the queue."""

    pass


class InvalidAPIEndpointError(Exception):
    """Raised when the API endpoint is invalid."""

    pass


class SpaceDuplicationError(Exception):
    """Raised when something goes wrong with a Space Duplication."""

    pass


class ServerMessage(str, Enum):
    send_hash = "send_hash"
    queue_full = "queue_full"
    estimation = "estimation"
    send_data = "send_data"
    process_starts = "process_starts"
    process_generating = "process_generating"
    process_completed = "process_completed"
    log = "log"
    progress = "progress"
    heartbeat = "heartbeat"
    server_stopped = "server_stopped"


class Status(Enum):
    """Status codes presented to client users."""

    STARTING = "STARTING"
    JOINING_QUEUE = "JOINING_QUEUE"
    QUEUE_FULL = "QUEUE_FULL"
    IN_QUEUE = "IN_QUEUE"
    SENDING_DATA = "SENDING_DATA"
    PROCESSING = "PROCESSING"
    ITERATING = "ITERATING"
    PROGRESS = "PROGRESS"
    FINISHED = "FINISHED"
    CANCELLED = "CANCELLED"
    LOG = "LOG"

    @staticmethod
    def ordering(status: Status) -> int:
        """Order of messages. Helpful for testing."""
        order = [
            Status.STARTING,
            Status.JOINING_QUEUE,
            Status.QUEUE_FULL,
            Status.IN_QUEUE,
            Status.SENDING_DATA,
            Status.PROCESSING,
            Status.PROGRESS,
            Status.ITERATING,
            Status.FINISHED,
            Status.CANCELLED,
        ]
        return order.index(status)

    def __lt__(self, other: Status):
        return self.ordering(self) < self.ordering(other)

    @staticmethod
    def msg_to_status(msg: str) -> Status:
        """Map the raw message from the backend to the status code presented to users."""
        return {
            ServerMessage.send_hash: Status.JOINING_QUEUE,
            ServerMessage.queue_full: Status.QUEUE_FULL,
            ServerMessage.estimation: Status.IN_QUEUE,
            ServerMessage.send_data: Status.SENDING_DATA,
            ServerMessage.process_starts: Status.PROCESSING,
            ServerMessage.process_generating: Status.ITERATING,
            ServerMessage.process_completed: Status.FINISHED,
            ServerMessage.progress: Status.PROGRESS,
            ServerMessage.log: Status.LOG,
            ServerMessage.server_stopped: Status.FINISHED,
        }[msg]  # type: ignore


@dataclass
class ProgressUnit:
    index: Optional[int]
    length: Optional[int]
    unit: Optional[str]
    progress: Optional[float]
    desc: Optional[str]

    @classmethod
    def from_msg(cls, data: list[dict]) -> list[ProgressUnit]:
        return [
            cls(
                index=d.get("index"),
                length=d.get("length"),
                unit=d.get("unit"),
                progress=d.get("progress"),
                desc=d.get("desc"),
            )
            for d in data
        ]


@dataclass
class StatusUpdate:
    """Update message sent from the worker thread to the Job on the main thread."""

    code: Status
    rank: int | None
    queue_size: int | None
    eta: float | None
    success: bool | None
    time: datetime | None
    progress_data: list[ProgressUnit] | None
    log: tuple[str, str] | None = None


def create_initial_status_update():
    return StatusUpdate(
        code=Status.STARTING,
        rank=None,
        queue_size=None,
        eta=None,
        success=None,
        time=datetime.now(),
        progress_data=None,
    )


@dataclass
class JobStatus:
    """The job status.

    Keeps track of the latest status update and intermediate outputs (not yet implements).
    """

    latest_status: StatusUpdate = field(default_factory=create_initial_status_update)
    outputs: list[Any] = field(default_factory=list)


@dataclass
class Communicator:
    """Helper class to help communicate between the worker thread and main thread."""

    lock: Lock
    job: JobStatus
    prediction_processor: Callable[..., tuple]
    reset_url: str
    should_cancel: bool = False
    event_id: str | None = None


########################
# Network utils
########################


def is_http_url_like(possible_url: str) -> bool:
    """
    Check if the given string looks like an HTTP(S) URL.
    """
    return possible_url.startswith(("http://", "https://"))


def probe_url(possible_url: str) -> bool:
    """
    Probe the given URL to see if it responds with a 200 status code (to HEAD, then to GET).
    """
    headers = {"User-Agent": "gradio (https://gradio.app/; team@gradio.app)"}
    try:
        with httpx.Client() as client:
            head_request = client.head(possible_url, headers=headers)
            if head_request.status_code == 405:
                return client.get(possible_url, headers=headers).is_success
            return head_request.is_success
    except Exception:
        return False


def is_valid_url(possible_url: str) -> bool:
    """
    Check if the given string is a valid URL.
    """
    warnings.warn(
        "is_valid_url should not be used. "
        "Use is_http_url_like() and probe_url(), as suitable, instead.",
    )
    return is_http_url_like(possible_url) and probe_url(possible_url)


async def get_pred_from_ws(
    websocket: WebSocketCommonProtocol,
    data: str,
    hash_data: str,
    helper: Communicator | None = None,
) -> dict[str, Any]:
    completed = False
    resp = {}
    while not completed:
        # Receive message in the background so that we can
        # cancel even while running a long pred
        task = asyncio.create_task(websocket.recv())
        while not task.done():
            if helper:
                with helper.lock:
                    if helper.should_cancel:
                        # Need to reset the iterator state since the client
                        # will not reset the session
                        async with httpx.AsyncClient() as http:
                            reset = http.post(
                                helper.reset_url, json=json.loads(hash_data)
                            )
                            # Retrieve cancel exception from task
                            # otherwise will get nasty warning in console
                            task.cancel()
                            await asyncio.gather(task, reset, return_exceptions=True)
                        raise CancelledError()
            # Need to suspend this coroutine so that task actually runs
            await asyncio.sleep(0.01)
        msg = task.result()
        resp = json.loads(msg)
        if helper:
            with helper.lock:
                has_progress = "progress_data" in resp
                status_update = StatusUpdate(
                    code=Status.msg_to_status(resp["msg"]),
                    queue_size=resp.get("queue_size"),
                    rank=resp.get("rank", None),
                    success=resp.get("success"),
                    time=datetime.now(),
                    eta=resp.get("rank_eta"),
                    progress_data=ProgressUnit.from_msg(resp["progress_data"])
                    if has_progress
                    else None,
                )
                output = resp.get("output", {}).get("data", [])
                if output and status_update.code != Status.FINISHED:
                    try:
                        result = helper.prediction_processor(*output)
                    except Exception as e:
                        result = [e]
                    helper.job.outputs.append(result)
                helper.job.latest_status = status_update
        if resp["msg"] == "queue_full":
            raise QueueError("Queue is full! Please try again.")
        if resp["msg"] == "send_hash":
            await websocket.send(hash_data)
        elif resp["msg"] == "send_data":
            await websocket.send(data)
        completed = resp["msg"] == "process_completed"
    return resp["output"]


async def get_pred_from_sse_v0(
    client: httpx.AsyncClient,
    data: dict,
    hash_data: dict,
    helper: Communicator,
    sse_url: str,
    sse_data_url: str,
    headers: dict[str, str],
    cookies: dict[str, str] | None,
) -> dict[str, Any] | None:
    done, pending = await asyncio.wait(
        [
            asyncio.create_task(check_for_cancel(helper, headers, cookies)),
            asyncio.create_task(
                stream_sse_v0(
                    client,
                    data,
                    hash_data,
                    helper,
                    sse_url,
                    sse_data_url,
                    headers,
                    cookies,
                )
            ),
        ],
        return_when=asyncio.FIRST_COMPLETED,
    )

    for task in pending:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    assert len(done) == 1
    for task in done:
        return task.result()


async def get_pred_from_sse_v1(
    helper: Communicator,
    headers: dict[str, str],
    cookies: dict[str, str] | None,
    pending_messages_per_event: dict[str, list[Message | None]],
    event_id: str,
) -> dict[str, Any] | None:
    done, pending = await asyncio.wait(
        [
            asyncio.create_task(check_for_cancel(helper, headers, cookies)),
            asyncio.create_task(
                stream_sse_v1(
                    helper,
                    pending_messages_per_event,
                    event_id,
                )
            ),
        ],
        return_when=asyncio.FIRST_COMPLETED,
    )

    for task in pending:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    assert len(done) == 1
    for task in done:
        return task.result()


async def check_for_cancel(
    helper: Communicator, headers: dict[str, str], cookies: dict[str, str] | None
):
    while True:
        await asyncio.sleep(0.05)
        with helper.lock:
            if helper.should_cancel:
                break
    if helper.event_id:
        async with httpx.AsyncClient() as http:
            await http.post(
                helper.reset_url,
                json={"event_id": helper.event_id},
                headers=headers,
                cookies=cookies,
            )
    raise CancelledError()


async def stream_sse_v0(
    client: httpx.AsyncClient,
    data: dict,
    hash_data: dict,
    helper: Communicator,
    sse_url: str,
    sse_data_url: str,
    headers: dict[str, str],
    cookies: dict[str, str] | None,
) -> dict[str, Any]:
    try:
        async with client.stream(
            "GET",
            sse_url,
            params=hash_data,
            headers=headers,
            cookies=cookies,
        ) as response:
            async for line in response.aiter_lines():
                line = line.rstrip("\n")
                if len(line) == 0:
                    continue
                if line.startswith("data:"):
                    resp = json.loads(line[5:])
                    if resp["msg"] in [ServerMessage.log, ServerMessage.heartbeat]:
                        continue
                    with helper.lock:
                        has_progress = "progress_data" in resp
                        status_update = StatusUpdate(
                            code=Status.msg_to_status(resp["msg"]),
                            queue_size=resp.get("queue_size"),
                            rank=resp.get("rank", None),
                            success=resp.get("success"),
                            time=datetime.now(),
                            eta=resp.get("rank_eta"),
                            progress_data=ProgressUnit.from_msg(resp["progress_data"])
                            if has_progress
                            else None,
                        )
                        output = resp.get("output", {}).get("data", [])
                        if output and status_update.code != Status.FINISHED:
                            try:
                                result = helper.prediction_processor(*output)
                            except Exception as e:
                                result = [e]
                            helper.job.outputs.append(result)
                        helper.job.latest_status = status_update

                    if resp["msg"] == "queue_full":
                        raise QueueError("Queue is full! Please try again.")
                    elif resp["msg"] == "send_data":
                        event_id = resp["event_id"]
                        helper.event_id = event_id
                        req = await client.post(
                            sse_data_url,
                            json={"event_id": event_id, **data, **hash_data},
                            headers=headers,
                            cookies=cookies,
                        )
                        req.raise_for_status()
                    elif resp["msg"] == "process_completed":
                        return resp["output"]
                else:
                    raise ValueError(f"Unexpected message: {line}")
        raise ValueError("Did not receive process_completed message.")
    except asyncio.CancelledError:
        raise


async def stream_sse_v1(
    helper: Communicator,
    pending_messages_per_event: dict[str, list[Message | None]],
    event_id: str,
) -> dict[str, Any]:
    try:
        pending_messages = pending_messages_per_event[event_id]

        while True:
            if len(pending_messages) > 0:
                msg = pending_messages.pop(0)
            else:
                await asyncio.sleep(0.05)
                continue

            if msg is None:
                raise CancelledError()

            with helper.lock:
                log_message = None
                if msg["msg"] == ServerMessage.log:
                    log = msg.get("log")
                    level = msg.get("level")
                    if log and level:
                        log_message = (log, level)
                status_update = StatusUpdate(
                    code=Status.msg_to_status(msg["msg"]),
                    queue_size=msg.get("queue_size"),
                    rank=msg.get("rank", None),
                    success=msg.get("success"),
                    time=datetime.now(),
                    eta=msg.get("rank_eta"),
                    progress_data=ProgressUnit.from_msg(msg["progress_data"])
                    if "progress_data" in msg
                    else None,
                    log=log_message,
                )
                output = msg.get("output", {}).get("data", [])
                if output and status_update.code != Status.FINISHED:
                    try:
                        result = helper.prediction_processor(*output)
                    except Exception as e:
                        result = [e]
                    helper.job.outputs.append(result)
                helper.job.latest_status = status_update
            if msg["msg"] == ServerMessage.process_completed:
                del pending_messages_per_event[event_id]
                return msg["output"]
            elif msg["msg"] == ServerMessage.server_stopped:
                raise ValueError("Server stopped.")

    except asyncio.CancelledError:
        raise


########################
# Data processing utils
########################


def download_file(
    url_path: str,
    dir: str,
    hf_token: str | None = None,
) -> str:
    if dir is not None:
        os.makedirs(dir, exist_ok=True)
    headers = {"Authorization": "Bearer " + hf_token} if hf_token else {}

    sha1 = hashlib.sha1()
    temp_dir = Path(tempfile.gettempdir()) / secrets.token_hex(20)
    temp_dir.mkdir(exist_ok=True, parents=True)

    with httpx.stream("GET", url_path, headers=headers) as response:
        response.raise_for_status()
        with open(temp_dir / Path(url_path).name, "wb") as f:
            for chunk in response.iter_bytes(chunk_size=128 * sha1.block_size):
                sha1.update(chunk)
                f.write(chunk)

    directory = Path(dir) / sha1.hexdigest()
    directory.mkdir(exist_ok=True, parents=True)
    dest = directory / Path(url_path).name
    shutil.move(temp_dir / Path(url_path).name, dest)
    return str(dest.resolve())


def create_tmp_copy_of_file(file_path: str, dir: str | None = None) -> str:
    directory = Path(dir or tempfile.gettempdir()) / secrets.token_hex(20)
    directory.mkdir(exist_ok=True, parents=True)
    dest = directory / Path(file_path).name
    shutil.copy2(file_path, dest)
    return str(dest.resolve())


def download_tmp_copy_of_file(
    url_path: str, hf_token: str | None = None, dir: str | None = None
) -> str:
    """Kept for backwards compatibility for 3.x spaces."""
    if dir is not None:
        os.makedirs(dir, exist_ok=True)
    headers = {"Authorization": "Bearer " + hf_token} if hf_token else {}
    directory = Path(dir or tempfile.gettempdir()) / secrets.token_hex(20)
    directory.mkdir(exist_ok=True, parents=True)
    file_path = directory / Path(url_path).name

    with httpx.stream("GET", url_path, headers=headers) as response:
        response.raise_for_status()
        with open(file_path, "wb") as f:
            for chunk in response.iter_raw():
                f.write(chunk)
    return str(file_path.resolve())


def get_mimetype(filename: str) -> str | None:
    if filename.endswith(".vtt"):
        return "text/vtt"
    mimetype = mimetypes.guess_type(filename)[0]
    if mimetype is not None:
        mimetype = mimetype.replace("x-wav", "wav").replace("x-flac", "flac")
    return mimetype


def get_extension(encoding: str) -> str | None:
    encoding = encoding.replace("audio/wav", "audio/x-wav")
    type = mimetypes.guess_type(encoding)[0]
    if type == "audio/flac":  # flac is not supported by mimetypes
        return "flac"
    elif type is None:
        return None
    extension = mimetypes.guess_extension(type)
    if extension is not None and extension.startswith("."):
        extension = extension[1:]
    return extension


def encode_file_to_base64(f: str | Path):
    with open(f, "rb") as file:
        encoded_string = base64.b64encode(file.read())
        base64_str = str(encoded_string, "utf-8")
        mimetype = get_mimetype(str(f))
        return (
            "data:"
            + (mimetype if mimetype is not None else "")
            + ";base64,"
            + base64_str
        )


def encode_url_to_base64(url: str):
    resp = httpx.get(url)
    resp.raise_for_status()
    encoded_string = base64.b64encode(resp.content)
    base64_str = str(encoded_string, "utf-8")
    mimetype = get_mimetype(url)
    return (
        "data:" + (mimetype if mimetype is not None else "") + ";base64," + base64_str
    )


def encode_url_or_file_to_base64(path: str | Path):
    path = str(path)
    if is_http_url_like(path):
        return encode_url_to_base64(path)
    return encode_file_to_base64(path)


def download_byte_stream(url: str, hf_token=None):
    arr = bytearray()
    headers = {"Authorization": "Bearer " + hf_token} if hf_token else {}
    with httpx.stream("GET", url, headers=headers) as r:
        for data in r.iter_bytes():
            arr += data
            yield data
    yield arr


def decode_base64_to_binary(encoding: str) -> tuple[bytes, str | None]:
    extension = get_extension(encoding)
    data = encoding.rsplit(",", 1)[-1]
    return base64.b64decode(data), extension


def strip_invalid_filename_characters(filename: str, max_bytes: int = 200) -> str:
    """Strips invalid characters from a filename and ensures that the file_length is less than `max_bytes` bytes."""
    filename = "".join([char for char in filename if char.isalnum() or char in "._- "])
    filename_len = len(filename.encode())
    if filename_len > max_bytes:
        while filename_len > max_bytes:
            if len(filename) == 0:
                break
            filename = filename[:-1]
            filename_len = len(filename.encode())
    return filename


def sanitize_parameter_names(original_name: str) -> str:
    """Cleans up a Python parameter name to make the API info more readable."""
    return (
        "".join([char for char in original_name if char.isalnum() or char in " _"])
        .replace(" ", "_")
        .lower()
    )


def decode_base64_to_file(
    encoding: str,
    file_path: str | None = None,
    dir: str | Path | None = None,
    prefix: str | None = None,
):
    directory = Path(dir or tempfile.gettempdir()) / secrets.token_hex(20)
    directory.mkdir(exist_ok=True, parents=True)
    data, extension = decode_base64_to_binary(encoding)
    if file_path is not None and prefix is None:
        filename = Path(file_path).name
        prefix = filename
        if "." in filename:
            prefix = filename[0 : filename.index(".")]
            extension = filename[filename.index(".") + 1 :]

    if prefix is not None:
        prefix = strip_invalid_filename_characters(prefix)

    if extension is None:
        file_obj = tempfile.NamedTemporaryFile(
            delete=False, prefix=prefix, dir=directory
        )
    else:
        file_obj = tempfile.NamedTemporaryFile(
            delete=False,
            prefix=prefix,
            suffix="." + extension,
            dir=directory,
        )
    file_obj.write(data)
    file_obj.flush()
    return file_obj


def dict_or_str_to_json_file(jsn: str | dict | list, dir: str | Path | None = None):
    if dir is not None:
        os.makedirs(dir, exist_ok=True)

    file_obj = tempfile.NamedTemporaryFile(
        delete=False, suffix=".json", dir=dir, mode="w+"
    )
    if isinstance(jsn, str):
        jsn = json.loads(jsn)
    json.dump(jsn, file_obj)
    file_obj.flush()
    return file_obj


def file_to_json(file_path: str | Path) -> dict | list:
    with open(file_path) as f:
        return json.load(f)


###########################
# HuggingFace Hub API Utils
###########################
def set_space_timeout(
    space_id: str,
    hf_token: str | None = None,
    timeout_in_seconds: int = 300,
):
    headers = huggingface_hub.utils.build_hf_headers(
        token=hf_token,
        library_name="gradio_client",
        library_version=__version__,
    )
    try:
        httpx.post(
            f"https://huggingface.co/api/spaces/{space_id}/sleeptime",
            json={"seconds": timeout_in_seconds},
            headers=headers,
        )
    except httpx.HTTPStatusError as e:
        raise SpaceDuplicationError(
            f"Could not set sleep timeout on duplicated Space. Please visit {SPACE_URL.format(space_id)} "
            "to set a timeout manually to reduce billing charges."
        ) from e


########################
# Misc utils
########################


def synchronize_async(func: Callable, *args, **kwargs) -> Any:
    """
    Runs async functions in sync scopes. Can be used in any scope.

    Example:
        if inspect.iscoroutinefunction(block_fn.fn):
            predictions = utils.synchronize_async(block_fn.fn, *processed_input)

    Args:
        func:
        *args:
        **kwargs:
    """
    return fsspec.asyn.sync(fsspec.asyn.get_loop(), func, *args, **kwargs)  # type: ignore


class APIInfoParseError(ValueError):
    pass


def get_type(schema: dict):
    if "const" in schema:
        return "const"
    if "enum" in schema:
        return "enum"
    elif "type" in schema:
        return schema["type"]
    elif schema.get("$ref"):
        return "$ref"
    elif schema.get("oneOf"):
        return "oneOf"
    elif schema.get("anyOf"):
        return "anyOf"
    elif schema.get("allOf"):
        return "allOf"
    elif "type" not in schema:
        return {}
    else:
        raise APIInfoParseError(f"Cannot parse type for {schema}")


FILE_DATA = "Dict(path: str, url: str | None, size: int | None, orig_name: str | None, mime_type: str | None)"


def json_schema_to_python_type(schema: Any) -> str:
    type_ = _json_schema_to_python_type(schema, schema.get("$defs"))
    return type_.replace(FILE_DATA, "filepath")


def _json_schema_to_python_type(schema: Any, defs) -> str:
    """Convert the json schema into a python type hint"""
    if schema == {}:
        return "Any"
    type_ = get_type(schema)
    if type_ == {}:
        if "json" in schema.get("description", {}):
            return "Dict[Any, Any]"
        else:
            return "Any"
    elif type_ == "$ref":
        return _json_schema_to_python_type(defs[schema["$ref"].split("/")[-1]], defs)
    elif type_ == "null":
        return "None"
    elif type_ == "const":
        return f"Litetal[{schema['const']}]"
    elif type_ == "enum":
        return f"Literal[{', '.join([str(v) for v in schema['enum']])}]"
    elif type_ == "integer":
        return "int"
    elif type_ == "string":
        return "str"
    elif type_ == "boolean":
        return "bool"
    elif type_ == "number":
        return "float"
    elif type_ == "array":
        items = schema.get("items", [])
        if "prefixItems" in items:
            elements = ", ".join(
                [_json_schema_to_python_type(i, defs) for i in items["prefixItems"]]
            )
            return f"Tuple[{elements}]"
        elif "prefixItems" in schema:
            elements = ", ".join(
                [_json_schema_to_python_type(i, defs) for i in schema["prefixItems"]]
            )
            return f"Tuple[{elements}]"
        else:
            elements = _json_schema_to_python_type(items, defs)
            return f"List[{elements}]"
    elif type_ == "object":

        def get_desc(v):
            return f" ({v.get('description')})" if v.get("description") else ""

        props = schema.get("properties", {})

        des = [
            f"{n}: {_json_schema_to_python_type(v, defs)}{get_desc(v)}"
            for n, v in props.items()
            if n != "$defs"
        ]

        if "additionalProperties" in schema:
            des += [
                f"str, {_json_schema_to_python_type(schema['additionalProperties'], defs)}"
            ]
        des = ", ".join(des)
        return f"Dict({des})"
    elif type_ in ["oneOf", "anyOf"]:
        desc = " | ".join([_json_schema_to_python_type(i, defs) for i in schema[type_]])
        return desc
    elif type_ == "allOf":
        data = ", ".join(_json_schema_to_python_type(i, defs) for i in schema[type_])
        desc = f"All[{data}]"
        return desc
    else:
        raise APIInfoParseError(f"Cannot parse schema {schema}")


def traverse(json_obj: Any, func: Callable, is_root: Callable) -> Any:
    if is_root(json_obj):
        return func(json_obj)
    elif isinstance(json_obj, dict):
        new_obj = {}
        for key, value in json_obj.items():
            new_obj[key] = traverse(value, func, is_root)
        return new_obj
    elif isinstance(json_obj, (list, tuple)):
        new_obj = []
        for item in json_obj:
            new_obj.append(traverse(item, func, is_root))
        return new_obj
    else:
        return json_obj


def value_is_file(api_info: dict) -> bool:
    info = _json_schema_to_python_type(api_info, api_info.get("$defs"))
    return FILE_DATA in info


def is_filepath(s):
    return isinstance(s, str) and Path(s).exists()


def is_url(s):
    return isinstance(s, str) and is_http_url_like(s)


def is_file_obj(d):
    return isinstance(d, dict) and "path" in d


SKIP_COMPONENTS = {
    "state",
    "row",
    "column",
    "tabs",
    "tab",
    "tabitem",
    "box",
    "form",
    "accordion",
    "group",
    "interpretation",
    "dataset",
}
