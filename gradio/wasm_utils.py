import sys

# See https://pyodide.org/en/stable/usage/faq.html#how-to-detect-that-code-is-run-with-pyodide
is_wasm = sys.platform == "emscripten"
is_pyodide = "pyodide" in sys.modules
