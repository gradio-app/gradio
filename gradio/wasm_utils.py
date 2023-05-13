import sys

# See https://pyodide.org/en/stable/usage/faq.html#how-to-detect-that-code-is-run-with-pyodide
is_wasm = sys.platform == "emscripten"
is_pyodide = "pyodide" in sys.modules

app = None

# `register_app` and `get_registered_app` are used
# for the Wasm worker to get a reference to
# the Gradio's FastAPI app instance (`app`).
def register_app(_app):
    global app
    app = _app


def get_registered_app():
    global app
    return app
