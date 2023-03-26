import pytest


def flakyif(condition, reason=None):
    def decorator(func):
        if not condition:
            # Return the function unchanged, not decorated.
            return func
        return pytest.mark.flaky(func, reason=reason)

    return decorator
