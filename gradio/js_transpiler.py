from __future__ import annotations

from collections.abc import Callable
from functools import wraps


def js(fn: Callable) -> Callable:
    """
    A decorator that marks a function to be transpiled to JavaScript and run on the client side.
    For now, this is just a mock implementation that returns a simple JavaScript function.

    Parameters:
        fn: The Python function to be transpiled to JavaScript
    Returns:
        The original function wrapped with JavaScript transpilation metadata
    """
    # For now, we'll just create a mock JavaScript implementation
    mock_js = """
    async function(args) {
        console.log("Running transpiled function:", args);
        // Mock implementation
        return args;
    }
    """

    fn.__js_implementation__ = mock_js

    @wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)

    return wrapper
