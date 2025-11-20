from __future__ import annotations

import inspect
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Literal

from . import utils

try:
    import spaces  # type: ignore
except Exception:
    spaces = None


if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components.base import Component
    from gradio.renderable import Renderable

    from .blocks import BlockContext


class BlockFunction:
    def __init__(
        self,
        fn: Callable | None,
        inputs: Sequence[Component | BlockContext],
        outputs: Sequence[Component | BlockContext],
        preprocess: bool,
        postprocess: bool,
        inputs_as_dict: bool,
        targets: list[tuple[int | None, str]],
        _id: int,
        batch: bool = False,
        max_batch_size: int = 4,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        tracks_progress: bool = False,
        api_name: str | None = None,
        api_description: str | None | Literal[False] = None,
        js: str | Literal[True] | None = None,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        show_progress_on: Sequence[Component] | None = None,
        cancels: list[int] | None = None,
        collects_event_data: bool = False,
        trigger_after: int | None = None,
        trigger_only_on_success: bool = False,
        trigger_only_on_failure: bool = False,
        trigger_mode: Literal["always_last", "once", "multiple"] = "once",
        queue: bool = True,
        scroll_to_output: bool = False,
        api_visibility: Literal["public", "private", "undocumented"] = "public",
        renderable: Renderable | None = None,
        rendered_in: Renderable | None = None,
        render_iteration: int | None = None,
        is_cancel_function: bool = False,
        connection: Literal["stream", "sse"] = "sse",
        time_limit: float | None = None,
        stream_every: float = 0.5,
        event_specific_args: list[str] | None = None,
        component_prop_inputs: list[int] | None = None,
        page: str = "",
        js_implementation: str | None = None,
        key: str | int | tuple[int | str, ...] | None = None,
        validator: Callable | None = None,
    ):
        self.fn = fn
        self._id = _id
        self.inputs = inputs
        self.outputs = outputs
        self.preprocess = preprocess
        self.postprocess = postprocess
        self.tracks_progress = tracks_progress
        self.concurrency_limit: int | None | Literal["default"] = concurrency_limit
        self.concurrency_id = concurrency_id or str(id(fn))
        self.batch = batch
        self.max_batch_size = max_batch_size
        self.total_runtime = 0
        self.total_runs = 0
        self.inputs_as_dict = inputs_as_dict
        self.targets = targets
        self.name = getattr(fn, "__name__", "fn") if fn is not None else None
        self.api_name = api_name
        self.api_description = api_description
        self.js = js
        self.show_progress = show_progress
        self.show_progress_on = show_progress_on
        self.cancels = cancels or []
        self.collects_event_data = collects_event_data
        self.trigger_after = trigger_after
        self.trigger_only_on_success = trigger_only_on_success
        self.trigger_only_on_failure = trigger_only_on_failure
        self.trigger_mode = trigger_mode
        self.queue = False if fn is None else queue
        self.scroll_to_output = False if utils.get_space() else scroll_to_output
        self.api_visibility = api_visibility
        self.types_generator = inspect.isgeneratorfunction(
            self.fn
        ) or inspect.isasyncgenfunction(self.fn)
        self.renderable = renderable
        self.rendered_in = rendered_in
        self.render_iteration = render_iteration
        self.page = page
        self.validator = validator
        if js_implementation:
            self.fn.__js_implementation__ = js_implementation  # type: ignore

        # We need to keep track of which events are cancel events
        # so that the client can call the /cancel route directly
        self.is_cancel_function = is_cancel_function
        self.time_limit = time_limit
        self.stream_every = stream_every
        self.connection = connection
        self.event_specific_args = event_specific_args
        self.component_prop_inputs = component_prop_inputs or []
        self.key = key

        self.spaces_auto_wrap()

    def spaces_auto_wrap(self):
        if spaces is None:
            return
        if utils.get_space() is None:
            return
        self.fn = spaces.gradio_auto_wrap(self.fn)

    def __str__(self):
        return str(
            {
                "fn": self.name,
                "preprocess": self.preprocess,
                "postprocess": self.postprocess,
            }
        )

    def __repr__(self):
        return str(self)

    def get_config(self):
        return {
            "id": self._id,
            "targets": self.targets,
            "inputs": [block._id for block in self.inputs],
            "outputs": [block._id for block in self.outputs],
            "backend_fn": self.fn is not None,
            "js": self.js,
            "queue": self.queue,
            "api_name": self.api_name,
            "api_description": self.api_description,
            "scroll_to_output": self.scroll_to_output,
            "show_progress": self.show_progress,
            "show_progress_on": None
            if self.show_progress_on is None
            else [block._id for block in self.show_progress_on],
            "batch": self.batch,
            "max_batch_size": self.max_batch_size,
            "cancels": self.cancels,
            "types": {
                "generator": self.types_generator,
                "cancel": self.is_cancel_function,
            },
            "collects_event_data": self.collects_event_data,
            "trigger_after": self.trigger_after,
            "trigger_only_on_success": self.trigger_only_on_success,
            "trigger_only_on_failure": self.trigger_only_on_failure,
            "trigger_mode": self.trigger_mode,
            "api_visibility": self.api_visibility,
            "rendered_in": self.rendered_in._id if self.rendered_in else None,
            "render_id": self.renderable._id if self.renderable else None,
            "connection": self.connection,
            "time_limit": self.time_limit,
            "stream_every": self.stream_every,
            "event_specific_args": self.event_specific_args,
            "component_prop_inputs": self.component_prop_inputs,
            "js_implementation": getattr(self.fn, "__js_implementation__", None),
        }
