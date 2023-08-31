from __future__ import annotations

import json
from copy import deepcopy
from typing import TYPE_CHECKING, Optional, Union

import fastapi
from gradio_client.documentation import document, set_documentation_group

from gradio import utils
from gradio.data_classes import PredictBody
from gradio.exceptions import Error
from gradio.helpers import EventData

if TYPE_CHECKING:
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
        def echo(name, request: gr.Request):
            print("Request headers dictionary:", request.headers)
            print("IP address:", request.client.host)
            return name
        io = gr.Interface(echo, "textbox", "textbox").launch()
    """

    def __init__(
        self,
        request: fastapi.Request | None = None,
        username: str | None = None,
        **kwargs,
    ):
        """
        Can be instantiated with either a fastapi.Request or by manually passing in
        attributes (needed for websocket-based queueing).
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
            gr_request = [Request(username=username, **req) for req in body.request]
        else:
            assert isinstance(body.request, dict)
            gr_request = Request(username=username, **body.request)
    else:
        if request is None:
            raise ValueError("request must be provided if body.request is None")
        gr_request = Request(username=username, request=request)

    return gr_request


def restore_session_state(app: App, body: PredictBody):
    fn_index = body.fn_index
    session_hash = getattr(body, "session_hash", None)
    if session_hash is not None:
        if session_hash not in app.state_holder:
            app.state_holder[session_hash] = {
                _id: deepcopy(getattr(block, "value", None))
                for _id, block in app.get_blocks().blocks.items()
                if getattr(block, "stateful", False)
            }
        session_state = app.state_holder[session_hash]
        # The should_reset set keeps track of the fn_indices
        # that have been cancelled. When a job is cancelled,
        # the /reset route will mark the jobs as having been reset.
        # That way if the cancel job finishes BEFORE the job being cancelled
        # the job being cancelled will not overwrite the state of the iterator.
        if fn_index in app.iterators_to_reset[session_hash]:
            iterators = {}
            app.iterators_to_reset[session_hash].remove(fn_index)
        else:
            iterators = app.iterators[session_hash]
    else:
        session_state = {}
        iterators = {}

    return session_state, iterators


async def call_process_api(
    app: App,
    body: PredictBody,
    gr_request: Union[Request, list[Request]],
    fn_index_inferred,
):
    session_state, iterators = restore_session_state(app=app, body=body)

    dependency = app.get_blocks().dependencies[fn_index_inferred]

    target = dependency["targets"][0] if len(dependency["targets"]) else None
    event_data = EventData(
        app.get_blocks().blocks.get(target) if target else None,
        body.event_data,
    )

    event_id = getattr(body, "event_id", None)

    fn_index = body.fn_index
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
                iterators=iterators,
                session_hash=session_hash,
                event_id=event_id,
                event_data=event_data,
            )
        iterator = output.pop("iterator", None)
        if hasattr(body, "session_hash"):
            app.iterators[body.session_hash][fn_index] = iterator
        if isinstance(output, Error):
            raise output
    except BaseException:
        iterator = iterators.get(fn_index, None)
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
