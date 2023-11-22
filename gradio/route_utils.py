from __future__ import annotations

import hashlib
import json
from collections import deque
from dataclasses import dataclass as python_dataclass
from tempfile import NamedTemporaryFile, _TemporaryFileWrapper
from typing import TYPE_CHECKING, AsyncGenerator, BinaryIO, List, Optional, Tuple, Union

import fastapi
import httpx
import multipart
from gradio_client.documentation import document, set_documentation_group
from multipart.multipart import parse_options_header
from starlette.datastructures import FormData, Headers, UploadFile
from starlette.formparsers import MultiPartException, MultipartPart

from gradio import utils
from gradio.data_classes import PredictBody
from gradio.exceptions import Error
from gradio.helpers import EventData
from gradio.state_holder import SessionState

if TYPE_CHECKING:
    from gradio.blocks import Blocks
    from gradio.routes import App

set_documentation_group("routes")


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


@document()
class Request:
    """
    A Gradio request object that can be used to access the request headers, cookies,
    query parameters and other information about the request from within the prediction
    function. The class is a thin wrapper around the fastapi.Request class. Attributes
    of this class include: `headers`, `client`, `query_params`, and `path_params`. If
    auth is enabled, the `username` attribute can be used to get the logged in user.
    Example:
        import gradio as gr
        def echo(text, request: gr.Request):
            if request:
                print("Request headers dictionary:", request.headers)
                print("IP address:", request.client.host)
                print("Query parameters:", dict(request.query_params))
            return text
        io = gr.Interface(echo, "textbox", "textbox").launch()
    Demos: request_ip_headers
    """

    def __init__(
        self,
        request: fastapi.Request | None = None,
        username: str | None = None,
        **kwargs,
    ):
        """
        Can be instantiated with either a fastapi.Request or by manually passing in
        attributes (needed for queueing).
        Parameters:
            request: A fastapi.Request
        """
        self.request = request
        self.username = username
        self.kwargs: dict = kwargs

    def dict_to_obj(self, d):
        if isinstance(d, dict):
            return json.loads(json.dumps(d), object_hook=Obj)
        else:
            return d

    def __getattr__(self, name):
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


class FnIndexInferError(Exception):
    pass


def infer_fn_index(app: App, api_name: str, body: PredictBody) -> int:
    if body.fn_index is None:
        for i, fn in enumerate(app.get_blocks().dependencies):
            if fn["api_name"] == api_name:
                return i

        raise FnIndexInferError(f"Could not infer fn_index for api_name {api_name}.")
    else:
        return body.fn_index


def compile_gr_request(
    app: App,
    body: PredictBody,
    fn_index_inferred: int,
    username: Optional[str],
    request: Optional[fastapi.Request],
):
    # If this fn_index cancels jobs, then the only input we need is the
    # current session hash
    if app.get_blocks().dependencies[fn_index_inferred]["cancels"]:
        body.data = [body.session_hash]
    if body.request:
        if body.batched:
            gr_request = [Request(username=username, request=request)]
        else:
            gr_request = Request(username=username, request=body.request)
    else:
        if request is None:
            raise ValueError("request must be provided if body.request is None")
        gr_request = Request(username=username, request=request)

    return gr_request


def restore_session_state(app: App, body: PredictBody):
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
    blocks: Blocks,
    body: PredictBody,
) -> EventData:
    target = body.trigger_id
    event_data = EventData(
        blocks.blocks.get(target) if target else None,
        body.event_data,
    )
    return event_data


async def call_process_api(
    app: App,
    body: PredictBody,
    gr_request: Union[Request, list[Request]],
    fn_index_inferred: int,
):
    session_state, iterator = restore_session_state(app=app, body=body)

    dependency = app.get_blocks().dependencies[fn_index_inferred]
    event_data = prepare_event_data(app.get_blocks(), body)
    event_id = body.event_id

    session_hash = getattr(body, "session_hash", None)
    inputs = body.data

    batch_in_single_out = not body.batched and dependency["batch"]
    if batch_in_single_out:
        inputs = [inputs]

    try:
        with utils.MatplotlibBackendMananger():
            output = await app.get_blocks().process_api(
                fn_index=fn_index_inferred,
                inputs=inputs,
                request=gr_request,
                state=session_state,
                iterator=iterator,
                session_hash=session_hash,
                event_id=event_id,
                event_data=event_data,
                in_event_listener=True,
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
            pending_streams: dict[int, list] = (
                app.get_blocks().pending_streams[session_hash].get(run_id, {})
            )
            for stream in pending_streams.values():
                stream.append(None)
        raise

    if batch_in_single_out:
        output["data"] = output["data"][0]

    return output


def strip_url(orig_url: str) -> str:
    """
    Strips the query parameters and trailing slash from a URL.
    """
    parsed_url = httpx.URL(orig_url)
    stripped_url = parsed_url.copy_with(query=None)
    stripped_url = str(stripped_url)
    return stripped_url.rstrip("/")


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
        self.sha = hashlib.sha1()


@python_dataclass(frozen=True)
class FileUploadProgressUnit:
    filename: str
    chunk_size: int
    is_done: bool


class FileUploadProgress:
    def __init__(self) -> None:
        self._statuses: dict[str, deque[FileUploadProgressUnit]] = {}

    def track(self, upload_id: str):
        if upload_id not in self._statuses:
            self._statuses[upload_id] = deque()

    def update(self, upload_id: str, filename: str, message_bytes: bytes):
        if upload_id not in self._statuses:
            self._statuses[upload_id] = deque()
        self._statuses[upload_id].append(
            FileUploadProgressUnit(filename, len(message_bytes), is_done=False)
        )

    def set_done(self, upload_id: str):
        self._statuses[upload_id].append(FileUploadProgressUnit("", 0, is_done=True))

    def stop_tracking(self, upload_id: str):
        if upload_id in self._statuses:
            del self._statuses[upload_id]

    def status(self, upload_id: str) -> deque[FileUploadProgressUnit]:
        if upload_id not in self._statuses:
            return deque()
        return self._statuses[upload_id]

    def is_tracked(self, upload_id: str):
        return upload_id in self._statuses


class GradioMultiPartParser:
    """Vendored from starlette.MultipartParser.

    Thanks starlette!

    Made the following modifications
        - Use GradioUploadFile instead of UploadFile
        - Use NamedTemporaryFile instead of SpooledTemporaryFile
        - Compute hash of data as the request is streamed

    """

    max_file_size = 1024 * 1024

    def __init__(
        self,
        headers: Headers,
        stream: AsyncGenerator[bytes, None],
        *,
        max_files: Union[int, float] = 1000,
        max_fields: Union[int, float] = 1000,
        upload_id: str | None = None,
        upload_progress: FileUploadProgress | None = None,
    ) -> None:
        assert (
            multipart is not None
        ), "The `python-multipart` library must be installed to use form parsing."
        self.headers = headers
        self.stream = stream
        self.max_files = max_files
        self.max_fields = max_fields
        self.items: List[Tuple[str, Union[str, UploadFile]]] = []
        self.upload_id = upload_id
        self.upload_progress = upload_progress
        self._current_files = 0
        self._current_fields = 0
        self._current_partial_header_name: bytes = b""
        self._current_partial_header_value: bytes = b""
        self._current_part = MultipartPart()
        self._charset = ""
        self._file_parts_to_write: List[Tuple[MultipartPart, bytes]] = []
        self._file_parts_to_finish: List[MultipartPart] = []
        self._files_to_close_on_error: List[_TemporaryFileWrapper] = []

    def on_part_begin(self) -> None:
        self._current_part = MultipartPart()

    def on_part_data(self, data: bytes, start: int, end: int) -> None:
        message_bytes = data[start:end]
        if self.upload_progress is not None:
            self.upload_progress.update(
                self.upload_id, self._current_part.file.filename, message_bytes  # type: ignore
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
                    _user_safe_decode(self._current_part.data, self._charset),
                )
            )
        else:
            self._file_parts_to_finish.append(self._current_part)
            # The file can be added to the items right now even though it's not
            # finished yet, because it will be finished in the `parse()` method, before
            # self.items is used in the return value.
            self.items.append((self._current_part.field_name, self._current_part.file))

    def on_header_field(self, data: bytes, start: int, end: int) -> None:
        self._current_partial_header_name += data[start:end]

    def on_header_value(self, data: bytes, start: int, end: int) -> None:
        self._current_partial_header_value += data[start:end]

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
        disposition, options = parse_options_header(
            self._current_part.content_disposition
        )
        try:
            self._current_part.field_name = _user_safe_decode(
                options[b"name"], self._charset
            )
        except KeyError as e:
            raise MultiPartException(
                'The Content-Disposition header field "name" must be ' "provided."
            ) from e
        if b"filename" in options:
            self._current_files += 1
            if self._current_files > self.max_files:
                raise MultiPartException(
                    f"Too many files. Maximum number of files is {self.max_files}."
                )
            filename = _user_safe_decode(options[b"filename"], self._charset)
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
        if type(charset) == bytes:
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
        parser = multipart.MultipartParser(boundary, callbacks)
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
                    assert part.file  # for type checkers
                    await part.file.write(data)
                    part.file.sha.update(data)  # type: ignore
                for part in self._file_parts_to_finish:
                    assert part.file  # for type checkers
                    await part.file.seek(0)
                self._file_parts_to_write.clear()
                self._file_parts_to_finish.clear()
        except MultiPartException as exc:
            # Close all the files if there was an error.
            for file in self._files_to_close_on_error:
                file.close()
            raise exc

        parser.finalize()
        if self.upload_progress is not None:
            self.upload_progress.set_done(self.upload_id)  # type: ignore
        return FormData(self.items)
