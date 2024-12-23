from __future__ import annotations

import logging
import sys
import traceback
from contextlib import contextmanager
from contextvars import ContextVar

LOGGER = logging.getLogger(__name__)

# See https://pyodide.org/en/stable/usage/faq.html#how-to-detect-that-code-is-run-with-pyodide
IS_WASM = sys.platform == "emscripten"


class WasmUnsupportedError(Exception):
    pass


# Mapping from app ID to the Gradio's FastAPI app instance (`app`).
# To support the SharedWorker mode where multiple apps are running in the same worker,
# we need to keep track of the app instances for each app ID.
app_map = {}


# `with app_id_context(app_id):` is used to set the app ID
# which `register_app()` uses to register the app instance.
# Context variables are natively supported in asyncio and
# can manage data in each task (https://docs.python.org/3/library/contextvars.html#asyncio-support),
# so we can use them for this purpose.
_app_id_context_var: ContextVar[str | None] = ContextVar("app_id", default=None)


@contextmanager
def app_id_context(app_id: str):
    token = _app_id_context_var.set(app_id)
    yield
    _app_id_context_var.reset(token)


# `register_app` and `get_registered_app` are used
# for the Wasm worker to get a reference to
# the Gradio's FastAPI app instance (`app`).
def register_app(_app):
    app_id = _app_id_context_var.get()

    if app_id in app_map:
        app = app_map[app_id]
        app.blocks.close()

    app_map[app_id] = _app


class GradioAppNotFoundError(Exception):
    pass


def get_registered_app(app_id: str):
    try:
        return app_map[app_id]
    except KeyError as e:
        raise GradioAppNotFoundError(
            f"Gradio app not found (ID: {app_id}). Forgot to call demo.launch()?"
        ) from e


error_traceback_callback_map = {}


def register_error_traceback_callback(app_id, callback):
    error_traceback_callback_map[app_id] = callback


def send_error(error: Exception | None):
    # The callback registered by the JS process is called with the error traceback
    # for the WebWorker process to read the traceback.

    if not IS_WASM:
        return
    if error is None:
        return

    app_id = _app_id_context_var.get()
    callback = error_traceback_callback_map.get(app_id)
    if not callback:
        LOGGER.warning(
            f"Error callback not found for the app ID {app_id}. The error will be ignored."
        )
        return

    tb = "".join(traceback.format_exception(type(error), error, error.__traceback__))
    callback(tb)
