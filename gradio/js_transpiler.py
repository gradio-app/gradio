from __future__ import annotations

from collections.abc import Callable
from functools import wraps


def js(fn: Callable) -> Callable:
    """
    A decorator that marks a function to be transpiled to JavaScript and run on the client side.

    Parameters:
        fn: The Python function to be transpiled to JavaScript
    Returns:
        The original function wrapped with JavaScript transpilation metadata
    """
    fn.__js_implementation__ = None

    @wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)

    return wrapper

def transpile(fn: Callable) -> str:
    """
    Transpiles a Python function to JavaScript and returns the JavaScript code as a string.
    """

    mock_js_function = "function mock_js_function() { return 'Hello, world!'; }"
    return mock_js_function
