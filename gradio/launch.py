"""Experimental launch integration for explicitly activated CLI extensions.

Capture runs application initialization, but defers calls to launch(). The caller
can inspect the requests and later launch them with an endpoint wrapper. Nothing
is discovered or activated automatically when an extension is installed.
"""

from __future__ import annotations

import functools
import inspect
from collections.abc import Callable, Generator, Mapping
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from gradio.server import Server


@dataclass(frozen=True)
class APIEndpoint:
    """A Server endpoint's registration index, original callback and options."""

    index: int
    fn: Callable
    options: Mapping[str, Any]


@dataclass
class LaunchRequest:
    """An app and its launch arguments, captured before starting any server."""

    app: Any
    kwargs: dict[str, Any]

    def launch(self):
        return self.app.launch(**self.kwargs)


@dataclass
class LaunchContext:
    capture: bool = False
    wrap_api: Callable[[Server, APIEndpoint], Callable] | None = None
    requests: list[LaunchRequest] = field(default_factory=list)


_context: ContextVar[LaunchContext | None] = ContextVar("gradio_launch", default=None)


@contextmanager
def launch_context(
    *,
    capture: bool = False,
    wrap_api: Callable[[Server, APIEndpoint], Callable] | None = None,
) -> Generator[LaunchContext, None, None]:
    """Scope launch capture or Server callback wrapping to this execution context.

    During capture, launch() returns (app, "", "") without binding a port. Each
    call is recorded in requests with its arguments. Captured requests may be
    launched after leaving capture. wrap_api receives the original endpoint and
    must return a callback with compatible signature and streaming behavior.
    """
    context = LaunchContext(capture=capture, wrap_api=wrap_api)
    token = _context.set(context)
    try:
        yield context
    finally:
        _context.reset(token)


def _capture_launch(fn):
    @functools.wraps(fn)
    def wrapped(self, *args, **kwargs):
        context = _context.get()
        if context is not None and context.capture:
            bound = inspect.signature(fn).bind(self, *args, **kwargs)
            bound.apply_defaults()
            options = dict(bound.arguments)
            options.pop("self")
            context.requests.append(LaunchRequest(self, options))
            return self, "", ""
        return fn(self, *args, **kwargs)

    return wrapped


def _wrap_api(app: Server, endpoint: APIEndpoint) -> Callable:
    context = _context.get()
    if context is None or context.wrap_api is None:
        return endpoint.fn
    fn = context.wrap_api(app, endpoint)
    if not callable(fn):
        raise TypeError("The launch extension's wrap_api must return a callable.")
    return fn
