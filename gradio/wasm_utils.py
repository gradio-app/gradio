import sys

# See https://pyodide.org/en/stable/usage/faq.html#how-to-detect-that-code-is-run-with-pyodide
IS_WASM = sys.platform == "emscripten"


class WasmUnsupportedError(Exception):
    pass


current_manipulated_app_id = None
app_map = {}


def set_manipulation_target_app_id(app_id: str):
    global current_manipulated_app_id
    current_manipulated_app_id = app_id


# `register_app` and `get_registered_app` are used
# for the Wasm worker to get a reference to
# the Gradio's FastAPI app instance (`app`).
def register_app(_app):
    global app_map

    if current_manipulated_app_id in app_map:
        app = app_map[current_manipulated_app_id]
        app.blocks.close()

    app_map[current_manipulated_app_id] = _app


def get_registered_app(app_id: str):
    global app_map
    return app_map[app_id]
